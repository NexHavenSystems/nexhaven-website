const menu = document.getElementById("menu");
const nav = document.getElementById("nav");
if (menu && nav) {
  menu.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    menu.setAttribute("aria-expanded", String(open));
  });
}

const year = document.getElementById("year");
if (year) year.textContent = String(new Date().getFullYear());

const range = document.getElementById("collections");
const collectionsLabel = document.getElementById("collections-label");
const feeLabel = document.getElementById("fee-label");
const phoneSupport = document.getElementById("phone-support");
const rateLabel = document.getElementById("rate-label");
const comparisonLabel = document.getElementById("comparison-label");
if (range && collectionsLabel && feeLabel && phoneSupport && rateLabel && comparisonLabel) {
  const money = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
  const updatePricing = () => {
    const collections = Number(range.value);
    const rate = phoneSupport.checked ? 0.065 : 0.05;
    const monthlyFee = collections * rate;
    collectionsLabel.textContent = `${money.format(collections)} collected`;
    feeLabel.textContent = `${money.format(monthlyFee)}/mo`;
    const hireBenchmark = 5580;
    const difference = Math.abs(monthlyFee - hireBenchmark);
    comparisonLabel.textContent = monthlyFee >= hireBenchmark
      ? `At this collections level, NexHaven is about ${money.format(difference)}/month more than this single-hire benchmark.`
      : `At this collections level, NexHaven is about ${money.format(difference)}/month below this single-hire benchmark.`;
    rateLabel.textContent = phoneSupport.checked
      ? "Base package + phone support · 6.5%"
      : "Base package · 5%";
  };
  range.addEventListener("input", updatePricing);
  phoneSupport.addEventListener("change", updatePricing);
  updatePricing();
}
