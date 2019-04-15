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
desc roomlikedislike;
/*
drop
*/
drop database if exists relay_novel;
drop table if exists tag;
drop table if exists comments, notices, room, room_user, roomjoinedusers, rooms, sentences, tag, user, users;

/*
insert test
*/
insert into users( nickname, email, `password`, salt, thumbnail, `type`) values('nickname1', 'email1@abcd.com', 'password1', 'salt1', 'thumbnail1', 'local');
insert into notices(title, `desc`, creatorId) values('title1', 'desc1', 'user1');
insert into rooms(tags, title, `desc`, creatorId) values('#tag1#tag2', 'title1', 'desc1', 1);
insert into rooms(tags, title, `desc`, creatorId) values('#tag1#tag2', 'title2', 'desc2', 2);
select json_set('{"a": 1, "b": 2}');
SELECT JSON_SET('{"a": 1, "b": 2}', '$.c', 3) AS 'Result';
insert into roomJoinedUsers(userId, roomId) values('user1', 1);
insert into sentences(text, roomId, userId) values('text1', 1, 'user1');
insert into comments(text, roomid, userid) values('text1', 1, 'user1');
insert into roomlikedislike(roomId, userId, isLike) values(3, 1, false);
insert into roomlikedislike(roomId, userId, isLike) values(3, 2, false);
insert into roomlikedislike(roomId, userId, isLike) values(1, 2, false);
/*
select 
*/
select * from users;
select * from rooms;
select * from roomJoinedusers;
select * from roomlikedislike;
SELECT nickname, thumbnail FROM users join (SELECT userId FROM roomJoinedUsers where roomId = 1) as A where users.id = A.userId;
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
drop trigger RoomLikeDislike_AFTER_INSERT;

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

