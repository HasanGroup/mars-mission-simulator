// A compressed arcade route through real research milestones, not a geographic map.
const ROVER_COURSE={seconds:180,stations:[[18,-20],[-20,-50],[12,-80]],
 path:[[0,0],[0,-15],[18,-20],[18,-38],[-20,-50],[-20,-67],[12,-80]],
 hazards:[{x:8,z:-10,r:3,type:'rock'},{x:0,z:-36,r:4,type:'crater'},{x:-4,z:-65,r:3.5,type:'rock'},
 {x:22,z:-30,r:5,type:'dune'},{x:-24,z:-59,r:5,type:'dune'},{x:8,z:-48,r:2,type:'rock'}]};
if(typeof module!=='undefined')module.exports={ROVER_COURSE};
