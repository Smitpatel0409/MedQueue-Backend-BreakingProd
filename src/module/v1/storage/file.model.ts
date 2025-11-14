import { Buffer } from 'buffer';

export interface BufferedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: AppMimeType;
  size: number;
  buffer: Buffer | string;
}


export type AppMimeType =
  | 'image/png'
  | 'image/jpeg'
  | 'image/webp'
  |'application/pdf'
  |'image/jpg';