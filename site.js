document.querySelector('.menu')?.addEventListener('click',e=>{const open=e.currentTarget.getAttribute('aria-expanded')!=='true';e.currentTarget.setAttribute('aria-expanded',String(open));document.querySelector('#navigation').classList.toggle('open',open)});
document.querySelectorAll('nav a').forEach(a=>{if(!new URL(a.href).hash&&new URL(a.href).pathname===location.pathname)a.setAttribute('aria-current','page')});
// A Google-hosted form writes directly to the dedicated CRM tabs after activation.
const intakeConfig=window.LEADCO_CONFIG||{};
if(intakeConfig.intakeUrl&&document.querySelector('#partner-form')){
 const url=new URL(intakeConfig.intakeUrl,location.origin);
 const allowed=url.origin==='https://script.google.com'&&/^\/macros\/s\/[^/]+\/exec$/.test(url.pathname)||intakeConfig.mode==='local'&&url.origin===location.origin;
 if(allowed){
  const params=new URLSearchParams(location.search);
  for(const k of ['role','utm_source','utm_medium','utm_campaign','utm_content','utm_term','gclid','msclkid'])if(params.has(k))url.searchParams.set(k,params.get(k).slice(0,200));
  const frame=document.createElement('iframe');frame.src=url.href;frame.title='LeadCo business service inquiry';frame.style='width:100%;height:1700px;border:1px solid #dce3eb;border-radius:12px;background:white';
  document.querySelector('#partner-form').replaceWith(frame);
 }
}
// Without an approved live destination, keep the existing local draft preparation.
const form=document.querySelector('#partner-form');
if(form){
 const params=new URLSearchParams(location.search);const initialRole=params.get('role');
 if(['buyer','client'].includes(initialRole))form.elements.role.value=initialRole;
 const emailMode=intakeConfig.mode==='email';
 if(emailMode){
  form.querySelector('button[type=submit]').textContent='Review inquiry';
  form.querySelector('.notice').textContent='Review your details, then open an email to our team. Your request is sent only when you send that email.';
  document.querySelector('#form-result h3').textContent='Your inquiry is ready';
  document.querySelector('#form-result p').textContent='Open the prepared email, check its contents, and send it to atlas@nexhavenos.com. Nothing has been sent yet.';
  const emailLink=document.createElement('a');emailLink.id='email-inquiry';emailLink.className='button';emailLink.textContent='Open email to LeadCo';
  document.querySelector('#download-inquiry').before(emailLink);
 }
 let inquiry=null;let started=false;
 const emit=(name)=>{const event={event:name,vertical:form.elements.vertical.value,partner_role:form.elements.role.value,mode:'review'};window.dataLayer=window.dataLayer||[];window.dataLayer.push(event);window.dispatchEvent(new CustomEvent('leadco:analytics',{detail:event}));};
 form.addEventListener('input',()=>{if(!started){started=true;emit('partner_intake_started')}document.querySelector('#form-result').hidden=true;inquiry=null;});
 form.addEventListener('submit',e=>{e.preventDefault();if(!form.reportValidity())return;
  const details=Object.fromEntries(new FormData(form));delete details.business_only;
  const attribution={};for(const k of ['utm_source','utm_medium','utm_campaign','utm_content','utm_term','gclid','msclkid']){if(params.has(k))attribution[k]=params.get(k).slice(0,300)}
  inquiry={inquiry_id:crypto.randomUUID(),created_at:new Date().toISOString(),status:'Review draft — not submitted',details,attribution,source_page:location.pathname,notice_version:'leadco-partner-preview-2026-09-17',business_information_only:true};
  document.querySelector('#inquiry-summary').textContent=Object.entries(details).map(([k,v])=>`${k.replaceAll('_',' ')}: ${v||'Not provided'}`).join('\n');
  if(emailMode){
   const subject=details.role==='client'?'LeadCo support and billing inquiry':'LeadCo lead inquiry';
   const body=document.querySelector('#inquiry-summary').textContent+'\n\nReference: '+inquiry.inquiry_id;
   document.querySelector('#email-inquiry').href='mailto:atlas@nexhavenos.com?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);
  }
  document.querySelector('#form-result').hidden=false;document.querySelector('#form-result').focus();emit('partner_inquiry_prepared');
 });
 document.querySelector('#download-inquiry').addEventListener('click',()=>{if(!inquiry)return;const blob=new Blob([JSON.stringify(inquiry,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='LeadCo-partner-inquiry.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
}
document.querySelector('#footer').innerHTML=`<div class="wrap"><div class="footer-top"><div><a class="brand" href="index.html"><span class="brand-mark" aria-hidden="true">L</span>LeadCo</a><p class="fine" style="margin-top:14px">Leads. Customer support. Revenue follow-up.</p></div><div class="footer-links"><a href="lending.html">Payday &amp; mortgage leads</a><a href="call-center.html">Customer support</a><a href="medical-billing.html">Medical billing &amp; recovery</a><a href="quality.html">Quality</a><a href="about.html">About LeadCo</a><a href="contact.html">Contact</a><a href="leadco-privacy.html">Business inquiry privacy</a></div></div><p class="footer-note">© ${new Date().getFullYear()} NexHaven Systems LLC dba LeadCo. Business contact: <a href="mailto:atlas@nexhavenos.com">atlas@nexhavenos.com</a> · <a href="tel:+17275134515">(727) 513-4515</a>.<br>Correspondence: 7901 4th St N, Ste 300, St. Petersburg, FL 33702.<br> LeadCo provides leads and business support services. LeadCo is not a lender and does not make financing decisions. Lead availability, service scope and commercial terms are confirmed before delivery.</p></div>`;
// Carry campaign attribution across local navigation without storing it.
const campaignParams=new URLSearchParams(location.search);
document.querySelectorAll('a[href]').forEach(a=>{const url=new URL(a.href);if(url.origin!==location.origin||!url.pathname.endsWith('.html'))return;for(const key of ['utm_source','utm_medium','utm_campaign','utm_content','utm_term','gclid','msclkid']){if(campaignParams.has(key))url.searchParams.set(key,campaignParams.get(key).slice(0,300));}a.href=url.href;});

// Keep each inquiry aligned to the current lead and service offer.
function configureServiceFields(form) {
  if (!form) return;
  const role = form.elements.role, vertical = form.elements.vertical, product = form.elements.product;
  const productsByArea = {
    'Payday lending': ['Payday leads'],
    'Mortgage lending': ['Mortgage leads'],
    'Payday & mortgage': ['Payday & mortgage leads'],
    'Call center': ['Phone support','Email support','Live chat support','Customer support','Multiple support services','Invoice follow-up','Statement follow-up','Quote follow-up'],
    'Medical billing & recovery': ['Insurance revenue recovery','Medical billing','Insurance recovery & billing']
  };
  function sync() {
    const areas = role.value === 'client' ? ['Call center','Medical billing & recovery'] : role.value === 'buyer' ? ['Payday lending','Mortgage lending','Payday & mortgage'] : [];
    for (const option of vertical.options) option.hidden = option.disabled = Boolean(option.value) && !areas.includes(option.value);
    if (!areas.includes(vertical.value)) vertical.value = role.value === 'client' ? 'Call center' : '';
    const allowed = productsByArea[vertical.value] || [];
    for (const option of product.options) option.hidden = option.disabled = Boolean(option.value) && !allowed.includes(option.value);
    if (product.selectedOptions[0]?.disabled) product.value = '';
  }
  role.addEventListener('change', sync);
  vertical.addEventListener('change', sync);
  sync();
}
configureServiceFields(document.querySelector('#partner-form'));
