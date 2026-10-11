import { Alexandria, Caveat, Kanit, Montserrat } from "next/font/google";

export const kanit = Kanit({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "700", "900"],
  variable: "--font-kanit",
  display: "swap",
});
// Kanit has no Cyrillic or Arabic glyphs; these faces fill in for ru/uk and ar.
export const montserrat = Montserrat({ subsets: ["cyrillic", "cyrillic-ext"], variable: "--font-cyrillic", display: "swap" });
export const alexandria = Alexandria({ subsets: ["arabic"], variable: "--font-arabic", display: "swap" });

// Handwritten numerals on the "How I work" notes.
export const caveat = Caveat({ subsets: ["latin"], weight: ["600"], variable: "--font-hand", display: "swap" });

export const fontVariables = `${kanit.variable} ${montserrat.variable} ${alexandria.variable} ${caveat.variable}`;
