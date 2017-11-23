const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AttachmentSchema = new Schema({
  fieldname: String,
  originalname: String,
  encoding: String,
  mimetype: String,
  size: Number,
  bucket: String,
  key: String,
  acl: String,
  contentType: String,
  contentDisposition: String,
  storageClass: String,
  serverSideEncryption: String,
  metadata: Object,
  location: String,
  etag: String
});

module.exports = mongoose.model('Attachment', AttachmentSchema);