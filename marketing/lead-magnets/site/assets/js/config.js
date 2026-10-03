/* ============================================================
   AHK Akademi lead-magnet site — the ONLY file you need to edit
   to connect forms and contact channels. See README.md.
   ============================================================ */
window.AHK_CONFIG = {
  // Where lead forms POST their JSON. Leave "" to run in offline/demo mode
  // (leads are saved in the visitor's browser localStorage under "ahk_leads"
  // and the result is still shown). Examples:
  //   "https://ahkademy.com/api/leads"          (your own platform, see README)
  //   "https://formspree.io/f/XXXXXXXX"          (Formspree)
  //   "https://script.google.com/macros/s/.../exec" (Google Sheets Apps Script)
  leadEndpoint: "",

  // Optional extra headers for the endpoint (e.g. an API key). Keep empty for public form services.
  leadHeaders: {},

  // WhatsApp number in international format WITHOUT "+" or spaces, e.g. "905xxxxxxxxx".
  // Leave "" to hide the WhatsApp buttons.
  whatsappNumber: "",

  // Links used in buttons and the footer.
  mainSite: "https://ahkademy.com",
  instagram: "https://www.instagram.com/ahkacademy",

  // Where "book a free trial lesson" buttons go. Can be a WhatsApp link, a Calendly page, or a page on ahkademy.com.
  trialUrl: "https://ahkademy.com",

  // Optional: Google Analytics 4 measurement id, e.g. "G-XXXXXXX". Loaded only after it is set (and only if you add it to the privacy notice).
  ga4Id: ""
};
