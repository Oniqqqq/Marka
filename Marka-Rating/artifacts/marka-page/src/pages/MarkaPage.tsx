import { useEffect, useRef, useState } from "react";
import logoTag from "@assets/ChatGPT_Image_25_мая_2026_г.,_13_53_33_1779805490562.png";
import laureate from "@assets/0e0cf785-9df1-4fa3-84bc-0a9eb4e235b3_1779805490563.png";

// ─── Utility ────────────────────────────────────────────────────────────────
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

// ─── Inline styles helpers ───────────────────────────────────────────────────
const card: React.CSSProperties = {
  background: "var(--bg-card)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-lg)",
  padding: "24px",
};

const goldText: React.CSSProperties = {
  color: "var(--gold)",
};

const greenBadge: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  fontSize: 12,
  fontWeight: 500,
  color: "var(--green)",
  background: "var(--green-dim)",
  border: "1px solid rgba(34,197,94,0.2)",
  borderRadius: 100,
  padding: "3px 10px",
};

// ─── SVG Icons ───────────────────────────────────────────────────────────────
const IconShield = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <polyline points="9 12 11 14 15 10"/>
  </svg>
);
const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IconStar = ({ filled = true }: { filled?: boolean }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? "var(--gold)" : "none"} stroke="var(--gold)" strokeWidth="1.5">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const IconUsers = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const IconTrend = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
  </svg>
);
const IconBag = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 0 1-8 0"/>
  </svg>
);
const IconTrophy = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="8 21 12 17 16 21"/><line x1="12" y1="17" x2="12" y2="11"/>
    <path d="M6 4H4a2 2 0 0 0-2 2v2a6 6 0 0 0 6 6"/><path d="M18 4h2a2 2 0 0 1 2 2v2a6 6 0 0 1-6 6"/>
    <rect x="6" y="2" width="12" height="9" rx="2"/>
  </svg>
);
const IconScan = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/>
    <path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/>
    <line x1="7" y1="12" x2="17" y2="12"/>
  </svg>
);

