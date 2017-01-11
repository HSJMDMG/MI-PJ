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

function Activity(activity) {
  this.aid = activity.aid;
  this.activityname = activity.activityname;
  this.starter = activity.starter;
  this.votetype = activity.votetype;
  this.votestatus = activity.votestatus;
  this.content = activity.content;
  this.totalnum = activity.totalnum;
}

module.exports = Activity;

pool.getConnection(function(err, connection) {

    var useDbSql = "USE " + DB_NAME;
    connection.query(useDbSql, function(err) {
        if (err) {
            console.log("USE Error: " + err.message);
            return;
        }
        console.log('USE succeed');
    });

    //保存新建活动数据
    Activity.prototype.save = function save(callback) {
        var activity = {
          activityname: this.activityname,
          starter: this.starter,
          votetype: this.votetype,
          votestatus: this.votestatus,
          content: this.content,
          totalnum: this.totalnum
        };


        var insert_Sql = "INSERT INTO activityinfo(aid,activityname,starter, votetype, votestatus, content, totalnum) VALUES(0,?,?,?,?,?,?)";

        console.log(activity);

        connection.query(insert_Sql, [activity.activityname, activity.starter, activity.votetype, activity.votestatus, activity.content, activity.totalnum], function(err, result) {
            if (err) {
                console.log("insertActivity_Sql Error: " + err.message);
                return;
            }

            console.log("invoked[activity_save]");
            callback(err, result);

            //      connection.release();

        });
    };

    //通过aid获取活动信息
    Activity.getActivityById = function getActivityById(aid, callback) {
      var getActivityById_Sql = "SELECT * FROM activityinfo WHERE aid = ?";
      connection.query(getActivityById_Sql, [aid], function(err, result) {
          if (err) {
              console.log("getActivityById Error: " + err.message);
              return;
          }
          console.log("invoked[getActivityById]");
          callback(err, result);

          //connection.release();
      });
    };

    //获取用户starter(username)发起的所有活动
    Activity.getActivityByStarter = function getActivityByStarter(starter, callback) {

        var getActivityByStarter_Sql = "SELECT * FROM activityinfo WHERE starter = ?";

        connection.query(getActivityByStarter_Sql, [starter], function(err, result) {
            if (err) {
                console.log("getActivityByStarter Error: " + err.message);
                return;
            }
            console.log("invoked[getActivityByStarter]");
            callback(err, result);

            //connection.release();


        });
    };

    //获取某次活动的所有投票数据
    Activity.getVoteData = function getVoteData(aid, username, callback) {

        var getAllVoteData_Sql = "SELECT starter, votetype, votestatus, content, totalnum FROM activityinfo WHERE aid = ?";
        var getPersonalVoteData_Sql = "SELECT content FROM activityoption WHERE (aid = ? and username = ?)";

        connection.query(getAllVoteData_Sql, [aid], function(err, all_result) {
            if (err) {
                console.log("getAllVoteData_Sql Error: " + err.message);
                return;
            }
            console.log("invoked[getAllVoteData_Sql]");

            connection.query(getPersonalVoteData_Sql, [aid, username], function(err, personal_result) {
              if (err) {
                  console.log("getPersonalVoteData_Sql Error: " + err.message);
                  return;
              }
              console.log("invoked[getPersonalVoteData_Sql]");

              console.log(all_result);
              console.log(personal_result);


              callback(err, {starter: all_result[0].starter, votetype: all_result[0].votetype, votestatus: all_result[0].votestatus, itemname: all_result[0].content, allresult: all_result[0].totalnum, personalresult: personal_result[0].content});
            });

            //connection.release();


        });
    };

});
