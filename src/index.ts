#!/usr/bin/env node

/**
 * Entry point for the file upload utility
 * Implements functionality to upload local files to a specified S3 bucket
 */

import path from "node:path";
import { config } from "./config";
import { collectFiles } from "./fileUtils";
import { uploadFileToS3 } from "./uploadUtils";
import { consola } from "consola";

/**
 * Main function: Handles the file upload process
 * 1. Collects local files
 * 2. Uploads files to S3 in parallel
 * 3. Displays upload progress and results
 */
const main = async () => {
  const startTime = Date.now();

  // Display initial upload task information
  consola.start(
    `Preparing to upload files to the S3 bucket "${config.s3BucketName}"`
  );

  // Display local and target path information
  const localPath = path.join(config.localFolderPath);
  const s3Path = path
    .join(config.s3BucketName!, config.s3DestinationPath)
    .replace(/\\/g, "/");
  consola.info(`All files in "${localPath}" will be uploaded to "${s3Path}"`);

  // Collect files that need to be uploaded
  const filesToUpload = collectFiles(config.localFolderPath);
  consola.info(`Found ${filesToUpload.length} files to upload`);

  // Create array of upload tasks
  const uploadTasks = filesToUpload.map((file) =>
    uploadFileToS3({
      bucketName: config.s3BucketName!,
      key: path.join(config.s3DestinationPath, file.key),
      filePath: file.filePath,
    })
  );

  // Execute all upload tasks in parallel
  await Promise.all(uploadTasks);

  // Display completion information
  const duration = Date.now() - startTime;
  consola.success(`Uploading completed in ${duration}ms.`);
};

// Run main function and handle errors
main().catch((error) => {
  consola.error("Upload failed:", error);
  process.exit(1);
});
