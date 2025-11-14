// // import { AppModule } from '@app/app.module';
// // import { GlobalHttpException } from '@app/common/filters/error-http-exception';
// // import { MinioStorageService } from '@app/module/v1/storage/minio-storage.service';
// // import { HttpStatus } from '@nestjs/common';
// // import { ConfigService } from '@nestjs/config';
// // import { NestFactory } from '@nestjs/core';
// // import { GridFSBucket, MongoClient } from 'mongodb';
// // import mongoose from 'mongoose';
// // import { Readable } from 'stream';

// // interface GeoJsonFile {
// //   key: string;
// //   objectName: string;
// //   bucketName: string;
// // }

// // // Seeder logic
// // async function seed(
// //   minioStorageService: MinioStorageService,
// //   dbName: string,
// //   mongoUri: string,
// // ) {
// //   const client = new MongoClient(mongoUri);
// //   await client.connect();
// //   const db = client.db(dbName);

// //   const geojsonFiles: GeoJsonFile[] = [
// //     {
// //       key: 'geo-india',
// //       objectName: 'location_data/india/india-osm.geojson',
// //       bucketName: 'location_data_india',
// //     },
// //     {
// //       key: 'geo-states',
// //       objectName: 'location_data/state/india_telengana.geojson',
// //       bucketName: 'location_data_state',
// //     },
// //   ];

// //   for (const file of geojsonFiles) {
// //     const bucket = new GridFSBucket(db, { bucketName: file.bucketName });

// //     try {
// //       const existingFile = await db
// //         .collection(`${file.bucketName}.files`)
// //         .findOne({ filename: file.key });

// //       if (existingFile) {
// //         try {
// //           await bucket.delete(existingFile._id);
// //           console.log(
// //             `🗑️ Deleted existing file: ${file.key} from bucket: ${file.bucketName}`,
// //           );
// //         } catch (err) {
// //           console.warn(
// //             `⚠️ Failed to delete existing file ${file.key}:`,
// //             err.message,
// //           );
// //         }
// //       }

// //       const presignedUrl = await minioStorageService.getPresignedUrl(
// //         file.objectName,
// //       );
// //       const response = await fetch(presignedUrl);
// //       if (!response.ok)
// //         throw new Error(`Failed to fetch ${file.key}: ${response.statusText}`);

// //       const geojson = await response.text(); // keep raw
// //       const stream = Readable.from(geojson);

// //       await new Promise<void>((resolve, reject) => {
// //         stream
// //           .pipe(
// //             bucket.openUploadStream(file.key, {
// //               metadata: { objectName: file.objectName },
// //             }),
// //           )
// //           .on('error', reject)
// //           .on('finish', () => {
// //             console.log(
// //               `🌱 Seeded to GridFS: ${file.key} → ${file.bucketName}`,
// //             );
// //             resolve();
// //           });
// //       });
// //     } catch (error) {
// //       console.error(`❌ Error seeding ${file.key}`, error);
// //     }
// //   }

// //   await client.close();
// // }

// // // Bootstrap
// // async function run() {
// //   const app = await NestFactory.createApplicationContext(AppModule);
// //   const configService = app.get(ConfigService);
// //   const minioStorageService = app.get(MinioStorageService);

// //   try {
// //     const MONGO_URI = configService.get<string>('MONGO_URI');
// //     if (!MONGO_URI) throw new GlobalHttpException(HttpStatus.INTERNAL_SERVER_ERROR, 'MongoDB URI is not configured');

// //     const dbName = configService.get<string>('DB_NAME');
// //     if (!dbName) throw new GlobalHttpException(HttpStatus.INTERNAL_SERVER_ERROR, 'DB_NAME is not configured');
// //     await mongoose.connect(MONGO_URI); // still needed to share existing connection pool
// //     console.log('🟢 MongoDB connected');

// //     await seed(minioStorageService, dbName, MONGO_URI);
// //   } catch (err) {
// //     console.error('❌ Seeding error', err);
// //   } finally {
// //     await mongoose.disconnect();
// //     console.log('🔌 MongoDB disconnected');
// //     await app.close();
// //   }
// // }

// // run();


// import { AppModule } from '@app/app.module';
// import { GlobalHttpException } from '@app/common/filters/error-http-exception';
// import { MinioStorageService } from '@app/module/v1/storage/minio-storage.service';
// import { HttpStatus } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { NestFactory } from '@nestjs/core';
// import { GridFSBucket, MongoClient } from 'mongodb';
// import mongoose from 'mongoose';
// import { Readable } from 'stream';

