const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// Configure Premium Storage
const multerStorage = multer.memoryStorage();

// Logic for Image Filtering
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new Error('SECURITY PROTOCOL: ONLY IMAGE ASSETS ARE AUTHORIZED'), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB High-Res limit
});

// Premium Image Processing Middleware
const processImage = async (req, res, next) => {
  if (!req.file) return next();

  // Create customized filename
  const filename = `PROD_${Date.now()}_${Math.round(Math.random() * 1e9)}.webp`;
  req.file.filename = filename;

  const uploadPath = path.join(__dirname, '../uploads/products');

  // Ensure directory existence
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  try {
    await sharp(req.file.buffer)
      .resize(1800, 1800, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .toFormat('webp')
      .webp({ quality: 85, effort: 6 })
      .toFile(path.join(uploadPath, filename));

    next();
  } catch (error) {
    next(new Error('ASSET PROCESSING FAILURE: OPTIMIZATION FAILED'));
  }
};

const processMultipleImages = async (req, res, next) => {
  if (!req.files || req.files.length === 0) return next();

  const uploadPath = path.join(__dirname, '../uploads/products');
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  req.body.images = [];

  try {
    await Promise.all(
      req.files.map(async (file, i) => {
        const filename = `PROD_${Date.now()}_${i}_${Math.round(Math.random() * 1e9)}.webp`;
        
        await sharp(file.buffer)
          .resize(1800, 1800, { fit: 'inside', medical: false })
          .toFormat('webp')
          .webp({ quality: 85 })
          .toFile(path.join(uploadPath, filename));

        req.body.images.push(`/uploads/products/${filename}`);
      })
    );
    next();
  } catch (error) {
    next(new Error('ASSET BATCH PROCESSING FAILURE: OPTIMIZATION FAILED'));
  }
};

module.exports = {
  uploadSingle: upload.single('image'),
  uploadArray: upload.array('images', 5),
  processImage,
  processMultipleImages
};

