"use client";

const STRIPE_PAYMENT_LINK = "https://buy.stripe.com/dRm5kv6bn2MqdGK984c7u01";

export function PaywallActions() {
  const handleRedirect = () => {
    window.location.href = STRIPE_PAYMENT_LINK;
  };

  return (
    <button
      type="button"
      onClick={handleRedirect}
      className="btn-primary w-full justify-center py-3"
    >
      Attiva abbonamento
    </button>
  );
}
