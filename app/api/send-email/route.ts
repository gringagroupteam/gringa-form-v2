import { sendMagicLink } from "@/lib/email/send";

export async function POST(request: Request) {
  const body = await request.json();
  const { to, name, link, type } = body;

  if (!to || !link || !type) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    console.log(`[API/Email] Attempting to send ${type} email to ${to}...`);
    if (!process.env.RESEND_API_KEY) {
      console.error("[API/Email] FATAL: RESEND_API_KEY is missing in environment variables!");
    }
    await sendMagicLink({ to, name, link, type });
    console.log(`[API/Email] Success! Email sent to ${to}.`);
    return Response.json({ success: true });
  } catch (err: unknown) {
    console.error('[API/Email] ERROR:', err);
    const message = err instanceof Error ? err.message : 'Failed to send email';
    return Response.json({ error: message }, { status: 500 });
  }
}
