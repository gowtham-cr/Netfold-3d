/**
 * Crisp labelled 2D mathematical board-exam diagrams (SVG) for NCERT Class 10 Q1-Q10.
 * Zero hardcoded UI words; structural labels pull from localized `diagramLabels`.
 */
export default function PracticeDiagramSvg({
  questionId,
  diagramLabels,
  caption,
}) {
  const L = diagramLabels

  const renderGraphic = () => {
    switch (questionId) {
      case 'q1':
        return (
          <g>
            {/* Original Solid Sphere */}
            <defs>
              <radialGradient id="q1-sphere" cx="38%" cy="32%" r="65%">
                <stop offset="0%" stopColor="#e0e7ff" />
                <stop offset="55%" stopColor="#6366f1" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#312e81" stopOpacity="0.65" />
              </radialGradient>
            </defs>
            <circle
              cx="92"
              cy="115"
              r="58"
              fill="url(#q1-sphere)"
              stroke="#3730a3"
              strokeWidth="2.2"
            />
            <ellipse
              cx="92"
              cy="115"
              rx="58"
              ry="16"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2"
              strokeDasharray="5 4"
            />
            <line
              x1="92"
              y1="115"
              x2="148"
              y2="115"
              stroke="#1e1b4b"
              strokeWidth="2"
            />
            <circle cx="92" cy="115" r="3" fill="#1e1b4b" />
            <text
              x="120"
              y="108"
              fontSize="12"
              fontWeight="700"
              fill="#1e1b4b"
              textAnchor="middle"
            >
              r
            </text>
            <text
              x="92"
              y="194"
              fontSize="12"
              fontWeight="700"
              fill="#3730a3"
              textAnchor="middle"
            >
              {L.surfaceArea} = 4πr²
            </text>

            {/* Cut Arrow */}
            <path
              d="M 164 115 L 204 115"
              stroke="#475569"
              strokeWidth="2.5"
              markerEnd="url(#arrow-slate)"
            />
            <text
              x="184"
              y="103"
              fontSize="14"
              fontWeight="700"
              fill="#b45309"
              textAnchor="middle"
            >
              ÷ 2
            </text>

            {/* Two Resulting Solid Hemispheres */}
            {/* Top Hemisphere */}
            <path
              d="M 225 94 A 46 46 0 0 1 317 94 Z"
              fill="#6366f1"
              fillOpacity="0.28"
              stroke="#3730a3"
              strokeWidth="2"
            />
            <ellipse
              cx="271"
              cy="94"
              rx="46"
              ry="12"
              fill="#fef3c7"
              stroke="#d97706"
              strokeWidth="2"
            />
            <text
              x="271"
              y="66"
              fontSize="11"
              fontWeight="700"
              fill="#312e81"
              textAnchor="middle"
            >
              2πr²
            </text>
            <text
              x="368"
              y="91"
              fontSize="11"
              fontWeight="600"
              fill="#b45309"
              textAnchor="middle"
            >
              +πr²
            </text>
            <text
              x="368"
              y="72"
              fontSize="11.5"
              fontWeight="700"
              fill="#0f172a"
              textAnchor="middle"
            >
              = 3πr²
            </text>

            {/* Bottom Hemisphere */}
            <path
              d="M 225 144 A 46 46 0 0 0 317 144 Z"
              fill="#6366f1"
              fillOpacity="0.28"
              stroke="#3730a3"
              strokeWidth="2"
            />
            <ellipse
              cx="271"
              cy="144"
              rx="46"
              ry="12"
              fill="#fef3c7"
              stroke="#d97706"
              strokeWidth="2"
            />
            <text
              x="271"
              y="174"
              fontSize="11"
              fontWeight="700"
              fill="#312e81"
              textAnchor="middle"
            >
              2πr²
            </text>
            <text
              x="368"
              y="148"
              fontSize="11"
              fontWeight="600"
              fill="#b45309"
              textAnchor="middle"
            >
              +πr²
            </text>
            <text
              x="368"
              y="167"
              fontSize="11.5"
              fontWeight="700"
              fill="#0f172a"
              textAnchor="middle"
            >
              = 3πr²
            </text>

            <text
              x="271"
              y="123"
              fontSize="10.5"
              fontWeight="700"
              fill="#b45309"
              textAnchor="middle"
            >
              {L.cutPlane}
            </text>
            <text
              x="318"
              y="206"
              fontSize="12"
              fontWeight="700"
              fill="#047857"
              textAnchor="middle"
            >
              4πr² : 6πr² = 2 : 3
            </text>
          </g>
        )

      case 'q2':
        return (
          <g>
            {/* Isometric Cube Frame (edge a = 2 cm) */}
            {/* Back/Hidden edges */}
            <polyline
              points="160,42 160,154 88,186"
              fill="none"
              stroke="#94a3b8"
              strokeWidth="1.5"
              strokeDasharray="4 3"
            />
            <line
              x1="160"
              y1="154"
              x2="296"
              y2="154"
              stroke="#94a3b8"
              strokeWidth="1.5"
              strokeDasharray="4 3"
            />
            {/* Cube outer faces */}
            <polygon
              points="88,74 224,74 296,42 160,42"
              fill="#e0f2fe"
              fillOpacity="0.45"
              stroke="#0284c7"
              strokeWidth="1.8"
            />
            <polygon
              points="88,74 224,74 224,186 88,186"
              fill="#e0f2fe"
              fillOpacity="0.22"
              stroke="#0284c7"
              strokeWidth="1.8"
            />
            <polygon
              points="224,74 296,42 296,154 224,186"
              fill="#bae6fd"
              fillOpacity="0.28"
              stroke="#0284c7"
              strokeWidth="1.8"
            />

            {/* Inscribed Cone inside Cube */}
            {/* Base circle inside bottom parallelogram: center (192,170), rx=68, ry=16 */}
            <ellipse
              cx="192"
              cy="170"
              rx="68"
              ry="16"
              fill="#fde68a"
              fillOpacity="0.55"
              stroke="#b45309"
              strokeWidth="2"
            />
            {/* Slant edges to top center apex (192, 58) */}
            <polygon
              points="192,58 124,170 260,170"
              fill="#6366f1"
              fillOpacity="0.22"
              stroke="none"
            />
            <line
              x1="192"
              y1="58"
              x2="124"
              y2="170"
              stroke="#4338ca"
              strokeWidth="2.2"
            />
            <line
              x1="192"
              y1="58"
              x2="260"
              y2="170"
              stroke="#4338ca"
              strokeWidth="2.2"
            />
            {/* Vertical Height h = 2 cm */}
            <line
              x1="192"
              y1="58"
              x2="192"
              y2="170"
              stroke="#dc2626"
              strokeWidth="2"
              strokeDasharray="4 3"
            />
            {/* Radius r = 1 cm */}
            <line
              x1="192"
              y1="170"
              x2="260"
              y2="170"
              stroke="#059669"
              strokeWidth="2.2"
            />
            {/* Right-angle marker */}
            <polyline
              points="192,160 202,160 202,170"
              fill="none"
              stroke="#1e293b"
              strokeWidth="1.5"
            />
            <circle cx="192" cy="58" r="3.5" fill="#4338ca" />
            <circle cx="192" cy="170" r="3" fill="#059669" />

            {/* Annotations */}
            <text
              x="66"
              y="134"
              fontSize="11.5"
              fontWeight="700"
              fill="#0369a1"
              textAnchor="middle"
            >
              {L.edge} = 2 cm
            </text>
            <text
              x="198"
              y="118"
              fontSize="11.5"
              fontWeight="700"
              fill="#dc2626"
              textAnchor="start"
            >
              h = 2 cm
            </text>
            <text
              x="226"
              y="165"
              fontSize="11"
              fontWeight="700"
              fill="#047857"
              textAnchor="middle"
            >
              r = 1 cm
            </text>
            <text
              x="358"
              y="92"
              fontSize="11"
              fontWeight="700"
              fill="#4338ca"
              textAnchor="middle"
            >
              {L.inscribedCone}
            </text>
            <text
              x="358"
              y="114"
              fontSize="11"
              fontWeight="600"
              fill="#334155"
              textAnchor="middle"
            >
              d = 2 cm ⇒ r = 1 cm
            </text>
            <text
              x="358"
              y="136"
              fontSize="12"
              fontWeight="700"
              fill="#047857"
              textAnchor="middle"
            >
              V = 2π/3 cm³
            </text>
          </g>
        )

      case 'q3':
        return (
          <g>
            {/* Solid Hemisphere */}
            <path
              d="M 100 156 A 95 95 0 0 1 290 156 Z"
              fill="#6366f1"
              fillOpacity="0.24"
              stroke="#3730a3"
              strokeWidth="2.4"
            />
            {/* Flat Circular Base */}
            <ellipse
              cx="195"
              cy="156"
              rx="95"
              ry="26"
              fill="#fef3c7"
              fillOpacity="0.88"
              stroke="#d97706"
              strokeWidth="2.2"
            />
            {/* Center O & Radii */}
            <circle cx="195" cy="156" r="3.5" fill="#0f172a" />
            <line
              x1="195"
              y1="156"
              x2="290"
              y2="156"
              stroke="#059669"
              strokeWidth="2.4"
            />
            <line
              x1="195"
              y1="156"
              x2="195"
              y2="61"
              stroke="#dc2626"
              strokeWidth="2"
              strokeDasharray="5 3"
            />
            <polyline
              points="195,144 207,144 207,156"
              fill="none"
              stroke="#1e293b"
              strokeWidth="1.5"
            />
            <text
              x="245"
              y="148"
              fontSize="12.5"
              fontWeight="700"
              fill="#047857"
              textAnchor="middle"
            >
              r
            </text>
            <text
              x="184"
              y="112"
              fontSize="12"
              fontWeight="700"
              fill="#dc2626"
              textAnchor="end"
            >
              r
            </text>
            <text
              x="195"
              y="44"
              fontSize="12"
              fontWeight="700"
              fill="#312e81"
              textAnchor="middle"
            >
              {L.hemisphereBowl}: 2πr²
            </text>
            <text
              x="195"
              y="202"
              fontSize="11.5"
              fontWeight="700"
              fill="#b45309"
              textAnchor="middle"
            >
              {L.flatCircularBase}: πr²
            </text>
            <rect
              x="316"
              y="88"
              width="112"
              height="68"
              rx="10"
              fill="#ecfdf5"
              stroke="#10b981"
              strokeWidth="1.6"
            />
            <text
              x="372"
              y="112"
              fontSize="11.5"
              fontWeight="700"
              fill="#065f46"
              textAnchor="middle"
            >
              TSA = 3πr²
            </text>
            <text
              x="372"
              y="138"
              fontSize="12.5"
              fontWeight="700"
              fill="#047857"
              textAnchor="middle"
            >
              3πr² : r² = 3π : 1
            </text>
          </g>
        )

      case 'q4':
        return (
          <g>
            {/* Joined Cuboid formed from two cubes side-by-side: Cube 1 + Cube 2 */}
            {/* Left Cube (l: 60..160) */}
            <polygon
              points="60,86 160,86 196,56 96,56"
              fill="#dbeafe"
              stroke="#2563eb"
              strokeWidth="1.8"
            />
            <polygon
              points="60,86 160,86 160,176 60,176"
              fill="#eff6ff"
              stroke="#2563eb"
              strokeWidth="1.8"
            />
            {/* Right Cube (160..260) */}
            <polygon
              points="160,86 260,86 296,56 196,56"
              fill="#e0e7ff"
              stroke="#4f46e5"
              strokeWidth="1.8"
            />
            <polygon
              points="160,86 260,86 260,176 160,176"
              fill="#eef2ff"
              stroke="#4f46e5"
              strokeWidth="1.8"
            />
            <polygon
              points="260,86 296,56 296,146 260,176"
              fill="#c7d2fe"
              stroke="#4f46e5"
              strokeWidth="1.8"
            />
            {/* Shared Hidden Seam Face */}
            <polygon
              points="160,86 196,56 196,146 160,176"
              fill="#fca5a5"
              fillOpacity="0.5"
              stroke="#dc2626"
              strokeWidth="2.2"
              strokeDasharray="4 3"
            />

            {/* Dimension Callouts */}
            <line
              x1="60"
              y1="192"
              x2="160"
              y2="192"
              stroke="#1d4ed8"
              strokeWidth="2"
            />
            <line
              x1="160"
              y1="192"
              x2="260"
              y2="192"
              stroke="#4338ca"
              strokeWidth="2"
            />
            <text
              x="110"
              y="208"
              fontSize="12"
              fontWeight="700"
              fill="#1d4ed8"
              textAnchor="middle"
            >
              a
            </text>
            <text
              x="210"
              y="208"
              fontSize="12"
              fontWeight="700"
              fill="#4338ca"
              textAnchor="middle"
            >
              a
            </text>
            <text
              x="160"
              y="227"
              fontSize="12.5"
              fontWeight="700"
              fill="#0f172a"
              textAnchor="middle"
            >
              l = a + a = 2a
            </text>
            <text
              x="44"
              y="135"
              fontSize="12"
              fontWeight="700"
              fill="#1d4ed8"
              textAnchor="middle"
            >
              h = a
            </text>
            <text
              x="292"
              y="168"
              fontSize="12"
              fontWeight="700"
              fill="#4338ca"
              textAnchor="middle"
            >
              b = a
            </text>

            {/* Right-hand Formula Box */}
            <rect
              x="312"
              y="70"
              width="118"
              height="92"
              rx="10"
              fill="#fef2f2"
              stroke="#ef4444"
              strokeWidth="1.5"
            />
            <text
              x="371"
              y="92"
              fontSize="10.5"
              fontWeight="700"
              fill="#b91c1c"
              textAnchor="middle"
            >
              {L.joinedFace}
            </text>
            <text
              x="371"
              y="118"
              fontSize="11"
              fontWeight="600"
              fill="#334155"
              textAnchor="middle"
            >
              2(2a² + a² + 2a²)
            </text>
            <text
              x="371"
              y="144"
              fontSize="13"
              fontWeight="700"
              fill="#047857"
              textAnchor="middle"
            >
              TSA = 10a²
            </text>
          </g>
        )

      case 'q5':
        return (
          <g>
            {/* Right Circular Cylinder */}
            <path
              d="M 80 62 L 80 178 A 56 16 0 0 0 192 178 L 192 62 Z"
              fill="#6366f1"
              fillOpacity="0.22"
              stroke="#4338ca"
              strokeWidth="2.2"
            />
            <ellipse
              cx="136"
              cy="62"
              rx="56"
              ry="16"
              fill="#e0e7ff"
              stroke="#4338ca"
              strokeWidth="2.2"
            />
            <ellipse
              cx="136"
              cy="178"
              rx="56"
              ry="16"
              fill="none"
              stroke="#4338ca"
              strokeWidth="1.5"
              strokeDasharray="4 3"
            />
            <line
              x1="136"
              y1="62"
              x2="192"
              y2="62"
              stroke="#dc2626"
              strokeWidth="2.4"
            />
            <circle cx="136" cy="62" r="3" fill="#dc2626" />
            <text
              x="164"
              y="55"
              fontSize="12"
              fontWeight="700"
              fill="#dc2626"
              textAnchor="middle"
            >
              r = ?
            </text>
            {/* Height h = 5 cm */}
            <line
              x1="212"
              y1="62"
              x2="212"
              y2="178"
              stroke="#0f172a"
              strokeWidth="1.8"
            />
            <text
              x="220"
              y="124"
              fontSize="12"
              fontWeight="700"
              fill="#0f172a"
              textAnchor="start"
            >
              h = 5 cm
            </text>

            {/* Unrolled CSA Callout */}
            <rect
              x="292"
              y="72"
              width="134"
              height="96"
              rx="10"
              fill="#eef2ff"
              stroke="#6366f1"
              strokeWidth="1.8"
            />
            <text
              x="359"
              y="96"
              fontSize="11.5"
              fontWeight="700"
              fill="#312e81"
              textAnchor="middle"
            >
              CSA = 2πrh
            </text>
            <text
              x="359"
              y="118"
              fontSize="11"
              fontWeight="600"
              fill="#334155"
              textAnchor="middle"
            >
              94.2 = 2 × 3.14 × r × 5
            </text>
            <text
              x="359"
              y="148"
              fontSize="13.5"
              fontWeight="700"
              fill="#047857"
              textAnchor="middle"
            >
              ⇒ r = 3 cm
            </text>
          </g>
        )

      case 'q6':
        return (
          <g>
            {/* Cone with Highlighted Internal Right Triangle (r=7, h=24, l=25) */}
            <ellipse
              cx="155"
              cy="182"
              rx="75"
              ry="19"
              fill="#e0e7ff"
              stroke="#4338ca"
              strokeWidth="2.2"
            />
            <polygon
              points="155,34 80,182 230,182"
              fill="#6366f1"
              fillOpacity="0.16"
              stroke="#4338ca"
              strokeWidth="2.2"
            />
            {/* Highlighted Right Triangle OAB */}
            <polygon
              points="155,34 155,182 230,182"
              fill="#fde68a"
              fillOpacity="0.55"
            />
            {/* Vertical Height h = 24 cm */}
            <line
              x1="155"
              y1="34"
              x2="155"
              y2="182"
              stroke="#dc2626"
              strokeWidth="2.2"
              strokeDasharray="5 3"
            />
            {/* Base radius r = 7 cm */}
            <line
              x1="155"
              y1="182"
              x2="230"
              y2="182"
              stroke="#059669"
              strokeWidth="2.5"
            />
            {/* Slant Height l = 25 cm */}
            <line
              x1="155"
              y1="34"
              x2="230"
              y2="182"
              stroke="#b45309"
              strokeWidth="2.6"
            />
            {/* Right Angle at center */}
            <polyline
              points="155,170 167,170 167,182"
              fill="none"
              stroke="#1e293b"
              strokeWidth="1.6"
            />
            <circle cx="155" cy="34" r="3.5" fill="#4338ca" />
            <circle cx="155" cy="182" r="3" fill="#0f172a" />

            <text
              x="146"
              y="114"
              fontSize="12"
              fontWeight="700"
              fill="#dc2626"
              textAnchor="end"
            >
              h = 24 cm
            </text>
            <text
              x="192"
              y="175"
              fontSize="12"
              fontWeight="700"
              fill="#047857"
              textAnchor="middle"
            >
              r = 7 cm
            </text>
            <text
              x="212"
              y="104"
              fontSize="12.5"
              fontWeight="700"
              fill="#b45309"
              textAnchor="start"
            >
              l = √(7²+24²) = 25 cm
            </text>

            <rect
              x="275"
              y="132"
              width="150"
              height="62"
              rx="10"
              fill="#ecfdf5"
              stroke="#10b981"
              strokeWidth="1.6"
            />
            <text
              x="350"
              y="156"
              fontSize="11.5"
              fontWeight="600"
              fill="#065f46"
              textAnchor="middle"
            >
              CSA = πrl = (22/7)×7×25
            </text>
            <text
              x="350"
              y="180"
              fontSize="13.5"
              fontWeight="700"
              fill="#047857"
              textAnchor="middle"
            >
              = 550 cm²
            </text>
          </g>
        )

      case 'q7':
        return (
          <g>
            {/* Closed Solid Cylinder (r=0.7 m, h=2.4 m) */}
            <path
              d="M 96 58 L 96 184 A 52 15 0 0 0 200 184 L 200 58 Z"
              fill="#0ea5e9"
              fillOpacity="0.2"
              stroke="#0369a1"
              strokeWidth="2.2"
            />
            <ellipse
              cx="148"
              cy="58"
              rx="52"
              ry="15"
              fill="#fef3c7"
              stroke="#d97706"
              strokeWidth="2.2"
            />
            <ellipse
              cx="148"
              cy="184"
              rx="52"
              ry="15"
              fill="#fef3c7"
              fillOpacity="0.8"
              stroke="#d97706"
              strokeWidth="2"
            />
            <line
              x1="148"
              y1="58"
              x2="200"
              y2="58"
              stroke="#059669"
              strokeWidth="2.4"
            />
            <circle cx="148" cy="58" r="3" fill="#059669" />
            <text
              x="176"
              y="50"
              fontSize="11.5"
              fontWeight="700"
              fill="#047857"
              textAnchor="middle"
            >
              r = 0.7 m
            </text>
            <line
              x1="78"
              y1="58"
              x2="78"
              y2="184"
              stroke="#dc2626"
              strokeWidth="2"
            />
            <text
              x="72"
              y="124"
              fontSize="12"
              fontWeight="700"
              fill="#dc2626"
              textAnchor="end"
            >
              h = 2.4 m
            </text>

            {/* Right Callout Breakdown */}
            <rect
              x="244"
              y="56"
              width="180"
              height="136"
              rx="12"
              fill="#f8fafc"
              stroke="#cbd5e1"
              strokeWidth="1.6"
            />
            <text
              x="334"
              y="82"
              fontSize="11.5"
              fontWeight="700"
              fill="#b45309"
              textAnchor="middle"
            >
              2 × πr² = 3.08 m²
            </text>
            <text
              x="334"
              y="108"
              fontSize="11.5"
              fontWeight="700"
              fill="#0369a1"
              textAnchor="middle"
            >
              CSA = 2πrh = 10.56 m²
            </text>
            <line
              x1="262"
              y1="124"
              x2="406"
              y2="124"
              stroke="#cbd5e1"
              strokeWidth="1.5"
            />
            <text
              x="334"
              y="148"
              fontSize="11.5"
              fontWeight="600"
              fill="#334155"
              textAnchor="middle"
            >
              TSA = 2πr(r + h)
            </text>
            <text
              x="334"
              y="174"
              fontSize="14"
              fontWeight="700"
              fill="#047857"
              textAnchor="middle"
            >
              = 13.64 m²
            </text>
          </g>
        )

      case 'q8':
        return (
          <g>
            {/* Solid Hemisphere with Diameter d */}
            <path
              d="M 88 158 A 96 96 0 0 1 280 158 Z"
              fill="#8b5cf6"
              fillOpacity="0.22"
              stroke="#6d28d9"
              strokeWidth="2.4"
            />
            <ellipse
              cx="184"
              cy="158"
              rx="96"
              ry="24"
              fill="#fef3c7"
              fillOpacity="0.88"
              stroke="#d97706"
              strokeWidth="2.2"
            />
            {/* Full Diameter d */}
            <line
              x1="88"
              y1="158"
              x2="280"
              y2="158"
              stroke="#0f172a"
              strokeWidth="2.4"
            />
            <circle cx="184" cy="158" r="3.5" fill="#dc2626" />
            <text
              x="136"
              y="150"
              fontSize="11.5"
              fontWeight="700"
              fill="#dc2626"
              textAnchor="middle"
            >
              r = d/2
            </text>
            <text
              x="232"
              y="150"
              fontSize="11.5"
              fontWeight="700"
              fill="#dc2626"
              textAnchor="middle"
            >
              r = d/2
            </text>
            <text
              x="184"
              y="204"
              fontSize="12.5"
              fontWeight="700"
              fill="#0f172a"
              textAnchor="middle"
            >
              {L.diameter} = d
            </text>

            <rect
              x="306"
              y="76"
              width="124"
              height="94"
              rx="10"
              fill="#f5f3ff"
              stroke="#8b5cf6"
              strokeWidth="1.6"
            />
            <text
              x="368"
              y="102"
              fontSize="11.5"
              fontWeight="700"
              fill="#5b21b6"
              textAnchor="middle"
            >
              TSA = 3πr²
            </text>
            <text
              x="368"
              y="126"
              fontSize="11.5"
              fontWeight="600"
              fill="#334155"
              textAnchor="middle"
            >
              = 3π(d/2)²
            </text>
            <text
              x="368"
              y="154"
              fontSize="13.5"
              fontWeight="700"
              fill="#047857"
              textAnchor="middle"
            >
              = (3/4)πd²
            </text>
          </g>
        )

      case 'q9':
        return (
          <g>
            {/* 2D Semicircular Region of Diameter d */}
            <path
              d="M 80 168 A 102 102 0 0 1 284 168 Z"
              fill="#34d399"
              fillOpacity="0.28"
              stroke="#059669"
              strokeWidth="2.8"
            />
            <line
              x1="80"
              y1="168"
              x2="284"
              y2="168"
              stroke="#0f172a"
              strokeWidth="2.8"
            />
            <line
              x1="182"
              y1="168"
              x2="182"
              y2="66"
              stroke="#0284c7"
              strokeWidth="2"
              strokeDasharray="5 3"
            />
            <polyline
              points="182,156 194,156 194,168"
              fill="none"
              stroke="#0f172a"
              strokeWidth="1.6"
            />
            <circle cx="182" cy="168" r="4" fill="#0f172a" />
            <text
              x="192"
              y="120"
              fontSize="12"
              fontWeight="700"
              fill="#0369a1"
              textAnchor="start"
            >
              {L.radius} r = d/2
            </text>
            <text
              x="182"
              y="194"
              fontSize="12.5"
              fontWeight="700"
              fill="#0f172a"
              textAnchor="middle"
            >
              {L.diameter} AB = d
            </text>
            <text
              x="182"
              y="46"
              fontSize="12"
              fontWeight="700"
              fill="#047857"
              textAnchor="middle"
            >
              {L.semicircleArc}
            </text>

            <rect
              x="306"
              y="76"
              width="124"
              height="94"
              rx="10"
              fill="#ecfdf5"
              stroke="#10b981"
              strokeWidth="1.6"
            />
            <text
              x="368"
              y="102"
              fontSize="11.5"
              fontWeight="700"
              fill="#065f46"
              textAnchor="middle"
            >
              A = ½ πr²
            </text>
            <text
              x="368"
              y="126"
              fontSize="11.5"
              fontWeight="600"
              fill="#334155"
              textAnchor="middle"
            >
              = ½ π(d/2)²
            </text>
            <text
              x="368"
              y="154"
              fontSize="13.5"
              fontWeight="700"
              fill="#047857"
              textAnchor="middle"
            >
              = (1/8)πd²
            </text>
          </g>
        )

      case 'q10':
      default:
        return (
          <g>
            {/* Cone with Base Area B = 51 cm² and Volume = 85 cm³ */}
            <ellipse
              cx="155"
              cy="176"
              rx="74"
              ry="20"
              fill="#bbf7d0"
              stroke="#15803d"
              strokeWidth="2.4"
            />
            <polygon
              points="155,44 81,176 229,176"
              fill="#6366f1"
              fillOpacity="0.18"
              stroke="#4338ca"
              strokeWidth="2.2"
            />
            <line
              x1="155"
              y1="44"
              x2="155"
              y2="176"
              stroke="#dc2626"
              strokeWidth="2.4"
              strokeDasharray="5 3"
            />
            <polyline
              points="155,164 167,164 167,176"
              fill="none"
              stroke="#1e293b"
              strokeWidth="1.6"
            />
            <circle cx="155" cy="44" r="3.5" fill="#4338ca" />
            <circle cx="155" cy="176" r="3" fill="#15803d" />
            <text
              x="166"
              y="112"
              fontSize="12.5"
              fontWeight="700"
              fill="#dc2626"
              textAnchor="start"
            >
              h = ?
            </text>
            <text
              x="155"
              y="214"
              fontSize="12"
              fontWeight="700"
              fill="#15803d"
              textAnchor="middle"
            >
              {L.baseArea} (πr²) = 51 cm²
            </text>

            <rect
              x="266"
              y="72"
              width="160"
              height="104"
              rx="10"
              fill="#eef2ff"
              stroke="#6366f1"
              strokeWidth="1.6"
            />
            <text
              x="346"
              y="98"
              fontSize="11.5"
              fontWeight="700"
              fill="#312e81"
              textAnchor="middle"
            >
              {L.volume} = ⅓ × B × h
            </text>
            <text
              x="346"
              y="122"
              fontSize="11.5"
              fontWeight="600"
              fill="#334155"
              textAnchor="middle"
            >
              85 = ⅓ × 51 × h = 17h
            </text>
            <text
              x="346"
              y="154"
              fontSize="14"
              fontWeight="700"
              fill="#047857"
              textAnchor="middle"
            >
              ⇒ h = 5 cm
            </text>
          </g>
        )
    }
  }

  return (
    <figure className="rounded-xl border border-slate-200 bg-white p-3">
      <svg
        viewBox="0 0 440 240"
        role="img"
        aria-label={caption}
        className="w-full h-auto max-h-64 select-none"
      >
        <defs>
          <marker
            id="arrow-slate"
            markerWidth="8"
            markerHeight="8"
            refX="6"
            refY="4"
            orient="auto"
          >
            <path d="M0,0 L8,4 L0,8 Z" fill="#475569" />
          </marker>
        </defs>
        <rect
          x="2"
          y="2"
          width="436"
          height="236"
          rx="12"
          fill="#f8fafc"
          stroke="#e2e8f0"
          strokeWidth="1.5"
        />
        {renderGraphic()}
      </svg>
      <figcaption className="mt-2 text-xs leading-relaxed text-slate-600 px-1">
        {caption}
      </figcaption>
    </figure>
  )
}
