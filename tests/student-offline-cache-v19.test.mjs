import {readFileSync} from 'node:fs';
import {test} from 'node:test';
import assert from 'node:assert/strict';

const root = new URL('../', import.meta.url);
const app = readFileSync(new URL('server-integration/INSTALL-ROOT/student/app.js', root), 'utf8');
const gradle = readFileSync(new URL('app/build.gradle', root), 'utf8');

test('manual refresh stores dashboard, result list and per-exam details locally', () => {
  const start = app.indexOf('async function syncAllStudentDataV2()');
  const end = app.indexOf('async function syncQueue(', start);
  assert.ok(start >= 0 && end > start, 'full sync function exists');
  const sync = app.slice(start, end);
  assert.match(sync, /api\("\/api\/student\/dashboard"/);
  assert.match(sync, /api\("\/api\/student\/results"/);
  assert.match(sync, /\/api\/student\/results\/\$\{encodeURIComponent\(examId\)\}\/details/);
  assert.match(sync, /id: `result_detail_\$\{examId\}`/);
  assert.match(sync, /Math\.min\(4, ids\.length\)/);
});

test('grades page reads IndexedDB before starting its network refresh', () => {
  const start = app.indexOf('async function renderResults(options = {})');
  const end = app.indexOf('function questionStatusFa(', start);
  const fn = app.slice(start, end);
  assert.ok(fn.indexOf('storeGet(CACHE_STORE, "results")') >= 0);
  assert.ok(fn.indexOf('storeGet(CACHE_STORE, "results")') < fn.indexOf('refreshResultsFromServerV2()'));
  assert.match(fn, /renderResults\(\{ skipNetwork: true \}\)/);
});

test('detailed report renders a saved copy before waiting for the server', () => {
  const start = app.indexOf('async function openResultDetails(examId)');
  const end = app.indexOf('function appealDialog(', start);
  const fn = app.slice(start, end);
  assert.ok(fn.indexOf('storeGet(CACHE_STORE,`result_detail_${examId}`)') >= 0);
  assert.ok(fn.indexOf('renderResultDetailsDataV2(examId,cached,stale)') < fn.indexOf('fresh=await withNetwork'));
  assert.match(fn, /resultDetailsRequestV2/);
});

test('cached grades and result details are isolated per student on a shared phone', () => {
  assert.match(app, /STUDENT_CACHE_OWNER_KEY_V49/);
  assert.match(app, /activeStudentCacheOwnerV49/);
  assert.match(app, /return `\$\{encodeURIComponent\(activeStudentCacheOwnerV49\)\}::\$\{logicalId\}`/);
  const start = app.indexOf('async function resetStudentResultCacheIfAccountChangedV2');
  const end = app.indexOf('function examStateId(', start);
  const fn = app.slice(start, end);
  assert.match(fn, /nextId!==activeStudentCacheOwnerV49/);
  assert.match(fn, /setActiveStudentCacheOwnerV49\(nextId\)/);
  assert.match(app, /id: `result_detail_\$\{examId\}`/);
});

test('Android version is incremented for the next APK build', () => {
  assert.match(gradle, /versionCode 12/);
  assert.match(gradle, /versionName '1\.12\.0'/);
});
