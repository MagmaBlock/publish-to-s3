import { HeadObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import fs from "fs";
import mime from "mime";
import { s3Client } from "./s3Client";
import { calculateMD5 } from "./fileUtils";
import consola from "consola";
import path from "node:path";

export const isFileInS3 = async (
  bucketName: string,
  key: string,
  localFilePath: string
): Promise<boolean> => {
  try {
    const headParams = {
      Bucket: bucketName,
      Key: path.posix.join(key),
    };

    const headData = await s3Client.send(new HeadObjectCommand(headParams));
    const localFileMD5 = await calculateMD5(localFilePath);

    return headData.ETag === `"${localFileMD5}"`;
  } catch (error: any) {
    if (error.name === "NotFound") {
      return false;
    }
    throw error;
  }
};

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
  key = path.posix.join(key);
  if (await isFileInS3(bucketName, key, filePath)) {
    consola.info(
      `File ${key} already exists in ${bucketName} and is identical. Skipping upload`
    );
    return;
  }

  const fileStream = fs.createReadStream(filePath);
  const contentType = mime.getType(filePath) || "application/octet-stream";

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

      const upload = new Upload({
        client: s3Client,
        params: uploadParams,
      });

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
      }
    }
  }
};
