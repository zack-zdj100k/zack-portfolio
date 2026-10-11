// Skill → periodic-table symbol + brand icon. Named imports keep the bundle to these icons only.
import {
  siAngular,
  siCloudinary,
  siCplusplus,
  siCss,
  siDart,
  siDjango,
  siDocker,
  siDrizzle,
  siElectron,
  siExpress,
  siFigma,
  siFirebase,
  siFlutter,
  siGit,
  siGithub,
  siHtml5,
  siJavascript,
  siKotlin,
  siLaravel,
  siMongodb,
  siMysql,
  siNestjs,
  siNextdotjs,
  siNodedotjs,
  siOpenjdk,
  siPhp,
  siPostgresql,
  siPrisma,
  siPython,
  siReact,
  siRedis,
  siSqlite,
  siSupabase,
  siSwift,
  siTailwindcss,
  siThreedotjs,
  siTypescript,
  siVercel,
  siVitest,
  siVuedotjs,
} from "simple-icons";

type Icon = { title: string; hex: string; path: string };

const KNOWN: Record<string, { symbol: string; icon?: Icon }> = {
  "next.js": { symbol: "Nx", icon: siNextdotjs },
  nextjs: { symbol: "Nx", icon: siNextdotjs },
  react: { symbol: "Re", icon: siReact },
  "react native": { symbol: "Rn", icon: siReact },
  typescript: { symbol: "Ts", icon: siTypescript },
  javascript: { symbol: "Js", icon: siJavascript },
  "tailwind css": { symbol: "Tw", icon: siTailwindcss },
  tailwind: { symbol: "Tw", icon: siTailwindcss },
  html: { symbol: "Ht", icon: siHtml5 },
  html5: { symbol: "Ht", icon: siHtml5 },
  css: { symbol: "Cs", icon: siCss },
  "vue.js": { symbol: "Vu", icon: siVuedotjs },
  vue: { symbol: "Vu", icon: siVuedotjs },
  angular: { symbol: "Ng", icon: siAngular },
  "three.js": { symbol: "Th", icon: siThreedotjs },
  "node.js": { symbol: "No", icon: siNodedotjs },
  node: { symbol: "No", icon: siNodedotjs },
  nestjs: { symbol: "Ne", icon: siNestjs },
  express: { symbol: "Ex", icon: siExpress },
  "rest apis": { symbol: "Ra" },
  "rest api": { symbol: "Ra" },
  python: { symbol: "Py", icon: siPython },
  java: { symbol: "Jv", icon: siOpenjdk },
  "c++": { symbol: "Cp", icon: siCplusplus },
  cpp: { symbol: "Cp", icon: siCplusplus },
  sql: { symbol: "Sq" },
  dart: { symbol: "Da", icon: siDart },
  "power bi": { symbol: "Bi" },
  django: { symbol: "Dj", icon: siDjango },
  php: { symbol: "Ph", icon: siPhp },
  laravel: { symbol: "Lv", icon: siLaravel },
  kotlin: { symbol: "Kt", icon: siKotlin },
  swift: { symbol: "Sw", icon: siSwift },
  flutter: { symbol: "Fl", icon: siFlutter },
  electron: { symbol: "El", icon: siElectron },
  postgresql: { symbol: "Pg", icon: siPostgresql },
  postgres: { symbol: "Pg", icon: siPostgresql },
  mysql: { symbol: "My", icon: siMysql },
  sqlite: { symbol: "Sl", icon: siSqlite },
  mongodb: { symbol: "Mg", icon: siMongodb },
  redis: { symbol: "Rd", icon: siRedis },
  prisma: { symbol: "Pr", icon: siPrisma },
  "prisma orm": { symbol: "Pr", icon: siPrisma },
  "prisma migrate": { symbol: "Pm", icon: siPrisma },
  "drizzle orm": { symbol: "Dz", icon: siDrizzle },
  drizzle: { symbol: "Dz", icon: siDrizzle },
  supabase: { symbol: "Sb", icon: siSupabase },
  firebase: { symbol: "Fb", icon: siFirebase },
  git: { symbol: "Gt", icon: siGit },
  github: { symbol: "Gh", icon: siGithub },
  docker: { symbol: "Dk", icon: siDocker },
  vercel: { symbol: "Vc", icon: siVercel },
  figma: { symbol: "Fg", icon: siFigma },
  playwright: { symbol: "Pw" },
  vitest: { symbol: "Vt", icon: siVitest },
  cloudinary: { symbol: "Cl", icon: siCloudinary },
};

export type StackIcon = { path: string; color: string } | null;

/** Brand colour, lightened when it would vanish on the dark page (e.g. Next.js black). */
function visibleColor(hex: string) {
  const n = parseInt(hex, 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luminance < 0.28 ? "#D7E2EA" : `#${hex}`;
}

/** Two-letter symbol: known mapping, else first letter + next consonant ("Svelte" → "Sv"). */
export function stackSymbol(name: string): string {
  const known = KNOWN[name.trim().toLowerCase()];
  if (known) return known.symbol;
  const letters = name.replace(/[^a-zA-Z]/g, "");
  if (!letters) return name.slice(0, 2);
  const second = letters.slice(1).match(/[bcdfghjklmnpqrstvwxyz]/i)?.[0] ?? letters[1] ?? "";
  return letters[0].toUpperCase() + second.toLowerCase();
}

export function stackIcon(name: string): StackIcon {
  const icon = KNOWN[name.trim().toLowerCase()]?.icon;
  return icon ? { path: icon.path, color: visibleColor(icon.hex) } : null;
}
