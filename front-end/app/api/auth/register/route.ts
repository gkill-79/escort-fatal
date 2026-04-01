import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { uploadToPrivateVault } from '@/lib/s3';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const username = formData.get('username') as string;
    const selfie = formData.get('selfie') as File;

    if (!email || !password || !username || !selfie) {
      return NextResponse.json({ 
        message: "Données incomplètes. Le selfie est obligatoire pour s'inscrire." 
      }, { status: 400 });
    }

    // --- SECURE S3 UPLOAD FOR MEMBER SELFIE ---
    const selfieBuffer = Buffer.from(await selfie.arrayBuffer());
    const secureId = crypto.randomBytes(16).toString('hex');
    const selfieFileName = `members/selfies/${secureId}_${selfie.name}`;

    console.log("Upload du selfie membre vers le coffre-fort AWS S3...");
    const selfieS3Key = await uploadToPrivateVault(selfieBuffer, selfieFileName, selfie.type);

    const passwordHash = await bcrypt.hash(password, 12);

    // --- ATOMIC DATABASE TRANSACTION ---
    const user = await prisma.$transaction(async (tx) => {
      // Check if user already exists
      const existingUser = await tx.user.findFirst({
        where: { OR: [{ email }, { username }] }
      });

      if (existingUser) {
        throw new Error("L'adresse email ou le pseudo est déjà utilisé.");
      }

      // Create the User (Member)
      const newUser = await tx.user.create({
        data: {
          email,
          username,
          passwordHash,
          role: "USER",
          isActive: true,
          isEmailVerified: false,
        }
      });

      // Optionally record the selfie in the KycRecord or a custom table
      // We will reuse KycRecord with a specific MEMBER_VERIFICATION note
      await tx.kycRecord.create({
         data: {
           userId: newUser.id,
           encryptedRealName: "MEMBER_VERIFICATION", // Placeholder as members don't need 2257 real names
           encryptedDob: "MEMBER_VERIFICATION",
           idDocumentS3Key: "NONE", // Members only provide a live selfie
           selfieS3Key: selfieS3Key,
           status: "PENDING", // Wait for manual or AI validation
           verificationId: "mem_req_" + Math.random().toString(36).substring(7),
         }
       });

      return newUser;
    });

    return NextResponse.json({ 
      message: "Félicitations ! Votre compte de membre a été créé avec succès.",
      userId: user.id 
    }, { status: 201 });

  } catch (error: any) {
    console.error("Member Registration Error:", error);
    return NextResponse.json({ 
      message: error.message || "Une erreur critique est survenue lors de l'inscription." 
    }, { status: 500 });
  }
}
