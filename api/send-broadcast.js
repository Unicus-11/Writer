import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { subject, message } = req.body;

  try {
    // 1. Send test email directly to your registered email
    const response = await resend.emails.send({
      from: 'Clovis <onboarding@resend.dev>',
      to: 'mandukya8@gmail.com', // Must match your Resend account email!
      subject: subject || 'Test Letter',
      html: `<div style="font-family: serif; color: #2b211a; line-height: 1.6;">${(message || '').replace(/\n/g, '<br>')}</div>`
    });

    // Explicitly print any Resend error to Vercel Console Logs
    if (response.error) {
      console.log('RESEND ERROR OBJECT:', JSON.stringify(response.error));
      return res.status(400).json({ error: response.error });
    }

    console.log('RESEND SUCCESS:', JSON.stringify(response.data));
    return res.status(200).json({ success: true, data: response.data });
  } catch (err) {
    console.log('CATCH ERROR:', err.message);
    return res.status(500).json({ error: err.message });
  }
}