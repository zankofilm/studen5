# مدرسه‌یار دانش‌آموز Android V1.7

## ترتیب نصب پیشنهادی
1. پچ **وب P67.19.8** را در هاست روی `app/student` نصب کنید.
2. فایل‌های این ZIP را با حفظ مسیر در مخزن GitHub پروژه Android V1.6 جایگزین کنید.
3. Actions → Build Android APK → Run workflow را اجرا کنید و APK جدید را نصب کنید.
4. عکس پاسخنامه را با دوربین گوشی **در آزمون آزمایشی** بگیرید و دریافت عکس در پیش‌نمایش را بررسی کنید.

فقط چهار فایل اجرایی تغییر کرده‌اند: `MainActivity.java`، `AndroidManifest.xml`، `app/build.gradle`، `res/xml/exam_capture_paths.xml`.
دو فایل تست نیز در ZIP وجود دارند. هیچ فایلی از سرور مدرسه یا `data/` نیاز به تغییر ندارد.

توجه: Firebase Push همچنان بدون تنظیم Firebase و سرور فعال نمی‌شود. هیچ فایل `google-services.json` در این بسته نیست.