// ─── LEGO Product Visual (CSS art) ──────────────────────────────────────────
function LegoProductVisual() {
  return (
    <div style={{ position: "relative", width: "100%", aspectRatio: "1.1 / 1", display: "flex", alignItems: "center", justifyContent: "center" }}>
      {/* Ambient glow */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse at 40% 50%, rgba(201,168,76,0.12) 0%, rgba(59,130,246,0.06) 50%, transparent 70%)",
        borderRadius: "50%", filter: "blur(30px)",
      }}/>
      {/* Camera body */}
      <svg viewBox="0 0 340 300" style={{ width: "90%", filter: "drop-shadow(0 20px 60px rgba(0,0,0,0.8)) drop-shadow(0 0 40px rgba(201,168,76,0.15))" }}>
        <defs>
          <linearGradient id="cam1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e8e8e8"/>
            <stop offset="50%" stopColor="#d0d0d0"/>
            <stop offset="100%" stopColor="#b0b0b0"/>
          </linearGradient>
          <linearGradient id="cam2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1a1a2e"/>
            <stop offset="100%" stopColor="#0d0d1a"/>
          </linearGradient>
          <linearGradient id="rainbow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#e74c3c"/>
            <stop offset="25%" stopColor="#f39c12"/>
            <stop offset="50%" stopColor="#2ecc71"/>
            <stop offset="75%" stopColor="#3498db"/>
            <stop offset="100%" stopColor="#9b59b6"/>
          </linearGradient>
          <radialGradient id="lens1" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#4a6fa5" stopOpacity="0.8"/>
            <stop offset="50%" stopColor="#1a3a6a" stopOpacity="0.9"/>
            <stop offset="100%" stopColor="#0a1a40"/>
          </radialGradient>
          <linearGradient id="gold1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e8c96e"/>
            <stop offset="100%" stopColor="#c9a84c"/>
          </linearGradient>
          <filter id="shadow1">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.4"/>
          </filter>
        </defs>
        {/* Camera main body */}
        <rect x="30" y="60" width="280" height="200" rx="18" fill="url(#cam1)" filter="url(#shadow1)"/>
        {/* Top section dark */}
        <rect x="30" y="60" width="280" height="70" rx="18" fill="url(#cam2)"/>
        <rect x="30" y="110" width="280" height="20" fill="url(#cam2)"/>
        {/* Film door */}
        <rect x="50" y="135" width="240" height="110" rx="8" fill="#c8c8c8"/>
        <rect x="60" y="145" width="220" height="90" rx="6" fill="#d8d8d8"/>
        {/* Rainbow stripe */}
        <rect x="60" y="218" width="220" height="18" rx="3" fill="url(#rainbow)"/>
        {/* Lens assembly */}
        <circle cx="160" cy="95" r="34" fill="#2a2a3e"/>
        <circle cx="160" cy="95" r="30" fill="url(#lens1)"/>
        <circle cx="160" cy="95" r="20" fill="#0a1a40"/>
        <circle cx="160" cy="95" r="12" fill="#050d20"/>
        <circle cx="153" cy="88" r="4" fill="rgba(255,255,255,0.25)"/>
        <circle cx="167" cy="100" r="2" fill="rgba(255,255,255,0.1)"/>
        {/* Viewfinder */}
        <rect x="210" y="68" width="50" height="35" rx="5" fill="#1a1a2e"/>
        <rect x="214" y="72" width="42" height="27" rx="3" fill="#0a0a1e"/>
        <rect x="216" y="74" width="38" height="23" rx="2" fill="#1a2a4e" opacity="0.8"/>
        {/* Flash bar */}
        <rect x="50" y="68" width="90" height="24" rx="5" fill="rgba(255,255,255,0.6)"/>
        <rect x="54" y="72" width="82" height="16" rx="3" fill="rgba(200,220,255,0.4)"/>
        {/* Shutter button */}
        <circle cx="270" cy="82" r="10" fill="url(#gold1)"/>
        <circle cx="270" cy="82" r="7" fill="#e8c96e" opacity="0.8"/>
        {/* Film slot */}
        <rect x="100" y="248" width="140" height="8" rx="4" fill="#a0a0a0"/>
        {/* LEGO studs on top */}
        {[0,1,2,3,4,5,6].map(i => (
          <circle key={i} cx={80 + i * 28} cy="58" r="5" fill="#c8c8c8" stroke="#a8a8a8" strokeWidth="1"/>
        ))}
        {/* Polaroid text area */}
        <rect x="65" y="148" width="80" height="22" rx="3" fill="rgba(0,0,0,0.08)"/>
        <text x="75" y="163" fontFamily="Arial" fontSize="10" fontWeight="bold" fill="#555" letterSpacing="1">POLAROID</text>
      </svg>
      {/* Floating photo cards */}
      <div style={{
        position: "absolute", bottom: "8%", left: "2%",
        width: 80, height: 96,
        background: "linear-gradient(135deg, #1a1a2a, #0d0d18)",
        border: "1px solid rgba(201,168,76,0.25)",
        borderRadius: 8,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end",
        padding: "6px 4px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
        transform: "rotate(-8deg)",
      }}>
        <div style={{ width: "100%", height: 70, background: "linear-gradient(135deg, #2a3a5a 0%, #1a2a4a 100%)", borderRadius: 4, marginBottom: 4, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 40% 40%, rgba(59,130,246,0.3), transparent)" }}/>
          {/* Mini LEGO brick pattern */}
          {[0,1,2,3].map(row => [0,1,2,3].map(col => (
            <div key={`${row}-${col}`} style={{ position: "absolute", left: col*17+4, top: row*13+4, width: 11, height: 9, background: "rgba(255,200,50,0.15)", borderRadius: 2, border: "1px solid rgba(255,200,50,0.1)" }}/>
          )))}
        </div>
        <div style={{ width: "90%", height: 3, background: "rgba(201,168,76,0.4)", borderRadius: 2 }}/>
      </div>
      <div style={{
        position: "absolute", bottom: "2%", right: "3%",
        width: 70, height: 85,
        background: "linear-gradient(135deg, #1a2a1a, #0d1a0d)",
        border: "1px solid rgba(34,197,94,0.2)",
        borderRadius: 8,
        boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
        transform: "rotate(6deg)",
        overflow: "hidden",
      }}>
        <div style={{ width: "100%", height: 62, background: "linear-gradient(135deg, #1a3a2a 0%, #0d2a1a 100%)", position: "relative" }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 60% 40%, rgba(34,197,94,0.25), transparent)" }}/>
        </div>
        <div style={{ padding: "4px 6px" }}>
          <div style={{ width: "70%", height: 3, background: "rgba(34,197,94,0.4)", borderRadius: 2, marginBottom: 3 }}/>
          <div style={{ width: "50%", height: 3, background: "rgba(34,197,94,0.2)", borderRadius: 2 }}/>
        </div>
      </div>
    </div>
  );
}

