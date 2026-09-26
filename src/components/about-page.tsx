"use client";
import { Eye, Heart, Milestone, Route } from "lucide-react";
import { useLanguage } from "./language-provider";
import { PageHero } from "./page-hero";
import { useEditableBilingual } from "./content-provider";

const cardDefs = [
  { key: "about-card-vision", icon: Eye, titleAr: "رؤيتنا", titleEn: "Our vision", bodyAr: "أن يصبح تعلم القرآن متاحًا وواضحًا لكل مسلم، مهما كانت لغته أو بلده.", bodyEn: "To make clear, authentic Quran learning accessible to every Muslim, whatever their language or location." },
  { key: "about-card-mission", icon: Heart, titleAr: "رسالتنا", titleEn: "Our mission", bodyAr: "ربط المتعلم بالقرآن عبر تعليم أصيل، شخصي، ومليء بالرفق.", bodyEn: "To connect learners with the Quran through authentic, personal, and compassionate teaching." },
  { key: "about-card-method", icon: Route, titleAr: "منهجنا", titleEn: "Our method", bodyAr: "تقييم دقيق، هدف واضح، ممارسة مباشرة، ومتابعة تقيس التقدم الحقيقي.", bodyEn: "A thoughtful assessment, clear goals, guided practice, and follow-up that measures real progress." },
  { key: "about-card-different", icon: Milestone, titleAr: "ما يميزنا", titleEn: "What sets us apart", bodyAr: "تخصصنا في غير الناطقين بالعربية، مع تجربة رقمية بسيطة ومواعيد مرنة.", bodyEn: "A focus on non-Arabic speakers, with a calm digital experience and genuinely flexible scheduling." },
];

function AboutCard({ def }: { def: (typeof cardDefs)[number] }) {
  const { locale } = useLanguage();
  const title = useEditableBilingual(`${def.key}.title`, def.titleAr, def.titleEn);
  const body = useEditableBilingual(`${def.key}.body`, def.bodyAr, def.bodyEn);
  const Icon = def.icon;
  return (
    <article className="content-card">
      <span className="program-icon"><Icon /></span>
      <h2>{title[locale]}</h2>
      <p>{body[locale]}</p>
    </article>
  );
}

export function AboutPage() {
  return (
    <main>
      <PageHero
        contentKey="about-hero"
        label={{ ar: "عن أكاديمية نون", en: "ABOUT NOON" }}
        title={{ ar: "لأن البداية تحتاج من يفهمها", en: "A thoughtful beginning changes everything" }}
        description={{
          ar: "تأسست نون لتزيل الحواجز بين غير الناطق بالعربية وكتاب الله، بمنهج يجمع الأصالة والوضوح.",
          en: "Noon was created to remove the barriers between non-Arabic speakers and the Book of Allah—without compromising authenticity or clarity.",
        }}
      />
      <section className="page-content">
        <div className="container content-grid">
          {cardDefs.map((def) => (
            <AboutCard def={def} key={def.key} />
          ))}
        </div>
      </section>
    </main>
  );
}
