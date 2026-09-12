import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/app/lib/prisma";
import { createSession } from "@/app/lib/session";

export async function POST(request: Request) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json(
      { message: "Udfyld venligst e-mail og adgangskode." },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return NextResponse.json(
      { message: "Forkert e-mail eller adgangskode." },
      { status: 401 }
    );
  }

  const passwordIsCorrect = await bcrypt.compare(
    password,
    user.passwordHash
  );

  if (!passwordIsCorrect) {
    return NextResponse.json(
      { message: "Forkert e-mail eller adgangskode." },
      { status: 401 }
    );
  }

  await createSession(user.id);

  return NextResponse.json({
    message: "Du er nu logget ind.",
  });
}