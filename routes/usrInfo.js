var express = require('express'),
    router = express.Router(),
    crypto = require('crypto'),
    Option = require('../models/option.js'),
    Activity = require('../models/activity.js'),
    TITLE_LOGIN = '用户信息';

router.get('/', function(req, res) {
  if(req.cookies.user !== null){

    console.log('Reach /usrInfo');
    req.user=req.cookies.user;

    var username = req.cookies.user.username;

    console.log(username);


    Option.getActivityByUsername(username, function (err, results) {
        req.useractivity = results;
        console.log('usrInfo: get usr & act');
        console.log(results);
        res.render('usrInfo', req);
    });




  }
  else {
    res.render('/');
  }

});

router.get('/logout', function (req,res,next){
  //删除Cookie
  res.clearCookie('user');
  res.redirect('/');

});

router.post('/', function(req, res) {
    //req.aid = req.body.aid;
    console.log('usrInfo: aid-->chech act');
    //console.log(req.aid);
    res.cookie("aid", req.body.aid, {maxAge: 5 * 600000 , httpOnly: false});
    var aid = req.body.aid;
    var username = req.cookies.user.username;

    Option.checkEmptyOption(aid, username, function(err, result) {
      console.log('miaomiaomiao?!');
      if (err) {
          res.locals.error = err;
          res.render('/userInfo');
          return;
      }

      res.redirect('/checkActivity');

    });
    //req.cookies.aid = req.aid;
    //console.log(req.body);
    //console.log(req);


});



module.exports = router;
