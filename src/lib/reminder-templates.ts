/** Teachers work on the academy clock. */
export const TEACHER_TZ = "Africa/Cairo";

export const DEFAULT_STUDENT_MSG =
  "السلام عليكم {الاسم} 🌙\nتذكير: حصتك في نون أكاديمي ({المرجع}) مع {الطرف_الآخر} بتبدأ {الموعد}.\nادخل من حسابك بربع ساعة قبلها: {اللينك}";
export const DEFAULT_TEACHER_MSG =
  "السلام عليكم {الاسم} 🌙\nتذكير: عندك حصة مع {الطرف_الآخر} ({المرجع}) {الموعد}.\nاللينك: {اللينك}";

export const PLACEHOLDERS = ["{الاسم}", "{الطرف_الآخر}", "{الموعد}", "{المرجع}", "{اللينك}"];

export function fillTemplate(tpl: string, v: { name: string; other: string; time: string; ref: string; link: string }) {
  return tpl
    .replaceAll("{الاسم}", v.name)
    .replaceAll("{الطرف_الآخر}", v.other)
    .replaceAll("{الموعد}", v.time)
    .replaceAll("{المرجع}", v.ref)
    .replaceAll("{اللينك}", v.link);
}
