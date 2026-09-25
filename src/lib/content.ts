export type Locale = "ar" | "en";
export type Localized = { ar: string; en: string };

export const programs = [
  { icon: "book", title: { ar: "قراءة القرآن الكريم", en: "Quran Reading" }, desc: { ar: "بناء قراءة سليمة ومتدرجة من الحروف إلى التلاوة بطلاقة.", en: "Build confident, fluent recitation from letters to complete verses." }, level: { ar: "جميع المستويات", en: "All levels" }, age: { ar: "أطفال وكبار", en: "Children & adults" }, duration: 30 },
  { icon: "audio", title: { ar: "تصحيح التلاوة", en: "Recitation Correction" }, desc: { ar: "تدريب عملي على مخارج الحروف وصفاتها وتصحيح الأخطاء.", en: "Practical coaching on articulation, pronunciation, and common errors." }, level: { ar: "متوسط ومتقدم", en: "Intermediate & advanced" }, age: { ar: "13+ سنة", en: "Ages 13+" }, duration: 45 },
  { icon: "spark", title: { ar: "أحكام التجويد", en: "Tajweed" }, desc: { ar: "فهم أحكام التجويد وتطبيقها مباشرة أثناء التلاوة.", en: "Understand Tajweed rules and apply them naturally while reciting." }, level: { ar: "مبتدئ إلى متقدم", en: "Beginner to advanced" }, age: { ar: "10+ سنوات", en: "Ages 10+" }, duration: 45 },
  { icon: "heart", title: { ar: "حفظ القرآن", en: "Quran Memorization" }, desc: { ar: "خطة حفظ ومراجعة شخصية تناسب وقت الطالب وقدرته.", en: "A personal memorization and revision plan shaped around your pace." }, level: { ar: "جميع المستويات", en: "All levels" }, age: { ar: "أطفال وكبار", en: "Children & adults" }, duration: 30 },
  { icon: "letter", title: { ar: "القاعدة النورانية", en: "Arabic Reading Foundations" }, desc: { ar: "تأسيس واضح في الحروف والحركات والقراءة القرآنية.", en: "A clear foundation in Arabic letters, sounds, and Quranic reading." }, level: { ar: "مبتدئ", en: "Beginner" }, age: { ar: "5+ سنوات", en: "Ages 5+" }, duration: 30 },
  { icon: "child", title: { ar: "القرآن للأطفال", en: "Quran for Children" }, desc: { ar: "حصص ممتعة وآمنة تراعي عمر الطفل ومدى تركيزه.", en: "Warm, engaging lessons designed around each child's attention span." }, level: { ar: "مخصص للطفل", en: "Child-specific" }, age: { ar: "5–12 سنة", en: "Ages 5–12" }, duration: 30 },
];

export const teachers: Array<{ name: Localized; specialty: Localized; qualification: Localized; languages: string; years: number; image: string }> = [];


export const faqs = [
  { q: { ar: "هل الدروس أونلاين؟", en: "Are all lessons online?" }, a: { ar: "نعم، جميع الحصص مباشرة مع المدرس عبر منصة اجتماعات آمنة، ويمكنك الدراسة من أي مكان.", en: "Yes. Every lesson is live with your teacher through a secure meeting platform, wherever you are." } },
  { q: { ar: "هل الدروس فردية أم جماعية؟", en: "Are lessons private or group-based?" }, a: { ar: "الأصل أن تكون الحصص فردية لضمان خطة تناسب الطالب، ويمكن توفير مجموعات صغيرة حسب البرنامج.", en: "Our core lessons are one-to-one for a truly personal plan. Small groups may be offered for selected programs." } },
  { q: { ar: "هل أحتاج إلى معرفة العربية؟", en: "Do I need to know Arabic?" }, a: { ar: "لا. برامجنا مصممة لغير الناطقين بالعربية وتبدأ معك من المستوى المناسب تمامًا.", en: "Not at all. Our programs are built for non-Arabic speakers and begin at your exact level." } },
  { q: { ar: "هل توجد دروس للأطفال؟", en: "Do you teach children?" }, a: { ar: "نعم، لدينا معلمون وبرامج مخصصة للأطفال من عمر خمس سنوات في بيئة آمنة ومشجعة.", en: "Yes. We offer age-appropriate lessons for children aged five and above in a safe, encouraging setting." } },
  { q: { ar: "هل توجد حصة تجريبية؟", en: "Can I book a trial lesson?" }, a: { ar: "نعم، تساعدنا الحصة التجريبية على تقييم المستوى واقتراح المسار الأنسب للطالب.", en: "Yes. The trial helps us assess your level and recommend the best learning path." } },
  { q: { ar: "ما مدة الحصة ومواعيد الدراسة؟", en: "How long are lessons, and when can I study?" }, a: { ar: "تتوفر حصص 30 و45 و60 دقيقة، وتظهر المواعيد المتاحة بحسب منطقتك الزمنية عند الحجز.", en: "Choose 30, 45, or 60 minutes. Available times appear in your own time zone during booking." } },
  { q: { ar: "كيف يتم الحجز؟", en: "How does booking work?" }, a: { ar: "اختر البرنامج والموعد، أدخل بيانات التواصل، ثم يصلك تأكيد الحجز وبيانات الحصة.", en: "Choose a program and available time, add your contact details, and receive your lesson confirmation." } },
  { q: { ar: "ما طرق الدفع المتاحة؟", en: "Which payment methods are accepted?" }, a: { ar: "تُعرض طرق الدفع المتاحة حسب بلد الطالب بعد تأكيد الخطة. الدفع الإلكتروني قيد التجهيز.", en: "Available methods depend on your country and are shared when your plan is confirmed. Online checkout is coming soon." } },
];

export const plans = [
  { name: { ar: "الحصة التجريبية", en: "Trial Lesson" }, price: "$0", note: { ar: "تقييم مستوى وتوصية شخصية", en: "Level assessment & personal recommendation" }, lessons: { ar: "حصة واحدة · 30 دقيقة", en: "1 lesson · 30 minutes" }, featured: false },
  { name: { ar: "المسار المنتظم", en: "Steady Path" }, price: "$49", note: { ar: "مثالي لبناء عادة تعلم ثابتة", en: "Perfect for building a consistent habit" }, lessons: { ar: "4 حصص شهريًا · 30 دقيقة", en: "4 lessons/month · 30 minutes" }, featured: true },
  { name: { ar: "المسار المكثف", en: "Focused Path" }, price: "$89", note: { ar: "لتقدم أسرع ومتابعة أسبوعية", en: "For faster progress and weekly follow-up" }, lessons: { ar: "8 حصص شهريًا · 30 دقيقة", en: "8 lessons/month · 30 minutes" }, featured: false },
];

export const t = {
  ar: { home: "الرئيسية", programs: "البرامج", teachers: "المدرسون", pricing: "الأسعار", about: "عن الأكاديمية", reviews: "التجارب", contact: "تواصل معنا", book: "احجز حصة تجريبية", explore: "اكتشف برامجنا", more: "اعرف المزيد", viewProfile: "عرض الملف", academy: "أكاديمية نون", tagline: "لتعليم الأعاجم القرآن الكريم" },
  en: { home: "Home", programs: "Programs", teachers: "Teachers", pricing: "Pricing", about: "About", reviews: "Reviews", contact: "Contact", book: "Book a free trial", explore: "Explore our programs", more: "Learn more", viewProfile: "View profile", academy: "Noon Academy", tagline: "Quran learning for non-Arabic speakers" },
};
