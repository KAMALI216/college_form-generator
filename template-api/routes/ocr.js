const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const router = express.Router();

const uploadDir = path.resolve(__dirname, '..', 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });

const allowedExtensions = new Set(['.pdf', '.jpg', '.jpeg', '.png']);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const safeName = path.basename(file.originalname, path.extname(file.originalname)).replace(/[^a-z0-9_-]/gi, '_');
    cb(null, `${safeName}-${uniqueSuffix}${path.extname(file.originalname).toLowerCase()}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();

    if (!allowedExtensions.has(extension)) {
      const error = new Error('Only .pdf, .jpg, .jpeg, and .png files are allowed');
      error.statusCode = 400;
      return cb(error);
    }

    return cb(null, true);
  },
});

router.post('/upload', (req, res) => {
  upload.single('formFile')(req, res, (error) => {
    if (error) {
      return res.status(error.statusCode || 400).json({ message: error.message });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'formFile is required' });
    }

    return res.status(200).json({
      message: 'File uploaded',
      filePath: req.file.path,
    });
  });
});

module.exports = router;