"use client";
import { useEffect,useState,type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays,Clock3,Globe2,LoaderCircle,ShieldCheck } from "lucide-react";
import { useLanguage } from "./language-provider";
import { usePrograms, useTeachers } from "@/lib/use-public-data";

export function BookingForm(){
 const{locale,isArabic}=useLanguage(),router=useRouter();
 const{data:programs}=usePrograms(),{data:teachers}=useTeachers(); const tz=Intl.DateTimeFormat().resolvedOptions().timeZone||"UTC";
 const tomorrow=new Date(Date.now()+86400000).toISOString().slice(0,10); const[date,setDate]=useState(tomorrow),[slots,setSlots]=useState<string[]>([]),[slot,setSlot]=useState(""),[loading,setLoading]=useState(true),[sending,setSending]=useState(false),[error,setError]=useState("");
 useEffect(()=>{setLoading(true);setSlot("");fetch(`/api/availability?date=${date}`).then(r=>r.json()).then(x=>setSlots(x.slots||[])).catch(()=>setError(isArabic?"تعذر تحميل المواعيد.":"Could not load times.")).finally(()=>setLoading(false))},[date,isArabic]);
 const submit=async(e:FormEvent<HTMLFormElement>)=>{e.preventDefault();setSending(true);setError("");const fd=new FormData(e.currentTarget),body=Object.fromEntries(fd);body.startsAt=slot;body.timezone=tz;const res=await fetch("/api/bookings",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(body)});const data=await res.json();setSending(false);if(!res.ok){setError(data.error||"Error");return}router.push(`/booking/confirmation?ref=${encodeURIComponent(data.reference)}`)};
 return <form className="form-card" onSubmit={submit}><div className="booking-heading"><div><span>01</span><h2>{isArabic?"أخبرنا عن المتعلم":"Tell us about the learner"}</h2></div><p><Globe2/>{isArabic?"الأوقات معروضة حسب":"Times shown in"} <b>{tz}</b></p></div><div className="form-grid">
  <div className="field"><label>{isArabic?"البرنامج":"Program"} *</label><select name="program" required defaultValue=""><option value="" disabled>{isArabic?"اختر البرنامج":"Select a program"}</option>{programs.map((p)=><option key={p.id} value={p.titleEn}>{isArabic?p.titleAr:p.titleEn}</option>)}</select></div>
  <div className="field"><label>{isArabic?"المستوى الحالي":"Current level"} *</label><select name="level" required><option value="complete-beginner">{isArabic?"مبتدئ تمامًا":"Complete beginner"}</option><option value="basic">{isArabic?"أقرأ بشكل أساسي":"Basic reader"}</option><option value="intermediate">{isArabic?"متوسط":"Intermediate"}</option><option value="advanced">{isArabic?"متقدم":"Advanced"}</option></select></div>
  <div className="field"><label>{isArabic?"العمر":"Age"} *</label><input name="age" type="number" min="5" max="100" required placeholder="12"/></div>
  <div className="field"><label>{isArabic?"لغة الشرح":"Teaching language"} *</label><select name="lessonLanguage" required><option>English</option><option>العربية</option><option>Français</option></select></div>
  <div className="field"><label>{isArabic?"المدرس المفضل (اختياري)":"Preferred teacher (optional)"}</label><select name="teacherId"><option value="">{isArabic?"أي مدرس متاح":"Any available teacher"}</option>{teachers.map((x)=><option key={x.id} value={x.id}>{isArabic?x.nameAr:x.nameEn}</option>)}</select></div>
  <div className="field"><label>{isArabic?"مدة الحصة":"Lesson duration"} *</label><select name="duration" required><option value="30">30 {isArabic?"دقيقة":"minutes"}</option><option value="45">45 {isArabic?"دقيقة":"minutes"}</option><option value="60">60 {isArabic?"دقيقة":"minutes"}</option></select></div>
  <div className="field full"><label><CalendarDays/> {isArabic?"تاريخ الحصة":"Lesson date"} *</label><input type="date" value={date} min={tomorrow} onChange={e=>setDate(e.target.value)} required/></div>
  <div className="field full"><label><Clock3/> {isArabic?"الوقت المتاح":"Available time"} *</label>{loading?<div className="slot-loading"><LoaderCircle/>{isArabic?"جاري تحميل المواعيد...":"Loading available times..."}</div>:slots.length?<div className="slots">{slots.map(s=><button type="button" className={slot===s?"selected":""} key={s} onClick={()=>setSlot(s)}>{new Intl.DateTimeFormat(locale==="ar"?"ar":"en",{hour:"numeric",minute:"2-digit",timeZone:tz}).format(new Date(s))}</button>)}</div>:<div className="form-note">{isArabic?"لا توجد مواعيد متاحة في هذا اليوم. جرّب تاريخًا آخر.":"No times are available on this day. Please choose another date."}</div>}</div>
  <div className="field full section-break"><span>02</span><h2>{isArabic?"بيانات التواصل":"Contact details"}</h2></div>
  <div className="field"><label>{isArabic?"الاسم الكامل":"Full name"} *</label><input name="name" required autoComplete="name"/></div><div className="field"><label>{isArabic?"البريد الإلكتروني":"Email"} *</label><input name="email" type="email" required autoComplete="email"/></div>
  <div className="field"><label>WhatsApp *</label><input name="whatsapp" type="tel" required placeholder="+1 555 123 4567" autoComplete="tel"/></div><div className="field"><label>{isArabic?"الدولة":"Country"} *</label><input name="country" required autoComplete="country-name"/></div>
  <div className="field full"><label>{isArabic?"ملاحظات إضافية (اختياري)":"Anything we should know? (optional)"}</label><textarea name="notes" placeholder={isArabic?"أهداف الطالب أو أي احتياجات خاصة...":"Learning goals or special needs..."}/></div>
  <input className="honeypot" name="website" tabIndex={-1} autoComplete="off"/>
 </div>{error&&<div className="status-message error" role="alert">{error}</div>}<div className="booking-submit"><p><ShieldCheck/>{isArabic?"بياناتك خاصة وآمنة ولن تُشارك مع طرف ثالث.":"Your details are private and never shared with third parties."}</p><button className="button button-primary" disabled={!slot||sending}>{sending?<><LoaderCircle className="spin"/>{isArabic?"جارٍ التأكيد...":"Confirming..."}</>:isArabic?"تأكيد الحصة التجريبية":"Confirm trial lesson"}</button></div>
 </form>
}
