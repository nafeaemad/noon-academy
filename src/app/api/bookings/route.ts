import { db } from "@/db";
import { bookings } from "@/db/schema";

const emailPattern=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export async function POST(request: Request) {
 try{
  const b=await request.json();
  if(b.website) return Response.json({ok:true});
  if(!b.program||!b.level||!b.age||!b.lessonLanguage||!b.startsAt||!b.duration||!b.timezone||!b.name||!emailPattern.test(b.email||"")||!b.whatsapp||!b.country) return Response.json({error:"Please complete all required fields."},{status:400});
  const startsAt=new Date(b.startsAt); if(Number.isNaN(startsAt.getTime())||startsAt.getTime()<Date.now()) return Response.json({error:"Please choose a future time."},{status:400});
  const reference=`NOON-${crypto.randomUUID().slice(0,8).toUpperCase()}`;
  await db.insert(bookings).values({reference,program:String(b.program).slice(0,120),level:String(b.level).slice(0,80),age:Math.min(100,Math.max(5,Number(b.age))),lessonLanguage:String(b.lessonLanguage).slice(0,40),teacherId:b.teacherId?Number(b.teacherId):null,startsAt,duration:[30,45,60].includes(Number(b.duration))?Number(b.duration):30,timezone:String(b.timezone).slice(0,100),name:String(b.name).slice(0,160),email:String(b.email).slice(0,220),whatsapp:String(b.whatsapp).slice(0,60),country:String(b.country).slice(0,100),notes:b.notes?String(b.notes).slice(0,2000):null});
  if(process.env.NOTIFICATION_WEBHOOK_URL){fetch(process.env.NOTIFICATION_WEBHOOK_URL,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({event:"booking.created",reference,email:b.email,name:b.name,startsAt:b.startsAt,timezone:b.timezone})}).catch(()=>undefined)}
  return Response.json({ok:true,reference});
 }catch(error){
  const code=typeof error==="object"&&error&&"code" in error?String((error as {code?:string}).code):"";
  if(code==="23505") return Response.json({error:"This time was just booked. Please choose another."},{status:409});
  return Response.json({error:"We could not complete your booking. Please try again."},{status:500});
 }
}
