var mysql = require("mysql");
var async = require("async");
var script = require("./mysql_db/cocDB");

var db_config = {
  host: "localhost",
  user: "root",
  password: "root"
  //database: "counterApp"
};

function connect(resultCallback) {
  var connection = mysql.createConnection(db_config);
  
  async.series([
    function(callback) {
      connection.connect(function(err) {
        if (err) {
          throw err;
        }
        console.log("Connected to MySQL Database");
        return callback();
      });
    },
    function(callback) {
      var query = script.db;
      connection.query(query, function(err, result) {
        if (err) {
          console.log(query);
          throw err;
        }
        console.log("Database Created");
        return callback();
      });
    },
    function(callback) {
      var query = script.use;
      connection.query(query, function(err, result) {
        if (err) {
          console.log(query);
          throw err;
        }
        console.log("Using Database");
        return callback();
      });
    },
    function(callback) {
      async.eachSeries(script.tables, function(query, eachCallback) {
        connection.query(query, function(err, result) {
          if (err) {
            console.log(query);
            throw err;
          }
          return eachCallback();
        });
      }, function(err) {
        if (err) {
          throw err;
        }
        
        console.log("Initialized Database Tables");
        return callback();
      });
    }
  ], function(err, results) {
    if (err) {
      console.log(err.message);
    }
    
    return resultCallback(connection);
  });
}

module.exports = {
  connect: connect
};