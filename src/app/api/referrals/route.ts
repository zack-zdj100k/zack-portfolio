import { prisma } from "@/server/db";
import { checkPublicForm, readJson, type FormFailure } from "@/server/security/public-form";
import { fieldErrors, referralSchema } from "@/server/validation/forms";

export async function POST(request: Request) {
  const body = await readJson(request);
  if (!body) return Response.json({ ok: false, error: "validation" } satisfies FormFailure, { status: 400 });

  const guard = await checkPublicForm("referral", body);
  if (guard.response) return guard.response;

  const parsed = referralSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ ok: false, error: "validation", fields: fieldErrors(parsed.error) } satisfies FormFailure, { status: 422 });
  }
  const data = parsed.data;

  try {
    // Only countries the owner listed in a published offer are eligible, and only for the project
    // categories that offer covers (empty = every category). The reward is snapshotted now.
    const offers = await prisma.referralOfferCountry.findMany({
      where: { country: data.referrerCountry, status: "PUBLISHED", available: true, offer: { status: "PUBLISHED" } },
      orderBy: { offer: { sortOrder: "asc" } },
    });
    const offer =
      offers.find((o) => o.categories.includes(data.projectCategory)) ?? offers.find((o) => o.categories.length === 0);
    if (!offer) {
      const fields: Record<string, string> = offers.length > 0 ? { projectCategory: "notEligible" } : { referrerCountry: "notEligible" };
      return Response.json({ ok: false, error: "validation", fields } satisfies FormFailure, { status: 422 });
    }

    await prisma.referral.create({
      data: {
        ...data,
        offerId: offer.id,
        rewardMinorSnapshot: offer.rewardMinor,
        rewardCurrencySnapshot: offer.currency,
      },
    });
    return Response.json({ ok: true }, { status: 201 });
  } catch (e) {
    console.error("referral: could not store referral", e instanceof Error ? e.name : "unknown");
    return Response.json({ ok: false, error: "server" } satisfies FormFailure, { status: 500 });
  }
}
