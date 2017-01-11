var express = require('express');
var router = express.Router();
var Activity = require('../models/activity.js');
var Option = require('../models/option.js');
/* GET users listing. */
var DB_TO_HTML = true;
var HTML_TO_DB = false;
function result_formatter(rawData, format) {
  if (format === DB_TO_HTML) {
        /*
        {
          starter: 'u1',
          votetype: 'WeekDay',
          votestatus: 1,
          content: 'Mon,Tues,Wed,Thurs,Fri',
          totalnum: '0,0,0,0,0' }

      */

  var result = {};
  if (rawData.votetype == 'WeekDay') {
    //解析行和列名称
    var itemnameset = rawData.itemname.split(';');
    var colname = itemnameset[0].split(',');
    var rowname = [];
    if (itemnameset.length > 1){
      rowname = itemnameset[1].split(',');
    }
    else {
      rowname = [" "];
    }

    //解析所有人数据
    var allresultset = rawData.allresult.split(';');
    allresultset.forEach(function(val,index,arr){
      arr[index] = val.split(',');
    });

    //解析用户个人数据
    var personalresultset = rawData.personalresult.split(';');
    personalresultset.forEach(function(val,index,arr){
      arr[index] = val.split(',');
    });

    console.log('colname, rowname, allresultset, personalresult');
    console.log(colname);
    console.log(rowname);
    console.log(allresultset);
    console.log(personalresultset);

    return {starter: rawData.starter, votetype:rawData.votetype, votestatus:rawData.votestatus, colname: colname, rowname: rowname, allresult: allresultset, personalresult: personalresultset};

  }

    //return rawData;
  }
  else {
    return rawData;
  }

}

router.get('/', function(req, res, next) {
  console.log('checkActivity: req.aid, req.cookies.aid');

  //console.log(req.aid);
  console.log(req.cookies.aid);

  if((req.cookies.user !== null) && (req.cookies.aid !== null)) {
    var username = req.cookies.user.username;
    var aid = req.cookies.aid;


    Activity.getVoteData(aid, username, function (err, results) {
        req.voteinfo = result_formatter(results, DB_TO_HTML);
        req.user = req.cookies.user;
        //res.cookie("voteinfo",  , {maxAge: 1 * 600000 , httpOnly: false});
        console.log(req.voteinfo);
        res.render('checkActivity', req);
    });

  }
  else {
    res.redirect('/usrInfo');
  }



});

/*
router.post('/', function(req, res) {

  var activityname_ = req.body.activityname,
      starter_ = req.cookies.user.username,
      votetype_ = req.body.votetype;

  req.user = req.cookies.user;

  console.log(starter_);

  var content_ = "";
  var default_option = "";
  if (votetype_ === "WeekDay") {
    content_ = "Mon,Tues,Wed,Thurs,Fri";
    default_option = "0,0,0,0,0";
  }
  // status: 1 进行中  0 已停止
  var newActvity = new Activity({
      aid: 0,
      activityname: activityname_,
      starter: starter_,
      votetype: votetype_,
      votestatus: 1,
      content: content_
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

*/

module.exports = router;
