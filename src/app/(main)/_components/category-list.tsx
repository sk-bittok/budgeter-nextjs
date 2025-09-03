import CreateCategoryModal from "@/components/create-category";
import SkeletonWrapper from "@/components/skeleton-wrapper";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TransactionType } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { PlusSquare, TrendingDown, TrendingUp } from "lucide-react";
import CategoryCard from "../settings/_components/category-card";
import { cn } from "@/lib/utils";
import { Category } from "@/generated/prisma";

export default function CategoryList({ type }: { type: TransactionType }) {
  const query = useQuery({
    queryFn: () =>
      fetch(`/api/categories?type=${type}`).then((response) => response.json()),
    queryKey: ["categories", type],
  });

  const isDataAvailable = query.data && query.data.length > 0;

  return (
    <SkeletonWrapper isLoading={query.isLoading}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {type === "expense" ? (
                <TrendingDown className="size-12 items-center rounded-lg bg-rose-400/10 text-rose-500 p-2" />
              ) : (
                <TrendingUp className="size-12 items-center rounded-lg bg-emerald-400/10 text-emerald-500 p-2" />
              )}
              <div>
                <h3 className="capitalize">{`${type} categories`}</h3>
                <div className="text-sm text-muted-foreground">
                  Sorted by name
                </div>
              </div>
            </div>
            <CreateCategoryModal
              type={type}
              onSuccess={() => query.refetch()}
              trigger={
                <Button className="text-sm gap-2" variant={"outline"}>
                  <PlusSquare className="size-5" />
                  Create Category
                </Button>
              }
            />
          </CardTitle>
        </CardHeader>
        <Separator />
        {isDataAvailable ? (
          <div className="grid grid-flow-row gap-2 p-2 sm:grid-flow-row sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {query.data.map((category: Category) => (
              <CategoryCard category={category} key={category.name} />
            ))}
          </div>
        ) : (
          <div className="flex h-40 w-full items-center justify-center">
            <p>
              No&nbsp;
              <span
                className={cn(
                  "m-1",
                  type === "income" ? "text-emerald-500" : "text-rose-500",
                )}
              >
                {type}&nbsp;
              </span>
              categories yet.
            </p>
            <p className="text-sm text-muted-foreground">
              Add a category to get started.
            </p>
          </div>
        )}
      </Card>
    </SkeletonWrapper>
  );
}
