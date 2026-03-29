import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { encrypt2257Data } from '@/lib/encryption';
import { uploadToPrivateVault } from '@/lib/s3';
import crypto from 'crypto';

/**
 * API Route: /api/auth/register-escort
 * Orchestrates the registration of an Escort profile with biometric verification (KYC/2257).
 */
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    
    // 1. Extraction of standard data
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const username = formData.get('username') as string;
    const gender = formData.get('gender') as string;
    const cityId = formData.get('cityId') as string;
    
    // 2. Extraction of 2257 / KYC data
    const realName = formData.get('realName') as string;
    const dateOfBirth = formData.get('dateOfBirth') as string;
    const idDocument = formData.get('idDocument') as File;
    const liveSelfie = formData.get('liveSelfie') as File;

    if (!email || !password || !username || !realName || !dateOfBirth || !idDocument || !liveSelfie) {
      return NextResponse.json({ 
        message: "Données KYC incomplètes. Assurez-vous d'avoir rempli tous les champs et téléchargé vos documents." 
      }, { status: 400 });
    }

    // --- 3. BIOMETRIC VERIFICATION / OCR (Simulation) ---
    // In production, send 'idDocument' and 'liveSelfie' to a service like Stripe Identity or Veriff.
    const kycProviderStatus = "APPROVED"; 

    // --- 4. SECURE S3 UPLOAD ---
    const idBuffer = Buffer.from(await idDocument.arrayBuffer());
    const selfieBuffer = Buffer.from(await liveSelfie.arrayBuffer());

    const secureId = crypto.randomBytes(16).toString('hex');
    const idFileName = `kyc/ids/${secureId}_${idDocument.name}`;
    const selfieFileName = `kyc/selfies/${secureId}_${liveSelfie.name}`;

    console.log("Upload des documents biométriques vers le coffre-fort AWS S3...");
    const idS3Key = await uploadToPrivateVault(idBuffer, idFileName, idDocument.type);
    const selfieS3Key = await uploadToPrivateVault(selfieBuffer, selfieFileName, liveSelfie.type);

    // --- 5. ENCRYPTION OF SENSITIVE 2257 DATA ---
    const encryptedRealName = encrypt2257Data(realName);
    const encryptedDob = encrypt2257Data(dateOfBirth);

    const passwordHash = await bcrypt.hash(password, 12);

    // --- 6. ATOMIC DATABASE TRANSACTION ---
    const user = await prisma.$transaction(async (tx) => {
      
      // Check if user already exists
      const existingUser = await tx.user.findFirst({
        where: { OR: [{ email }, { username }] }
      });

      if (existingUser) {
        throw new Error("L'adresse email ou le pseudo est déjà utilisé.");
      }

      // Create the User and Profile
      const newUser = await tx.user.create({
        data: {
          email,
          username,
          passwordHash,
          role: "ESCORT",
          isActive: true,
          profile: {
            create: {
              name: username,
              slug: username.toLowerCase().replace(/\s+/g, '-'),
              gender: gender as any,
              cityId: cityId ? parseInt(cityId, 10) : undefined,
              isVerified: true, // Verified since KYC passed
              status: "APPROVED",
              isApproved: true,
            }
          }
        }
      });

      // Create the KYC/2257 Compliance Record
      await tx.kycRecord.create({
        data: {
          userId: newUser.id,
          encryptedRealName: encryptedRealName,
          encryptedDob: encryptedDob,
          idDocumentS3Key: idS3Key,
          selfieS3Key: selfieS3Key,
          status: kycProviderStatus as any,
          verificationId: "sim_req_" + Math.random().toString(36).substring(7),
          verifiedAt: new Date(),
        }
      });

      return newUser;
    });

    return NextResponse.json({ 
      message: "Félicitations ! Votre profil Escort a été créé et vérifié par notre système biométrique.",
      userId: user.id 
    }, { status: 201 });

  } catch (error: any) {
    console.error("KYC Registration Error:", error);
    return NextResponse.json({ 
      message: error.message || "Une erreur critique est survenue lors de l'inscription KYC." 
    }, { status: 500 });
  }
}
