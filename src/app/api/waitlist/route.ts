import { prisma } from "@/server/db";
import { checkPublicForm, readJson, type FormFailure } from "@/server/security/public-form";
import { fieldErrors, waitlistSchema } from "@/server/validation/forms";

/** Coming Soon waitlist sign-ups. Stored as inquiries (kind WAITLIST) so they land in the same inbox. */
export async function POST(request: Request) {
  const body = await readJson(request);
  if (!body) return Response.json({ ok: false, error: "validation" } satisfies FormFailure, { status: 400 });

  const guard = await checkPublicForm("waitlist", body);
  if (guard.response) return guard.response;

  const parsed = waitlistSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ ok: false, error: "validation", fields: fieldErrors(parsed.error) } satisfies FormFailure, { status: 422 });
  }
  const { aiServiceId, message, ...data } = parsed.data;

  try {
    // The waitlist exists only while the admin has it switched on for a published Coming Soon item.
    const service = await prisma.aiService.findFirst({
      where: { id: aiServiceId, status: "COMING_SOON", waitlistEnabled: true, publishStatus: "PUBLISHED" },
      include: { translations: { where: { locale: "en" } } },
    });
    if (!service) return Response.json({ ok: false, error: "forbidden" } satisfies FormFailure, { status: 403 });
    await prisma.contactInquiry.create({
      data: {
        ...data,
        kind: "WAITLIST",
        aiServiceId: service.id,
        message: message ?? `Waitlist: ${service.translations[0]?.title ?? service.key}`,
      },
    });
    return Response.json({ ok: true }, { status: 201 });
  } catch (e) {
    console.error("waitlist: could not store sign-up", e instanceof Error ? e.name : "unknown");
    return Response.json({ ok: false, error: "server" } satisfies FormFailure, { status: 500 });
  }
}
