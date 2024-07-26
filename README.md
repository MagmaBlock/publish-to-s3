# ☁️publish-to-s3

[English](./README.md) | [简体中文](./README-zh-CN.md)

Effortlessly deploy your static site to any S3 bucket with a single script.

## Best Practices

This script can be easily integrated with services/applications like GitHub Action, Jenkins, Vercel, Cloudflare Pages, etc., to achieve S3-based static website hosting. You only need to call this script after the build process. Although many of these services already offer site hosting, their networks do not cover all regions globally. Therefore, when optimizing your static site, you might find it more suitable to use your own CDN.

This script is suitable for static sites that do not use SSR (Server-Side Rendering). These sites can be independently built on the frontend, and the build output usually contains only static resources like .html, .css, .js, images, etc. Common static blog generators like Hexo, Astro, Jekyll, and static documentation generators like VitePress, Docusaurus can all be perfectly supported. Non-Node.js static sites can also use this script. The main function of the script is to upload these static resources to S3.

The script uses AWS SDK and supports all standard S3 protocols.

### Features

- Overwrite upload: This script does not contain any deletion logic; it simply uploads all local files to S3.
- Multi-threaded, concurrent uploads to improve upload efficiency.
- Retry on failure: Triggers retransmission of failed file uploads, with a maximum of 5 retries.
- Multiple environment variable configuration methods, supporting both `.env` files and real environment variables.
- Run directly via npm scripts without modifying the program code, supporting non-Node.js projects.

## Local Usage

### Step 1: Configure Environment Variables

This script is configured via environment variables, supporting both `.env` files and real environment variables. See example `.env.example`.

Note: If your source code is public, make sure to ignore the `.env` file in your `.gitignore`. Otherwise, **everyone** will be able to see your private information.

#### List of Environment Variables

```
# S3 configuration. Different cloud providers have different requirements, please refer to the respective documentation.
S3_REGION=oss-cn-shanghai
S3_ACCESS_KEY_ID=YourAccessKey
S3_SECRET_ACCESS_KEY=YourSecretAccessKey
S3_ENDPOINT=https://endpoint.example.com  
S3_BUCKET_NAME=target-bucket
# Specify the build output directory of your static site, usually 'dist' doesn't need modification.
LOCAL_FOLDER_PATH=./dist
# Specify the directory in S3 where the build output should be uploaded. Defaults to the root directory.
S3_DESTINATION_PATH=
```

### Step 2: Manually Run the Script

Ensure you have Node.js and npm installed, then run the following in the directory where you need to upload the `./dist` directory:

```bash
# Using npm
npx publish-to-s3
# Or using pnpm
pnpx publish-to-s3
```

npm will automatically download and run this script. Observe the console output:

```log
◐ Preparing to upload files to the S3 bucket "magma-ink-production"                   1:37:32 AM
ℹ All files in "C:\Projects\MagmaInk\dist" will be uploaded to "."                     1:37:32 AM
ℹ Found 626 files to upload                                                            1:37:33 AM
✔ Uploaded archive\tag\ffmpeg\index.html to magma-ink-production in 1219ms            1:37:34 AM
✔ Uploaded archive\tag\cloudreve\index.html to magma-ink-production in 1217ms         1:37:34 AM
✔ Uploaded archive\tag\windows\index.html to magma-ink-production in 1217ms           1:37:34 AM
✔ Uploaded archive\tag\动画\index.html to magma-ink-production in 1213ms              1:37:34 AM
✔ Uploaded archive\category\DEBUG\index.html to magma-ink-production in 1211ms        1:37:34 AM
✔ Uploaded archive\tag\mysql\index.html to magma-ink-production in 1218ms             1:37:34 AM
✔ Uploaded archive\tag\http\index.html to magma-ink-production in 1212ms              1:37:34 AM
✔ Uploaded archive\tag\2020\index.html to magma-ink-production in 1237ms              1:37:34 AM
✔ Uploaded archive\tag\wordpress\index.html to magma-ink-production in 1236ms         1:37:34 AM
...
✔ Uploading completed in 11646ms.
```

If everything is correct, you will see your static site in S3.

## Usage with Continuous Deployment Services

You can use GitHub Action, Jenkins, Vercel, Cloudflare Pages, and other continuous deployment services/automation applications to easily achieve S3-based static website hosting. When your Git is pushed, these services will automatically pull your source code and execute the commands you set.

You should configure environment variables for the project, usually available in the build settings interface.

```bash
# You can configure a build command like this:
pnpm run build && pnpx publish-to-s3
```