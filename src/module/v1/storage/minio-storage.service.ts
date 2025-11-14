import { GlobalHttpException } from '@app/common/filters/error-http-exception';
import { AppLoggerService } from '@app/logger/logger.service';
import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MinioService } from 'nestjs-minio-client';
import { BufferedFile } from './file.model';

/**
 * @class MinioStorageService
 * @description A service that provides a simplified interface for interacting with a Minio S3-compatible object storage server.
 * It encapsulates common operations like checking for bucket existence, uploading files, generating presigned URLs, and deleting objects.
 */
@Injectable()
export class MinioStorageService {
  /** @private @readonly The name of the Minio bucket where files will be stored. Loaded from configuration. */
  private readonly bucketName: string;
  /** @private @readonly The default expiration time in seconds for presigned URLs (defaults to 1 day). */
  private readonly presignedUrlDefaultExpiry = 24 * 60 * 60;

  /**
   * @public
   * @property {MinioService['client']} client
   * @description Provides direct access to the underlying `nestjs-minio-client` instance for advanced use cases.
   */
  public get client(): typeof this.minio.client {
    return this.minio.client;
  }

  /**
   * @constructor
   * @param {MinioService} minio - The injected `nestjs-minio-client` service.
   * @param {AppLoggerService} logger - The application's logging service.
   * @param {ConfigService} configService - The service for accessing configuration variables.
   */
  constructor(
    private readonly minio: MinioService,
    private readonly logger: AppLoggerService,
    private readonly configService: ConfigService,
  ) {
    this.bucketName = this.configService.get<string>('MINIO_BUCKET')!;
    this.ensureBucketExists();
  }

  /**
   * @private
   * @method ensureBucketExists
   * @description Checks if the configured bucket exists on service initialization. If it doesn't, it attempts to create it.
   * This method is called automatically by the constructor.
   * @returns {Promise<void>}
   * @throws {GlobalHttpException} Throws an `INTERNAL_SERVER_ERROR` if the bucket cannot be created.
   */
  private async ensureBucketExists(): Promise<void> {
    const bucketExists = await this.client.bucketExists(this.bucketName);
    if (!bucketExists) {
      this.logger.log(`Bucket "${this.bucketName}" not found, creating...`);
      try {
        await this.client.makeBucket(this.bucketName);
        this.logger.log(`Bucket "${this.bucketName}" created successfully.`);
      } catch (error) {
        throw new GlobalHttpException(
          HttpStatus.INTERNAL_SERVER_ERROR,
          'Minio bucket cannot be created',
          error.message,
        );
      }
    }
  }

  /**
   * @public
   * @method extractObjectNameFromUrl
   * @description Extracts the object name from a full static/public Minio URL.
   * @param {string} url - The static/public URL of the file.
   * @returns {string} The object name (path inside bucket).
   */
  public extractObjectNameFromUrl(url: string): string {
    try {
      const parsed = new URL(url);
      const parts = parsed.pathname.split('/');
      // pathname example: /healthgini-developer/profile/.../file.png
      return parts.slice(2).join('/'); // remove leading slash + bucket name
    } catch {
      return url; // fallback in case parsing fails
    }
  }

  /**
   * @public
   * @method upload
   * @description Uploads a buffered file to the configured Minio bucket.
   * @param {BufferedFile} file - The file to be uploaded, containing a buffer, original name, and MIME type.
   * @param {string} objectName - The full path and name for the object in the bucket (e.g., 'profiles/user-123/avatar.jpg').
   * @returns {Promise<{ etag: string; versionI"seed1": "NODE_ENV=dev node -e \"require('dotenv').config({ path: 'Environment/.env.dev' }); require('child_process').spawn('ts-node', ['-r', 'tsconfig-paths/register', 'src/database/postgres/prisma/seed1.ts'], { stdio: 'inherit', env: process.env });\"",
    "seed:d: string | null }>} A promise that resolves with the ETag and version ID of the uploaded object.
   * @throws {GlobalHttpException} Throws an `INTERNAL_SERVER_ERROR` if the file upload fails.
   */
  public async upload(
    file: BufferedFile,
    objectName: string,
  ): Promise<{ etag: string; versionId: string | null }> {
    const fileMetadata = { 'Content-Type': file.mimetype };
    try {
      this.logger.log(
        `Uploading object "${objectName}" to bucket "${this.bucketName}"`,
      );
      return await this.client.putObject(
        this.bucketName,
        objectName,
        file.buffer,
        fileMetadata,
      );
    } catch (error) {
      this.logger.error(`File upload failed for "${objectName}".`);
      throw new GlobalHttpException(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Error uploading file to storage.',
        error.message,
      );
    }
  }

