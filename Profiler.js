/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('Profiler'); // -> 'a thing'
 */
 
 var Profiles_open = {}
 var Profiles_start = {}
 var Profiles_total = {}
 
 function openProfile(profileID){
     if(typeof Profiles_open[profileID] === "undefined" ){
         Profiles_open[profileID] = 0;
     }
     if(Profiles_open[profileID] == 0){
         Profiles_start[profileID] = Game.getUsedCpu();
     }
     
     Profiles_open[profileID] += 1;
 }
 
 function closeProfile(profileID){
     
     Profiles_open[profileID]-=1;
     if(typeof Profiles_total[profileID] == "undefined"){
         Profiles_total[profileID] = 0.0;
     }
      if(Profiles_open[profileID] == 0){
         Profiles_total[profileID] += Game.getUsedCpu()-Profiles_start[profileID];
     }
 }
 
 function showProfiles(){
     for(var k in Profiles_total){
         console.log(k,Profiles_total[k]);
     }
 }
 
 module.exports.openProfile = openProfile;
 module.exports.closeProfile = closeProfile;
 module.exports.showProfiles = showProfiles;
