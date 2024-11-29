/**
 * S3 File Upload Utilities
 * Provides functionality for file uploads and existence checks
 */

import { HeadObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import fs from "fs";
import mime from "mime";
import { s3Client } from "./s3Client";
import { calculateMD5 } from "./fileUtils";
import consola from "consola";

/**
 * Check if a file already exists in the S3 bucket
 * Compares MD5 hash of local file with S3 ETag to determine if files are identical
 * 
 * @param bucketName - Name of the S3 bucket
 * @param key - The key (path) of the file in S3
 * @param localFilePath - Path to the local file
 * @returns Promise<boolean> - Whether the file exists and has identical content
 */
export const isFileInS3 = async (
  bucketName: string,
  key: string,
  localFilePath: string
): Promise<boolean> => {
  try {
    // Build HeadObject request parameters
    const headParams = {
      Bucket: bucketName,
      Key: key.replace(/\\/g, "/"),
    };

    // Get S3 object metadata
    const headData = await s3Client.send(new HeadObjectCommand(headParams));
    // Calculate MD5 hash of local file
    const localFileMD5 = await calculateMD5(localFilePath);

    // Compare ETag (MD5) values
    return headData.ETag === `"${localFileMD5}"`;
  } catch (error: any) {
    if (error.name === "NotFound") {
      return false;
    }
    throw error;
  }
};

/**
 * Upload a file to S3 bucket
 * Supports automatic retries and content type detection
 * 
 * @param options - Upload options
 * @param options.bucketName - Name of the S3 bucket
 * @param options.key - The key (path) of the file in S3
 * @param options.filePath - Path to the local file
 * @param options.maxRetries - Maximum number of retry attempts (defaults to 3)
 */
export const uploadFileToS3 = async ({
  bucketName,
  key,
  filePath,
  maxRetries = 3,
}: {
  bucketName: string;
  key: string;
  filePath: string;
  maxRetries?: number;
}): Promise<void> => {
  // Normalize path separators to forward slashes
  key = key.replace(/\\/g, "/");

  // Check if file already exists and has identical content
  if (await isFileInS3(bucketName, key, filePath)) {
    consola.info(
      `File ${key} already exists in ${bucketName} and is identical. Skipping upload`
    );
    return;
  }

  // Create file read stream
  const fileStream = fs.createReadStream(filePath);
  // Detect content type based on file extension
  const contentType = mime.getType(filePath) || "application/octet-stream";

  // Build upload parameters
  const uploadParams = {
    Bucket: bucketName,
    Key: key,
    Body: fileStream,
    ContentType: contentType,
  };

  let retries = 0;
  while (retries < maxRetries) {
    try {
      const start = Date.now();

      // Use Upload class for handling large file uploads
      const upload = new Upload({
        client: s3Client,
        params: uploadParams,
      });

      // Wait for upload to complete
      await upload.done();
      consola.success(
        `Uploaded ${key} to ${bucketName} in ${Date.now() - start}ms`
      );
      return;
    } catch (error) {
      retries++;
      consola.warn(
        `Error uploading ${key}, attempt ${retries} of ${maxRetries}:`,
        error
      );
      if (retries === maxRetries) {
        consola.error(`Failed to upload ${key} after ${maxRetries} attempts`);
        throw error; // Throw error after all retries are exhausted
      }
    }
  }
};
