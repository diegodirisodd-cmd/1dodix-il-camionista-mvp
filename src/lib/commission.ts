export type CommissionBreakdown = {
  commission: number;
  vat: number;
  total: number;
};

export function calculateCommission(amountCents: number): CommissionBreakdown {
  const commission = Math.round(amountCents * 0.02);
  const vat = Math.round(commission * 0.22);
  return {
    commission,
    vat,
    total: commission + vat,
  };
}

export function formatCurrency(valueCents: number) {
  return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(valueCents / 100);
}
