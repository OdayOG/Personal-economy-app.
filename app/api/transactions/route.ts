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

  const { amount, type, category, description, date } =
    await request.json();

  const parsedAmount = Number(amount);

  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    return NextResponse.json(
      { message: "Beløbet skal være større end 0." },
      { status: 400 }
    );
  }

  if (type !== "INCOME" && type !== "EXPENSE") {
    return NextResponse.json(
      { message: "Vælg indtægt eller udgift." },
      { status: 400 }
    );
  }

  if (!category?.trim()) {
    return NextResponse.json(
      { message: "Vælg eller skriv en kategori." },
      { status: 400 }
    );
  }

  const transaction = await prisma.transaction.create({
    data: {
      amount: parsedAmount,
      type,
      category: category.trim(),
      description: description?.trim() || null,
      date: date ? new Date(date) : new Date(),
      userId: user.id,
    },
  });

  return NextResponse.json(
    {
      message: "Transaktionen er gemt.",
      transaction,
    },
    { status: 201 }
  );
}