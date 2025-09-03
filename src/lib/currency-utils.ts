import { currencies } from "./regional";

export function getFormatterForCurrency(currency: string) {
  const locale = currencies.find((c) => c.value === currency)?.locale;

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  });
}
