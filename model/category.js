// Category class
var id, categoryCode, category, type, createdAt, updatedAt;
var Access = require("./simple_table");

// constructor
function Category(id, categoryCode, category, type, createdAt, updatedAt) {
  if (categoryCode == null || category == null || type == null) {
    throw("Category: invalid input");
  }  
  this.id = id;
  this.categoryCode = categoryCode;
  this.category = category;
  this.type = type;
  this.createdAt = createdAt;
  this.updatedAt = updatedAt;
}

// save to db
Category.prototype.save = function(callback) {
  var local = this;

  var post = {
    categoryCode: local.categoryCode,
    category: local.category,
    type: local.type
  };
  
  if (local.id == null) {
    post.createdAt = null;
    post.updatedAt = null;
    
    insertCategory(post, function(id) {
      local.id = id;
      return callback(id);
    });
  } else {
    updateCategory(local.id, post, callback);
  }
};

function insertCategory(post, callback) {
  var query = db.query("INSERT INTO category SET ?", post, function(err, result) {
    if (err) {
      console.log(err.message);
      db.rollback(function() {
        throw err;
      });
      return callback(null);
    } else {
      console.log("Inserted ID " + result.insertId + " into Category");
      return callback(result.insertId);
    }
  });
  console.log(query.sql);
}

function updateCategory(id, post, callback) {
  var query = db.query("UPDATE category SET ? WHERE id = ?", [post, id], function(err, result) {
    if (err) {
      console.log(err.message);
      db.rollback(function() {
        throw err;
      });
    } else {
      console.log("Updated Category " + id);
    }
    return callback();
  });
  console.log(query.sql);
}

Category.getCategoryById = function(id, callback) {
  Access.selectByColumn("category", "idCategory", id, "", function(result) {
    if (result != null) {
      var category = new Category(result[0].idCategory,
        result[0].categoryCode, result[0].category, result[0].type,
        result[0].createdAt, result[0].updatedAt);
      return callback(null, category);
    } else {
      return callback(new Error("No Category with ID " + id));
    }
  });
};

Category.getCategoryByCode = function(categoryCode, callback) {
  Access.selectByColumn("category", "categoryCode", categoryCode, "", function(result) {
    if (result != null) {
      var category = new Category(result[0].idCategory,
        result[0].categoryCode, result[0].category, result[0].type,
        result[0].createdAt, result[0].updatedAt);
      return callback(null, category);
    } else {
      return callback(new Error("No Category with categoryCode " + categoryCode));
    }
  });
};

module.exports = Category;