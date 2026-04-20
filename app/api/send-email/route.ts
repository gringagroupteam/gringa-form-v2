import { sendMagicLink } from "@/lib/email/send";

export async function POST(request: Request) {
  const body = await request.json();
  const { to, name, link, type } = body;

  if (!to || !link || !type) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    await sendMagicLink({ to, name, link, type });
    return Response.json({ success: true });
  } catch (err: unknown) {
    console.error('Email send error:', err);
    const message = err instanceof Error ? err.message : 'Failed to send email';
    return Response.json({ error: message }, { status: 500 });
  }
}
