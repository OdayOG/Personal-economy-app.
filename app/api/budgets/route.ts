import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getCurrentUser } from "@/app/lib/session";

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { message: "Du skal være logget ind." },
      { status: 401 }
    );
  }

  const { category, amount, month } = await request.json();
  const parsedAmount = Number(amount);

  if (!category?.trim()) {
    return NextResponse.json(
      { message: "Vælg en kategori." },
      { status: 400 }
    );
  }

  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    return NextResponse.json(
      { message: "Budgetbeløbet skal være større end 0." },
      { status: 400 }
    );
  }

  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    return NextResponse.json(
      { message: "Vælg en gyldig måned." },
      { status: 400 }
    );
  }

  const [year, monthNumber] = month.split("-").map(Number);

  const monthStart = new Date(Date.UTC(year, monthNumber - 1, 1));
  const nextMonth = new Date(Date.UTC(year, monthNumber, 1));

  const existingBudget = await prisma.budget.findFirst({
    where: {
      userId: user.id,
      category: category.trim(),
      month: {
        gte: monthStart,
        lt: nextMonth,
      },
    },
  });

  const budget = existingBudget
    ? await prisma.budget.update({
        where: { id: existingBudget.id },
        data: { amount: parsedAmount },
      })
    : await prisma.budget.create({
        data: {
          userId: user.id,
          category: category.trim(),
          amount: parsedAmount,
          month: monthStart,
        },
      });

  return NextResponse.json(
    { message: "Budgettet er gemt.", budget },
    { status: 201 }
  );
}