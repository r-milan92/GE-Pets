const recipient = 'info@internationalhealth.eu';
const endpoint = `https://formsubmit.co/ajax/${recipient}`;

export async function sendContact(payload, { request = fetch, timeoutMs = 12000 } = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await request(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
      credentials: 'omit',
      redirect: 'error'
    });
    if (!response.ok) throw new Error('Contact service unavailable');
    const result = await response.json();
    // Activation is not evidence of acceptance or email delivery.
    if (/activat|confirm.{0,30}email|verify.{0,30}email/i.test(String(result?.message || ''))) {
      return { status: 'activation-required' };
    }
    // Some responses use a string; "false" must never count as success.
    if (result?.success !== true && result?.success !== 'true') throw new Error('Contact submission not confirmed');
    return { status: 'accepted' };
  } finally {
    clearTimeout(timeout);
  }
}

export function contactMailto(values) {
  const subject = `GE Pets — ${values.Tema || 'Upit sa sajta'}`;
  const body = `Ime: ${values.Ime || ''}\r\nEmail za odgovor: ${values.email || ''}\r\nTema: ${values.Tema || ''}\r\n\r\n${values.Poruka || ''}`;
  return `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
