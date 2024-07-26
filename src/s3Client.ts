import { S3Client } from "@aws-sdk/client-s3";
import { config } from "./config";

export const s3Client = new S3Client({
  region: config.s3Region,
  credentials: {
    accessKeyId: config.s3AccessKeyId!,
    secretAccessKey: config.s3SecretAccessKey!,
  },
  endpoint: config.s3Endpoint,
});
