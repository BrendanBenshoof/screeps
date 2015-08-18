/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('SpawnManager'); // -> 'a thing'
 */
 
 var IDEAL_POP = 100;
 var IDEAL_WORK = 100;
 var IDEAL_CARRY = 100;
 var IDEAL_MOVE = 50;
 
 
 
 
 
 module.exports.tick = function(spawn){

 
    
 
 
     if(!Game.spawns[spawn].spawning && Object.keys(Game.creeps).length <50){
     var thisroom = spawn.room;
     //Evaluate Needs
     
        var id =Object.keys(Game.creeps).length;

     //Design a Creep
     
       var newCreep = [WORK,WORK,MOVE,MOVE,CARRY,CARRY];
    
     
     //Create The Creep
     if( Game.spawns[spawn].canCreateCreep(newCreep)==OK){
            var child = Game.spawns[spawn].createCreep(newCreep);


        
        }
    else{
        //console.log("spawn failed",Game.spawns[spawn].canCreateCreep(newCreep));
    }

     }
 }
     
 
