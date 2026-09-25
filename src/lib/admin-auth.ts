import{createHash,timingSafeEqual}from"crypto";
export function adminToken(){const password=process.env.ADMIN_PASSWORD||"";const secret=process.env.ADMIN_SECRET||process.env.DATABASE_URL||"noon";return createHash("sha256").update(`${password}:${secret}`).digest("hex")}
export function validToken(value?:string){if(!process.env.ADMIN_PASSWORD||!value)return false;const expected=adminToken();try{return timingSafeEqual(Buffer.from(value),Buffer.from(expected))}catch{return false}}
