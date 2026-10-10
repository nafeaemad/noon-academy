import type { Metadata } from "next";
import { TeacherAuthForm } from "@/components/teacher-auth-form";
export const metadata: Metadata = { title: "Teacher login" };
export default function Page() {
  return <TeacherAuthForm />;
}
