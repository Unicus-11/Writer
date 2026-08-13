import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role to bypass RLS
);
const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { subject, message } = req.body;

  try {
    // 1. Fetch all subscriber emails from Supabase
    const { data: subscribers, error } = await supabase
      .from('Subscribers')
      .select('email');

    if (error || !subscribers.length) {
      return res.status(400).json({ error: 'No subscribers found.' });
    }

    const emailList = subscribers.map(sub => sub.email);

    // 2. Send email to all subscribers via Resend
    const data = await resend.emails.send({
      from: 'Clovis <newsletter@yourdomain.com>',
      to: emailList, // Bcc or Array depending on provider setup
      subject: subject,
      html: `<p>${message.replace(/\n/g, '<br>')}</p>`
    });

    return res.status(200).json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}