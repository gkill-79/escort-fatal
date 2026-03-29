import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Initialisation du client AWS S3
const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.AWS_KYC_BUCKET_NAME!;

/**
 * Upload un fichier vers la chambre forte (Bucket privé)
 */
export async function uploadToPrivateVault(fileBuffer: Buffer, fileName: string, mimeType: string): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileName, // Le chemin dans le bucket (ex: kyc/123_id.jpg)
    Body: fileBuffer,
    ContentType: mimeType,
    // Pas d'ACL public-read ici, le fichier reste strictement privé
  });

  await s3Client.send(command);
  
  // On retourne la clé interne (pas une URL HTTP !)
  return fileName; 
}

/**
 * Génère une URL temporaire (autodestruction) pour que l'Admin puisse voir la carte d'identité
 */
export async function getVaultPresignedUrl(fileKey: string, expiresInSeconds: number = 300): Promise<string> {
  if (!fileKey) return "";
  
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileKey,
  });

  // Génère un lien valide uniquement pendant 5 minutes (300 secondes)
  const url = await getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
  return url;
}
