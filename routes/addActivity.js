var express = require('express');
var router = express.Router();
var Activity = require('../models/activity.js');
var Option = require('../models/option.js');
/* GET users listing. */
router.get('/', function(req, res, next) {
  if(req.cookies.user !== null){
    req.user=req.cookies.user;
    res.render('addActivity', req);
  }
  else {
    res.render('/');
  }



});

router.post('/', function(req, res) {

  var activityname_ = req.body.activityname,
      starter_ = req.cookies.user.username,
      votetype_ = req.body.votetype;

  req.user = req.cookies.user;

  console.log(starter_);

  var content_ = "";
  var default_option = "";
  var default_totalnum = ""
  if (votetype_ === "WeekDay") {
    content_ = "Mon,Tues,Wed,Thurs,Fri";
    default_option = "0,0,0,0,0";
    default_totalnum = "0,0,0,0,0";
  }
  // status: 1 进行中  0 已停止
  var newActvity = new Activity({
      aid: 0,
      activityname: activityname_,
      starter: starter_,
      votetype: votetype_,
      votestatus: 1,
      content: content_,
      totalnum: default_totalnum
  });
  console.log(newActvity);

  newActvity.save(function (err,result) {
      if (err) {
          res.locals.error = err;
          res.render('addActivity');
          return;
      }
      console.log(result);

      if(result.insertId > 0)
      {
          console.log('InsertID');
          console.log(result);
          console.log(result.insertId);

          var newOption = new Option({
            oid: 0,
            aid: result.insertId,
            username: starter_,
            content: default_option
            }
          );

          newOption.save(function (err,result) {
            if (err) {
                res.locals.error = err;
                res.render('addActivity');
                return;
            }
          });

          //res.redirect('/usrInfo')

/*
          var username = req.cookies.user.username;

          console.log(username);


          Option.getActivityByUsername(username, function (err, results) {
              console.log(results);
              console.log('addActivity: check user & act!');
              req.useractivity = results;
          });

*/
          res.redirect('usrInfo');


          return;
      }
      else
      {
          res.locals.error = err;
      }

      res.render('addActivity');
      });



});


module.exports = router;
