/* Unlock With Seify · authenticated frontend. No service key or answer keys in source. */
(()=>{
"use strict";
const cfg=window.UNLOCK_CONFIG,db=window.supabase.createClient(cfg.url,cfg.publishableKey);
const root=document.getElementById("root"),sessEl=document.getElementById("session-area"),toastEl=document.getElementById("toaster");
const NAMES=[["listening-speaking","Listening, Speaking & Critical Thinking","🎧"],["reading-writing","Reading, Writing & Critical Thinking","📖"]];
const TOPICS=["People","Seasons","Lifestyle","Places","Jobs","Homes and Buildings","Food and Culture","Transport"];
const esc=s=>String(s??"").replace(/[&<>"']/g,x=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[x]));
const T={session:null,user:null,admin:false,books:[],book:null,unit:null,lesson:null,lessons:[]};
const $=s=>document.querySelector(s);
const notice=(msg,type="")=>{toastEl.textContent=msg;toastEl.className="notice "+type;toastEl.style.position="fixed";toastEl.style.bottom="12px";toastEl.style.left="12px";toastEl.style.zIndex="50";clearTimeout(notice.t);notice.t=setTimeout(()=>toastEl.className="hide",4800)};
const button=(label,attrs="")=>'<button type="button" class="button" '+attrs+'>'+label+'</button>';
const badge=s=>'<span class="tag '+(s==="published"?"ok":"draft")+'">'+esc(s)+'</span>';
const crumb=(...parts)=>'<div class="crumbs">'+parts.map(s=>'<span>'+esc(s)+'</span>').join(' • ')+'</div>';
const sourceAlert='<p class="source-rights">صفحات الكتاب والصوتيات الأصلية تُتاح بعد رفعها واعتمادها للحسابات المصرح لها.</p>';
const printPage=p=>Number.isFinite(Number(p))&&Number(p)>2?String(Number(p)-2):'—';
const bookPageLabel=p=>'صفحة '+printPage(p)+' في الكتاب';
const questionLabel=(a,i)=>{const p=a.prompt||{},ref=String(a.source_reference||'');const origin=String(p.origin||'');const kind=p.mode==='script_study'?'على السكريبت':origin==='cambridge-digitized'?'من الكتاب':'تدريب داعم';const match=ref.match(/-e(\d+)(?:-|$)/i);return 'سؤال '+(i+1)+' · '+kind+(match?' · تمرين '+match[1]:'')+(p.pdf_page?' · '+bookPageLabel(p.pdf_page):'');};
function frame(title,subtitle,inner){root.innerHTML='<section class="hero"><span class="eyebrow">UNLOCK LEVEL 1 · WITH SEIFY</span><h1>'+esc(title)+'</h1><p>'+esc(subtitle)+'</p></section>'+inner;}
function menu(){sessEl.innerHTML=T.user?'<span class="subtle">'+esc(T.user.email)+'</span> '+(T.admin?button('رفع صور الكتاب','data-action="admin-images"')+button('لوحة الإدارة','data-action="admin"'):button('درجاتي','data-action="results"'))+button('تسجيل الخروج','data-action="logout"'):'<button class="nav-btn" data-action="login">دخول الطلاب</button>';}
function home(){
 T.book=T.unit=T.lesson=null; menu();
 const cards=NAMES.map(([slug,title,ico],i)=>{
 const available=T.books.find(b=>b.slug===slug);
 const btn=available?'<button type="button" class="button primary" data-action="book" data-id="'+available.id+'">افتح الكتاب</button>':button(T.user?'غير مضاف إلى حسابك':'سجّل الدخول',T.user?'disabled':'data-action="login"');
 return '<article class="card"><div class="book-ico">'+ico+'</div><div class="eyebrow">BOOK '+(i+1)+'</div><h2 class="en title">'+esc(title)+'</h2><p>ثماني وحدات مستقلة، درجات ومهارات وقاموس خاص بالكتاب.</p>'+btn+'</article>';
 }).join('');
 frame('UNLOCK WITH SEIFY','منهج أكاديمي تفاعلي · كتابان مستقلان داخل Unlock 1 · شرح عربي واضح ومحتوى إنجليزي منظم','<section class="cols">'+cards+'</section>'+(T.admin?'<section class="card admin-upload-shortcut"><div><strong>صور Unit 1 جاهزة للرفع</strong><p>ارفع ملف ZIP للكتابين في خطوة واحدة.</p></div>'+button('رفع صور الكتاب الآن','data-action="admin-images"')+'</section>':'')+'<section class="card" style="margin-top:18px"><h2>ابدأ بـ Unit 1 — People</h2><p>اختار كتابك، افتح الدرس، اقرأ شرحًا مختصرًا وحل مباشرة. كل تمرين معاه مكانه من الكتاب وتفسير بعد الحل.</p><div class="row"><span class="tag ok">الوحدة الأولى متاحة</span><span class="subtle">الصوت والفيديو يظهران بعد رفع الملفات الأصلية.</span></div></section>'+(!T.user?'<div class="notice">للدخول إلى وحدتك، استخدم بيانات حساب الطالب. حسابات الإدارة تُمنح بصلاحية خادم مستقلة.</div>':T.books.length===0?'<div class="notice warning">حسابك لم يُسجّل بعد في أي كتاب. اطلب من إدارة المنصة إضافتك إلى الكتاب المطلوب.</div>':''));
}
function authPage(signup=false){
 root.innerHTML='<section class="card auth-card"><h2>'+(signup?'إنشاء حساب الطالب':'تسجيل الدخول')+'</h2><p>حسابك خاص بمنصة Unlock. لا نستخدم حساب STEP تلقائيًا.</p><form id="authform"><label class="field-label" for="auth-email">Email</label><input class="field" id="auth-email" type="email" autocomplete="email" required><label class="field-label" for="auth-pass">Password</label><input class="field" id="auth-pass" type="password" minlength="6" autocomplete="'+(signup?'new-password':'current-password')+'" required><div class="row" style="margin-top:17px"><button class="button primary" type="submit">'+(signup?'إنشاء الحساب':'دخول')+'</button>'+button(signup?'لديك حساب؟ سجّل الدخول':'إنشاء حساب جديد','data-action="'+(signup?'login':'signup')+'"')+'</div><p class="auth-help">تفعيل الحساب لا يعني التسجيل في أي كتاب؛ الإدارة تختار الكتاب وصلاحيات الوصول.</p></form></section>';
 $('#authform').addEventListener('submit',async e=>{e.preventDefault();const email=$('#auth-email').value.trim(),password=$('#auth-pass').value;const r=signup?await db.auth.signUp({email,password}):await db.auth.signInWithPassword({email,password});if(r.error){notice(r.error.message,'warning');return;}if(signup&&!r.data.session)notice('تم إرسال رسالة تأكيد للبريد الإلكتروني.');await refresh(true);});
}
async function refresh(force=false){const {data:{session}}=await db.auth.getSession();T.session=session;T.user=session?.user||null;T.admin=T.user?.app_metadata?.unlock_role==='admin';T.books=[];
 if(T.user){const {data,error}=await db.from('books').select('id,slug,title,status,position').order('position');if(error)notice('تعذر تحميل الكتب: '+error.message,'warning');else T.books=data||[]}
 if(force||!T.book){
  if(T.admin&&window.location.hash==='#upload-images'){T.adminTab='images';await adminPage();}
  else home();
 }
}
async function bookPage(bookId){
 const book=T.books.find(b=>b.id===bookId);if(!book){home();return;}T.book=book;T.unit=T.lesson=null;
 const {data:units,error}=await db.from('units').select('id,number,title,status,source_pdf_page').eq('book_id',bookId).order('number');
 if(error){notice(error.message,'warning');return;}
 const cards=(units||[]).map(u=>{
  const accessible=u.status==='published'||T.admin;
  const label='<span class="num">UNIT '+String(u.number).padStart(2,'0')+'</span><strong class="en">'+esc(u.title)+'</strong><span class="unit-status">'+(u.status==='published'?'افتح الوحدة':'قريبًا')+'</span>';
  return accessible?'<button class="unit-card'+(u.number===1?' is-featured':'')+'" data-action="unit" data-id="'+u.id+'">'+label+'</button>':
    '<article class="unit-card is-upcoming" aria-label="Unit '+u.number+' قيد الإعداد">'+label+'</article>';
 }).join('');
 frame(book.title,'منهج مستقل · 8 وحدات · درجات وقاموس خاص بالكتاب',crumb('Unlock 1',book.title)+'<div class="row" style="margin-bottom:15px">'+button('العودة للرئيسية','data-action="home"')+'</div><section class="book-units"><div class="section-lead"><div><span class="micro-heading">اختار وحدتك</span><h2>ابدأ من Unit 1 — People</h2><p class="subtle">الوحدة الأولى متاحة. باقي الوحدات هتظهر بالتدريج بعد اعتمادها.</p></div></div><div class="grid8">'+cards+'</div></section>'+sourceAlert);
}
async function unitPage(unitId){
 if(!T.book){home();return;}
 const {data:u,error}=await db.from('units').select('id,number,title,status,source_pdf_page').eq('id',unitId).single();
 if(error||!u){notice('الوحدة غير متاحة لهذا الحساب','warning');return;}
 T.unit=u;T.lesson=null;
 const [{data:lessons,error:e1},{data:words,error:e2}]=await Promise.all([db.from('lessons').select('id,slug,title,kind,status,position,content').eq('unit_id',u.id).order('position'),db.from('vocabulary').select('id,term,part_of_speech,meaning_ar,status,definition_en,pronunciation_ipa,glossary_pdf_page').eq('unit_id',u.id).order('position')]);
 if(e1||e2){notice((e1||e2).message,'warning');return;}T.lessons=lessons||[];
 const lessonsHtml=T.lessons.map((l,i)=>{const pp=Array.isArray(l.content?.source_pages)?l.content.source_pages:[];const range=pp.length?'صفحات الكتاب '+printPage(Math.min(...pp))+(pp.length>1?'–'+printPage(Math.max(...pp)):''):'';const waiting=l.kind==='audio'||l.kind==='video';return '<button class="lesson-card" data-action="lesson" data-id="'+l.id+'"><div class="row"><span class="lesson-num">'+String(i+1).padStart(2,'0')+'</span><div><strong class="en">'+esc(l.title)+'</strong><div class="subtle">'+esc(range)+'</div></div></div><span class="tag '+(waiting?'draft':'ok')+'">'+(waiting?'سيتم النشر':l.status==='published'?'متاح':'تحت المراجعة')+'</span></button>';}).join('');
 const wordHtml=(words||[]).map(w=>'<article class="word"><strong class="en">'+esc(w.term)+'</strong><div class="subtle en">'+esc(w.pronunciation_ipa||'')+' · '+esc(w.part_of_speech||'')+'</div><div>'+esc(w.meaning_ar||'تحت المراجعة')+'</div>'+(w.definition_en?'<p class="en definition">'+esc(w.definition_en)+'</p>':'')+'<div class="source-ref">Wordlist: ص 35 · Glossary: ص '+printPage(w.glossary_pdf_page)+'</div></article>').join('');
 frame('Unit '+u.number+' — '+u.title,T.book.title,
  crumb('Unlock 1',T.book.title,'Unit '+u.number)+
  '<div class="row unit-back">'+button('كل الكتب','data-action="home"')+button('الوحدات','data-action="book" data-id="'+T.book.id+'"')+'</div>'+
  '<section class="unit-flow"><div class="card unit-lesson-list"><div class="section-lead"><div><span class="micro-heading">ابدأ من هنا</span><h2>دروس الوحدة بالترتيب</h2></div><span class="tag">'+T.lessons.length+' أجزاء</span></div><p class="subtle">اضغط على اسم الدرس، هتلاقي شرحًا واضحًا وتدريباته ومكانه في الكتاب.</p><div class="list">'+(lessonsHtml||'<div class="empty">الأقسام قيد التدقيق.</div>')+'</div></div>'+
  '<details class="card compact-panel unit-dictionary" id="unit-dictionary"><summary>قاموس الوحدة الكامل <span class="tag">'+(words||[]).length+' كلمة</span></summary><p>المعنى بالعربي والنطق والتعريف بالإنجليزي، مع الصفحة المطبوعة في الكتاب.</p><input class="field word-search" id="unit-word-search" type="search" placeholder="ابحث عن كلمة أو معناها" aria-label="البحث في قاموس الوحدة" autocomplete="off"><div class="vocab" id="unit-word-list">'+(wordHtml||'<div class="empty">لا توجد كلمات في هذا القسم بعد.</div>')+'</div></details></section>'+sourceAlert);
}
async function lessonPage(id){
 if(!T.unit)return;
 const l=T.lessons.find(x=>x.id===id);if(!l)return;T.lesson=l;
 const {data:acts,error}=await db.from('activities').select('id,kind,prompt,options,source_reference,position,status').eq('lesson_id',id).order('position');
 if(error){notice(error.message,'warning');return;}
 let learnerWork=null,review=null;
 if(T.user&&!T.admin&&['writing','speaking','critical_thinking','reading'].includes(l.kind)){
  const {data:work}=await db.from('lesson_work').select('id,body,submission_status,updated_at').eq('lesson_id',l.id).eq('student_id',T.user.id).maybeSingle();
  learnerWork=work;
  if(work){const {data:r}=await db.from('lesson_work_reviews').select('score,feedback_ar,reviewed_at').eq('work_id',work.id).maybeSingle();review=r;}
 }
 const workHtml=(T.user&&!T.admin&&['writing','speaking','critical_thinking','reading'].includes(l.kind)&&l.status==='published')
  ?'<section class="card" style="margin-top:15px"><h2>دفتر التطبيق والتسليم</h2><p>اكتب إجابتك أو ملاحظات العرض. احفظها كمسودة، ثم سلّمها للمدرس لما تخلص.</p><textarea class="field textarea" id="lesson-work" dir="auto" maxlength="20000" '+(learnerWork?.submission_status==='submitted'?'readonly':'')+'>'+esc(learnerWork?.body||'')+'</textarea><div class="row" style="margin-top:12px">'+(learnerWork?.submission_status==='submitted'?badge('submitted'):button('حفظ المسودة','data-action="save-work"')+button('تسليم للمراجعة','data-action="submit-work"'))+'</div>'+(review?'<div class="feedback"><strong>مراجعة المدرس · '+esc(review.score??'بدون درجة')+'/100</strong><p>'+esc(review.feedback_ar||'')+'</p></div>':learnerWork?.submission_status==='submitted'?'<div class="notice">تم التسليم، بانتظار مراجعة المدرس.</div>':'')+'</section>'
  :'';
 const question=(acts||[]).map((a,i)=>{
  const prompt=a.prompt?.text||'Question';
  const options=Array.isArray(a.options)?a.options:[];
  let form='';
  if(['mcq','true_false'].includes(a.kind))form='<div class="choices">'+options.map((ch,j)=>'<label class="choice"><input type="radio" name="ans-'+a.id+'" value="'+j+'"><span>'+esc(ch)+'</span></label>').join('')+'</div>';
  else if(['ordering','gap_fill','short_answer'].includes(a.kind))form='<input class="field" type="text" data-response="'+a.id+'" placeholder="Write your answer" lang="en">';
  else form='<div class="notice">نشاط مفتوح أو يحتاج مراجعة مدرس، ولا يقبل تصحيحًا آليًا قاطعًا.</div>';
  const canGrade=['mcq','true_false','ordering','gap_fill','short_answer'].includes(a.kind);
  return '<article class="quiz" data-question-id="'+a.id+'" data-book-origin="'+esc(a.prompt?.origin||'')+'" data-book-pdf-page="'+Number(a.prompt?.pdf_page||0)+'" data-book-ref="'+esc(a.source_reference||'')+'"><div class="source-ref">'+esc(questionLabel(a,i))+'</div><div class="question">'+esc(prompt)+'</div>'+form+(canGrade?'<button class="button primary small" data-action="grade" data-id="'+a.id+'">اعرف الحل والسبب</button>':'')+'<div class="feedback-slot" role="status"></div></article>';
 }).join('');
 const guidance=l.content||{};
 const guide='<section class="card" style="margin-bottom:15px"><h2>شرح وتوجيه لغوي</h2><div>'+esc(guidance.teaching_note_ar||'راجع خطوات الدرس والمفردات قبل الحل.')+'</div>'+(Array.isArray(guidance.examples)&&guidance.examples.length?'<div class="en" style="margin-top:12px">'+guidance.examples.map(x=>'<p>'+esc(x)+'</p>').join('')+'</div>':'')+'<div class="subtle">توضيحات تعليمية من إعداد المعهد، منفصلة عن محتوى Cambridge الأصلي.</div></section>';
 const pages=Array.isArray(guidance.source_pages)?guidance.source_pages:[];
 const supplement=Array.isArray(guidance.supplementary_source_pages)?guidance.supplementary_source_pages:[];
 const sources='<details class="card compact-panel" id="book-sources"><summary>فين الدرس في الكتاب؟ <span class="subtle">ص '+pages.map(printPage).join('، ')+'</span></summary><p>اختار الصفحة لمشاهدة صورتها بعد رفعها من الإدارة.</p><div class="row">'+pages.map(p=>button('صفحة '+printPage(p),'data-action="source-page" data-page="'+Number(p)+'"')).join('')+'</div>'+(supplement.length?'<h3>ملحق Pairwork — Student A / B</h3><div class="row">'+supplement.map(p=>button('صفحة '+printPage(p),'data-action="source-page" data-page="'+Number(p)+'"')).join('')+'</div>':'')+'<div id="source-availability" aria-live="polite"></div></details>';
 const {data:sourceExercises,error:sourceError}=await db.from('exercise_registry').select('id,pdf_page,source_title,activity_label,grading_mode,publish_status,instruction_ar,model_answer_ar,answer_kind').eq('lesson_id',id).order('pdf_page');
 if(sourceError){notice(sourceError.message,'warning');return;}
 const {data:lessonWords}=await db.from('vocabulary').select('id,term,part_of_speech,meaning_ar,definition_en,pronunciation_ipa,glossary_pdf_page').eq(l.slug==='review'?'unit_id':'lesson_id',l.slug==='review'?T.unit.id:id).order('position');
 const answerMap={};
 if(T.user&&!T.admin&&(sourceExercises||[]).some(x=>x.grading_mode!=='media-awaited')){
   const {data:responses}=await db.from('exercise_responses').select('id,exercise_id,response_text,response_status').eq('student_id',T.user.id).in('exercise_id',(sourceExercises||[]).map(x=>x.id));
   (responses||[]).forEach(x=>answerMap[x.exercise_id]=x);
   const rid=(responses||[]).filter(x=>x.response_status==='submitted').map(x=>x.id);
   if(rid.length){const {data:graded}=await db.from('exercise_feedback').select('response_id,score,feedback_ar').in('response_id',rid);const g=Object.fromEntries((graded||[]).map(x=>[x.response_id,x]));for(const x of Object.values(answerMap))x.review=g[x.id]||null;}
 }
 const learningBlocks=Array.isArray(guidance.teaching_blocks)?guidance.teaching_blocks:[];

 const bookCut=(entry,i,extraClass='')=>{
  const clip=entry.source_clip||null;
  const sourcePage=Number(clip?.page||entry.page||pages[Math.min(i,pages.length-1)]||pages[0]);
  if(!sourcePage||!Number.isFinite(sourcePage))return '';
  const verified=clip?.verified===true;
  const top=verified?Math.max(0,Math.min(1400,Number(clip.top)||0)):50;
  const bottom=verified?Math.min(1545,Math.max(top+80,Number(clip.bottom)||1545)):1430;
  const height=Math.max(80,bottom-top);
  return '<div class="textbook-figure '+extraClass+'"><div class="textbook-figure-top"><span class="textbook-source-badge">من صفحة الكتاب · ص '+printPage(sourcePage)+'</span>'+(verified?'<span class="textbook-focus-label">الجزء المرتبط بالشرح</span>':'<span class="textbook-focus-label">الصفحة الأصلية</span>')+'</div>'+
   '<div class="source-cut" data-pdf-page="'+sourcePage+'" data-top="'+top+'" data-bottom="'+bottom+'" style="aspect-ratio:1150 / '+height+'"><div class="source-cut-loading">جاري إظهار صفحة الكتاب…</div></div>'+
   '<div class="textbook-figure-foot">'+button('كبّر الجزء ده','data-action="study-crop-zoom"')+button('شوف الصفحة كاملة','data-action="study-source-full" data-page="'+sourcePage+'"')+'</div></div>';
 };
 const expandedGuide=learningBlocks.length?
   '<section class="book-first-chapter" id="lesson-explanation"><div class="book-first-intro"><span class="study-section-kicker">الكتاب قدامك · وهنشرح عليه</span><h2>اقرأ الجزء ده من الكتاب، وبعدها افهمه</h2><p>كل صورة من صفحات الكتاب الأصلية، والشرح اللي جنبها بيوضح الفكرة من غير ما يغيّر النص.</p></div>'+
   learningBlocks.map((x,i)=>'<article class="book-first-step" id="book-step-'+i+'">'+bookCut(x,i)+
    '<div class="book-teacher-note"><div class="book-teacher-number">شرح '+(i+1)+' / '+learningBlocks.length+'</div>'+
    '<h3>'+esc(x.h||'الفكرة')+'</h3><p>'+esc(x.ar||'')+'</p>'+
    (x.en?'<div class="en sample">'+esc(x.en)+'</div>':'')+
    (x.wrong?'<div class="compare-example"><strong>الفرق بين الصح والغلط:</strong><span class="en">'+esc(x.wrong)+'</span></div>':'')+
    (x.tip?'<div class="learning-tip"><strong>ركّز هنا:</strong> '+esc(x.tip)+'</div>':'')+
    '<div class="book-teacher-source">المرجع: ص '+printPage(x.source_clip?.page||x.page||pages[Math.min(i,pages.length-1)]||pages[0])+' من الكتاب المطبوع</div></div></article>').join('')+
   '</section>':'';
  const readingItems=Array.isArray(guidance.verified_source_readings)?guidance.verified_source_readings:[];
 const originalReadings=readingItems.length?'<section class="card" style="margin-bottom:15px"><h2>نص القراءة من الكتاب</h2>'+readingItems.map(x=>'<article class="study-block"><div class="source-ref">صفحة الكتاب '+printPage(x.page)+'</div><h3 class="en">'+esc(x.heading||'Reading')+'</h3><div class="en original-text">'+esc(x.text||'')+'</div></article>').join('')+'</section>':'';
 const scripts=Array.isArray(guidance.original_scripts)?guidance.original_scripts:[];
 const scriptExtract=scripts.length?'<details class="card compact-panel" id="script-study"><summary>اقرأ سكريبتات الوحدة <span class="tag">تدريب قراءة</span></summary><div class="notice warning">ده تدريب على النص المكتوب فقط؛ مش درجة Listening أو Watching.</div>'+scripts.map(x=>'<article class="study-block"><div class="source-ref">'+bookPageLabel(x.page)+'</div><h3 class="en">'+esc(x.label)+'</h3><div class="en original-text">'+esc(x.text)+'</div></article>').join('')+'</details>':
 typeof guidance.source_excerpt==='string'&&guidance.source_excerpt?'<details class="card compact-panel"><summary>نصوص Script Study</summary><div class="en original-text">'+esc(guidance.source_excerpt)+'</div></details>':'';
 const scriptRefs=Array.isArray(guidance.audio_script_cross_refs)?guidance.audio_script_cross_refs:[];
 const scriptReferences=scriptRefs.length?'<details class="card compact-panel"><summary>أماكن السكريبتات الأخرى في الكتاب</summary><div class="list">'+scriptRefs.map(x=>'<div class="lesson-card"><span class="en">Track '+esc(x.track)+'</span><span>صفحة '+esc(x.printed_page||printPage(x.pdf_page))+' من الكتاب</span>'+button('عرض الصفحة','data-action="source-page" data-page="'+Number(x.pdf_page)+'"')+'</div>').join('')+'</div></details>':'';
 const vocabularyPanel=(lessonWords||[]).length?'<details class="card compact-panel" id="lesson-vocabulary"><summary>قاموس كلمات الدرس <span class="tag">'+lessonWords.length+' كلمة</span></summary><div class="vocab">'+lessonWords.map(w=>'<article class="word"><strong class="en">'+esc(w.term)+'</strong><div class="subtle en">'+esc(w.pronunciation_ipa||'')+' · '+esc(w.part_of_speech||'')+'</div><div>'+esc(w.meaning_ar||'')+'</div><div class="en definition">'+esc(w.definition_en||'')+'</div><div class="source-ref">Wordlist ص 35 · Glossary ص '+printPage(w.glossary_pdf_page)+'</div></article>').join('')+'</div></details>':'';

 const linkedExercise= (x,a)=>{
  if(a.prompt?.origin!=='cambridge-digitized'||Number(a.prompt?.pdf_page)!==Number(x.pdf_page))return false;
  const found=String(a.source_reference||'').match(/-e(\d+)(?:-|$)/i);
  if(!found)return false;
  const n=Number(found[1]);
  const label=String(x.activity_label||'');
  const range=label.match(/Exercises?\s+(\d+)\s*[–-]\s*(\d+)/i);
  if(range)return n>=Number(range[1])&&n<=Number(range[2]);
  const one=label.match(/Exercise\s+(\d+)(?!\d)/i);
  return one&&n===Number(one[1]);
 };
 const mappedSourceQuestions=new Set((acts||[]).filter(a=>a.prompt?.origin==='cambridge-digitized'&&
  (sourceExercises||[]).some(x=>linkedExercise(x,a))).map(a=>a.id));
 const additionalQuestions=(acts||[]).filter(a=>!mappedSourceQuestions.has(a.id)).length;
 const hasLinkedSource=mappedSourceQuestions.size>0;
 const sourceIndex='<section class="card textbook-exercises" id="original-exercises">'+
 '<div class="study-section-heading"><div><span class="study-section-kicker">من نفس صفحات الكتاب</span><h2>تمارين الكتاب وحلولها</h2><p>شوف التمرين من الصفحة الأصلية، جرّب الإجابة، وبعدها راجع التصحيح أو النموذج.</p></div><span class="study-pill">'+(sourceExercises||[]).length+' مجموعات</span></div>'+
 ((sourceExercises||[]).map((x,i)=>{
  const waiting=x.answer_kind==='media_pending'||x.grading_mode==='media-awaited';
  const ans=answerMap[x.id],submitted=ans?.response_status==='submitted';
  const linked=(acts||[]).filter(a=>linkedExercise(x,a));
  const originalCount=linked.length;
  const hasSample=Boolean(x.model_answer_ar)&&['instructor_sample','objective_linked'].includes(x.answer_kind);
  const status=waiting?'الصوت أو الفيديو سيتم نشره':originalCount?'تصحيح تلقائي مع تفسير':hasSample?'إجابة نموذجية متاحة':'الحل قيد المراجعة';
  const rawPage=Number(x.pdf_page);
  const isGrammarOriginal=originalCount>0;
  const cropTop=isGrammarOriginal?x.pdf_page===24?510:90:0;
  const cropBottom=isGrammarOriginal?x.pdf_page===24?1460:1370:1545;
  const imagePreview='<details class="exercise-book-page"><summary>شوف صورة التمرين من الكتاب · ص '+printPage(rawPage)+'</summary><div class="textbook-figure"><div class="source-cut" data-pdf-page="'+rawPage+'" data-top="'+cropTop+'" data-bottom="'+cropBottom+'" style="aspect-ratio:1150 / '+(cropBottom-cropTop)+'"><div class="source-cut-loading">جاري تجهيز صورة الصفحة…</div></div><div class="textbook-figure-foot">'+button('افتح الصفحة كاملة','data-action="study-source-full" data-page="'+rawPage+'"')+'</div></div></details>';
  const model=hasSample?'<details class="exercise-model-answer"><summary>اعرض نموذج إجابة بعد المحاولة</summary><div class="exercise-answer-content"><span>نموذج من إعداد المعهد — وليس مفتاح Cambridge الرسمي</span><p>'+esc(x.model_answer_ar)+'</p></div></details>':'';
  const attempt=waiting?'<div class="exercise-status-note">التمرين ده محتاج الملف الأصلي. مش هنحسب درجة قبل ما يتوفر.</div>':
   originalCount?'<div class="book-original-intro"><strong>'+originalCount+' سؤال من التمرين الأصلي</strong><p>اختار إجابتك في الأسئلة التالية، واضغط «اعرف الحل والسبب» لكل سؤال.</p></div><div class="source-linked-questions" data-source-quiz-group="'+x.id+'"></div>':
    (T.user&&!T.admin?'<textarea class="field textarea" dir="auto" data-exercise-answer="'+x.id+'" maxlength="16000" placeholder="اكتب محاولتك هنا…" '+(submitted?'readonly':'')+'>'+esc(ans?.response_text||'')+'</textarea><div class="row task-actions">'+(submitted?badge('submitted'):button('حفظ مسودة','data-action="save-exercise" data-id="'+x.id+'"')+button('تسليم للمدرس','data-action="submit-exercise" data-id="'+x.id+'"'))+'</div>':'<div class="subtle">المهمة مفتوحة. إجابات الطلاب يراجعها المدرس.</div>');
  return '<article class="textbook-exercise" data-registry-exercise="'+x.id+'" data-exercise-page="'+rawPage+'" data-exercise-label="'+esc(x.activity_label)+'">'+
   '<div class="textbook-exercise-header"><span class="exercise-page-chip">ص '+printPage(rawPage)+'</span><div><h3>'+esc(x.source_title)+'</h3><p>'+esc(x.activity_label)+'</p></div></div>'+
   '<p class="exercise-instruction">'+esc(x.instruction_ar||'راجع التمرين الأصلي في صفحة الكتاب.')+'</p>'+imagePreview+
   '<div class="exercise-answer-area"><span class="exercise-status-label">'+esc(status)+'</span>'+attempt+model+
   (!waiting&&!originalCount&&!hasSample?'<div class="exercise-status-note">لسه مفيش مفتاح إجابة مُراجع لهذا النشاط. مش هنعرض حل تخميني.</div>':'')+
   (ans?.review?'<div class="feedback"><strong>مراجعة المدرس'+(ans.review.score!==null?' · '+ans.review.score+'/100':'')+'</strong><p>'+esc(ans.review.feedback_ar)+'</p></div>':'')+
   '</div></article>';
 }).join('')||'<div class="study-empty">لا توجد تمارين مفهرسة في الجزء ده.</div>')+'</section>';
 const missing=['audio','video'].includes(l.kind);
 let mediaPanel='';
 if(missing){
  const {data:assets,error:mediaError}=await db.from('media_assets').select('id,kind,original_track,storage_path,asset_status').eq('lesson_id',id).order('original_track');
  if(mediaError)notice(mediaError.message,'warning');
  const usable=(assets||[]).filter(x=>x.asset_status==='approved'&&x.storage_path);
  mediaPanel='<section class="card" style="margin-bottom:16px"><h2>'+esc(l.title)+' — ملفات الدرس</h2>'+
  ((assets||[]).length?(assets||[]).map(x=>'<div class="lesson-card"><div><strong class="en">'+esc(x.kind==='audio'?'Track '+(x.original_track||''):'Unit Video')+'</strong><div class="subtle">'+(x.asset_status==='approved'?'متاح للتشغيل':'سيتم النشر')+'</div></div>'+(x.asset_status==='approved'&&x.storage_path?button('تشغيل الملف','data-action="play-media" data-id="'+x.id+'"'):'<span class="tag draft">سيتم النشر</span>')+'<div class="media-playback" data-player="'+x.id+'"></div></div>').join(''):
  '<div class="notice warning">سيتم النشر بعد رفع ملف الصوت أو الفيديو واعتماده من لوحة الإدارة.</div>')+
  '<p class="subtle">الصوت والفيديو الأصليان مطلوبان لاختبار المهارة. الشرح والسكريبتات المنشورة في أجزاء منفصلة.</p></section>';
 }

 const lessonNumber=T.lessons.findIndex(x=>x.id===id);
 const pageRange=pages.length?'ص '+printPage(Math.min(...pages))+(pages.length>1?'–'+printPage(Math.max(...pages)):''):'الصفحة غير محددة';
 const unitName='Unit '+T.unit.number+' · '+esc(T.unit.title);
 const mediaWaiting=missing&&!mediaPanel.includes('data-action="play-media"');
 const sidebarLinks=T.lessons.map((item,i)=>{
  const selected=item.id===id;
  const ip=Array.isArray(item.content?.source_pages)?item.content.source_pages:[];
  const loc=ip.length?'ص '+printPage(Math.min(...ip))+(ip.length>1?'–'+printPage(Math.max(...ip)):''):'';
  const unavailable=['audio','video'].includes(item.kind);
  return '<button class="study-lesson-link'+(selected?' active':'')+'" type="button" data-action="lesson" data-id="'+item.id+'" '+(selected?'aria-current="page"':'')+'><span class="study-lesson-order">'+(i+1)+'</span><span class="study-lesson-info"><strong class="en">'+esc(item.title)+'</strong><small>'+loc+(unavailable?' · الميديا سيتم نشرها':'')+'</small></span>'+(selected?'<span class="active-dot" aria-hidden="true"></span>':'')+'</button>';
 }).join('');
 const sidebar='<aside class="study-sidebar"><div class="study-sidebar-header"><span class="study-rail-kicker">مسار التعلم</span><h2>'+unitName+'</h2><p>'+T.lessons.length+' أجزاء · اختار أي درس مباشرة</p></div><details class="study-nav-collapsible" '+(window.matchMedia?.("(max-width:770px)")?.matches?"":"open")+'><summary>أجزاء الوحدة <span class="study-nav-count">'+(lessonNumber+1)+' / '+T.lessons.length+'</span></summary><nav class="study-lesson-nav" aria-label="دروس الوحدة">'+sidebarLinks+'</nav></details><div class="study-sidebar-footer">'+button('العودة لكل أجزاء الوحدة','data-action="unit" data-id="'+T.unit.id+'"')+'</div></aside>';
 const exerciseSource=(T.book.slug==='listening-speaking'&&l.slug==='language')?{page:24,top:515,bottom:830,verified:true}:
  (T.book.slug==='reading-writing'&&l.slug==='grammar')?{page:29,top:575,bottom:1000,verified:true}:null;
 const practiceVisual=exerciseSource?'<div class="book-practice-source"><div><span class="study-section-kicker">من الكتاب مباشرة</span><h3>ده شكل التمرين في صفحته الأصلية</h3><p>شوف صيغة السؤال في الكتاب، وبعدها جاوب في الأسئلة التفاعلية.</p></div>'+bookCut({page:exerciseSource.page,source_clip:exerciseSource},0,'practice-slice')+'</div>':'';
 const practiceHtml='<section class="study-section practice-panel" id="lesson-practice"><div class="study-section-heading"><div><span class="study-section-kicker">تدريب إضافي من المعهد</span><h2>طبّق على اللي اتعلمته</h2><p>أسئلة مساعدة غير تمارين الكتاب المصوّرة أعلاه. كل سؤال له حل وسبب.</p></div><span class="study-pill">'+additionalQuestions+' سؤال</span></div>'+practiceVisual+(question||'<div class="study-empty">مفيش أسئلة اختيار آلي في الجزء ده. لو فيه مهمة كتابة أو نشاط من الكتاب هتلاقيه تحت.</div>')+'</section>';
 const bookSources=sources.replace('class="card compact-panel" id="book-sources"','class="card compact-panel source-book-card" id="book-sources" open');
 const studyContents='<div class="study-panel" data-study-panel="learn" role="tabpanel" id="study-panel-learn" aria-labelledby="study-tab-learn">'+
  (mediaPanel||'')+(learningBlocks.length?'':guide)+expandedGuide+originalReadings+
  '<div class="study-phase-footer">'+button('خلصت الشرح · ابدأ الحل','data-action="study-tab" data-tab="practice"')+'</div></div>'+
  '<div class="study-panel" data-study-panel="practice" role="tabpanel" id="study-panel-practice" aria-labelledby="study-tab-practice" hidden>'+
  sourceIndex+practiceHtml+workHtml+
  '<div class="study-phase-footer">'+button('راجع صفحات الكتاب','data-action="study-tab" data-tab="book"')+'</div></div>'+
  '<div class="study-panel" data-study-panel="book" role="tabpanel" id="study-panel-book" aria-labelledby="study-tab-book" hidden>'+
  '<div class="study-section-heading"><div><span class="study-section-kicker">03 · مرجع الدرس</span><h2>مكان الشرح والتمرين في الكتاب</h2><p>رقم الصفحة المطبوع فقط، وصورة المصدر في نفس الصفحة.</p></div><span class="study-pill">'+pageRange+'</span></div>'+
  bookSources+vocabularyPanel+scriptExtract+scriptReferences+
  '<div class="study-phase-footer">'+button('ارجع للشرح','data-action="study-tab" data-tab="learn"')+'</div></div>';
 const prev=lessonNumber>0?button('الدرس السابق','data-action="lesson" data-id="'+T.lessons[lessonNumber-1].id+'"'):'';
 const next=lessonNumber<T.lessons.length-1?button('الدرس التالي','data-action="lesson" data-id="'+T.lessons[lessonNumber+1].id+'"'):'';
 root.innerHTML='<div class="student-workspace">'+
  '<div class="study-topline"><div class="study-breadcrumb">'+esc(T.book.title)+' <span> / </span> '+unitName+'</div>'+button('الوحدة كاملة','data-action="unit" data-id="'+T.unit.id+'"')+'</div>'+
  '<div class="study-grid">'+sidebar+'<div class="study-main">'+
  '<header class="study-lesson-hero"><div class="study-lesson-eyebrow"><span>الدرس '+(lessonNumber+1)+' من '+T.lessons.length+'</span><span class="study-header-divider">·</span><span>'+pageRange+' من الكتاب</span></div><h1 class="en">'+esc(l.title)+'</h1><p>افهم الفكرة، جرّب تحل، وارجع لصفحة الكتاب وقت ما تحتاج.</p>'+(mediaWaiting?'<span class="study-awaiting">ملف الصوت أو الفيديو: سيتم النشر</span>':'')+'</header>'+
  '<nav class="study-tabs" role="tablist" aria-label="مراحل الدرس">'+
    '<button id="study-tab-learn" class="study-tab is-active" type="button" data-action="study-tab" data-tab="learn" role="tab" aria-selected="true" aria-controls="study-panel-learn"><span class="study-tab-index">01</span><span>الشرح</span></button>'+
    '<button id="study-tab-practice" class="study-tab" type="button" data-action="study-tab" data-tab="practice" role="tab" aria-selected="false" aria-controls="study-panel-practice"><span class="study-tab-index">02</span><span>التدريبات</span><small>'+(acts||[]).length+'</small></button>'+
    '<button id="study-tab-book" class="study-tab" type="button" data-action="study-tab" data-tab="book" role="tab" aria-selected="false" aria-controls="study-panel-book"><span class="study-tab-index">03</span><span>صفحات الكتاب</span></button>'+
  '</nav>'+
  '<div class="study-content">'+studyContents+'</div>'+
  '<nav class="study-bottom-nav" aria-label="التنقل بين الدروس">'+prev+button('قائمة الدروس','data-action="unit" data-id="'+T.unit.id+'"')+next+'</nav>'+
  '<p class="study-legal">المحتوى الأصلي معروض للمسجلين المصرح لهم. الشروح الإضافية من إعداد المعهد.</p>'+
  '</div></div></div>';
 placeOriginalBookQuestions();
  initializeQuestionPager();
 initializeSourceCuts();
}

async function loadSourceCut(el){
 if(!el||el.dataset.loading==='1'||el.dataset.loaded==='1')return;
 if(!T.book||!T.unit||!T.session?.access_token)return;
 const page=Number(el.dataset.pdfPage),top=Number(el.dataset.top);
 if(!Number.isInteger(page)||!Number.isFinite(top)||page<1||page>250)return;
 el.dataset.loading='1';
 const prefix=T.book.slug==='listening-speaking'?'ls':'rw';
 const path=T.book.slug+'/u'+T.unit.number+'/source/'+prefix+'-'+String(page).padStart(3,'0')+'.webp';
 try{
  const response=await fetch(cfg.url+'/functions/v1/get-course-file',{
   method:'POST',headers:{
    'Content-Type':'application/json','Authorization':'Bearer '+T.session.access_token,
    'apikey':cfg.publishableKey
   },body:JSON.stringify({path})
  });
  if(!response.ok)throw new Error('الصفحة غير متاحة للحساب الحالي');
  const data=await response.json();
  const signed=new URL(String(data.url||''));
  if(signed.protocol!=='https:'||signed.hostname!==new URL(cfg.url).hostname)throw new Error('رابط غير موثوق');
  if(!el.isConnected)return;
  const image=document.createElement('img');
  image.src=signed.href;
  image.alt='جزء أصلي من الصفحة '+printPage(page)+' في الكتاب';
  image.loading='eager';
  image.decoding='async';
  image.style.transform='translateY(-'+(top/1545*100).toFixed(5)+'%)';
  image.addEventListener('load',()=>{if(el.isConnected){el.dataset.loaded='1';el.querySelector('.source-cut-loading')?.remove();}});
  image.addEventListener('error',()=>{if(el.isConnected){el.dataset.loading='0';el.dataset.loaded='0';el.innerHTML='<div class="source-cut-error">تعذر عرض قصاصة الصفحة '+printPage(page)+' '+button('أعد المحاولة','data-action="retry-source-cut"')+'</div>'; }});
  el.replaceChildren(image);
 }catch(error){
  if(el.isConnected)el.innerHTML='<div class="source-cut-error"><span>تعذر عرض الصفحة '+printPage(page)+'</span>'+button('أعد المحاولة','data-action="retry-source-cut"')+'</div>';
 }finally{el.dataset.loading='0';}
}

function openSourceZoom(buttonElement){
 const figure=buttonElement?.closest('.textbook-figure');
 const cut=figure?.querySelector('.source-cut');
 if(!cut)return;
 if(!cut.querySelector('img')){loadSourceCut(cut);notice('جاري تجهيز الصورة، اضغط على تكبير بعد ظهورها.');return;}
 document.getElementById('source-cut-dialog')?.remove();
 const dialog=document.createElement('dialog');
 dialog.className='crop-zoom-dialog';
 dialog.id='source-cut-dialog';
 dialog.innerHTML='<div class="crop-zoom-header"><strong>تكبير الجزء من صفحة الكتاب</strong><button type="button" class="button" data-action="close-source-zoom">إغلاق</button></div><p>حرّك الصورة يمينًا ويسارًا لقراءة النص بوضوح. دي قصاصة من النسخة الأصلية، من غير تغيير.</p><div class="crop-zoom-scroll"></div>';
 const clone=cut.cloneNode(true);
 clone.classList.add('zoomed-cut');
 clone.removeAttribute('data-loading');
 dialog.querySelector('.crop-zoom-scroll').appendChild(clone);
 document.body.appendChild(dialog);
 dialog.addEventListener('close',()=>dialog.remove(),{once:true});
 dialog.showModal();
}
function initializeSourceCuts(){
 const slices=[...document.querySelectorAll('.student-workspace .source-cut')];
 if(!slices.length)return;
 if(!('IntersectionObserver' in window)){slices.forEach(el=>loadSourceCut(el));return;}
 const observer=new IntersectionObserver(entries=>{
  for(const entry of entries){
   if(entry.isIntersecting){
    observer.unobserve(entry.target);
    loadSourceCut(entry.target);
   }
  }
 },{rootMargin:'380px 0px',threshold:0});
 slices.forEach(el=>observer.observe(el));
}

function placeOriginalBookQuestions(){
 const view=document.querySelector('.student-workspace');
 if(!view)return;
 for(const reg of view.querySelectorAll('[data-registry-exercise]')){
  const page=Number(reg.dataset.exercisePage);
  const label=String(reg.dataset.exerciseLabel||'');
  const range=label.match(/Exercises?\s+(\d+)\s*[–-]\s*(\d+)/i);
  const one=label.match(/Exercise\s+(\d+)(?!\d)/i);
  const target=reg.querySelector('[data-source-quiz-group]');
  if(!target)continue;
  for(const quiz of view.querySelectorAll('#lesson-practice .quiz[data-book-origin="cambridge-digitized"]')){
   if(Number(quiz.dataset.bookPdfPage)!==page)continue;
   const found=String(quiz.dataset.bookRef||'').match(/-e(\d+)(?:-|$)/i);
   if(!found)continue;
   const ex=Number(found[1]);
   if(!(range&&ex>=Number(range[1])&&ex<=Number(range[2]))&&!(one&&ex===Number(one[1])))continue;
   target.appendChild(quiz);
  }
 }
}
function initializeQuestionPager(){
 const container=document.getElementById('lesson-practice');
 if(!container)return;
 const qs=[...container.querySelectorAll('.quiz[data-question-id]')];
 if(qs.length<=1)return;
 container.dataset.questionIndex="0";
 qs.forEach((el,i)=>{el.hidden=i!==0;});
 const nav=document.createElement('div');
 nav.className="study-question-pager";
 nav.innerHTML='<button type="button" class="button" data-action="quiz-nav" data-step="-1">السؤال السابق</button><span class="study-quiz-position" aria-live="polite">سؤال 1 من '+qs.length+'</span><button type="button" class="button primary" data-action="quiz-nav" data-step="1">السؤال التالي</button>';
 container.appendChild(nav);
 nav.querySelector('[data-step="-1"]').disabled=true;
}
function navigateQuestion(step){
 const container=document.getElementById('lesson-practice');
 if(!container||!Number.isInteger(step))return;
 const qs=[...container.querySelectorAll('.quiz[data-question-id]')];
 if(!qs.length)return;
 const old=Number(container.dataset.questionIndex)||0;
 const index=Math.max(0,Math.min(qs.length-1,old+step));
 container.dataset.questionIndex=String(index);
 qs.forEach((q,i)=>q.hidden=i!==index);
 const nav=container.querySelector('.study-question-pager');
 if(nav){
  const label=nav.querySelector('.study-quiz-position');
  if(label)label.textContent='سؤال '+(index+1)+' من '+qs.length;
  const prev=nav.querySelector('[data-step="-1"]'),next=nav.querySelector('[data-step="1"]');
  if(prev)prev.disabled=index===0;
  if(next)next.disabled=index===qs.length-1;
 }
 container.querySelector('.study-section-heading')?.scrollIntoView({block:'start',behavior:'auto'});
}
function showStudyTab(tab){
 if(!['learn','practice','book'].includes(tab))return;
 const view=document.querySelector('.student-workspace');
 if(!view)return;
 view.querySelectorAll('[data-study-panel]').forEach(el=>{el.hidden=el.dataset.studyPanel!==tab;});
 view.querySelectorAll('.study-tab[data-tab]').forEach(el=>{
  const active=el.dataset.tab===tab;
  el.classList.toggle('is-active',active);
  el.setAttribute('aria-selected',String(active));
  el.tabIndex=0;
 });
 view.querySelectorAll('.study-panel:not([hidden]) .source-cut').forEach(el=>loadSourceCut(el));
 view.querySelector('.study-tabs')?.scrollIntoView({block:'start',behavior:'auto'});
}

 async function grade(id,el){
 const box=el.closest('[data-question-id]'),selected=box.querySelector('input[type=radio]:checked'),free=box.querySelector('[data-response]'),answer=free?free.value.trim():selected?Number(selected.value):null;
 if(answer===null||answer===''){notice('اختار أو اكتب إجابتك الأول','warning');return;}
 if(!T.session?.access_token){notice('سجّل الدخول','warning');return;}
 el.disabled=true;
 const response=await fetch(cfg.url+'/functions/v1/grade-activity',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+T.session.access_token,'apikey':cfg.publishableKey},body:JSON.stringify({activityId:id,answer})}).catch(()=>null);
 el.disabled=false;
 const data=response?await response.json().catch(()=>({})):{};
 const slot=box.querySelector('.feedback-slot');
 if(!response?.ok){slot.innerHTML='<div class="feedback bad">تعذر التصحيح: '+esc(data.error||'تأكد من اكتمال نشر النشاط أو صلاحية حسابك')+'</div>';return;}
 const chosen=selected?selected.closest('.choice')?.querySelector('span')?.textContent:free?.value||'';
 const correctText=data.answer?.index!==undefined?
  (box.querySelectorAll('.choice span')[data.answer.index]?.textContent||''):
  String(data.answer?.text||'');
 const specific=data.explanation?.wrong?.[String(answer)];
 const why=data.correct?
  (data.explanation?.general||'الإجابة صحيحة؛ راجع القاعدة للتثبيت.'):
  (specific||data.explanation?.incorrect||data.explanation?.general||'راجع سياق السؤال والقاعدة المستخدمة.');
 box.querySelectorAll('.choice').forEach((x,i)=>{
   x.classList.toggle('answer-correct',i===data.answer?.index);
   x.classList.toggle('answer-wrong',!data.correct&&i===answer);
 });
 slot.innerHTML='<div class="feedback answer-feedback '+(data.correct?'good':'bad')+'">'+
 '<strong>'+(data.correct?'✓ ممتاز! إجابة صحيحة':'✕ الإجابة دي مش صحيحة')+'</strong>'+
 (!data.correct?'<p><b>إجابتك:</b> <span class="en">'+esc(chosen)+'</span></p>':'')+
 '<p><b>الحل الصحيح:</b> <span class="en">'+esc(correctText)+'</span></p>'+
 '<div class="feedback-reason"><b>ليه؟</b> '+esc(why)+'</div>'+
 (data.correct?'<p class="subtle">كمّل على السؤال اللي بعده.</p>':'<p class="subtle">اقرأ سبب الاختيار، وبعدها جرّب سؤالًا مشابهًا.</p>')+
 '</div>';
}




async function saveIndexedExercise(id,submit=false){
 if(!T.user||T.admin||!T.lesson){notice('سجل بحساب طالب لحفظ التدريب','warning');return;}
 const area=document.querySelector('[data-exercise-answer="'+id+'"]');
 const answer=area?.value?.trim()||'';
 if(!answer){notice('اكتب إجابتك الأول','warning');return;}
 if(answer.length>16000){notice('الإجابة أطول من الحد المسموح','warning');return;}
 const {data:existing,error:lookupError}=await db.from('exercise_responses').select('id,response_status').eq('exercise_id',id).eq('student_id',T.user.id).maybeSingle();
 if(lookupError){notice(lookupError.message,'warning');return;}
 if(existing?.response_status==='submitted'){notice('الإجابة دي اتسلّمت بالفعل','warning');return;}
 if(submit&&!confirm('تأكيد تسليم الإجابة للمراجعة؟ بعد التسليم مش هتقدر تعدّلها.'))return;
 let err=null;
 if(existing){
  ({error:err}=await db.from('exercise_responses').update({response_text:answer,response_status:submit?'submitted':'draft',updated_at:new Date().toISOString()}).eq('id',existing.id));
 }else{
  const result=await db.from('exercise_responses').insert({student_id:T.user.id,exercise_id:id,response_text:answer,response_status:'draft'});
  err=result.error;
  if(!err&&submit){
   const lookup=await db.from('exercise_responses').select('id').eq('exercise_id',id).eq('student_id',T.user.id).single();
   if(lookup.error)err=lookup.error;
   else ({error:err}=await db.from('exercise_responses').update({response_status:'submitted',updated_at:new Date().toISOString()}).eq('id',lookup.data.id));
  }
 }
 if(err){notice('فشل حفظ الإجابة: '+err.message,'warning');return;}
 notice(submit?'تم تسليم النشاط للمراجعة':'تم حفظ الإجابة');
 await lessonPage(T.lesson.id);
}

async function playMedia(id){
 if(!T.user||!T.session?.access_token){notice('تسجيل الدخول مطلوب','warning');return;}
 const {data:asset,error}=await db.from('media_assets').select('id,kind,asset_status,storage_path').eq('id',id).maybeSingle();
 if(error||asset?.asset_status!=='approved'||!asset.storage_path){notice('سيتم النشر بعد اعتماد الملف','warning');return;}
 const response=await fetch(cfg.url+'/functions/v1/get-course-file',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+T.session.access_token,'apikey':cfg.publishableKey},body:JSON.stringify({path:asset.storage_path})}).catch(()=>null);
 const data=response?await response.json().catch(()=>({})):{};
 if(!response?.ok||!data.url){notice('تعذر فتح الملف — تحقق من صلاحيات الكتاب','warning');return;}
 const holder=document.querySelector('[data-player="'+id+'"]');if(!holder)return;
 const tag=asset.kind==='video'?'video':'audio';
 const player=document.createElement(tag);player.controls=true;player.preload='metadata';player.src=data.url;
 player.style.maxWidth='100%';player.style.width=tag==='video'?'min(100%,500px)':'min(100%,380px)';
 player.setAttribute('aria-label',asset.kind==='video'?'فيديو الدرس':'تسجيل الدرس');
 holder.replaceChildren(player);
}
async function sourcePage(page){
 if(!T.user||!T.unit||!T.book||!T.session?.access_token){notice('يلزم تسجيل الدخول لعرض المصدر','warning');return;}
 const prefix=T.book.slug==='listening-speaking'?'ls':'rw';
 const path=T.book.slug+'/u'+T.unit.number+'/source/'+prefix+'-'+String(page).padStart(3,'0')+'.webp';
 const response=await fetch(cfg.url+'/functions/v1/get-course-file',{
  method:'POST',
  headers:{'Content-Type':'application/json','Authorization':'Bearer '+T.session.access_token,'apikey':cfg.publishableKey},
  body:JSON.stringify({path})
 }).catch(()=>null);
 const data=response?await response.json().catch(()=>({})):{};
 const holder=document.getElementById('source-availability');
 if(!holder)return;
 if(!response?.ok){holder.innerHTML='<div class="notice warning">صفحة '+Number(page)+' لسه مش مرفوعة في التخزين الخاص، أو حسابك غير مصرح له. </div>';return;}
 const signed=String(data.url||'');
 let approvedUrl;
 try{
  approvedUrl=new URL(signed);
  if(approvedUrl.protocol!=='https:'||approvedUrl.hostname!==new URL(cfg.url).hostname)throw new Error('Unexpected file URL');
 }catch{
  holder.innerHTML='<div class="notice warning">تعذر فتح صورة الكتاب بأمان، حاول تاني.</div>';
  return;
 }
 const printed=printPage(page);
 holder.innerHTML='<figure class="source-page-preview"><div class="source-preview-head"><strong>ص '+printed+' من الكتاب</strong><a href="'+esc(signed)+'" target="_blank" rel="noopener noreferrer">فتح الصورة بحجم كامل</a></div><img src="'+esc(signed)+'" alt="صورة صفحة '+printed+' من الكتاب المطبوع" loading="lazy" decoding="async"><figcaption>صورة الصفحة الأصلية للرجوع للتعليمات والأمثلة. رابط التكبير مؤقت ومحمي.</figcaption></figure>';
 holder.querySelector('img')?.addEventListener('error',()=>{
  holder.insertAdjacentHTML('beforeend','<div class="notice warning">تعذر تحميل الصورة الآن. استخدم رابط التكبير أو حاول مرة أخرى.</div>');
 });
}

