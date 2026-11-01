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
const sourceAlert='<div class="notice warning"><strong>تنويه المحتوى:</strong> صفحات الكتاب الكاملة والوسائط مرخصة للمتعلمين المصرح لهم فقط؛ لن تُنشر كصور في مستودع GitHub العام. الأصل محفوظ في الحزمة المحلية، ويُربط بالمنصة عبر تخزين خاص لاحقًا. لا تُعتمد درجة الصوت أو الفيديو قبل رفع الملف الأصلي.</div>';
function frame(title,subtitle,inner){root.innerHTML='<section class="hero"><span class="eyebrow">UNLOCK LEVEL 1 · WITH SEIFY</span><h1>'+esc(title)+'</h1><p>'+esc(subtitle)+'</p></section>'+inner;}
function menu(){sessEl.innerHTML=T.user?'<span class="subtle">'+esc(T.user.email)+'</span> '+(T.admin?button('لوحة الإدارة','data-action="admin"'):button('درجاتي','data-action="results"'))+button('تسجيل الخروج','data-action="logout"'):'<button class="nav-btn" data-action="login">دخول الطلاب</button>';}
function home(){
 T.book=T.unit=T.lesson=null; menu();
 const cards=NAMES.map(([slug,title,ico],i)=>{
 const available=T.books.find(b=>b.slug===slug);
 const btn=available?'<button type="button" class="button primary" data-action="book" data-id="'+available.id+'">افتح الكتاب</button>':button(T.user?'غير مضاف إلى حسابك':'سجّل الدخول',T.user?'disabled':'data-action="login"');
 return '<article class="card"><div class="book-ico">'+ico+'</div><div class="eyebrow">BOOK '+(i+1)+'</div><h2 class="en title">'+esc(title)+'</h2><p>ثماني وحدات مستقلة، درجات ومهارات وقاموس خاص بالكتاب.</p>'+btn+'</article>';
 }).join('');
 frame('UNLOCK WITH SEIFY','منهج أكاديمي تفاعلي · كتابان مستقلان داخل Unlock 1 · شرح عربي واضح ومحتوى إنجليزي منظم','<section class="cols">'+cards+'</section><section class="card" style="margin-top:18px"><h2>Unit 1 — People</h2><p>جاهزة للمراجعة الأكاديمية: نصوص، تدريبات قواعد ومفردات، مهام قراءة وكتابة، وسكريبتات لحين وصول الميديا.</p><div class="row">'+badge('draft')+'<span class="subtle">الأسئلة والدرجات لا تظهر إلا بعد اعتماد نشرها والتسجيل في الكتاب.</span></div></section>'+(!T.user?'<div class="notice">للدخول إلى وحدتك، استخدم بيانات حساب الطالب. حسابات الإدارة تُمنح بصلاحية خادم مستقلة.</div>':T.books.length===0?'<div class="notice warning">حسابك لم يُسجّل بعد في أي كتاب. اطلب من إدارة المنصة إضافتك إلى الكتاب المطلوب.</div>':''));
}
function authPage(signup=false){
 root.innerHTML='<section class="card auth-card"><h2>'+(signup?'إنشاء حساب الطالب':'تسجيل الدخول')+'</h2><p>حسابك خاص بمنصة Unlock. لا نستخدم حساب STEP تلقائيًا.</p><form id="authform"><label class="field-label" for="auth-email">Email</label><input class="field" id="auth-email" type="email" autocomplete="email" required><label class="field-label" for="auth-pass">Password</label><input class="field" id="auth-pass" type="password" minlength="6" autocomplete="'+(signup?'new-password':'current-password')+'" required><div class="row" style="margin-top:17px"><button class="button primary" type="submit">'+(signup?'إنشاء الحساب':'دخول')+'</button>'+button(signup?'لديك حساب؟ سجّل الدخول':'إنشاء حساب جديد','data-action="'+(signup?'login':'signup')+'"')+'</div><p class="auth-help">تفعيل الحساب لا يعني التسجيل في أي كتاب؛ الإدارة تختار الكتاب وصلاحيات الوصول.</p></form></section>';
 $('#authform').addEventListener('submit',async e=>{e.preventDefault();const email=$('#auth-email').value.trim(),password=$('#auth-pass').value;const r=signup?await db.auth.signUp({email,password}):await db.auth.signInWithPassword({email,password});if(r.error){notice(r.error.message,'warning');return;}if(signup&&!r.data.session)notice('تم إرسال رسالة تأكيد للبريد الإلكتروني.');await refresh(true);});
}
async function refresh(force=false){const {data:{session}}=await db.auth.getSession();T.session=session;T.user=session?.user||null;T.admin=T.user?.app_metadata?.unlock_role==='admin';T.books=[];
 if(T.user){const {data,error}=await db.from('books').select('id,slug,title,status,position').order('position');if(error)notice('تعذر تحميل الكتب: '+error.message,'warning');else T.books=data||[]}
 if(force||!T.book)home();
}
async function bookPage(bookId){
 const book=T.books.find(b=>b.id===bookId);if(!book){home();return;}T.book=book;T.unit=T.lesson=null;
 const {data:units,error}=await db.from('units').select('id,number,title,status,source_pdf_page').eq('book_id',bookId).order('number');
 if(error){notice(error.message,'warning');return;}
 const cards=(units||[]).map(u=>'<button class="unit-card" data-action="unit" data-id="'+u.id+'"><span class="num">UNIT '+String(u.number).padStart(2,'0')+'</span><strong class="en">'+esc(u.title)+'</strong>'+badge(u.status)+'</button>').join('');
 frame(book.title,'منهج مستقل · 8 وحدات · درجات وقاموس خاص بالكتاب',crumb('Unlock 1',book.title)+'<div class="row" style="margin-bottom:15px">'+button('العودة للرئيسية','data-action="home"')+badge(book.status)+'</div><div class="grid8">'+cards+'</div>'+sourceAlert);
}
async function unitPage(unitId){
 if(!T.book){home();return;}
 const {data:u,error}=await db.from('units').select('id,number,title,status,source_pdf_page').eq('id',unitId).single();
 if(error||!u){notice('الوحدة غير متاحة لهذا الحساب','warning');return;}
 T.unit=u;T.lesson=null;
 const [{data:lessons,error:e1},{data:words,error:e2}]=await Promise.all([db.from('lessons').select('id,slug,title,kind,status,position,content').eq('unit_id',u.id).order('position'),db.from('vocabulary').select('id,term,part_of_speech,meaning_ar,status,definition_en,pronunciation_ipa,glossary_pdf_page').eq('unit_id',u.id).order('position')]);
 if(e1||e2){notice((e1||e2).message,'warning');return;}T.lessons=lessons||[];
 const lessonsHtml=T.lessons.map((l,i)=>{const pp=Array.isArray(l.content?.source_pages)?l.content.source_pages:[];const range=pp.length?'PDF '+Math.min(...pp)+'–'+Math.max(...pp)+' · المطبوع '+(Math.min(...pp)-2)+'–'+(Math.max(...pp)-2):'';const waiting=l.kind==='audio'||l.kind==='video';return '<button class="lesson-card" data-action="lesson" data-id="'+l.id+'"><div class="row"><span class="lesson-num">'+String(i+1).padStart(2,'0')+'</span><div><strong class="en">'+esc(l.title)+'</strong><div class="subtle">'+esc(range)+'</div></div></div><span class="tag '+(waiting?'draft':'ok')+'">'+(waiting?'سيتم النشر':l.status==='published'?'متاح':'تحت المراجعة')+'</span></button>';}).join('');
 const wordHtml=(words||[]).map(w=>'<article class="word"><strong class="en">'+esc(w.term)+'</strong><div class="subtle en">'+esc(w.pronunciation_ipa||'')+' · '+esc(w.part_of_speech||'')+'</div><div>'+esc(w.meaning_ar||'تحت المراجعة')+'</div>'+(w.definition_en?'<p class="en definition">'+esc(w.definition_en)+'</p>':'')+'<div class="source-ref">Wordlist: PDF 37 · Glossary: PDF '+esc(w.glossary_pdf_page||'—')+'</div></article>').join('');
 frame('Unit '+u.number+' — '+u.title,T.book.title,crumb('Unlock 1',T.book.title,'Unit '+u.number)+'<div class="row" style="margin-bottom:18px">'+button('رجوع للكتاب','data-action="book" data-id="'+T.book.id+'"')+badge(u.status)+'</div><section class="cols"><div class="card"><h2>المنهج والدروس</h2><div class="list">'+(lessonsHtml||'<div class="empty">الأقسام قيد التدقيق.</div>')+'</div></div><div class="card"><h2>Unit Dictionary — قاموس الوحدة كاملًا</h2><p>المعاني العربية والنطق والتعريفات الإنجليزية من صفحات الـWordlist والـGlossary في الكتاب.</p><div class="row" style="margin:12px 0">'+(T.book.slug==='listening-speaking'?button('Glossary PDF 198','data-action="source-page" data-page="198"'):button('Glossary PDF 192','data-action="source-page" data-page="192"')+button('Glossary PDF 193','data-action="source-page" data-page="193"'))+'</div><div id="source-availability"></div><div class="vocab">'+(wordHtml||'<div class="empty">لا توجد كلمات منشورة لهذا الطالب.</div>')+'</div></div></section>'+sourceAlert);
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
  return '<article class="quiz" data-question-id="'+a.id+'"><div class="source-ref">QUESTION '+(i+1)+' · '+esc(a.source_reference||'Teacher practice')+'</div><div class="question">'+esc(prompt)+'</div>'+form+(canGrade?'<button class="button primary small" data-action="grade" data-id="'+a.id+'">صحّح الإجابة</button>':'')+'<div class="feedback-slot" role="status"></div></article>';
 }).join('');
 const guidance=l.content||{};
 const guide='<section class="card" style="margin-bottom:15px"><h2>شرح وتوجيه لغوي</h2><div>'+esc(guidance.teaching_note_ar||'راجع خطوات الدرس والمفردات قبل الحل.')+'</div>'+(Array.isArray(guidance.examples)&&guidance.examples.length?'<div class="en" style="margin-top:12px">'+guidance.examples.map(x=>'<p>'+esc(x)+'</p>').join('')+'</div>':'')+'<div class="subtle">توضيحات تعليمية من إعداد المعهد، منفصلة عن محتوى Cambridge الأصلي.</div></section>';
 const pages=Array.isArray(guidance.source_pages)?guidance.source_pages:[];
 const supplement=Array.isArray(guidance.supplementary_source_pages)?guidance.supplementary_source_pages:[];
 const sources='<section class="card" style="margin-bottom:15px"><h2>صفحات المصدر الأصلي</h2><p>شوف رقم صفحة PDF والصفحة المطبوعة. عرض الصورة يتطلب رفعها إلى التخزين الخاص المرخص.</p><div class="row">'+pages.map(p=>button('PDF '+p+' · مطبوع '+(p-2),'data-action="source-page" data-page="'+Number(p)+'"')).join('')+'</div>'+(supplement.length?'<h3>ملحق Pairwork — Student A / B</h3><div class="row">'+supplement.map(p=>button('الملحق PDF '+p+' · مطبوع '+(p-2),'data-action="source-page" data-page="'+Number(p)+'"')).join('')+'</div>':'')+'<div id="source-availability" aria-live="polite"></div></section>';
 const {data:sourceExercises,error:sourceError}=await db.from('exercise_registry').select('id,pdf_page,source_title,activity_label,grading_mode,publish_status,instruction_ar').eq('lesson_id',id).order('pdf_page');
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
 const expandedGuide=learningBlocks.length?'<section class="card" style="margin-bottom:15px"><h2>الشرح التفصيلي</h2>'+learningBlocks.map(x=>'<div class="study-block"><h3 class="en">'+esc(x.h||'')+'</h3><p>'+esc(x.ar||'')+'</p>'+(x.en?'<div class="en sample">'+esc(x.en)+'</div>':'')+'</div>').join('')+'<p class="subtle">التوضيحات العربية إضافات تعليمية من المعهد وليست نص Cambridge.</p></section>':'';
 const readingItems=Array.isArray(guidance.verified_source_readings)?guidance.verified_source_readings:[];
 const originalReadings=readingItems.length?'<section class="card" style="margin-bottom:15px"><h2>نص القراءة من الكتاب</h2>'+readingItems.map(x=>'<article class="study-block"><div class="source-ref">PDF '+Number(x.page)+' · صفحة الكتاب '+(Number(x.page)-2)+'</div><h3 class="en">'+esc(x.heading||'Reading')+'</h3><div class="en original-text">'+esc(x.text||'')+'</div></article>').join('')+'</section>':'';
 const scripts=Array.isArray(guidance.original_scripts)?guidance.original_scripts:[];
 const scriptExtract=scripts.length?'<section class="card" style="margin-bottom:15px"><h2>Video & Audio Scripts — Unit 1</h2><div class="notice warning">النصوص هنا للدراسة النصية فقط. القراءة ليست بديلًا عن اختبار Listening أو Watching، ويتم نشر الميديا الأصلية لاحقًا.</div>'+scripts.map(x=>'<article class="study-block"><div class="source-ref">PDF '+Number(x.page)+' · مطبوع '+(Number(x.page)-2)+'</div><h3 class="en">'+esc(x.label)+'</h3><div class="en original-text">'+esc(x.text)+'</div></article>').join('')+'</section>':typeof guidance.source_excerpt==='string'&&guidance.source_excerpt?'<section class="card"><h2>Script Study — مقتطفات</h2><div class="en original-text">'+esc(guidance.source_excerpt)+'</div></section>':'';
 const scriptRefs=Array.isArray(guidance.audio_script_cross_refs)?guidance.audio_script_cross_refs:[];
 const scriptReferences=scriptRefs.length?'<section class="card" style="margin-bottom:15px"><h2>أماكن السكريبتات الأخرى في الكتاب</h2><div class="list">'+scriptRefs.map(x=>'<div class="lesson-card"><span class="en">Track '+esc(x.track)+'</span><span>PDF '+Number(x.pdf_page)+' · مطبوع '+Number(x.printed_page)+'</span>'+button('افتح صفحة المصدر','data-action="source-page" data-page="'+Number(x.pdf_page)+'"')+'</div>').join('')+'</div><div id="source-availability" aria-live="polite"></div></section>':'';
 const vocabularyPanel=(lessonWords||[]).length?'<section class="card" style="margin-top:15px"><h2>قاموس الجزء — Part Vocabulary</h2><div class="vocab">'+lessonWords.map(w=>'<article class="word"><strong class="en">'+esc(w.term)+'</strong><div class="subtle en">'+esc(w.pronunciation_ipa||'')+' · '+esc(w.part_of_speech||'')+'</div><div>'+esc(w.meaning_ar||'')+'</div><div class="en definition">'+esc(w.definition_en||'')+'</div><div class="source-ref">Wordlist PDF 37 · Glossary PDF '+esc(w.glossary_pdf_page||'—')+'</div></article>').join('')+'</div></section>':'';
 const sourceIndex='<section class="card" style="margin-top:15px"><h2>تمارين الكتاب حسب الصفحة والجزء</h2><p>كل بطاقة موضح فيها موضع النشاط في الكتاب. بطاقة الشرح والتطبيق الإضافي ليست بديلًا عن النص الأصلي الموجود بالصفحة.</p>'+((sourceExercises||[]).map((x,i)=>{
  const waiting=x.grading_mode==='media-awaited';
  const ans=answerMap[x.id];
  const disabled=ans?.response_status==='submitted';
  return '<article class="study-block"><div class="row" style="justify-content:space-between"><div><div class="source-ref">PDF '+Number(x.pdf_page)+' · مطبوع '+(Number(x.pdf_page)-2)+' · '+esc(x.activity_label)+'</div><h3 class="en">'+esc(x.source_title)+'</h3></div><span class="tag '+(waiting?'draft':'ok')+'">'+(waiting?'سيتم النشر':'تطبيق مرتبط بالكتاب')+'</span></div><p>'+esc(x.instruction_ar||'راجع القسم المحدد في صفحة الكتاب.')+'</p>'
   +(waiting?'<div class="notice warning">سيتم النشر بمجرد رفع الملف الأصلي واعتماده من لوحة الإدارة.</div>':
   (T.user&&!T.admin?'<textarea class="field textarea" dir="auto" data-exercise-answer="'+x.id+'" maxlength="16000" placeholder="اكتب إجابتك أو ملاحظاتك هنا" '+(disabled?'readonly':'')+'>'+esc(ans?.response_text||'')+'</textarea><div class="row">'+(disabled?badge('submitted'):button('حفظ الإجابة','data-action="save-exercise" data-id="'+x.id+'"')+button('تسليم للمدرس','data-action="submit-exercise" data-id="'+x.id+'"'))+'</div>':'<div class="subtle">معاينة الأدمن: صفحة '+Number(x.pdf_page)+' من النسخة الأصلية · نشاط مفتوح للمراجعة</div>'))
   +(ans?.review?'<div class="feedback"><strong>مراجعة المدرس'+(ans.review.score!==null?' · '+ans.review.score+'/100':'')+'</strong><p>'+esc(ans.review.feedback_ar)+'</p></div>':'')+'</article>';
 }).join('')||'<div class="empty">لم يُسجل نشاط أصلي لهذا الجزء بعد.</div>')+'</section>';
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
 frame(l.title,T.book.title+' · Unit '+T.unit.number,crumb(T.book.title,T.unit.title,l.title)+'<div class="row" style="margin-bottom:14px">'+button('رجوع للوحدة','data-action="unit" data-id="'+T.unit.id+'"')+badge(l.status)+'</div>'+mediaPanel+guide+expandedGuide+originalReadings+scriptExtract+scriptReferences+sources+'<section class="card"><h2>التدريبات الرقمية المشروحة</h2>'+(question||'<div class="empty">لم تُنشر بعد تدريبات هذا القسم للمستخدم الحالي. المرجع الأصلي محفوظ في المشروع الخاص.</div>')+'</section>'+sourceIndex+vocabularyPanel+workHtml+sourceAlert+
  '<nav class="row lesson-nav" aria-label="الانتقال بين الدروس">'+
  (T.lessons.findIndex(x=>x.id===id)>0?button('الجزء السابق','data-action="lesson" data-id="'+T.lessons[T.lessons.findIndex(x=>x.id===id)-1].id+'"'):'')+
  button('كل أجزاء الوحدة','data-action="unit" data-id="'+T.unit.id+'"')+
  (T.lessons.findIndex(x=>x.id===id)<T.lessons.length-1?button('الجزء التالي','data-action="lesson" data-id="'+T.lessons[T.lessons.findIndex(x=>x.id===id)+1].id+'"'):'')+
  '</nav>');
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
 slot.innerHTML='<div class="feedback '+(data.correct?'':'bad')+'"><strong>'+(data.correct?'✓ إجابتك صحيحة':'✕ إجابتك غير صحيحة')+'</strong><p>'+esc(data.correct?(data.explanation?.general||'إجابتك صحيحة'):(data.explanation?.wrong?.[String(answer)]||data.explanation?.incorrect||data.explanation?.general||'راجع القاعدة أو النص الأصلي'))+'</p>'+(data.correct?'':'<p><strong>الإجابة الصحيحة:</strong> <span class="en">'+esc(data.answer?.index!==undefined?box.querySelectorAll('.choice span')[data.answer.index]?.textContent:data.answer?.text||'')+'</span></p>')+'</div>';
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
 holder.innerHTML='<div class="notice"><a href="'+esc(data.url)+'" target="_blank" rel="noopener noreferrer">افتح صفحة المصدر '+Number(page)+' (الرابط مؤقت)</a></div>';
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
  return '<article class="card"><div class="source-ref">PDF '+esc(ex.pdf_page||'')+' · '+esc(ex.source_title||'')+' · '+esc(ex.activity_label||'')+'</div><div class="subtle">Student: '+esc(x.student_id.slice(0,8))+'...</div><p class="en original-text">'+esc(x.response_text)+'</p><label class="field-label">الدرجة (0 إلى 100 أو فارغة دون درجة)</label><input type="number" min="0" max="100" step=".5" class="field" style="max-width:180px" data-indexed-score="'+x.id+'" value="'+esc(v.score??'')+'"><label class="field-label">تفسير للطالب وملاحظات التحسين</label><textarea class="field textarea" data-indexed-feedback="'+x.id+'" dir="auto">'+esc(v.feedback_ar||'')+'</textarea><button class="button primary" data-action="save-indexed-feedback" data-id="'+x.id+'">حفظ التقييم</button></article>';
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

