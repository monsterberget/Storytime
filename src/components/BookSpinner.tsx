export default function BookSpinner({
  message = "Generating your story...",
}: {
  message?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6">
      <svg width="160" height="160" viewBox="0 0 680 680" role="img">
        <style>{`
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          @keyframes starPop { 0%,100% { opacity:0; transform:scale(0.2); } 50% { opacity:1; transform:scale(1); } }
          @keyframes pageTurn { 0%,100% { transform:skewY(0deg); } 50% { transform:skewY(-8deg); } }
          @keyframes float { 0%,100% { transform:translateY(0px); } 50% { transform:translateY(-10px); } }
          @keyframes shimmer { 0%,100% { opacity:0.4; } 50% { opacity:1; } }
          .spinner-group { transform-origin:340px 340px; animation:spin 3s linear infinite; }
          .book-group { transform-origin:340px 360px; animation:float 2.5s ease-in-out infinite; }
          .star1 { transform-origin:220px 200px; animation:starPop 1.8s ease-in-out infinite; }
          .star2 { transform-origin:460px 190px; animation:starPop 1.8s ease-in-out 0.4s infinite; }
          .star3 { transform-origin:500px 310px; animation:starPop 1.8s ease-in-out 0.8s infinite; }
          .star4 { transform-origin:185px 320px; animation:starPop 1.8s ease-in-out 1.2s infinite; }
          .star5 { transform-origin:340px 165px; animation:starPop 1.8s ease-in-out 0.6s infinite; }
          .page-right { transform-origin:340px 360px; animation:pageTurn 2s ease-in-out infinite; }
          .dot1 { animation:shimmer 1.5s ease-in-out infinite; }
          .dot2 { animation:shimmer 1.5s ease-in-out 0.5s infinite; }
          .dot3 { animation:shimmer 1.5s ease-in-out 1s infinite; }
        `}</style>

        <g className="spinner-group">
          <circle
            cx="340"
            cy="340"
            r="155"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="6"
            strokeDasharray="20 12"
            strokeLinecap="round"
            opacity="0.5"
          />
          <circle
            cx="340"
            cy="340"
            r="140"
            fill="none"
            stroke="#8b5cf6"
            strokeWidth="4"
            strokeDasharray="8 18"
            strokeLinecap="round"
            opacity="0.4"
          />
        </g>

        <g className="book-group">
          <rect
            x="188"
            y="272"
            width="152"
            height="148"
            rx="8"
            fill="#7c3aed"
          />
          <rect
            x="194"
            y="278"
            width="140"
            height="136"
            rx="5"
            fill="#ede9fe"
          />
          <line
            x1="210"
            y1="304"
            x2="320"
            y2="304"
            stroke="#7c3aed"
            strokeWidth="3.5"
            strokeLinecap="round"
            opacity="0.45"
          />
          <line
            x1="210"
            y1="320"
            x2="320"
            y2="320"
            stroke="#7c3aed"
            strokeWidth="3.5"
            strokeLinecap="round"
            opacity="0.45"
          />
          <line
            x1="210"
            y1="336"
            x2="305"
            y2="336"
            stroke="#7c3aed"
            strokeWidth="3.5"
            strokeLinecap="round"
            opacity="0.45"
          />
          <line
            x1="210"
            y1="352"
            x2="315"
            y2="352"
            stroke="#7c3aed"
            strokeWidth="3.5"
            strokeLinecap="round"
            opacity="0.45"
          />
          <line
            x1="210"
            y1="368"
            x2="295"
            y2="368"
            stroke="#7c3aed"
            strokeWidth="3.5"
            strokeLinecap="round"
            opacity="0.45"
          />

          <rect x="336" y="272" width="8" height="148" rx="2" fill="#5b21b6" />

          <g className="page-right">
            <rect
              x="344"
              y="272"
              width="148"
              height="148"
              rx="8"
              fill="#d97706"
            />
            <rect
              x="348"
              y="278"
              width="138"
              height="136"
              rx="5"
              fill="#fef3c7"
            />
            <line
              x1="362"
              y1="304"
              x2="470"
              y2="304"
              stroke="#d97706"
              strokeWidth="3.5"
              strokeLinecap="round"
              opacity="0.45"
            />
            <line
              x1="362"
              y1="320"
              x2="470"
              y2="320"
              stroke="#d97706"
              strokeWidth="3.5"
              strokeLinecap="round"
              opacity="0.45"
            />
            <line
              x1="362"
              y1="336"
              x2="455"
              y2="336"
              stroke="#d97706"
              strokeWidth="3.5"
              strokeLinecap="round"
              opacity="0.45"
            />
            <line
              x1="362"
              y1="352"
              x2="465"
              y2="352"
              stroke="#d97706"
              strokeWidth="3.5"
              strokeLinecap="round"
              opacity="0.45"
            />
            <line
              x1="362"
              y1="368"
              x2="448"
              y2="368"
              stroke="#d97706"
              strokeWidth="3.5"
              strokeLinecap="round"
              opacity="0.45"
            />
          </g>

          <ellipse
            cx="340"
            cy="430"
            rx="95"
            ry="10"
            fill="#6d28d9"
            opacity="0.18"
          />
        </g>

        <g className="star1">
          <polygon
            points="220,170 225,185 240,185 228,194 233,209 220,200 207,209 212,194 200,185 215,185"
            fill="#f59e0b"
          />
        </g>
        <g className="star2">
          <polygon
            points="460,160 474,172 486,172 477,180 480,192 470,184 460,192 463,180 454,172 466,172"
            fill="#8b5cf6"
          />
        </g>
        <g className="star3">
          <polygon
            points="510,315 513,324 522,324 515,330 518,339 510,333 502,339 505,330 498,324 507,324"
            fill="#10b981"
          />
        </g>
        <g className="star4">
          <polygon
            points="175,315 178,324 187,324 180,330 183,339 175,333 167,339 170,330 163,324 172,324"
            fill="#ec4899"
          />
        </g>
        <g className="star5">
          <polygon
            points="340,133 344,145 356,145 347,153 350,165 340,157 330,165 333,153 324,145 336,145"
            fill="#f59e0b"
          />
        </g>

        <circle className="dot1" cx="300" cy="500" r="8" fill="#8b5cf6" />
        <circle className="dot2" cx="340" cy="500" r="8" fill="#f59e0b" />
        <circle className="dot3" cx="380" cy="500" r="8" fill="#ec4899" />
      </svg>

      <p className="text-zinc-400 text-sm animate-pulse">{message}</p>
    </div>
  );
}
