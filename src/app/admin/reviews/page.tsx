import { cookies } from "next/headers";
import { validToken } from "@/lib/admin-auth";
import { AdminLogin } from "@/components/admin-login";
import { ReviewsManager } from "@/components/admin/reviews-manager";

export default async function AdminReviewsPage() {
  const store = await cookies();
  if (!validToken(store.get("noon_admin")?.value)) return <AdminLogin />;
  return <ReviewsManager />;
}
