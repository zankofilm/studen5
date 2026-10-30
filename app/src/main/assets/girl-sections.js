/* Madreseyar Android V1.3 — consistent pastel sections, preserving existing student handlers. */
(function(){
 'use strict';
 if(window.__msyGirlSectionsV13)return;
 window.__msyGirlSectionsV13=true;
 const $=s=>document.querySelector(s);
 const icons={
   schedule:'🗓',resources:'📚',learning:'📈',appeals:'⚖',family:'👨‍👩‍👧',profile:'⚙',
   exams:'📝',tasks:'📋',results:'📊',chat:'✉',notifications:'🔔',study:'📖',attendance:'✓'
 };
 const info={
  exams:['آزمون‌های من','آزمون‌های رسمی، پیش‌نویس‌ها و رسیدهای ارسال'],
  tasks:['تکالیف من','تکالیف، موعد تحویل و بازخورد معلم'],
  results:['نمرات و کارنامه','گزارش‌های تحصیلی و کارنامه دو نیم‌سال'],
  more:['امکانات من','همه بخش‌های آموزشی و ارتباط با مدرسه'],
  schedule:['برنامه هفتگی','درس‌ها، ساعت کلاس و معلم‌های من'],
  resources:['منابع آموزشی','کتاب‌ها، جزوه‌ها و محتوای درسی'],
  learning:['مسیر یادگیری','هدف‌ها، مهارت‌ها و پیشرفت تحصیلی'],
  appeals:['اعتراض‌های من','وضعیت درخواست‌ها و پاسخ معلم'],
  family:['خانواده و مدرسه','گزارش‌ها و رضایت‌نامه‌های مرتبط'],
  profile:['پروفایل و تنظیمات','مشخصات، حساب کاربری و امنیت گوشی']
 };
 const screenTitle=()=>($('#pageTitle')?.textContent||'').trim();
 function link(label,emoji,go,extra=''){
  const b=document.createElement('button');b.type='button';b.className='msy-group-shortcut';
  b.innerHTML='<span class="msy-short-emoji" aria-hidden="true">'+emoji+'</span><span>'+label+'</span><span aria-hidden="true">‹</span>';
  b.addEventListener('click',()=>{if(go==='security'){
    if(!window.__msyAndroidBiometricAvailable){alert('تنظیم قفل اثر انگشت فقط در نسخه نصب‌شده اندروید در دسترس است.');return;}
    window.location.href='madreseyar-auth://'+(window.__msyBiometricEnabled?'disable':'enable');
   }else if(window.__msyGirlNav)window.__msyGirlNav(go);});
  if(extra)b.classList.add(extra);return b;
 }
 function section(parent,title,caption,links){
  const panel=document.createElement('section');panel.className='msy-menu-section';
  const h=document.createElement('div');h.className='msy-menu-group-header';h.innerHTML='<h3>'+title+'</h3><small>'+caption+'</small>';
  panel.append(h);const grid=document.createElement('div');grid.className='msy-menu-group-grid';panel.append(grid);
  for(const item of links)grid.append(item);
  parent.append(panel);
  return panel;
 }
 function enhanceMore(page){
  const grid=page.querySelector('.more-grid');if(!grid||grid.dataset.msyV13)return;
  grid.dataset.msyV13='1';
  const items=Array.from(grid.children);
  const find=k=>items.find(x=>(x.dataset.more||x.id)===k)||null;
  const claim=keys=>keys.map(find).filter(Boolean);
  const shell=document.createElement('div');shell.className='msy-menu-groups';
  const education=section(shell,'درس و برنامه‌ریزی','برنامه کلاس و منابع آموزشی',claim(['schedule','p57MoreLaunch','resources','learning']));
  const exams=section(shell,'آزمون و ارزیابی','نمره، نتیجه و تمرین مستقل',claim(['p633ExamCenter','appeals']));
  exams.lastElementChild.append(link('آزمون‌های رسمی','📝','exams'),link('کارنامه و نمرات','📊','results'));
  const school=section(shell,'مدرسه و ارتباطات','اعلان‌های مدرسه و گفتگو با معلم',claim(['family','attendanceBtn']));
  school.lastElementChild.append(link('چت با معلم','💬','chat'),link('اعلان‌ها','🔔','notifications'));
  const account=section(shell,'حساب، همگام‌سازی و امنیت','کنترل اطلاعات و دستگاه',claim(['profile','manualSyncBtn']));
  const secure=link(window.__msyBiometricEnabled?'غیرفعال‌کردن قفل اثر انگشت':'فعال‌سازی ورود با اثر انگشت','🔐','security','msy-biometric-action');
  if(!window.__msyAndroidBiometricAvailable)secure.hidden=true;
  account.lastElementChild.append(secure);
  for(const item of items){if(item.parentNode===grid)account.lastElementChild.appendChild(item);}
  grid.replaceWith(shell);
 }
 function drawHeader(page){
  if(page.classList.contains('question-screen'))return;
  const title=screenTitle();
  const key=Object.keys(info).find(k=>title===info[k][0] || (k==='more'&&title.includes('امکانات')))||({ 'آزمون‌ها':'exams','تکالیف':'tasks','کارنامه':'results','برنامه هفتگی':'schedule','منابع آموزشی':'resources','یادگیری من':'learning','اعتراض‌ها':'appeals','خانواده و اولیا':'family','پروفایل':'profile' }[title]);
  if(!key || !info[key])return;
  if(page.querySelector('.msy-screen-head'))return;
  const el=document.createElement('div');el.className='msy-screen-head';
  el.innerHTML='<div><div class="msy-screen-caption">مدرسه‌یار  •  پنل دانش‌آموز</div><h1>'+info[key][0]+'</h1><p>'+info[key][1]+'</p></div><span class="msy-screen-decoration" aria-hidden="true">✦</span>';
  page.insertBefore(el,page.firstChild);
 }
 function setBiometricStatus(){
   document.querySelectorAll('.msy-biometric-action span:nth-child(2)').forEach(n=>{n.textContent=window.__msyBiometricEnabled?'غیرفعال‌کردن قفل اثر انگشت':'فعال‌سازی ورود با اثر انگشت';});
 }
 window.addEventListener('msy:biometric-state',setBiometricStatus);

 // V1.5: move the EXISTING exam-start button (not a duplicate) above the legacy
 // bottom navigation. Moving a DOM node preserves its real onclick listener,
 // and closeModal / startExam remain wholly owned by student/app.js.
 let anchoredIntroHeadV15=null;
 function repairExamIntroOverlayV15(){
  const modal=$('#modal'),sheet=$('#modalSheet');
  if(!modal||!sheet)return;
  const open=!modal.classList.contains('hidden');
  const footer=modal.querySelector('.msy-exam-start-footer-v15');
  const unchanged=anchoredIntroHeadV15 && anchoredIntroHeadV15===sheet.firstElementChild;
  if(!open || (anchoredIntroHeadV15 && !unchanged)){
   if(footer)footer.remove();
   anchoredIntroHeadV15=null;
   if(modal.classList.contains('msy-exam-intro-visible'))modal.classList.remove('msy-exam-intro-visible');
   if(document.body.classList.contains('msy-exam-intro-v15'))document.body.classList.remove('msy-exam-intro-v15');
  }
  if(!open)return;
  const existing=sheet.querySelector('#startExamBtn');
  if(existing){
   let bar=modal.querySelector('.msy-exam-start-footer-v15');
   if(!bar){bar=document.createElement('div');bar.className='msy-exam-start-footer-v15';modal.append(bar);}
   anchoredIntroHeadV15=sheet.firstElementChild;
   bar.append(existing); // IMPORTANT: preserves student/app.js's click handler.
   modal.classList.add('msy-exam-intro-visible');
   document.body.classList.add('msy-exam-intro-v15');
  }
 }
 const studentModalV15=$('#modal');
 if(studentModalV15){
  new MutationObserver(repairExamIntroOverlayV15).observe(studentModalV15,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
  repairExamIntroOverlayV15();
 }
 window.__msyExamIntroRepairV15=repairExamIntroOverlayV15;

 let scheduled=false;
 function inspect(){
  scheduled=false;
  const main=$('#appView');const page=$('#page');if(!main||main.classList.contains('hidden')||!page)return;
  // Underlying web renders the real data/handlers; only add chrome and move the existing menu buttons.
  const home=!!page.querySelector('.v115-hero');
  if(!home){drawHeader(page);enhanceMore(page);}
 }
 function schedule(){if(scheduled)return;scheduled=true;setTimeout(inspect,90);}
 // V1.8: no subtree scans when answers/timer are updated.
 const pageRoot=$('#page'),appRoot=$('#appView');
 if(pageRoot)new MutationObserver(schedule).observe(pageRoot,{childList:true,attributes:true,attributeFilter:['class']});
 if(appRoot)new MutationObserver(schedule).observe(appRoot,{attributes:true,attributeFilter:['class']});
 schedule();
})();
