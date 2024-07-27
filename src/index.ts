#!/usr/bin/env node

import path from "node:path";
import { config } from "./config";
import { collectFiles } from "./fileUtils";
import { uploadFileToS3 } from "./uploadUtils";
import { consola } from "consola";

const main = async () => {
  const startTime = Date.now();
  consola.start(
    `Preparing to upload files to the S3 bucket "${config.s3BucketName}"`
  );
  consola.info(
    `All files in "${path.join(
      config.localFolderPath
    )}" will be uploaded to "${path
      .join(config.s3BucketName!, config.s3DestinationPath)
      .replace(/\\/g, "/")}"`
  );

  const filesToUpload = collectFiles(config.localFolderPath);
  consola.info(`Found ${filesToUpload.length} files to upload`);

  const uploadTasks = filesToUpload.map((file) => {
    uploadFileToS3({
      bucketName: config.s3BucketName!,
      key: path.join(config.s3DestinationPath, file.key),
      filePath: file.filePath,
    });
  });

  await Promise.all(uploadTasks);

  consola.success(`Uploading completed in ${Date.now() - startTime}ms.`);
};

main().catch(consola.error);
