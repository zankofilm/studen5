import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const read = p => readFileSync(new URL('../'+p,import.meta.url),'utf8');
const web = read('server-integration/INSTALL-ROOT/student/app.js');
const java = read('app/src/main/java/ir/madreseyar/student/MainActivity.java');
const shell = read('app/src/main/assets/girl-dashboard.js');
const sections = read('app/src/main/assets/girl-sections.js');
const css = read('app/src/main/assets/girl-dashboard.css');
const gradle = read('app/build.gradle');

function simulateHelper({active, complete=false, pending=false}={}){
  const start=web.indexOf('  function v199ExamActive(){');
  const stop=web.indexOf('  function navigate(page, opts = {}) {',start);
  assert.ok(start>=0 && stop>start);
  const snippet=web.slice(start,stop);
  const ctx={
    examSession:active?{draft:{finalizedAt:complete?'done':null}}:null,
    token:'valid-example-session', currentPage:'exams', count:0, navigations:0,
    navigate(){this.navigations++},
    syncDashboard(){this.count++;return pending?new Promise(resolve=>{this.resolveSync=resolve}):Promise.resolve()}
  };
  // Use closure-free instrumented functions so the test can inspect side effects.
  vm.createContext(ctx);
  vm.runInContext(snippet.replace(/navigate\(currentPage,\{fromPop:true\}\)/g,'globalThis.navigations++')
    .replace(/return syncDashboard\(true\)/g,'return globalThis.syncDashboard(true)'),ctx);
  return ctx;
}
test('60-second refresh cannot redraw an exam while the attempt is active',async()=>{
  const state=simulateHelper({active:true});
  await state.v199SafeDashboardRefresh();
  assert.equal(state.count,0); assert.equal(state.navigations,0);
});
test('if sync finishes after the exam begins it still does not leave exam',async()=>{
  const state=simulateHelper({active:false,pending:true});
  const pending=state.v199SafeDashboardRefresh();
  assert.equal(state.count,1);
  state.examSession={draft:{finalizedAt:null}};
  state.resolveSync();await pending;
  assert.equal(state.navigations,0);
});
test('normal dashboard refresh continues when no exam is open',async()=>{
  const state=simulateHelper({active:false});
  await state.v199SafeDashboardRefresh();
  assert.equal(state.count,1);assert.equal(state.navigations,1);
});
test('expired/closed exam does not permanently block ordinary navigation',async()=>{
  const state=simulateHelper({active:true,complete:true});
  await state.v199SafeDashboardRefresh();
  assert.equal(state.count,1);
});
test('Back, popstate, navigation and lifecycle refresh each check live exam guard',()=>{
  assert.match(web,/function navigate\(page, opts = \{\}\) \{[\s\S]*?if\(v199ExamActive\(\)\)/);
  assert.match(web,/window\.addEventListener\("popstate", e=>\{\s*if\(v199ExamActive\(\)\)/);
  assert.match(web,/setInterval\(\(\)=>\{if\(document\.visibilityState==="visible"\)v199SafeDashboardRefresh\(\);\},60000\)/);
  assert.match(web,/window\.addEventListener\("online",\(\)=>\{setSync\("اتصال برقرار شد"\);v199SafeDashboardRefresh\(\);\}\)/);
});
test('Native hardware Back checks a live exam screen before WebView history pop',()=>{
  assert.match(java,/@Override public void onBackPressed\(\) \{[\s\S]*?evaluateJavascript\("\(function\(\)\{return !!document\.querySelector\('#page\.question-screen #examTimer'\)/);
  assert.match(java,/if\("true"\.equals\(value\)\)\{/);
  assert.match(java,/navigateNativeBackWhenSafe\(\)/);
});
test('dashboard and sections observe direct replacements, not every answer/timer mutation',()=>{
  assert.match(shell,/observe\(pageRoot,\{childList:true,attributes:true,attributeFilter:\['class'\]\}\)/);
  assert.match(sections,/observe\(pageRoot,\{childList:true,attributes:true,attributeFilter:\['class'\]\}\)/);
  assert.doesNotMatch(shell,/observe\(scope,\{subtree:true/);
  assert.doesNotMatch(sections,/observe\(\$\('#appView'\)\|\|document\.body,\{subtree:true/);
});
test('no artificial 180ms delay on APK module navigation; fast tap feedback applied',()=>{
  assert.doesNotMatch(shell,/,180\);/);
  assert.match(css,/touch-action:manipulation/);
  assert.match(css,/#msyGirlHome button:active/);
});
test('V1.10 preserves exam start, final submit, image uploads and fingerprint',()=>{
  assert.match(gradle,/versionCode 12/);assert.match(gradle,/versionName '1\.12\.0'/);
  assert.match(sections,/msy-exam-start-footer-v15/);
  assert.match(web,/v70OpenReview/);
  assert.match(web,/p67198-exam-upload/);
  assert.match(java,/BiometricPrompt/);
  assert.match(java,/onShowFileChooser/);
});
