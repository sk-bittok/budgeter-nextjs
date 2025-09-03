import { useQuery } from "@tanstack/react-query";
import { DollarSignIcon, TrendingUp, TrendingDown, Equal } from "lucide-react";
import { type ReactNode, useCallback, useMemo } from "react";
import Countup from "react-countup";
import type { GetBalanceStatsType } from "@/app/api/stats/balance/route";
import SkeletonWrapper from "@/components/skeleton-wrapper";
import { Card } from "@/components/ui/card";
import type { UserSettings } from "@/generated/prisma";
import { getFormatterForCurrency } from "@/lib/currency-utils";
import { dateToISOString } from "@/lib/date-utils";

interface Props {
  userSettings: UserSettings;
  from: Date;
  to: Date;
}

export default function TransactionStats({ userSettings, from, to }: Props) {
  const { data: statsData, isFetching } = useQuery<GetBalanceStatsType>({
    queryKey: ["overview", "stats", from, to],
    queryFn: () =>
      fetch(
        `/api/stats/balance?from=${dateToISOString(from)}&to=${dateToISOString(to)}`,
      ).then((response) => response.json()),
  });

  const formatter = useMemo(() => {
    return getFormatterForCurrency(userSettings.currency);
  }, [userSettings.currency]);

  const income = statsData?.income || 0;
  const expense = statsData?.expense || 0;

  const balance = income - expense;

  return (
    <div className="relative flex w-full flex-wrap gap-2 md:flex-nowrap">
      <SkeletonWrapper isLoading={isFetching}>
        <StatCard
          formatter={formatter}
          value={income}
          title="Income"
          icon={
            <TrendingUp className="h-12 w-12 rounded-lg p-2 bg-emerald-400/10 text-emerald-600" />
          }
        />
      </SkeletonWrapper>

      <SkeletonWrapper isLoading={isFetching}>
        <StatCard
          formatter={formatter}
          value={expense}
          title="Expense"
          icon={
            <TrendingDown className="h-12 w-12 rounded-lg p-2 bg-rose-400/10 text-rose-600" />
          }
        />
      </SkeletonWrapper>

      <SkeletonWrapper isLoading={isFetching}>
        <StatCard
          formatter={formatter}
          value={balance}
          title="Balance"
          icon={
            <Equal className="h-12 w-12 rounded-lg p-2 bg-indigo-400/10 text-indigo-600" />
          }
        />
      </SkeletonWrapper>
    </div>
  );
}

function StatCard({
  formatter,
  value,
  icon,
  title,
}: {
  formatter: Intl.NumberFormat;
  value: number;
  title: string;
  icon: ReactNode;
}) {
  const formattingFn = useCallback(
    (val: number) => {
      return formatter.format(val);
    },
    [formatter],
  );

  return (
    <Card className="w-full">
      <div className="flex items-center py-4 gap-2 px-4">
        {icon}
        <div className="flex items-start gap-0 flex-col">
          <p className="text-muted-foreground">{title}</p>
          <Countup
            preserveValue
            redraw={false}
            end={value}
            decimal="2"
            formattingFn={formattingFn}
            className="text-2xl"
          />
        </div>
      </div>
    </Card>
  );
}
