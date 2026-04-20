import { Resend } from 'resend';

export async function sendMagicLink({
  to,
  name,
  link,
  type,
}: {
  to: string;
  name?: string;
  link: string;
  type: 'individual' | 'resume' | 'together_ready';
}) {
  const subjects = {
    individual: 'Your personal link — Gringa Discovery Form',
    resume: 'Continue your Gringa Discovery Form',
    together_ready: "You're up — complete your brand discovery form",
  };

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { data, error } = await resend.emails.send({
    from: 'Gringa Group <discovery@gringagroup.com>',
    to,
    subject: subjects[type],
    html: buildEmailHTML({ name, link, type }),
  });

  if (error) throw new Error(error.message);
  return data;
}

function buildEmailHTML({
  name,
  link,
  type,
}: {
  name?: string;
  link: string;
  type: string;
}) {
  const greeting = name ? `Hello, ${name}.` : 'Hello.';

  const bodies = {
    individual: `
      We've started your brand discovery form. 
      This link is yours — it takes you to your personal section 
      that only you should answer.
      <br><br>
      Take your time. Answer honestly. Don't show this link 
      to your partner before they've answered theirs.
    `,
    resume: `
      You left your form unfinished. No worries — 
      everything is saved exactly where you left off.
      <br><br>
      Click below to pick up where you stopped.
    `,
    together_ready: `
      Both of you have completed your individual sections.
      <br><br>
      It's time to sit together, open a bottle of something good, 
      and answer the rest as a team.
    `,
  };

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#F5F2EC;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:60px 24px;">
        <table width="560" cellpadding="0" cellspacing="0" 
               style="max-width:560px;width:100%;">
          
          <!-- Header -->
          <tr>
            <td style="padding-bottom:48px;">
              <span style="font-family:Arial,sans-serif;font-size:11px;
                           letter-spacing:0.1em;color:#8A8A8A;
                           text-transform:uppercase;">
                GRINGA GROUP™
              </span>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding-bottom:24px;">
              <h1 style="margin:0;font-family:Georgia,serif;
                         font-size:36px;font-weight:400;
                         color:#0A0A0A;line-height:1.1;">
                ${greeting}
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding-bottom:40px;">
              <p style="margin:0;font-family:Arial,sans-serif;
                        font-size:15px;color:#4A4A4A;
                        line-height:1.65;">
                ${bodies[type as keyof typeof bodies] || ''}
              </p>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding-bottom:48px;">
              <a href="${link}" 
                 style="display:inline-block;
                        background:#0A0A0A;color:#F5F2EC;
                        font-family:Arial,sans-serif;
                        font-size:13px;letter-spacing:0.06em;
                        text-transform:uppercase;
                        text-decoration:none;
                        padding:16px 32px;">
                Open my form →
              </a>
            </td>
          </tr>

          <!-- Link fallback -->
          <tr>
            <td style="padding-bottom:48px;
                       border-top:1px solid rgba(10,10,10,0.1);
                       padding-top:24px;">
              <p style="margin:0 0 8px;font-family:Arial,sans-serif;
                        font-size:11px;color:#8A8A8A;
                        text-transform:uppercase;letter-spacing:0.06em;">
                Or copy this link
              </p>
              <p style="margin:0;font-family:monospace;
                        font-size:12px;color:#4A4A4A;
                        word-break:break-all;">
                ${link}
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td>
              <p style="margin:0;font-family:Arial,sans-serif;
                        font-size:11px;color:#8A8A8A;
                        font-style:italic;">
                This link is personal. Please don't forward it.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
