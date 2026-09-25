const menu = document.getElementById('menu'), nav = document.getElementById('nav');
function closeMenu() { nav?.classList.remove('open'); menu?.setAttribute('aria-expanded', 'false'); menu?.setAttribute('aria-label', 'Open navigation menu'); }
if (menu && nav) {
  menu.addEventListener('click', () => { const open = nav.classList.toggle('open'); menu.setAttribute('aria-expanded', String(open)); menu.setAttribute('aria-label', `${open ? 'Close' : 'Open'} navigation menu`); });
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && nav.classList.contains('open')) { closeMenu(); menu.focus(); } });
  document.addEventListener('click', event => { if (!nav.contains(event.target) && !menu.contains(event.target)) closeMenu(); });
}
const year = document.getElementById('year'); if (year) year.textContent = String(new Date().getFullYear());
const params = new URLSearchParams(location.search);
const attributionKeys = ['utm_source','utm_medium','utm_campaign','utm_content','utm_term','gclid','msclkid'];
let attribution = {};
try {
  const saved = JSON.parse(sessionStorage.getItem('nh_attribution') || '{}');
  if (saved && typeof saved === 'object' && !Array.isArray(saved)) attribution = saved;
  sessionStorage.removeItem('nh_last_assessment');
} catch { /* Forms work when storage is unavailable. */ }
attributionKeys.forEach(key => { if (params.get(key)) attribution[key] = params.get(key).slice(0,240); });
if (!attribution.first_landing_page) attribution.first_landing_page = location.pathname;
attribution.last_landing_page = location.pathname;
if (!attribution.first_referrer) attribution.first_referrer = document.referrer || 'direct';
try { sessionStorage.setItem('nh_attribution', JSON.stringify(attribution)); } catch { /* Optional attribution. */ }
window.dataLayer = window.dataLayer || [];
const track = (event, detail = {}) => window.dataLayer.push({event,...detail});
document.querySelectorAll('[data-event]').forEach(el => el.addEventListener('click', () => track(el.dataset.event,{page_path:location.pathname})));
const form = document.getElementById('assessment-form') || document.getElementById('vacation-form');
if (form) {
  const vacation = form.id === 'vacation-form', status = document.getElementById('form-status');
  const submit = form.querySelector('[type="submit"]'), submitLabel = submit.textContent;
  const fallback = document.getElementById('email-fallback'), fallbackText = document.getElementById('fallback-text');
  let submitting = false;
  const field = name => form.elements.namedItem(name);
  function updateEstimate() {
    if (vacation) return;
    const money = new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0});
    const ar = Math.max(0,Number(field('outstanding_ar').value)||0), estimates = Math.max(0,Number(field('stale_estimates_value').value)||0);
    const low = ar*.08+estimates*.03, high = ar*.22+estimates*.10;
    document.getElementById('recovery-estimate').innerHTML = low > 0
      ? `<strong>${money.format(low)}–${money.format(high)}</strong><p>Illustrative planning scenario: 8–22% of A/R plus 3–10% of stale estimates. These assumptions are not historical results or a guarantee. A portfolio review determines what is actionable.</p>`
      : '<strong>Enter portfolio values</strong><p>See an illustrative planning range for the first review, not a promise of recovery.</p>';
  }
  if (vacation) { if (params.get('interest') === 'optimization') field('interest').value = 'optimization'; }
  else {
    if (['hvac','roofing','plumbing','other'].includes(params.get('vertical'))) field('vertical').value = params.get('vertical');
    ['outstanding_ar','stale_estimates_value'].forEach(name => field(name).addEventListener('input',updateEstimate)); updateEstimate();
  }
  function requestText(payload) {
    const lines = [vacation ? 'Vacation Rental Profit Audit Request ($497–$997; quote requested)' : 'Home Services Revenue Leakage Assessment','',`Name: ${payload.name}`,`Company / property: ${payload.company}`,`Email: ${payload.email}`,`Phone: ${payload.phone||'Not provided'}`,`Service / trade: ${payload.vertical}`];
    if (vacation) lines.push('',payload.bottleneck);
    else lines.push(`Annual revenue: ${payload.annual_revenue||'Not provided'}`,`Primary system: ${payload.system||'Not provided'}`,`Jobs per month: ${payload.monthly_jobs||'Not provided'}`,`Outstanding A/R: $${payload.outstanding_ar||0}`,`Stale estimates: $${payload.stale_estimates_value||0}`,`Current process: ${payload.follow_up_process||'Not provided'}`,`Bottleneck: ${payload.bottleneck||'Not provided'}`);
    lines.push('',`Source page: ${payload.page_path}`,`Campaign: ${payload.utm_campaign||'direct'}`); return lines.join('\n');
  }
  function showFallback(payload) {
    const text = requestText(payload), subject = `${vacation ? 'Vacation Rental Profit Audit Request' : 'Revenue Leakage Assessment'} — ${payload.company}`;
    document.getElementById('fallback-link').href = `mailto:info@nexhavenos.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
    fallbackText.value = text; fallback.hidden = false;
    status.textContent = 'Delivery could not be confirmed. Your details are still here; use the email option below.';
    track('lead_delivery_unconfirmed',{service:vacation?'vacation_rental':'home_services'});
  }
  document.getElementById('copy-request')?.addEventListener('click',async () => {
    try { await navigator.clipboard.writeText(fallbackText.value); status.textContent = 'Request copied. Paste it into an email to info@nexhavenos.com and send to complete your request.'; }
    catch { fallbackText.focus(); fallbackText.select(); status.textContent = 'Select and copy the request below, then email it to info@nexhavenos.com.'; }
  });
  form.addEventListener('submit',async event => {
    event.preventDefault(); if (submitting || !form.reportValidity()) return;
    const data = Object.fromEntries(new FormData(form).entries());
    for (const key of ['name','company','email',...(vacation?['market']:[])]) {
      if (!String(data[key]||'').trim()) { status.textContent = 'Please complete all required fields.'; field(key).focus(); return; }
    }
    // Existing bridge allowlists fields; rental details fit its 1,200-character notes field.
    const rentalDetails = vacation ? ['SERVICE: Vacation Rental Profit Audit ($497–$997; confirm quote before payment)',`Public listing: ${data.listing_url||'Not provided'}`,`Market: ${data.market}`,`Properties: ${data.property_count}`,`Interest: ${data.interest === 'optimization' ? 'Audit + ongoing revenue optimization' : 'Profit Audit'}`,`Goals: ${data.goals||'Not provided'}`].join('\n') : data.bottleneck;
    const payload = {...data,...attribution,bottleneck:rentalDetails,page_path:location.pathname,submitted_at:new Date().toISOString(),landing_version:'nh-two-offers-v2'};
    submitting = true; submit.disabled = true; submit.textContent = 'Sending…'; form.setAttribute('aria-busy','true'); status.textContent = 'Sending your request…'; fallback.hidden = true;
    track('lead_submit_attempt',{service:vacation?'vacation_rental':'home_services'});
    const controller = new AbortController(), timeout = setTimeout(() => controller.abort(),12000);
    try {
      const endpoint = window.NEXHAVEN_CONFIG?.formEndpoint; if (!endpoint) throw new Error('No delivery endpoint');
      const response = await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),signal:controller.signal});
      const result = await response.json(); if (!response.ok || result.received !== true) throw new Error('Delivery not acknowledged');
      status.textContent = vacation ? 'Request received. We’ll contact you to confirm the audit scope, fee, and timing. No payment has been taken.' : 'Assessment received. We’ll contact you about the review and next steps.';
      track('generate_lead',{service:vacation?'vacation_rental':'home_services',vertical:data.vertical,source:attribution.utm_source||'direct'});
      form.reset(); fallbackText.value = ''; updateEstimate();
    } catch { showFallback(payload); }
    finally { clearTimeout(timeout); submitting = false; submit.disabled = false; submit.textContent = submitLabel; form.removeAttribute('aria-busy'); }
  });
}
