import type { Metadata } from "next";
import { BookingForm } from "@/components/booking-form";
import { PageHero } from "@/components/page-hero";
export const metadata:Metadata={title:"Book a Trial Lesson",description:"Choose an available time and book your personal Quran trial lesson."};
export default function BookingPage(){return <main><PageHero label={{ar:"الحجز",en:"BOOKING"}} title={{ar:"ابدأ بحصة تجريبية",en:"Your first lesson starts here"}} description={{ar:"اختر ما يناسبك في دقائق. سنقيّم المستوى ونقترح مسارًا شخصيًا دون أي التزام.",en:"Choose what works for you in a few minutes. We will assess your level and recommend a personal path—with no obligation."}}/><section className="page-content booking-page"><div className="container"><BookingForm/></div></section></main>}
