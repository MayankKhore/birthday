/**
 * CelebrationCake — the supplied pastel PNG with pixel-aligned flame effects.
 *
 * The cropped source artwork is 860 × 994 and contains six physical candles.
 * The wick positions below were measured from the source pixels, so every
 * flame stays attached to its candle at any responsive size.
 */

interface Props {
  candlesLit: boolean[];
  blowStrength: number;
  celebrating: boolean;
  reducedMotion: boolean;
}

interface WickPosition {
  x: number;
  y: number;
}

const WICK_POSITIONS: WickPosition[] = [
  { x: 250, y: 38 },
  { x: 312, y: 26 },
  { x: 388, y: 16 },
  { x: 483, y: 19 },
  { x: 559, y: 30 },
  { x: 622, y: 47 },
];

const IMAGE_WIDTH = 860;
const IMAGE_HEIGHT = 994;

export function CelebrationCake({
  candlesLit,
  blowStrength,
  celebrating,
  reducedMotion,
}: Props): React.ReactElement {
  const windTurn = reducedMotion ? 0 : blowStrength * 0.09;

  return (
    <div
      className={`celebration-cake ${celebrating ? 'celebration-cake--celebrating' : ''}`}
      role="img"
      aria-label={`Pastel two-tier birthday cake with ${WICK_POSITIONS.length} candles`}
    >
      <img
        className="celebration-cake__image"
        src="/assets/cakes/pastel-candy-cake-cropped.png"
        width={IMAGE_WIDTH}
        height={IMAGE_HEIGHT}
        alt=""
        draggable={false}
      />

      <svg
        className="celebration-cake__effects"
        viewBox={`0 0 ${IMAGE_WIDTH} ${IMAGE_HEIGHT}`}
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="asset-flame">
            <stop offset="0" stopColor="#FFFCE2" />
            <stop offset="0.38" stopColor="#FFE68A" />
            <stop offset="0.72" stopColor="#FFAD45" />
            <stop offset="1" stopColor="#F05A36" />
          </radialGradient>
          <radialGradient id="asset-glow">
            <stop offset="0" stopColor="#FFE38B" stopOpacity="0.7" />
            <stop offset="0.42" stopColor="#FFD36A" stopOpacity="0.28" />
            <stop offset="1" stopColor="#FFD36A" stopOpacity="0" />
          </radialGradient>
          <filter id="asset-flame-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="7" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {WICK_POSITIONS.map((wick, index) => {
          const lit = candlesLit[index] ?? false;
          const flameDelay = `${(index % 6) * -127}ms`;
          const smokeDelay = `${index * 155}ms`;

          return (
            <g key={index} className="celebration-cake__candle" transform={`translate(${wick.x} ${wick.y})`}>
              {lit ? <circle className="celebration-cake__glow" cx="0" cy="-27" r="42" fill="url(#asset-glow)" /> : null}
              {!lit ? (
                <g
                  className="celebration-cake__smoke"
                  style={{ '--smoke-delay': smokeDelay } as React.CSSProperties}
                >
                  <path d="M0 -4 C-9 -15 7 -22 0 -36" fill="none" stroke="#9B8A98" strokeWidth="4" strokeLinecap="round" opacity="0.32" />
                  <path d="M5 -5 C-3 -17 13 -25 8 -41" fill="none" stroke="#C9BDC8" strokeWidth="3" strokeLinecap="round" opacity="0.26" />
                </g>
              ) : null}

              {lit ? (
                <g
                  className="celebration-cake__flame-lean"
                  style={{ '--wind-turn': `${windTurn}deg` } as React.CSSProperties}
                >
                  <g
                    className="celebration-cake__flame"
                    style={{ '--flame-delay': flameDelay } as React.CSSProperties}
                  >
                    <g filter="url(#asset-flame-glow)">
                      <path d="M0 0 C-14 -15 -12 -37 0 -60 C12 -37 14 -15 0 0Z" fill="url(#asset-flame)" />
                      <path className="celebration-cake__flame-core" d="M0 -10 C-6 -21 -5 -33 0 -46 C5 -33 6 -21 0 -10Z" fill="#FFFBE0" />
                    </g>
                  </g>
                </g>
              ) : null}
            </g>
          );
        })}

        <g
          className="celebration-cake__wind"
          style={{ '--wind-opacity': Math.min(0.9, blowStrength / 90) } as React.CSSProperties}
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="6"
          strokeLinecap="round"
        >
          <path d="M850 110 Q760 82 650 112" opacity="0.75" />
          <path d="M865 145 Q775 120 665 148" opacity="0.52" />
          <path d="M845 180 Q770 158 700 182" opacity="0.36" />
        </g>
      </svg>
    </div>
  );
}
