/** biome-ignore-all lint/correctness/noUnusedFunctionParameters: <explanation> */
"use client";

import { useMutation } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import {
  allTimezones,
  type ILabelStyle,
  type ITimezone,
  useTimezoneSelect,
} from "react-timezone-select";
import { toast } from "sonner";
import { updateUserTimezone } from "@/app/actions/user-settings";
import type { UserSettings } from "@/generated/prisma";
import { useMediaQuery } from "@/hooks/use-media-query";
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

const getTimezoneDisplay = (timezone: ITimezone) => {
  if (typeof timezone === "string") {
    return timezone;
  }

  return timezone.label || timezone.value;
};

export default function TimezoneSelector({
  userSettings,
  isLoading,
}: {
  userSettings?: UserSettings;
  isLoading: boolean;
}) {
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [selectedTimezone, setSelectedTimezone] = useState<ITimezone | null>(
    Intl.DateTimeFormat().resolvedOptions().timeZone,
  );

  const timezoneMutation = useMutation({
    mutationFn: updateUserTimezone,
    mutationKey: ["settings", "timezone"],
    onSuccess: (data) => {
      toast.success(`Timezone updated successfully to ${data.timezone}`, {
        id: "update-timezone",
      });
      const userTimezone = Object.entries(allTimezones).find(
        ([key, value]) => key === data.timezone,
      );
      setSelectedTimezone(userTimezone?.[0] || null);
    },
    onError: (error) => {
      toast.error(`Failed to update currency due to ${error.message}`, {
        id: "update-timezone",
      });
    },
  });

  useEffect(() => {
    if (!userSettings) {
      return;
    }

    const userTimezone = Object.entries(allTimezones).find(
      ([key, value]) => key === userSettings.timezone,
    );

    if (userTimezone) {
      setSelectedTimezone(userSettings.timezone);
    }
  }, [userSettings]);

  const timezoneOption = useCallback(
    (timezone: ITimezone | null) => {
      if (!timezone) {
        toast.error("Please select a timezone");
        return;
      }

      toast.loading("Updating timezone...", { id: "update-timezone" });
      const timezoneKey =
        typeof timezone === "string" ? timezone : timezone.value;
      timezoneMutation.mutate(timezoneKey);
    },
    [timezoneMutation],
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
            >
              {selectedTimezone ? (
                <span>{getTimezoneDisplay(selectedTimezone)}</span>
              ) : (
                <span>Select a timezone</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[320px] p-0" align="start">
            <TimezoneList
              setOpen={setOpen}
              setSelectedTimezone={timezoneOption}
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
            {selectedTimezone ? (
              <span>{getTimezoneDisplay(selectedTimezone)}</span>
            ) : (
              <span>+ Set timezone</span>
            )}
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Pick a Timezone</DrawerTitle>
          </DrawerHeader>
          <div className="mt-4 border-t">
            <TimezoneList
              setOpen={setOpen}
              setSelectedTimezone={timezoneOption}
            />
          </div>
        </DrawerContent>
      </Drawer>
    </SkeletonWrapper>
  );
}

const labelStyle: ILabelStyle = "original";
const timezones = {
  ...allTimezones,
};

export function TimezoneList({
  setOpen,
  setSelectedTimezone,
}: {
  setOpen: (open: boolean) => void;
  setSelectedTimezone: (timezone: ITimezone | null) => void;
}) {
  const { options, parseTimezone } = useTimezoneSelect({
    labelStyle,
    timezones,
  });

  const onTimezoneSelect = (timezoneKey: string) => {
    const parsedTimezone = parseTimezone(timezoneKey);
    if (parsedTimezone) {
      setSelectedTimezone(parsedTimezone.value);
      setOpen(false);
    }
  };

  return (
    <Command className="w-full">
      <CommandInput placeholder="Filter timezone" />
      <CommandList>
        <CommandEmpty>No timezone found</CommandEmpty>
        <CommandGroup>
          {options.map((option) => (
            <CommandItem
              key={option.value}
              value={option.value}
              onSelect={() => onTimezoneSelect(option.value)}
            >
              {option.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