async function uploadSources(){
 if(!T.admin)return;
 const files=[...(document.getElementById('source-files')?.files||[])];
 const book=document.getElementById('source-book')?.value;
 if(!['listening-speaking','reading-writing'].includes(book)||!files.length){notice('اختر الكتاب وملفات WEBP','warning');return;}
 const prefix=book==='listening-speaking'?'ls':'rw';
 const status=document.getElementById('source-upload-status');let done=0,fail=0;
 for(const file of files){
  const match=file.name.match(/^(ls|rw)-(\d{3})\.webp$/i);
  if(!match||match[1].toLowerCase()!==prefix||file.size>8*1024*1024){fail++;continue;}
  const page=Number(match[2]);
  const validPage=(page>=16&&page<=37)||(book==='listening-speaking'?[194,196,198,206,207].includes(page):[192,193,206].includes(page));
  if(!validPage){fail++;continue;}
  const path=book+'/u1/source/'+file.name.toLowerCase();
  const {error}=await db.storage.from('unlock-course-media').upload(path,file,{upsert:true,contentType:'image/webp'});
  if(error)fail++;else done++;
  if(status)status.textContent='تم رفع '+done+' صفحة · تعذر '+fail;
 }
 notice('تم رفع '+done+' صفحة إلى التخزين الخاص، وتعذر '+fail+' ملف. راجع الأسماء والصيغ.'); 
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
  db.from('exercise_registry').select('id,lesson_id,pdf_page,source_title,activity_label,grading_mode,conversion_status').order('pdf_page')
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
 const sourceUpload='<section class="card"><h2>رفع صفحات الكتاب الأصلية — Private Storage</h2><p>ارفع ملفات WEBP بأسمائها الأصلية مثل ls-024.webp أو rw-034.webp. الملفات لا تُنشر في GitHub العام.</p><div class="row"><select id="source-book" class="field" style="max-width:280px"><option value="listening-speaking">Listening & Speaking</option><option value="reading-writing">Reading & Writing</option></select><input type="file" class="field" id="source-files" accept=".webp" multiple>'+button('رفع الصفحات','data-action="upload-sources"')+'</div><div id="source-upload-status" class="subtle"></div></section>';
 const mediaUpload='<section class="card"><h2>ملفات Unit 1 المطلوبة</h2><p>بمجرد رفع الملف يتحول إلى Uploaded؛ بعد مراجعة الجودة يتم اعتماده من لوحة الإدارة.</p><div class="list">'+mediaCards+'</div></section>';
 const tab=T.adminTab||'content';
 const tabs=[['content','الدروس والأسئلة'],['media','رفع الميديا'],['students','الطلاب'],['grading','تقييم المهام']];
 const tabbar='<nav class="admin-tabs">'+tabs.map(x=>'<button type="button" class="button '+(tab===x[0]?'primary':'')+'" data-action="admin-tab" data-tab="'+x[0]+'">'+x[1]+'</button>').join('')+'</nav>';
 const overview='<div class="grid8 admin-stats">'+[['كتب',books.length],['وحدات',units.length],['أسئلة',activities.length],['أنشطة أصلية',registry.length]].map(x=>'<div class="card"><strong>'+x[1]+'</strong><p>'+x[0]+'</p></div>').join('')+'</div>';
 const pane=tab==='content'?'<div class="stack">'+cards+'</div>':
   tab==='media'?'<div class="stack">'+mediaUpload+sourceUpload+'</div>':
   tab==='students'?enrollmentUpload:
   '<section class="card"><h2>مراجعة المهام المفتوحة</h2><p>تسليمات كتابة ومحادثة، وتطبيقات تمارين الكتاب.</p>'+button('مراجعة تسليمات الدروس','data-action="reviews"')+button('مراجعة تمارين الكتاب','data-action="review-exercises"')+'</section>';
 frame('لوحة الإدارة · UNLOCK 1','اختار الوظيفة المطلوبة، مع إمكانية معاينة الكتاب كطالب قبل النشر',overview+tabbar+pane);
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
 try{if(act==='home')home();else if(act==='admin')await adminPage();else if(act==='admin-preview-book')await bookPage(el.dataset.id);else if(act==='admin-tab'){T.adminTab=el.dataset.tab;await adminPage();}else if(act==='reviews')await reviewsPage();else if(act==='review-exercises')await reviewIndexedExercisesPage();else if(act==='save-indexed-feedback')await saveIndexedFeedback(el.dataset.id);else if(act==='save-review')await saveReview(el.dataset.id);else if(act==='results')await resultsPage();else if(act==='play-media')await playMedia(el.dataset.id);else if(act==='source-page')await sourcePage(el.dataset.page);else if(act==='save-exercise')await saveIndexedExercise(el.dataset.id,false);else if(act==='submit-exercise')await saveIndexedExercise(el.dataset.id,true);else if(act==='save-work')await saveWork(false);else if(act==='submit-work')await saveWork(true);else if(act==='admin-update')await adminUpdate(el);else if(act==='enroll-student')await enrollStudent();else if(act==='upload-media')await uploadMedia(el.dataset.id);else if(act==='approve-media')await approveMedia(el.dataset.id);else if(act==='upload-sources')await uploadSources();else if(act==='login')authPage();else if(act==='signup')authPage(true);else if(act==='logout'){await db.auth.signOut();await refresh(true)}else if(act==='book')await bookPage(el.dataset.id||T.book?.id);else if(act==='unit')await unitPage(el.dataset.id);else if(act==='lesson')await lessonPage(el.dataset.id);else if(act==='grade')await grade(el.dataset.id,el);}catch(err){notice('خطأ غير متوقع: '+err.message,'warning');}
});
document.getElementById('nav-home').addEventListener('click',home);
db.auth.onAuthStateChange((_event,session)=>{if((session?.access_token||null)!==(T.session?.access_token||null)){Promise.resolve().then(()=>refresh(true));}});
refresh(true);
})();