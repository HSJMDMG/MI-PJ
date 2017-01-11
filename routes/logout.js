var express = require('express');
var router = express.Router();


router.get('/logout', function (req,res){
  console.log('I am logout!!')
  //删除Cookie
  res.clearCookie('user');
  res.redirect('/');

});

module.exports = router;
