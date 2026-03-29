-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ESCORT', 'ADMIN');

-- CreateEnum
CREATE TYPE "ProfileStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'VIDEO');

-- CreateEnum
CREATE TYPE "ProfileGender" AS ENUM ('FEMALE', 'MALE', 'TRANS', 'COUPLE');

-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('GFE', 'BDSM', 'WEBCAM', 'MASSAGE', 'DOMINATION', 'OUTCALL', 'INCALL', 'VIRTUAL', 'ESCORT', 'FETISH');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PaymentProduct" AS ENUM ('BOOST_7D', 'BOOST_30D', 'TOP_GIRL_7D', 'TOP_GIRL_30D', 'CHAT_CREDITS_10', 'CHAT_CREDITS_50', 'CREDIT_PACK_100', 'CREDIT_PACK_300', 'EXCLUSIVE_30D');

-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('TEXT', 'IMAGE', 'SYSTEM');

-- CreateEnum
CREATE TYPE "KycStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'REQUIRES_MANUAL_REVIEW');

-- CreateEnum
CREATE TYPE "MediaStatus" AS ENUM ('PROCESSING', 'COMPLETED', 'FAILED', 'REJECTED_MODERATION');

-- CreateEnum
CREATE TYPE "CreditLogType" AS ENUM ('PURCHASE', 'BOOST', 'CHAT', 'REFUND');

-- CreateEnum
CREATE TYPE "CallStatus" AS ENUM ('ONGOING', 'COMPLETED', 'INSUFFICIENT_FUNDS', 'CANCELLED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "avatarUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerifyToken" TEXT,
    "resetToken" TEXT,
    "resetTokenExpiresAt" TIMESTAMP(3),
    "chatCredits" INTEGER NOT NULL DEFAULT 0,
    "credits" INTEGER NOT NULL DEFAULT 0,
    "creditsBalance" INTEGER NOT NULL DEFAULT 0,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "countries" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "flagUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "countries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departments" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "region" TEXT,
    "countryId" INTEGER NOT NULL,
    "profileCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cities" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "departmentId" INTEGER,
    "countryId" INTEGER NOT NULL,
    "lat" DOUBLE PRECISION,
    "lon" DOUBLE PRECISION,
    "profileCount" INTEGER NOT NULL DEFAULT 0,
    "isPopular" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "cities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "age" INTEGER,
    "gender" "ProfileGender" NOT NULL DEFAULT 'FEMALE',
    "bio" TEXT,
    "phoneEncrypted" TEXT,
    "whatsapp" TEXT,
    "cityId" INTEGER,
    "departmentId" INTEGER,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "videoCallPricePerMin" INTEGER NOT NULL DEFAULT 50,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "lastOnlineAt" TIMESTAMP(3),
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isExclusive" BOOLEAN NOT NULL DEFAULT false,
    "isTopGirl" BOOLEAN NOT NULL DEFAULT false,
    "topGirlUntil" TIMESTAMP(3),
    "baseScore" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "boostScore" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "boostExpires" TIMESTAMP(3),
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "acceptsChat" BOOLEAN NOT NULL DEFAULT true,
    "status" "ProfileStatus" NOT NULL DEFAULT 'PENDING',
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "followerCount" INTEGER NOT NULL DEFAULT 0,
    "ratingAvg" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ratingCount" INTEGER NOT NULL DEFAULT 0,
    "priceFrom" INTEGER,
    "priceTo" INTEGER,
    "height" INTEGER,
    "weight" INTEGER,
    "bust" INTEGER,
    "nationality" TEXT,
    "languages" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "categories" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "hairColor" TEXT,
    "eyeColor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profile_photos" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "blurUrl" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "unlockPriceCredits" INTEGER,
    "order" INTEGER NOT NULL DEFAULT 0,
    "ratingAvg" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ratingCount" INTEGER NOT NULL DEFAULT 0,
    "width" INTEGER,
    "height" INTEGER,
    "sizeBytes" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profile_photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profile_videos" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "urlHls" TEXT,
    "urlMp4" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "duration" INTEGER,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profile_videos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profile_services" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "type" "ServiceType" NOT NULL,
    "description" TEXT,
    "price" INTEGER,

    CONSTRAINT "profile_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "follows" (
    "followerId" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "follows_pkey" PRIMARY KEY ("followerId","profileId")
);

