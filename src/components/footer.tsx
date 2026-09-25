"use client";

import Link from "next/link";
import { Camera, Mail, MessageCircle } from "lucide-react";
import { useLanguage } from "./language-provider";
import { Logo } from "./logo";
import { t } from "@/lib/content";

export function Footer() {
 const { locale, setLocale, isArabic } = useLanguage(); const c = t[locale];
 return <><footer className="site-footer"><div className="footer-grid container">
  <div className="footer-brand"><Logo light/><p>{isArabic ? "تعليم قرآني أصيل، بأسلوب واضح وشخصي، يصل إليك أينما كنت." : "Authentic Quran learning, made clear, personal, and accessible wherever you are."}</p><div className="socials"><a href="mailto:hello@noonquran.academy" aria-label="Email"><Mail/></a><a href="#" aria-label="Instagram"><Camera/></a><a href="https://wa.me/15551234567" aria-label="WhatsApp"><MessageCircle/></a></div></div>
  <div><h3>{isArabic ? "استكشف" : "Explore"}</h3><Link href="/#programs">{c.programs}</Link><Link href="/teachers">{c.teachers}</Link><Link href="/pricing">{c.pricing}</Link><Link href="/about">{c.about}</Link></div>
  <div><h3>{isArabic ? "الدعم" : "Support"}</h3><Link href="/contact">{c.contact}</Link><Link href="/#faq">{isArabic ? "الأسئلة الشائعة" : "FAQ"}</Link><Link href="/privacy">{isArabic ? "الخصوصية" : "Privacy"}</Link><Link href="/blog">{isArabic ? "المدونة" : "Learning journal"}</Link></div>
  <div><h3>{isArabic ? "ابدأ الآن" : "Start today"}</h3><p>{isArabic ? "دعنا نساعدك في اختيار المسار الأنسب." : "Let us help you choose the right learning path."}</p><Link className="button button-gold" href="/booking">{c.book}</Link><button className="footer-language" onClick={() => setLocale(locale === "ar" ? "en" : "ar")}>🌐 {locale === "ar" ? "English" : "العربية"}</button></div>
 </div><div className="footer-bottom container"><span>© {new Date().getFullYear()} Noon Academy</span><span>{isArabic ? "تعلم بهدوء · تقدم بثقة" : "Learn with calm · Grow with confidence"}</span></div></footer><a className="whatsapp-float" href={`https://wa.me/15551234567?text=${encodeURIComponent(isArabic ? "السلام عليكم، أريد معرفة المزيد عن أكاديمية نون وحجز حصة تجريبية." : "Hello, I would like to know more about Noon Academy and book a trial lesson.")}`} aria-label="WhatsApp"><MessageCircle/></a></>;
}
