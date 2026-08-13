import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Paste your Google Web App URL here
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwEocerP1ZnhZMyq3szsbJYHImJM95PxzizOThsR8v1pTmZfhc-HCewzEB0JyTha1h-hQ/exec';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { subject, message } = req.body;

  try {
    // 1. Fetch ALL subscriber emails from Supabase
    const { data: subscribers, error } = await supabase
      .from('Subscribers')
      .select('email');

    if (error || !subscribers || subscribers.length === 0) {
      return res.status(400).json({ error: 'No subscribers found in database.' });
    }

    const emailList = subscribers.map(sub => sub.email);

    // 2. Forward to Google Apps Script to send emails via Gmail
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipients: emailList,
        subject: subject || 'New Letter',
        message: message || ''
      })
    });

    const result = await response.json();

    if (result.error) {
      return res.status(400).json({ error: result.error });
    }

    return res.status(200).json({ success: true, message: 'Broadcast sent to all subscribers!' });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}