-- CreateTable
CREATE TABLE "comments" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "rating" INTEGER,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "photo_ratings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "photoId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "photo_ratings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Media" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" "MediaType" NOT NULL DEFAULT 'IMAGE',
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "price" INTEGER NOT NULL DEFAULT 0,
    "profileId" TEXT NOT NULL,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UnlockedMedia" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UnlockedMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "details" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reporterId" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "credits" INTEGER NOT NULL,
    "stripeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatRoom" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatRoom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "roomId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "oldSenderId" TEXT,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "announcements" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "cityId" INTEGER,
    "category" TEXT,
    "views" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "announcements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "profileId" TEXT,
    "stripeSessionId" TEXT,
    "stripePaymentId" TEXT,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'eur',
    "product" "PaymentProduct" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "city_tours" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "cityId" INTEGER NOT NULL,
    "dateFrom" TIMESTAMP(3) NOT NULL,
    "dateTo" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "city_tours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "availability" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startHour" INTEGER NOT NULL,
    "endHour" INTEGER NOT NULL,

    CONSTRAINT "availability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kyc_records" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "encryptedRealName" TEXT NOT NULL,
    "encryptedDob" TEXT NOT NULL,
    "idDocumentS3Key" TEXT NOT NULL,
    "selfieS3Key" TEXT NOT NULL,
    "status" "KycStatus" NOT NULL DEFAULT 'PENDING',
    "verificationId" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kyc_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_assets" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "originalFilename" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "url" TEXT,
    "hlsPlaylistUrl" TEXT,
    "status" "MediaStatus" NOT NULL DEFAULT 'PROCESSING',
    "upvotes" INTEGER NOT NULL DEFAULT 0,
    "downvotes" INTEGER NOT NULL DEFAULT 0,
    "hotScore" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "media_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "type" "CreditLogType" NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "credit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "credits" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "cryptoCurrency" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CallSession" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "escortId" TEXT NOT NULL,
    "status" "CallStatus" NOT NULL DEFAULT 'ONGOING',
    "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" TIMESTAMP(3),
    "costPerMinute" INTEGER NOT NULL,
    "totalBilled" INTEGER NOT NULL DEFAULT 0,
    "escortEarnings" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CallSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ChatRoomToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_username_idx" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "countries_code_key" ON "countries"("code");

-- CreateIndex
CREATE UNIQUE INDEX "departments_slug_key" ON "departments"("slug");

-- CreateIndex
CREATE INDEX "departments_countryId_idx" ON "departments"("countryId");

-- CreateIndex
CREATE UNIQUE INDEX "cities_slug_key" ON "cities"("slug");

-- CreateIndex
CREATE INDEX "cities_slug_idx" ON "cities"("slug");

-- CreateIndex
CREATE INDEX "cities_countryId_idx" ON "cities"("countryId");

-- CreateIndex
CREATE INDEX "cities_isPopular_idx" ON "cities"("isPopular");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_userId_key" ON "profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_slug_key" ON "profiles"("slug");

-- CreateIndex
CREATE INDEX "profiles_slug_idx" ON "profiles"("slug");

-- CreateIndex
CREATE INDEX "profiles_cityId_idx" ON "profiles"("cityId");

-- CreateIndex
CREATE INDEX "profiles_departmentId_idx" ON "profiles"("departmentId");

-- CreateIndex
CREATE INDEX "profiles_gender_idx" ON "profiles"("gender");

-- CreateIndex
CREATE INDEX "profiles_isOnline_idx" ON "profiles"("isOnline");

-- CreateIndex
CREATE INDEX "profiles_isTopGirl_idx" ON "profiles"("isTopGirl");

-- CreateIndex
CREATE INDEX "profiles_isApproved_isActive_idx" ON "profiles"("isApproved", "isActive");

-- CreateIndex
CREATE INDEX "profiles_boostScore_idx" ON "profiles"("boostScore" DESC);

-- CreateIndex
CREATE INDEX "profile_photos_profileId_idx" ON "profile_photos"("profileId");

-- CreateIndex
CREATE INDEX "profile_photos_isPrimary_idx" ON "profile_photos"("isPrimary");

-- CreateIndex
CREATE INDEX "profile_photos_ratingAvg_idx" ON "profile_photos"("ratingAvg" DESC);

-- CreateIndex
CREATE INDEX "profile_videos_profileId_idx" ON "profile_videos"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "profile_services_profileId_type_key" ON "profile_services"("profileId", "type");

