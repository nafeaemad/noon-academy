"use client";
import Link from "next/link";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { useLanguage } from "./language-provider";

type Post = {
  slug: string;
  titleAr: string;
  titleEn: string;
  contentAr: string;
  contentEn: string;
  coverImageUrl: string | null;
  createdAt: string;
};

export function BlogPostPage({ post }: { post: Post }) {
  const { isArabic, locale } = useLanguage();
  const Back = isArabic ? ArrowRight : ArrowLeft;
  const content = isArabic ? post.contentAr : post.contentEn;
  return (
    <main>
      <section className="page-hero" style={{ paddingBottom: 40 }}>
        <div className="container">
          <Link href="/blog" className="text-link" style={{ justifyContent: "center", marginBottom: 16 }}>
            <Back size={15} /> {isArabic ? "كل المقالات" : "All articles"}
          </Link>
          <h1>{isArabic ? post.titleAr : post.titleEn}</h1>
          <p>
            {new Intl.DateTimeFormat(locale === "ar" ? "ar" : "en", { year: "numeric", month: "long", day: "numeric" }).format(new Date(post.createdAt))}
          </p>
        </div>
      </section>
      <section className="page-content">
        <div className="container">
          <article className="blog-article">
            {post.coverImageUrl && <img src={post.coverImageUrl} alt={isArabic ? post.titleAr : post.titleEn} className="blog-article-cover" />}
            {content.split(/\n{2,}/).map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </article>
        </div>
      </section>
    </main>
  );
}
