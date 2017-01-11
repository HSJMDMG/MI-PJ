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
            if (itemnameset.length > 1) {
                rowname = itemnameset[1].split(',');
            } else {
                rowname = [" "];
            }

            //解析所有人数据
            var allresultset = rawData.allresult.split(';');
            allresultset.forEach(function(val, index, arr) {
                arr[index] = val.split(',');
            });

            //解析用户个人数据
            var personalresultset = rawData.personalresult.split(';');
            personalresultset.forEach(function(val, index, arr) {
                arr[index] = val.split(',');
            });

            console.log('colname, rowname, allresultset, personalresult');
            console.log(colname);
            console.log(rowname);
            console.log(allresultset);
            console.log(personalresultset);

            return {
                starter: rawData.starter,
                votetype: rawData.votetype,
                votestatus: rawData.votestatus,
                colname: colname,
                rowname: rowname,
                allresult: allresultset,
                personalresult: personalresultset,
                origincontent: rawData.personalresult
            };
            //return rawData;
        } else {
            return rawData;
        }

    }
}

router.get('/', function(req, res, next) {
    console.log('checkActivity: req.aid, req.cookies.aid');

    //console.log(req.aid);
    console.log(req.cookies.aid);

    if ((req.cookies.user !== null) && (req.cookies.aid !== null)) {
        var username = req.cookies.user.username;
        var aid = req.cookies.aid;
        Activity.getVoteData(aid, username, function(err, results) {
            req.voteinfo = result_formatter(results, DB_TO_HTML);
            req.user = req.cookies.user;
            //res.cookie("voteinfo",  , {maxAge: 1 * 600000 , httpOnly: false});
            console.log(req.voteinfo);
            res.render('checkActivity', req);
        });

    } else {
        res.redirect('/usrInfo');
    }



});


router.post('/', function(req, res) {

    console.log('CheckAct POST!, voteinfo');
    console.log(req.cookies.aid);
    console.log(req.cookies.user.username);
    console.log(req.body);
    var aid = req.cookies.aid;
    var username = req.cookies.user.username;
    var origincontent = req.body.origincontent;

    //totcolnum: '5', totrownum: '1'
    col = req.body.totcolnum;
    row = req.body.totrownum;

    calc = [];
    for (var i = 0; i < row; i++) {
        calc.push([]);
        for (var j = 0; j < col; j++) {
            calc[i].push(0);
        }
    }

    console.log(calc);

    for (var key in req.body) {
        if (key[0] == 'c' && ('0' <= key[1] && key[1] <= '9')) {
            var str = key.substring(1, key.length);
            arr = str.split('_');
            ii = parseInt(arr[0]);
            jj = parseInt(arr[1]);

            console.log('formatter array:');
            console.log(key);
            console.log(ii, jj);
            calc[ii][jj] = 1;
        }
    }

    var content = "";
    for (i = 0; i < row; i++) {
        for (j = 0; j < col; j++) {
            if (j > 0) content = content + ',';
            content += calc[i][j];
        }
        if (i < row - 1) content += ';';
    }

    console.log('insert information');
    console.log(aid, username);
    console.log(content);


    Option.updateOption(aid, username, content, origincontent, function(err, result) {
        if (err) {
            res.locals.error = err;
            res.render('checkActivity');
            return;
        }

        //修改数据库后需要修改网页内容
        res.redirect('/checkActivity');
    });


});


module.exports = router;
