import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const base=new URL('../',import.meta.url);
const read=p=>readFileSync(new URL(p,base),'utf8');
const sections=read('app/src/main/assets/girl-sections.js');
const css=read('app/src/main/assets/girl-sections.css');
const native=read('app/src/main/java/ir/madreseyar/student/MainActivity.java');
const gradle=read('app/build.gradle');
const manifest=read('app/src/main/AndroidManifest.xml');
test('all web modules keep their original handlers and acquire a section skin',()=>{
 for(const name of ['exams','tasks','results','more','schedule','resources','learning','appeals','family','profile']){
  assert.ok(sections.includes(name),name);
 }
 for(const name of ['درس و برنامه‌ریزی','آزمون و ارزیابی','مدرسه و ارتباطات','حساب، همگام‌سازی و امنیت']) assert.ok(sections.includes(name));
 assert.match(sections,/grid\.replaceWith\(shell\)/);
 assert.doesNotMatch(sections,/fetch\(|localStorage\.setItem|\.innerHTML\s*=\s*['"]<form/i);
 for(const name of ['.question-screen','.modal-sheet','.p56-item','.card','.exam-card','.result-card','.more-item','.profile-photo-v37','.schedule th']) assert.ok(css.includes(name),name);
});
test('webview loads full section design while preserving trusted origin and login flow',()=>{
 assert.match(native,/readAsset\("girl-sections\.css"\)/);
 assert.match(native,/readAsset\("girl-sections\.js"\)/);
 assert.match(native,/EXPECTED_HOST = "scooljavanrood\.ir"/);
 assert.match(native,/web\.loadUrl\(BuildConfig\.STUDENT_URL\)/);
 assert.match(native,/installStudentDesign\(\)/);
});
test('biometric protection requires explicit opt in and never signs in to the school',()=>{
 assert.match(gradle,/androidx\.biometric:biometric/);
 assert.match(manifest,/android\.permission\.USE_BIOMETRIC/);
 assert.match(native,/extends FragmentActivity/);
 assert.match(native,/isBiometricEnabled\(\)/);
 assert.match(native,/localStorage\.getItem\('msy\.v13\.token'\)/);
 assert.match(native,/showBiometricPrompt\(action\)/);
 assert.match(native,/secureCover\.bringToFront\(\)/);
 assert.match(native,/onAuthenticationSucceeded/);
 assert.match(native,/biometricAction\(String\.valueOf\(url\.getHost\(\)\)\)/);
 assert.match(native,/request\.isForMainFrame\(\)/);
 assert.doesNotMatch(native,/@JavascriptInterface/);
 assert.doesNotMatch(native,/CookieManager\.getInstance\(\)\.removeAllCookies/);
});
