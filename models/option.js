var mysql = require('mysql');
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