  /**
   * @public
   * @method getPresignedUrl
   * @description Generates a temporary, time-limited URL that grants public read access to a private object in the bucket.
   * @param {string} objectName - The name of the object for which to generate the URL.
   * @param {number} [expiry=86400] - The duration in seconds for which the URL will be valid. Defaults to 24 hours.
   * @returns {Promise<string>} A promise that resolves to the presigned URL string.
   * @throws {GlobalHttpException} Throws an `INTERNAL_SERVER_ERROR` if URL generation fails.
   */
  public async getPresignedUrl(
    objectName: string,
    expiry: number = this.presignedUrlDefaultExpiry,
  ): Promise<string> {
    try {
      const result = await this.client.presignedGetObject(
        this.bucketName,
        objectName,
        expiry,
      );

      return result;
    } catch (error) {
      this.logger.error(`Failed to generate presigned URL for "${objectName}"`);
      throw new GlobalHttpException(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Error occurred while generating access URL',
      );
    }
  }

  //add for temporary usage
  public getPublicUrl(objectName: string): string {
    // const baseUrl = this.configService.get<string>('MINIO_STATIC_URL')!;
    return `https://rabbitmq.merai.app/healthgini-developer/${objectName}`;
  }

  /**
   * @public
   * @method deleteObjectByPrefix
   * @description Finds and deletes all objects within the bucket that start with the given prefix. This is useful
   * for deleting all files in a "folder".
   * @param {string} prefix - The prefix (directory path) to search for. E.g., 'profiles/user-123/'.
   * @returns {Promise<void>} A promise that resolves when all matching objects have been deleted, or if no objects were found.
   * @throws {GlobalHttpException} Throws an `INTERNAL_SERVER_ERROR` if the bulk deletion process fails.
   */
  public async deleteObjectByPrefix(prefix: string): Promise<void> {
    const objectStream = this.client.listObjectsV2(
      this.bucketName,
      prefix,
      true,
    );
    const objectNames: string[] = [];

    return new Promise<void>((resolve, reject) => {
      objectStream.on('data', (obj) => objectNames.push(obj.name!));
      objectStream.on('error', (err) => reject(err));
      objectStream.on('end', async () => {
        if (objectNames.length > 0) {
          try {
            await this.client.removeObjects(this.bucketName, objectNames);
            this.logger.log(
              `Successfully deleted ${objectNames.length} objects with prefix "${prefix}".`,
            );
            resolve();
          } catch (error) {
            this.logger.error(
              `Failed to remove objects with prefix "${prefix}".`,
            );
            reject(
              new GlobalHttpException(
                HttpStatus.INTERNAL_SERVER_ERROR,
                'An error occurred during bulk deletion.',
              ),
            );
          }
        } else {
          // Resolve successfully if no objects were found to delete
          resolve();
        }
      });
    });
  }

  public async objectExists(objectName: string): Promise<boolean> {
    try {
      await this.client.statObject(this.bucketName, objectName);
      return true;
    } catch (error) {
      if (error.code === 'NotFound') {
        return false;
      }
      this.logger.error(
        `Error checking object existence for "${objectName}"`,
        error,
      );
      throw new GlobalHttpException(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Error occurred while checking file existence',
      );
    }
  }

  /**
   * @public
   * @method getJsonFile
   * @description Retrieves and parses a JSON file from the configured MinIO bucket.
   * @param objectKey - The full object path in the bucket (e.g., 'location_data/india/india.json')
   * @returns Parsed JSON content as an object
   */
  // public async getJsonFile(objectKey: string, res: FastifyReply): Promise<void> {
  //   try {
  //     console.time('[START]');
  //     const stream = await this.client.getObject(this.bucketName, objectKey);
  //     console.timeLog('[START]', '[STREAM READY]');

