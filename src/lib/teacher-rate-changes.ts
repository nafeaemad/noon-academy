import { and, eq, lte } from "drizzle-orm";
import { db } from "@/db";
import { teacherRequests, teachers } from "@/db/schema";
import { notifyTeacher } from "@/lib/push";

/**
 * Applies any approved rate-change requests whose scheduled activation time has arrived.
 * There is no real cron in this deployment, so this is called lazily whenever a teacher
 * or admin loads a page that would be affected (teacher dashboard, admin teacher lists,
 * the requests manager) — it activates "on the next visit after the scheduled time",
 * not to-the-second.
 */
export async function applyDueRateChanges() {
  const due = await db
    .select()
    .from(teacherRequests)
    .where(
      and(
        eq(teacherRequests.type, "rate_change"),
        eq(teacherRequests.status, "approved"),
        eq(teacherRequests.autoActivate, true),
        eq(teacherRequests.applied, false),
        lte(teacherRequests.effectiveAt, new Date()),
      ),
    );

  for (const request of due) {
    await applyRateChange(request.id);
  }
}

/** Applies one rate-change request's requestedRate to the teacher now, whatever its schedule says. */
export async function applyRateChange(requestId: number) {
  const [request] = await db.select().from(teacherRequests).where(eq(teacherRequests.id, requestId));
  if (!request || request.type !== "rate_change" || request.status !== "approved" || request.applied || !request.requestedRate) {
    return null;
  }

  const [teacher] = await db.select().from(teachers).where(eq(teachers.id, request.teacherId));
  if (!teacher) return null;

  await db.update(teachers).set({ ratePerLesson: request.requestedRate }).where(eq(teachers.id, teacher.id));
  const [updatedRequest] = await db
    .update(teacherRequests)
    .set({ applied: true, previousRate: teacher.ratePerLesson })
    .where(eq(teacherRequests.id, request.id))
    .returning();

  await notifyTeacher(teacher.id, {
    title: "تم تفعيل سعر الحصة الجديد 💰",
    body: `سعر حصتك بقى ${Number(request.requestedRate).toFixed(2)} ${teacher.currency}.`,
    url: "/teacher",
    tag: `teacher-rate-${request.id}`,
  });

  return updatedRequest;
}

/** Undoes an already-applied rate change, restoring the teacher's previous rate. Used when an admin edits an approval back to rejected. */
export async function revertRateChange(request: typeof teacherRequests.$inferSelect, teacher: typeof teachers.$inferSelect | undefined) {
  if (!teacher || !request.applied || request.previousRate == null) return;
  await db.update(teachers).set({ ratePerLesson: request.previousRate }).where(eq(teachers.id, teacher.id));
  await db.update(teacherRequests).set({ applied: false }).where(eq(teacherRequests.id, request.id));
}
