var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {

  let thatUsername;
  if (req.user!== undefined){
    thatUsername = req.user.username;
  } else thatUsername = undefined

  res.render('index', {
    title: 'Test with passport',
    username: thatUsername
  });
});

module.exports = router;
