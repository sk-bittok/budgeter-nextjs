"use server";

import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  type CreateTransactionType,
  createTransactionSchema,
} from "@/schemas/transactions";

export async function deleteTransaction(transactionId: string) {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const transaction = await prisma.transaction.findUnique({
    where: {
      id: transactionId,
      userId: user.id,
    },
  });

  if (!transaction) {
    throw new Error("Bad request");
  }

  await prisma.$transaction([
    // Delete transaction from database
    prisma.transaction.delete({
      where: {
        id: transaction.id,
        userId: user.id,
      },
    }),
    // update month and anual histories
    prisma.monthHistory.update({
      where: {
        day_month_year_userId: {
          userId: user.id,
          month: transaction.date.getUTCMonth(),
          year: transaction.date.getUTCFullYear(),
          day: transaction.date.getUTCDate(),
        },
      },
      data: {
        ...(transaction.type === "expense"
          ? { expense: { decrement: transaction.amount } }
          : { income: { decrement: transaction.amount } }),
      },
    }),

    prisma.yearHistory.update({
      where: {
        month_year_userId: {
          userId: user.id,
          month: transaction.date.getUTCMonth(),
          year: transaction.date.getUTCFullYear(),
        },
      },
      data: {
        ...(transaction.type === "expense"
          ? { expense: { decrement: transaction.amount } }
          : { income: { decrement: transaction.amount } }),
      },
    }),
  ]);

  return transaction;
}

export async function createTransaction(form: CreateTransactionType) {
  const parsedBody = createTransactionSchema.safeParse(form);

  if (!parsedBody.success) {
    throw new Error(parsedBody.error.message);
  }

  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { description, date, amount, category, type } = parsedBody.data;

  const categoryRow = await prisma.category.findFirst({
    where: {
      userId: user.id,
      name: category,
    },
  });

  if (!categoryRow) {
    throw new Error(`Category ${category} not found!`);
  }

  // $transaction is not the table transaction - which stores incomes and expenses.

  await prisma.$transaction([
    // Create user transaction table
    prisma.transaction.create({
      data: {
        userId: user.id,
        amount,
        category: categoryRow.name,
        description: description || "",
        type,
        date,
        categoryIcon: categoryRow.icon,
      },
    }),

    // Update aggregate records
    // 1. monthly-aggregate
    prisma.monthHistory.upsert({
      where: {
        day_month_year_userId: {
          userId: user.id,
          day: date.getUTCDate(),
          month: date.getUTCMonth(),
          year: date.getUTCFullYear(),
        },
      },
      create: {
        userId: user.id,
        day: date.getUTCDate(),
        month: date.getUTCMonth(),
        year: date.getUTCFullYear(),
        expense: type === "expense" ? amount : 0,
        income: type === "income" ? amount : 0,
      },
      // Update monthly aggregate
      update: {
        expense: {
          increment: type === "expense" ? amount : 0,
        },
        income: {
          increment: type === "income" ? amount : 0,
        },
      },
    }),

    // 2. yearly-aggregate
    prisma.yearHistory.upsert({
      where: {
        month_year_userId: {
          userId: user.id,
          month: date.getUTCMonth(),
          year: date.getUTCFullYear(),
        },
      },
      create: {
        userId: user.id,
        month: date.getUTCMonth(),
        year: date.getUTCFullYear(),
        expense: type === "expense" ? amount : 0,
        income: type === "income" ? amount : 0,
      },
      // Update year aggregate
      update: {
        expense: {
          increment: type === "expense" ? amount : 0,
        },
        income: {
          increment: type === "income" ? amount : 0,
        },
      },
    }),
  ]);
}