async function saveWork(submit=false){
 if(!T.user||T.admin||!T.lesson){notice('لا يمكن حفظ هذه المسودة','warning');return;}
 const body=document.getElementById('lesson-work')?.value?.trim()||'';
 if(!body){notice('اكتب إجابتك قبل الحفظ','warning');return;}
 if(body.length>20000){notice('النص طويل جدًا','warning');return;}
 const {data:existing,error:readErr}=await db.from('lesson_work').select('id,submission_status').eq('lesson_id',T.lesson.id).eq('student_id',T.user.id).maybeSingle();
 if(readErr){notice(readErr.message,'warning');return;}
 if(existing?.submission_status==='submitted'){notice('الإجابة مسلّمة بالفعل ولا يمكن تعديلها','warning');return;}
 if(submit&&!confirm('هل تريد تسليم هذه الإجابة للمدرس؟ لن تستطيع تعديلها بعد التسليم.'))return;
 let error;
 if(existing?.id){({error}=await db.from('lesson_work').update({body,submission_status:submit?'submitted':'draft',updated_at:new Date().toISOString()}).eq('id',existing.id));}
 else {
  const r=await db.from('lesson_work').insert({lesson_id:T.lesson.id,student_id:T.user.id,body,submission_status:'draft'});
  error=r.error;
  if(!error&&submit){
   const row=await db.from('lesson_work').select('id').eq('lesson_id',T.lesson.id).eq('student_id',T.user.id).single();
   if(row.error)error=row.error;
   else ({error}=await db.from('lesson_work').update({submission_status:'submitted',updated_at:new Date().toISOString()}).eq('id',row.data.id));
  }
 }
 if(error){notice('لم يُحفظ العمل: '+error.message,'warning');return;}
 notice(submit?'تم تسليم الإجابة للمدرس':'تم حفظ المسودة في حساب الطالب');
 await lessonPage(T.lesson.id);
}
async function resultsPage(){
 if(!T.user||T.admin){home();return;}
 const [a,w]=await Promise.all([
  db.from('attempts').select('id,score,created_at').eq('student_id',T.user.id).order('created_at',{ascending:false}).limit(100),
  db.from('lesson_work').select('id,submission_status,updated_at').eq('student_id',T.user.id).order('updated_at',{ascending:false}).limit(100)
 ]);
 if(a.error||w.error){notice((a.error||w.error).message,'warning');return;}
 const attempts=a.data||[],works=w.data||[],graded=attempts.filter(x=>x.score!==null&&x.score!==undefined);
 frame('نتائجك وتقدمك','درجات الأسئلة المعتمدة من خادم التصحيح · مسودات الكتابة والتحدث والمراجعة',
 '<div class="cols"><div class="card"><h2>أسئلة تم تصحيحها</h2><div class="en title">'+graded.length+'</div><p>الصحيح: '+graded.filter(x=>Number(x.score)===1).length+'</p></div>'+
 '<div class="card"><h2>مهام تم تسليمها</h2><div class="en title">'+works.filter(x=>x.submission_status==='submitted').length+'</div><p>المسودات المحفوظة: '+works.filter(x=>x.submission_status==='draft').length+'</p></div></div>'+
 '<div class="card" style="margin-top:16px"><h2>معرّف حسابك للتسجيل في الكتاب</h2><p class="en">'+esc(T.user.id)+'</p></div>'+
 '<div class="card" style="margin-top:16px"><h2>أحدث المحاولات</h2><div class="list">'+(attempts.map(x=>'<div class="lesson-card"><span>'+esc(new Date(x.created_at).toLocaleString('ar-EG'))+'</span><span class="tag '+(Number(x.score)===1?'ok':'draft')+'">'+(x.score===null?'بانتظار التصحيح':Number(x.score)===1?'صحيح':'خطأ')+'</span></div>').join('')||'<div class="empty">مفيش محاولات محفوظة لسه.</div>')+'</div></div>');
}

