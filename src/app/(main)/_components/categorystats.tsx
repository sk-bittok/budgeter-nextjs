"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import type { GetCategoriesStatsType } from "@/app/api/stats/categories/route";
import SkeletonWrapper from "@/components/skeleton-wrapper";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { UserSettings } from "@/generated/prisma";
import { getFormatterForCurrency } from "@/lib/currency-utils";
import { dateToISOString } from "@/lib/date-utils";

interface Props {
  userSettings: UserSettings;
  from: Date;
  to: Date;
}

export default function CategoryStats({ userSettings, from, to }: Props) {
  const query = useQuery<GetCategoriesStatsType>({
    queryKey: ["overview", "stats", "categories", from, to],
    queryFn: () =>
      fetch(
        `/api/stats/categories?from=${dateToISOString(from)}&to=${dateToISOString(to)}`,
      ).then((res) => res.json()),
  });

  const formatter = useMemo(() => {
    return getFormatterForCurrency(userSettings.currency);
  }, [userSettings.currency]);

  return (
    <div className="flex flex-wrap w-full gap-2 md:flex-nowrap">
      <SkeletonWrapper isLoading={query.isFetching}>
        <CategoryCard
          formatter={formatter}
          type="income"
          data={query.data || []}
        />
      </SkeletonWrapper>

      <SkeletonWrapper isLoading={query.isFetching}>
        <CategoryCard
          formatter={formatter}
          type="expense"
          data={query.data || []}
        />
      </SkeletonWrapper>
    </div>
  );
}

function CategoryCard({
  data,
  type,
  formatter,
}: {
  data: GetCategoriesStatsType;
  type: "income" | "expense";
  formatter: Intl.NumberFormat;
}) {
  const filteredData = data.filter((element) => element.type === type);

  const total = filteredData.reduce(
    (acc, el) => acc + (el._sum?.amount || 0),
    0,
  );

  return (
    <Card className="max-h-80 w-full col-span-8">
      <CardHeader>
        <CardTitle className="grid grid-flow-row justify-between gap-2 text-muted-foreground md:grid-flow-col">
          {type === "income" ? "Income" : "Expense"} by Category
        </CardTitle>
      </CardHeader>

      <div className="flex items-center justify-between gap-2">
        {filteredData.length === 0 ? (
          <div className="flex h-60 w-full flex-col items-center justify-center">
            No data for selected period
            <p className="text-muted-foreground text-sm">
              Adjust your period or add a new {type}
            </p>
          </div>
        ) : (
          <ScrollArea className="h-60 w-full px-4">
            <div className="flex w-full flex-col gap-4 p-4">
              {filteredData.map((item, index) => {
                const amount = item._sum.amount || 0;
                const percentage = (amount * 100) / (total || amount);

                return (
                  <div
                    key={`idx-${index}-${item.category}`}
                    className="flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex items-center text-gray-400">
                        {item.categoryIcon}&nbsp;{item.category}
                        <span className="ml-2 text-xs text-muted-foreground">
                          ({percentage.toFixed(0)}%)
                        </span>
                      </span>
                      <span className="text-sm text-gray-400">
                        {formatter.format(amount)}
                      </span>
                    </div>
                    <Progress
                      value={percentage}
                      indicator={
                        type === "income"
                          ? "bg-gradient-to-l from-green-500 to-emerald-300 via-green-400"
                          : "bg-gradient-to-l from-red-500 to-rose-300 via-red-400"
                      }
                    />
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </div>
    </Card>
  );
}
