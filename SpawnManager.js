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
 
 var weights = {
     harvester:0.3,
     collector:0.2,
     builder:0.3,
     guard:0.2
 }
 
 var types = {
    harvester: function(energy) {
        energy -= 50;
        var a = 0;
        var b = 1;
        var arrA = [];
        if(energy > 100){
            for(var i = energy; i>0;){
                if(i >= BODYPART_COST.work && a < 4){
                    a += 1;
                    i -= BODYPART_COST.work;
                }
                else break;
            }
            for(var x = 0; x < a ; x++){
                arrA.push(WORK);
            }
            for(var x = 0; x < b ; x++){
                arrA.push(MOVE);
            }
            console.log('creator: point1 = '+arrA)
            return arrA;
        }
        else return false;
    },
    collector: function(energy) {
        var a = 0;
        var b = 0;
        var c = 0;
        var arrA = [];
        for(var i = energy; i > 0;){
            console.log(i);
            if(i > (BODYPART_COST.carry+BODYPART_COST.move) && a < 3){
                a++;
                i -= (BODYPART_COST.carry+BODYPART_COST.move);
            }
            else break;
        }
        for(var x = 0 ; x < a ; x++){
            arrA.push(CARRY);
            arrA.push(MOVE);
        }
        console.log('creator: point 2 '+arrA)
        return arrA;
    },
    builder: function(energy) {
       return [WORK,WORK,WORK,WORK,CARRY,CARRY,MOVE,MOVE]
    },
    charger: function(energy) {
        var a = 0;
        var b = 0;
        var c = 0;
        var arrA = [];
        for(var i = energy; i>0;){
            if(i >= BODYPART_COST.work){
                a += 1;
                i -= BODYPART_COST.work;
            }
            else if(b < a/2){
                b += 1;
                i -= BODYPART_COST.carry
            }
            else if(c < a){
                if(i >= BODYPART_COST.move){
                    c += 1;
                    i -= BODYPART_COST.move;
                }
            }
            else break;
        }
        for(var x = 0; x < a ; x++){
            arrA.push('WORK');
        }
        for(var x = 0; x < b ; x++){
            arrA.push('CARRY');
        }
        for(var x = 0; x < c ; x++){
            arrA.push('MOVE');
        }
        return arrA;
    },
    healer: function(energy) {
        var a = 0;
        var b = 0;
        var c = 0;
        var arrA = [];
        for(var i = energy; i>0;){
            if(i >= BODYPART_COST.heal){
                a += 1;
                i -= BODYPART_COST.heal;
            }
            else if(b < a){
                if(i >= BODYPART_COST.move){
                    b += 1;
                    i -= BODYPART_COST.move;
                }
            }
            else break;
        }
        for(var x = 0 ; x < a ; x++){
            arrA.push('HEAL');
        }
        for(var x = 0 ; x < b ; x++){
            arrA.push('MOVE');
        }
        return arrA;
    },
    guard: function(energy) {
        var a = 0;
        var b = 0;
        var c = 0;
        var arrA = [];
        for(var i = energy; i>0;){
            if(i >= BODYPART_COST.ranged_attack+BODYPART_COST.move){
                a += 1
                b += 1;
                i -= BODYPART_COST.ranged_attack+BODYPART_COST.move
            }
            else if(i >= BODYPART_COST.attack+BODYPART_COST.move){
                if(i >= BODYPART_COST.attack){
                    a += 1;
                    c += 1;
                    i -= BODYPART_COST.attack+BODYPART_COST.move;
                }
            }
            else break;
        }
        for(var x = 0; x < b ; x++){
            arrA.push('RANGED_ATTACK');
        }
        for(var x = 0; x < c ; x++){
            arrA.push('ATTACK');
        }
        for(var x = 0; x < a ; x++){
            arrA.push('MOVE');
        }
        return arrA;
    }
}


 
 
 
 
 module.exports.tick = function(spawn){

    spawn = Game.spawns[spawn];
    
 
 
     if(spawn.room.energyAvailable == spawn.room.energyCapacityAvailable  && Object.keys(Game.creeps).length <50){
     
     //Evaluate Needs
     
        var creeptype = "harvester";
        var roll = Math.random()
        for(var i in weights){
            roll-=weights[i];
            if(roll<0){
                creeptype = i;
                break;
            }
            
        }
     
     //Design a Creep
     
       var newCreep = types[creeptype](spawn.room.energyAvailable);
       console.log(newCreep)
    
     
     //Create The Creep
     if( spawn.canCreateCreep(newCreep)==OK){
            var child = spawn.createCreep(newCreep);


        
        }
    else{
        console.log("spawn failed",spawn.canCreateCreep(newCreep));
    }

     }
 }
     
 