async function reviewIndexedExercisesPage(){
 if(!T.admin)return;
 const {data:answers,error}=await db.from('exercise_responses').select('id,exercise_id,student_id,response_text,updated_at').eq('response_status','submitted').order('updated_at',{ascending:false}).limit(100);
 if(error){notice(error.message,'warning');return;}
 const ids=(answers||[]).map(x=>x.id),eids=[...new Set((answers||[]).map(x=>x.exercise_id))];
 const [{data:feedback},{data:source}]=await Promise.all([
  ids.length?db.from('exercise_feedback').select('response_id,score,feedback_ar').in('response_id',ids):{data:[]},
  eids.length?db.from('exercise_registry').select('id,pdf_page,source_title,activity_label').in('id',eids):{data:[]}
 ]);
 const byFeedback=Object.fromEntries((feedback||[]).map(x=>[x.response_id,x]));
 const bySource=Object.fromEntries((source||[]).map(x=>[x.id,x]));
 const body=(answers||[]).map(x=>{
  const v=byFeedback[x.id]||{},ex=bySource[x.exercise_id]||{};
  return '<article class="card"><div class="source-ref">صفحة '+printPage(ex.pdf_page)+' · '+esc(ex.source_title||'')+' · '+esc(ex.activity_label||'')+'</div><div class="subtle">Student: '+esc(x.student_id.slice(0,8))+'...</div><p class="en original-text">'+esc(x.response_text)+'</p><label class="field-label">الدرجة (0 إلى 100 أو فارغة دون درجة)</label><input type="number" min="0" max="100" step=".5" class="field" style="max-width:180px" data-indexed-score="'+x.id+'" value="'+esc(v.score??'')+'"><label class="field-label">تفسير للطالب وملاحظات التحسين</label><textarea class="field textarea" data-indexed-feedback="'+x.id+'" dir="auto">'+esc(v.feedback_ar||'')+'</textarea><button class="button primary" data-action="save-indexed-feedback" data-id="'+x.id+'">حفظ التقييم</button></article>';
 }).join('');
 frame('مراجعة تمارين الكتاب','إجابات الطلاب المفتوحة — مكان النشاط والصفحة الأصلية مع الدرجة والملاحظات',
  '<div class="row">'+button('رجوع للأدمن','data-action="admin"')+'</div><div class="stack" style="margin-top:16px">'+(body||'<div class="empty">لا توجد إجابات تم تسليمها حتى الآن.</div>')+'</div>');
}
async function saveIndexedFeedback(id){
 if(!T.admin||!T.user)return;
 const scoreEl=document.querySelector('[data-indexed-score="'+id+'"]'),commentEl=document.querySelector('[data-indexed-feedback="'+id+'"]');
 const score=scoreEl?.value===''?null:Number(scoreEl?.value);
 const feedback=commentEl?.value?.trim()||'';
 if(score!==null&&(!Number.isFinite(score)||score<0||score>100)){notice('أدخل درجة من 0 إلى 100','warning');return;}
 if(!feedback){notice('اكتب للطالب شرحًا واضحًا للمراجعة','warning');return;}
 const {data:old,error:lookupErr}=await db.from('exercise_feedback').select('response_id').eq('response_id',id).maybeSingle();
 if(lookupErr){notice(lookupErr.message,'warning');return;}
 const payload={score,feedback_ar:feedback,reviewed_at:new Date().toISOString()};
 const {error}=old?await db.from('exercise_feedback').update(payload).eq('response_id',id):
 await db.from('exercise_feedback').insert({...payload,response_id:id,reviewer_id:T.user.id});
 if(error){notice('تعذر حفظ المراجعة: '+error.message,'warning');return;}
 notice('تم حفظ التقييم');await reviewIndexedExercisesPage();
}
async function reviewsPage(){
 if(!T.admin)return;
 const {data:works,error}=await db.from('lesson_work').select('id,student_id,lesson_id,body,submission_status,updated_at').eq('submission_status','submitted').order('updated_at',{ascending:false}).limit(100);
 if(error){notice(error.message,'warning');return;}
 const ids=(works||[]).map(x=>x.id);
 const {data:reviews}=ids.length?await db.from('lesson_work_reviews').select('work_id,score,feedback_ar').in('work_id',ids):{data:[]};
 const byId=Object.fromEntries((reviews||[]).map(x=>[x.work_id,x]));
 frame('مراجعة أعمال الطلاب','Speaking · Writing · Critical Thinking — الدرجة لا تعتمد آليًا دون تقييم المدرس',
 '<div class="row" style="margin-bottom:14px">'+button('رجوع للإدارة','data-action="admin"')+'</div><div class="stack">'+((works||[]).map(x=>{const v=byId[x.id]||{};return '<article class="card"><div class="subtle">Student ID: '+esc(x.student_id.slice(0,8))+'… · Lesson: '+esc(x.lesson_id.slice(0,8))+'…</div><div class="en" style="white-space:pre-wrap;margin:12px 0">'+esc(x.body)+'</div><label class="field-label">الدرجة من 100</label><input class="field" style="max-width:160px" type="number" min="0" max="100" step=".5" data-review-score="'+x.id+'" value="'+esc(v.score??'')+'"><label class="field-label">التعليق اللغوي والتربوي</label><textarea class="field textarea" dir="auto" data-review-feedback="'+x.id+'">'+esc(v.feedback_ar??'')+'</textarea><button class="button primary" data-action="save-review" data-id="'+x.id+'">حفظ التقييم</button></article>'}).join('')||'<div class="empty">لا توجد مهام تم تسليمها حتى الآن.</div>')+'</div>');
}
async function saveReview(id){
 if(!T.user||!T.admin)return;
 const input=document.querySelector('[data-review-score="'+id+'"]'),ta=document.querySelector('[data-review-feedback="'+id+'"]');
 const score=input?.value===''?null:Number(input?.value);
 if(score!==null&&(!Number.isFinite(score)||score<0||score>100)){notice('الدرجة من 0 إلى 100','warning');return;}
 if(!ta?.value?.trim()){notice('اكتب ملاحظات مفيدة للطالب','warning');return;}
 const {data:previous,error:lookupError}=await db.from('lesson_work_reviews').select('id').eq('work_id',id).maybeSingle();
 if(lookupError){notice(lookupError.message,'warning');return;}
 const {error}=previous
  ?await db.from('lesson_work_reviews').update({score,feedback_ar:ta.value.trim(),reviewed_at:new Date().toISOString()}).eq('id',previous.id)
  :await db.from('lesson_work_reviews').insert({work_id:id,reviewer_id:T.user.id,score,feedback_ar:ta.value.trim(),reviewed_at:new Date().toISOString()});
 if(error){notice('تعذر حفظ التقييم: '+error.message,'warning');return;}
 notice('اتحفظ تقييم الطالب');await reviewsPage();
}



