import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { decode } from 'base64-arraybuffer';

const storageBuckets = {
  ASSETS: 'assets',
  INSTITUTIONS: 'institutions',
};

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);

  private readonly supabaseClient: SupabaseClient;

  constructor(private readonly configService: ConfigService) {
    this.logger.log('StorageService initialized');
    const supabaseUrl = this.configService.getOrThrow<string>('supabase.url');
    const supabaseUKey = this.configService.getOrThrow<string>('supabase.key');
    this.supabaseClient = createClient(supabaseUrl, supabaseUKey);

    this.initStorageBuckets();
  }

  private initStorageBuckets() {
    void this.initStorageBucketsAsync();
  }

  private async initStorageBucketsAsync() {
    this.logger.log('Initializing storage buckets...');
    await this.createBucketIfNotExists(storageBuckets.ASSETS, {
      public: true,
      allowedMimeTypes: [
        'image/png',
        'image/jpeg',
        'image/jpg',
        'image/webp',
        'image/gif',
      ],
      fileSizeLimit: 5 * 1024 * 1024, // 5 MB
    });
  }

  private async createBucketIfNotExists(
    bucketName: string,
    options: {
      public: boolean;
      allowedMimeTypes: string[];
      fileSizeLimit: number;
    },
  ): Promise<void> {
    this.logger.log('Initializing storage bucket: ' + bucketName);
    const { data, error } =
      await this.supabaseClient.storage.getBucket(bucketName);
    if (error) {
      this.logger.error(
        `Error fetching bucket ${bucketName}: ${error.message}`,
      );
      return;
    }
    if (!data) {
      const { error: createError } =
        await this.supabaseClient.storage.createBucket(bucketName, options);
      if (createError) {
        this.logger.error(
          `Error creating bucket ${bucketName}: ${createError.message}`,
        );
      } else {
        this.logger.log(`Bucket ${bucketName} created successfully`);
      }
    } else {
      this.logger.log(`Bucket ${bucketName} already exists`);
    }
  }

  async saveImage(imageBuffer: Buffer, filePath: string): Promise<string> {
    this.logger.log(`Saving image to path: ${filePath}`);
    const { data, error } = await this.supabaseClient.storage
      .from(storageBuckets.ASSETS)
      .upload(filePath, decode(imageBuffer.toString('base64')), {
        contentType: 'image/png',
        upsert: true,
      });

    if (error) {
      this.logger.error(`Error saving image: ${error.message}`);
      throw error;
    }

    const { data: publicUrlData } = this.supabaseClient.storage
      .from(storageBuckets.INSTITUTIONS)
      .getPublicUrl(data.path);

    const publicUrl = publicUrlData.publicUrl;

    this.logger.log(`Image saved successfully at: ${publicUrl}`);
    return publicUrl;
  }
}
