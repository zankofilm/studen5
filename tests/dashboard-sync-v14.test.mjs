import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const root=new URL('../',import.meta.url);
const code=readFileSync(new URL('app/src/main/assets/girl-dashboard.js',root),'utf8');
const java=readFileSync(new URL('app/src/main/java/ir/madreseyar/student/MainActivity.java',root),'utf8');
const css=readFileSync(new URL('app/src/main/assets/girl-dashboard.css',root),'utf8');
function setup({online=true,direct=true,complete=true}={}){
  let ready=false,current='home',moreCount=0,homeCount=0,syncCount=0,backCount=0,scrollPos=-1,shieldCount=0;
  const history={state:{msyStudentPage:'home'},back(){backCount++;current='home';this.state={msyStudentPage:'home'};}};
  const syncLabel={textContent:'حالت محلی'};
  const status={textContent:'حالت محلی'};
  const lastSync={textContent:'هنوز همگام‌سازی کامل انجام نشده'};
  const hostedDate={textContent:'۸ آبان ۱۴۰۵، ۲۲:۴۵'};
  const page={querySelector(sel){return sel==='.v115-hero'&&current==='home'?{}:null}};
  const home={classList:{contains(c){return c==='active'&&current==='home'}},click(){homeCount++;current='home';history.state={msyStudentPage:'home'};}};
  const more={click(){moreCount++;current='more';history.state={msyStudentPage:'more'};}};
  const manual={onclick:async()=>{syncCount++;syncLabel.textContent='به‌روز شد';}};
  const elements=[];
  const body={classList:{toggle(){}},addEventListener(){},appendChild(node){elements.push(node);node.remove=()=>{node.removed=true;};if(node.id==='msySyncShieldV14')shieldCount++;}};
  const document={body,querySelector(sel){
    if(sel==='#appView')return ready?{classList:{contains(){return false}}}:null;
    if(sel==='#page')return page;
    if(sel==='#msyGirlHome')return current==='home'?{}:null;
    if(sel==='#bottomNav [data-page="home"]')return home;
    if(sel==='#bottomNav [data-page="more"]')return more;
    if(sel==='#manualSyncBtn')return current==='more'?manual:null;
    if(sel==='#syncLabel')return syncLabel;
    if(sel==='#studentLastSyncAtV136')return hostedDate;
    if(sel==='#msyGirlHome .msy-sync-status span')return status;
    if(sel==='[data-msy-last-sync]')return lastSync;
    return null;
  },addEventListener(){},createElement(){return {innerHTML:'',id:'',className:'',textContent:'',setAttribute(){},remove(){this.removed=true;}}}};
  const win={history,scrollY:282,scrollTo(x,y){scrollPos=y;},addEventListener(){}};
  if(direct){
    win.MadreseyarStudentSync={version:'72.89.15',ready:true,
      syncNow:async()=>{syncCount++;syncLabel.textContent=complete?'به‌روز شد':'همگام‌سازی ناقص';return {ok:true,complete,syncedAt:complete?Date.now():0};},
      getStatus:async()=>({lastSuccessAt:complete?Date.now():123,label:'۸ آبان ۱۴۰۵، ۲۲:۴۵'})};
  }
  vm.runInNewContext(code,{window:win,document,navigator:{onLine:online},MutationObserver:class{observe(){}},setTimeout(fn){fn();},alert(){},Intl,Date,requestAnimationFrame(fn){fn();}});
  ready=true;
  return {win,get current(){return current},get moreCount(){return moreCount},get homeCount(){return homeCount},get syncCount(){return syncCount},get backCount(){return backCount},get scrollPos(){return scrollPos},get displayText(){return status.textContent},get lastSyncText(){return lastSync.textContent},get shieldCount(){return shieldCount},elements};
}
test('Home update uses the stable hosted sync bridge and never navigates to More',async()=>{
  const s=setup();await s.win.__msyGirlRefresh();
  assert.equal(s.current,'home');assert.equal(s.moreCount,0);assert.equal(s.syncCount,1);assert.equal(s.backCount,0);
  assert.equal(s.scrollPos,282);assert.match(s.displayText,/آخرین به‌روزرسانی/);assert.match(s.lastSyncText,/۱۴۰۵/);assert.equal(s.shieldCount,1);
});
test('manual update attempts the real server request even when navigator.onLine is false',async()=>{
  const s=setup({online:false});await s.win.__msyGirlRefresh();
  assert.equal(s.syncCount,1);assert.equal(s.moreCount,0);assert.ok(!s.elements.some(x=>x.className.includes('error')));
});
test('partial sync keeps the previous successful timestamp and reports the incomplete attempt',async()=>{
  const s=setup({complete:false});await s.win.__msyGirlRefresh();
  assert.equal(s.syncCount,1);assert.ok(s.elements.some(x=>x.className.includes('error')));
  assert.equal(s.lastSyncText,'هنوز همگام‌سازی کامل انجام نشده');
});
test('compatibility fallback still works when an older host has no sync bridge',async()=>{
  const s=setup({direct:false});await s.win.__msyGirlRefresh();
  assert.equal(s.moreCount,1);assert.equal(s.syncCount,1);assert.equal(s.backCount,1);assert.equal(s.current,'home');
});
test('native path has no connectivity hard gate and dashboard visibly exposes last update date',()=>{
  const method=java.slice(java.indexOf('private void updateNow()'),java.indexOf('private void askNotificationPermission()'));
  assert.match(method,/window\.__msyGirlRefresh\(\)/);assert.doesNotMatch(method,/if\(!hasInternet\(\)\)/);
  assert.match(code,/window\.MadreseyarStudentSync\|\|window\.__MSY_STUDENT_SYNC__/);
  assert.doesNotMatch(code,/if\(!navigator\.onLine\)return syncMessage/);
  assert.match(code,/آخرین به‌روزرسانی موفق/);assert.match(css,/\.msy-last-sync-card/);
});