async function enrollStudent(){
 if(!T.admin||!T.user)return;
 const id=document.getElementById('enroll-student-id')?.value?.trim()||'';
 const bookId=document.getElementById('enroll-book-id')?.value||'';
 if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)){notice('ادخل User ID صحيح','warning');return;}
 const {error}=await db.from('enrollments').insert({student_id:id,book_id:bookId});
 if(error){notice('تعذر تسجيل الطالب: '+error.message,'warning');return;}
 notice('تم تسجيل الطالب في الكتاب المحدد، دون تغيير تسجيله في الكتاب الآخر');await adminPage();
}

async function uploadMedia(id){
 if(!T.admin||!T.user)return;
 const file=document.querySelector('[data-media-file="'+id+'"]')?.files?.[0];
 if(!file){notice('اختار ملف الصوت أو الفيديو أولًا','warning');return;}
 if(file.size>100*1024*1024){notice('الملف أكبر من 100 MB، يحتاج تجهيز خاص','warning');return;}
 const {data:asset,error:findError}=await db.from('media_assets').select('id,kind,lesson_id,original_track,storage_path,asset_status').eq('id',id).single();
 if(findError||!asset){notice('خانة الميديا غير موجودة','warning');return;}
 const {data:lesson}=await db.from('lessons').select('id,unit_id').eq('id',asset.lesson_id).single();
 const {data:unit}=await db.from('units').select('id,number,book_id').eq('id',lesson?.unit_id||'00000000-0000-0000-0000-000000000000').single();
 const {data:book}=await db.from('books').select('slug').eq('id',unit?.book_id||'00000000-0000-0000-0000-000000000000').single();
 if(!book||!unit){notice('تعذر العثور على الكتاب والوحدة','warning');return;}
 const ext=file.name.split('.').pop()?.toLowerCase();
 const okExt=asset.kind==='audio'?['mp3','m4a','wav','ogg']:['mp4','webm','mov'];
 if(!okExt.includes(ext)){notice('صيغة الملف غير مدعومة','warning');return;}
 const name=asset.kind==='audio'?'track-'+String(asset.original_track||'unassigned').replace(/[^a-zA-Z0-9.]/g,'')+'.'+ext:'unit'+unit.number+'.'+ext;
 const path=book.slug+'/u'+unit.number+'/'+asset.kind+'/'+name;
 const {error:uploadError}=await db.storage.from('unlock-course-media').upload(path,file,{upsert:true,contentType:file.type||undefined});
 if(uploadError){notice('فشل رفع الملف: '+uploadError.message,'warning');return;}
 const {error:updateError}=await db.from('media_assets').update({storage_path:path,asset_status:'uploaded',uploaded_at:new Date().toISOString()}).eq('id',id);
 if(updateError){notice('الملف وصل، لكن ربطه بالنشاط فشل: '+updateError.message,'warning');return;}
 notice('تم رفع الملف، وحالته Uploaded لحين المراجعة');await adminPage();
}

