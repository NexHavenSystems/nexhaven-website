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
if (range && collectionsLabel && feeLabel) {
  const money = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
  const updatePricing = () => {
    const collections = Number(range.value);
    collectionsLabel.textContent = `${money.format(collections)} collected`;
    feeLabel.textContent = `${money.format(collections * 0.05)}/mo`;
  };
  range.addEventListener("input", updatePricing);
  updatePricing();
}