// ─── Sparkline chart ─────────────────────────────────────────────────────────
function TrustIndexChart() {
  const points = [62, 65, 68, 70, 72, 75, 78, 80, 83, 86, 88, 90, 92, 93, 95, 96, 97, 98, 98.5, 98.7];
  const labels = ["Янв", "Мар", "Май", "Июл", "Сен", "Ноя", "Янв '26"];
  const w = 320, h = 120;
  const minV = 60, maxV = 100;
  const toX = (i: number) => 20 + (i / (points.length - 1)) * (w - 40);
  const toY = (v: number) => h - 20 - ((v - minV) / (maxV - minV)) * (h - 35);
  const pathD = points.map((v, i) => `${i === 0 ? "M" : "L"} ${toX(i)} ${toY(v)}`).join(" ");
  const areaD = `${pathD} L ${toX(points.length - 1)} ${h - 20} L ${toX(0)} ${h - 20} Z`;
  return (
    <div style={{ position: "relative" }}>
      <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", overflow: "visible" }}>
        <defs>
          <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c9a84c" stopOpacity="0.25"/>
            <stop offset="100%" stopColor="#c9a84c" stopOpacity="0"/>
          </linearGradient>
          <filter id="glow2">
            <feGaussianBlur stdDeviation="2" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        {/* Grid lines */}
        {[60, 70, 80, 90, 100].map(v => (
          <line key={v} x1={20} y1={toY(v)} x2={w - 20} y2={toY(v)}
            stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="3,3"/>
        ))}
        {/* Y labels */}
        {[60, 75, 90].map(v => (
          <text key={v} x={16} y={toY(v) + 4} fontSize="9" fill="rgba(255,255,255,0.3)" textAnchor="end">{v}%</text>
        ))}
        {/* Area fill */}
        <path d={areaD} fill="url(#chartFill)"/>
        {/* Line */}
        <path d={pathD} fill="none" stroke="url(#lineGrad)" strokeWidth="2.5" strokeLinecap="round" filter="url(#glow2)"/>
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#c9a84c" stopOpacity="0.6"/>
            <stop offset="100%" stopColor="#e8c96e"/>
          </linearGradient>
        </defs>
        {/* End dot */}
        <circle cx={toX(points.length - 1)} cy={toY(points[points.length - 1])} r="4" fill="var(--gold)" filter="url(#glow2)"/>
        <circle cx={toX(points.length - 1)} cy={toY(points[points.length - 1])} r="7" fill="rgba(201,168,76,0.2)"/>
        {/* X labels */}
        {labels.map((label, i) => {
          const idx = Math.round((i / (labels.length - 1)) * (points.length - 1));
          return (
            <text key={label} x={toX(idx)} y={h - 2} fontSize="9" fill="rgba(255,255,255,0.3)" textAnchor="middle">{label}</text>
          );
        })}
        {/* End label */}
        <text x={toX(points.length - 1) + 8} y={toY(points[points.length - 1]) - 6}
          fontSize="11" fontWeight="700" fill="var(--gold-light)">98.7%</text>
      </svg>
    </div>
  );
}

// ─── Rating bars ─────────────────────────────────────────────────────────────
const ratingData = [
  { stars: 5, pct: 78.6, count: 9965 },
  { stars: 4, pct: 18.7, count: 2371 },
  { stars: 3, pct: 3.6, count: 456 },
  { stars: 2, pct: 0.7, count: 89 },
  { stars: 1, pct: 0.4, count: 51 },
];

function RatingBars({ visible }: { visible: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {ratingData.map((row) => (
        <div key={row.stars} style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 3, width: 48, flexShrink: 0 }}>
            <span style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 500 }}>{row.stars}</span>
            <IconStar/>
          </div>
          <div style={{ flex: 1, height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
            <div style={{
              height: "100%",
              width: visible ? `${row.pct}%` : "0%",
              background: row.stars >= 4 ? "linear-gradient(90deg, var(--gold), var(--gold-light))" :
                          row.stars === 3 ? "rgba(201,168,76,0.5)" : "rgba(201,168,76,0.2)",
              borderRadius: 3,
              transition: `width ${0.4 + (5 - row.stars) * 0.1}s cubic-bezier(0.4,0,0.2,1) 0.3s`,
            }}/>
          </div>
          <span style={{ width: 38, fontSize: 12, color: "var(--text-secondary)", textAlign: "right", flexShrink: 0 }}>{row.pct}%</span>
        </div>
      ))}
    </div>
  );
}

// ─── Review card ─────────────────────────────────────────────────────────────
interface Review {
  name: string;
  date: string;
  rating: number;
  text: string;
  badges: string[];
  avatar: string;
}

const reviews: Review[] = [
  {
    name: "Максим С.",
    date: "12.05.2025",
    rating: 5,
    text: "Отличный набор и потрясающая детализация. Сборка увлекательная, результат — как настоящая ретро-камера. Рекомендую!",
    badges: ["Покупка подтверждена", "Оценка по скану"],
    avatar: "МС",
  },
  {
    name: "Алексей К.",
    date: "07.05.2025",
    rating: 5,
    text: "Очень стильная модель, ностальгия в каждой детали. Качество LEGO на высоте, всё продумано до мелочей.",
    badges: ["Покупка подтверждена", "Продавец подтвержден"],
    avatar: "АК",
  },
  {
    name: "Ольга П.",
    date: "02.05.2025",
    rating: 5,
    text: "Покупала в подарок мужу — в восторге! Инструкция понятная, процесс сборки захватывающий.",
    badges: ["Покупка подтверждена"],
    avatar: "ОП",
  },
  {
    name: "Дмитрий В.",
    date: "28.04.2025",
    rating: 4,
    text: "Красивая модель. Несколько деталей пришлось переставлять дважды — мелкие, но инструкция подробная.",
    badges: ["Оценка по скану", "Продавец подтвержден"],
    avatar: "ДВ",
  },
  {
    name: "Наталья Р.",
    date: "15.04.2025",
    rating: 5,
    text: "Подарила себе на день рождения. Уже третья модель из серии Ideas — снова не разочаровала.",
    badges: ["Покупка подтверждена", "Оценка по скану"],
    avatar: "НР",
  },
  {
    name: "Сергей М.",
    date: "09.04.2025",
    rating: 5,
    text: "Коллекционная вещь. Камера стоит на полке рядом с оригинальным Polaroid — смотрится великолепно.",
    badges: ["Оценка по скану"],
    avatar: "СМ",
  },
];

