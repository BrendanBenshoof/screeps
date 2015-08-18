/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('CreepManager'); // -> 'a thing'
 */
 
 var debug =false;
 
 var profiler = require("Profiler");
 
 function pathisBlocked(pos,dir){
     profiler.openProfile("pathBlocked")
     if(dir<1 || dir >8){
         return true;
         console.log("Got an 8",pos.x,pos.y,dir)
     }
     var deltas = [
         [0,0],
        [0,-1],
         [1,-1],
         [1,0],
         [1,1],
         [0,1],
         [-1,1],
         [-1,0],
         [-1,-1],
     ]
     //console.log(dir);
     var x = pos.x+deltas[dir][0];
     var y = pos.y+deltas[dir][1];
     profiler.openProfile("pathBlocked_lookat")
     var creeps = Game.rooms[pos.roomName].lookForAt('creep',x,y);
     var structures =  Game.rooms[pos.roomName].lookForAt('structure',x,y);
     profiler.closeProfile("pathBlocked_lookat")
     if(creeps.length || structures.length){
             profiler.closeProfile("pathBlocked")
             return true;
     }
     
     profiler.closeProfile("pathBlocked")
     return false;
     
 }
 
 
 function sigmoid(t) {
    return 1/(1+Math.pow(Math.E, -t));
}

function max(list,key){
    var bestid = 0;
    var bestval = Number.NEGATIVE_INFINITY;
    for(var i=0;i<list.length;i++){
        var score = key(list[i]);


        if(score >= bestval){

            bestval = score;
            bestid = i;
        }
    }
    return list[bestid];
    
    
}

function min(list,key){
    var bestid = 0;
    var bestval = Number.NEGATIVE_INFINITY;
    for(var i=0;i<list.length;i++){
        var score = key(list[i])*-1;
        if(score >= bestval){

            bestval = score;
            bestid = i;
        }
    }
    return list[bestid];
    
    
}

function sum(list){
    var total = 0
    for(var i in list){
        total+=list[i];
    }
    return total;
}

function map(list,key){
    var output = []
    for(var v in list){
        //console.log(v);
        output.push(key(list[v]))
    }
    return output;
}
 
