var express = require('express'),
    router = express.Router(),
    User = require('../models/user.js'),
    Option = require('../models/option.js'),
    Activity = require('../models/activity.js'),
    crypto = require('crypto'),
    TITLE_LOGIN = '登录';


router.get('/', function(req, res) {
  if(req.cookies.user !== null && typeof(req.cookies.user) !== "undefined"){
    req.user=req.cookies.user;
    console.log(req.user);
/*
    var username = req.cookies.user.username;

    console.log(username);

    Option.getActivityByUsername(username, function (err, results) {
        console.log(results);
        console.log('login: check user & act!');
        req.useractivity = results;
    });

*/
    res.redirect('usrInfo');



    //res.render('usrInfo', req);
  }
  else {
    res.render('login');
  }

});

router.post('/', function(req, res) {
    var userName = req.body.txtUserName,
        userPwd = req.body.txtUserPwd,
        isRem = req.body.chbRem,
        md5 = crypto.createHash('md5');

    console.log(userName);


    User.getUserByUserName(userName, function (err, results) {
        console.log(results);


        if(results.length === 0 )
        {
            res.locals.error = '用户不存在';
             res.render('login');
             return;
        }

        console.log(results);

         userPwd = md5.update(userPwd).digest('hex');
         if(results[0].username != userName || results[0].password != userPwd)
         {
             res.locals.error = '用户名或密码有误';
             res.render('login');
             console.log(1);
             return;
         }
         else
         {
             if(isRem)
             {
                res.cookie('islogin', userName, { maxAge:  5 * 60000 });
             }

             res.cookie("user", {username: userName}, {maxAge: 30 * 600000 , httpOnly: false});

             res.redirect('/usrInfo');

             return;
         }
    });
});

module.exports = router;
