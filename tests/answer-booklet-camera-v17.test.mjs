import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const activity=fs.readFileSync('app/src/main/java/ir/madreseyar/student/MainActivity.java','utf8');
const manifest=fs.readFileSync('app/src/main/AndroidManifest.xml','utf8');
const paths=fs.readFileSync('app/src/main/res/xml/exam_capture_paths.xml','utf8');
const gradle=fs.readFileSync('app/build.gradle','utf8');
test('Android opens native camera, receives secure content Uri',()=>{
  assert.match(activity,/p\.isCaptureEnabled\(\)/);
  assert.match(activity,/FileProvider\.getUriForFile/);
  assert.match(activity,/MediaStore\.ACTION_IMAGE_CAPTURE/);
  assert.match(activity,/MediaStore\.EXTRA_OUTPUT/);
  assert.match(activity,/pendingCameraImageUri!=null/);
});
test('FileProvider only grants application cache URI via declared authority',()=>{
  assert.match(manifest,/androidx\.core\.content\.FileProvider/);
  assert.match(manifest,/\$\{applicationId\}\.fileprovider/);
  assert.match(manifest,/@xml\/exam_capture_paths/);
  assert.match(paths,/<cache-path/);
});
test('preserves normal multi-file gallery chooser and app version',()=>{
  assert.match(activity,/p\.createIntent\(\)/);
  assert.match(activity,/data\.getClipData\(\)/);
  assert.match(gradle,/versionCode (?:7|8|9|10|11|12)/);
  assert.match(gradle,/versionName '1\.(?:[789]|10|11|12)\.0'/);
});
