import { sendContact, contactMailto } from './contact-delivery.mjs';

const video = document.querySelector('.hero-video');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const applyMotionPreference = () => {
  if (reducedMotion.matches) video.pause();
  else video.play().catch(() => {});
};
applyMotionPreference();
reducedMotion.addEventListener('change', applyMotionPreference);
const menu = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
const closeMenu = () => { navigation.classList.remove('is-open'); menu.setAttribute('aria-expanded', 'false'); menu.setAttribute('aria-label', 'Otvori meni'); };
menu.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  navigation.classList.toggle('is-open', open);
  menu.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-label', open ? 'Zatvori meni' : 'Otvori meni');
});
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') { closeMenu(); menu.focus(); } });

const contactDialog = document.querySelector('#contact-dialog');
const contactForm = document.querySelector('#contact-form');
const contactConfirmation = document.querySelector('.contact-confirmation');
const contactSubmit = contactForm.querySelector('[type="submit"]');
const contactSubmitLabel = contactSubmit.innerHTML;
const contactFeedback = document.querySelector('#contact-feedback');
const contactFields = [...contactForm.querySelectorAll('.contact-fields input, .contact-fields select, .contact-fields textarea')];
const contactMailLinks = [...document.querySelectorAll('[data-contact-mailto]')];
let contactOpener;
let contactSending = false;

const contactValues = () => Object.fromEntries(new FormData(contactForm));
const updateContactMailLinks = () => {
  const href = contactMailto(contactValues());
  contactMailLinks.forEach(link => { link.href = href; });
};
contactForm.addEventListener('input', updateContactMailLinks);
contactForm.addEventListener('change', updateContactMailLinks);
updateContactMailLinks();

const showContactFeedback = (activation = false) => {
  contactFeedback.querySelector('h3').textContent = activation ? 'Kontakt forma čeka aktivaciju.' : 'Slanje nije potvrđeno.';
  contactFeedback.querySelector('p').textContent = activation
    ? 'Prijem poruka kroz formu još nije aktiviran. Vaš tekst je sačuvan u formi — možete ga poslati direktno emailom.'
    : 'Servis za slanje nije odgovorio ili veza nije uspela. Uneti podaci su i dalje u formi. Pokušajte kasnije ili pošaljite poruku direktno emailom.';
  contactFeedback.hidden = false;
  if (contactDialog.open) contactFeedback.focus();
};

const openContact = (opener) => {
  closeMenu();
  contactOpener = opener || document.activeElement;
  if (!contactDialog.open) contactDialog.showModal();
  document.body.classList.add('contact-open');
  (contactConfirmation.hidden ? (contactFeedback.hidden ? document.querySelector('#contact-title') : contactFeedback) : contactConfirmation).focus();
};
document.querySelectorAll('[data-contact-open]').forEach(link => {
  link.addEventListener('click', event => { event.preventDefault(); openContact(link); });
});
contactDialog.querySelectorAll('.contact-close, [data-contact-close]').forEach(button => {
  button.addEventListener('click', () => contactDialog.close());
});
contactDialog.addEventListener('click', event => {
  const rect = contactDialog.getBoundingClientRect();
  if (event.target === contactDialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) contactDialog.close();
});
contactDialog.addEventListener('close', () => {
  document.body.classList.remove('contact-open');
  if (!contactConfirmation.hidden) {
    contactForm.reset();
    contactForm.hidden = false;
    contactConfirmation.hidden = true;
    contactFeedback.hidden = true;
    updateContactMailLinks();
  }
  if (contactOpener instanceof HTMLElement && contactOpener.getClientRects().length) contactOpener.focus();
  else if (menu.getClientRects().length) menu.focus();
});
contactForm.addEventListener('submit', async event => {
  event.preventDefault();
  if (contactSending || contactForm.elements._honey.value.trim()) return;
  const payload = contactValues();
  payload._url = window.location.origin + window.location.pathname + '#kontakt';
  updateContactMailLinks();
  contactFeedback.hidden = true;
  contactSending = true;
  contactForm.setAttribute('aria-busy', 'true');
  contactFields.forEach(field => { field.disabled = true; });
  contactSubmit.disabled = true;
  contactSubmit.textContent = 'Šaljemo…';
  try {
    const result = await sendContact(payload);
    if (result.status === 'activation-required') {
      showContactFeedback(true);
    } else {
      contactForm.hidden = true;
      contactConfirmation.hidden = false;
      if (contactDialog.open) contactConfirmation.focus();
    }
  } catch {
    showContactFeedback();
  } finally {
    contactSending = false;
    contactForm.removeAttribute('aria-busy');
    contactFields.forEach(field => { field.disabled = false; });
    contactSubmit.disabled = false;
    contactSubmit.innerHTML = contactSubmitLabel;
  }
});
window.addEventListener('pageshow', () => {
  if (contactSending) return;
  contactSubmit.disabled = false;
  contactSubmit.innerHTML = contactSubmitLabel;
});
const contactReturnUrl = new URL(window.location.href);
if (contactReturnUrl.searchParams.get('kontakt') === 'primljeno') {
  // A URL parameter alone cannot confirm that a message was accepted.
  contactReturnUrl.searchParams.delete('kontakt');
  history.replaceState(null, '', contactReturnUrl.pathname + contactReturnUrl.search + contactReturnUrl.hash);
}
if (window.location.hash === '#kontakt') openContact();
window.addEventListener('hashchange', () => { if (window.location.hash === '#kontakt') openContact(); });
