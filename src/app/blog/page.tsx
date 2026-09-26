import type { Metadata } from "next";
import { BlogPage } from "@/components/blog-page";
export const metadata: Metadata = { title: "Learning Journal" };
export default function Page() {
  return <BlogPage />;
}
