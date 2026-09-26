"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Save, Check } from "lucide-react";

type Field = { key: string; label: string; defaultAr: string; defaultEn: string };
type Section = { title: string; fields: Field[] };

const sections: Section[] = [
  {
    title: "الصفحة الرئيسية — القسم الأول (Hero)",
    fields: [
      { key: "home-hero.eyebrow", label: "العبارة الصغيرة فوق العنوان", defaultAr: "تعليم القرآن لغير الناطقين بالعربية", defaultEn: "Quran learning for non-Arabic speakers" },
      { key: "home-hero.title", label: "العنوان الرئيسي (سطرين، افصل بينهم بسطر جديد)", defaultAr: "اقترب من القرآن\nبفهمٍ وثقة", defaultEn: "Come closer to the Quran\nwith clarity & confidence" },
      { key: "home-hero.description", label: "الوصف تحت العنوان", defaultAr: "حصص مباشرة وشخصية مع معلمين مؤهلين، ومنهج واضح يأخذ بيدك من أول حرف إلى تلاوة صحيحة بقلب مطمئن.", defaultEn: "Personal, live lessons with qualified teachers and a clear path—from your first Arabic letter to confident, beautiful recitation." },
    ],
  },
  {
    title: "الصفحة الرئيسية — دعوة الحجز الأخيرة",
    fields: [
      { key: "home-cta.title", label: "العنوان", defaultAr: "ابدأ رحلتك مع القرآن اليوم", defaultEn: "Begin your Quran journey today" },
      { key: "home-cta.description", label: "الوصف", defaultAr: "خطوة صغيرة اليوم قد تفتح لك بابًا من الفهم والقرب يدوم مدى الحياة.", defaultEn: "One small step today can open a lifetime of understanding and connection." },
    ],
  },
  {
    title: "صفحة عن الأكاديمية — أعلى الصفحة",
    fields: [
      { key: "about-hero.label", label: "العبارة الصغيرة", defaultAr: "عن أكاديمية نون", defaultEn: "ABOUT NOON" },
      { key: "about-hero.title", label: "العنوان", defaultAr: "لأن البداية تحتاج من يفهمها", defaultEn: "A thoughtful beginning changes everything" },
      { key: "about-hero.description", label: "الوصف", defaultAr: "تأسست نون لتزيل الحواجز بين غير الناطق بالعربية وكتاب الله، بمنهج يجمع الأصالة والوضوح.", defaultEn: "Noon was created to remove the barriers between non-Arabic speakers and the Book of Allah—without compromising authenticity or clarity." },
    ],
  },
  {
    title: "صفحة عن الأكاديمية — البطاقات الأربع",
    fields: [
      { key: "about-card-vision.title", label: "بطاقة 1: العنوان (رؤيتنا)", defaultAr: "رؤيتنا", defaultEn: "Our vision" },
      { key: "about-card-vision.body", label: "بطاقة 1: النص", defaultAr: "أن يصبح تعلم القرآن متاحًا وواضحًا لكل مسلم، مهما كانت لغته أو بلده.", defaultEn: "To make clear, authentic Quran learning accessible to every Muslim, whatever their language or location." },
      { key: "about-card-mission.title", label: "بطاقة 2: العنوان (رسالتنا)", defaultAr: "رسالتنا", defaultEn: "Our mission" },
      { key: "about-card-mission.body", label: "بطاقة 2: النص", defaultAr: "ربط المتعلم بالقرآن عبر تعليم أصيل، شخصي، ومليء بالرفق.", defaultEn: "To connect learners with the Quran through authentic, personal, and compassionate teaching." },
      { key: "about-card-method.title", label: "بطاقة 3: العنوان (منهجنا)", defaultAr: "منهجنا", defaultEn: "Our method" },
      { key: "about-card-method.body", label: "بطاقة 3: النص", defaultAr: "تقييم دقيق، هدف واضح، ممارسة مباشرة، ومتابعة تقيس التقدم الحقيقي.", defaultEn: "A thoughtful assessment, clear goals, guided practice, and follow-up that measures real progress." },
      { key: "about-card-different.title", label: "بطاقة 4: العنوان (ما يميزنا)", defaultAr: "ما يميزنا", defaultEn: "What sets us apart" },
      { key: "about-card-different.body", label: "بطاقة 4: النص", defaultAr: "تخصصنا في غير الناطقين بالعربية، مع تجربة رقمية بسيطة ومواعيد مرنة.", defaultEn: "A focus on non-Arabic speakers, with a calm digital experience and genuinely flexible scheduling." },
    ],
  },
  {
    title: "أعلى الصفحات الأخرى (عبارة صغيرة / عنوان / وصف لكل صفحة)",
    fields: [
      { key: "teachers-hero.label", label: "المدرسون — العبارة الصغيرة", defaultAr: "فريق التعليم", defaultEn: "OUR TEACHERS" },
      { key: "teachers-hero.title", label: "المدرسون — العنوان", defaultAr: "معلمون يجمعون العلم والرفق", defaultEn: "Teachers with knowledge and care" },
      { key: "teachers-hero.description", label: "المدرسون — الوصف", defaultAr: "مختصون في القرآن والتجويد، ومدرّبون على تبسيط التعلم لغير الناطقين بالعربية.", defaultEn: "Quran and Tajweed specialists trained to make learning clear for non-Arabic speakers." },
      { key: "pricing-hero.label", label: "الأسعار — العبارة الصغيرة", defaultAr: "الأسعار", defaultEn: "PRICING" },
      { key: "pricing-hero.title", label: "الأسعار — العنوان", defaultAr: "خطط واضحة، دون مفاجآت", defaultEn: "Simple plans. Meaningful progress." },
      { key: "pricing-hero.description", label: "الأسعار — الوصف", defaultAr: "ابدأ مجانًا، ثم اختر الإيقاع الذي يناسب هدفك ووقتك.", defaultEn: "Start with a free assessment, then choose the pace that suits your goals and schedule." },
      { key: "contact-hero.label", label: "تواصل معنا — العبارة الصغيرة", defaultAr: "تواصل معنا", defaultEn: "CONTACT US" },
      { key: "contact-hero.title", label: "تواصل معنا — العنوان", defaultAr: "نحن هنا لمساعدتك", defaultEn: "We are here to help" },
      { key: "contact-hero.description", label: "تواصل معنا — الوصف", defaultAr: "لديك سؤال عن البرنامج أو الحجز؟ تحدث معنا بالطريقة التي تناسبك.", defaultEn: "Questions about a program or booking? Reach us in the way that works for you." },
      { key: "booking-hero.label", label: "الحجز — العبارة الصغيرة", defaultAr: "الحجز", defaultEn: "BOOKING" },
      { key: "booking-hero.title", label: "الحجز — العنوان", defaultAr: "ابدأ بحصة تجريبية", defaultEn: "Your first lesson starts here" },
      { key: "booking-hero.description", label: "الحجز — الوصف", defaultAr: "اختر ما يناسبك في دقائق. سنقيّم المستوى ونقترح مسارًا شخصيًا دون أي التزام.", defaultEn: "Choose what works for you in a few minutes. We will assess your level and recommend a personal path—with no obligation." },
      { key: "reviews-hero.label", label: "التقييمات — العبارة الصغيرة", defaultAr: "تجارب الطلاب", defaultEn: "LEARNER STORIES" },
      { key: "reviews-hero.title", label: "التقييمات — العنوان", defaultAr: "تجارب حقيقية، وثقة مستحقة", defaultEn: "Real experiences. Earned trust." },
      { key: "reviews-hero.description", label: "التقييمات — الوصف", defaultAr: "لا ننشر إلا تجارب يرسلها الطلاب أو أولياء الأمور وتوافق عليها الإدارة.", defaultEn: "We only publish stories submitted by learners or parents and approved by our team." },
      { key: "blog-hero.label", label: "المدونة — العبارة الصغيرة", defaultAr: "مدونة نون", defaultEn: "LEARNING JOURNAL" },
      { key: "blog-hero.title", label: "المدونة — العنوان", defaultAr: "معرفة تعينك في رحلتك", defaultEn: "Guidance for your Quran journey" },
      { key: "blog-hero.description", label: "المدونة — الوصف", defaultAr: "مقالات عربية وإنجليزية عن التلاوة والتجويد والحفظ وتعليم الأطفال.", defaultEn: "Thoughtful articles on recitation, Tajweed, memorization, and teaching children." },
      { key: "privacy-hero.label", label: "الخصوصية — العبارة الصغيرة", defaultAr: "الخصوصية", defaultEn: "PRIVACY" },
      { key: "privacy-hero.title", label: "الخصوصية — العنوان", defaultAr: "بياناتك أمانة", defaultEn: "Your privacy matters" },
      { key: "privacy-hero.description", label: "الخصوصية — الوصف", defaultAr: "نلتزم بجمع أقل قدر لازم من البيانات وحمايتها.", defaultEn: "We collect only what is needed to deliver and improve your learning experience." },
    ],
  },
];

