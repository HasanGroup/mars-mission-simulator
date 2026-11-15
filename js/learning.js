// Historical events; gameplay controls and time remain explicitly schematic.
let briefing=false,launchFuel=1,launchAuthorized=false;
const phaseNames={IDLE:'Curiosity · 2011–2013',COUNTDOWN:'Обратный отсчёт',IGNITION:'Зажигание',ASCENT:'Запуск',CRUISE:'Перелёт к Марсу',REENTRY:'Вход · спуск · посадка',MANUAL_CONTROL:'Sky Crane',SUCCESS:'Марсоход на поверхности',FAILED:'Повтор упражнения'};
function brief(title,text,continueAction){
 briefing=true;keys={};actionHeld=actionPress=false;pointer=null;stick.reset();
 showOverlay(title,text,[['Продолжить',()=>{briefing=false;overlay.classList.remove('show');keys={};actionHeld=actionPress=false;if(continueAction)continueAction();},true]]);
}
const originalUpdate=update;
update=function(dt){if(!briefing)originalUpdate(dt)};
const originalStart=start;
function beginCountdown(){
 launchAuthorized=true;briefing=false;launchFuel=1;keys={};actionHeld=actionPress=false;stick.reset();burn=1;touchdown=0;
 originalStart();
}
start=function(){
 if(!selecting())return;
 launchAuthorized=false;
 brief('Разрешение на запуск · 26 ноября 2011', 'Омар Баэз — руководитель запуска NASA Launch Services Program. По сообщению NASA, в этот день он дал своё «go» для начала миссии. Ниже показан смысл решения, а не придуманная стенограмма: ЗАПУСК РАЗРЕШЁН. Далее — отсчёт и старт Atlas V 541 с площадки SLC-41. В упражнении: Пробел / ТЯГА, Q / E или ↶ ↷ — наклон; цель 100% шкалы, наклон <35°. Реальная ракета летела автоматически; шкала не заменяет расчёт орбиты.',beginCountdown);
 resultBtns.children[0].textContent='Сигнал принят · начать отсчёт';
 appendSource('NASA: решение Омара Баэза','https://www3.nasa.gov/centers/kennedy/pdf/676259main_aug10-2012.pdf');
 appendSource('Архивный запуск NASA','https://science.nasa.gov/resource/curiositys-launch/');
};
document.getElementById('startBtn').onclick=start;
const originalEnter=enter;
enter=function(next){originalEnter(next);statusEl.textContent=phaseNames[next]||next;historyToggle.disabled=true;document.getElementById('turnControls').hidden=next!=='ASCENT';};
function startCruise(){
 enter('CRUISE');rocketX=worldW*.4;rocketY=worldH*.5;vx=vy=0;
 brief('2 · От Земли к Марсу','После работы Atlas V и верхней ступени Centaur аппарат MSL отправился к Марсу. Старт — 26 ноября 2011 года; посадка — 6 августа 2012 года по UTC. Межпланетный полёт здесь сжат до нескольких секунд. Стыковки не было. Впереди — автоматические вход в атмосферу, парашют, ракетный спуск и Sky Crane.');
}
const originalLanding=startLanding;
startLanding=function(){
 keys={};actionHeld=actionPress=false;dynamics.reset();touchdown=0;originalLanding();
 brief('3 · Sky Crane · 6 августа 2012','После атмосферного торможения и парашюта посадочная ступень опустила Curiosity на тросах в кратере Гейл. После касания тросы отсоединились, ступень улетела в сторону. Посадка выполнялась автономно. Здесь вы изучаете задачу мягкого касания: ← → / края экрана, Пробел / ТЯГА; снижение ≤12, боковая скорость <35, наклон <13°. Это игровые пороги, не реальные параметры MSL.');
};
for(const [id,key] of [['turnLeft','KeyQ'],['turnRight','KeyE']]){
 const button=document.getElementById(id);button.addEventListener('pointerdown',e=>{button.setPointerCapture(e.pointerId);keys[key]=true});
 for(const event of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(event,()=>{delete keys[key]});
}
function appendSource(label,url){const a=document.createElement('a');a.textContent=label;a.href=url;a.target='_blank';a.rel='noopener noreferrer';resultBtns.appendChild(a)}
function campaignStory(){
 brief('Curiosity · путь к открытиям','2011 год. NASA отправляет мобильную лабораторию Curiosity выяснять, был ли древний Марс пригоден для микробной жизни. Atlas V 541 компании ULA доставляет аппарат на межпланетную траекторию. Путь: разрешение руководителя запуска → старт → перелёт → автоматическая посадка → исследования 2012–2013 годов → передача результатов на Землю. События и научные выводы подтверждены источниками NASA. Графика, управление и длительность эпизодов схематические; они не являются архивной записью.',start);
 resultBtns.children[0].textContent='В центр управления запуском';
 appendSource('NASA/JPL: миссия Curiosity','https://www.jpl.nasa.gov/missions/mars-science-laboratory-curiosity-rover-msl/');
}
document.getElementById('learn').onclick=()=>brief('О реконструкции','В сюжете используются реальные события Curiosity. Управление ракетой и посадкой — учебные упражнения, а не действия пилота: миссия была беспилотной. Поверхность — схема для изучения архивных результатов, не точная карта. Радиоканалы реальны, но время и размеры пакетов упрощены. Источники доступны в каждом разделе.');
updateMeta();enter('IDLE');campaignStory();