// interface GeoJsonFile {
//   key: string;
//   objectName: string;
//   bucketName: string;
// }

// // Seeder logic
// async function seed(
//   minioStorageService: MinioStorageService,
//   dbName: string,
//   mongoUri: string,
// ) {
//   const startTime = Date.now();
//   console.log(`🚀 Starting MongoDB seed for database: ${dbName}`);

//   const client = new MongoClient(mongoUri);
//   await client.connect();
//   const db = client.db(dbName);
//   console.log(`✅ Connected to MongoDB: ${mongoUri}`);

//   const geojsonFiles: GeoJsonFile[] = [
//     {
//       key: 'geo-india',
//       objectName: 'location_data/india/india-osm.geojson',
//       bucketName: 'location_data_india',
//     },
//     {
//       key: 'geo-states',
//       objectName: 'location_data/state/india_telengana.geojson',
//       bucketName: 'location_data_state',
//     },
//   ];

//   for (const file of geojsonFiles) {
//     console.log(`📁 Processing file: ${file.key} → ${file.bucketName}`);
//     const bucket = new GridFSBucket(db, { bucketName: file.bucketName });

//     try {
//       const existingFile = await db
//         .collection(`${file.bucketName}.files`)
//         .findOne({ filename: file.key });

//       if (existingFile) {
//         try {
//           await bucket.delete(existingFile._id);
//           console.log(
//             `🗑️ Deleted existing file: ${file.key} from bucket: ${file.bucketName}`,
//           );
//         } catch (err) {
//           console.warn(
//             `⚠️ Failed to delete existing file ${file.key}:`,
//             err.message,
//           );
//         }
//       }

//       console.log(`🔗 Fetching from MinIO: ${file.objectName}`);
//       const presignedUrl = await minioStorageService.getPresignedUrl(file.objectName);
//       const response = await fetch(presignedUrl);

//       if (!response.ok) {
//         throw new Error(`Failed to fetch ${file.key}: ${response.statusText}`);
//       }

//       const geojson = await response.text();
//       const stream = Readable.from(geojson);

//       console.log(`📤 Uploading to GridFS: ${file.key} → ${file.bucketName}`);
//       await new Promise<void>((resolve, reject) => {
//         stream
//           .pipe(
//             bucket.openUploadStream(file.key, {
//               metadata: { objectName: file.objectName },
//             }),
//           )
//           .on('error', (err) => {
//             console.error(`❌ Upload failed for ${file.key}`, err);
//             reject(err);
//           })
//           .on('finish', () => {
//             console.log(
//               `✅ Seeded to GridFS: ${file.key} → ${file.bucketName}`,
//             );
//             resolve();
//           });
//       });
//     } catch (error) {
//       console.error(`❌ Error processing ${file.key}`, error);
//     }
//   }

//   await client.close();
//   const duration = ((Date.now() - startTime) / 1000).toFixed(2);
//   console.log(`🏁 Completed MongoDB seed in ${duration} seconds`);
// }

// // Bootstrap
// async function run() {
//   const startTime = Date.now();
//   console.log('🔧 Initializing application context for seeding...');

//   const app = await NestFactory.createApplicationContext(AppModule);
//   const configService = app.get(ConfigService);
//   const minioStorageService = app.get(MinioStorageService);

//   try {
//     const MONGO_URI = configService.get<string>('MONGO_URI');
//     const dbName = configService.get<string>('DB_NAME');

//     if (!MONGO_URI) throw new GlobalHttpException(HttpStatus.INTERNAL_SERVER_ERROR, 'MongoDB URI is not configured');
//     if (!dbName) throw new GlobalHttpException(HttpStatus.INTERNAL_SERVER_ERROR, 'DB_NAME is not configured');

//     console.log(`🔑 MONGO_URI: ${MONGO_URI}`);
//     console.log(`🔑 DB_NAME: ${dbName}`);

//     await mongoose.connect(MONGO_URI);
//     console.log('🟢 MongoDB (Mongoose) connected');

//     await seed(minioStorageService, dbName, MONGO_URI);
//   } catch (err) {
//     console.error('❌ Seeding error', err);
//     process.exit(1); // explicitly mark failure
//   } finally {
//     await mongoose.disconnect();
//     console.log('🔌 MongoDB (Mongoose) disconnected');
//     await app.close();
//     const duration = ((Date.now() - startTime) / 1000).toFixed(2);
//     console.log(`🧹 App context closed. Total seed time: ${duration} seconds`);
//     process.exit(0); // exit cleanly
//   }
// }

// run();
