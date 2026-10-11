import { notFound } from "next/navigation";

// Unknown paths under a locale render that locale's not-found page (translated, with the site shell).
export default function CatchAll() {
  notFound();
}
