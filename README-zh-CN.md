# ☁️publish-to-s3

[English](./README.md) | [简体中文](./README-zh-CN.md)

使用一个脚本轻松将静态站点部署至 S3 存储桶。

## 最佳实践

本脚本可以配合 GitHub Action、Jenkins、Vercel、Cloudflare Pages 等服务 / 应用轻松实现基于 S3 的静态网站托管，你只需要在构建后额外调用本脚本即可。尽管这些服务中很多已经提供了站点托管，但他们的网络并未覆盖到世界上的所有地区。因此当你试图优化你的静态站点时，你会发现还是使用自己的 CDN 更加合适。

本脚本仅适合非 SSR（服务端侧渲染）的静态站点，其特征是前端可以独立构建，且构建成品中通常只包含 .html、.css、.js、图片等静态资源。各种常见的静态博客生成器如 Hexo、Astro、Jekyll 生成的博客，静态文档生成器如 VitePress、Docusaurus 生成的文档网站都能完美支持。非 Node.js 的静态站点同样也可以使用本程序。脚本的主要功能就是将这些静态资源传至 S3。

本脚本使用 AWS SDK，支持所有标准 S3 协议。

### 功能特性

- 覆盖上传，本脚本没有任何删除逻辑，仅仅将本地的所有文件上传至 S3。
- 多线程，并发上传，提高上传效率。
- 失败重传，文件上传失败触发重传，最大重试次数为 5 次。
- 多种环境变量配置方式，支持 `.env` 文件和真环境变量。
- npm 脚本直接运行，无需修改程序代码，支持非 Node.js 项目。

## 本地使用方法

### 第一步：配置环境变量

本脚本通过环境变量进行配置，支持 `.env` 文件和真环境变量。`.env` 的书写请参考 `.env.example`；

请注意：如果你的源码是公开的，那么请你在你项目的 `.gitignore` 中忽略 `.env` 文件。否则**所有人**都将可见你的密钥信息。

#### 环境变量列表

```
# S3 相关配置。不同的云服务商各有不同，请参考相应云服务商的文档。
S3_REGION=oss-cn-shanghai
S3_ACCESS_KEY_ID=YourAccessKey
S3_SECRET_ACCESS_KEY=YourSecretAccessKey
S3_ENDPOINT=https://endpoint.example.com
S3_BUCKET_NAME=target-bucket
# 此项填写你的静态站点构建成品目录，一般都是 dist 不用修改。
LOCAL_FOLDER_PATH=./dist
# 此项填写构建成品目录中的文件应该被上传到 S3 的哪个目录下。默认为根目录。
S3_DESTINATION_PATH=
```

### 第二步：手动运行脚本

你必须已经安装好了 Node.js 和 npm，然后在你需要上传 ./dist 目录的目录下运行：

```bash
# npm
npx publish-to-s3@latest
# 或者使用 pnpm
pnpx publish-to-s3@latest
```

npm 将自动下载本脚本并运行。观察控制台输出：

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

若一切正常，那么你就可以在 S3 中看到你的静态站点了。

## 持续部署服务使用方法

你可以使用 GitHub Action、Jenkins、Vercel、Cloudflare Pages 等持续部署服务 / 自动化应用程序轻松实现基于 S3 的静态网站托管。当你的 Git 推送后，这些服务会自动拉取你的源码，然后执行你设定的命令。

你应该为项目配置环境变量，通常在构建设置界面中都有环境变量的配置功能。

```bash
# 你可以配置类似这种构建命令：
pnpm run build && pnpx publish-to-s3@latest
```
