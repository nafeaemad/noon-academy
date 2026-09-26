"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BookOpen, ArrowUpLeft, ArrowUpRight } from "lucide-react";
import { useLanguage } from "./language-provider";
import { PageHero } from "./page-hero";

type PostSummary = {
  id: number;
  slug: string;
  titleAr: string;
  titleEn: string;
  excerptAr: string;
  excerptEn: string;
  coverImageUrl: string | null;
  createdAt: string;
};

export function BlogPage() {
  const { isArabic, locale } = useLanguage();
  const Arrow = isArabic ? ArrowUpLeft : ArrowUpRight;
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/posts")
      .then((r) => r.json())
      .then((rows) => setPosts(Array.isArray(rows) ? rows : []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main>
      <PageHero
        contentKey="blog-hero"
        label={{ ar: "مدونة نون", en: "LEARNING JOURNAL" }}
        title={{ ar: "معرفة تعينك في رحلتك", en: "Guidance for your Quran journey" }}
        description={{
          ar: "مقالات عربية وإنجليزية عن التلاوة والتجويد والحفظ وتعليم الأطفال.",
          en: "Thoughtful articles on recitation, Tajweed, memorization, and teaching children.",
        }}
      />
      <section className="page-content">
        <div className="container">
          {loading ? (
            <div className="admin-empty">{isArabic ? "جاري التحميل..." : "Loading..."}</div>
          ) : posts.length === 0 ? (
            <div className="empty-reviews">
              <BookOpen />
              <h3>{isArabic ? "المقالات قيد الإعداد" : "Articles are on their way"}</h3>
              <p>
                {isArabic
                  ? "ستُنشر المقالات بعد مراجعتها علميًا ولغويًا. لا يوجد محتوى تجريبي منشور كأنه حقيقي."
                  : "Every article will be reviewed for accuracy and clarity before publication."}
              </p>
            </div>
          ) : (
            <div className="blog-grid">
              {posts.map((p) => (
                <Link href={`/blog/${p.slug}`} className="blog-card" key={p.id}>
                  {p.coverImageUrl && <img src={p.coverImageUrl} alt={isArabic ? p.titleAr : p.titleEn} />}
                  <div className="blog-card-body">
                    <small>{new Intl.DateTimeFormat(locale === "ar" ? "ar" : "en", { year: "numeric", month: "long", day: "numeric" }).format(new Date(p.createdAt))}</small>
                    <h3>{isArabic ? p.titleAr : p.titleEn}</h3>
                    <p>{isArabic ? p.excerptAr : p.excerptEn}</p>
                    <span className="text-link">
                      {isArabic ? "اقرأ المزيد" : "Read more"} <Arrow size={15} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
