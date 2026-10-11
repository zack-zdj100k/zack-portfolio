import { prisma } from "@/server/db";
import { checkPublicForm, readJson, type FormFailure } from "@/server/security/public-form";
import { contactSchema, fieldErrors } from "@/server/validation/forms";

export async function POST(request: Request) {
  const body = await readJson(request);
  if (!body) return Response.json({ ok: false, error: "validation" } satisfies FormFailure, { status: 400 });

  const guard = await checkPublicForm("contact", body);
  if (guard.response) return guard.response;

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ ok: false, error: "validation", fields: fieldErrors(parsed.error) } satisfies FormFailure, { status: 422 });
  }

  try {
    await prisma.contactInquiry.create({ data: parsed.data });
    return Response.json({ ok: true }, { status: 201 });
  } catch (e) {
    // Log the failure type only: never the submitted personal data.
    console.error("contact: could not store inquiry", e instanceof Error ? e.name : "unknown");
    return Response.json({ ok: false, error: "server" } satisfies FormFailure, { status: 500 });
  }
}
