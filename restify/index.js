const express = require('express');
const router = express.Router();
const restify = require('express-restify-mongoose');
const compose = require('compose-middleware').compose;

// Middleware
const needAdmin = require('../restify/middleware/needAdmin');
const needAuthenticated = require('../restify/middleware/needAuthenticated');

// Mongoose Models
const User = require('../models/user');
const Company = require('../models/company');
const KeyWord = require('../models/keyword');
const Report = require('../models/report');
const Solution = require('../models/solution');
const Media = require('../models/media');

class Restify {

  initialize() {

    // Restify Default Options
    restify.defaults({
      prefix: '/api',
      version: '/v1',
      outputFn: (req, res) => {
        const result = req.erm.result;
        const statusCode = req.erm.statusCode;

        return res.status(statusCode).json({ data: result });
      },
      access: (req) => {
        if (req.isAuthenticated()) {
          return req.user.authority === 'SuperAdmin' || req.user.authority === 'Admin' ? 'private' : 'protected'
        } else {
          return 'public'
        }
      }
    });

    // Restify User
    restify.serve(router, User, {
      findOneAndUpdate: false,
      preUpdate: compose([
        needAuthenticated,
        (req, res, next) => {

          // 유저 정보를 업데이트 할때 권한이 있으면 모든 유저를 수정 할 수 있다
          if (req.user.isAdmin) return next();

          // 일반 유저일 경우에 자기 자신의 데이터만 수정 가능하다
          if (req.erm.document._id !== req.user._id) {
            const err = new Error('해당 유저의 정보를 수정할 수 있는 권한이 없습니다.');
            err.status = 401;
            return next(err);
          }

          next()
        }
      ])
    });

    // Restify Company
    restify.serve(router, Company, {});

    // Restify KeyWord
    restify.serve(router, KeyWord, {});

    // Restify Report
    restify.serve(router, Report, {});

    // Restify Solution
    restify.serve(router, Solution, {
      preMiddleware: (req, res, next) => {
        if (!req.isAuthenticated()) {
          req.erm.statusCode = 401;
          return next(new Error('인증된 유저만 사용할 수 있는 API 입니다'));
        }
        next();
      },
      preCreate: needAdmin,
      preUpdate: needAdmin,
      preDelete: needAdmin
    });

    // Restify Solution
    restify.serve(router, Media, {});

    return router;
  }
}

module.exports = new Restify();