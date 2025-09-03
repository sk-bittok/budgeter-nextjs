"use server";

import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateUserCurrencySchema } from "@/schemas/settings";

export async function getUserSettings(userId?: string) {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  let userSettings = await prisma.userSettings.findUnique({
    where: {
      userId: user.id,
    },
  });

  if (!userSettings) {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    userSettings = await prisma.userSettings.create({
      data: {
        currency: "USD",
        timezone: timezone,
        userId: user.id,
      },
    });
  }

  return userSettings;
}

export async function updateUserSettings(currency: string, timezone: string) {
  const parsedBody = updateUserCurrencySchema.safeParse({ currency });

  if (!parsedBody.success) {
    throw parsedBody.error;
  }

  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const userSettings = await prisma.userSettings.update({
    data: {
      currency,
      timezone,
    },
    where: {
      userId: user.id,
    },
  });

  return userSettings;
}

export async function updateUserCurrency(currency: string) {
  const parsedBody = updateUserCurrencySchema.safeParse({ currency });

  if (!parsedBody.success) {
    throw parsedBody.error;
  }

  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const userSettings = await prisma.userSettings.update({
    where: {
      userId: user.id,
    },
    data: {
      currency,
    },
  });

  return userSettings;
}

export async function updateUserTimezone(timezone: string) {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const userSettings = await prisma.userSettings.update({
    where: {
      userId: user.id,
    },
    data: {
      timezone,
    },
  });

  return userSettings;
}
