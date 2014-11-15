// User class
var id, idDevice, uuid, username, createdAt, updatedAt;
var Access = require("./simple_table");
var async = require("async");
var uuid = require("node-uuid");

// temporary library for generating usernames - small list of adjectives/nouns
var madlibs = require("madlibs");

// constructor
function User(id, idDevice, uuid, username, createdAt, updatedAt) {
  if (idDevice == null) {
    throw("User: invalid input");
  }  
  this.id = id;
  this.idDevice = idDevice;
  this.uuid = uuid;
  this.username = username;
  this.createdAt = createdAt;
  this.updatedAt = updatedAt;
}

// needs refactoring with better method
// generate username out of adjective and noun
function generateUsername(callback) {
  var adjective = madlibs.adjective();
  var noun = madlibs.noun();
  var username = adjective.charAt(0).toUpperCase() + adjective.slice(1) + noun.charAt(0).toUpperCase() + noun.slice(1);
  // check if username is unique
  Access.getIdByValue("user", "username", username, function(id) {
    if (id == null) {
      console.log(username);
      return callback(username);
    } else {
      console.log("duplicate username");
      generateUsername(function(result) {
        console.log(result);
        return callback(result);
      });
    }
  });
}

// 6-4-4-4-12 HEX (34 characters)
function generateUuid() {
  // node-uuid format is 8-4-4-4-12 (timestamp based)
  return uuid.v1().substring(2);
}

// save to db
User.prototype.save = function(callback) {
  var local = this;
  
  // initialize uuid
  if (local.uuid == null) {
    local.uuid = generateUuid();
  }
  
  async.series([
    // initialize username
    function(seriesCallback) {
      if (local.username == null) {
        generateUsername(function(username) {
          local.username = username;
          return seriesCallback();
        });
      } else {
        return seriesCallback();
      }
    }
  ],
    // insert/update user
    function(err, results) {
      var post = {
        idDevice: local.idDevice,
        uuid: local.uuid,
        username: local.username
      };
      
      if (local.id == null) {
        post.createdAt = null;
        post.updatedAt = null;
        
        insertUser(post, function(id) {
            local.id = id;
            return callback(local.id);
        });
      } else {
        updateUser(local.id, post, callback);
      }
    }
  );
};

function insertUser(post, callback) {
  var query = db.query("INSERT INTO user SET ?", post, function(err, result) {
    if (err) {
      console.log(err.message);
      db.rollback(function() {
        throw err;
      });
      return callback(null);
    } else {
      console.log("Inserted ID " + result.insertId + " into User");
      return callback(result.insertId);
    }
  });
  console.log(query.sql);
}

function updateUser(id, post, callback) {
  var query = db.query("UPDATE user SET ? WHERE id = ?", [post, id], function(err, result) {
    if (err) {
      console.log(err.message);
      db.rollback(function() {
        throw err;
      });
    } else {
      console.log("Updated User " + id);
    }
    return callback();
  });
  console.log(query.sql);
}

User.getUserById = function(id, callback) {
  Access.selectByColumn("user", "idUser", id, "", function(result) {
    if (result != null) {
      var user = new User(result[0].idUser, result[0].idDevice,
        result[0].uuid, result[0].username,
        result[0].createdAt, result[0].updatedAt);
      return callback(null, user);
    } else {
      return callback(new Error("No User with ID " + id));
    }
  });
};

User.getUserByUuid = function(uuid, callback) {
  Access.selectByColumn("user", "uuid", uuid, "", function(result) {
    if (result != null) {
      var user = new User(result[0].idUser, result[0].idDevice,
        result[0].uuid, result[0].username,
        result[0].createdAt, result[0].updatedAt);
      return callback(null, user);
    } else {
      return callback(new Error("No User with UUID " + uuid));
    }
  });
};

module.exports = User;