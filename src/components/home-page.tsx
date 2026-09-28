"use client";

import Link from "next/link";
import { ArrowUpLeft, ArrowUpRight, BookOpen, CalendarCheck, Check, ChevronDown, CirclePlay, Clock3, Globe2, GraduationCap, Headphones, Heart, Languages, MapPin, MonitorPlay, ShieldCheck, Sparkles, Star, UserRoundCheck, UsersRound } from "lucide-react";
import { useState } from "react";
import { faqs, t } from "@/lib/content";
import { useLanguage } from "./language-provider";
import { usePrograms, useTeachers } from "@/lib/use-public-data";
import { useEditableText, useEditableBilingual } from "./content-provider";

const icons = [BookOpen, Headphones, Sparkles, Heart, Languages, UsersRound];
const Icon = ({ index }: { index: number }) => { const C = icons[index % icons.length]; return <C/>; };

export function HomePage() {
 const { locale, isArabic } = useLanguage(); const c=t[locale]; const Arrow=isArabic?ArrowUpLeft:ArrowUpRight;
 const [faqOpen,setFaqOpen]=useState(0);
 const { data: programs } = usePrograms();
 const { data: teachers } = useTeachers();
 const heroEyebrow = useEditableText("home-hero.eyebrow", "تعليم القرآن لغير الناطقين بالعربية", "Quran learning for non-Arabic speakers");
 const heroTitle = useEditableBilingual("home-hero.title", "اقترب من القرآن\nبفهمٍ وثقة", "Come closer to the Quran\nwith clarity & confidence");
 const heroTitleLines = heroTitle[locale].split("\n");
 const heroDescription = useEditableText("home-hero.description", "حصص مباشرة وشخصية مع معلمين مؤهلين، ومنهج واضح يأخذ بيدك من أول حرف إلى تلاوة صحيحة بقلب مطمئن.", "Personal, live lessons with qualified teachers and a clear path—from your first Arabic letter to confident, beautiful recitation.");
 const ctaTitle = useEditableText("home-cta.title", "ابدأ رحلتك مع القرآن اليوم", "Begin your Quran journey today");
 const ctaDescription = useEditableText("home-cta.description", "خطوة صغيرة اليوم قد تفتح لك بابًا من الفهم والقرب يدوم مدى الحياة.", "One small step today can open a lifetime of understanding and connection.");
 const features=[
  [UserRoundCheck,isArabic?"مدرسون مؤهلون":"Qualified teachers",isArabic?"خبرة في تعليم غير الناطقين بالعربية":"Experienced with non-Arabic speakers"],
  [MonitorPlay,isArabic?"تعليم فردي مباشر":"Live one-to-one lessons",isArabic?"تركيز كامل على احتياج كل طالب":"Full attention to your personal needs"],
  [Clock3,isArabic?"مواعيد مرنة":"Flexible scheduling",isArabic?"أوقات مناسبة لمنطقتك الزمنية":"Times that work in your time zone"],
  [GraduationCap,isArabic?"منهج واضح":"A clear learning path",isArabic?"من الأساسيات إلى الإتقان خطوة بخطوة":"From foundations to fluency, step by step"],
  [ShieldCheck,isArabic?"بيئة آمنة":"Safe learning environment",isArabic?"مناسبة للأطفال والكبار":"Thoughtful for both children and adults"],
  [Globe2,isArabic?"من أي مكان":"Learn from anywhere",isArabic?"تعلم متصل أينما كنت في العالم":"Connected learning, wherever you are"],
 ];
 return <main>
  <section className="hero"><div className="pattern"/><div className="container hero-grid"><div className="hero-copy">
   <div className="eyebrow"><span>ن</span>{heroEyebrow}</div>
   <h1>{heroTitleLines[0]}{heroTitleLines[1]?<><br/><em>{heroTitleLines[1]}</em></>:null}</h1>
   <p>{heroDescription}</p>
   <div className="hero-actions"><Link href="/booking" className="button button-primary">{c.book}<Arrow size={18}/></Link><a href="#programs" className="button button-outline">{c.explore}</a></div>
   <div className="trust-row"><span><Check/> {isArabic?"حصة تجريبية مجانية":"Free trial lesson"}</span><span><Check/> {isArabic?"لا تحتاج معرفة مسبقة بالعربية":"No Arabic required"}</span></div>
  </div><div className="hero-visual"><div className="arch-image"><img src="https://images.pexels.com/photos/34427193/pexels-photo-34427193.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=850&w=720" alt={isArabic?"طالبة تقرأ في المصحف":"Student reading the Quran"}/><div className="image-overlay"/><div className="verse-card"><span>﴿</span><div><strong>{isArabic?"وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا":"And recite the Quran with measured recitation"}</strong><small>Surah Al-Muzzammil · 4</small></div></div></div><div className="mini-card"><CirclePlay/><div><strong>{isArabic?"تعلم مباشر":"Live learning"}</strong><small>{isArabic?"وجهًا لوجه مع معلمك":"One-to-one with your teacher"}</small></div></div></div></div>
  </section>

  <section className="value-strip"><div className="container value-grid"><div><span>01</span><strong>{isArabic?"اختر ما يناسبك":"Choose your path"}</strong><small>{isArabic?"تلاوة، تجويد، أو حفظ":"Reading, Tajweed, or memorization"}</small></div><div><span>02</span><strong>{isArabic?"تعلم بلغتك":"Learn in your language"}</strong><small>{isArabic?"شرح واضح دون تعقيد":"Clear guidance, no confusion"}</small></div><div><span>03</span><strong>{isArabic?"تقدم بإيقاعك":"Progress at your pace"}</strong><small>{isArabic?"خطة فردية ومتابعة مستمرة":"A personal plan and steady follow-up"}</small></div></div></section>

  <section className="section why"><div className="container"><div className="section-head centered"><span className="section-label">{isArabic?"لماذا نون؟":"WHY NOON"}</span><h2>{isArabic?"تعليم يراعيك في كل خطوة":"Learning built around you"}</h2><p>{isArabic?"نجمع بين أصالة التعليم القرآني وتجربة رقمية بسيطة ومريحة.":"Rooted in authentic Quran teaching, delivered through a simple and caring online experience."}</p></div><div className="features-grid">{features.map(([I,title,desc],i)=>{const C=I as typeof Check;return <article className="feature" key={i}><span className="feature-icon"><C/></span><div><h3>{String(title)}</h3><p>{String(desc)}</p></div></article>})}</div></div></section>

  <section id="programs" className="section programs-section"><div className="container"><div className="section-head split"><div><span className="section-label">{isArabic?"برامجنا":"OUR PROGRAMS"}</span><h2>{isArabic?"مسار واضح لكل متعلم":"A clear path for every learner"}</h2></div><p>{isArabic?"سواء بدأت اليوم أو تريد إتقان تلاوتك، ستجد برنامجًا يناسب عمرك وهدفك ووقتك.":"Whether you are starting today or refining your recitation, there is a program for your age, goal, and schedule."}</p></div><div className="program-grid">{programs.map((p,i)=><article className="program-card" key={p.id}><div className="program-top"><span className="program-icon"><Icon index={i}/></span><small>0{i+1}</small></div><h3>{isArabic?p.titleAr:p.titleEn}</h3><p>{isArabic?p.descriptionAr:p.descriptionEn}</p><div className="program-meta"><span>{isArabic?p.levelAr:p.levelEn}</span><span>{isArabic?p.ageAr:p.ageEn}</span><span><Clock3/> {p.duration} {isArabic?"دقيقة":"min"}</span></div><Link href="/booking">{isArabic?"احجز هذا البرنامج":"Book this program"}<Arrow size={17}/></Link></article>)}</div></div></section>

  <section className="section journey"><div className="container journey-grid"><div className="journey-copy"><span className="section-label light">{isArabic?"كيف تعمل الأكاديمية؟":"HOW IT WORKS"}</span><h2>{isArabic?"أربع خطوات، وبداية مطمئنة":"Four simple steps to begin"}</h2><p>{isArabic?"صممنا تجربة الحجز والبداية لتكون واضحة وسريعة، ونبقى معك بعد أول حصة.":"We made getting started simple and transparent—and we stay with you after your first lesson."}</p><Link href="/booking" className="button button-gold">{c.book}<Arrow/></Link></div><div className="steps">{[[BookOpen,isArabic?"اختر البرنامج":"Choose a program"],[CalendarCheck,isArabic?"احجز موعدك":"Pick your time"],[CirclePlay,isArabic?"احضر الحصة التجريبية":"Join your trial"],[Star,isArabic?"ابدأ رحلتك":"Begin your journey"]].map(([I,x],i)=>{const C=I as typeof BookOpen;return <div className="step" key={i}><span><C/></span><div><small>0{i+1}</small><strong>{String(x)}</strong></div></div>})}</div></div></section>

  <section className="section teachers-preview"><div className="container"><div className="section-head split"><div><span className="section-label">{isArabic?"معلموك":"YOUR TEACHERS"}</span><h2>{isArabic?"علمٌ يتصل، وقلبٌ يفهم":"Knowledge that connects. Teachers who care."}</h2></div><Link href="/teachers" className="text-link">{isArabic?"عرض جميع المدرسين":"Meet all teachers"}<Arrow/></Link></div>{teachers.length ? <div className="teacher-grid">{teachers.map((x)=><article className="teacher-card" key={x.id}><div className="teacher-image"><img src={x.imageUrl||"https://images.pexels.com/photos/8617779/pexels-photo-8617779.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=650&w=520"} alt={isArabic?x.nameAr:x.nameEn}/>{x.yearsExperience?<span>{x.yearsExperience} {isArabic?"سنوات خبرة":"years experience"}</span>:null}<span className="availability-badge">{isArabic?x.availabilityAr:x.availabilityEn}</span></div><div className="teacher-info"><h3>{isArabic?x.nameAr:x.nameEn}</h3><p>{isArabic?x.specialtyAr:x.specialtyEn}</p><small>{isArabic?x.qualificationsAr:x.qualificationsEn}</small><div><Languages/> {(x.languages||[]).join(", ")}</div></div></article>)}</div> : <div className="empty-reviews"><UserRoundCheck/><h3>{isArabic?"ملفات المدرسين قيد التوثيق":"Teacher profiles are being verified"}</h3><p>{isArabic?"سننشر أسماء المدرسين ومؤهلاتهم بعد مراجعتها واعتمادها فقط.":"Names and qualifications will appear here only after they have been reviewed and verified."}</p></div>}</div></section>

  <section className="global-section"><div className="container global-grid"><div><span className="section-label light">{isArabic?"أكاديمية بلا حدود":"A GLOBAL CLASSROOM"}</span><h2>{isArabic?"القرآن يجمعنا، أينما كنا":"Connected by the Quran, wherever we are"}</h2><p>{isArabic?"نستقبل طلبات الطلاب من مختلف أنحاء العالم، وتُعرض مواعيد الحصص تلقائيًا حسب منطقتك الزمنية. ننشر أرقام الدول والطلاب فقط عند توثيقها.":"We welcome learners from around the world, with lesson times shown automatically in your local time zone. Student and country totals are published only when verified."}</p><div className="region-pills"><span>Europe</span><span>North America</span><span>Asia</span><span>Africa</span><span>Oceania</span></div></div><div className="globe-art"><Globe2/><span className="pin p1"><MapPin/></span><span className="pin p2"><MapPin/></span><span className="pin p3"><MapPin/></span></div></div></section>

  <section className="section reviews-home"><div className="container"><div className="section-head centered"><span className="section-label">{isArabic?"تجارب المتعلمين":"LEARNER STORIES"}</span><h2>{isArabic?"الثقة تُبنى بالتجربة":"Trust grows through real experiences"}</h2></div><div className="empty-reviews"><Star/><h3>{isArabic?"ستظهر هنا تجارب موثقة فقط":"Only verified learner stories appear here"}</h3><p>{isArabic?"لم تُنشر تقييمات معتمدة بعد. لا نستخدم آراء أو أسماء وهمية.":"No reviews have been approved yet. We never publish invented quotes or names."}</p><Link href="/reviews" className="button button-outline">{isArabic?"شارك تجربتك":"Share your experience"}</Link></div></div></section>

  <section id="faq" className="section faq-section"><div className="container faq-grid"><div className="faq-intro"><span className="section-label">{isArabic?"أسئلة شائعة":"COMMON QUESTIONS"}</span><h2>{isArabic?"كل ما تحتاج معرفته قبل أن تبدأ":"Everything you need before you begin"}</h2><p>{isArabic?"لم تجد إجابتك؟ يسعدنا التحدث معك ومساعدتك.":"Still unsure? We would be happy to talk and help."}</p><Link href="/contact" className="text-link">{c.contact}<Arrow/></Link></div><div className="accordion">{faqs.map((f,i)=><button key={i} className={`faq-item ${faqOpen===i?"active":""}`} onClick={()=>setFaqOpen(faqOpen===i?-1:i)}><span>{f.q[locale]}</span><ChevronDown/><p>{f.a[locale]}</p></button>)}</div></div></section>

  <section className="final-cta"><div className="pattern"/><div className="container"><span>ن</span><h2>{ctaTitle}</h2><p>{ctaDescription}</p><Link href="/booking" className="button button-gold">{c.book}<Arrow/></Link></div></section>
 </main>;
}
