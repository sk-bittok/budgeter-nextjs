"use client";

import { useMutation } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { updateUserCurrency } from "@/app/actions/user-settings";
import type { UserSettings } from "@/generated/prisma";
import { useMediaQuery } from "@/hooks/use-media-query";
import { type Currency, currencies } from "@/lib/regional";
import SkeletonWrapper from "./skeleton-wrapper";
import { Button } from "./ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./ui/drawer";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

export default function CurrencySelector({
  userSettings,
  isLoading,
}: {
  userSettings?: UserSettings;
  isLoading: boolean;
}) {
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(
    null,
  );

  useEffect(() => {
    if (!userSettings) {
      return;
    }

    const userCurrency = currencies.find(
      (currency) => currency.value === userSettings.currency,
    );

    if (userCurrency) {
      setSelectedCurrency(userCurrency);
    }
  }, [userSettings]);

  const updateMutation = useMutation({
    mutationFn: updateUserCurrency,
    mutationKey: ["settings", "currency"],
    onSuccess: (data) => {
      toast.success(`Currency set to ${data.currency} successfully.`, {
        id: "update-currency",
      });
      setSelectedCurrency(
        currencies.find((currency) => currency.value === data.currency) || null,
      );
    },
    onError: (error) => {
      toast.error(`Failed to update currency due to ${error.message}`, {
        id: "update-currency",
      });
    },
  });

  const currencyOption = useCallback(
    (currency: Currency | null) => {
      if (!currency) {
        toast.warning("Select a currency.");

        return;
      }

      toast.loading("Updating user currency...", { id: "update-currency" });

      updateMutation.mutate(currency.value);
    },
    [updateMutation],
  );

  if (isDesktop) {
    return (
      <SkeletonWrapper isLoading={isLoading} fullWidth>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className="w-full justify-start"
              type="button"
              disabled={updateMutation.isPending}
            >
              {selectedCurrency ? (
                <span>{selectedCurrency.label}</span>
              ) : (
                <span>Select a currency</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0" align="start">
            <CurrencyList
              setOpen={setOpen}
              setSelectedCurrency={currencyOption}
            />
          </PopoverContent>
        </Popover>
      </SkeletonWrapper>
    );
  }

  return (
    <SkeletonWrapper isLoading={false} fullWidth>
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button variant="outline" className="w-full justify-start">
            {selectedCurrency ? (
              <span>{selectedCurrency.label}</span>
            ) : (
              <span>+ Set currency</span>
            )}
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Pick a Currency</DrawerTitle>
          </DrawerHeader>

          <div className="mt-4 border-t">
            <CurrencyList
              setOpen={setOpen}
              setSelectedCurrency={currencyOption}
            />
          </div>
        </DrawerContent>
      </Drawer>
    </SkeletonWrapper>
  );
}

export function CurrencyList({
  setOpen,
  setSelectedCurrency,
}: {
  setOpen: (open: boolean) => void;
  setSelectedCurrency: (currency: Currency | null) => void;
}) {
  const onCurrencySelect = (currency: string) => {
    setSelectedCurrency(
      currencies.find((priority) => priority.value === currency) || null,
    );
    setOpen(false);
  };

  return (
    <Command className="w-full">
      <CommandInput placeholder="Filter currency" />
      <CommandList>
        <CommandEmpty>No currency found</CommandEmpty>
        <CommandGroup>
          {currencies.map((currency: Currency) => (
            <CommandItem
              key={currency.value}
              value={currency.value}
              onSelect={onCurrencySelect}
            >
              {currency.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
