import { Resend } from 'resend';

const FROM_EMAIL = 'admin@auxarmescitoyens.fr';

export function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  
  if (!apiKey) {
    throw new Error('RESEND_API_KEY not configured');
  }
  
  return {
    client: new Resend(apiKey),
    fromEmail: FROM_EMAIL
  };
}

export async function sendContactNotification(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  try {
    console.log('[Resend] Attempting to send contact notification...');
    const { client, fromEmail } = getResendClient();
    console.log('[Resend] Client obtained, fromEmail:', fromEmail);
    
    const result = await client.emails.send({
      from: fromEmail || 'CitiZarm <noreply@citizarm.fr>',
      to: 'contact@citizarm.fr',
      subject: `${data.name} - [Contact] ${data.subject}`,
      html: `
        <h2>Nouveau message de contact</h2>
        <p><strong>Nom:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Sujet:</strong> ${data.subject}</p>
        <p><strong>Message:</strong></p>
        <p>${data.message.replace(/\n/g, '<br>')}</p>
      `
    });
    
    console.log('[Resend] Email sent successfully:', result);
    return true;
  } catch (error) {
    console.error('[Resend] Failed to send contact notification:', error);
    return false;
  }
}
