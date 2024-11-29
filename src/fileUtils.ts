/**
 * File Processing Utilities
 * Provides functionality for file collection and MD5 calculation
 */

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

/**
 * File information interface
 * @property key - The key (path) of the file in S3
 * @property filePath - The complete local path of the file
 */
export interface FileInfo {
  key: string;
  filePath: string;
}

/**
 * Calculate MD5 hash of a file
 * Used for file integrity verification and change detection
 *
 * @param filePath - Complete path to the file
 * @returns Promise<string> - MD5 hash of the file (hexadecimal string)
 */
export const calculateMD5 = (filePath: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash("md5");
    const stream = fs.createReadStream(filePath);

    stream.on("data", (data) => hash.update(data));
    stream.on("end", () => resolve(hash.digest("hex")));
    stream.on("error", (error) => {
      reject(
        new Error(`Failed to calculate MD5 for ${filePath}: ${error.message}`)
      );
    });
  });
};

/**
 * Recursively collect all files in a folder
 *
 * @param folderPath - Path to the folder to scan
 * @param basePath - Base path (used for building relative paths, defaults to empty string)
 * @returns FileInfo[] - Array of file information objects
 */
export const collectFiles = (folderPath: string, basePath = ""): FileInfo[] => {
  const files = fs.readdirSync(folderPath);
  let fileList: FileInfo[] = [];

  for (const file of files) {
    const filePath = path.join(folderPath, file);
    const fileStat = fs.statSync(filePath);

    if (fileStat.isFile()) {
      // If it's a file, add it to the list
      const key = path.join(basePath, file).replace(/\\/g, "/");
      fileList.push({ key, filePath });
    } else if (fileStat.isDirectory()) {
      // If it's a directory, process recursively
      fileList = fileList.concat(
        collectFiles(filePath, path.join(basePath, file))
      );
    }
  }

  return fileList;
};
