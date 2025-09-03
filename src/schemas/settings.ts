import { allTimezones } from "react-timezone-select";
import { z } from "zod";
import { currencies } from "@/lib/regional";

export const updateUserSettingsSchema = z.object({
  currency: z.custom((value) => {
    const found = currencies.some((currency) => currency.value === value);
    if (!found) {
      throw new Error(`Invalid currency ${value}`);
    }

    return value;
  }),
  timezone: z.custom((value) => {
    const found = Object.entries(allTimezones).some(
      ([key, value]) => key === value,
    );
    if (!found) {
      throw new Error(`Invalid timezone ${value}`);
    }
  }),
});

export type UpdateUserSettingsType = z.infer<typeof updateUserSettingsSchema>;

export const updateUserCurrencySchema = z.object({
  currency: z.custom((value) => {
    const found = currencies.some((currency) => currency.value === value);
    if (!found) {
      throw new Error(`Invalid currency ${value}`);
    }

    return value;
  }),
});

export type UpdateUserCurrencyType = z.infer<typeof updateUserCurrencySchema>;

export const updateUserTimezoneSchema = z.object({
  timezone: z.custom((data) => {
    const found = Object.entries(allTimezones).some(
      ([key, value]) => key === data,
    );
    if (!found) {
      throw new Error(`Invalid time zone ${data}`);
    }
  }),
});

export type UpdateUserTimezoneType = z.infer<typeof updateUserTimezoneSchema>;
