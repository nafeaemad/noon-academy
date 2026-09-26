import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { posts } from "@/db/schema";
import { BlogPostPage } from "@/components/blog-post-page";

export const dynamic = "force-dynamic";

async function getPost(slug: string) {
  const rows = await db
    .select()
    .from(posts)
    .where(and(eq(posts.slug, slug), eq(posts.published, true)));
  return rows[0] ?? null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Article not found" };
  return { title: post.titleEn, description: post.excerptEn };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();
  return (
    <BlogPostPage
      post={{
        slug: post.slug,
        titleAr: post.titleAr,
        titleEn: post.titleEn,
        contentAr: post.contentAr,
        contentEn: post.contentEn,
        coverImageUrl: post.coverImageUrl,
        createdAt: post.createdAt.toISOString(),
      }}
    />
  );
}
