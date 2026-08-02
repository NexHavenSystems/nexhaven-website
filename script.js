const menu = document.getElementById("menu");
const nav = document.getElementById("nav");
if (menu && nav) {
  menu.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    menu.setAttribute("aria-expanded", String(open));
  });
}

const compareCollections = document.getElementById("compare-collections");
const compareClaims = document.getElementById("compare-claims");
const compareCollectionsLabel = document.getElementById("compare-collections-label");
const compareClaimsLabel = document.getElementById("compare-claims-label");
const percentagePrice = document.getElementById("percentage-price");
const claimPriceRange = document.getElementById("claim-price-range");
const breakEvenCopy = document.getElementById("break-even-copy");
if (compareCollections && compareClaims && compareCollectionsLabel && compareClaimsLabel && percentagePrice && claimPriceRange && breakEvenCopy) {
  const comparisonMoney = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
  const updateComparison = () => {
    const collections = Number(compareCollections.value);
    const claims = Number(compareClaims.value);
    const percentage = collections * 0.05;
    const low = claims * 6;
    const high = claims * 8;
    const average = collections / claims;
    compareCollectionsLabel.textContent = comparisonMoney.format(collections);
    compareClaimsLabel.textContent = `${claims.toLocaleString()} claims`;
    percentagePrice.textContent = `${comparisonMoney.format(percentage)}/mo`;
    claimPriceRange.textContent = `${comparisonMoney.format(low)}–${comparisonMoney.format(high)}/mo`;
    const relationship = percentage < low
      ? "The 5% package is lower at these inputs and includes email and scheduling support."
      : percentage > high
        ? "The per-claim estimate is lower at these inputs, but it covers a narrower, contract-defined workflow."
        : "The estimates overlap at these inputs; the deciding factor is the support scope you need.";
    breakEvenCopy.textContent = `Average collection is ${comparisonMoney.format(average)} per claim. ${relationship}`;
  };
  compareCollections.addEventListener("input", updateComparison);
  compareClaims.addEventListener("input", updateComparison);
  updateComparison();
}

const year = document.getElementById("year");
if (year) year.textContent = String(new Date().getFullYear());

const range = document.getElementById("collections");
const collectionsLabel = document.getElementById("collections-label");
const feeLabel = document.getElementById("fee-label");
const foundingRate = document.getElementById("founding-rate");
const rateLabel = document.getElementById("rate-label");
const comparisonLabel = document.getElementById("comparison-label");
if (range && collectionsLabel && feeLabel && foundingRate && rateLabel && comparisonLabel) {
  const money = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
  const updatePricing = () => {
    const collections = Number(range.value);
    const rate = foundingRate.checked ? 0.04 : 0.05;
    const monthlyFee = Math.max(2500, collections * rate);
    collectionsLabel.textContent = `${money.format(collections)} managed`;
    feeLabel.textContent = `${money.format(monthlyFee)}/mo`;
    const hireBenchmark = 5580;
    const difference = Math.abs(monthlyFee - hireBenchmark);
    comparisonLabel.textContent = monthlyFee >= hireBenchmark
      ? `At this collections level, NexHaven is about ${money.format(difference)}/month more than this single-hire benchmark.`
      : `At this collections level, NexHaven is about ${money.format(difference)}/month below this single-hire benchmark.`;
    rateLabel.textContent = foundingRate.checked
      ? "Founding Practice Program · 4% for 90 days · $2,500 minimum"
      : "Standard package · 5% · $2,500 minimum";
  };
  range.addEventListener("input", updatePricing);
  foundingRate.addEventListener("change", updatePricing);
  updatePricing();
}
