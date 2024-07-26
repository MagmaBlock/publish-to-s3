import dotenv from "dotenv";
import path from "path";

dotenv.config();

export const config = {
  s3Region: process.env.S3_REGION,
  s3AccessKeyId: process.env.S3_ACCESS_KEY_ID,
  s3SecretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  s3Endpoint: process.env.S3_ENDPOINT,
  s3BucketName: process.env.S3_BUCKET_NAME,
  localFolderPath:
    process.env.LOCAL_FOLDER_PATH || path.join(process.cwd(), "dist"),
  s3DestinationPath: process.env.S3_DESTINATION_PATH || "",
};

if (
  !config.s3Region ||
  !config.s3AccessKeyId ||
  !config.s3SecretAccessKey ||
  !config.s3Endpoint ||
  !config.s3BucketName
) {
  throw new Error(
    "You did not provide one or more environment variables. Please define them or place a .env file. You can get help by reading the README.md file."
  );
}
