const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const path = require('path');

const AWS = require('aws-sdk');
AWS.config.region = 'ap-northeast-2';
AWS.config.setPromisesDependency(global.Promise);

const s3 = new AWS.S3();

const multer = require('multer');
const multerS3 = require('multer-s3');
const upload = multer({
  storage: multerS3({
    s3: s3,
    acl: 'public-read',
    bucket: 'storage.montenew.com',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    // contentDisposition: 'attachment',
    metadata: function(req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function(req, file, cb) {
      const name = file.originalname;
      const filename = `${crypto.createHash('md5').update(Date.now() + name).digest('hex')}${path.extname(name)}`;
      cb(null, `${req.params.type}/${filename}`)
    }
  })
});

// 모델
const Attachment = require('../models/attachment');

/**
 * 파일 업로드
 */
router.post('/:type',
  function(req, res, next) {
    if (req.params.type !== 'solution' && req.params.type !== 'report') { // 타입 검증
      const err = new Error('지원하지 않는 업로드 타입입니다');
      err.status = 403;
      return next(err)
    }

    next();
  },
  upload.single('attachment'),
  async (req, res, next) => {
    const attachments = new Attachment(req.file);
    await attachments.save();
    res.json({ data: attachments });
  });

module.exports = router;
