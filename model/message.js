// Message class
var id, messageCode, idCategory, _category, message, createdAt, updatedAt;
var Access = require("./simple_table");
var Category = require("./category");

// constructor
function Message(id, messageCode, idCategory, message, createdAt, updatedAt) {
  if (messageCode == null || message == null || idCategory == null) {
    throw("Message: invalid input");
  }
  
  this.id = id;
  this.messageCode = messageCode;
  this.idCategory = idCategory;
  this._category = null;
  this.message = message;
  this.createdAt = createdAt;
  this.updatedAt = updatedAt;
}

// save to db
Message.prototype.save = function(callback) {
  var local = this;

  var post = {
    messageCode: local.messageCode,
    idCategory: local.idCategory,
    message: local.message
  };
  
  if (local.id == null) {
    post.createdAt = null;
    post.updatedAt = null;
    
    insertMessage(post, function(id) {
      local.id = id;
      return callback(id);
    });
  } else {
    updateMessage(local.id, post, callback);
  }
};

function insertMessage(post, callback) {
  var query = db.query("INSERT INTO message SET ?", post, function(err, result) {
    if (err) {
      console.log(err.message);
      db.rollback(function() {
        throw err;
      });
      return callback(null);
    } else {
      console.log("Inserted ID " + result.insertId + " into Message");
      return callback(result.insertId);
    }
  });
  console.log(query.sql);
}

function updateMessage(id, post, callback) {
  var query = db.query("UPDATE message SET ? WHERE id = ?", [post, id], function(err, result) {
    if (err) {
      console.log(err.message);
      db.rollback(function() {
        throw err;
      });
    } else {
      console.log("Updated Message " + id);
    }
    return callback();
  });
  console.log(query.sql);
}

// GET: category
Object.defineProperty(Message.prototype, "category", {
  set: function() {
    var local = this;
    if (local._category == null) {
      Category.getCategoryById(local.idCategory, function(category) {
        local._category = category;
        callback(local._category);
      });
    } else {
      callback(local._category);
    }
  }
});

Message.getMessageById = function(id, callback) {
  Access.selectByColumn("message", "idMessage", id, "", function(result) {
    if (result != null) {
      var message = new Message(result[0].idMessage,
        result[0].messageCode, result[0].idCategory, result[0].message,
        result[0].createdAt, result[0].updatedAt);
      return callback(null, message);
    } else {
      return callback(new Error("No Message with ID " + id));
    }
  });
};

Message.getMessageByCode = function(messageCode, callback) {
  Access.selectByColumn("message", "messageCode", messageCode, "", function(result) {
    if (result != null) {
      var message = new Message(result[0].idMessage,
        result[0].messageCode, result[0].idCategory, result[0].message,
        result[0].createdAt, result[0].updatedAt);
      return callback(null, message);
    } else {
      return callback(new Error("No Message with messageCode " + messageCode));
    }
  });
};

module.exports = Message;