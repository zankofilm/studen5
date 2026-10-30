/* Madreseyar Student Android V1.12 — visual shell only.
 * Reads rendered dashboard values, never invents grades or changes remote school data.
 * Original handlers, login, caching, exams, uploads and messages remain authoritative. */
(function(){
  'use strict';
  if (window.__msyGirlDashboardV112) return;
  window.__msyGirlDashboardV112 = true;
  const $ = (s,root=document)=>root.querySelector(s);
  const all = (s,root=document)=>Array.from(root.querySelectorAll(s));
  const escape = v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const icons={
    home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
    tasks:'<rect x="5" y="4" width="14" height="17" rx="3"/><path d="M9 3h6M9 11h6M9 15h5"/>',
    exams:'<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16l2 2 4-4"/>',
    chat:'<path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5 10 10 0 0 1-3.8-.75L3 21l1.75-5.7A8.5 8.5 0 1 1 21 11.5Z"/><path d="M8.5 11.5h.01m4 0h.01m4 0h.01"/>',
    more:'<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
    calendar:'<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 3v4M17 3v4M3 10h18"/><path d="m9 15 2 2 4-4"/>',
    grades:'<path d="M5 19V9M11 19V4M17 19v-8"/><path d="M3 21h18"/>',
    presence:'<circle cx="10" cy="8" r="3"/><path d="M4 20v-2c0-4 12-4 12 0v2M17 15l2 2 3-4"/>',
    report:'<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h4M12 15l1 1.5 2-.4-1.2 1.6.7 2-2.5-1-2 1 .5-2-1-1.6Z"/>',
    library:'<path d="M4 5a2 2 0 0 1 2-2h13v17H6a2 2 0 0 1-2-2zM4 18a2 2 0 0 1 2-2h13M9 7h6"/>',
    notify:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',
    sync:'<path d="M20 7v5h-5M4 17v-5h5"/><path d="M6 9a7 7 0 0 1 12-2l2 5M18 15a7 7 0 0 1-12 2l-2-5"/>',
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    arrow:'<path d="m14 7-5 5 5 5"/>',
    check:'<path d="m5 12 4 4 10-10"/>',
    profile:'<circle cx="12" cy="8" r="3"/><path d="M5 21v-2c0-5 14-5 14 0v2"/>'
  };
  const svg = (name,size=25)=>`<svg aria-hidden="true" viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${icons[name]||icons.library}</svg>`;
  function parseStat(which){
    const item=all('.p48-today-stat', $('#page')).find(x=>x.textContent.includes(which));
    return item?.querySelector('b')?.textContent.trim()||'۰';
  }
  function hostedSyncBridge(){
    const bridge=window.MadreseyarStudentSync||window.__MSY_STUDENT_SYNC__||null;
    return bridge&&typeof bridge==='object'?bridge:null;
  }
  function hiddenHostedSyncLabel(){
    const value=$('#studentLastSyncAtV136')?.textContent?.trim();
    return value||'';
  }
  function formatSyncAt(at){
    const n=Number(at||0);
    if(!Number.isFinite(n)||n<=0)return 'هنوز همگام‌سازی کامل انجام نشده';
    try{return new Intl.DateTimeFormat('fa-IR-u-ca-persian',{year:'numeric',month:'long',day:'numeric',hour:'2-digit',minute:'2-digit'}).format(new Date(n));}
    catch{return new Date(n).toLocaleString('fa-IR');}
  }
  function currentSyncText(){
    return hiddenHostedSyncLabel()||'هنوز همگام‌سازی کامل انجام نشده';
  }
  async function readHostedSyncStatus(){
    const bridge=hostedSyncBridge();
    if(bridge&&typeof bridge.getStatus==='function'){
      try{return await bridge.getStatus()||{};}catch{}
    }
    return {};
  }
  function paintLastSync(text){
    const label=String(text||currentSyncText());
    const full=$('[data-msy-last-sync]');if(full)full.textContent=label;
    const compact=$('#msyGirlHome .msy-sync-status span');if(compact)compact.textContent='آخرین به‌روزرسانی: '+label;
  }
  let homeSyncRunning=false;
  function syncMessage(message,failed=false){
    const item=document.createElement('div');
    item.className='msy-sync-feedback'+(failed?' msy-sync-feedback-error':'');
    item.setAttribute('role',failed?'alert':'status');
    item.textContent=message;
    document.body.appendChild(item);
    setTimeout(()=>item.remove(),3500);
  }
  function waitForDashboard(timeout=3600){
    const start=Date.now();
    return new Promise(resolve=>{
      const check=()=>{
        const page=$('#page'), home=$('#bottomNav [data-page="home"]');
        if(page?.querySelector('.v115-hero')&&home?.classList.contains('active'))return resolve(true);
        if(Date.now()-start>timeout)return resolve(false);
        setTimeout(check,90);
      };
      check();
    });
  }
  // Reuses the REAL student panel's authorized sync handler without leaving the More page on screen.
  // The web handler navigates to More after saving; this wrapper restores the original Home history entry.
  async function refreshHomeInPlace(){
    if(homeSyncRunning)return;
    if(!$('#msyGirlHome') || $('#appView')?.classList.contains('hidden'))return;
    if($('#examTimer'))return syncMessage('هنگام آزمون نمی‌توان اطلاعات را تازه‌سازی کرد.',true);
    homeSyncRunning=true;
    const scrollBefore=window.scrollY||0;
    const shield=document.createElement('div');
    shield.id='msySyncShieldV14';shield.setAttribute('role','status');shield.setAttribute('aria-live','polite');
    shield.innerHTML='<div class="msy-sync-progress"><span class="msy-sync-spinner" aria-hidden="true"></span><strong>در حال به‌روزرسانی اطلاعات…</strong><small>درخواست واقعی به سرور مدرسه ارسال می‌شود و اطلاعات قبلی تا تأیید موفق حفظ می‌شوند</small></div>';
    document.body.appendChild(shield);
    let openedMore=false,result=null,confirmed=false,errorText='همگام‌سازی تأیید نشد؛ اطلاعات قبلی حفظ شده‌اند.';
    try{
      const bridge=hostedSyncBridge();
      if(bridge&&typeof bridge.syncNow==='function'){
        result=await bridge.syncNow({showSummary:true,refreshPage:false});
        confirmed=Boolean(result?.complete===true || (result?.ok===true && result?.complete!==false));
        if(result?.ok===true && result?.complete===false)errorText='بخشی از اطلاعات دریافت شد؛ زمان آخرین همگام‌سازی کامل تغییر نکرد.';
      }else if(typeof window.madreseyarStudentSync==='function'){
        result=await window.madreseyarStudentSync({showSummary:true,refreshPage:false});
        confirmed=Boolean(result?.complete===true || (result?.ok===true && result?.complete!==false));
      }else if(typeof window.syncAllStudentDataV2==='function'){
        result=await window.syncAllStudentDataV2();
        confirmed=Boolean(result?.complete===true || (result?.ok===true && result?.complete!==false));
      }else{
        // Compatibility path for older hosted panels. Current 72.89.15+ exposes a
        // stable bridge, so normal operation never depends on the More-page button.
        const home=$('#bottomNav [data-page="home"]'),more=$('#bottomNav [data-page="more"]');
        if(!home||!more)throw Error('نسخه پنل روی هاست با اپ هماهنگ نیست؛ نسخه جدید پنل دانش‌آموز را روی هاست نصب کنید.');
        more.click();openedMore=true;
        const manual=$('#manualSyncBtn');
        if(typeof manual?.onclick!=='function')throw Error('ماژول همگام‌سازی پنل روی هاست قدیمی است.');
        await manual.onclick();
        confirmed=/ذخیره شد|به‌روز شد/.test(String($('#syncLabel')?.textContent||''));
      }
    }catch(e){errorText=e?.message||errorText;}
    finally{
      const home=$('#bottomNav [data-page="home"]');
      if(openedMore){
        if(window.history?.state?.msyStudentPage==='more')window.history.back();else home?.click();
      }
      if(!(await waitForDashboard())){home?.click();await waitForDashboard(1200);}
      if(confirmed){
        const status=await readHostedSyncStatus();
        const at=Number(result?.syncedAt||result?.lastSuccessfulSyncAt||status.lastSuccessAt||0);
        const label=String(status.label||hiddenHostedSyncLabel()||formatSyncAt(at));
        paintLastSync(label);
      }
      window.scrollTo(0,scrollBefore);
      shield.remove();homeSyncRunning=false;
      const finalSyncLabel=String($('#syncLabel')?.textContent||'');
      const finalMessage=confirmed?(finalSyncLabel.includes('جزئیات')?`اطلاعات اصلی ذخیره شد؛ ${finalSyncLabel}`:'اطلاعات و نمرات با موفقیت به‌روز شدند.'):errorText;
      syncMessage(finalMessage,!confirmed);
    }
  }
  window.__msyGirlRefresh=refreshHomeInPlace;
  function nav(page){
    if(page==='chat'){
      const launcher=$('#p58Launch');
      if(launcher)launcher.click();else alert('گفت‌وگو با معلم هنوز بارگذاری نشده است.');
      return;
    }
    if(page==='notifications'){$('#notificationsBtn')?.click();return;}
    if(page==='sync'){refreshHomeInPlace();return;}
    if(page==='attendance'){
      $('#bottomNav [data-page="more"]')?.click();
      const button=$('#attendanceBtn');
      if(button)button.click();else requestAnimationFrame(()=>$('#attendanceBtn')?.click());
      return;
    }
    if(['home','tasks','exams','results','more'].includes(page)){
      $('#bottomNav [data-page="'+page+'"]')?.click();
      return;
    }
    let link=$('[data-v115-go="'+page+'"]');
    if(link){link.click();return;}
    $('#bottomNav [data-page="more"]')?.click();
    const findTarget=()=>$('[data-more="'+page+'"]')||$('[data-go="'+page+'"]');
    const button=findTarget();
    if(button)button.click();else requestAnimationFrame(()=>findTarget()?.click());
  }
  function tile(label,sub,icon,tone,go,wide){return `<button class="msy-tile msy-${tone}${wide?' msy-tile-wide':''}" data-msy-go="${go}" type="button"><span class="msy-tile-ico">${svg(icon,28)}</span><strong>${label}</strong><small>${escape(sub)}</small><span class="msy-tile-arrow">${svg('arrow',16)}</span></button>`;}
  function taskRow(title,sub,to,kind){return `<button class="msy-today-item msy-today-${kind}" type="button" data-msy-go="${to}"><span class="msy-today-icon">${svg(kind==='exam'?'exams':kind==='message'?'chat':'tasks',22)}</span><span class="msy-today-copy"><b>${escape(title)}</b><small>${escape(sub)}</small></span><span class="msy-today-chevron">${svg('arrow',18)}</span></button>`;}
  function decorateNav(){
    const n=$('#bottomNav');if(!n)return;
    const entries={home:['home','خانه'],exams:['exams','آزمون‌ها'],tasks:['tasks','تکالیف'],results:['grades','نمرات'],more:['more','بیشتر']};
    for(const [page,[symbol,label]] of Object.entries(entries)){
      const b=n.querySelector('button[data-page="'+page+'"]');if(!b||b.dataset.msySkinned)return;
      b.innerHTML='<span class="msy-nav-icon">'+svg(symbol,23)+'</span><small>'+label+'</small>';
      b.dataset.msySkinned='1';
    }
  }
  function makeHome(root){
    const hero=$('.v115-hero',root);
    if(!hero)return;
    const greeting=hero.querySelector('h2')?.textContent.replace(/👋/g,'').trim()||'سلام دانش‌آموز';
    const school=hero.querySelector('p')?.textContent.trim()||'مدرسه‌یار';
    const status=hero.querySelector('.v115-home-status')?.innerText.trim()||'';
    const tasks=parseStat('تکالیف باقی‌مانده');
    const exams=parseStat('آزمون‌های فعال');
    const notes=parseStat('اعلان‌های خوانده‌نشده');
    const lesson=parseStat('کلاس‌های امروز');
    const chatCount=$('#p58Badge')?.hidden?'':($('#p58Badge')?.textContent||'');
    const lessonDate=$('.p48-today-date',root)?.textContent.trim()||new Intl.DateTimeFormat('fa-IR',{weekday:'long',day:'numeric',month:'long'}).format(new Date());
    const list=all('.p48-today-tasks .p48-today-item',root).slice(0,2).map(x=>taskRow(x.querySelector('strong')?.textContent||'تکلیف',x.querySelector('small')?.textContent||'', 'tasks','task'));
    const nextClass=$('.p48-today-lessons .p48-today-item',root);
    if(nextClass && !/ثبت نشده/.test(nextClass.textContent))list.push(taskRow(nextClass.querySelector('strong')?.textContent||'کلاس امروز',nextClass.querySelector('small')?.textContent||'', 'schedule','exam'));
    if(!list.length)list.push(taskRow('فعلاً کار فوری نداری','تکالیف و آزمون‌ها را بررسی کن','tasks','task'));
    const alerts=all('.v115-action-card',root).map(x=>({title:x.querySelector('.v115-action-main b')?.textContent||'',count:x.querySelector('strong')?.textContent||'۰',detail:x.querySelector('small')?.textContent||'',go:x.dataset.v115Go||'more'}));
    const actions=alerts.map(x=>`<button class="msy-action-line" type="button" data-msy-go="${escape(x.go)}"><span>${escape(x.title)}</span><b>${escape(x.count)}</b></button>`).join('');
    const art=String(window.__msyGirlArtData||'');
    const block=document.createElement('div');block.id='msyGirlHome';
    block.innerHTML=`
      <section class="msy-girl-hero"><div class="msy-girl-greeting"><div class="msy-girl-heart">♥</div><h1>${escape(greeting)}</h1><p>${escape(school)}</p><div class="msy-school-status">${escape(status)}</div></div><div class="msy-girl-art">${art?'<img src="'+art+'" alt="تصویر دانش‌آموز مدرسه‌یار">':''}</div></section>
      <div class="msy-sync-row"><button type="button" class="msy-sync-button" data-msy-go="sync">${svg('sync',23)} به‌روزرسانی</button><span class="msy-sync-status">${svg('clock',16)} <span>آخرین به‌روزرسانی: ${escape(currentSyncText())}</span></span></div>
      <div class="msy-last-sync-card"><span class="msy-last-sync-icon">${svg('clock',20)}</span><div><small>آخرین به‌روزرسانی موفق</small><strong data-msy-last-sync>${escape(currentSyncText())}</strong><em>آخرین همگام‌سازی تأییدشده اطلاعات و نمرات با سرور مدرسه</em></div></div>
      <div class="msy-offline-notice">اطلاعات دریافت‌شده روی گوشی می‌مانند. برای دریافت موارد جدید و ارسال قطعی پاسخ، اینترنت لازم است.</div>
      <div class="msy-feature-grid">
        ${tile('پیام‌ها',chatCount?chatCount+' پیام خوانده‌نشده':'چت با معلم','chat','rose','chat')}
        ${tile('آزمون‌ها',exams+' آزمون فعال','exams','blue','exams')}
        ${tile('تکالیف',tasks+' تکلیف باقی‌مانده','tasks','pink','tasks')}
        ${tile('حضور و غیاب','وضعیت حضور','presence','mint','attendance')}
        ${tile('نمرات','مشاهده عملکرد','grades','violet','results')}
        ${tile('برنامه هفتگی',lesson+' کلاس امروز','calendar','lilac','schedule')}
        ${tile('کتابخانه دیجیتال','جزوه و منابع درسی','library','lilac','resources',true)}
        ${tile('کارنامه','نیم‌سال اول و دوم','report','peach','results',true)}
      </div>
      <section class="msy-today"><div class="msy-section-head"><h2>کارهای امروز</h2><span>${escape(lessonDate)}</span></div>${list.join('')}</section>
      <section class="msy-actions"><div class="msy-section-head"><h2>پیگیری‌های مهم</h2><button type="button" data-msy-go="more">همه امکانات ${svg('arrow',14)}</button></div>${actions}</section>
      <div class="msy-more-row"><button type="button" data-msy-go="notifications">${svg('notify',20)} اعلان‌ها <b>${escape(notes)}</b></button><button type="button" data-msy-go="more">${svg('more',20)} همه بخش‌ها</button></div>`;
    root.append(block);
    all('[data-msy-go]',block).forEach(b=>b.addEventListener('click',()=>nav(b.dataset.msyGo)));
  }
  let lastHero=null,lastPage=null,scheduled=false;
  function inspect(){
    scheduled=false;
    const app=$('#appView'),page=$('#page');
    if(!app||!page)return;
    const active=!app.classList.contains('hidden');
    document.body.classList.toggle('msy-girl-app',active);
    document.body.classList.toggle('msy-girl-login',!active);
    const hero=active?$('.v115-hero',page):null;
    document.body.classList.toggle('msy-girl-home',Boolean(hero));
    decorateNav();
    if(!hero){lastHero=null;lastPage=null;return;}
    if(lastHero===hero&&lastPage===page&&$('#msyGirlHome'))return;
    lastHero=hero;lastPage=page;
    $('#msyGirlHome')?.remove();
    makeHome(page);
  }
  function schedule(){if(scheduled)return;scheduled=true;setTimeout(inspect,100);}
  // V1.8: observe only page replacements/navigation, not each answer input,
  // timer tick or DOM operation during an exam. The previous subtree observer
  // added repeated scans to every change in the active exam screen.
  const pageRoot=$('#page'),appRoot=$('#appView'),navRoot=$('#bottomNav');
  if(pageRoot)new MutationObserver(schedule).observe(pageRoot,{childList:true,attributes:true,attributeFilter:['class']});
  if(appRoot)new MutationObserver(schedule).observe(appRoot,{attributes:true,attributeFilter:['class']});
  if(navRoot)new MutationObserver(schedule).observe(navRoot,{childList:true});
  window.addEventListener('online',schedule);window.addEventListener('popstate',schedule);
  window.addEventListener('madreseyar:student-sync-ready',schedule);
  document.addEventListener('click',e=>{
    if(e.target.closest('#bottomNav button'))setTimeout(schedule,150);
  });
  setTimeout(inspect,200);
  window.__msyGirlNav=nav;
})();
