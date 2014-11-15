var server = require("./server");
var mysql = require("./db");
var async = require("async");

var Init = require("./messageInit");
var Category = require("./model/category");
var Message = require("./model/message");
var User = require("./model/user");

async.series([
  // setup database
  function(callback) {
    mysql.connect(function(connection) {
      global.db = connection;
      return callback();
    });
  },
  // check if database contains message data
  function(callback) {
    var query = "SELECT idCategory FROM category LIMIT 1;";
    db.query(query, function(err, result) {
      if (err) {
        console.log(query);
        console.log(err.message);
        return callback(err);
      } else if (result.length !== 0) {
        return callback();
      }
      // initialize database
      else {
        var data = Init.data;
        // iterate through categories
        async.eachSeries(data, function(categoryData, eachCallback) {
          var category = new Category(null, categoryData.categoryCode, categoryData.category, categoryData.type);
          category.save(function(idCategory) {
            if (idCategory != null) {
              var messageCodes = Object.keys(categoryData.messages);
              // iterate through messages
              async.eachSeries(messageCodes, function(messageCode, eachCallback2) {
                var message = new Message(null, messageCode, idCategory, categoryData.messages[messageCode]);
                message.save(function(idMessage) {
                  if (idMessage != null) {
                    return eachCallback2();
                  } else {
                    return eachCallback2(new Error("failed message creation"));
                  }
                });
              }, function(err) {
                return eachCallback(err);
              });
            } else {
              return eachCallback(new Error("failed category creation"));
            }
          });
        }, function(err) {
          if (err) {
            console.log(err.message);
          }
          return callback(err);
        });
      }
    });
  },
  // check if database contains default user
  function(callback) {
    var uuid = "000000-0000-0000-0000-000000000000";
    User.getUserByUuid(uuid, function(err, defaultUser) {
      // user does not exist, create KueMessage with device id and uuid as all 0s
      if (err) {
        var user = new User(null, "00000000-0000-0000-0000-000000000000", uuid, "KueMessage");
        user.save(function (idUser) {
          if (idUser != null) {
            return callback();
          } else {
            return callback(new Error("failed user creation"));
          }
        });
      }
      else {
        return callback();
      }
    });
  },
  // run server
  function(callback) {
    server.start();
    return callback();
  }]);