function FieldRow({ field, saved, onSave }: { field: Field; saved?: { ar: string; en: string }; onSave: (key: string, ar: string, en: string) => Promise<void> }) {
  const [ar, setAr] = useState(saved?.ar ?? field.defaultAr);
  const [en, setEn] = useState(saved?.en ?? field.defaultEn);
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");

  async function save() {
    setStatus("saving");
    await onSave(field.key, ar, en);
    setStatus("saved");
    setTimeout(() => setStatus("idle"), 1500);
  }

  return (
    <div className="admin-panel" style={{ marginBottom: 14 }}>
      <div className="admin-toolbar" style={{ marginBottom: 10 }}>
        <strong style={{ fontSize: 13 }}>{field.label}</strong>
        <button className="btn-mini primary" onClick={save} disabled={status === "saving"}>
          {status === "saved" ? <Check size={12} /> : <Save size={12} />} {status === "saved" ? "تم الحفظ" : "حفظ"}
        </button>
      </div>
      <div className="form-grid">
        <div className="field">
          <label>عربي</label>
          <textarea value={ar} onChange={(e) => setAr(e.target.value)} rows={ar.length > 80 ? 4 : 2} />
        </div>
        <div className="field">
          <label>English</label>
          <textarea value={en} onChange={(e) => setEn(e.target.value)} rows={en.length > 80 ? 4 : 2} />
        </div>
      </div>
    </div>
  );
}

