const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");
const { imageSize } = require("image-size");

const TWO_GB = 2 * 1024 * 1024 * 1024;
const COMPRESSION_SIZE_THRESHOLD = 1 * 1024 * 1024;
const DIMENSION_THRESHOLD = 2000;

const ensureDirectoryExistence = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const memoryUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: TWO_GB },
}).fields([{ name: "messageMedia", maxCount: 10 }]);

const processMessageMedia = () => {
  return async (req, res, next) => {
    memoryUpload(req, res, async (err) => {
      if (err) return res.status(400).json({ error: err.message });

      req.savedFiles = [];

      const isHD = req.body.isHD === "true" || req.body.isHD === true;
      const uploadPath = process.env.MESSAGE_MEDIA_PATH;
      ensureDirectoryExistence(uploadPath);

      try {
        if (req.files?.messageMedia) {
          for (const file of req.files.messageMedia) {
            const buffer = file.buffer;
            const mimeType = file.mimetype;
            const extension = path.extname(file.originalname);
            const fileName = `${
              path.parse(file.originalname).name
            }_${Date.now()}_${Math.round(Math.random() * 1e5)}${extension}`;
            const fullPath = path.join(uploadPath, fileName);

            if (mimeType.startsWith("image/")) {
              const MAX_PIXELS = 268402689; // sharp pixel limit
              // Use image-size to get dimensions safely
              const dimensions = imageSize(buffer);

              const totalPixels = dimensions.width * dimensions.height;
              if (totalPixels > MAX_PIXELS) {
                console.warn(
                  "Image exceeds sharp safe pixel limit. Skipping compression."
                );
                // Directly write the buffer as JPEG without further processing
                await sharp(buffer, { limitInputPixels: false })
                  .jpeg({ quality: 1 })
                  .toFile(fullPath);
              } else {
                const image = sharp(buffer);
                const metadata = await image.metadata();

                const shouldCompress =
                  !isHD &&
                  (file.size > COMPRESSION_SIZE_THRESHOLD ||
                    metadata.width > DIMENSION_THRESHOLD ||
                    metadata.height > DIMENSION_THRESHOLD);

                const transformer = shouldCompress
                  ? image.jpeg({ quality: 30 })
                  : image.jpeg();

                await transformer.toFile(fullPath);
              }
            } else {
              fs.writeFileSync(fullPath, buffer);
            }

            req.savedFiles.push({
              fieldName: "messageMedia",
              originalName: file.originalname,
              fileName,
              path: `${process.env.MESSAGE_MEDIA_PATH}${fileName}`,
              mimetype: file.mimetype,
            });
          }
        }

        next();
      } catch (error) {
        console.error("Upload error:", error);
        return res.status(500).json({ error: "Failed to process files" });
      }
    });
  };
};

module.exports = {
  processMessageMedia,
};
