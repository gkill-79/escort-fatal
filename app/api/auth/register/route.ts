import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { z } from "zod";

const registerSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["MEMBER", "ESCORT"]).default("MEMBER"),
  // Specific fields for Escort profile
  gender: z.enum(["FEMALE", "MALE", "TRANS", "COUPLE"]).optional(),
  cityId: z.coerce.number().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { message: "Données invalides", errors: result.error.errors },
        { status: 400 }
      );
    }

    const { username, email, password, role, gender, cityId } = result.data;

    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Un utilisateur avec cet email ou ce nom d'utilisateur existe déjà." },
        { status: 409 }
      );
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user and profile in a transaction
    const user = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const newUser = await tx.user.create({
        data: {
          username,
          email,
          passwordHash,
          role,
        },
      });

      if (role === "ESCORT") {
        // Create an empty profile for the escort
        // Slug generation from username (lowercase, replace spaces with dashes, remove special chars)
        const baseSlug = username.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
        const slug = `${baseSlug}-${Math.floor(Math.random() * 10000)}`;

        await tx.profile.create({
          data: {
            userId: newUser.id,
            slug,
            name: username,
            gender: gender || "FEMALE",
            cityId: cityId || undefined,
            isApproved: true, // Auto-approuvé pour faciliter le développement/tests
            isActive: true,
          },
        });
      }

      return newUser;
    });

    return NextResponse.json(
      { message: "Compte créé avec succès." },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register API error:", error);
    return NextResponse.json(
      { message: "Une erreur est survenue lors de la création du compte." },
      { status: 500 }
    );
  }
}
