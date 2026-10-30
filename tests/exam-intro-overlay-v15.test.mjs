import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const js=read('app/src/main/assets/girl-sections.js');
const css=read('app/src/main/assets/girl-sections.css');
const gradle=read('app/build.gradle');
const original=read('server-integration/INSTALL-ROOT/student/app.js');
test('real exam action handler remains in authoritative student app',()=>{
 assert.match(original,/\$\("startExamBtn"\)\.onclick\s*=\s*async\s*\(\)\s*=>\s*\{\s*closeModal\(\);\s*await startExam\(exam, draft\);\s*\}/);
 assert.match(js,/bar\.append\(existing\)/); // moves, never clones
 assert.doesNotMatch(js,/\.click\(\)|startExam\(|submitExam\(/);
});
test('modal is above legacy high-z nav and exam action anchored to viewport',()=>{
 assert.match(css,/#modal:not\(\.hidden\)\s*\{\s*z-index:2000!important/);
 assert.match(css,/\.msy-exam-start-footer-v15\s*\{[\s\S]*?position:fixed;/);
 assert.match(css,/\.msy-exam-start-footer-v15 #startExamBtn\s*\{[\s\S]*?display:block!important/);
 assert.match(css,/\.modal-sheet\s*\{[\s\S]*?overflow-y:auto!important/);
});
test('overlay lifecycle removes stale footer after closing or switching dialogs',()=>{
 assert.match(js,/if\(!open \|\| \(anchoredIntroHeadV15 && !unchanged\)\)/);
 assert.match(js,/if\(footer\)footer\.remove\(\)/);
 assert.match(js,/modal\.classList\.remove\('msy-exam-intro-visible'\)/);
 assert.match(js,/new MutationObserver\(repairExamIntroOverlayV15\)/);
});
test('exam intro overlay contract remains intact and app version increments',()=>{
 assert.match(gradle,/versionCode (?:[5-9]|10|11|12)/);
 assert.match(gradle,/versionName '1\.(?:[5-9]|10|11|12)\.0'/);
});
