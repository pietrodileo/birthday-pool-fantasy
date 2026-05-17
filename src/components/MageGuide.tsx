type MageGuideProps = {
  title: string;
  message: string;
};

export function MageGuide({ title, message }: MageGuideProps) {
  return (
    <aside className="mage-guide" aria-label="Mago guida">
      <div className="mage-art" aria-hidden="true">
        <svg viewBox="0 0 180 220" role="img">
          <defs>
            <radialGradient id="staffGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fff4b8" />
              <stop offset="70%" stopColor="#e6bc68" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#e6bc68" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="robe" x1="35" x2="135" y1="92" y2="205">
              <stop offset="0%" stopColor="#456274" />
              <stop offset="100%" stopColor="#26384d" />
            </linearGradient>
          </defs>

          <circle className="mage-glow" cx="137" cy="44" r="28" fill="url(#staffGlow)" />
          <path className="mage-staff" d="M132 54 L150 188" />
          <circle className="mage-orb" cx="132" cy="48" r="9" />

          <path className="mage-hat" d="M53 76 C67 35 81 16 104 4 C101 34 115 52 130 77 Z" />
          <path className="mage-brim" d="M33 82 C57 69 101 66 142 81 C118 96 58 98 33 82 Z" />

          <circle className="mage-face" cx="88" cy="91" r="28" />
          <path className="mage-beard" d="M61 102 C70 151 104 154 118 103 C104 117 76 117 61 102 Z" />
          <circle className="mage-eye" cx="78" cy="88" r="3" />
          <circle className="mage-eye" cx="98" cy="88" r="3" />
          <path className="mage-smile" d="M80 100 C87 106 96 105 102 99" />

          <path
            className="mage-robe"
            fill="url(#robe)"
            d="M55 117 C39 140 35 177 28 208 H146 C137 174 133 141 116 117 C101 128 72 128 55 117 Z"
          />
          <path className="mage-sash" d="M61 145 C83 156 106 158 130 147" />
          <path className="mage-arm" d="M55 132 C38 139 29 151 23 166" />
          <path className="mage-arm" d="M116 130 C130 136 140 149 148 164" />
          <path className="mage-star" d="M86 26 L90 34 L99 35 L92 41 L94 50 L86 45 L78 50 L80 41 L73 35 L82 34 Z" />
        </svg>
      </div>
      <div className="mage-copy">
        <strong>{title}</strong>
        <p>{message}</p>
      </div>
    </aside>
  );
}
