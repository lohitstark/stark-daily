const $ = (id) => document.getElementById(id);
const STORAGE_KEY = "stark-daily-v1";
const todayKey = () => { const d = new Date(); return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-"); };
const defaults = { goal:2500, glass:250, interval:60, start:"06:00", end:"21:00", reminders:false, day:todayKey(), entries:[] };
let state;
let reminderTimer = null;

function loadState(){
  try { state = {...defaults,...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}")}; } catch { state = {...defaults}; }
  if(state.day !== todayKey()){ state.day=todayKey(); state.entries=[]; }
  state.entries = Array.isArray(state.entries) ? state.entries : [];
}
function saveState(){ localStorage.setItem(STORAGE_KEY,JSON.stringify(state)); }
function total(){ return state.entries.reduce((sum,e)=>sum+e.amount,0); }
function render(){
  const amount=total(), pct=Math.min(100,Math.round(amount/state.goal*100)), left=Math.max(0,state.goal-amount);
  $("today-label").textContent=new Intl.DateTimeFormat(undefined,{weekday:"short",day:"numeric",month:"short",year:"numeric"}).format(new Date());
  $("consumed").textContent=amount.toLocaleString();
  $("goal-label").textContent=state.goal.toLocaleString()+" ml";
  $("progress-fill").style.width=pct+"%";
  $("progress-track").setAttribute("aria-valuenow",String(pct));
  $("progress-percent").textContent=pct+"% complete";
  $("remaining").textContent=left.toLocaleString()+" ml to go";
  $("water-status").textContent=amount>=state.goal?"Daily target reached":"In progress";
  $("entry-count").textContent=state.entries.length+" entr"+(state.entries.length===1?"y":"ies");
  $("interval").value=String(state.interval);
  $("start-time").value=state.start;
  $("end-time").value=state.end;
  $("daily-goal").value=state.goal;
  $("glass-size").value=state.glass;
  $("reminder-state").textContent=state.reminders?"On":"Off";
  $("water-log").innerHTML="";
  if(!state.entries.length){const li=document.createElement("li");li.className="empty-log";li.textContent="No water logged yet."; $("water-log").append(li);}
  [...state.entries].reverse().forEach(e=>{const li=document.createElement("li");const t=document.createElement("span");const a=document.createElement("strong");t.textContent=e.time;a.textContent="+"+e.amount+" ml";li.append(t,a);$("water-log").append(li);});
  $("add-water").textContent="＋ Add "+state.glass+" ml";
}
function addWater(amount){
  if(!Number.isFinite(amount)||amount<1||amount>5000){$("water-feedback").textContent="Enter an amount between 1 and 5000 ml.";return;}
  state.entries.push({amount,time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})});
  saveState();render();$("water-feedback").textContent=amount+" ml added to today's total.";
}
function inReminderWindow(){
  const now=new Date(), mins=now.getHours()*60+now.getMinutes();
  const [sh,sm]=state.start.split(":").map(Number),[eh,em]=state.end.split(":").map(Number);
  return mins>=sh*60+sm && mins<=eh*60+em;
}
async function enableReminders(){
  if(!("Notification" in window)){ $("reminder-feedback").textContent="This browser does not support notifications.";return; }
  if(!("serviceWorker" in navigator)){ $("reminder-feedback").textContent="Service workers are not supported in this browser.";return; }
  try{
    const permission=await Notification.requestPermission();
    if(permission!=="granted"){ $("reminder-feedback").textContent="Notification permission was not granted. Check browser site settings.";return; }
    state.interval=Number($("interval").value);state.start=$("start-time").value;state.end=$("end-time").value;state.reminders=true;saveState();startReminderLoop();render();
    $("reminder-feedback").textContent="Reminders enabled for this session. Keep the app open.";
  }catch(e){$("reminder-feedback").textContent="Could not enable notifications in this browser.";}
}
function startReminderLoop(){
  if(reminderTimer)clearInterval(reminderTimer);
  let lastNotice=0;
  reminderTimer=setInterval(async()=>{
    if(!state.reminders||!inReminderWindow())return;
    const now=Date.now(), interval=state.interval*60000;
    if(!lastNotice)lastNotice=now;
    if(now-lastNotice>=interval){
      lastNotice=now;
      try{
        const reg=await navigator.serviceWorker.getRegistration();
        if(reg) await reg.showNotification("STARK DAILY – Water break",{body:"Take a short break and have some water. Log it when you're done.",icon:"./icon.svg",badge:"./icon.svg",tag:"stark-water-reminder"});
        else new Notification("STARK DAILY – Water break",{body:"Take a short break and have some water."});
      }catch(e){ /* Notification delivery may be blocked by browser settings. */ }
    }
  },15000);
}
function pauseReminders(){state.reminders=false;saveState();if(reminderTimer)clearInterval(reminderTimer);reminderTimer=null;render();$("reminder-feedback").textContent="Reminders paused.";}
$("add-water").addEventListener("click",()=>addWater(state.glass));
$("custom-water").addEventListener("click",()=>{const raw=prompt("How much water did you drink? (ml)","300");if(raw!==null)addWater(Number(raw));});
$("save-settings").addEventListener("click",()=>{
  const goal=Number($("daily-goal").value),glass=Number($("glass-size").value);
  if(!Number.isInteger(goal)||goal<250||goal>10000||!Number.isInteger(glass)||glass<50||glass>2000){$("water-feedback").textContent="Check your target (250–10000 ml) and quick-add amount (50–2000 ml).";return;}
  state.goal=goal;state.glass=glass;saveState();render();$("water-feedback").textContent="Settings saved on this device.";
});
$("enable-reminders").addEventListener("click",enableReminders);
$("disable-reminders").addEventListener("click",pauseReminders);
$("interval").addEventListener("change",()=>{state.interval=Number($("interval").value);saveState();if(state.reminders)startReminderLoop();});
$("start-time").addEventListener("change",()=>{state.start=$("start-time").value;saveState();});
$("end-time").addEventListener("change",()=>{state.end=$("end-time").value;saveState();});
loadState();render();
if("serviceWorker" in navigator){window.addEventListener("load",()=>navigator.serviceWorker.register("./service-worker.js").catch(()=>{}));}
if(state.reminders){state.reminders=false;saveState();render();}
