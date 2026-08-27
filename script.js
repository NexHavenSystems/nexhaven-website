const menu=document.getElementById("menu"),nav=document.getElementById("nav");
if(menu&&nav)menu.addEventListener("click",()=>{const open=nav.classList.toggle("open");menu.setAttribute("aria-expanded",String(open))});
const year=document.getElementById("year");if(year)year.textContent=String(new Date().getFullYear());

const params=new URLSearchParams(location.search);
const attributionKeys=["utm_source","utm_medium","utm_campaign","utm_content","utm_term","gclid","msclkid"];
const attribution=JSON.parse(sessionStorage.getItem("nh_attribution")||"{}");
attributionKeys.forEach(k=>{if(params.get(k))attribution[k]=params.get(k)});
if(!attribution.first_landing_page)attribution.first_landing_page=location.pathname;
attribution.last_landing_page=location.pathname;
if(!attribution.first_referrer)attribution.first_referrer=document.referrer||"direct";
sessionStorage.setItem("nh_attribution",JSON.stringify(attribution));

window.dataLayer=window.dataLayer||[];
const track=(event,detail={})=>window.dataLayer.push({event,...detail});
document.querySelectorAll("[data-event]").forEach(el=>el.addEventListener("click",()=>track(el.dataset.event,{page_path:location.pathname})));

const form=document.getElementById("assessment-form");
if(form){
  const money=new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0});
  const estimate=document.getElementById("recovery-estimate"),status=document.getElementById("form-status");
  const updateEstimate=()=>{
    const ar=Number(form.elements.outstanding_ar.value||0),est=Number(form.elements.stale_estimates_value.value||0);
    const low=ar*.08+est*.03,high=ar*.22+est*.10;
    estimate.innerHTML=low>0?`<strong>${money.format(low)}–${money.format(high)}</strong><p>Illustrative 30-day opportunity range—not a guarantee. A portfolio review validates what is actionable.</p>`:"<strong>Enter portfolio values</strong><p>We’ll show a conservative planning range for the first review.</p>";
  };
  ["outstanding_ar","stale_estimates_value"].forEach(name=>form.elements[name].addEventListener("input",updateEstimate));
  updateEstimate();
  form.addEventListener("submit",event=>{
    event.preventDefault();
    const data=Object.fromEntries(new FormData(form).entries());
    const payload={...data,...attribution,page_path:location.pathname,submitted_at:new Date().toISOString(),landing_version:"nh-home-services-v1"};
    track("generate_lead",{vertical:data.vertical,estimated_ar:Number(data.outstanding_ar||0),source:attribution.utm_source||"direct"});
    sessionStorage.setItem("nh_last_assessment",JSON.stringify(payload));
    const endpoint=(window.NEXHAVEN_CONFIG&&window.NEXHAVEN_CONFIG.formEndpoint)||"";
    if(endpoint){
      fetch(endpoint,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)})
        .then(r=>{if(!r.ok)throw new Error("Submission failed");status.textContent="Assessment received. We’ll follow up within one business day.";form.reset();updateEstimate()})
        .catch(()=>openEmail(payload));
    }else openEmail(payload);
  });
  function openEmail(payload){
    const lines=[
      "Revenue Leakage Assessment","",
      `Name: ${payload.name}`,`Company: ${payload.company}`,`Email: ${payload.email}`,`Phone: ${payload.phone||""}`,
      `Vertical: ${payload.vertical}`,`Annual revenue: ${payload.annual_revenue||""}`,`Primary system: ${payload.system||""}`,`Jobs per month: ${payload.monthly_jobs||""}`,
      `Outstanding A/R: $${payload.outstanding_ar||0}`,`Stale estimates: $${payload.stale_estimates_value||0}`,
      `Current process: ${payload.follow_up_process||""}`,`Main bottleneck: ${payload.bottleneck||""}`,
      "",`Attribution: ${JSON.stringify(attribution)}`
    ];
    status.textContent="Your email app is opening with the assessment. Send it to complete your request.";
    location.href=`mailto:info@nexhavenos.com?subject=${encodeURIComponent("Revenue Leakage Assessment — "+payload.company)}&body=${encodeURIComponent(lines.join("\n"))}`;
  }
}