  //     // ❗ Use res.raw.writeHead instead of res.header
  //     res.raw.writeHead(200, {
  //       'Access-Control-Allow-Origin': '*',
  //       'Access-Control-Allow-Methods': 'GET, OPTIONS',
  //       'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  //       'Content-Type': 'application/geo+json',
  //     });

  //     stream.on('data', (chunk) => {
  //       console.log('[CHUNK]', `Received ${chunk.length} bytes`);
  //     });

  //     stream.on('end', () => {
  //       console.log('[STREAM] End of stream');
  //       console.timeEnd('[START]');
  //       res.raw.end(); // ✅ close the stream
  //     });

  //     stream.on('error', (err) => {
  //       console.error('[STREAM ERROR]', err);
  //       res.raw.statusCode = 500;
  //       res.raw.end(JSON.stringify({ message: 'Stream failed' }));
  //     });

  //     stream.pipe(res.raw);
  //   } catch (error) {
  //     this.logger.error(
  //       `Failed to stream JSON file from "${objectKey}"`,
  //       error,
  //     );
  //     throw new GlobalHttpException(
  //       HttpStatus.INTERNAL_SERVER_ERROR,
  //       'Failed to stream JSON file from storage',
  //       error.message,
  //     );
  //   }
  // }

  // public async getJsonFile(objectKey: string, res: FastifyReply): Promise<any> {
  //   try {
  //     const stream = await this.client.getObject(this.bucketName, objectKey);

  //     res.header('Access-Control-Allow-Origin', '*');
  //     res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  //     res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  //     res.header('Content-Type', 'application/geo+json');
  //     res.send(stream);
  //   } catch (error) {
  //     this.logger.error(`Failed to stream JSON file from "${objectKey}"`, error);
  //     throw new GlobalHttpException(
  //       HttpStatus.INTERNAL_SERVER_ERROR,
  //       'Failed to stream JSON file from storage',
  //       error.message,
  //     );
  //   }
  // }

  // public async getJsonFile(objectKey: string, res: FastifyReply): Promise<void> {
  //   try {
  //     const stream: Readable = await this.client.getObject(this.bucketName, objectKey);

  //     let data = '';
  //     for await (const chunk of stream) {
  //       data += chunk.toString('utf-8');
  //     }

  //     res
  //       .header('Access-Control-Allow-Origin', '*')
  //       .header('Content-Type', 'application/geo+json')
  //       .code(200)
  //       .send(JSON.parse(data)); // parsed JSON response
  //   } catch (error) {
  //     this.logger.error(`Failed to fetch JSON file from "${objectKey}"`, error);

  //     res
  //       .code(500)
  //       .send({
  //         message: 'Failed to fetch JSON file from storage',
  //         error: error.message,
  //       });
  //   }
  // }

  // public async getJsonFile(objectKey: string): Promise<any> {
  //   try {
  //     const stream: Readable = await this.client.getObject(this.bucketName, objectKey);

  //     let data = '';
  //     for await (const chunk of stream) {
  //       data += chunk.toString('utf-8');
  //     }

  //     return JSON.parse(data); // 👈 just return the parsed JSON
  //   } catch (error) {
  //     this.logger.error(`Failed to fetch JSON file from "${objectKey}"`, error);

  //     throw new GlobalHttpException(
  //       HttpStatus.INTERNAL_SERVER_ERROR,
  //       'Failed to fetch JSON file from storage',
  //       error.message,
  //     );
  //   }
  // }

  // public async getJsonFile(objectKey: string, res: FastifyReply): Promise<void> {
  //   try {
  //     const stream: Readable = await this.client.getObject(this.bucketName, objectKey);
  //     let data = '';

  //     for await (const chunk of stream) {
  //       data += chunk.toString('utf-8');
  //     }

  //     res
  //       .header('Access-Control-Allow-Origin', '*')
  //       .header('Content-Type', 'application/geo+json')
  //       .code(200)
  //       .send(JSON.parse(data));
  //   } catch (error) {
  //     this.logger.error(`Failed to fetch JSON file from "${objectKey}"`, error);
  //     res.code(500).send({
  //       message: 'Failed to fetch JSON file from storage',
  //       error: error.message,
  //     });
  //   }
  // }
}
