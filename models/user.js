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

function User(user) {
    this.userid = user.userid;
    this.username = user.username;
    this.usernickname = user.usernickname;
    this.userpass = user.userpass;
}

module.exports = User;

pool.getConnection(function(err, connection) {

    var useDbSql = "USE " + DB_NAME;
    connection.query(useDbSql, function(err) {
        if (err) {
            console.log("USE Error: " + err.message);
            return;
        }
        console.log('USE succeed');
    });

    //保存数据
    User.prototype.save = function save(callback) {

        var getNextId_sql = "SELECT MAX(uid) as maxid FROM userinfo;";
        connection.query(getNextId_sql, function(err, result){
          if (err) {
              console.log("getNextId_sql Error: " + err.message);
              return;
          }
        //  console.log(result);
        //  console.log(result[0]);
        //  console.log(result[0].maxid);

        });

        var user = {
            username: this.username,
            usernickname: this.usernickname,
            userpass: this.userpass
        };


        var insertUser_Sql = "INSERT INTO userinfo(uid,username,password, nickname) VALUES(0,?,?,?)";

        console.log(user);
        connection.query(insertUser_Sql, [user.username, user.userpass, user.usernickname], function(err, result) {
            if (err) {
                console.log("insertUser_Sql Error: " + err.message);
                return;
            }

            console.log("invoked[user_save]");
            callback(err, result);

            //      connection.release();

        });
    };

    //根据用户名得到用户数量
    User.getUserNumByName = function getUserNumByName(username, callback) {

        var getUserNumByName_Sql = "SELECT COUNT(1) AS num FROM userinfo WHERE username = ?";

        connection.query(getUserNumByName_Sql, [username], function(err, result) {
            if (err) {
                console.log("getUserNumByName Error: " + err.message);
                return;
            }
            console.log("Result: ----->" + result);

            console.log("invoked[getUserNumByName]");
            callback(err, result);

            //            connection.release();

        });
    };

    //根据用户名得到用户信息
    User.getUserByUserName = function getUserNumByName(username, callback) {

        var getUserByUserName_Sql = "SELECT * FROM userinfo WHERE username = ?";

        connection.query(getUserByUserName_Sql, [username], function(err, result) {
            if (err) {
                console.log("getUserByUserName Error: " + err.message);
                return;
            }
            console.log("invoked[getUserByUserName]");
            callback(err, result);

            //connection.release();


        });
    };

});
