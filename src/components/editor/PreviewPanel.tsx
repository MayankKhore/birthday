/** Live preview panel shown on the left side of the creator */
import { useEditor } from '@/components/editor/EditorProvider';

export function PreviewPanel() {
  const { project, theme } = useEditor();
  const recipient = project.recipientName || 'Friend';
  const occasion = project.occasion || 'Birthday';

  return (
    <aside className="preview-panel" aria-label="Live preview">
      <div className="preview-badge">Live preview</div>
      <div className="preview-canvas" role="img" aria-label={`${occasion} preview for ${recipient}`}>
        {/* Decorative cake illustration using SVG */}
        <svg className="preview-cake" viewBox="0 0 300 260" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
          <defs>
            <linearGradient id="cakeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3B2A33" />
              <stop offset="100%" stopColor="#1F1420" />
            </linearGradient>
            <radialGradient id="flameGrad" cx="50%" cy="30%" r="60%">
              <stop offset="0%" stopColor="#FFF5E0" />
              <stop offset="60%" stopColor="#F07868" />
              <stop offset="100%" stopColor="#2B1A1A" stopOpacity="0" />
            </radialGradient>
          </defs>
          {/* Plate */}
          <ellipse cx="150" cy="240" rx="110" ry="14" fill="#2A1F2E" opacity="0.6"/>
          {/* Cake body */}
          <rect x="60" y="80" width="180" height="160" rx="12" fill="url(#cakeGrad)" stroke="#40303E" strokeWidth="1"/>
          {/* Frosting drip */}
          <path d="M60 80 Q100 70 140 80 Q180 70 220 80 Q240 70 240 80" fill="none" stroke="#F5A17E" strokeWidth="3" opacity="0.9"/>
          {/* Candles */}
          <g className="candles">
            {[110, 135, 160, 185, 210].map((x, i) => (
              <g key={i} className="candle">
                <rect x={x-4} y={40} width="8" height="38" rx="2" fill="#F7E8D7" stroke="#E6BB86" strokeWidth="0.5"/>
                <ellipse cx={x} cy={38} rx="6" ry="4" fill="url(#flameGrad)" filter="url(#glow)"/>
                <animateTransform attributeName="transform" type="translate" values="0,0;0,-4;0,0" dur="2s" repeatCount="indefinite" />
              </g>
            ))}
          </g>
          {/* Sparkles */}
          <g className="sparkles" aria-hidden="true">
            {[80, 120, 180, 230, 90, 150, 210].map((x, i) => (
              <circle key={i} cx={x} cy={70 + (i%3)*30} r="2" fill="#E6BB86" opacity="0.8">
                <animate attributeName="opacity" values="0.8;0;0.8" dur="1.5s" repeatCount="indefinite" begin={`${i*0.2}s`}/>
                <animate attributeName="r" values="2;4;2" dur="1.5s" repeatCount="indefinite" begin={`${i*0.2}s`}/>
              </circle>
            ))}
          </g>
        </svg>

        <div className="preview-caption">
          <span className="preview-name">{recipient}</span>’s {occasion.toLowerCase()} experience
        </div>
      </div>
      <div className="preview-controls">
        <button type="button" className="preview-play" aria-label="Play preview">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>
        </button>
        <a href="#" className="preview-example">See example gift →</a>
      </div>
    </aside>
  );
}