import { promises as fs } from 'fs';
import path from 'path';

/**
 * מחלקה לניהול אחסון קבצים (PDF/CSV)
 * ניתן להחליף ל-S3 בעתיד
 */
export class FileStorage {
  private baseDir: string;

  constructor() {
    this.baseDir = path.join(process.cwd(), 'public', 'orders');
  }

  async ensureDir(): Promise<void> {
    try {
      await fs.mkdir(this.baseDir, { recursive: true });
    } catch (error) {
      console.error('Error creating directory:', error);
    }
  }

  async saveFile(
    filename: string,
    content: Buffer | string
  ): Promise<string> {
    await this.ensureDir();
    const filePath = path.join(this.baseDir, filename);
    await fs.writeFile(filePath, content);
    return `/orders/${filename}`;
  }

  async getFile(filename: string): Promise<Buffer> {
    const filePath = path.join(this.baseDir, filename);
    return await fs.readFile(filePath);
  }

  async deleteFile(filename: string): Promise<void> {
    const filePath = path.join(this.baseDir, filename);
    await fs.unlink(filePath);
  }
}

export const storage = new FileStorage();
