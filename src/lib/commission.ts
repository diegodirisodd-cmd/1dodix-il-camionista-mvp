export type CommissionBreakdown = {
  commission: number;
  vat: number;
  total: number;
};

export function calculateCommission(amount: number): CommissionBreakdown {
  const commission = amount * 0.02;
  const vat = commission * 0.22;
  return {
    commission,
    vat,
    total: commission + vat,
  };
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(value);
}
