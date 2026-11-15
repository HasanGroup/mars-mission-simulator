function createRelaySession(){
 const data={stage:'band',sent:0,time:0,flight:0,paused:false,complete:false,aim:.5,decoded:0};
 const position=()=>.5+.45*Math.sin(data.time*.9);
 function reset(){Object.assign(data,{stage:'band',sent:0,time:0,flight:0,paused:false,complete:false,aim:.5,decoded:0});}
 function choose(value){
  if(data.stage==='band'&&value==='UHF'){data.stage='uplink';return true;}
  if(data.stage==='downlink'&&value==='X-band · DSN'){data.stage='travel';data.flight=3;return true;}
  if(data.stage==='benefits'&&value==='habitable'&&data.decoded===7){data.complete=true;return true;}
  return false;
 }
 function send(){
  if(data.stage!=='uplink'||data.flight>0||data.paused)return 'busy';
  if(position()<.35||position()>.65)return 'window';
  if(Math.abs(data.aim-position())>.1)return 'aim';
  data.flight=1;return 'sent';
 }
 function tick(dt){
  if(data.paused)return;
  dt=Math.min(.05,Math.max(0,dt));data.time+=dt;
  if(data.flight>0){data.flight=Math.max(0,data.flight-dt);
   if(data.flight===0){if(data.stage==='uplink'){data.sent++;if(data.sent===3)data.stage='downlink';}else if(data.stage==='travel')data.stage='benefits';}
  }
 }
 function aim(value){if(!data.paused&&Number.isFinite(value))data.aim=Math.max(0,Math.min(1,value))}
 function decode(index){if(data.stage==='benefits'&&Number.isInteger(index)&&index>=0&&index<3){data.decoded|=1<<index;return true}return false}
 return {data,position,reset,choose,send,tick,aim,decode};
}
if(typeof module!=='undefined')module.exports={createRelaySession};
if(typeof document!=='undefined'){
 const relay=createRelaySession(),el=id=>document.getElementById(id);let last,shown='';
 function choices(values){el('choices').replaceChildren();for(const value of values){const b=document.createElement('button');b.textContent=value;b.onclick=()=>{
   if(relay.choose(value)){el('feedback').textContent='Верно. Продолжаем путь данных.';paint();}
   else el('feedback').textContent=relay.data.stage==='band'?'Для выбранного пути к орбитальному ретранслятору используется UHF. Это радио, без стыковки и перевозки образцов.':'Орбитальный аппарат передаёт информацию по X-band на наземную сеть DSN. Попробуйте ещё раз.';
 };el('choices').appendChild(b);}}
 function paint(){
  const d=relay.data;
  if(shown!==d.stage){shown=d.stage;
   const labels={band:['1 · Канал с поверхности','Выберите канал Curiosity → орбитальный ретранслятор.'],uplink:['2 · Окно пролёта','Когда индикатор в зелёной области, отправьте запись. Вне окна передача не начнётся; архив сохранится.'],downlink:['3 · От орбитера к Земле','Три записи на борту ретранслятора. Выберите следующий участок пути.'],travel:['Сигнал идёт к Земле','Время прохождения сжато. Это радиосигнал, а не мгновенная доставка.'],benefits:['DSN приняла данные','Три записи доставлены. Изучите научные результаты ниже.']};
   el('step-title').textContent=labels[d.stage][0];el('instruction').textContent=labels[d.stage][1];
   choices(d.stage==='band'?['UHF','Доставить образцы на спутник','Оптический кабель']:d.stage==='downlink'?['X-band · DSN','UHF · домашний Wi-Fi','Мгновенная передача']:[]);
   el('uplink').hidden=d.stage!=='uplink';el('benefits').hidden=d.stage!=='benefits';
  }
  el('orbiter-dot').style.left=relay.position()*100+'%';el('antenna-marker').style.left=d.aim*100+'%';
  el('aim-quality').textContent='Совпадение антенны: '+Math.max(0,Math.round((1-Math.abs(d.aim-relay.position())/.3)*100))+'%';
  const open=relay.position()>=.35&&relay.position()<=.65;
  el('link-state').textContent=d.paused?'Сеанс приостановлен':open?'Окно связи открыто':'Ожидаем пролёта орбитера';
  el('send').disabled=d.flight>0||d.paused;el('progress').value=d.sent;
  el('packet-count').textContent='Записей на ретрансляторе: '+d.sent+'/3'+(d.sent<3?' · '+SCIENCE_ARCHIVE[d.sent].instrument:'');
  const dot=el('packet-dot');dot.setAttribute('visibility',d.flight>0?'visible':'hidden');
  dot.setAttribute('cx',String(d.stage==='travel'?420+(1-d.flight/3)*280:100+(1-d.flight)*300));
 }
 for(const item of SCIENCE_ARCHIVE){const article=document.createElement('article');const title=document.createElement('h3');title.textContent=item.name;const p=document.createElement('p');p.textContent=item.finding+' '+item.benefit;const a=document.createElement('a');a.textContent=item.date+' · источник NASA';a.href=item.source;a.target='_blank';a.rel='noopener';article.append(title,p,a);el('science-results').appendChild(article);}
 el('send').onclick=()=>{const result=relay.send();el('feedback').textContent=result==='aim'?'Антенна не наведена. Совместите голубую рамку с золотым маркером ползунком или кнопками ← →.':result==='window'?'Аппарат вне окна видимости. Дождитесь зелёной области и повторите — данные не потеряны.':result==='sent'?'Передача по UHF…':'Дождитесь окончания текущей передачи.';paint();};
 el('antenna').oninput=()=>relay.aim(Number(el('antenna').value)/100);
 for(const [id,delta] of [['aim-left',-.04],['aim-right',.04]])el(id).onclick=()=>{relay.aim(relay.data.aim+delta);el('antenna').value=relay.data.aim*100;paint()};
 el('pause').onclick=()=>{relay.data.paused=!relay.data.paused;el('pause').textContent=relay.data.paused?'Продолжить':'Пауза';paint();};
 el('orbiter').onchange=()=>{el('orbiter-name').textContent=el('orbiter').value==='Mars Odyssey'?'Mars Odyssey':'MRO';};
 el('retry').onclick=()=>{relay.reset();shown='';el('antenna').value=50;document.querySelectorAll('.discovery').forEach(n=>n.hidden=true);el('decode-count').textContent='Расшифровано 0 / 3';el('feedback').textContent='';el('final-feedback').textContent='';el('finish').hidden=true;el('pause').textContent='Пауза';el('orbiter').value='Mars Odyssey';el('orbiter-name').textContent='Mars Odyssey';paint();};
 for(const button of document.querySelectorAll('[data-answer]'))button.onclick=()=>{const ok=relay.choose(button.dataset.answer);el('final-feedback').textContent=relay.data.decoded!==7?'Сначала расшифруйте все три записи и посмотрите, как измерения помогают учёным.':ok?'Верно. Данные показали древнюю пригодную среду, но не доказали существование жизни.':'Пригодная среда — не доказательство наличия организмов. Сравните вывод с результатами CheMin и SAM.';el('finish').hidden=!ok;};
 for(const button of document.querySelectorAll('[data-decode]'))button.onclick=()=>{const index=Number(button.dataset.decode);if(relay.decode(index)){el('discovery-'+index).hidden=false;el('decode-count').textContent='Расшифровано '+[0,1,2].filter(i=>relay.data.decoded&(1<<i)).length+' / 3'}};
 function frame(now){if(last!==undefined&&!document.hidden){relay.tick((now-last)/1000);paint();}last=now;requestAnimationFrame(frame);}
 document.addEventListener('visibilitychange',()=>{last=undefined});paint();requestAnimationFrame(frame);
}
