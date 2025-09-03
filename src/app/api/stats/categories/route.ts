import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { dateToUTCDate } from "@/lib/date-utils";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  if (!from || !to) {
    throw new Error("Select a period range");
  }

  const stats = await getCategoriesStats(
    user.id,
    dateToUTCDate(new Date(from)),
    dateToUTCDate(new Date(to)),
  );

  return Response.json(stats);
}

async function getCategoriesStats(userId: string, from: Date, to: Date) {
  const stats = await prisma.transaction.groupBy({
    by: ["type", "category", "categoryIcon"],
    where: {
      userId: userId,
      date: {
        gte: from,
        lte: to,
      },
    },
    _sum: {
      amount: true,
    },
    orderBy: {
      _sum: {
        amount: "desc",
      },
    },
  });

  return stats;
}

export type GetCategoriesStatsType = Awaited<
  ReturnType<typeof getCategoriesStats>
>;
