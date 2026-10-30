import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const css=read('app/src/main/assets/girl-sections.css');
const source=read('server-integration/INSTALL-ROOT/student/app.js');
const gradle=read('app/build.gradle');
test('hide nav on actual exam screens despite old display:flex!important rule',()=>{
 assert.match(css,/#bottomNav\.hidden,\s*body\.msy-girl-app \.app #page\.question-screen \+ #bottomNav/);
 assert.match(css,/\.question-screen \+ #bottomNav \{[\s\S]*?display:none!important/);
});
test('actual final button stays fixed and clickable above phone edges',()=>{
 assert.match(css,/#page\.question-screen \.fixed-submit \{[\s\S]*?position:fixed!important/);
 assert.match(css,/#page\.question-screen \.fixed-submit #finishExamBtn \{[\s\S]*?visibility:visible!important/);
});
test('original exam answer, review and submit path unchanged',()=>{
 assert.match(source,/finish\.onclick=v70OpenReview/);
 assert.match(source,/submit\.onclick=\(\)=>\{closeModal\(\);finalSubmitExam\(false\);\}/);
 assert.match(source,/const finish=document\.getElementById\("finishExamBtn"\)/);
 assert.match(source,/await storePut\(QUEUE_STORE,queueItem\)/);
 assert.match(source,/await storePut\(DRAFT_STORE, draft\)/);
});
test('original review confirmation is visible in review sheet',()=>{
 assert.match(css,/#modal \.v70-review-actions \{[\s\S]*?position:sticky/);
 assert.match(css,/#modal \.v70-review-actions #v70ConfirmSubmit \{[\s\S]*?min-height:50px/);
});
test('Android build version stays at least V1.6, retaining the final-submit fix',()=>{
 const version=Number(gradle.match(/versionCode (\d+)/)?.[1]||0);
 assert.ok(version>=6);
 assert.match(gradle,/versionName '1\.(?:[6789]|10|11|12)\.0'/);
});