async function approveMedia(id){
 if(!T.admin||!T.user)return;
 const {data:asset,error}=await db.from('media_assets').select('id,storage_path,asset_status').eq('id',id).single();
 if(error||!asset?.storage_path){notice('ارفع الملف أولًا قبل اعتماده','warning');return;}
 if(!confirm('هل تم الاستماع/المشاهدة والتحقق من الملف وربطه بالدرس الصحيح؟'))return;
 const {error:upd}=await db.from('media_assets').update({asset_status:'approved'}).eq('id',id);
 if(upd){notice('تعذر اعتماد الملف: '+upd.message,'warning');return;}
 notice('تم اعتماد الملف. يمكنك الآن مراجعة نشر الدرس.');await adminPage();
}

async function loadPrivateZipReader(){
 if(window.JSZip)return window.JSZip;
 await new Promise((resolve,reject)=>{
  const script=document.createElement('script');
  script.src='https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js';
  script.async=true;script.onload=resolve;script.onerror=()=>reject(new Error('تعذر تحميل أداة فتح ZIP'));
  document.head.appendChild(script);
 });
 if(!window.JSZip)throw new Error('لم يتم تحميل أداة فتح الملفات');
 return window.JSZip;
}
async function uploadSources(){
 if(!T.admin){notice('رفع الصور متاح للأدمن فقط','warning');return;}
 const picked=[...(document.getElementById('source-files')?.files||[])];
 const selectBook=document.getElementById('source-book')?.value;
 const status=document.getElementById('source-upload-status');
 const btn=document.querySelector('[data-action="upload-sources"]');
 if(!picked.length){notice('اختار ملف ZIP أو صور WEBP أولًا','warning');return;}
 let done=0,fail=0,skipped=0,total=0;
 const failures=[];
 if(btn)btn.disabled=true;
 const progress=msg=>{if(status)status.textContent=msg;};
 try{
  let pages=[];
  for(const file of picked){
   if(/\.zip$/i.test(file.name)){
    if(file.size>80*1024*1024)throw new Error('الأرشيف أكبر من الحد المسموح (80 MB)');
    progress('جاري فتح الملف المضغوط، وتجهيز صور الوحدة...');
    const JSZip=await loadPrivateZipReader();
    const archive=await JSZip.loadAsync(file);
    const entries=Object.values(archive.files).filter(x=>!x.dir&&/\.webp$/i.test(x.name));
    if(entries.length>150)throw new Error('عدد الصور في الأرشيف أكبر من 150');
    for(const entry of entries){
     const filename=entry.name.split('/').pop()?.toLowerCase()||'';
     if(!/^(ls|rw)-\d{3}\.webp$/.test(filename)){skipped++;continue;}
     const bytes=await entry.async('uint8array');
     if(bytes.byteLength>8*1024*1024){fail++;failures.push(filename+' (أكبر من 8 MB)');continue;}
     pages.push({filename,blob:new Blob([bytes],{type:'image/webp'})});
    }
   }else if(/\.webp$/i.test(file.name)){
    pages.push({filename:file.name.toLowerCase(),blob:file});
   }else skipped++;
  }
  if(!pages.length)throw new Error('الملف لا يحتوي على صور WEBP بأسماء ls-016.webp أو rw-016.webp');
  for(const entry of pages){
   const found=entry.filename.match(/^(ls|rw)-(\d{3})\.webp$/);
   if(!found){fail++;failures.push(entry.filename);continue;}
   const prefix=found[1],page=Number(found[2]);
   const book=prefix==='ls'?'listening-speaking':'reading-writing';
   const permitted=(page>=16&&page<=37)||
    (prefix==='ls'?[194,196,198,206,207].includes(page):[192,193,206,207,208].includes(page));
   if(!permitted||entry.blob.size>8*1024*1024){
    fail++;failures.push(entry.filename+' (رقم صفحة/حجم غير مناسب)');continue;
   }
   if(picked.every(x=>!x.name.toLowerCase().endsWith('.zip'))&&book!==selectBook){
    fail++;failures.push(entry.filename+' (اختار الكتاب المناسب)');continue;
   }
   total++;
   progress('رفع '+(done+fail+1)+' من '+pages.length+' · نجح '+done+' · تعذر '+fail);
   const path=book+'/u1/source/'+entry.filename;
   const {error}=await db.storage.from('unlock-course-media').upload(path,entry.blob,{
    upsert:true,contentType:'image/webp',cacheControl:'3600'
   });
   if(error){fail++;failures.push(entry.filename+': '+error.message);}
   else done++;
   progress('تم رفع '+done+' صورة · فشل '+fail+(skipped?' · تجاهل '+skipped+' ملف غير مطلوب':''));
  }
  if(failures.length)progress('نجح '+done+'، تعذر '+fail+'. التفاصيل: '+failures.slice(0,4).join(' | '));
  notice('صور Unit 1: تم رفع '+done+' ملفًا إلى Supabase الخاص؛ تعذر '+fail+'.');
 }catch(err){
  progress('تعذر استكمال رفع الصور: '+err.message);
  notice('فشل رفع الصور: '+err.message,'warning');
 }finally{
  if(btn)btn.disabled=false;
 }
}

