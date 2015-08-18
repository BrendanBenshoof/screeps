Game.cpuLimit = 25

var profiler = require("Profiler");


profiler.openProfile("PreImport")
//Memory.spawnmanager = require('SpawnManager');

Source.prototype.getAssigned = function() {
    if (typeof this.assigned == 'undefined') {
    this.assigned = 0
}
    return this.assigned;
};


Source.prototype.assign = function() {
    this.assigned+=1;
};


for(var c in Memory.creeps){
    if(!Game.creeps[c]){
        delete Memory.creeps[c];
    }
}

profiler.closeProfile("PreImport")


profiler.openProfile("main_requires")
var spawnmanager = require('SpawnManager');
var creepmanager = require('CreepManager');
profiler.closeProfile("main_requires")

profiler.openProfile("ALL_CREEPS")

for( var c in Game.creeps){
    creepmanager.tick(c);   
}


profiler.closeProfile("ALL_CREEPS")
profiler.openProfile("ALL_SPAWNS")
for( var s in Game.spawns){
    //console.log(s)
    spawnmanager.tick(s);   
}
profiler.closeProfile("ALL_SPAWNS")
//console.log("-------------------------")
//profiler.showProfiles()
Memory.average_cpu = Memory.average_cpu*0.8+0.2*Game.getUsedCpu()


