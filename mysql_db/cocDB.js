module.exports.db = "CREATE DATABASE IF NOT EXISTS heroku_06d5fed0deeebe4 DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;";
module.exports.use = "USE heroku_06d5fed0deeebe4;";

module.exports.tables = ["CREATE TABLE IF NOT EXISTS heroku_06d5fed0deeebe4.Category ( " +
  "idCategory INT NOT NULL AUTO_INCREMENT, " +
  "categoryCode VARCHAR(2) NOT NULL, " +
  "category VARCHAR(45) NOT NULL, " +
  "type VARCHAR(45) NOT NULL, " +
  "createdAt TIMESTAMP NOT NULL DEFAULT 0, " +
  "updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, " +
  "PRIMARY KEY (idCategory), " +
  "UNIQUE INDEX categoryCode_UNIQUE (categoryCode ASC)) " +
"ENGINE = InnoDB;",

"CREATE TABLE IF NOT EXISTS heroku_06d5fed0deeebe4.Message ( " +
  "idMessage INT NOT NULL AUTO_INCREMENT, " +
  "idCategory INT NULL, " +
  "messageCode VARCHAR(7) NOT NULL, " +
  "message VARCHAR(140) NOT NULL, " +
  "createdAt TIMESTAMP NOT NULL DEFAULT 0, " +
  "updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, " +
  "PRIMARY KEY (idMessage), " +
  "INDEX idCategory_idx (idCategory ASC), " +
  "UNIQUE INDEX messageCode_UNIQUE (messageCode ASC), " +
  "CONSTRAINT fkCategoryId " +
    "FOREIGN KEY (idCategory) " +
    "REFERENCES heroku_06d5fed0deeebe4.Category (idCategory) " +
    "ON DELETE NO ACTION " +
    "ON UPDATE NO ACTION) " +
"ENGINE = InnoDB;",

"CREATE TABLE IF NOT EXISTS heroku_06d5fed0deeebe4.User ( " +
  "idUser INT NOT NULL AUTO_INCREMENT, " +
  "idDevice VARCHAR(36) NOT NULL, " +
  "uuid VARCHAR(34) NOT NULL, " +
  "username VARCHAR(60) NOT NULL, " +
  "createdAt TIMESTAMP NOT NULL DEFAULT 0, " +
  "updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, " +
  "PRIMARY KEY (idUser)) " +
"ENGINE = InnoDB;",

"CREATE TABLE IF NOT EXISTS heroku_06d5fed0deeebe4.MessageHistory ( " +
  "idMessageHistory INT NOT NULL AUTO_INCREMENT, " +
  "idSentUser INT NOT NULL, " +
  "idReceivedUser INT NOT NULL, " +
  "messageCode VARCHAR(5) NOT NULL, " +
  "categoryCode VARCHAR(2) NOT NULL, " +
  "latitude DECIMAL(9,6) NOT NULL, " +
  "longitude DECIMAL(9,6) NOT NULL, " +
  "receivedAt DATETIME NOT NULL, " +
  "createdAt TIMESTAMP NOT NULL DEFAULT 0, " +
  "updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, " +
  "PRIMARY KEY (idMessageHistory), " +
  "INDEX fkSentUserId_idx (idSentUser ASC), " +
  "INDEX fkReceivedUserId_idx (idReceivedUser ASC), " +
  "INDEX fkMessageCode_idx (messageCode ASC), " +
  "INDEX fkCategoryCode_idx (categoryCode ASC), " +
  "CONSTRAINT fkSentUserId " +
    "FOREIGN KEY (idSentUser) " +
    "REFERENCES heroku_06d5fed0deeebe4.User (idUser) " +
    "ON DELETE NO ACTION " +
    "ON UPDATE NO ACTION, " +
  "CONSTRAINT fkReceivedUserId " +
    "FOREIGN KEY (idReceivedUser) " +
    "REFERENCES heroku_06d5fed0deeebe4.User (idUser) " +
    "ON DELETE NO ACTION " +
    "ON UPDATE NO ACTION, " +
  "CONSTRAINT fkMessageCode " +
    "FOREIGN KEY (messageCode) " +
    "REFERENCES heroku_06d5fed0deeebe4.Message (messageCode) " +
    "ON DELETE NO ACTION " +
    "ON UPDATE NO ACTION, " +
  "CONSTRAINT fkCategoryCode " +
    "FOREIGN KEY (categoryCode) " +
    "REFERENCES heroku_06d5fed0deeebe4.Category (categoryCode) " +
    "ON DELETE NO ACTION " +
    "ON UPDATE NO ACTION) " +
"ENGINE = InnoDB;"];