var express = require('express'),
    router = express.Router(),
    User = require('../models/user.js'),
    crypto = require('crypto'),
    TITLE_LOGIN = '注册';

  router.get('/', function(req, res, next) {
      //res.send('respond with a resource');
      res.render('register', {state: 0});
  });




router.post('/', function(req, res) {
  var userName = req.body.txtUserName,
      userNickName = req.body.txtUserNickName,
      userPwd = req.body.txtUserPwd,

      md5 = crypto.createHash('md5');

      userPwd = md5.update(userPwd).digest('hex');

  var newUser = new User({
      userid: 0,
      username: userName,
      usernickname: userNickName,
      userpass: userPwd
  });

  //检查用户ID否已经存在
  User.getUserNumByName(newUser.username, function (err, results) {
    console.log('r0!!!!!' + results[0]);
    console.log('r1!!!!!!' + results[1]);
    console.log('length!!!!!' + results.length);
    console.log(results[0].num);
    console.log(results[0]);
      if (results.length > 0 & results[0].num > 0) {
          err = '用户名已存在';
      }

      if (err) {
          res.locals.error = err;
          res.render('register');
          return;
      }

      newUser.save(function (err,result) {
          if (err) {
              res.locals.error = err;
              res.render('register');
              return;
          }
          console.log(result);

          if(result.insertId > 0)
          {
              console.log('InsertID');
              console.log(result);
              console.log(result.insertId);
              res.locals.success = '注册成功,请点击   <a class="btn btn-link" href="/login" role="button"> 登录 </a>' ;
          }
          else
          {
              res.locals.error = err;
          }

          res.render('register');
          });
    });
});



module.exports = router;
