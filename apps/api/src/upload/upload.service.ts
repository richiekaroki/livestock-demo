import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads'));

@Injectable()
export class UploadService {
  constructor() {
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }
  }

  getUploadPath(filename: string): string {
    return path.join(UPLOAD_DIR, filename);
  }

  getPublicUrl(filename: string): string {
    return `/uploads/${filename}`;
  }

  saveFile(file: Express.Multer.File): { url: string; filename: string } {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
    const filePath = this.getUploadPath(uniqueName);

    fs.writeFileSync(filePath, file.buffer);

    return {
      url: this.getPublicUrl(uniqueName),
      filename: uniqueName,
    };
  }
}
