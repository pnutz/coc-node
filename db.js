var mysql = require("mysql");
var async = require("async");
var script = require("./mysql_db/cocDB");

var db_config = {
  host: "us-cdbr-iron-east-01.cleardb.net",
  user: "baae06c4c30b89",
  password: "9b5bfc63",
  database: "heroku_06d5fed0deeebe4"
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