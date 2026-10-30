import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const web=read('server-integration/INSTALL-ROOT/student/app.js');
const main=read('app/src/main/java/ir/madreseyar/student/MainActivity.java');
const helper=read('app/src/main/java/ir/madreseyar/student/NotificationHelper.java');
const gradle=read('app/build.gradle');

test('manual update compares prior and fresh data and summarizes newly activated exams',()=>{
  assert.match(web,/function summarizeSyncChangesV111\(/);
  assert.match(web,/newActiveExams/);
  assert.match(web,/آزمون تازه فعال شد/);
  assert.match(web,/تکلیف جدید اضافه شد/);
  assert.match(web,/کارنامه یا نتیجه جدید دریافت شد/);
  assert.match(web,/return \{ ok: true,[\s\S]*?complete: mainComplete,[\s\S]*?updateSummary,[\s\S]*?syncedAt:/);
  assert.match(web,/const baseline = readManualSyncBaselineV111\(\)/);
  assert.match(web,/saveManualSyncBaselineV111\(freshDashboard \|\| dashboard, freshResults \|\| previousResults, false\)/);
});

test('update summary is stored per student and displayed in the app notification center',()=>{
  assert.match(web,/UPDATE_NOTICE_PREFIX_V111/);
  assert.match(web,/function saveLocalUpdateNoticeV111\(/);
  assert.match(web,/function showUpdateSummaryV111\(/);
  assert.match(web,/data-p56-filter="updates"/);
  assert.match(web,/گزارش به‌روزرسانی/);
  assert.match(web,/localUpdateNoticesV111\.map/);
});

test('Android native notification is emitted through a verified custom scheme only',()=>{
  assert.match(web,/window\.__msyAndroidApp/);
  assert.match(web,/madreseyar-notify:\/\/update/);
  assert.match(main,/madreseyar-notify/);
  assert.match(main,/isSafeStudentUrl\(Uri\.parse\(safeStudentPageUrl\)\)/);
  assert.match(main,/NotificationHelper\.show\(MainActivity\.this,title,body,"notifications",id\)/);
  assert.match(helper,/new Notification\.BigTextStyle\(\)\.bigText/);
});

test('Android package version increments to 1.12.0',()=>{
  assert.match(gradle,/versionCode 12/);
  assert.match(gradle,/versionName '1\.12\.0'/);
});

test('change detector reports real newly activated exams and avoids first-sync false alarms', async()=>{
  const vm = await import('node:vm');
  const start = web.indexOf('  function updateEntityKeyV111(');
  const end = web.indexOf('  function saveLocalUpdateNoticeV111(', start);
  assert.ok(start >= 0 && end > start, 'pure update comparison helpers exist');
  const snippet = web.slice(start, end) + '\n globalThis.__summarize = summarizeSyncChangesV111;';
  const context = {fa: n => String(n)};
  vm.runInNewContext(snippet, context);
  const before = {student:{id:'s1'},exams:[{id:'e1',title:'آزمون قبلی',studentStatus:'available'}],homework:[],announcements:[],notifications:[]};
  const after = {student:{id:'s1'},exams:[{id:'e1',title:'آزمون قبلی',studentStatus:'available'},{id:'e2',title:'آزمون جدید',studentStatus:'available'}],homework:[{id:'h1',title:'تکلیف جدید'}],announcements:[],notifications:[]};
  const summary = context.__summarize(before, after, null, null);
  assert.equal(summary.hasChanges, true);
  assert.equal(summary.newActiveExamCount, 1);
  assert.ok(summary.items.some(x=>x.includes('آزمون تازه فعال شد')));
  assert.ok(summary.items.some(x=>x.includes('تکلیف جدید اضافه شد')));
  const firstSync = context.__summarize(null, after, null, null);
  assert.equal(firstSync.hasChanges, false);
  assert.ok(firstSync.items.some(x=>x.includes('آزمون فعال در دسترس است')));
});
