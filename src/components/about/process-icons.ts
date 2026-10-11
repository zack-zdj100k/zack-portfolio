// Icons the owner can pick for a How I Work step (Admin → How I work). Named imports keep the bundle small.
import {
  Bug,
  ChartLine,
  CircleCheck,
  ClipboardList,
  Code,
  Hammer,
  Handshake,
  Lightbulb,
  MessagesSquare,
  Palette,
  RefreshCw,
  Rocket,
  Search,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

export const PROCESS_ICONS: Record<string, LucideIcon> = {
  "messages-square": MessagesSquare,
  search: Search,
  lightbulb: Lightbulb,
  "clipboard-list": ClipboardList,
  palette: Palette,
  code: Code,
  hammer: Hammer,
  bug: Bug,
  "circle-check": CircleCheck,
  "shield-check": ShieldCheck,
  rocket: Rocket,
  "chart-line": ChartLine,
  "refresh-cw": RefreshCw,
  handshake: Handshake,
};

export const PROCESS_ICON_NAMES = Object.keys(PROCESS_ICONS);