async function adminPage(){
 if(!T.user||!T.admin){notice('هذه الصفحة مخصصة لصلاحية الإدارة الموثقة','warning');return;}
 const [booksR,unitsR,lessonsR,activitiesR,vocabR,mediaR,registryR]=await Promise.all([
  db.from('books').select('id,title,slug,status,position').order('position'),
  db.from('units').select('id,book_id,number,title,status').order('book_id').order('number'),
  db.from('lessons').select('id,unit_id,title,slug,status,position').order('position'),
  db.from('activities').select('id,lesson_id,status,source_reference'),
  db.from('vocabulary').select('id,unit_id,status'),
  db.from('media_assets').select('id,lesson_id,kind,original_track,asset_status,storage_path'),
  db.from('exercise_registry').select('id,lesson_id,pdf_page,source_title,activity_label,grading_mode,conversion_status,answer_kind,model_answer_ar').order('pdf_page')
 ]);
 const results=[booksR,unitsR,lessonsR,activitiesR,vocabR,mediaR,registryR];
 if(results.some(x=>x.error)){notice('تعذر فتح لوحة الأدمن: '+(results.find(x=>x.error)?.error?.message||''),'warning');return;}
 const books=booksR.data||[],units=unitsR.data||[],lessons=lessonsR.data||[],activities=activitiesR.data||[],words=vocabR.data||[],media=mediaR.data||[],registry=registryR.data||[];
 const stateOpts=(status)=>['draft','review','published'].map(x=>'<option value="'+x+'" '+(status===x?'selected':'')+'>'+x+'</option>').join('');
 const selector=(table,id,status,disabled=false)=>'<div class="row"><select class="field" style="width:auto" data-state-select="'+table+'-'+id+'" aria-label="حالة النشر">'+stateOpts(status)+'</select><button type="button" class="button small" data-action="admin-update" data-table="'+table+'" data-id="'+id+'" '+(disabled?'disabled':'')+'>حفظ</button></div>';
 let cards=books.map(b=>{
  let bus=units.filter(u=>u.book_id===b.id),ls=lessons.filter(l=>bus.some(u=>u.id===l.unit_id));
  return '<details class="card admin-book" '+(b.slug==='listening-speaking'?'open':'')+'><summary><span class="en">'+esc(b.title)+'</span> · '+bus.length+' Units</summary><div class="row" style="margin:12px 0">'+selector('books',b.id,b.status)+button('معاينة الكتاب كطالب','data-action="admin-preview-book" data-id="'+b.id+'"')+'</div>'
   +bus.map(u=>{
     const uls=ls.filter(l=>l.unit_id===u.id),vocab=words.filter(w=>w.unit_id===u.id),q=activities.filter(a=>uls.some(l=>l.id===a.lesson_id));
     return '<details class="admin-unit" '+(u.number===1?'open':'')+'><summary>Unit '+u.number+' · '+esc(u.title)+'</summary><div class="row" style="margin:8px 0">'+selector('units',u.id,u.status)+'</div><p class="subtle">الأقسام: '+uls.length+' · الأسئلة: '+q.length+' · المفردات: '+vocab.length+'</p>'
     +uls.map(l=>{const lmedia=media.filter(m=>m.lesson_id===l.id),qm=q.filter(a=>a.lesson_id===l.id);return '<div class="lesson-card" style="margin:7px 0"><div><strong class="en">'+esc(l.title)+'</strong><div class="subtle">'+qm.length+' questions · '+registry.filter(x=>x.lesson_id===l.id).length+' source entries '+(lmedia.length?' · '+lmedia.map(m=>esc(m.kind+':'+(m.original_track||'video')+'='+m.asset_status)).join(', '):'')+'</div></div>'+selector('lessons',l.id,l.status)+'</div>'+qm.map(a=>'<div class="lesson-card" style="margin:5px 0 5px 15px"><div><span class="subtle">'+esc(a.source_reference||'Activity')+'</span></div>'+selector('activities',a.id,a.status)+'</div>').join('');}).join('')
     +'</details>';
   }).join('')+'</details>';
 }).join('');
 const mediaCards=media.map(m=>{
  const lesson=lessons.find(l=>l.id===m.lesson_id),unit=units.find(u=>u.id===lesson?.unit_id),book=books.find(b=>b.id===unit?.book_id);
  return '<div class="lesson-card"><div><strong>'+esc(book?.title||'')+' · Unit '+esc(unit?.number||'')+'</strong><div class="subtle en">'+esc(m.kind)+' '+esc(m.original_track||'Unit video')+' · '+esc(m.asset_status)+'</div></div><div class="row"><input class="field" style="max-width:225px" type="file" accept="'+(m.kind==='audio'?'.mp3,.m4a,.wav,.ogg':'.mp4,.webm,.mov')+'" data-media-file="'+m.id+'">'+button('رفع الملف','data-action="upload-media" data-id="'+m.id+'"')+(m.storage_path?button('اعتماد الملف','data-action="approve-media" data-id="'+m.id+'"'):'')+'</div></div>';
 }).join('');
 const enrollmentUpload='<section class="card"><h2>إضافة طالب إلى كتاب</h2><p>بعد إنشاء الطالب حسابه، انسخ User ID من صفحة درجاتي. يمكن إضافته لكل كتاب بصورة مستقلة.</p><div class="row"><input id="enroll-student-id" class="field" style="max-width:370px" placeholder="Student UUID" dir="ltr"><select id="enroll-book-id" class="field" style="max-width:310px">'+books.map(b=>'<option value="'+b.id+'">'+esc(b.title)+'</option>').join('')+'</select>'+button('تسجيل الطالب','data-action="enroll-student"')+'</div></section>';
 const sourceUpload='<section class="card upload-source-card" id="admin-source-upload"><h2>رفع صور الكتاب — Unit 1</h2><p>اختار ملف ZIP الذي حمّلته من المحادثة. لا تفك الضغط؛ النظام هيفصل صور الكتابين تلقائيًا ويحفظها في تخزين Supabase الخاص.</p><div class="row"><select id="source-book" class="field" style="max-width:280px"><option value="listening-speaking">Listening & Speaking</option><option value="reading-writing">Reading & Writing</option></select><label class="field-label" for="source-files">ملف صور Unit 1 المضغوط (ZIP)</label><input type="file" class="field" id="source-files" accept=".webp,.zip" multiple aria-label="اختر ملف صور مضغوط أو صور منفردة">'+button('ابدأ رفع الصور','data-action="upload-sources"')+'</div><p class="subtle">ملف ZIP ممكن يحتوي ls-016.webp وrw-016.webp معًا. الاسم هو اللي يحدد الكتاب تلقائيًا.</p><div id="source-upload-status" class="subtle" aria-live="polite"></div></section>';
 const mediaUpload='<section class="card"><h2>ملفات Unit 1 المطلوبة</h2><p>بمجرد رفع الملف يتحول إلى Uploaded؛ بعد مراجعة الجودة يتم اعتماده من لوحة الإدارة.</p><div class="list">'+mediaCards+'</div></section>';
 const tab=T.adminTab||'content';
 const tabs=[['content','الدروس والأسئلة'],['answers','حلول تمارين الكتاب'],['images','صور الكتاب'],['media','الصوت والفيديو'],['students','الطلاب'],['grading','تقييم المهام']];
 const tabbar='<nav class="admin-tabs">'+tabs.map(x=>'<button type="button" class="button '+(tab===x[0]?'primary':'')+'" data-action="admin-tab" data-tab="'+x[0]+'">'+x[1]+'</button>').join('')+'</nav>';
 const overview='<div class="grid8 admin-stats">'+[['كتب',books.length],['وحدات',units.length],['أسئلة',activities.length],['أنشطة أصلية',registry.length]].map(x=>'<div class="card"><strong>'+x[1]+'</strong><p>'+x[0]+'</p></div>').join('')+'</div>';

 const answerPane='<section class="card admin-answers" id="admin-answer-manager">'+
 '<div class="section-lead"><div><h2>الإجابات النموذجية لتمارين Unit 1</h2><p>عدّل أمثلة الشرح المفتوحة فقط. الحلول الصحيحة لأسئلة الاختيار محفوظة في الخلفية ولا تظهر قبل محاولة الطالب.</p></div><span class="study-pill">'+registry.length+' مجموعة</span></div>'+
 '<input class="field" id="admin-model-filter" type="search" placeholder="ابحث عن درس أو صفحة أو نشاط" aria-label="بحث في تمارين الكتاب">'+
 books.map(b=>{
  const related=registry.filter(r=>{
   const lesson=lessons.find(l=>l.id===r.lesson_id);
   const unit=units.find(u=>u.id===lesson?.unit_id);
   return unit?.book_id===b.id&&unit.number===1;
  });
  if(!related.length)return '';
  return '<details class="admin-model-book"><summary>'+esc(b.title)+' · '+related.length+' نشاطًا</summary><div class="admin-model-list">'+related.map(r=>{
   const lesson=lessons.find(l=>l.id===r.lesson_id);
   const waiting=r.answer_kind==='media_pending';
   return '<article class="admin-model-row" data-admin-answer-row data-model-id="'+r.id+'">'+
    '<div><span class="source-ref">ص '+printPage(r.pdf_page)+' · '+esc(lesson?.title||'')+'</span><h3>'+esc(r.source_title)+'</h3><p>'+esc(r.activity_label)+'</p>'+
    '<span class="tag '+(waiting?'draft':'ok')+'">'+(waiting?'ميديا مطلوبة':r.answer_kind==='objective_linked'?'تصحيح آلي':r.answer_kind==='instructor_sample'?'نموذج تعليمي':'بدون نموذج')+'</span></div>'+
    (waiting?'<p class="subtle">الملف الصوتي أو الفيديو لم يتوفر؛ لا تكتب حلًا تخمينيًا.</p>':
      '<label class="field-label">نموذج إجابة من إعداد المعهد</label><textarea class="field textarea" data-answer-model="'+r.id+'" rows="3" maxlength="12000" placeholder="أضف نموذجًا واضحًا أو اتركه فارغًا إلى حين المراجعة">'+esc(r.model_answer_ar||'')+'</textarea>'+
      '<div class="row">'+button('حفظ نموذج الإجابة','data-action="save-source-model" data-id="'+r.id+'"')+'</div>')+'</article>';
  }).join('')+'</div></details>';
 }).join('')+'</section>';
 const pane=tab==='content'?'<div class="stack">'+cards+'</div>':
   tab==='answers'?'<div class="stack">'+answerPane+'</div>':
   tab==='images'?'<div class="stack">'+sourceUpload+'</div>':
   tab==='media'?'<div class="stack">'+mediaUpload+'</div>':
   tab==='students'?enrollmentUpload:
   '<section class="card"><h2>مراجعة المهام المفتوحة</h2><p>تسليمات كتابة ومحادثة، وتطبيقات تمارين الكتاب.</p>'+button('مراجعة تسليمات الدروس','data-action="reviews"')+button('مراجعة تمارين الكتاب','data-action="review-exercises"')+'</section>';
 frame('لوحة الإدارة · UNLOCK 1','اختار الوظيفة المطلوبة، مع إمكانية معاينة الكتاب كطالب قبل النشر',overview+tabbar+pane);
}

