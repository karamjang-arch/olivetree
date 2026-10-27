// 정착 카테고리별 선 그림(사진이 없을 때 쓰는 일러스트). 원본 사진 없이 직접 그린 그림이다.
const S = { fill: "none", strokeWidth: 2.4, strokeLinecap: "round", strokeLinejoin: "round" };

const ART = {
  arrival: (
    <>
      <path d="M40 120 Q160 60 280 40" strokeDasharray="4 8" />
      <path d="M232 52 l40 -14 6 6 -30 22 4 22 -8 4 -10 -18 -18 10 -6 -4 12 -18z" />
      <rect x="62" y="92" width="54" height="44" rx="6" />
      <path d="M78 92 v-8 h22 v8 M70 106 h38 M80 136 v6 M98 136 v6" />
      <circle cx="210" cy="118" r="10" /><path d="M150 140 h120" />
    </>
  ),
  admin: (
    <>
      <rect x="70" y="34" width="92" height="112" rx="6" />
      <path d="M86 58 h60 M86 74 h60 M86 90 h44 M86 106 h52" />
      <rect x="186" y="62" width="76" height="50" rx="7" />
      <circle cx="206" cy="84" r="9" /><path d="M222 80 h30 M222 92 h22 M196 102 h20" />
      <path d="M140 118 l10 10 22 -26" />
    </>
  ),
  housing: (
    <>
      <path d="M70 140 V84 L130 40 L190 84 V140 Z" />
      <rect x="116" y="104" width="28" height="36" rx="2" />
      <rect x="86" y="88" width="20" height="18" /><rect x="154" y="88" width="20" height="18" />
      <path d="M40 140 h240" />
      <circle cx="232" cy="92" r="12" /><path d="M244 92 h26 M262 92 v8 M254 92 v6" />
      <path d="M216 140 c0 -24 14 -34 14 -34 c0 0 14 10 14 34" />
    </>
  ),
  daily_life: (
    <>
      <path d="M66 70 h64 l-6 72 h-52 z" /><path d="M84 70 c0 -22 28 -22 28 0" />
      <rect x="160" y="70" width="110" height="54" rx="10" />
      <path d="M170 86 h90 M160 106 h110" /><circle cx="184" cy="128" r="8" /><circle cx="246" cy="128" r="8" />
      <path d="M40 142 h240" />
      <path d="M296 142 v-30 M296 112 c-14 -4 -14 -22 0 -26 c14 4 14 22 0 26" />
    </>
  ),
  education: (
    <>
      <path d="M60 128 V54 c22 -8 44 -8 66 6 c22 -14 44 -14 66 -6 v74 c-22 -8 -44 -8 -66 6 c-22 -14 -44 -14 -66 -6 z" />
      <path d="M126 60 v74" />
      <path d="M220 68 l40 -18 40 18 -40 18 z" /><path d="M236 76 v24 c16 10 32 10 48 0 v-24 M300 68 v26" />
      <path d="M76 76 h34 M76 92 h34 M142 76 h34 M142 92 h26" />
    </>
  ),
  healthcare: (
    <>
      <circle cx="120" cy="88" r="46" />
      <path d="M110 64 h20 v14 h14 v20 h-14 v14 h-20 v-14 h-14 v-20 h14 z" />
      <path d="M196 50 v34 c0 22 34 22 34 0 v-34 M213 106 v14 c0 18 44 18 44 -6 v-16" />
      <circle cx="257" cy="90" r="8" />
    </>
  ),
  pro_tips: (
    <>
      <path d="M160 36 c-28 0 -44 22 -40 44 c3 16 16 22 18 40 h44 c2 -18 15 -24 18 -40 c4 -22 -12 -44 -40 -44 z" />
      <path d="M140 132 h40 M144 144 h32 M160 120 v-28 l-10 -10 M160 92 l10 -10" />
      <path d="M96 52 l-14 -8 M90 84 h-16 M224 52 l14 -8 M230 84 h16 M160 20 v-8" />
    </>
  ),
};

export default function SettleArt({ cat, hue, tint, className = "" }) {
  return (
    <svg className={`sart ${className}`} viewBox="0 0 320 170" preserveAspectRatio="xMidYMid meet" role="img" aria-hidden="true" style={{ background: tint }}>
      <circle cx="250" cy="44" r="58" fill="#fff" opacity=".45" />
      <circle cx="58" cy="140" r="44" fill="#fff" opacity=".35" />
      <g {...S} stroke={hue}>{ART[cat] || ART.pro_tips}</g>
    </svg>
  );
}
