var mysql = require('mysql');
var Activity = require('../models/activity.js');
var DB_NAME = 'Voter';

var pool = mysql.createPool({
    //host     : '192.168.0.200',
    user: 'root',
    password: '123456'
});

pool.on('connection', function(connection) {
    connection.query('SET SESSION auto_increment_increment=1');
});

function Option(option) {
  this.oid = option.oid
  this.aid = option.aid;
  this.username = option.username;
  this.content = option.content;
}

module.exports = Option;

pool.getConnection(function(err, connection) {

    var useDbSql = "USE " + DB_NAME;
    connection.query(useDbSql, function(err) {
        if (err) {
            console.log("USE Error: " + err.message);
            return;
        }
        console.log('USE succeed');
    });

    //保存新建选项数据
    Option.prototype.save = function save(callback) {
        var option = {
          aid: this.aid,
          username: this.username,
          content: this.content
        };

        var insert_Sql = "INSERT INTO activityoption(oid, aid, username, content) VALUES(0,?,?,?)";

        console.log(option);

        connection.query(insert_Sql, [ option.aid, option.username, option.content], function(err, result) {
            if (err) {
                console.log("insertOption_Sql Error: " + err.message);
                return;
            }

            console.log("invoked[option_save]");
            callback(err, result);

        });
    };

    //检查是否存在选项，如果不存在则加入该活动
    Option.checkEmptyOption = function(aid, username, callback) {
      console.log('aid, username');
      console.log(aid, username);
      var checkEmptyOption_Sql = "select *  from activityoption  where (aid = ? and username = ?)";
      connection.query(checkEmptyOption_Sql, [aid, username], function(err, result){
        if (err) {
            console.log("checkEmptyOption Error: " + err.message);
            return;
        }

        console.log(result);
        if (result.length === 0) {
          Activity.getVoteType(aid, function(err,result){
            if (err) {
                console.log("getVoteType Error: " + err.message);
                return;
            }

            if (result[0].votetype == "WeekDay") {
              var default_option = "0,0,0,0,0";
              var newOption = new Option({
                oid: 0,
                aid: aid,
                username: username,
                content: default_option
                }
              );

              newOption.save(function (err,result) {
                if (err) {
                  console.log("newOptionSave Error: " + err.message);
                  return;
                }
                callback(err, result);
              });

            }
          });

        }
      else {
          callback(err, result);
      }
      });


    }


    //更新用户选项
    Option.updateOption = function(aid, username, content, origincontent, callback) {
      var updateOption_Sql = "update activityoption set content = ? where (aid = ? and username = ?);";


      connection.query(updateOption_Sql, [content, aid, username], function(err, result) {
          if (err) {
              console.log("updateOption Error: " + err.message);
              return;
          }
          console.log("invoked[updateOption_Sql]");

          //同时重新activityinfo里面的totalnum
          content_arr = content.split(';');
          content_arr.forEach(function(value, index) {
            content_arr[index] = content_arr[index].split(',');
          });

          origincontent_arr = origincontent.split(';');
          origincontent_arr.forEach(function(value, index) {
            origincontent_arr[index] = origincontent_arr[index].split(',');
          });

          console.log('content_arr && origincontent_arr!!');
          console.log(content_arr);
          console.log(origincontent_arr);


          var gettotalnum_Sql = "select totalnum from activityinfo where aid = ?";
          connection.query(gettotalnum_Sql, [aid], function(err, totnum){
            totnum = totnum[0].totalnum;

            totnum_arr = totnum.split(';');
            totnum_arr.forEach(function(value, index){
              totnum_arr[index] = totnum_arr[index].split(',');
            });

            newtotnum = "";
            for (var i = 0; i < totnum_arr.length; i++) {
              for (var j = 0; j < totnum_arr[0].length; j++) {
                if (j>0) newtotnum += ',';
                totnum_arr[i][j] = parseInt(totnum_arr[i][j]) + parseInt(content_arr[i][j]) - parseInt(origincontent_arr[i][j]);
                newtotnum += totnum_arr[i][j];
              }
              if (i<totnum_arr.length - 1) newtotnum +=';';
            }

            console.log('update totnum of actinfo!!');
            console.log(newtotnum);

            var updatenewtotnum_Sql = "update activityinfo set totalnum = ? where aid = ? ";
            connection.query(updatenewtotnum_Sql, [newtotnum, aid], function(err, updatetotnumresult){
              if (err) {
                  console.log("updatetotnumresult Error: " + err.message);
                  return;
              }
              callback(err, updatetotnumresult);
            });



          });



          //callback(err, result);
          //connection.release();
      });

    };

    //通过oid获取活动信息
    Option.getOptionByOid = function getOptionById(oid, callback) {
      var getOptionById_Sql = "SELECT * FROM activityoption WHERE oid = ?";
      connection.query(getOptionByOid_Sql, [oid], function(err, result) {
          if (err) {
              console.log("getOptionByOid Error: " + err.message);
              return;
          }
          console.log("invoked[getOptionByOid]");
          callback(err, result);
          //connection.release();
      });
    };

    //通过aid 和 username 获取option
    Option.getOptionByAidUsername = function getOptionById(aid, username, callback) {
      var getOptionByAidUsername_Sql = "SELECT * FROM activityoption WHERE (aid = ? and username = ?)";
      connection.query(getOptionByAidUsername_Sql, [aid, username], function(err, result) {
          if (err) {
              console.log("getOptionByAidUsername Error: " + err.message);
              return;
          }
          console.log("invoked[getOptionByAidUsername]");
          callback(err, result);
          //connection.release();
      });
    };

    //获取用户username的所有活动
    Option.getActivityByUsername = function getActivityByUsername(username, callback) {
        var getActivityByUsername_Sql = "SELECT activityinfo.aid as aid, activityinfo.activityname as activityname, activityinfo.starter as starter, activityinfo.votestatus as votestatus FROM activityinfo, activityoption WHERE (activityoption.username = ? and activityinfo.aid = activityoption.aid)";

        console.log(username);
        connection.query(getActivityByUsername_Sql, [username], function(err, result) {
            if (err) {
                console.log("getActivityByUsername Error: " + err.message);
                return;
            }
            console.log("invoked[getActivityByUsername]");
            console.log(result);
            callback(err, result);

            //connection.release();

        });
      };


});
