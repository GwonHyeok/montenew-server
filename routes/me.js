const express = require('express');
const router = express.Router();
const passport = require('passport');

router.get('/', passport.authenticate('bearer'), async (req, res) => {
  if (req.isAuthenticated()) {
    return res.status(200).json({
      data: {
        name: req.user.name,
        username: req.user.username

      }
    });
  }

  res.status(401).json({ error: 'is not authorized' })
});

module.exports = router;
