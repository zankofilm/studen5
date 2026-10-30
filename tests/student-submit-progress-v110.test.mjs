import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const web=read('server-integration/INSTALL-ROOT/student/app.js');
const dashboard=read('app/src/main/assets/girl-dashboard.js');
const css=read('app/src/main/assets/girl-sections.css');
const gradle=read('app/build.gradle');

test('bottom navigation Nمرات uses the grades icon and does not redirect to teacher chat',()=>{
  assert.match(dashboard,/results:\['grades','نمرات'\]/);
  assert.doesNotMatch(dashboard,/stopImmediatePropagation\(\).*nav\('chat'\)/);
  assert.doesNotMatch(dashboard,/results:\['chat','پیام‌ها'\]/);
});

test('exam submission has a visible accessible progress dialog and determinate bar',()=>{
  assert.match(web,/function setExamSubmitProgressV72\(/);
  assert.match(web,/role="progressbar" aria-label="پیشرفت ارسال آزمون"/);
  assert.match(web,/style\.width = `\$\{value\}%`/);
  assert.match(web,/aria-valuenow/);
  assert.match(css,/\.v72-submit-progress-track i\{[\s\S]*?transition:width/);
  assert.match(css,/\.v72-submit-progress-spinner/);
});

test('submission percentage follows actual XMLHttpRequest upload events and waits for server confirmation',()=>{
  assert.match(web,/xhr\.upload\.onprogress/);
  assert.match(web,/xhr\.upload\.onload/);
  assert.match(web,/notify\(\{\.\.\.progress,percent:83/);
  assert.match(web,/notify\(\{\.\.\.progress,percent:91/);
  assert.match(web,/سرور ثبت پاسخ‌ها را تأیید کرد/);
});

test('final submit sends only the active exam and defers dashboard/results refresh',()=>{
  assert.match(web,/syncQueue\(exam\.id, \{fastSubmission:true,queueItemId:queueItem\.id,onProgress:/);
  assert.match(web,/if \(!options\.fastSubmission\) \{[\s\S]*?api\("\/api\/student\/dashboard"\)[\s\S]*?refreshResultsCacheV4517\(\)/);
  assert.match(web,/function refreshAfterExamSubmissionV72\(/);
  assert.match(web,/if \(!receipt\.queued\) refreshAfterExamSubmissionV72\(\)/);
});

test('repeat submit is blocked and failed network delivery keeps the local queue',()=>{
  assert.match(web,/let examSubmitInProgressV72 = false/);
  assert.match(web,/if \(!examSession \|\| examSubmitInProgressV72\) return/);
  assert.match(web,/await storePut\(QUEUE_STORE,queueItem\)/);
  assert.match(web,/پاسخ‌ها روی گوشی محفوظ ماندند/);
});

test('Android release version increments to 1.12.0',()=>{
  assert.match(gradle,/versionCode 12/);
  assert.match(gradle,/versionName '1\.12\.0'/);
});
