import { createHmac, timingSafeEqual } from "crypto";

function secret() {
  return process.env.AUTH_SECRET || process.env.DATABASE_URL || "noon";
}

/** Session token tied to the teacher's current password hash — changing the password logs out all sessions. */
export function teacherToken(teacherId: number, passwordHash: string) {
  return createHmac("sha256", secret()).update(`teacher:${teacherId}:${passwordHash}`).digest("hex");
}

export function validTeacherToken(teacherId: number, passwordHash: string, token: string) {
  if (!token) return false;
  const expected = teacherToken(teacherId, passwordHash);
  try {
    return timingSafeEqual(Buffer.from(token), Buffer.from(expected));
  } catch {
    return false;
  }
}

export const TEACHER_COOKIE = "noon_teacher";

export function buildCookieValue(teacherId: number, passwordHash: string) {
  return `${teacherId}.${teacherToken(teacherId, passwordHash)}`;
}

export function parseCookieValue(value?: string) {
  if (!value) return null;
  const dot = value.indexOf(".");
  if (dot === -1) return null;
  const id = Number(value.slice(0, dot));
  const token = value.slice(dot + 1);
  if (!Number.isFinite(id) || !token) return null;
  return { id, token };
}
