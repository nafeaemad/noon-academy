export function Logo({ light = false }: { light?: boolean }) {
  return <span className="logo-wrap" aria-label="Noon Academy"><span className={`logo-mark ${light ? "logo-light" : ""}`}>ن</span><span><strong>أكاديمية نون</strong><small>NOON ACADEMY</small></span></span>;
}
