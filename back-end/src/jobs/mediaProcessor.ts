import { Worker, Job } from 'bullmq';
import ffmpeg from 'fluent-ffmpeg';
import { prisma } from '../lib/prisma';
import path from 'path';
import fs from 'fs';

// Connection to Redis for BullMQ
const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
};

/**
 * Worker for media processing:
 * - Removes metadata for anonymity.
 * - Transcodes video to HLS (adaptive streaming).
 * - Updates the MediaAsset status in PostgreSQL.
 */
export const mediaWorker = new Worker('media-processing-queue', async (job: Job) => {
  const { mediaId, inputFilePath, fileType } = job.data;
  
  console.log(`[Worker] Processing media ${mediaId} (${fileType})...`);

  try {
    const publicDir = path.join(__dirname, `../../public/uploads/hls/${mediaId}`);
    
    // Ensure output directories exist
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    if (fileType === 'VIDEO') {
      const hlsPlaylistPath = path.join(publicDir, 'playlist.m3u8');

      // FFmpeg pipeline: HLS + Metadata stripping
      await new Promise((resolve, reject) => {
        ffmpeg(inputFilePath)
          // Strip EXIF, GPS, and other private metadata
          .outputOptions(['-map_metadata -1']) 
          // HLS (Adaptive Bitrate Ready)
          .outputOptions([
            '-profile:v baseline', 
            '-level 3.0', 
            '-start_number 0', 
            '-hls_time 10', 
            '-hls_list_size 0', 
            '-f hls'
          ])
          .output(hlsPlaylistPath)
          .on('end', () => {
            console.log(`[Worker] Video ${mediaId} transcoded to HLS.`);
            resolve(true);
          })
          .on('error', (err) => {
            console.error(`[Worker] FFmpeg error for ${mediaId}:`, err);
            reject(err);
          })
          .run();
      });

      // Update Database
      await prisma.mediaAsset.update({
        where: { id: mediaId },
        data: { 
          status: 'COMPLETED',
          hlsPlaylistUrl: `/uploads/hls/${mediaId}/playlist.m3u8`,
          url: `/uploads/hls/${mediaId}/playlist.m3u8`
        }
      });
    } else if (fileType === 'IMAGE') {
      // For images, we just strip metadata and keep the file
      const outputImagePath = path.join(publicDir, 'processed.jpg');
      
      await new Promise((resolve, reject) => {
        ffmpeg(inputFilePath)
          .outputOptions(['-map_metadata -1'])
          .output(outputImagePath)
          .on('end', resolve)
          .on('error', reject)
          .run();
      });

      await prisma.mediaAsset.update({
        where: { id: mediaId },
        data: { 
          status: 'COMPLETED',
          url: `/uploads/hls/${mediaId}/processed.jpg`
        }
      });
    }

  } catch (error) {
    console.error(`[Worker] Critical failure for ${mediaId}:`, error);
    await prisma.mediaAsset.update({
      where: { id: mediaId },
      data: { status: 'FAILED' }
    });
  }
}, { connection });
