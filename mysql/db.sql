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
  `isAdmin` TINYINT(1) NOT NULL DEFAULT 0,
  `isBlocked` TINYINT(1) NOT NULL DEFAULT 0,
  `type` ENUM('LOCAL', 'FACEBOOK') NOT NULL,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `createdAt` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
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
  `title` VARCHAR(255) NULL,
  `desc` LONGTEXT NULL,
  `creatorId` INT NOT NULL,
  `like` INT NOT NULL DEFAULT 0,
  `dislike` INT NOT NULL DEFAULT 0,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `createdAt` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
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
  `id` INT NOT NULL AUTO_INCREMENT,
  `userId` INT NOT NULL,
  `roomId` INT NOT NULL,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `createdAt` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `writeable` TINYINT NULL DEFAULT 0,
  INDEX `idx_roomJoinedUsers_roomId` (`roomId` ASC) VISIBLE,
  INDEX `idx_roomJoinedUsers_userId` (`userId` ASC) INVISIBLE,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_roomJoinedUsers_userId`
    FOREIGN KEY (`userId`)
    REFERENCES `relay_novel`.`Rooms` (`creatorId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_roomJoinedUsers_roomId`
    FOREIGN KEY (`roomId`)
    REFERENCES `relay_novel`.`Rooms` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `relay_novel`.`Sentences`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `relay_novel`.`Sentences` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `text` TEXT NULL,
  `roomId` INT NOT NULL,
  `userId` INT NOT NULL,
  `like` INT NOT NULL DEFAULT 0,
  `dislike` INT NOT NULL DEFAULT 0,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `createdAt` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  INDEX `idx_sentences_roomId` (`roomId` ASC) VISIBLE,
  INDEX `idx_sentences_userId` (`userId` ASC) VISIBLE,
  INDEX `idx_sentences_sentenceId` (`id` ASC) VISIBLE,
  CONSTRAINT `fk_sentences_roomId`
    FOREIGN KEY (`roomId`)
    REFERENCES `relay_novel`.`RoomJoinedUsers` (`roomId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_sentences_userId`
    FOREIGN KEY (`userId`)
    REFERENCES `relay_novel`.`RoomJoinedUsers` (`userId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `relay_novel`.`Comments`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `relay_novel`.`Comments` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `text` TEXT NULL,
  `roomId` INT NOT NULL,
  `userId` INT NOT NULL,
  `like` INT NOT NULL DEFAULT 0,
  `dislike` INT NOT NULL DEFAULT 0,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `createdAt` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  INDEX `idx_comments_userId` (`userId` ASC) INVISIBLE,
  INDEX `idx_comments_roomId` (`roomId` ASC) VISIBLE,
  CONSTRAINT `fk_comments_roomId`
    FOREIGN KEY (`roomId`)
    REFERENCES `relay_novel`.`RoomJoinedUsers` (`roomId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_comments_userId`
    FOREIGN KEY (`userId`)
    REFERENCES `relay_novel`.`RoomJoinedUsers` (`userId`)
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
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `createdAt` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  INDEX `idx_notices_creatorId` (`creatorId` ASC) VISIBLE,
  CONSTRAINT `fk_notices_creatorId`
    FOREIGN KEY (`creatorId`)
    REFERENCES `relay_novel`.`Users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `relay_novel`.`SentenceLikesDislikes`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `relay_novel`.`SentenceLikesDislikes` (
  `sentenceId` INT NOT NULL,
  `userId` INT NOT NULL,
  `isLike` TINYINT NOT NULL,
  `createdAt` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  INDEX `fk_sentenceLikesDislikes_userId_idx` (`userId` ASC) INVISIBLE,
  PRIMARY KEY (`sentenceId`, `userId`),
  CONSTRAINT `fk_sentenceLikesDislikes_sentenceId`
    FOREIGN KEY (`sentenceId`)
    REFERENCES `relay_novel`.`Sentences` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_sentenceLikesDislikes_userId`
    FOREIGN KEY (`userId`)
    REFERENCES `relay_novel`.`Sentences` (`userId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `relay_novel`.`CommentLikesDislikes`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `relay_novel`.`CommentLikesDislikes` (
  `commentId` INT NOT NULL,
  `userId` INT NOT NULL,
  `isLike` TINYINT NOT NULL,
  `createdAt` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  INDEX `fk_commentLikesDislikes_userId_idx` (`userId` ASC) VISIBLE,
  PRIMARY KEY (`commentId`, `userId`),
  CONSTRAINT `fk_commentLikesDislikes_commentId`
    FOREIGN KEY (`commentId`)
    REFERENCES `relay_novel`.`Comments` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_commentLikesDislikes_userId`
    FOREIGN KEY (`userId`)
    REFERENCES `relay_novel`.`Comments` (`userId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `relay_novel`.`RoomLikesDislikes`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `relay_novel`.`RoomLikesDislikes` (
  `roomId` INT NOT NULL,
  `userId` INT NOT NULL,
  `isLike` TINYINT NOT NULL,
  `createdAt` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  INDEX `fk_roomLikesDislikes_userId_idx` (`userId` ASC) INVISIBLE,
  PRIMARY KEY (`roomId`, `userId`),
  CONSTRAINT `fk_roomLikesDislikes_roomId`
    FOREIGN KEY (`roomId`)
    REFERENCES `relay_novel`.`Rooms` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_roomLikesDislikes_userId`
    FOREIGN KEY (`userId`)
    REFERENCES `relay_novel`.`Rooms` (`creatorId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

USE `relay_novel`;

DELIMITER $$
USE `relay_novel`$$
CREATE DEFINER = CURRENT_USER TRIGGER `relay_novel`.`SentenceLikesDislikes_AFTER_INSERT` AFTER INSERT ON `SentenceLikesDislikes` FOR EACH ROW
BEGIN
	IF (NEW.isLike = true) THEN
		UPDATE sentences SET `like` = `like` + 1 WHERE id = NEW.sentenceId;
	ELSE 
		UPDATE sentences SET `dislike` = `dislike` + 1 WHERE id = NEW.sentenceId;
	END IF;
END$$

USE `relay_novel`$$
CREATE DEFINER = CURRENT_USER TRIGGER `relay_novel`.`SentenceLikesDislikes_AFTER_DELETE` AFTER DELETE ON `SentenceLikesDislikes` FOR EACH ROW
BEGIN
	IF (OLD.isLike = true) THEN
		UPDATE sentences SET `like` = `like` + 1 WHERE id = OLD.sentenceId;
	ELSE 
		UPDATE sentences SET `dislike` = `dislike` + 1 WHERE id = OLD.sentenceId;
	END IF;
END$$

USE `relay_novel`$$
CREATE DEFINER = CURRENT_USER TRIGGER `relay_novel`.`CommentLikesDislikes_AFTER_INSERT` AFTER INSERT ON `CommentLikesDislikes` FOR EACH ROW
BEGIN
	IF (NEW.isLike = true) THEN
		UPDATE comments SET `like` = `like` + 1 WHERE id = NEW.commentId;
	ELSE 
		UPDATE comments SET `dislike` = `dislike` + 1 WHERE id = NEW.commentId;
	END IF;
END$$

USE `relay_novel`$$
CREATE DEFINER = CURRENT_USER TRIGGER `relay_novel`.`CommentLikesDislikes_AFTER_DELETE` AFTER DELETE ON `CommentLikesDislikes` FOR EACH ROW
BEGIN
	IF (OLD.isLike = true) THEN
		UPDATE comments SET `like` = `like` + 1 WHERE id = OLD.commentId;
	ELSE 
		UPDATE comments SET `dislike` = `dislike` + 1 WHERE id = OLD.commentId;
	END IF;
END$$

USE `relay_novel`$$
CREATE DEFINER = CURRENT_USER TRIGGER `relay_novel`.`RoomLikesDislikes_AFTER_INSERT` AFTER INSERT ON `RoomLikesDislikes` FOR EACH ROW
BEGIN
	IF (NEW.isLike = true) THEN
		UPDATE rooms SET `like` = `like` + 1 WHERE id = NEW.roomId;
	ELSE 
		UPDATE rooms SET `dislike` = `dislike` + 1 WHERE id = NEW.roomId;
	END IF;
END$$

USE `relay_novel`$$
CREATE DEFINER = CURRENT_USER TRIGGER `relay_novel`.`RoomLikesDislikes_AFTER_DELETE` AFTER DELETE ON `RoomLikesDislikes` FOR EACH ROW
BEGIN
	IF (OLD.isLike = true) THEN
		UPDATE rooms SET `like` = `like` - 1 WHERE id = OLD.roomId;
	ELSE 
		UPDATE rooms SET `dislike` = `dislike` - 1 WHERE id = OLD.roomId;
	END IF;
END$$


DELIMITER ;

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
