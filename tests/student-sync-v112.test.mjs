import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const web=read('server-integration/INSTALL-ROOT/student/app.js');
const shell=read('app/src/main/assets/girl-dashboard.js');
const gradle=read('app/build.gradle');
const java=read('app/src/main/java/ir/madreseyar/student/MainActivity.java');

test('host 72.89.15 exposes the stable sync bridge used by Android v1.12',()=>{
  assert.match(web,/const studentSyncBridgeV136 =/);
  assert.match(web,/window\.MadreseyarStudentSync = studentSyncBridgeV136/);
  assert.match(web,/window\.__MSY_STUDENT_SYNC__ = studentSyncBridgeV136/);
  assert.match(web,/syncNow: \(options = \{\}\) => runManualStudentSyncV136\(options\)/);
  assert.match(shell,/hostedSyncBridge\(\)/);
});

test('host persists and renders last successful synchronization time',()=>{
  assert.match(web,/STUDENT_SYNC_META_ID_V136/);
  assert.match(web,/lastSuccessAt/);
  assert.match(web,/studentSyncDateLabelV136/);
  assert.match(web,/studentLastSyncAtV136/);
  assert.match(web,/آخرین به‌روزرسانی موفق/);
  assert.match(shell,/data-msy-last-sync/);
});

test('manual sync is not blocked by navigator.onLine in either host or native shell',()=>{
  const start=web.indexOf('async function syncAllStudentDataV2()');
  const end=web.indexOf('async function runManualStudentSyncV136',start);
  const fn=web.slice(start,end);
  assert.doesNotMatch(fn,/if \(!navigator\.onLine\) throw/);
  const nativeMethod=java.slice(java.indexOf('private void updateNow()'),java.indexOf('private void askNotificationPermission()'));
  assert.doesNotMatch(nativeMethod,/if\(!hasInternet\(\)\)/);
  assert.doesNotMatch(shell,/if\(!navigator\.onLine\)return syncMessage/);
});

test('Android package version is 1.12.0',()=>{
  assert.match(gradle,/versionCode 12/);
  assert.match(gradle,/versionName '1\.12\.0'/);
});
