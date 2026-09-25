import { db } from "@/db";
import { bookings } from "@/db/schema";
import { and, eq, gte, lt, ne } from "drizzle-orm";

export const dynamic = "force-dynamic";
export async function GET(request: Request) {
 const date=new URL(request.url).searchParams.get("date");
 if(!date||!/\d{4}-\d{2}-\d{2}/.test(date)) return Response.json({error:"Invalid date"},{status:400});
 const start=new Date(`${date}T00:00:00.000Z`), end=new Date(start); end.setUTCDate(end.getUTCDate()+1);
 const taken=await db.select({startsAt:bookings.startsAt}).from(bookings).where(and(gte(bookings.startsAt,start),lt(bookings.startsAt,end),ne(bookings.status,"cancelled")));
 const used=new Set(taken.map(x=>x.startsAt.toISOString()));
 const slots=[]; for(let hour=8;hour<=19;hour++){for(const minute of [0,30]){const d=new Date(start);d.setUTCHours(hour,minute);if(d.getTime()>Date.now()+60*60*1000&&!used.has(d.toISOString()))slots.push(d.toISOString())}}
 return Response.json({slots});
}