function routeCreep(creep,dest) {
    profiler.openProfile("routing")
    if(typeof dest == "undefined"){
        return -1;
    }
    
    var locStr = creep.room.name+"."+creep.pos.x+"."+creep.pos.y
    
    var path = false;
    
    if(typeof Memory.routeCache !== "object"){
         Memory.routeCache = {};
    }
    
    if(typeof Memory.routeCache[locStr] === "undefined"){

        Memory.routeCache[locStr] = {'dests':{},'established':Game.time,'usefreq':0.0}
        

    }
    if(typeof Memory.routeCache[locStr]['dests'][''+dest.id] === "undefined"){    
        Memory.routeCache[locStr]['dests'][dest.id] = {1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0};
        profiler.openProfile("routing_building_path")
        path = creep.room.findPath(creep.pos,dest.pos,{maxOps:500,heuristicWeight:2})
        profiler.closeProfile("routing_building_path")
        Memory.routeCache[locStr]['dests'][''+dest.id][path[0].direction]+=1;

        for(var i =0;i<path.length-1;i++){
            var step = path[i];
            var stepStr = creep.room.name+"."+step.x+"."+step.y//creep.room.name+"."+step.x+"."+step.y
            if(typeof Memory.routeCache[stepStr] === "undefined"){
                Memory.routeCache[stepStr] = {'dests':{},'established':Game.time,'usefreq':0.0};
            }
            if(typeof Memory.routeCache[stepStr]['dests'][''+dest.id] === "undefined"){
               Memory.routeCache[stepStr]['dests'][''+dest.id] = {1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0};
            }
            //console.log(path[i+1].direction);
            Memory.routeCache[stepStr]['dests'][''+dest.id][path[i+1].direction]+=1;

        }
    }
    
    profiler.openProfile("routing_building_random_walk")
    var total = 0.0
    for(var d in Memory.routeCache[locStr]['dests'][''+dest.id]){
        total+=Memory.routeCache[locStr]['dests'][''+dest.id][d];
        if(d==0){
            console.log("wierd failure",creep.pos.x,creep.pos.y)
        delete Memory.routeCache[locStr][''+dest.id];
        profiler.closeProfile("routing")
        return -1;
        }
    }
    var total=total*Math.random();
    //console.log(total);
    var dir = 0;
    for(var d in Memory.routeCache[locStr]['dests'][''+dest.id]){
        total-=Memory.routeCache[locStr]['dests'][''+dest.id][d];
        if(total<0){
            dir = d;
            break;
        }
        
    }
    profiler.closeProfile("routing_building_random_walk")

    if(pathisBlocked(creep.pos,dir)){
        dir = Math.floor(Math.random()*8);
    }
    
    
    var error = creep.move(dir);
    
    profiler.closeProfile("routing");
    return error;
    
}


 var LOOK_RANGE = 2
 var Behavoirs = {
     'gather':function(creep){
         ////console.log("GATHERING");
        
            creep.memory.refill_dampener = 1.0
            ////console.log(creep,"looking to carry");

                ////console.log(creep,"walking to source");
                
                var candiates = creep.room.find(FIND_SOURCES_ACTIVE);
                creep.memory.sourceid = creep.memory.sourceid || min(candiates,function(c){return  c.getAssigned()}).id;
                var source = Game.getObjectById(creep.memory.sourceid)
                source.assign();
                
                    routeCreep(creep,source);
                
                
                    creep.harvest(source);
                
                
           
            
        
     },
     'deposit': function(creep){
        if(creep.room.energyAvailable/creep.room.energyCapacityAvailable < .8 ){// structureType: STRUCTURE_EXTENSION },{ structureType: STRUCTURE_SPAWN }]
            profiler.openProfile("deposit_extensions")
            profiler.openProfile("deposit_extensions_find")
            var buildflags = creep.room.find(FIND_FLAGS, { filter: function(n) {return n.color == COLOR_WHITE}});
            var extensions = creep.room.find(FIND_MY_STRUCTURES, { filter: function(n) {return (n.structureType ==STRUCTURE_EXTENSION || n.structureType ==  STRUCTURE_SPAWN) && n.energy/n.energyCapacity < 1.0} } );
           ////console.log(extensions);
           profiler.openProfile("deposit_extensions_find_closest")
           var home = min(extensions,function(e){return (e.pos.x-creep.pos.x)*(e.pos.x-creep.pos.x)+(e.pos.y-creep.pos.y)*(e.pos.y-creep.pos.y)});
           profiler.closeProfile("deposit_extensions_find_closest")
           profiler.closeProfile("deposit_extensions_find")
           if(buildflags.length>0){
               var target = buildflags[0].pos.lookFor('constructionSite')[0];
               routeCreep(creep,target);
               creep.build(target);
               
               
           }
          
           else if(home != null){
           
           //console.log("headed home",home);
           profiler.openProfile("deposit_extensions_home")
                
            
                
               
                var peers = creep.room.find(FIND_MY_CREEPS).filter(function(creep2) { return creep.pos.isNearTo(creep2.pos) && creep2.my })
                var best = min(peers,function(c){return (c.pos.x-home.pos.x)*(c.pos.x-home.pos.x)+(c.pos.y-home.pos.y)*(c.pos.y-home.pos.y);});
                //////console.log(best)
                creep.transferEnergy(best)

                routeCreep(creep,home);
                creep.transferEnergy(home);                
                creep.memory.refill_dampener = 1.0
               
            profiler.closeProfile("deposit_extensions_home")       
           }
           profiler.closeProfile("deposit_extensions")
        }
        else{
            profiler.openProfile("deposit_controller")
            if(creep.room.controller) {
             home = creep.room.controller
             routeCreep(creep,creep.room.controller);
              creep.upgradeController(creep.room.controller);
              creep.memory.refill_dampener = 0.1
                var peers = creep.room.find(FIND_MY_CREEPS).filter(function(creep2) { return creep.pos.isNearTo(creep2.pos) && creep2.my })
                var best = min(peers,function(c){return (c.pos.x-home.pos.x)*(c.pos.x-home.pos.x)+(c.pos.y-home.pos.y)*(c.pos.y-home.pos.y);});
                //////console.log(best)
                creep.transferEnergy(best)
            } 
            profiler.closeProfile("deposit_controller")
        }
        
        

     },
     'build':function(creep){
         var sites = creep.room.find(FIND_CONSTRUCTION_SITES);
         var best = min(sites,function(c){return (c.pos.x-creep.pos.x)*(c.pos.x-creep.pos.x)+(c.pos.y-creep.pos.y)*(c.pos.y-creep.pos.y)})
         routeCreep(creep,best)
        creep.build(best);
        var peers = creep.room.find(FIND_MY_CREEPS).filter(function(creep2) { return creep.pos.isNearTo(creep2.pos) && creep2.my });
        var best = min(peers,function(c){return (c.pos.x-best.pos.x)*(c.pos.x-best.pos.x)+(c.pos.y-best.pos.y)*(c.pos.y-best.pos.y)});
        creep.transferEnergy(best);
         
     },
     'defend':function(creep){
         var target = min( creep.room.find(FIND_HOSTILE_CREEPS),function(c){return (c.pos.x-creep.pos.x)*(c.pos.x-creep.pos.x)+(c.pos.y-creep.pos.y)*(c.pos.y-creep.pos.y);})
         routeCreep(creep,target)
         creep.attack(target);
     },
     'getEnergy':function(creep){
         var target = creep.room.find(FIND_DROPPED_ENERGY).filter(function(buildsite) { return creep.pos.isNearTo(buildsite.pos) })[0];
         routeCreep(creep,target)
         creep.pickup(target);
     }
     
 }
 
 
 
 var Fitnesses = {
     'gather': function(creep){
         
         var tmp =( 0.95+0.1*Math.random())*(1.0 - creep.carry.energy/ creep.carryCapacity);
         //console.log("gather",tmp);
         return tmp;////min(candiates,function(c){return  creep.room.findPath(creep.pos,c.pos).length;}).length;
     },
     'deposit': function(creep){
         
         var tmp =   (creep.carry.energy/ creep.carryCapacity) ;
         if(tmp>0.9){
             return 10.0
         }
         else{
             return -1
         }
         //console.log("gather",tmp);
         return tmp;////min(candiates,function(c){return  creep.room.findPath(creep.pos,c.pos).length;}).length;
     },
     'build': function(creep){
         var escore = creep.carry.energy/creep.carryCapacity;
         ////console.log(escore*bscore);
         if(escore > 0.8 && Math.random()<0.1 && creep.room.find(FIND_CONSTRUCTION_SITES).length > 0){
             return 100.0;
         }
         else{
             return -10.0;
         }
     },
     'getEnergy': function(creep){
         var escore = 0.0;
         if(creep.carry.energy < creep.carryCapacity){
             escore=1.0;
         }
         var bscore = creep.room.find(FIND_DROPPED_ENERGY).filter(function(energy) { return creep.pos.isNearTo(energy.pos) }).length;
         ////console.log(escore*bscore);
         //console.log("energy",escore,bscore,escore*bscore);
         return escore*bscore*10;
     },
     'defend': function(creep){
         var bogies = creep.room.find(FIND_HOSTILE_CREEPS)
         //var dists = map(bogies,function(b){return 1.0/creep.pos.getRangeTo(b)} )
         
         //var val =  sum( dists )
         
         return -10//(bogies.length )*10;
     }
 }
 
 
 
 
 
 module.exports.tick = function(creepID){
  var thisCreep = Game.creeps[creepID];
  
  
  
  if (typeof thisCreep.memory.home == "undefined") {
      thisCreep.memory.home = min(thisCreep.room.find(FIND_MY_SPAWNS),function(c){return (thisCreep.pos.x-c.pos.x)*(thisCreep.pos.x-c.pos.x)+(thisCreep.pos.y-c.pos.y)*(thisCreep.pos.y-c.pos.y);}).id;
  }
  
  if (typeof thisCreep.memory.refill_dampener == "undefined") {
      thisCreep.memory.refill_dampener = 0.9;
  }
  
  
  profiler.openProfile("fitness")
  var newfitnesses = {}
  map(Object.keys(Fitnesses),function(f){
      newfitnesses[f] = Fitnesses[f](thisCreep);
  });
  
  
  thisCreep.memory.fitnesses = thisCreep.memory.fitnesses || {};
  var peers =  thisCreep.room.find(FIND_MY_CREEPS).filter(function(p) { return thisCreep.pos.isNearTo(p.pos) });
  map(Object.keys(Fitnesses),function(f){
      
      var peersum = 0;
      for(var i in peers){
          var p = peers[i];
          peersum= peersum + p.memory.fitnesses[f] || peersum
      }
      thisCreep.memory.fitnesses[f] = 0.0*peersum/peers.length + newfitnesses[f]*0.3 + thisCreep.memory.fitnesses[f]*0.7 || newfitnesses[f];
      
  })
  
    var action = max(Object.keys(Fitnesses),function(f){
      return thisCreep.memory.fitnesses[f];
  });
  if(debug){
        thisCreep.say(action);
  }
  
  profiler.closeProfile("fitness")
  profiler.openProfile("action")
  //console.log(thisCreep.name,action);
  profiler.openProfile(action)
  Behavoirs[action](thisCreep);
  profiler.closeProfile(action)
  profiler.closeProfile("action")
  
     
 }
 
 
 
 