-- CreateIndex
CREATE INDEX "follows_profileId_idx" ON "follows"("profileId");

-- CreateIndex
CREATE INDEX "comments_profileId_idx" ON "comments"("profileId");

-- CreateIndex
CREATE INDEX "comments_authorId_idx" ON "comments"("authorId");

-- CreateIndex
CREATE INDEX "comments_isApproved_idx" ON "comments"("isApproved");

-- CreateIndex
CREATE INDEX "photo_ratings_photoId_idx" ON "photo_ratings"("photoId");

-- CreateIndex
CREATE UNIQUE INDEX "photo_ratings_userId_photoId_key" ON "photo_ratings"("userId", "photoId");

-- CreateIndex
CREATE UNIQUE INDEX "UnlockedMedia_userId_mediaId_key" ON "UnlockedMedia"("userId", "mediaId");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_stripeId_key" ON "Transaction"("stripeId");

-- CreateIndex
CREATE INDEX "announcements_cityId_idx" ON "announcements"("cityId");

-- CreateIndex
CREATE INDEX "announcements_createdAt_idx" ON "announcements"("createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "payments_stripeSessionId_key" ON "payments"("stripeSessionId");

-- CreateIndex
CREATE INDEX "payments_userId_idx" ON "payments"("userId");

-- CreateIndex
CREATE INDEX "payments_profileId_idx" ON "payments"("profileId");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- CreateIndex
CREATE INDEX "city_tours_profileId_idx" ON "city_tours"("profileId");

-- CreateIndex
CREATE INDEX "city_tours_cityId_idx" ON "city_tours"("cityId");

-- CreateIndex
CREATE INDEX "city_tours_dateFrom_idx" ON "city_tours"("dateFrom");

-- CreateIndex
CREATE INDEX "availability_profileId_idx" ON "availability"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_key" ON "password_reset_tokens"("token");

-- CreateIndex
CREATE INDEX "password_reset_tokens_userId_idx" ON "password_reset_tokens"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "kyc_records_userId_key" ON "kyc_records"("userId");

-- CreateIndex
CREATE INDEX "kyc_records_status_idx" ON "kyc_records"("status");

-- CreateIndex
CREATE INDEX "media_assets_profileId_idx" ON "media_assets"("profileId");

-- CreateIndex
CREATE INDEX "media_assets_status_idx" ON "media_assets"("status");

-- CreateIndex
CREATE INDEX "credit_logs_userId_idx" ON "credit_logs"("userId");

-- CreateIndex
CREATE INDEX "credit_logs_createdAt_idx" ON "credit_logs"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "orders_userId_idx" ON "orders"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CallSession_roomId_key" ON "CallSession"("roomId");

-- CreateIndex
CREATE UNIQUE INDEX "_ChatRoomToUser_AB_unique" ON "_ChatRoomToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_ChatRoomToUser_B_index" ON "_ChatRoomToUser"("B");

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "countries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cities" ADD CONSTRAINT "cities_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cities" ADD CONSTRAINT "cities_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "countries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "cities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_photos" ADD CONSTRAINT "profile_photos_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_videos" ADD CONSTRAINT "profile_videos_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_services" ADD CONSTRAINT "profile_services_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follows" ADD CONSTRAINT "follows_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follows" ADD CONSTRAINT "follows_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "photo_ratings" ADD CONSTRAINT "photo_ratings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "photo_ratings" ADD CONSTRAINT "photo_ratings_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "profile_photos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnlockedMedia" ADD CONSTRAINT "UnlockedMedia_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnlockedMedia" ADD CONSTRAINT "UnlockedMedia_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "ChatRoom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_oldSenderId_fkey" FOREIGN KEY ("oldSenderId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "cities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "city_tours" ADD CONSTRAINT "city_tours_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "city_tours" ADD CONSTRAINT "city_tours_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "cities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "availability" ADD CONSTRAINT "availability_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kyc_records" ADD CONSTRAINT "kyc_records_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_logs" ADD CONSTRAINT "credit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CallSession" ADD CONSTRAINT "CallSession_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CallSession" ADD CONSTRAINT "CallSession_escortId_fkey" FOREIGN KEY ("escortId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChatRoomToUser" ADD CONSTRAINT "_ChatRoomToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "ChatRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChatRoomToUser" ADD CONSTRAINT "_ChatRoomToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