async function saveSourceModel(id){
 if(!T.admin||!T.user){notice('للمسؤولين فقط','warning');return;}
 const row=document.querySelector('[data-model-id="'+id+'"]');
 const area=row?.querySelector('[data-answer-model]');
 if(!area){notice('التمرين غير متاح','warning');return;}
 const model=area.value.trim();
 const {data:current,error:readErr}=await db.from('exercise_registry').select('id,answer_kind,grading_mode').eq('id',id).single();
 if(readErr||!current){notice('تعذر تحميل النشاط','warning');return;}
 if(current.answer_kind==='media_pending'||current.grading_mode==='media-awaited'){notice('لا يمكن اعتماد إجابة لاختبار صوت أو فيديو بدون ملفه','warning');return;}
 if(model.length>12000){notice('نموذج الإجابة أطول من المسموح','warning');return;}
 const kind=current.answer_kind==='objective_linked'?'objective_linked':model?'instructor_sample':'pending';
 const {data,error}=await db.from('exercise_registry').update({model_answer_ar:model||null,answer_kind:kind}).eq('id',id).select('id');
 if(error||!data?.length){notice('لم يُحفظ النموذج: '+(error?.message||'تحقق من صلاحية الأدمن'),'warning');return;}
 notice('تم حفظ نموذج إجابة التمرين');
}
async function adminUpdate(el){
 if(!T.admin){notice('غير مصرح','warning');return;}
 const table=el.dataset.table,id=el.dataset.id;
 if(!['books','units','lessons','activities'].includes(table)||!id)return;
 const select=document.querySelector('[data-state-select="'+table+'-'+id+'"]');
 const target=select?.value;if(!['draft','review','published'].includes(target))return;
 if(target==='published'){
  if(table==='activities'){
   const {data:activity,error:ae}=await db.from('activities').select('id,lesson_id,kind').eq('id',id).single();
   if(ae||!activity)return;
   const {data:lesson}=await db.from('lessons').select('kind').eq('id',activity.lesson_id).single();
   if(['audio','video'].includes(lesson?.kind)){
    const {data:assets}=await db.from('media_assets').select('asset_status').eq('lesson_id',activity.lesson_id);
    if(!(assets||[]).length||(assets||[]).some(x=>x.asset_status!=='approved')){notice('لا يمكن نشر سؤال استماع أو فيديو قبل رفع الميديا واعتمادها. استخدم درس Script Study منفصل.','warning');return;}
   }
  }
  if(table==='lessons'){
   const {data:lesson,error:e}=await db.from('lessons').select('id,kind').eq('id',id).single();
   if(e||!lesson)return;
   if(['audio','video'].includes(lesson.kind)){
    const {data:assets}=await db.from('media_assets').select('id,asset_status').eq('lesson_id',id);
    if(!(assets||[]).length||(assets||[]).some(m=>m.asset_status!=='approved')){notice('لا يمكن نشر نشاط الميديا قبل اعتماد جميع ملفاته','warning');return;}
   }
  }
  if(table==='units'){
   const {data:ls}=await db.from('lessons').select('status').eq('unit_id',id);
   if(!ls?.length||ls.some(x=>x.status!=='published')){notice('لا يمكن نشر الوحدة قبل اعتماد كل أقسامها','warning');return;}
  }
  if(table==='books'){
   const {data:us}=await db.from('units').select('status').eq('book_id',id);
   if(!us?.length||us.some(x=>x.status!=='published')){notice('لا يمكن نشر الكتاب قبل اعتماد كل وحداته','warning');return;}
  }
  if(!confirm('تأكيد نشر المحتوى للطلاب المسجلين؟'))return;
 }
 const {error}=await db.from(table).update({status:target}).eq('id',id);
 if(error){notice('فشل تعديل الحالة: '+error.message,'warning');return;}
 notice('تم حفظ الحالة: '+target);
 await adminPage();
}

