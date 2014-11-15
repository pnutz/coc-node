// MessageHistory class
var id, messageCode, categoryCode, latitude, longitude, idSentUser, _sentUser, idReceivedUser, _receivedUser, receivedAt, createdAt, updatedAt;
var Access = require("./simple_table");
var User = require("./user");

// constructor
function MessageHistory(id, messageCode, categoryCode, latitude, longitude, idSentUser, idReceivedUser, receivedAt, createdAt, updatedAt) {
  if (messageCode == null || categoryCode == null ||
      latitude == null || longitude == null ||
      idSentUser == null || idReceivedUser == null || receivedAt == null) {
    throw("MessageHistory: invalid input");
  }
  
  this.id = id;
  this.messageCode = messageCode;
  this.categoryCode = categoryCode;
  this.latitude = latitude;
  this.longitude = longitude;
  this.idSentUser = idSentUser;
  this._sentUser = null;
  this.idReceivedUser = idReceivedUser;
  this._receiveduser = null;
  this.receivedAt = receivedAt;
  this.createdAt = createdAt;
  this.updatedAt = updatedAt;
}

// save to db
MessageHistory.prototype.save = function(callback) {
  var local = this;

  var post = {
    messageCode: local.messageCode,
    categoryCode: local.categoryCode,
    latitude: local.latitude,
    longitude: local.longitude,
    idSentUser: local.idSentUser,
    idReceivedUser: local.idReceivedUser,
    receivedAt: local.receivedAt
  };
  
  if (local.id == null) {
    post.createdAt = null;
    post.updatedAt = null;
    
    insertMessageHistory(post, function(id) {
      local.id = id;
      return callback(id);
    });
  } else {
    updateMessageHistory(local.id, post, callback);
  }
};

function insertMessageHistory(post, callback) {
  var query = db.query("INSERT INTO messagehistory SET ?", post, function(err, result) {
    if (err) {
      console.log(err.message);
      db.rollback(function() {
        throw err;
      });
      return callback(null);
    } else {
      console.log("Inserted ID " + result.insertId + " into MessageHistory");
      return callback(result.insertId);
    }
  });
  console.log(query.sql);
}

function updateMessageHistory(id, post, callback) {
  var query = db.query("UPDATE messagehistory SET ? WHERE id = ?", [post, id], function(err, result) {
    if (err) {
      console.log(err.message);
      db.rollback(function() {
        throw err;
      });
    } else {
      console.log("Updated MessageHistory " + id);
    }
    return callback();
  });
  console.log(query.sql);
}

// GET: sentUser
Object.defineProperty(MessageHistory.prototype, "sentUser", {
  set: function() {
    var local = this;
    if (local._sentUser == null) {
      User.getUserById(local.idSentUser, function(sentUser) {
        local._sentUser = sentUser;
        callback(local._sentUser);
      });
    } else {
      callback(local._sentUser);
    }
  }
});

// GET: receivedUser
Object.defineProperty(MessageHistory.prototype, "receivedUser", {
  set: function() {
    var local = this;
    if (local._receivedUser == null) {
      User.getUserById(local.idReceivedUser, function(receivedUser) {
        local._receivedUser = receivedUser;
        callback(local._receivedUser);
      });
    } else {
      callback(local._receivedUser);
    }
  }
});

MessageHistory.getMessageHistoryById = function(id, callback) {
  Access.selectByColumn("messagehistory", "idMessageHistory", id, "", function(result) {
    if (result != null) {
      var messageHistory = new MessageHistory(result[0].idMessageHistory,
        result[0].messageCode, result[0].categoryCode,
        result[0].latitude, result[0].longitude,
        result[0].idSentUser, result[0].idReceivedUser, result[0].receivedAt, 
        result[0].createdAt, result[0].updatedAt);
      return callback(null, messageHistory);
    } else {
      return callback(new Error("No MessageHistory with ID " + id));
    }
  });
};

// return username, categorycode, messagecode, latitude, longitude, timestamp for messagehistories
// before timestamp limited by optional numResults
MessageHistory.getMessageHistory = function(uuid, timestamp, numResults, callback) {
  var selector = "SELECT a.messageCode, a.categoryCode, a.latitude, a.longitude, " +
                 "a.receivedAt AS timestamp, b.username " +
                 "FROM messagehistory AS a INNER JOIN user AS b ON a.idSentUser = b.idUser " +
                 "INNER JOIN user AS c ON a.idReceivedUser = c.idUser AND c.uuid = '" + uuid +
                 "' WHERE a.receivedAt < '" + timestamp + "' ORDER BY a.receivedAt DESC";
  if (numResults != null) {
    selector += " LIMIT " + numResults;
  }
  
  var query = db.query(selector, function(err, rows) {
    if (err) {
      console.log(err.message);
      return callback();
    } else if (rows.length === 0) {
      return callback();
    } else {
      return callback(rows);
    }
  });
  console.log(query.sql);
};

module.exports = MessageHistory;