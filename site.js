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
  const frame=document.createElement('iframe');frame.src=url.href;frame.title='LeadCo business partnership inquiry';frame.style='width:100%;height:1700px;border:1px solid #dce3eb;border-radius:12px;background:white';
  document.querySelector('#partner-form').replaceWith(frame);
 }
}
// Without an approved live destination, keep the existing local draft preparation.
const form=document.querySelector('#partner-form');
if(form){
 const params=new URLSearchParams(location.search);const initialRole=params.get('role');
 if(['buyer','publisher','client'].includes(initialRole))form.elements.role.value=initialRole;
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
   const subject=details.role==='client'?'LeadCo call center inquiry':'LeadCo partnership inquiry';
   const body=document.querySelector('#inquiry-summary').textContent+'\n\nReference: '+inquiry.inquiry_id;
   document.querySelector('#email-inquiry').href='mailto:atlas@nexhavenos.com?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);
  }
  document.querySelector('#form-result').hidden=false;document.querySelector('#form-result').focus();emit('partner_inquiry_prepared');
 });
 document.querySelector('#download-inquiry').addEventListener('click',()=>{if(!inquiry)return;const blob=new Blob([JSON.stringify(inquiry,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='LeadCo-partner-inquiry.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
}
document.querySelector('#footer').innerHTML=`<div class="wrap"><div class="footer-top"><div><a class="brand" href="index.html"><span class="brand-mark" aria-hidden="true">L</span>LeadCo</a><p class="fine" style="margin-top:14px">Lead generation. Qualification. Distribution.</p></div><div class="footer-links"><a href="buyers.html">For buyers</a><a href="publishers.html">For publishers</a><a href="verticals.html">Verticals</a><a href="lending.html">Consumer lending</a><a href="home-services.html">Home services</a><a href="quality.html">Compliance & quality</a><a href="index.html#call-center">Call Center</a><a href="about.html">About LeadCo</a><a href="contact.html">Contact</a><a href="leadco-privacy.html">Business inquiry privacy</a></div></div><p class="footer-note">© ${new Date().getFullYear()} NexHaven Systems LLC dba LeadCo. Business contact: <a href="mailto:atlas@nexhavenos.com">atlas@nexhavenos.com</a> · <a href="tel:+17275134515">(727) 513-4515</a>.<br>Correspondence: 7901 4th St N, Ste 300, St. Petersburg, FL 33702.<br> LeadCo is a lead supplier and distributor, not a lender. Financing decisions and service availability are determined by the relevant provider. Campaign availability is subject to buyer approval.</p></div>`;
// Carry campaign attribution across local navigation without storing it.
const campaignParams=new URLSearchParams(location.search);
document.querySelectorAll('a[href]').forEach(a=>{const url=new URL(a.href);if(url.origin!==location.origin||!url.pathname.endsWith('.html'))return;for(const key of ['utm_source','utm_medium','utm_campaign','utm_content','utm_term','gclid','msclkid']){if(campaignParams.has(key))url.searchParams.set(key,campaignParams.get(key).slice(0,300));}a.href=url.href;});

// Keep call center requests distinct from lead buying and supply inquiries.
function configureServiceFields(form) {
  if (!form) return;
  const role = form.elements.role, vertical = form.elements.vertical, product = form.elements.product;
  const services = ['Revenue recovery support','Live chat support','Email support','Customer support','Multiple support services'];
  function sync() {
    const client = role.value === 'client';
    for (const option of vertical.options) {
      option.hidden = option.disabled = Boolean(option.value) && (client ? option.value !== 'Call center' : option.value === 'Call center');
    }
    if (client) vertical.value = 'Call center';
    else if (vertical.value === 'Call center') vertical.value = '';
    for (const option of product.options) {
      option.hidden = option.disabled = Boolean(option.value) && (client !== services.includes(option.value));
    }
    if (product.selectedOptions[0]?.disabled) product.value = '';
  }
  role.addEventListener('change', sync);
  sync();
}
configureServiceFields(document.querySelector('#partner-form'));
