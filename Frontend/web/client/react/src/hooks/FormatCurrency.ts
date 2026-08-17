
// `currencyDisplay: 'narrowSymbol'` is required here — without it, Intl
// falls back to printing the ISO code (e.g. "NGN 1,234.50") instead of the
// actual symbol ("₦1,234.50") for currencies the 'en-US' locale doesn't
// have a symbol mapping for by default.
const formatCurrency = (
  amount: number, 
  currencyCode = 'USD', 
  locale = 'en-US',
  maximumFractionDigits = 2
) => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    currencyDisplay: 'narrowSymbol',
    minimumFractionDigits: 2,
    maximumFractionDigits: maximumFractionDigits,
  }).format(amount);
};

export default formatCurrency;

// Example call:
// <ProductPrice price={129.99} currency="USD" />
// Renders: Price: $129.99 (for 'en-US' locale)
