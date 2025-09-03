"use client";

import { differenceInDays, startOfMonth } from "date-fns";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import type { UserSettings } from "@/generated/prisma";
import CategoryStats from "./categorystats";
import TransactionStats from "./statcard";

export const MAX_DATE_RANGE_DAYS = 62;

export default function Overview({
  userSettings,
}: {
  userSettings: UserSettings;
}) {
  const router = useRouter();
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: startOfMonth(new Date()),
    to: new Date(),
  });

  useEffect(() => {
    if (!userSettings) {
      router.push("sign-in");
    }
  }, [userSettings, router]);

  return (
    <>
      <div className="flex flex-wrap container mx-auto justify-between items-center gap-2 py-6">
        <h2 className="text-3xl font-bold">Overview</h2>
        <div className="flex items-center gap-3">
          <DateRangePicker
            initialDateFrom={dateRange.from}
            initialDateTo={dateRange.to}
            showCompare={false}
            onUpdate={(dateRange) => {
              const { from, to } = dateRange.range;

              if (!to || !from) return;

              if (differenceInDays(to, from) > MAX_DATE_RANGE_DAYS) {
                toast.error(
                  `Selected date range is too big. Maximum date range allowed is ${MAX_DATE_RANGE_DAYS} days.`,
                );
                return;
              }

              setDateRange({ from, to });
            }}
          />
        </div>
      </div>
      <div className="space-y-4 container mx-auto">
        <TransactionStats
          userSettings={userSettings}
          from={dateRange.from}
          to={dateRange.to}
        />
        <CategoryStats
          userSettings={userSettings}
          from={dateRange.from}
          to={dateRange.to}
        />
      </div>
    </>
  );
}
