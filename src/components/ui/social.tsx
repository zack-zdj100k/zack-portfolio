import { Globe, Network } from "lucide-react";
import { siFacebook, siGithub, siIndeed, siInstagram, siWhatsapp, siX, type SimpleIcon } from "simple-icons";
import type { SocialKind } from "@/server/generated/prisma/enums";

// Brand marks from simple-icons where they exist (it has no LinkedIn mark), a neutral glyph otherwise.
const BRANDS: Partial<Record<SocialKind, SimpleIcon>> = {
  GITHUB: siGithub,
  INDEED: siIndeed,
  WHATSAPP: siWhatsapp,
  INSTAGRAM: siInstagram,
  FACEBOOK: siFacebook,
  X: siX,
};

const NAMES: Record<SocialKind, string> = {
  GITHUB: "GitHub",
  LINKEDIN: "LinkedIn",
  INDEED: "Indeed",
  WHATSAPP: "WhatsApp",
  INSTAGRAM: "Instagram",
  FACEBOOK: "Facebook",
  X: "X",
  OTHER: "Website",
};

export function socialLabel(kind: SocialKind, label?: string | null) {
  return label || NAMES[kind];
}

export function SocialIcon({ kind, className = "size-[18px]" }: { kind: SocialKind; className?: string }) {
  const brand = BRANDS[kind];
  if (brand) {
    return (
      <svg aria-hidden viewBox="0 0 24 24" className={className} fill="currentColor">
        <path d={brand.path} />
      </svg>
    );
  }
  const Icon = kind === "LINKEDIN" ? Network : Globe;
  return <Icon aria-hidden className={className} strokeWidth={1.75} />;
}

/** "github.com/zack" style text for a profile link: host and path, without protocol or "www.". */
export function socialHandle(url: string) {
  try {
    const u = new URL(url);
    return `${u.host.replace(/^www\./, "")}${u.pathname.replace(/\/$/, "")}`;
  } catch {
    return url;
  }
}

/** wa.me link from a phone number in any format, optionally with a pre-filled message. */
export function whatsappHref(number: string, text?: string) {
  const base = `https://wa.me/${number.replace(/[^\d]/g, "")}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}