document.addEventListener('click',async e=>{
 const el=e.target.closest('button[data-action]');if(!el)return;
 const act=el.dataset.action;
 try{if(act==='home')home();else if(act==='study-tab')showStudyTab(el.dataset.tab);else if(act==='study-crop-zoom')openSourceZoom(el);else if(act==='close-source-zoom')document.getElementById('source-cut-dialog')?.close();else if(act==='study-source-full'){showStudyTab('book');const d=document.getElementById('book-sources');if(d)d.open=true;await sourcePage(Number(el.dataset.page));}else if(act==='retry-source-cut')await loadSourceCut(el.closest('.source-cut'));else if(act==='quiz-nav')navigateQuestion(Number(el.dataset.step));else if(act==='admin')await adminPage();else if(act==='admin-images'){T.adminTab='images';window.location.hash='upload-images';await adminPage();document.getElementById('admin-source-upload')?.scrollIntoView({block:'start',behavior:'smooth'});}else if(act==='admin-preview-book')await bookPage(el.dataset.id);else if(act==='admin-tab'){T.adminTab=el.dataset.tab;await adminPage();}else if(act==='reviews')await reviewsPage();else if(act==='review-exercises')await reviewIndexedExercisesPage();else if(act==='save-indexed-feedback')await saveIndexedFeedback(el.dataset.id);else if(act==='save-review')await saveReview(el.dataset.id);else if(act==='results')await resultsPage();else if(act==='play-media')await playMedia(el.dataset.id);else if(act==='source-page')await sourcePage(el.dataset.page);else if(act==='save-exercise')await saveIndexedExercise(el.dataset.id,false);else if(act==='submit-exercise')await saveIndexedExercise(el.dataset.id,true);else if(act==='save-work')await saveWork(false);else if(act==='submit-work')await saveWork(true);else if(act==='save-source-model')await saveSourceModel(el.dataset.id);else if(act==='admin-update')await adminUpdate(el);else if(act==='enroll-student')await enrollStudent();else if(act==='upload-media')await uploadMedia(el.dataset.id);else if(act==='approve-media')await approveMedia(el.dataset.id);else if(act==='upload-sources')await uploadSources();else if(act==='login')authPage();else if(act==='signup')authPage(true);else if(act==='logout'){await db.auth.signOut();await refresh(true)}else if(act==='book')await bookPage(el.dataset.id||T.book?.id);else if(act==='unit')await unitPage(el.dataset.id);else if(act==='lesson')await lessonPage(el.dataset.id);else if(act==='grade')await grade(el.dataset.id,el);}catch(err){notice('خطأ غير متوقع: '+err.message,'warning');}
});
document.addEventListener('toggle',e=>{if(e.target?.matches?.('.exercise-book-page')&&e.target.open){e.target.querySelectorAll('.source-cut').forEach(el=>loadSourceCut(el));}},true);
document.addEventListener('input',e=>{if(e.target?.id==='admin-model-filter'){const q=e.target.value.trim().toLocaleLowerCase();document.querySelectorAll('[data-admin-answer-row]').forEach(x=>{x.hidden=!x.textContent.toLocaleLowerCase().includes(q);});}if(e.target?.id==='unit-word-search'){const q=e.target.value.trim().toLocaleLowerCase();document.querySelectorAll('#unit-word-list .word').forEach(el=>{el.hidden=!el.textContent.toLocaleLowerCase().includes(q)});}});
document.getElementById('nav-home').addEventListener('click',home);
db.auth.onAuthStateChange((_event,session)=>{if((session?.access_token||null)!==(T.session?.access_token||null)){Promise.resolve().then(()=>refresh(true));}});
refresh(true);
})();