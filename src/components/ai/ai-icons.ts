// Icons the owner can pick for an AI service (Admin → AI services).
import { AppWindow, Bot, BrainCircuit, ChartCandlestick, ChartPie, FileSearch, MessageSquareText, Sparkles, Workflow, type LucideIcon } from "lucide-react";

export const AI_ICONS: Record<string, LucideIcon> = {
  bot: Bot,
  workflow: Workflow,
  "app-window": AppWindow,
  "chart-pie": ChartPie,
  "candlestick-chart": ChartCandlestick,
  "brain-circuit": BrainCircuit,
  "message-square-text": MessageSquareText,
  "file-search": FileSearch,
  sparkles: Sparkles,
};

export const AI_ICON_NAMES = Object.keys(AI_ICONS);
