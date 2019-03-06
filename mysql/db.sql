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
  UNIQUE INDEX `email_UNIQUE` (`email` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `relay_novel`.`Rooms`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `relay_novel`.`Rooms` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `writerLimit` INT NOT NULL DEFAULT 100,
  `tags` VARCHAR(255) NULL,
  `title` VARCHAR(255) NULL,
  `desc` TEXT NULL,
  `creatorId` INT NOT NULL,
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
  `userId` INT NOT NULL,
  `roomId` INT NOT NULL,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `createdAt` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  INDEX `idx_roomJoinedUsers_userId` (`userId` ASC) VISIBLE,
  INDEX `idx_roomJoinedUsers_roomId` (`roomId` ASC) VISIBLE,
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
-- Table `relay_novel`.`Sentences`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `relay_novel`.`Sentences` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `text` TEXT NULL,
  `roomId` INT NOT NULL,
  `userId` INT NOT NULL,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `createdAt` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  INDEX `idx_sentences_roomId` (`roomId` ASC) VISIBLE,
  INDEX `idx_sentences_userId` (`userId` ASC) VISIBLE,
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
-- Table `relay_novel`.`RoomVisitors`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `relay_novel`.`RoomVisitors` (
  `visitorId` INT NOT NULL,
  `roomId` INT NOT NULL,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `createdAt` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`visitorId`, `roomId`),
  INDEX `idx_roomVisitors_visitorId` (`visitorId` ASC) VISIBLE,
  INDEX `idx_roomVisitors_roomId` (`roomId` ASC) VISIBLE,
  CONSTRAINT `fx_roomVisitors_visitorId`
    FOREIGN KEY (`visitorId`)
    REFERENCES `relay_novel`.`Users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fx_roomVisitors_roomId`
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
  `text` TEXT NULL,
  `roomId` INT NOT NULL,
  `userId` INT NOT NULL,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `createdAt` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  INDEX `idx_comments_userId` (`userId` ASC) INVISIBLE,
  INDEX `idx_comments_roomId` (`roomId` ASC) VISIBLE,
  CONSTRAINT `fk_comments_roomId`
    FOREIGN KEY (`roomId`)
    REFERENCES `relay_novel`.`RoomVisitors` (`roomId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_comments_userId`
    FOREIGN KEY (`userId`)
    REFERENCES `relay_novel`.`RoomVisitors` (`visitorId`)
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


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
