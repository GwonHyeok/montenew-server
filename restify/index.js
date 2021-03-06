const express = require('express');
const router = express.Router();
const restify = require('express-restify-mongoose');
const compose = require('compose-middleware').compose;
const util = require('util');

// Middleware
const needAdmin = require('../restify/middleware/needAdmin');
const needAuthenticated = require('../restify/middleware/needAuthenticated');

// Mongoose Models
const User = require('../models/user');
const Company = require('../models/company');
const KeyWord = require('../models/keyword');
const KeyWordLog = require('../models/keywordLog');
const Report = require('../models/report');
const Solution = require('../models/solution');
const Media = require('../models/media');
const MediaLog = require('../models/mediaLog');
const Feedback = require('../models/feedback');

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
      totalCountHeader: true,
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
      ]),
      preDelete: compose([
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
      ]),
      postRead: compose([
        (req, res, next) => {
          Feedback.populate(req.erm.result,
            [
              { path: 'company.manager', model: 'User', select: '_id name contact' },
            ], (err, doc) => {
              if (err) return next(err);
              next();
            });
        }
      ])
    });

    // Restify Company
    restify.serve(router, Company, {
      lean: false,
      postRead: function(req, res, next) {

        Company.populate(req.erm.result, {
          path: 'keywords.logs', model: 'KeyWordLog'
        }, (err, doc) => {
          if (err) return next(err);
          next();
        })
      }
    });

    // Restify KeyWord
    restify.serve(router, KeyWord, {});

    // Restify Report
    restify.serve(router, Report, {
      totalCountHeader: true,
      findOneAndRemove: false,
      contextFilter: (model, req, done) => {
        if (req.user.isAdmin) return done(model.find({}));

        done(model.find({ company: req.user.company }))
      },
      preRead: compose([
        needAuthenticated
      ]),
      preCreate: compose([
        needAdmin,
        (req, res, next) => {
          req.body.author = req.user._id;
          next();
        }
      ]),
      preUpdate: compose([
        needAdmin
      ]),
      preDelete: compose([
        needAdmin,
        (req, res, next) => {
          Company.findById(req.erm.document.company)
            .then(company => {
              const index = company.reports.indexOf(req.erm.document._id);
              if (index !== -1) company.reports.splice(index, 1);
              return company.save()
            })
            .then(_ => next())
            .catch(next)
        }
      ]),
      postCreate: compose(
        (req, res, next) => {
          Company.findById(req.erm.result.company)
            .then(company => {
              company.reports.push(req.erm.result._id);
              return company.save()
            })
            .then(company => next())
            .catch(next)
        }
      ),
      postRead: compose([
        (req, res, next) => {
          if (util.isArray(req.erm.result)) {
            req.erm.result.map(feedback => {
              if (util.isObject(feedback.author)) delete feedback.author.password;
              return feedback;
            })
          } else {
            if (util.isObject(req.erm.result.author)) delete req.erm.result.author.password;
          }
          next();
        }
      ])
    });

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
    restify.serve(router, MediaLog, {});

    // Feedback
    restify.serve(router, Feedback, {
      totalCountHeader: true,
      contextFilter: (model, req, done) => {
        if (req.user.isAdmin) return done(model.find({}));

        done(model.find({ company: req.user.company }))
      },
      preRead: compose([
        needAuthenticated
      ]),
      preCreate: compose([
        needAuthenticated,
        (req, res, next) => {
          req.body.author = req.user._id;

          // 일반 유저이고, 회사 정보가 없을 경우에 피드백 글에 자기 회사 정보를 추가한다
          if (!req.user.isAdmin && !req.body.company) {
            req.body.company = req.user.company
          }

          next();
        }
      ]),
      postRead: compose([
        (req, res, next) => {
          Feedback.populate(req.erm.result,
            [
              { path: 'company.manager', model: 'User', select: '_id name contact' },
            ], (err, doc) => {
              if (err) return next(err);
              next();
            });
        },
        (req, res, next) => {
          if (util.isArray(req.erm.result)) {
            req.erm.result.map(feedback => {
              if (util.isObject(feedback.author)) delete feedback.author.password;
              return feedback;
            })
          } else {
            if (util.isObject(req.erm.result.author)) delete req.erm.result.author.password;
          }
          next();
        }
      ])
    });

    return router;
  }
}

module.exports = new Restify();
