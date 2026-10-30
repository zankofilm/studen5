# مدرسه‌یار اندروید V1.4 — رفع جابه‌جایی به «بیشتر» هنگام همگام‌سازی

## شرح ایراد
`girl-dashboard.js` در شاخه `nav("sync")` با کلیک روی تب `more` و سپس `manualSyncBtn` همگام‌سازی را شروع می‌کرد، اما به Home برنمی‌گشت. `MainActivity.updateNow()` نیز همین مسیر را تکرار می‌کرد.

## تغییرات
- افزودن `refreshHomeInPlace()` برای کنترل وضعیت، جلوگیری از درخواست تکراری و نمایش پوشش پیشرفت.
- فراخوانی تابع async اصلی `manualSyncBtn.onclick()` و انتظار تا پایان آن.
- برگشت به Home با `history.back()` تا تاریخچه اضافه ایجاد نشود؛ مسیر برگشت اضطراری نیز در نظر گرفته شده است.
- نمایش پیام مناسب در حالت قطع اینترنت/عدم تأیید ذخیره؛ به‌روزرسانی زمان فقط پس از تأیید متن «ذخیره شد».
- اصلاح مسیر همگام‌سازی در جاوا جهت استفاده از همین تابع JS.
- افزایش versionCode به 4 و versionName به 1.4.0.

## فایل‌های تغییر‌یافته
`app/src/main/assets/girl-dashboard.js`
`app/src/main/assets/girl-dashboard.css`
`app/src/main/java/ir/madreseyar/student/MainActivity.java`
`app/build.gradle`

## آزمون
۱۵/۱۵ Node pass، آزمون نحوی JS موفق. Android SDK/Gradle در محیط ایجاد بسته موجود نیست؛ اجرا روی گوشی تأیید نشده.

## نصب
این بسته فقط برای مخزن GitHub اندروید است، نباید فایل‌های `server-integration` یا داده‌های مدرسه را روی هاست جایگزین کرد.
