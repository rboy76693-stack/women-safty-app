import emailjs from '@emailjs/browser';

const SERVICE_ID  = 'service_75l0lia';
const TEMPLATE_ID = 'template_xu3vxau';
const PUBLIC_KEY  = '45-oAufvCq-AQekb1';

emailjs.init(PUBLIC_KEY);

export const sendSOSEmail = async (contact, userName, lat, lng, incidentType) => {
  if (!contact.email) return;
  const locationUrl = lat !== 0 ? `https://maps.google.com/?q=${lat},${lng}` : 'Location unavailable';

  await emailjs.send(SERVICE_ID, TEMPLATE_ID, {
    to_email:      contact.email,
    from_name:     userName,
    incident_type: incidentType,
    location_url:  locationUrl,
    time:          new Date().toLocaleString(),
  });
  console.log(`[EmailJS] Sent to ${contact.email}`);
};

export const sendSOSToAll = async (contacts, userName, lat, lng, incidentType) => {
  const emailContacts = contacts.filter(c => c.email);
  console.log(`[EmailJS] Sending to ${emailContacts.length} contacts`);
  const results = await Promise.allSettled(
    emailContacts.map(c => sendSOSEmail(c, userName, lat, lng, incidentType))
  );
  results.filter(r => r.status === 'rejected').forEach(f => console.error('[EmailJS] Failed:', f.reason));
  return results.filter(r => r.status === 'fulfilled').length;
};
