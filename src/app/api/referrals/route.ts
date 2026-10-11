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
    // Snapshot the published offer that applies right now: country + category first, then the
    // country's general offer, then the rest-of-world offer.
    const offers = await prisma.countryOffer.findMany({
      where: { status: "PUBLISHED", market: { in: [data.referrerCountry, "*"] } },
      orderBy: { sortOrder: "asc" },
    });
    const rank = (o: (typeof offers)[number]) =>
      (o.market === data.referrerCountry ? 0 : 2) + (o.category === data.projectCategory ? 0 : o.category === null ? 1 : 9);
    const offer = offers.filter((o) => o.category === null || o.category === data.projectCategory).sort((a, b) => rank(a) - rank(b))[0];

    await prisma.referral.create({
      data: {
        ...data,
        offerId: offer?.id ?? null,
        rewardMinorSnapshot: offer?.rewardMinor ?? null,
        rewardCurrencySnapshot: offer?.currency ?? null,
      },
    });
    return Response.json({ ok: true }, { status: 201 });
  } catch (e) {
    console.error("referral: could not store referral", e instanceof Error ? e.name : "unknown");
    return Response.json({ ok: false, error: "server" } satisfies FormFailure, { status: 500 });
  }
}
