create database if not exists relay_novel; 
use relay_novel;

/*
show
*/
show databases;
show tables;

/*
desc
*/
desc comments;
desc users;
desc notices;
desc rooms;
desc roomJoinedUsers;
desc sentences;
desc roomvisitors;
desc room;
desc sentenceslikes;
/*
drop
*/
drop database if exists relay_novel;
drop table if exists tag;
drop table if exists comments, notices, room, room_user, roomjoinedusers, rooms, sentences, tag, user, users;

/*
insert test
*/
insert into roomsinfo(total) values (0);
insert into users( nickname, email, `password`, salt, thumbnail, `type`) values('nickname1', 'email12@abcd.com', 'password1', 'salt1', 'thumbnail1', 'local');
insert into notices(title, `desc`, creatorId) values('title1', 'desc1', 'user1');
insert into rooms(tags, title, `desc`, creatorId, writerlimit) values('#tag1#tag2', 'title1', 'desc1', 1, 1);
insert into rooms(tags, title, `desc`, creatorId) values('#tag1#tag2', 'title2', 'desc2', 2);
select json_set('{"a": 1, "b": 2}');
SELECT JSON_SET('{"a": 1, "b": 2}', '$.c', 3) AS 'Result';
insert into roomJoinedUsers(userId, roomId) values(2, 1);
insert into sentences(text, roomId, userId) values('text1', 1, 1);
insert into comments(text, roomid, userid) values('text1', 1, 'user1');
insert into roomlikedislike(roomId, userId, isLike) values(3, 1, false);
insert into roomlikedislike(roomId, userId, isLike) values(3, 2, false);
insert into roomlikedislike(roomId, userId, isLike) values(1, 2, false);
insert into sentencesInfo(roomId, userId) values(1, 1);
INSERT INTO sentenceslikes(sentenceId, userId, roomId, isLike) VALUES (1, 2, 1, true) ON DUPLICATE KEY UPDATE isLike = true;
/*
select 
*/
select * from comments;
select * from roomlikes;
select * from roomjoinedusersinfo;
select * from roomsinfo;
select * from sentencesInfo;
select * from users;
select * from rooms;
select * from roomJoinedusers;
select * from sentenceslikes;
select writeable from roomJoinedusers where userId = 2 AND roomId = 1;
select * from roomlikedislike;
select * from sentences;
SELECT nickname, thumbnail FROM users join (SELECT userId FROM roomJoinedUsers where roomId = 12) as A where users.id = A.userId AND isDeleted = false;
SELECT id FROM users JOIN (SELECT userId FROM roomJoinedUsers WHERE roomId = 2) AS a WHERE users.id = a.userId AND isDeleted = false;
SELECT id, nickname, thumbnail, writeable FROM users JOIN (SELECT userId FROM roomJoinedUsers WHERE roomId = 1) AS a WHERE users.id = a.userId AND isDeleted = false;
SELECT isLike, `text`, userId, updatedAt, createdAt, `like`, dislike
 FROM (
 (
   SELECT `text`, userId, updatedAt, createdAt, `like`, dislike 
   FROM sentences 
   WHERE roomId = 1 AND isDeleted = false
   ) as a
     LEFT JOIN
  (
  select userId, isLike 
  from sentencesLikes 
  where roomId = 1 AND userId = 1
  ) as b
  ON a.userId = b.userId
  );
  
SELECT id, isLike, `text`, updatedAt, createdAt, `like`, dislike from (select id, `text`, userId, updatedAt, createdAt, `like`, dislike from sentences where roomId = 2) as a left join  (
  select sentenceId, userId, isLike 
  from sentencesLikes 
  where roomId = 2 AND userId = 1
  ) as b
  ON a.id = b.sentenceId;
  
  select id, `text`, userId, updatedAt, createdAt, `like`, dislike from sentences where roomId = 2;
  select sentenceId, userId, isLike from sentencesLikes where roomId = 2 AND userId = 1;
/*
DELETE
*/
delete from rooms where id=2;
delete from roomlikedislike where roomId = 3;
/*
transaction
*/
start transaction;
select * from users;
update users set nickname = 'updated' where id = 5;
commit;

/*
alter
*/
alter table rooms add column `like` int default 0;
alter table comments add column `like` int default 0;
alter table sentences add column `like` int default 0;
alter table rooms modify `like` JSON;
alter table comments modify `like` JSON;
alter table sentences modify `like` JSON;
/*
trigger
*/
show triggers;
drop trigger SentencesLikes_BEFORE_UPDATE;

DELIMITER $$
CREATE DEFINER = CURRENT_USER TRIGGER `relay_novel`.`RoomLikeDislike_AFTER_DELETE` AFTER DELETE ON `RoomLikeDislike` FOR EACH ROW
BEGIN
	IF (OLD.isLike = true) THEN
		UPDATE rooms SET `like` = `like` - 1 WHERE id = OLD.roomId;
	ELSE 
		UPDATE rooms SET `dislike` = `dislike` - 1 WHERE id = OLD.roomId;
	END IF;
END $$
DELIMITER ;

DELIMITER $$
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

    END $$
DELIMITER ;

DELIMITER $$
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
END $$
DELIMITER ;
