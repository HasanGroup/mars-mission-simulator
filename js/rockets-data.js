const HISTORICAL_ROCKETS=[];
const STAGING_PARTS={booster:{w:10,h:55,color:'#e0e5e8'},core:{w:24,h:52,color:'#d5dee7'},upper:{w:17,h:33,color:'#adb9c7'},fairing:{w:8,h:30,color:'#edf2f5'}};
const STAGING_PROFILES={'06-atlas.svg':[
 {stageIndex:1,triggerHeight:.18,label:'Ускорители',massLoss:.18,debris:[-1,1].map(side=>({kind:'booster',dx:side*16,dy:13,kick:side*55}))},
 {stageIndex:2,triggerHeight:.34,label:'Обтекатель',massLoss:.035,debris:[-1,1].map(side=>({kind:'fairing',dx:side*12,dy:-16,kick:side*45}))},
 {stageIndex:3,triggerHeight:.46,label:'Первая ступень',massLoss:.19,debris:[{kind:'core',dx:0,dy:30,kick:-26}]},
 {stageIndex:4,triggerHeight:.73,label:'Аппарат MSL',massLoss:.12,debris:[{kind:'upper',dx:0,dy:23,kick:28}]}
]};
// Requested gameplay sequence; deliberately not the historical MSL staging order.
const FLIGHT_STAGES=[{name:'1-я ступень + ускорители',min:40,max:55,phase:'ascent',parts:['1st_stage']},{name:'2-я ступень Centaur',min:110,max:130,phase:'ascent',parts:['2nd_stage_centaur']},{name:'Головной обтекатель',min:160,max:180,phase:'ascent',parts:['fairing_left','fairing_right','forward_load_reactor_L','forward_load_reactor_R']}];
if(typeof module!=='undefined')module.exports={FLIGHT_STAGES};
