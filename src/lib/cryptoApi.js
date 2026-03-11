const COINGECKO_BASE = "https://api.coingecko.com/api/v3";
const ID_MAP = { BTC: "bitcoin", ETH: "ethereum", SOL: "solana", USDT: "tether" };

export async function fetchCryptoPrices() {
  try {
    const ids = Object.values(ID_MAP).join(",");
    const url = `${COINGECKO_BASE}/simple/price?ids=${ids}&vs_currencies=usd,eur,gbp,inr`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch prices");
    const data = await res.json();
    
    // Normalize { bitcoin: { usd: 50000 } } -> { BTC: { USD: 50000 } }
    const normalized = {};
    for (const [symbol, id] of Object.entries(ID_MAP)) {
      if (data[id]) {
        normalized[symbol] = {
          USD: data[id].usd, EUR: data[id].eur, GBP: data[id].gbp, INR: data[id].inr
        };
      }
    }
    return normalized;
  } catch (error) {
    console.error("Crypto Price Fetch Error:", error);
    return null;
  }
}
