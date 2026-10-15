import type { Metadata, Viewport } from "next";
import { fontVariables } from "../fonts";
import { ZoomLock } from "@/components/layout/ZoomLock";
import "../globals.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Admin" },
  robots: { index: false, follow: false },
};

// Zoom is locked on purpose (owner request); see ZoomLock for the cases the meta tag misses.
export const viewport: Viewport = { themeColor: "#0c0c0c", colorScheme: "dark", width: "device-width", initialScale: 1, maximumScale: 1, userScalable: false };

export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return (
    <html lang="en" dir="ltr" className={fontVariables}>
      <body className="min-h-dvh bg-ink text-mist">
        <ZoomLock />
        {children}
      </body>
    </html>
  );
}
