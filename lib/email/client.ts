export async function sendEmail(params: {
  to: string;
  name?: string;
  link: string;
  type: 'individual' | 'resume' | 'together_ready';
}) {
  const res = await fetch('/api/send-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Email failed');
  }
  return res.json();
}
