import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

// Initialize clients using Vercel Environment Variables
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  // 1. Enable CORS so your website can talk to this API
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle browser preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { subject, message } = req.body;

  try {
    // 2. Fetch all subscriber emails from Supabase
    const { data: subscribers, error } = await supabase
      .from('Subscribers')
      .select('email');

    if (error || !subscribers || subscribers.length === 0) {
      return res.status(400).json({ error: 'No subscribers found in database.' });
    }

    const emailList = subscribers.map(sub => sub.email);

    // 3. Send email via Resend using onboarding address
    const data = await resend.emails.send({
      from: 'Clovis <onboarding@resend.dev>',
      to: emailList,
      subject: subject,
      html: `<div style="font-family: serif; color: #2b211a; line-height: 1.6;">${message.replace(/\n/g, '<br>')}</div>`
    });

    if (data.error) {
      return res.status(400).json({ error: data.error.message });
    }

    return res.status(200).json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}