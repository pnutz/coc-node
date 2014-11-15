var http = require("http");
var sys = require("sys");
var url = require("url");
var async = require("async");
var express = require("express");
var bodyParser = require("body-parser");

var Init = require("./messageInit");
var User = require("./model/user");
var MessageHistory = require("./model/messagehistory");

var requestCount = 0;
var port = "8888";

function start() {
  var app = express();

  app.use(bodyParser.json());
  
  // use heroku's environment port (not assigned port)
  var server = app.listen(process.env.PORT || port, function() {
    console.log("Express Server Listening on Port %d in %s mode", server.address().port, app.settings.env);
  });
  
  console.log("Server Started");
  
  app.get('/', function(req, res) {
    res.status(500).send("you messed up!");
  });
  
  // app sends idDevice when loaded for the first time
  // responds with user uuid, username, and message database
  app.post('/load', function(req, res) {
    incrementRequestCount();
    var params = req.body;
    
    if (params.idDevice != null) {
      var user = new User(null, params.idDevice);
      user.save(function(id) {
        if (id != null) {
          var response = { uuid: user.uuid, username: user.username, data: Init.data };
          res.send(response);
        } else {
          res.status(500).send("failed user creation");
        }
        decrementRequestCount();
      });
    } else {
      console.log("invalid parameters for load route");
      decrementRequestCount();
    }
  });
  
  // app sends unsynced messages { uuid, list: [{ uuid, categoryCode, messageCode, latitude, longitude, timestamp }] }
  // responds with an object matching each unique uuid with its username
  app.post('/sync', function(req, res) {
    incrementRequestCount();
    var params = req.body;
    
    if (params.uuid != null && params.list.length > 0) {
      var receivedUserId;
      var usernameList = {};
      var idList = {};
      
      async.series([
        // get receivedUserId
        function(callback) {
          User.getUserByUuid(params.uuid, function(err, user) {
            if (user != null) {
              receivedUserId = user.id;
              return callback();
            } else {
              return callback(err);
            }
          });
        },
        // iterate through list
        function(callback) {
          async.eachSeries(params.list, function(message, eachCallback) {
            async.series([
              // get sentUser
              function(seriesCallback) {
                // do not query for user if we already have user information
                if (!usernameList.hasOwnProperty(message.uuid)) {
                  User.getUserByUuid(message.uuid, function(err, user) {
                    if (user != null) {
                      // populate usernameList and idList (to reference user id)
                      usernameList[message.uuid] = user.username;
                      idList[message.uuid] = user.id;
                      
                      return seriesCallback();
                    } else {
                      eachCallback(err);
                      return seriesCallback(err);
                    }
                  });
                } else {
                  return seriesCallback();
                }
              },
              // save MessageHistory
              function(seriesCallback) {
                var messageHistory = new MessageHistory(null, message.messageCode, message.categoryCode,
                                                        message.latitude, message.longitude,
                                                        idList[message.uuid], receivedUserId, message.timestamp);
                messageHistory.save(function(id) {
                  if (id != null) {
                    eachCallback();
                  } else {
                    eachCallback(new Error("failed messageHistory creation"));
                  }
                  return seriesCallback();
                });
              }
            ]);
          }, function(err) {
            return callback(err);
          });
        }
      ], function(err, results) {
        if (err) {
          console.log(err.message);
        }
        
        res.send(usernameList);
        decrementRequestCount();
      });
    } else {
      console.log("invalid parameters for sync route");
      decrementRequestCount();
    }
  });
  
  // app requests message history for params uuid, timestamp, and optional numResults
  // responds with an array of messages received by uuid before timestamp, restricted by numResults
  app.post('/data', function(req, res) {
    incrementRequestCount();
    var params = req.body;
    
    if (params.uuid != null && params.timestamp != null) {
      MessageHistory.getMessageHistory(params.uuid, params.timestamp, params.numResults, function(data) {
        if (data != null) {
          res.send(data);
        } else {
          res.status(500).send("could not access data");
        }
        decrementRequestCount();
      });
    } else {
      console.log("invalid parameters for data route");
      decrementRequestCount();
    }
  });
}

function incrementRequestCount() {
  requestCount++;
  console.log("Concurrent Requests: " + requestCount);
}

function decrementRequestCount() { requestCount--; }

module.exports = {
  start: start
};