function ReviewCard({ review }: { review: Review }) {
  const colors = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#06b6d4"];
  const color = colors[review.name.charCodeAt(0) % colors.length];
  return (
    <div style={{
      ...card,
      padding: "20px",
      display: "flex",
      flexDirection: "column",
      gap: 14,
      transition: "border-color 0.2s, transform 0.2s",
      cursor: "default",
    }}
    onMouseEnter={e => {
      (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.14)";
      (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
    }}
    onMouseLeave={e => {
      (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)";
      (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            background: `linear-gradient(135deg, ${color}33, ${color}66)`,
            border: `1px solid ${color}44`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, fontWeight: 700, color,
          }}>{review.avatar}</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{review.name}</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{review.date}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 1 }}>
          {[1,2,3,4,5].map(s => <IconStar key={s} filled={s <= review.rating}/>)}
        </div>
      </div>
      <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.65 }}>{review.text}</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {review.badges.map(b => (
          <span key={b} style={greenBadge}>
            <IconScan/>{b}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────
export default function MarkaPage() {
  const kpiRef = useInView();
  const analyticsRef = useInView();
  const reviewsRef = useInView();
  const methodRef = useInView();

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)" }}>
      {/* ── Background ambient ── */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        background: "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(201,168,76,0.05) 0%, transparent 60%)",
      }}/>

      {/* ────────────────── HEADER ────────────────── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(10,10,12,0.85)",
        backdropFilter: "blur(20px) saturate(150%)",
        borderBottom: "1px solid var(--border)",
      }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* Logo */}
          <a href="#" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <img src={logoTag} alt="Marka.ONE" style={{ height: 34, width: "auto", objectFit: "contain" }}/>
            <div>
              <span style={{ fontSize: 16, fontWeight: 800, color: "var(--gold-light)", letterSpacing: "-0.02em" }}>Marka</span>
              <span style={{ fontSize: 16, fontWeight: 400, color: "var(--text-secondary)" }}>.ONE</span>
            </div>
          </a>
          {/* Nav */}
          <nav style={{ display: "flex", alignItems: "center", gap: 2 }}>
            {["Рейтинг товаров", "Категории", "Номинации", "Методология", "О платформе"].map((item, i) => (
              <a key={item} href="#" style={{
                padding: "6px 14px",
                fontSize: 13, fontWeight: i === 2 ? 600 : 400,
                color: i === 2 ? "var(--gold)" : "var(--text-secondary)",
                borderRadius: 8,
                textDecoration: "none",
                borderBottom: i === 2 ? "1px solid var(--gold)" : "1px solid transparent",
                transition: "color 0.2s",
              }}
              onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-primary)"}
              onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = i === 2 ? "var(--gold)" : "var(--text-secondary)"}
              >{item}</a>
            ))}
          </nav>
          {/* Right */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 36, height: 36,
              background: "var(--green-dim)", borderRadius: "50%",
              border: "1px solid rgba(34,197,94,0.25)",
              color: "var(--green)",
            }}>
              <IconShield/>
            </div>
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "6px 14px",
              background: "var(--bg-card)", border: "1px solid var(--border)",
              borderRadius: 100, fontSize: 13, color: "var(--text-secondary)",
            }}>
              <div style={{ width: 22, height: 22, borderRadius: "50%", background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fff" }}>M</div>
              Marka.ONE
            </div>
          </div>
        </div>
      </header>

      <main style={{ position: "relative", zIndex: 1 }}>
        {/* ────────────────── BREADCRUMBS ────────────────── */}
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "16px 32px" }}>
          <nav style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--text-muted)" }}>
            {["Главная", "Номинации", "LEGO Ideas"].map((item, i, arr) => (
              <span key={item} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <a href="#" style={{ color: i < arr.length - 1 ? "var(--text-muted)" : "var(--text-secondary)", textDecoration: "none", transition: "color 0.2s" }}
                  onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = "var(--gold)"}
                  onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = i < arr.length - 1 ? "var(--text-muted)" : "var(--text-secondary)"}
                >{item}</a>
                {i < arr.length - 1 && <span style={{ opacity: 0.3 }}>›</span>}
              </span>
            ))}
          </nav>
        </div>

        {/* ────────────────── HERO ────────────────── */}
        <section style={{ maxWidth: 1280, margin: "0 auto", padding: "16px 32px 56px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "400px 1fr 300px", gap: 32, alignItems: "start" }}>

            {/* LEFT — product visuals */}
            <div>
              <div style={{
                borderRadius: 20,
                border: "1px solid var(--border)",
                background: "linear-gradient(135deg, var(--bg-card) 0%, rgba(22,22,29,0.5) 100%)",
                overflow: "hidden",
                position: "relative",
              }}>
                <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 30% 70%, rgba(201,168,76,0.06), transparent 60%)", pointerEvents: "none" }}/>
                <LegoProductVisual/>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
                {["детали набора", "собранная модель"].map((label, i) => (
                  <div key={label} style={{
                    borderRadius: 12, border: "1px solid var(--border)",
                    background: "var(--bg-card)", aspectRatio: "4/3",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    position: "relative", overflow: "hidden",
                  }}>
                    <div style={{ position: "absolute", inset: 0, background: i === 0 ? "radial-gradient(circle at 50% 50%, rgba(201,168,76,0.08), transparent)" : "radial-gradient(circle at 50% 50%, rgba(34,197,94,0.06), transparent)" }}/>
                    {i === 0 ? (
                      <svg viewBox="0 0 80 60" style={{ width: 70, opacity: 0.7 }}>
                        {[[0,10],[20,10],[40,10],[60,10],[10,30],[30,30],[50,30]].map(([x,y],j) => (
                          <g key={j}>
                            <rect x={x} y={y} width={16} height={12} rx={2} fill={["#e74c3c","#f39c12","#2ecc71","#3498db","#9b59b6","#e74c3c","#f39c12"][j]} opacity="0.8"/>
                            <circle cx={x+8} cy={y} r={3} fill={["#e74c3c","#f39c12","#2ecc71","#3498db","#9b59b6","#e74c3c","#f39c12"][j]}/>
                          </g>
                        ))}
                      </svg>
                    ) : (
                      <svg viewBox="0 0 80 60" style={{ width: 70, opacity: 0.7 }}>
                        <rect x={10} y={15} width={60} height={32} rx={6} fill="#d0d0d0"/>
                        <circle cx={40} cy={31} r={12} fill="#2a2a3e"/>
                        <circle cx={40} cy={31} r={9} fill="#1a3a6a"/>
                        <circle cx={37} cy={28} r={3} fill="rgba(255,255,255,0.3)"/>
                        <rect x={55} y={18} width={12} height={8} rx={2} fill="#1a1a2e"/>
                      </svg>
                    )}
                    <div style={{ position: "absolute", bottom: 6, left: 0, right: 0, textAlign: "center", fontSize: 10, color: "var(--text-muted)" }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* CENTER — title + rating */}
            <div>
              {/* Nomination badge */}
              <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                <span style={{ ...greenBadge, padding: "4px 12px", fontSize: 11 }}>
                  <IconShield/>Номинация 2026
                </span>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  fontSize: 11, fontWeight: 500,
                  color: "var(--gold)", background: "var(--gold-dim)", border: "1px solid rgba(201,168,76,0.25)",
                  borderRadius: 100, padding: "4px 12px",
                }}>
                  ★ LEGO Ideas
                </span>
              </div>

              <h1 style={{
                fontSize: 40, fontWeight: 800, lineHeight: 1.1,
                letterSpacing: "-0.03em", color: "var(--text-primary)",
                marginBottom: 6,
              }}>
                LEGO Ideas 21345
              </h1>
              <h2 style={{
                fontSize: 24, fontWeight: 400, color: "var(--text-secondary)",
                marginBottom: 6, letterSpacing: "-0.01em",
              }}>
                Камера Polaroid OneStep SX-70
              </h2>
              <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 28, maxWidth: 480, lineHeight: 1.6 }}>
                Рейтинг товара на основе реальных пользовательских оценок, подтвержденных по методологии Marka Rating.
              </p>

              {/* Rating block */}
              <div style={{
                ...card,
                padding: "24px 28px",
                background: "linear-gradient(135deg, rgba(22,22,29,1) 0%, rgba(18,18,24,1) 100%)",
                border: "1px solid rgba(201,168,76,0.2)",
                position: "relative", overflow: "hidden", marginBottom: 20,
                boxShadow: "0 0 40px rgba(201,168,76,0.06)",
              }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, transparent, var(--gold), transparent)" }}/>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 10 }}>
                  Итоговый рейтинг
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: 64, fontWeight: 900, letterSpacing: "-0.04em", color: "var(--gold-light)", lineHeight: 1 }}>9.2</span>
                  <span style={{ fontSize: 24, color: "var(--text-muted)", fontWeight: 300 }}>/10</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 3, marginBottom: 8 }}>
                  {[1,2,3,4,5].map(s => <IconStar key={s}/>)}
                  <span style={{ marginLeft: 6, fontSize: 13, fontWeight: 600, color: "var(--gold)" }}>Превосходно</span>
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>На основе <b style={{ color: "var(--text-secondary)" }}>12&nbsp;678</b> проверенных отзывов</div>
              </div>

              {/* Trust bullets */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  "Оценки связаны со сканом товара",
                  "Подтвержденные покупки учитываются отдельно",
                  "Продавцы оцениваются при подтвержденном месте покупки",
                  "Открытая методология",
                  "Без накруток и рекламного влияния",
                ].map(text => (
                  <div key={text} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "var(--text-secondary)" }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: "50%",
                      background: "var(--green-dim)", border: "1px solid rgba(34,197,94,0.25)",
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                      color: "var(--green)",
                    }}>
                      <IconCheck/>
                    </div>
                    {text}
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT — badge + specs */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Laureate badge */}
              <div style={{
                borderRadius: 20,
                background: "linear-gradient(135deg, var(--bg-card), rgba(22,22,29,0.8))",
                border: "1px solid rgba(201,168,76,0.3)",
                padding: "24px 20px",
                display: "flex", flexDirection: "column", alignItems: "center",
                gap: 12, textAlign: "center",
                boxShadow: "0 0 60px rgba(201,168,76,0.08), inset 0 0 40px rgba(201,168,76,0.03)",
                position: "relative", overflow: "hidden",
              }}>
                <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 30%, rgba(201,168,76,0.08), transparent 70%)", pointerEvents: "none" }}/>
                <img src={laureate} alt="Лауреат Marka.ONE 2026" style={{
                  width: 160, height: "auto", objectFit: "contain",
                  filter: "drop-shadow(0 8px 32px rgba(201,168,76,0.3))",
                }}/>
                <div style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.5 }}>
                  Официальный лауреат<br/>платформы Marka.ONE
                </div>
              </div>

              {/* Product specs */}
              <div style={{ ...card, padding: "20px" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 16, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                  О товаре
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                  {[
                    ["Возраст", "18+"],
                    ["Номер набора", "21345"],
                    ["Деталей", "516"],
                    ["Серия", "LEGO Ideas"],
                    ["Категория", "Конструкторы"],
                    ["Выход", "15.01.2025"],
                  ].map(([k, v], i, arr) => (
                    <div key={k} style={{
                      display: "flex", justifyContent: "space-between",
                      alignItems: "center",
                      padding: "10px 0",
                      borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none",
                    }}>
                      <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{k}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ────────────────── KPI ROW ────────────────── */}
        <section style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px 56px" }}>
          <div ref={kpiRef.ref} style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
            {[
              { icon: <IconUsers/>, value: "12 678", label: "Проверенных отзывов", color: "var(--blue)", sub: null },
              { icon: <IconShield/>, value: "98.7%", label: "Индекс доверия", color: "var(--green)", sub: "↑ 0.3% за месяц" },
              { icon: <IconBag/>, value: "12 349", label: "Подтвержд. покупок", color: "var(--gold)", sub: null },
              { icon: <IconTrophy/>, value: "№1", label: "в категории LEGO", color: "var(--gold-light)", sub: "Конструкторы LEGO" },
            ].map((kpi, i) => (
              <div key={i} style={{
                ...card,
                position: "relative", overflow: "hidden",
                opacity: kpiRef.visible ? 1 : 0,
                transform: kpiRef.visible ? "translateY(0)" : "translateY(24px)",
                transition: `opacity 0.5s ${i * 0.1}s, transform 0.5s ${i * 0.1}s`,
              }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${kpi.color}44, transparent)` }}/>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: `${kpi.color}15`, border: `1px solid ${kpi.color}25`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: kpi.color, marginBottom: 16,
                }}>
                  {kpi.icon}
                </div>
                <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.03em", color: kpi.color, lineHeight: 1, marginBottom: 6 }}>
                  {kpi.value}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: kpi.sub ? 4 : 0 }}>{kpi.label}</div>
                {kpi.sub && <div style={{ fontSize: 11, color: kpi.color, opacity: 0.7 }}>{kpi.sub}</div>}
              </div>
            ))}
          </div>
        </section>

        {/* ────────────────── ANALYTICS ────────────────── */}
        <section style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px 56px" }}>
          <div ref={analyticsRef.ref} style={{ opacity: analyticsRef.visible ? 1 : 0, transition: "opacity 0.6s" }}>
            <h3 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", marginBottom: 24, letterSpacing: "-0.02em" }}>
              Аналитика рейтинга
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
              {/* Rating distribution */}
              <div style={{ ...card }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 18 }}>
                  Распределение оценок
                </div>
                <RatingBars visible={analyticsRef.visible}/>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--border)" }}>
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: "var(--gold-light)", letterSpacing: "-0.02em" }}>9.2</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>средняя оценка</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>97.3%</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>4 и 5 звезд</div>
                  </div>
                </div>
              </div>

              {/* Trust index chart */}
              <div style={{ ...card }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>
                  Динамика индекса доверия
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 14 }}>Янв 2025 — Май 2026</div>
                <TrustIndexChart/>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, padding: "10px 12px", background: "var(--green-dim)", borderRadius: 8, border: "1px solid rgba(34,197,94,0.15)" }}>
                  <div style={{ color: "var(--green)" }}><IconTrend/></div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--green)" }}>+36.7% за год</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>стабильный рост</div>
                  </div>
                </div>
              </div>

              {/* Category comparison */}
              <div style={{ ...card }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 18 }}>
                  Сравнение по категории
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {[
                    { label: "LEGO Ideas 21345", value: 9.2, pct: 92, highlight: true },
                    { label: "Ср. по категории", value: 8.1, pct: 81, highlight: false },
                    { label: "Ср. по сегменту", value: 7.6, pct: 76, highlight: false },
                  ].map(row => (
                    <div key={row.label}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontSize: 12, color: row.highlight ? "var(--text-primary)" : "var(--text-muted)", fontWeight: row.highlight ? 600 : 400 }}>{row.label}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: row.highlight ? "var(--gold-light)" : "var(--text-secondary)" }}>{row.value}/10</span>
                      </div>
                      <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{
                          height: "100%",
                          width: analyticsRef.visible ? `${row.pct}%` : "0%",
                          background: row.highlight ? "linear-gradient(90deg, var(--gold), var(--gold-light))" : "rgba(255,255,255,0.15)",
                          borderRadius: 3,
                          transition: `width 0.8s cubic-bezier(0.4,0,0.2,1) 0.4s`,
                          boxShadow: row.highlight ? "0 0 8px rgba(201,168,76,0.5)" : "none",
                        }}/>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--border)", fontSize: 11, color: "var(--text-muted)" }}>
                  На основе 12&nbsp;678 оценок
                </div>
              </div>
            </div>

            {/* Why rated high */}
            <div style={{ ...card }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 16 }}>
                Почему оценивают высоко
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
                {[
                  { tag: "Высокая детализация", pct: 89, icon: "🔬" },
                  { tag: "Коллекционная ценность", pct: 84, icon: "🏆" },
                  { tag: "Качество сборки", pct: 92, icon: "⚙️" },
                  { tag: "Ностальгический эффект", pct: 78, icon: "✨" },
                ].map(item => (
                  <div key={item.tag} style={{
                    padding: "16px",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                  }}>
                    <div style={{ fontSize: 22, marginBottom: 10 }}>{item.icon}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 8, lineHeight: 1.3 }}>{item.tag}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ flex: 1, height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
                        <div style={{
                          height: "100%",
                          width: analyticsRef.visible ? `${item.pct}%` : "0%",
                          background: "var(--gold)",
                          borderRadius: 2,
                          transition: "width 1s cubic-bezier(0.4,0,0.2,1) 0.6s",
                        }}/>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "var(--gold)" }}>{item.pct}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ────────────────── SELLER TRUST ────────────────── */}
        <section style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px 56px" }}>
          <div style={{
            ...card,
            display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
            gap: 32,
            background: "linear-gradient(135deg, var(--bg-card) 0%, rgba(34,197,94,0.04) 100%)",
            borderColor: "rgba(34,197,94,0.15)",
            position: "relative", overflow: "hidden",
            padding: "32px",
          }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(34,197,94,0.4), transparent)" }}/>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: "var(--green-dim)", border: "1px solid rgba(34,197,94,0.25)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "var(--green)",
                }}>
                  <IconShield/>
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>Доверие к продавцам</h3>
              </div>
              <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.65 }}>
                Рейтинг продавцов считается отдельно и только при подтвержденном месте покупки. Это гарантирует объективность.
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { label: "Уровень доверия", value: "Высокий", valueStyle: { color: "var(--green)", fontWeight: 700 } },
                { label: "Проверенных продавцов", value: "24", valueStyle: { color: "var(--text-primary)", fontWeight: 700 } },
                { label: "Покрытие оценок", value: "97.4%", valueStyle: { color: "var(--text-primary)", fontWeight: 700 } },
              ].map(item => (
                <div key={item.label} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "12px 16px",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                }}>
                  <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{item.label}</span>
                  <span style={{ fontSize: 14, ...item.valueStyle }}>{item.value}</span>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ padding: "16px", background: "var(--green-dim)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <div style={{ color: "var(--green)" }}><IconCheck/></div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--green)" }}>Все продавцы проходят проверку</span>
                </div>
                <p style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5 }}>
                  Верификация проводится через scan & purchase proof. Непроверенные продавцы не влияют на рейтинг.
                </p>
              </div>
              <div style={{ padding: "16px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Среднее время ответа</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)" }}>2.4 ч</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>по подтвержденным продавцам</div>
              </div>
            </div>
          </div>
        </section>

        {/* ────────────────── REVIEWS ────────────────── */}
        <section style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px 56px" }}>
          <div ref={reviewsRef.ref} style={{ opacity: reviewsRef.visible ? 1 : 0, transition: "opacity 0.6s" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div>
                <h3 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
                  Реальные оценки пользователей
                </h3>
                <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
                  Только подтвержденные оценки — со сканом или покупкой
                </p>
              </div>
              <a href="#" style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "8px 18px",
                background: "var(--bg-card)", border: "1px solid var(--border)",
                borderRadius: 10, fontSize: 13, fontWeight: 500,
                color: "var(--text-secondary)", textDecoration: "none",
                transition: "border-color 0.2s, color 0.2s",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.14)"; (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-primary)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-secondary)"; }}
              >
                Смотреть все отзывы →
              </a>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
              {reviews.map(r => <ReviewCard key={r.name} review={r}/>)}
            </div>
          </div>
        </section>

        {/* ────────────────── METHODOLOGY ────────────────── */}
        <section style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px 80px" }}>
          <div ref={methodRef.ref} style={{ opacity: methodRef.visible ? 1 : 0, transform: methodRef.visible ? "translateY(0)" : "translateY(20px)", transition: "opacity 0.6s, transform 0.6s" }}>
            <div style={{
              ...card,
              background: "linear-gradient(135deg, rgba(22,22,29,1) 0%, rgba(15,15,22,1) 100%)",
              border: "1px solid rgba(201,168,76,0.15)",
              padding: "40px",
              position: "relative", overflow: "hidden",
            }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.5), transparent)" }}/>
              <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 0%, rgba(201,168,76,0.04), transparent 60%)", pointerEvents: "none" }}/>
              <div style={{ textAlign: "center", marginBottom: 36 }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "4px 16px", background: "var(--gold-dim)", border: "1px solid rgba(201,168,76,0.25)", borderRadius: 100, fontSize: 11, fontWeight: 600, color: "var(--gold)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>
                  Методология
                </div>
                <h3 style={{ fontSize: 26, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
                  Как работает Marka Rating
                </h3>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16 }}>
                {[
                  { n: "01", title: "Как считается рейтинг", text: "Взвешенная сумма оценок с корректировкой на уровень подтверждения каждой оценки.", icon: "⚖️" },
                  { n: "02", title: "Что подтверждает скан", text: "Сканирование упаковки привязывает оценку к конкретному товару и исключает дубли.", icon: "📱" },
                  { n: "03", title: "Как учитывается покупка", text: "Подтвержденная покупка повышает вес оценки и активирует отдельный трек для продавца.", icon: "🛍️" },
                  { n: "04", title: "Рейтинг продавца", text: "Продавец получает оценку только при подтвержденной привязке покупки к конкретной точке.", icon: "🏪" },
                  { n: "05", title: "Важный дисклеймер", text: "Платформа подтверждает происхождение оценки, а не выдает государственную гарантию качества.", icon: "ℹ️" },
                ].map((item, i) => (
                  <div key={i} style={{
                    padding: "20px 16px",
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    position: "relative",
                  }}>
                    <div style={{ fontSize: 24, marginBottom: 12 }}>{item.icon}</div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "var(--gold)", letterSpacing: "0.1em", marginBottom: 6 }}>{item.n}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 8, lineHeight: 1.3 }}>{item.title}</div>
                    <p style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6 }}>{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ────────────────── FOOTER ────────────────── */}
      <footer style={{
        borderTop: "1px solid var(--border)",
        background: "var(--bg-surface)",
        padding: "40px 0 24px",
      }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 48, marginBottom: 40 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <img src={logoTag} alt="Marka.ONE" style={{ height: 28, width: "auto" }}/>
                <div>
                  <span style={{ fontSize: 15, fontWeight: 800, color: "var(--gold-light)" }}>Marka</span>
                  <span style={{ fontSize: 15, fontWeight: 400, color: "var(--text-muted)" }}>.ONE</span>
                </div>
              </div>
              <p style={{ fontSize: 13, color: "var(--text-muted)", maxWidth: 280, lineHeight: 1.7 }}>
                Платформа рейтинга товаров, продавцов и брендов на основе реальных пользовательских оценок, подтвержденных через scan & purchase proof logic.
              </p>
            </div>
            {[
              { title: "Платформа", links: ["Методология", "Номинации", "О платформе", "Прозрачность"] },
              { title: "Бизнес", links: ["Для продавцов", "Для брендов", "API доступ", "Партнёрам"] },
              { title: "Поддержка", links: ["Помощь", "Контакты", "Условия", "Конфиденциальность"] },
            ].map(col => (
              <div key={col.title}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>{col.title}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {col.links.map(link => (
                    <a key={link} href="#" style={{
                      fontSize: 13, color: "var(--text-muted)", textDecoration: "none",
                      transition: "color 0.2s",
                    }}
                    onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-secondary)"}
                    onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-muted)"}
                    >{link}</a>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 20, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 24 }}>
            <p style={{ fontSize: 11, color: "var(--text-muted)", maxWidth: 640, lineHeight: 1.6 }}>
              <b style={{ color: "var(--text-muted)", fontWeight: 600 }}>Дисклеймер:</b> Marka.ONE подтверждает происхождение оценки — факт покупки, сканирование товара или верификацию продавца. Платформа не является органом государственной сертификации и не гарантирует качество товара в юридическом смысле. Оценки пользователей носят информационный характер.
            </p>
            <div style={{ fontSize: 11, color: "var(--text-muted)", whiteSpace: "nowrap" }}>© 2026 Marka.ONE</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
