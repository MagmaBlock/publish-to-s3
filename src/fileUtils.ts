import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface FileInfo {
  key: string;
  filePath: string;
}

export const calculateMD5 = (filePath: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('md5');
    const stream = fs.createReadStream(filePath);
    stream.on('data', (data) => hash.update(data));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
};

export const collectFiles = (folderPath: string, basePath = ''): FileInfo[] => {
  const files = fs.readdirSync(folderPath);
  let fileList: FileInfo[] = [];

  for (const file of files) {
    const filePath = path.join(folderPath, file);
    const fileStat = fs.statSync(filePath);

    if (fileStat.isFile()) {
      const key = path.join(basePath, file);
      fileList.push({ key, filePath });
    } else if (fileStat.isDirectory()) {
      fileList = fileList.concat(
        collectFiles(filePath, path.join(basePath, file))
      );
    }
  }

  return fileList;
};