export function ContentManager() {
  const [saved, setSaved] = useState<Record<string, { ar: string; en: string }> | null>(null);

  useEffect(() => {
    fetch("/api/admin/content")
      .then((r) => r.json())
      .then(setSaved);
  }, []);

  async function handleSave(key: string, ar: string, en: string) {
    await fetch("/api/admin/content", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ key, ar, en }),
    });
    setSaved((prev) => ({ ...(prev || {}), [key]: { ar, en } }));
  }

  return (
    <main className="admin-page">
      <div className="container">
        <Link className="admin-back" href="/admin">
          <ArrowRight style={{ transform: "scaleX(-1)" }} /> رجوع للوحة الرئيسية
        </Link>
        <span className="section-label">محتوى الصفحات</span>
        <h1>تعديل نصوص الموقع</h1>
        <p>عدّل أي نص هنا واحفظه، وهيظهر فورًا على الموقع للزوار — بالعربي والإنجليزي.</p>

        {saved === null ? (
          <div className="admin-empty">جاري التحميل...</div>
        ) : (
          <div style={{ marginTop: 26 }}>
            {sections.map((section) => (
              <div key={section.title} style={{ marginBottom: 34 }}>
                <h2 style={{ fontSize: 16, marginBottom: 14 }}>{section.title}</h2>
                {section.fields.map((f) => (
                  <FieldRow key={f.key} field={f} saved={saved[f.key]} onSave={handleSave} />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
