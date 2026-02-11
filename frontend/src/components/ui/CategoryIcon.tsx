// Custom SVG Category Icons - Modern gradient style with unique IDs per instance
export default function CategoryIcon({ slug, className = "w-20 h-20" }: { slug: string; className?: string }) {
  // Generate unique ID prefix to avoid gradient conflicts when multiple icons render
  const uid = slug.replace(/[^a-z]/g, '')

  const icons: Record<string, JSX.Element> = {
    // WATER COOLERS - Electric water cooler machine (tall standing unit with taps)
    'water-coolers': (
      <svg viewBox="0 0 80 80" fill="none" className={className}>
        <defs>
          <linearGradient id={`${uid}WC`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#0ea5e9" />
          </linearGradient>
        </defs>
        {/* Main cooler body - tall standing unit */}
        <rect x="22" y="12" width="36" height="58" rx="4" stroke={`url(#${uid}WC)`} strokeWidth="2.5" fill="none" />
        {/* Top cooling section with snowflake */}
        <rect x="26" y="16" width="28" height="22" rx="2" fill={`url(#${uid}WC)`} opacity="0.15" />
        <path d="M40 22 L40 32 M35 27 L45 27 M36 23 L44 31 M44 23 L36 31" stroke={`url(#${uid}WC)`} strokeWidth="2" strokeLinecap="round" />
        {/* Cold water tap (blue) */}
        <rect x="27" y="44" width="11" height="8" rx="2" fill={`url(#${uid}WC)`} />
        <circle cx="32.5" cy="56" r="3" stroke={`url(#${uid}WC)`} strokeWidth="1.5" fill="none" />
        {/* Hot water tap (burgundy indicator) */}
        <rect x="42" y="44" width="11" height="8" rx="2" fill="#722F37" opacity="0.8" />
        <circle cx="47.5" cy="56" r="3" stroke="#722F37" strokeWidth="1.5" fill="none" opacity="0.8" />
        {/* Base/legs */}
        <rect x="24" y="70" width="8" height="6" rx="1" fill={`url(#${uid}WC)`} opacity="0.5" />
        <rect x="48" y="70" width="8" height="6" rx="1" fill={`url(#${uid}WC)`} opacity="0.5" />
      </svg>
    ),

    // STORAGE TYPE WATER COOLERS - Large horizontal/cylindrical storage tank
    'storage-type-water-coolers': (
      <svg viewBox="0 0 80 80" fill="none" className={className}>
        <defs>
          <linearGradient id={`${uid}ST`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0891b2" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
        {/* Large cylindrical storage tank */}
        <ellipse cx="40" cy="18" rx="22" ry="8" stroke={`url(#${uid}ST)`} strokeWidth="2.5" fill={`url(#${uid}ST)`} opacity="0.1" />
        <path d="M18 18 L18 55 Q18 65 40 65 Q62 65 62 55 L62 18" stroke={`url(#${uid}ST)`} strokeWidth="2.5" fill="none" />
        <ellipse cx="40" cy="55" rx="22" ry="8" stroke={`url(#${uid}ST)`} strokeWidth="2" fill={`url(#${uid}ST)`} opacity="0.15" />
        {/* Capacity indicator lines */}
        <line x1="22" y1="28" x2="22" y2="50" stroke={`url(#${uid}ST)`} strokeWidth="1.5" opacity="0.5" />
        <line x1="20" y1="30" x2="24" y2="30" stroke={`url(#${uid}ST)`} strokeWidth="1.5" />
        <line x1="20" y1="40" x2="24" y2="40" stroke={`url(#${uid}ST)`} strokeWidth="1.5" />
        <line x1="20" y1="50" x2="24" y2="50" stroke={`url(#${uid}ST)`} strokeWidth="1.5" />
        {/* Storage capacity text indicator */}
        <text x="40" y="42" textAnchor="middle" fill={`url(#${uid}ST)`} fontSize="10" fontWeight="bold">LTR</text>
        {/* Outlet tap on side */}
        <rect x="60" y="38" width="12" height="8" rx="2" fill={`url(#${uid}ST)`} />
        <circle cx="74" cy="42" r="2" fill={`url(#${uid}ST)`} opacity="0.6" />
        {/* Support stand */}
        <rect x="28" y="68" width="6" height="8" rx="1" fill={`url(#${uid}ST)`} opacity="0.4" />
        <rect x="46" y="68" width="6" height="8" rx="1" fill={`url(#${uid}ST)`} opacity="0.4" />
      </svg>
    ),

    // WATER DISPENSERS - Bottle-top dispenser (with inverted bottle on top)
    'water-dispensers': (
      <svg viewBox="0 0 80 80" fill="none" className={className}>
        <defs>
          <linearGradient id={`${uid}WD`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#60a5fa" />
          </linearGradient>
        </defs>
        {/* Inverted water bottle on top */}
        <path d="M35 5 L35 12 L45 12 L45 5" stroke={`url(#${uid}WD)`} strokeWidth="2" fill={`url(#${uid}WD)`} opacity="0.3" />
        <path d="M33 12 Q33 18 30 22 L30 28 L50 28 L50 22 Q47 18 47 12" stroke={`url(#${uid}WD)`} strokeWidth="2" fill={`url(#${uid}WD)`} opacity="0.2" />
        {/* Main dispenser body */}
        <rect x="24" y="28" width="32" height="38" rx="3" stroke={`url(#${uid}WD)`} strokeWidth="2.5" fill="none" />
        {/* Control panel */}
        <rect x="28" y="32" width="24" height="10" rx="2" fill={`url(#${uid}WD)`} opacity="0.15" />
        <circle cx="34" cy="37" r="2.5" fill={`url(#${uid}WD)`} />
        <circle cx="46" cy="37" r="2.5" fill="#722F37" opacity="0.7" />
        {/* Taps */}
        <rect x="28" y="48" width="10" height="5" rx="1" fill={`url(#${uid}WD)`} />
        <rect x="42" y="48" width="10" height="5" rx="1" fill="#722F37" opacity="0.7" />
        {/* Drip tray */}
        <rect x="26" y="58" width="28" height="4" rx="1" fill={`url(#${uid}WD)`} opacity="0.3" />
        {/* Base cabinet */}
        <rect x="22" y="66" width="36" height="10" rx="2" stroke={`url(#${uid}WD)`} strokeWidth="2" fill="none" />
      </svg>
    ),

    // GEYSERS & HEATERS - Wall-mounted water heater with flame
    'geysers-heaters': (
      <svg viewBox="0 0 80 80" fill="none" className={className}>
        <defs>
          <linearGradient id={`${uid}GH`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#fb923c" />
          </linearGradient>
          <linearGradient id={`${uid}FL`} x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#dc2626" />
            <stop offset="50%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#8B4049" />
          </linearGradient>
        </defs>
        {/* Wall mount bracket */}
        <rect x="32" y="6" width="16" height="6" rx="1" fill={`url(#${uid}GH)`} opacity="0.5" />
        {/* Main geyser body - cylindrical tank */}
        <ellipse cx="40" cy="18" rx="18" ry="6" stroke={`url(#${uid}GH)`} strokeWidth="2.5" fill={`url(#${uid}GH)`} opacity="0.1" />
        <path d="M22 18 L22 58 Q22 66 40 66 Q58 66 58 58 L58 18" stroke={`url(#${uid}GH)`} strokeWidth="2.5" fill="none" />
        <ellipse cx="40" cy="58" rx="18" ry="6" fill={`url(#${uid}GH)`} opacity="0.15" />
        {/* Temperature dial */}
        <circle cx="40" cy="35" r="10" stroke={`url(#${uid}GH)`} strokeWidth="2" fill="none" />
        <path d="M40 28 L40 35 L46 38" stroke={`url(#${uid}GH)`} strokeWidth="2" strokeLinecap="round" />
        <circle cx="40" cy="35" r="3" fill={`url(#${uid}GH)`} opacity="0.3" />
        {/* Flame indicator */}
        <path d="M35 50 Q32 46 35 42 Q38 38 40 42 Q42 38 45 42 Q48 46 45 50 Q42 54 40 52 Q38 54 35 50" fill={`url(#${uid}FL)`} />
        {/* Input/output pipes */}
        <path d="M28 18 L28 8 L22 8" stroke={`url(#${uid}GH)`} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M52 18 L52 8 L58 8" stroke={`url(#${uid}GH)`} strokeWidth="2.5" strokeLinecap="round" />
        {/* Heat waves */}
        <path d="M16 45 Q14 40 16 35" stroke={`url(#${uid}GH)`} strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
        <path d="M64 45 Q66 40 64 35" stroke={`url(#${uid}GH)`} strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      </svg>
    ),

    // COOKING RANGES - Free-standing stove with oven
    'cooking-ranges': (
      <svg viewBox="0 0 80 80" fill="none" className={className}>
        <defs>
          <linearGradient id={`${uid}CR`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#a78bfa" />
          </linearGradient>
          <linearGradient id={`${uid}BF`} x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#8B4049" />
          </linearGradient>
        </defs>
        {/* Cooktop surface */}
        <rect x="10" y="8" width="60" height="22" rx="3" stroke={`url(#${uid}CR)`} strokeWidth="2.5" fill="none" />
        {/* Burners with flames */}
        <circle cx="25" cy="19" r="8" stroke={`url(#${uid}CR)`} strokeWidth="2" fill="none" />
        <circle cx="25" cy="19" r="4" stroke={`url(#${uid}CR)`} strokeWidth="1" fill="none" />
        <path d="M23 16 Q22 14 24 12 Q25 14 24 16" fill={`url(#${uid}BF)`} />
        <path d="M27 16 Q26 14 28 12 Q29 14 28 16" fill={`url(#${uid}BF)`} />
        <circle cx="55" cy="19" r="8" stroke={`url(#${uid}CR)`} strokeWidth="2" fill="none" />
        <circle cx="55" cy="19" r="4" stroke={`url(#${uid}CR)`} strokeWidth="1" fill="none" />
        {/* Oven body */}
        <rect x="10" y="30" width="60" height="42" rx="3" stroke={`url(#${uid}CR)`} strokeWidth="2.5" fill="none" />
        {/* Control knobs */}
        <circle cx="18" cy="36" r="3" fill={`url(#${uid}CR)`} />
        <circle cx="30" cy="36" r="3" fill={`url(#${uid}CR)`} />
        <circle cx="50" cy="36" r="3" fill={`url(#${uid}CR)`} />
        <circle cx="62" cy="36" r="3" fill={`url(#${uid}CR)`} />
        {/* Oven window */}
        <rect x="16" y="44" width="48" height="18" rx="2" fill={`url(#${uid}CR)`} opacity="0.15" stroke={`url(#${uid}CR)`} strokeWidth="1.5" />
        {/* Oven handle */}
        <rect x="28" y="66" width="24" height="4" rx="2" fill={`url(#${uid}CR)`} />
      </svg>
    ),

    // BUILT-IN HOODS - Range hood / chimney style
    'built-in-hoods': (
      <svg viewBox="0 0 80 80" fill="none" className={className}>
        <defs>
          <linearGradient id={`${uid}KH`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#475569" />
            <stop offset="100%" stopColor="#64748b" />
          </linearGradient>
        </defs>
        {/* Hood chimney/duct */}
        <rect x="30" y="6" width="20" height="18" rx="2" stroke={`url(#${uid}KH)`} strokeWidth="2.5" fill={`url(#${uid}KH)`} opacity="0.15" />
        {/* Main hood body - pyramid shape */}
        <path d="M14 24 L30 24 L30 38 L14 50 Z" stroke={`url(#${uid}KH)`} strokeWidth="2.5" fill={`url(#${uid}KH)`} opacity="0.1" />
        <path d="M66 24 L50 24 L50 38 L66 50 Z" stroke={`url(#${uid}KH)`} strokeWidth="2.5" fill={`url(#${uid}KH)`} opacity="0.1" />
        <rect x="30" y="24" width="20" height="26" stroke={`url(#${uid}KH)`} strokeWidth="2.5" fill={`url(#${uid}KH)`} opacity="0.15" />
        {/* Hood bottom panel with filters */}
        <rect x="10" y="50" width="60" height="10" rx="2" stroke={`url(#${uid}KH)`} strokeWidth="2.5" fill="none" />
        <rect x="14" y="52" width="22" height="6" rx="1" fill={`url(#${uid}KH)`} opacity="0.3" />
        <rect x="44" y="52" width="22" height="6" rx="1" fill={`url(#${uid}KH)`} opacity="0.3" />
        {/* LED lights */}
        <circle cx="28" cy="48" r="2" fill="#fbbf24" opacity="0.9" />
        <circle cx="40" cy="48" r="2" fill="#fbbf24" opacity="0.9" />
        <circle cx="52" cy="48" r="2" fill="#fbbf24" opacity="0.9" />
        {/* Steam/air flow */}
        <path d="M30 65 Q28 70 30 75" stroke={`url(#${uid}KH)`} strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
        <path d="M40 64 Q38 70 40 76" stroke={`url(#${uid}KH)`} strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
        <path d="M50 65 Q48 70 50 75" stroke={`url(#${uid}KH)`} strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
        {/* Control panel */}
        <rect x="35" y="30" width="10" height="6" rx="1" fill={`url(#${uid}KH)`} opacity="0.4" />
        <circle cx="38" cy="33" r="1.5" fill={`url(#${uid}KH)`} />
        <circle cx="42" cy="33" r="1.5" fill={`url(#${uid}KH)`} />
      </svg>
    ),

    // AIR FRYERS - Modern digital air fryer
    'air-fryers': (
      <svg viewBox="0 0 80 80" fill="none" className={className}>
        <defs>
          <linearGradient id={`${uid}AF`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
        </defs>
        {/* Main body */}
        <path d="M18 16 Q18 10 26 10 L54 10 Q62 10 62 16 L62 62 Q62 70 54 70 L26 70 Q18 70 18 62 Z" stroke={`url(#${uid}AF)`} strokeWidth="2.5" fill={`url(#${uid}AF)`} opacity="0.1" />
        {/* Digital display panel */}
        <rect x="24" y="16" width="32" height="14" rx="2" fill={`url(#${uid}AF)`} opacity="0.2" stroke={`url(#${uid}AF)`} strokeWidth="1.5" />
        {/* Display text/numbers */}
        <text x="40" y="27" textAnchor="middle" fill={`url(#${uid}AF)`} fontSize="8" fontWeight="bold">180°C</text>
        {/* Touch controls */}
        <circle cx="28" cy="38" r="3" fill={`url(#${uid}AF)`} opacity="0.5" />
        <circle cx="40" cy="38" r="3" fill={`url(#${uid}AF)`} opacity="0.5" />
        <circle cx="52" cy="38" r="3" fill={`url(#${uid}AF)`} opacity="0.5" />
        {/* Basket area with handle */}
        <rect x="22" y="46" width="36" height="18" rx="3" stroke={`url(#${uid}AF)`} strokeWidth="2" fill={`url(#${uid}AF)`} opacity="0.15" />
        {/* Basket grid pattern */}
        <line x1="28" y1="50" x2="28" y2="60" stroke={`url(#${uid}AF)`} strokeWidth="1" opacity="0.4" />
        <line x1="34" y1="50" x2="34" y2="60" stroke={`url(#${uid}AF)`} strokeWidth="1" opacity="0.4" />
        <line x1="40" y1="50" x2="40" y2="60" stroke={`url(#${uid}AF)`} strokeWidth="1" opacity="0.4" />
        <line x1="46" y1="50" x2="46" y2="60" stroke={`url(#${uid}AF)`} strokeWidth="1" opacity="0.4" />
        <line x1="52" y1="50" x2="52" y2="60" stroke={`url(#${uid}AF)`} strokeWidth="1" opacity="0.4" />
        {/* Basket handle */}
        <rect x="35" y="44" width="10" height="4" rx="1" fill={`url(#${uid}AF)`} />
        {/* Heat waves on top */}
        <path d="M32 6 Q30 3 32 0" stroke={`url(#${uid}AF)`} strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
        <path d="M40 6 Q38 2 40 -2" stroke={`url(#${uid}AF)`} strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
        <path d="M48 6 Q46 3 48 0" stroke={`url(#${uid}AF)`} strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      </svg>
    ),

    // OVEN TOASTERS - Digital oven with convection
    'oven-toasters': (
      <svg viewBox="0 0 80 80" fill="none" className={className}>
        <defs>
          <linearGradient id={`${uid}OT`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>
        </defs>
        {/* Oven body */}
        <rect x="12" y="16" width="56" height="52" rx="4" stroke={`url(#${uid}OT)`} strokeWidth="2.5" fill="none" />
        {/* Control panel */}
        <rect x="16" y="20" width="48" height="12" rx="2" fill={`url(#${uid}OT)`} opacity="0.15" />
        <circle cx="24" cy="26" r="3" fill={`url(#${uid}OT)`} />
        <circle cx="36" cy="26" r="3" fill={`url(#${uid}OT)`} />
        <circle cx="48" cy="26" r="3" fill={`url(#${uid}OT)`} />
        <circle cx="60" cy="26" r="3" fill={`url(#${uid}OT)`} />
        {/* Oven window */}
        <rect x="18" y="36" width="44" height="24" rx="2" fill={`url(#${uid}OT)`} opacity="0.1" stroke={`url(#${uid}OT)`} strokeWidth="2" />
        {/* Window grid */}
        <line x1="40" y1="38" x2="40" y2="58" stroke={`url(#${uid}OT)`} strokeWidth="1" opacity="0.3" />
        <line x1="20" y1="48" x2="60" y2="48" stroke={`url(#${uid}OT)`} strokeWidth="1" opacity="0.3" />
        {/* Heating elements visible through window */}
        <path d="M26 42 Q28 40 30 42 Q32 44 34 42" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
        <path d="M26 54 Q28 52 30 54 Q32 56 34 54" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
        {/* Door handle */}
        <rect x="32" y="62" width="16" height="4" rx="2" fill={`url(#${uid}OT)`} />
      </svg>
    ),

    // BUILT-IN HOBS - Built-in gas/electric hob cooktop
    'built-in-hobs': (
      <svg viewBox="0 0 80 80" fill="none" className={className}>
        <defs>
          <linearGradient id={`${uid}HB`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#374151" />
            <stop offset="100%" stopColor="#4b5563" />
          </linearGradient>
          <linearGradient id={`${uid}FL2`} x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
        </defs>
        {/* Glass surface */}
        <rect x="8" y="20" width="64" height="44" rx="4" stroke={`url(#${uid}HB)`} strokeWidth="2.5" fill={`url(#${uid}HB)`} opacity="0.1" />
        {/* Large burner - top left */}
        <circle cx="26" cy="36" r="12" stroke={`url(#${uid}HB)`} strokeWidth="2" fill="none" />
        <circle cx="26" cy="36" r="7" stroke={`url(#${uid}HB)`} strokeWidth="1.5" fill="none" />
        <circle cx="26" cy="36" r="3" fill={`url(#${uid}FL2)`} opacity="0.8" />
        {/* Small burner - top right */}
        <circle cx="54" cy="36" r="9" stroke={`url(#${uid}HB)`} strokeWidth="2" fill="none" />
        <circle cx="54" cy="36" r="5" stroke={`url(#${uid}HB)`} strokeWidth="1.5" fill="none" />
        <circle cx="54" cy="36" r="2" fill={`url(#${uid}FL2)`} opacity="0.8" />
        {/* Touch control panel */}
        <rect x="28" y="54" width="24" height="6" rx="2" fill={`url(#${uid}HB)`} opacity="0.3" />
        <circle cx="34" cy="57" r="1.5" fill={`url(#${uid}HB)`} />
        <circle cx="40" cy="57" r="1.5" fill={`url(#${uid}HB)`} />
        <circle cx="46" cy="57" r="1.5" fill={`url(#${uid}HB)`} />
        {/* Heat lines */}
        <path d="M23 26 Q21 23 23 20" stroke={`url(#${uid}FL2)`} strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
        <path d="M26 26 Q24 22 26 18" stroke={`url(#${uid}FL2)`} strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
        <path d="M29 26 Q27 23 29 20" stroke={`url(#${uid}FL2)`} strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      </svg>
    ),

    // BLENDERS & FOOD PROCESSORS
    'blenders-processors': (
      <svg viewBox="0 0 80 80" fill="none" className={className}>
        <defs>
          <linearGradient id={`${uid}BP`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
        </defs>
        {/* Blender jar */}
        <path d="M25 18 L22 52 L38 52 L35 18" stroke={`url(#${uid}BP)`} strokeWidth="2.5" fill={`url(#${uid}BP)`} opacity="0.15" />
        <ellipse cx="30" cy="18" rx="6" ry="3" stroke={`url(#${uid}BP)`} strokeWidth="2" fill="none" />
        {/* Blender lid */}
        <rect x="27" y="12" width="6" height="6" rx="1" fill={`url(#${uid}BP)`} opacity="0.4" />
        {/* Blender base */}
        <rect x="20" y="52" width="20" height="12" rx="3" fill={`url(#${uid}BP)`} opacity="0.3" stroke={`url(#${uid}BP)`} strokeWidth="2" />
        <circle cx="30" cy="58" r="4" fill={`url(#${uid}BP)`} />
        {/* Blending liquid */}
        <path d="M26 28 Q24 32 26 36 Q28 40 26 44" stroke={`url(#${uid}BP)`} strokeWidth="1" strokeLinecap="round" opacity="0.4" />
        <path d="M30 26 Q28 30 30 34 Q32 38 30 42" stroke={`url(#${uid}BP)`} strokeWidth="1" strokeLinecap="round" opacity="0.4" />
        {/* Food processor on right */}
        <rect x="46" y="28" width="22" height="24" rx="3" stroke={`url(#${uid}BP)`} strokeWidth="2" fill={`url(#${uid}BP)`} opacity="0.1" />
        <ellipse cx="57" cy="28" rx="11" ry="4" stroke={`url(#${uid}BP)`} strokeWidth="2" fill={`url(#${uid}BP)`} opacity="0.15" />
        {/* Processor lid/pusher */}
        <rect x="54" y="18" width="6" height="10" rx="1" fill={`url(#${uid}BP)`} opacity="0.3" />
        {/* Processor blade indicator */}
        <circle cx="57" cy="40" r="6" stroke={`url(#${uid}BP)`} strokeWidth="1.5" fill="none" />
        <path d="M54 40 L60 40 M57 37 L57 43" stroke={`url(#${uid}BP)`} strokeWidth="1.5" />
        {/* Processor base */}
        <rect x="46" y="52" width="22" height="12" rx="3" fill={`url(#${uid}BP)`} opacity="0.3" stroke={`url(#${uid}BP)`} strokeWidth="2" />
        <rect x="50" y="56" width="14" height="4" rx="1" fill={`url(#${uid}BP)`} opacity="0.5" />
      </svg>
    ),

    // ROOM COOLERS - Evaporative air cooler
    'room-coolers': (
      <svg viewBox="0 0 80 80" fill="none" className={className}>
        <defs>
          <linearGradient id={`${uid}RC`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0ea5e9" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
        {/* Cooler body */}
        <rect x="16" y="12" width="48" height="56" rx="4" stroke={`url(#${uid}RC)`} strokeWidth="2.5" fill="none" />
        {/* Cooling pads (honeycomb pattern) */}
        <rect x="20" y="16" width="40" height="20" rx="2" fill={`url(#${uid}RC)`} opacity="0.15" />
        <path d="M24 20 L26 22 L26 28 L24 30 M30 20 L32 22 L32 28 L30 30 M36 20 L38 22 L38 28 L36 30 M42 20 L44 22 L44 28 L42 30 M48 20 L50 22 L50 28 L48 30" stroke={`url(#${uid}RC)`} strokeWidth="1" opacity="0.5" />
        {/* Fan blades */}
        <circle cx="40" cy="46" r="12" stroke={`url(#${uid}RC)`} strokeWidth="2" fill="none" />
        <path d="M40 34 L40 46 M28 46 L40 46 M40 46 L52 46" stroke={`url(#${uid}RC)`} strokeWidth="2" strokeLinecap="round" />
        <circle cx="40" cy="46" r="4" fill={`url(#${uid}RC)`} opacity="0.3" />
        {/* Air flow indicators */}
        <path d="M10 44 L14 44 M10 46 L14 46 M10 48 L14 48" stroke={`url(#${uid}RC)`} strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
        <path d="M66 44 L70 44 M66 46 L70 46 M66 48 L70 48" stroke={`url(#${uid}RC)`} strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
        {/* Water level indicator */}
        <rect x="22" y="58" width="36" height="6" rx="2" fill={`url(#${uid}RC)`} opacity="0.2" />
        <path d="M26 61 Q28 59 30 61 Q32 59 34 61" stroke={`url(#${uid}RC)`} strokeWidth="1.5" strokeLinecap="round" />
        {/* Wheels */}
        <circle cx="24" cy="70" r="3" fill={`url(#${uid}RC)`} opacity="0.5" />
        <circle cx="56" cy="70" r="3" fill={`url(#${uid}RC)`} opacity="0.5" />
      </svg>
    ),

    // KITCHEN APPLIANCES - Various small appliances
    'kitchen-appliances': (
      <svg viewBox="0 0 80 80" fill="none" className={className}>
        <defs>
          <linearGradient id={`${uid}KA`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
        </defs>
        {/* Blender */}
        <path d="M15 22 L12 55 L28 55 L25 22" stroke={`url(#${uid}KA)`} strokeWidth="2" fill={`url(#${uid}KA)`} opacity="0.15" />
        <ellipse cx="20" cy="22" rx="6" ry="3" stroke={`url(#${uid}KA)`} strokeWidth="2" fill="none" />
        <rect x="13" y="55" width="14" height="10" rx="2" fill={`url(#${uid}KA)`} opacity="0.3" />
        <circle cx="20" cy="60" r="3" fill={`url(#${uid}KA)`} />
        {/* Microwave */}
        <rect x="42" y="40" width="32" height="22" rx="3" stroke={`url(#${uid}KA)`} strokeWidth="2" fill="none" />
        <rect x="46" y="44" width="18" height="14" rx="1" fill={`url(#${uid}KA)`} opacity="0.15" />
        <rect x="66" y="46" width="4" height="10" rx="1" fill={`url(#${uid}KA)`} opacity="0.3" />
        <circle cx="68" cy="48" r="1.5" fill={`url(#${uid}KA)`} />
        <circle cx="68" cy="53" r="1.5" fill={`url(#${uid}KA)`} />
        {/* Electric Kettle */}
        <ellipse cx="58" cy="18" rx="12" ry="5" stroke={`url(#${uid}KA)`} strokeWidth="2" fill="none" />
        <path d="M46 18 L46 30 Q46 36 58 36 Q70 36 70 30 L70 18" stroke={`url(#${uid}KA)`} strokeWidth="2" fill={`url(#${uid}KA)`} opacity="0.15" />
        <path d="M70 24 L76 22 L76 28 L70 26" fill={`url(#${uid}KA)`} />
        {/* Steam from kettle */}
        <path d="M54 12 Q53 9 54 6" stroke={`url(#${uid}KA)`} strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
        <path d="M58 12 Q57 8 58 4" stroke={`url(#${uid}KA)`} strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
        <path d="M62 12 Q61 9 62 6" stroke={`url(#${uid}KA)`} strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      </svg>
    ),

    // ACCESSORIES - Generic accessories icon
    'accessories': (
      <svg viewBox="0 0 80 80" fill="none" className={className}>
        <defs>
          <linearGradient id={`${uid}AC`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#722F37" />
            <stop offset="100%" stopColor="#8B4049" />
          </linearGradient>
        </defs>
        {/* Wrench */}
        <path d="M20 60 L35 45 L30 40 L15 55 Q12 58 15 61 Q18 64 21 61 Z" stroke={`url(#${uid}AC)`} strokeWidth="2" fill={`url(#${uid}AC)`} opacity="0.2" />
        {/* Screwdriver */}
        <rect x="45" y="15" width="6" height="30" rx="1" stroke={`url(#${uid}AC)`} strokeWidth="2" fill="none" />
        <path d="M45 45 L48 55 L51 45" fill={`url(#${uid}AC)`} />
        <rect x="44" y="10" width="8" height="8" rx="2" fill={`url(#${uid}AC)`} opacity="0.3" />
        {/* Gear */}
        <circle cx="58" cy="58" r="12" stroke={`url(#${uid}AC)`} strokeWidth="2" fill="none" />
        <circle cx="58" cy="58" r="5" fill={`url(#${uid}AC)`} opacity="0.3" />
        {/* Gear teeth */}
        <rect x="56" y="44" width="4" height="6" fill={`url(#${uid}AC)`} />
        <rect x="56" y="68" width="4" height="6" fill={`url(#${uid}AC)`} />
        <rect x="44" y="56" width="6" height="4" fill={`url(#${uid}AC)`} />
        <rect x="68" y="56" width="6" height="4" fill={`url(#${uid}AC)`} />
      </svg>
    ),
  }

  // Try to match slug variations
  const normalizedSlug = slug.toLowerCase().replace(/\s+/g, '-')

  // Check for partial matches (fallback for slug variations)
  if (normalizedSlug.includes('storage') && normalizedSlug.includes('water')) {
    return icons['storage-type-water-coolers']
  }
  if (normalizedSlug.includes('air') && normalizedSlug.includes('fryer')) {
    return icons['air-fryers']
  }
  if (normalizedSlug.includes('kitchen') && normalizedSlug.includes('hood')) {
    return icons['kitchen-hoods']
  }
  if (normalizedSlug.includes('hob')) {
    return icons['built-in-hobs']
  }
  if (normalizedSlug.includes('hood') && !normalizedSlug.includes('kitchen')) {
    return icons['built-in-hobs']
  }
  if (normalizedSlug.includes('geyser') || normalizedSlug.includes('heater')) {
    return icons['geysers-heaters']
  }
  if (normalizedSlug.includes('dispenser')) {
    return icons['water-dispensers']
  }
  if (normalizedSlug.includes('range') || normalizedSlug.includes('cooking')) {
    return icons['cooking-ranges']
  }
  if (normalizedSlug.includes('cooler') && !normalizedSlug.includes('storage')) {
    return icons['water-coolers']
  }
  if (normalizedSlug.includes('accessor')) {
    return icons['accessories']
  }
  if (normalizedSlug.includes('blender') || normalizedSlug.includes('processor')) {
    return icons['blenders-processors']
  }
  if (normalizedSlug.includes('kitchen') || normalizedSlug.includes('appliance')) {
    return icons['kitchen-appliances']
  }

  return icons[normalizedSlug] || (
    // Default icon - generic appliance
    <svg viewBox="0 0 80 80" fill="none" className={className}>
      <defs>
        <linearGradient id={`${uid}DF`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#722F37" />
          <stop offset="100%" stopColor="#8B4049" />
        </linearGradient>
      </defs>
      <rect x="15" y="15" width="50" height="50" rx="8" stroke={`url(#${uid}DF)`} strokeWidth="2.5" fill={`url(#${uid}DF)`} opacity="0.15" />
      <circle cx="40" cy="40" r="12" stroke={`url(#${uid}DF)`} strokeWidth="2" fill="none" />
      <path d="M40 32 L40 40 L46 46" stroke={`url(#${uid}DF)`} strokeWidth="2" strokeLinecap="round" />
      <circle cx="40" cy="40" r="3" fill={`url(#${uid}DF)`} />
    </svg>
  )
}
