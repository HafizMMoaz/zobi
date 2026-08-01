const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const config = require('../../../config.json');

router.get('/', function (req, res) {
  let numTokens = req.query.sockets ? Number(req.query.sockets) : 100;
  let tokens = [];
  for (let i = 0; i < numTokens; i++) {
    const token = jwt.sign({ channel: String(i) }, config.jwtSecret);
    tokens.push(token);
  }

  res.render('index', {
    tokens: JSON.stringify(tokens),
    c: config.jwtCookieName,
  });
});

module.exports = router;
