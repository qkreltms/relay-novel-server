-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema relay_novel
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema relay_novel
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `relay_novel` DEFAULT CHARACTER SET utf8 ;
USE `relay_novel` ;

-- -----------------------------------------------------
-- Table `relay_novel`.`Users`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `relay_novel`.`Users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nickname` VARCHAR(45) NULL,
  `email` VARCHAR(45) NOT NULL,
  `password` VARCHAR(255) NULL,
  `salt` VARCHAR(255) NULL,
  `thumbnail` VARCHAR(255) NULL,
  `userType` ENUM('ADMIN', 'USER') NOT NULL DEFAULT 'USER',
  `isBlocked` TINYINT(1) UNSIGNED NOT NULL DEFAULT 0,
  `type` ENUM('LOCAL', 'FACEBOOK') NOT NULL DEFAULT 'LOCAL',
  `updatedAt` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `isDeleted` TINYINT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `idx_users_email` (`email` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `relay_novel`.`Rooms`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `relay_novel`.`Rooms` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `writerLimit` INT NOT NULL DEFAULT 100,
  `tags` VARCHAR(255) NULL,
  `title` VARCHAR(255) NOT NULL,
  `genre` VARCHAR(255) NULL,
  `desc` LONGTEXT NULL,
  `coverImage` VARCHAR(255) NULL,
  `creatorId` INT NOT NULL,
  `like` INT UNSIGNED NOT NULL DEFAULT 0,
  `updatedAt` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `isDeleted` TINYINT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  INDEX `idx_rooms_creatorId` (`creatorId` ASC) VISIBLE,
  CONSTRAINT `fk_rooms_creatorId`
    FOREIGN KEY (`creatorId`)
    REFERENCES `relay_novel`.`Users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `relay_novel`.`RoomJoinedUsers`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `relay_novel`.`RoomJoinedUsers` (
  `userId` INT NOT NULL,
  `roomId` INT NOT NULL,
  `writeable` TINYINT NULL DEFAULT 0,
  `updatedAt` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `isDeleted` TINYINT UNSIGNED NOT NULL DEFAULT 0,
  INDEX `idx_roomJoinedUsers_roomId` (`roomId` ASC) VISIBLE,
  INDEX `idx_roomJoinedUsers_userId` (`userId` ASC) INVISIBLE,
  PRIMARY KEY (`userId`, `roomId`),
  CONSTRAINT `fk_roomJoinedUsers_userId`
    FOREIGN KEY (`userId`)
    REFERENCES `relay_novel`.`Users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_roomJoinedUsers_roomId`
    FOREIGN KEY (`roomId`)
    REFERENCES `relay_novel`.`Rooms` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `relay_novel`.`SentencesInfo`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `relay_novel`.`SentencesInfo` (
  `roomId` INT NOT NULL,
  `total` INT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (`roomId`),
  CONSTRAINT `fk_sentencesInfo_roomId`
    FOREIGN KEY (`roomId`)
    REFERENCES `relay_novel`.`Rooms` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `relay_novel`.`Comments`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `relay_novel`.`Comments` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `roomId` INT NOT NULL,
  `userId` INT NOT NULL,
  `text` TEXT NULL,
  `like` INT UNSIGNED NOT NULL DEFAULT 0,
  `dislike` INT UNSIGNED NOT NULL DEFAULT 0,
  `updatedAt` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `isDeleted` TINYINT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  INDEX `idx_comments_userId` (`userId` ASC) INVISIBLE,
  INDEX `fk_comments_roomId_idx` (`roomId` ASC) VISIBLE,
  CONSTRAINT `fk_comments_roomId`
    FOREIGN KEY (`roomId`)
    REFERENCES `relay_novel`.`Rooms` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_comments_userId`
    FOREIGN KEY (`userId`)
    REFERENCES `relay_novel`.`Users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `relay_novel`.`Notices`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `relay_novel`.`Notices` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NULL,
  `desc` LONGTEXT NULL,
  `creatorId` INT NOT NULL,
  `updatedAt` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `isDeleted` TINYINT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  INDEX `idx_notices_creatorId` (`creatorId` ASC) VISIBLE,
  CONSTRAINT `fk_notices_creatorId`
    FOREIGN KEY (`creatorId`)
    REFERENCES `relay_novel`.`Users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `relay_novel`.`Sentences`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `relay_novel`.`Sentences` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `userId` INT NOT NULL,
  `roomId` INT NOT NULL,
  `text` TEXT NULL,
  `updatedAt` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `like` INT UNSIGNED NOT NULL DEFAULT 0,
  `dislike` INT UNSIGNED NOT NULL DEFAULT 0,
  `isDeleted` TINYINT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  INDEX `fk_sentences_userId_idx` (`userId` ASC) VISIBLE,
  INDEX `fk_sentences_roomId_idx` (`roomId` ASC) VISIBLE,
  CONSTRAINT `fk_sentences_userId`
    FOREIGN KEY (`userId`)
    REFERENCES `relay_novel`.`RoomJoinedUsers` (`userId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_sentences_roomId`
    FOREIGN KEY (`roomId`)
    REFERENCES `relay_novel`.`RoomJoinedUsers` (`roomId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `relay_novel`.`SentencesLikes`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `relay_novel`.`SentencesLikes` (
  `userId` INT NOT NULL,
  `sentenceId` INT NOT NULL,
  `roomId` INT NOT NULL,
  `isLike` TINYINT UNSIGNED NOT NULL DEFAULT 0,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `isDeleted` TINYINT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (`userId`, `sentenceId`),
  INDEX `fk_sentencesLikes_roomId_idx` (`roomId` ASC) VISIBLE,
  CONSTRAINT `fk_sentencesLikes_userId`
    FOREIGN KEY (`userId`)
    REFERENCES `relay_novel`.`Users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_sentencesLikes_sentenceId`
    FOREIGN KEY (`sentenceId`)
    REFERENCES `relay_novel`.`Sentences` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_sentencesLikes_roomId`
    FOREIGN KEY (`roomId`)
    REFERENCES `relay_novel`.`Rooms` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `relay_novel`.`CommentLikes`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `relay_novel`.`CommentLikes` (
  `commentId` INT NOT NULL,
  `userId` INT NOT NULL,
  `roomId` INT NOT NULL,
  `isLike` TINYINT NOT NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `isDeleted` TINYINT NOT NULL DEFAULT 0,
  PRIMARY KEY (`commentId`, `userId`),
  INDEX `fk_commentLikes_userId_idx` (`userId` ASC) VISIBLE,
  INDEX `fk_commentLikes_roomId_idx` (`roomId` ASC) VISIBLE,
  CONSTRAINT `fk_commentLikes_commentId`
    FOREIGN KEY (`commentId`)
    REFERENCES `relay_novel`.`Comments` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_commentLikes_userId`
    FOREIGN KEY (`userId`)
    REFERENCES `relay_novel`.`Users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_commentLikes_roomId`
    FOREIGN KEY (`roomId`)
    REFERENCES `relay_novel`.`Rooms` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `relay_novel`.`RoomLikes`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `relay_novel`.`RoomLikes` (
  `roomId` INT NOT NULL,
  `userId` INT NOT NULL,
  `isLike` TINYINT UNSIGNED NOT NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `isDeleted` TINYINT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (`roomId`, `userId`),
  INDEX `fk_roomLikes_userId_idx` (`userId` ASC) VISIBLE,
  CONSTRAINT `fk_roomLikes_roomId`
    FOREIGN KEY (`roomId`)
    REFERENCES `relay_novel`.`Rooms` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_roomLikes_userId`
    FOREIGN KEY (`userId`)
    REFERENCES `relay_novel`.`Users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `relay_novel`.`RoomsInfo`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `relay_novel`.`RoomsInfo` (
  `id` INT NOT NULL DEFAULT 0,
  `total` INT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `relay_novel`.`RoomJoinedUsersInfo`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `relay_novel`.`RoomJoinedUsersInfo` (
  `roomId` INT NOT NULL,
  `total` INT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (`roomId`),
  CONSTRAINT `fk_roomJoinedUsersInfo_roomId`
    FOREIGN KEY (`roomId`)
    REFERENCES `relay_novel`.`Rooms` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `relay_novel`.`CommentsInfo`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `relay_novel`.`CommentsInfo` (
  `roomId` INT NOT NULL,
  `total` INT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (`roomId`),
  CONSTRAINT `fk_centencesInfo_roomId`
    FOREIGN KEY (`roomId`)
    REFERENCES `relay_novel`.`Rooms` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

USE `relay_novel`;

DELIMITER $$
USE `relay_novel`$$
CREATE DEFINER = CURRENT_USER TRIGGER `relay_novel`.`Rooms_AFTER_INSERT` AFTER INSERT ON `Rooms` FOR EACH ROW
BEGIN
	UPDATE roomsInfo SET `total` = `total` + 1 WHERE id = 0;
END$$

USE `relay_novel`$$
CREATE DEFINER = CURRENT_USER TRIGGER `relay_novel`.`RoomJoinedUsers_BEFORE_INSERT` BEFORE INSERT ON `RoomJoinedUsers` FOR EACH ROW
    BEGIN
    DECLARE totalOfPeople INT UNSIGNED DEFAULT 0;
    DECLARE limitOfSpace INT UNSIGNED DEFAULT 0;
        SET totalOfPeople := (SELECT total FROM roomjoinedusersinfo WHERE roomId = NEW.roomId);
        SET limitOfSpace := (SELECT writerLimit FROM rooms WHERE id = NEW.roomId);
        
        # 방이 꽉차면 유저는 들어올 수 없음
        IF (totalOfPeople >= limitOfSpace) THEN
			SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Room is full of space';
		END IF;

    END$$

USE `relay_novel`$$
CREATE DEFINER = CURRENT_USER TRIGGER `relay_novel`.`RoomJoinedUsers_AFTER_INSERT` AFTER INSERT ON `RoomJoinedUsers` FOR EACH ROW
BEGIN
	UPDATE roomJoinedUsersInfo SET `total` = `total` + 1 WHERE roomId = NEW.roomId;
END$$

USE `relay_novel`$$
CREATE DEFINER = CURRENT_USER TRIGGER `relay_novel`.`Comments_AFTER_INSERT` AFTER INSERT ON `Comments` FOR EACH ROW
BEGIN
	UPDATE commentsInfo SET `total` = `total` + 1 WHERE roomId = NEW.roomId;
END$$

USE `relay_novel`$$
CREATE DEFINER = CURRENT_USER TRIGGER `relay_novel`.`Sentences_AFTER_INSERT` AFTER INSERT ON `Sentences` FOR EACH ROW
BEGIN
	UPDATE sentencesInfo SET `total` = `total` + 1 WHERE roomId = NEW.roomId;
END$$

USE `relay_novel`$$
CREATE DEFINER = CURRENT_USER TRIGGER `relay_novel`.`SentencesLikes_AFTER_INSERT` AFTER INSERT ON `SentencesLikes` FOR EACH ROW
BEGIN
	IF (NEW.isLike = true) THEN
		UPDATE sentences SET `like` = `like` + 1 WHERE id = NEW.sentenceId;
	ELSE 
		UPDATE sentences SET `dislike` = `dislike` + 1 WHERE id = NEW.sentenceId;
	END IF;
END$$

USE `relay_novel`$$
CREATE DEFINER = CURRENT_USER TRIGGER `relay_novel`.`SentencesLikes_BEFORE_UPDATE` BEFORE UPDATE ON `SentencesLikes` FOR EACH ROW
BEGIN
IF (NEW.isDeleted = false) THEN
	IF (OLD.isLike = true AND NEW.isLike = false) THEN
		UPDATE sentences SET `like` = `like` - 1 WHERE id = NEW.sentenceId;
        UPDATE sentences SET `dislike` = `dislike` + 1 WHERE id = NEW.sentenceId;
	ELSEIF (OLD.isLike = false AND NEW.isLike = true) THEN
		UPDATE sentences SET `like` = `like` + 1 WHERE id = NEW.sentenceId;
        UPDATE sentences SET `dislike` = `dislike` - 1 WHERE id = NEW.sentenceId;
	ELSEIF (OLD.isLike = true AND NEW.isLike = true) THEN 
        UPDATE sentences SET `like` = `like` - 1 WHERE id = NEW.sentenceId;
        SET NEW.isdeleted = true;
	ELSEIF (OLD.isLike = false AND NEW.isLike = false) THEN
        UPDATE sentences SET `dislike` = `dislike` - 1 WHERE id = NEW.sentenceId;
        SET NEW.isdeleted = true;
	END IF;
ELSE
    IF (OLD.isLike = true AND NEW.isLike = true) THEN
        UPDATE sentences SET `like` = `like` + 1 WHERE id = NEW.sentenceId;
        SET NEW.isDeleted = false;
	ELSEIF (OLD.isLike = false AND NEW.isLike = false) THEN
        UPDATE sentences SET `dislike` = `dislike` + 1 WHERE id = NEW.sentenceId;
        SET NEW.isDeleted = false;
	ELSEIF (OLD.isLike = true AND NEW.isLike = false) THEN
        UPDATE sentences SET `dislike` = `dislike` + 1 WHERE id = NEW.sentenceId;
        SET NEW.isDeleted = false;
	ELSEIF (OLD.isLike = false AND NEW.isLike = true) THEN
        UPDATE sentences SET `like` = `like` + 1 WHERE id = NEW.sentenceId;
        SET NEW.isDeleted = false;
	END IF;
END IF;
END$$

USE `relay_novel`$$
CREATE DEFINER = CURRENT_USER TRIGGER `relay_novel`.`CommentLikes_AFTER_INSERT` AFTER INSERT ON `CommentLikes` FOR EACH ROW
BEGIN
	IF (NEW.isLike = true) THEN
		UPDATE comments SET `like` = `like` + 1 WHERE id = NEW.commentId;
	ELSE 
		UPDATE comments SET `dislike` = `dislike` + 1 WHERE id = NEW.commentId;
	END IF;
END$$

USE `relay_novel`$$
CREATE DEFINER = CURRENT_USER TRIGGER `relay_novel`.`CommentLikes_BEFORE_UPDATE` BEFORE UPDATE ON `CommentLikes` FOR EACH ROW
BEGIN
	IF (NEW.isDeleted = false) THEN
		IF (OLD.isLike = true AND NEW.isLike = false) THEN
			UPDATE comments SET `like` = `like` - 1 WHERE id = NEW.commentId;
            UPDATE comments SET `dislike` = `dislike` + 1 WHERE id = NEW.commentId;
		ELSEIF (OLD.isLike = false AND NEW.isLike = true) THEN
			UPDATE comments SET `like` = `like` + 1 WHERE id = NEW.commentId;
			UPDATE comments SET `dislike` = `dislike` - 1 WHERE id = NEW.commentId;
		ELSEIF (OLD.isLike = true AND NEW.isLike = true) THEN 
			UPDATE comments SET `like` = `like` - 1 WHERE id = NEW.commentId;
			SET NEW.isdeleted = true;
		ELSEIF (OLD.isLike = false AND NEW.isLike = false) THEN
			UPDATE comments SET `dislike` = `dislike` - 1 WHERE id = NEW.commentId;
			SET NEW.isdeleted = true;
		END IF;
	ELSE
		IF (OLD.isLike = true AND NEW.isLike = true) THEN
			UPDATE comments SET `like` = `like` + 1 WHERE id = NEW.commentId;
			SET NEW.isDeleted = false;
		ELSEIF (OLD.isLike = false AND NEW.isLike = false) THEN
			UPDATE comments SET `dislike` = `dislike` + 1 WHERE id = NEW.commentId;
			SET NEW.isDeleted = false;
		ELSEIF (OLD.isLike = true AND NEW.isLike = false) THEN
			UPDATE comments SET `dislike` = `dislike` + 1 WHERE id = NEW.commentId;
			SET NEW.isDeleted = false;
		ELSEIF (OLD.isLike = false AND NEW.isLike = true) THEN
			UPDATE comments SET `like` = `like` + 1 WHERE id = NEW.commentId;
			SET NEW.isDeleted = false;
		END IF;
	END IF;
END$$

USE `relay_novel`$$
CREATE DEFINER = CURRENT_USER TRIGGER `relay_novel`.`RoomLikes_AFTER_INSERT` AFTER INSERT ON `RoomLikes` FOR EACH ROW
BEGIN
    IF (NEW.isLike = true) THEN
        UPDATE rooms SET `like` = `like` + 1 WHERE id = NEW.roomId;
    END IF;
END$$

USE `relay_novel`$$
CREATE DEFINER = CURRENT_USER TRIGGER `relay_novel`.`RoomLikes_BEFORE_UPDATE` BEFORE UPDATE ON `RoomLikes` FOR EACH ROW
BEGIN
    IF (NEW.isDeleted = false) THEN
        SET NEW.isLike = false;
        SET NEW.isDeleted = true;
        UPDATE rooms SET `like` = `like` - 1 WHERE id = NEW.roomId;
	ELSE 
        SET NEW.isLike = true;
        SET NEW.isDeleted = false;
        UPDATE rooms SET `like` = `like` + 1 WHERE id = NEW.roomId;
    END IF;
END$$


DELIMITER ;

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
