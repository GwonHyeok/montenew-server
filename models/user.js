const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

const UserSchema = new Schema({
  username: {
    type: String,
    required: [true, '아이디가 설정되어 있지 않습니다'],
    match: /\S+@\S+\.\S+/,
    unique: true
  },
  password: {
    type: String,
    required: [true, '비밀번호가 설정되어 있지 않습니다'],
    // minlength: [6, '6자리 이상이어야 합니다'],
    // maxlength: [12, '12자리 이하여야 합니다']
  },
  name: { type: String, required: [true, '이름이 설정되어 있지 않습니다'] },
  status: { type: String, required: false },
  contact: { type: String, required: [true, '연락처가 없습니다'] },
  authority: {
    type: String,
    required: false,
    enum: ['SuperAdmin', 'Admin', 'User'],
    default: 'User',
    access: 'private'
  },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' }
});

UserSchema.virtual('isAdmin').get(function() {
  return this.authority === 'Admin' || this.authority === 'SuperAdmin';
});

UserSchema.virtual('isSuperAdmin').get(function() {
  return this.authority === 'SuperAdmin';
});

// 비밀번호 bcrypt 변환
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (err) {
    next(err);
  }
});

UserSchema.methods.isValidPassword = function(password) {
  try {
    return bcrypt.compare(password, this.password);
  } catch (err) {
    throw err;
  }
};

module.exports = mongoose.model('User', UserSchema);