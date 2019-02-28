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
/*
drop
*/
drop database if exists relay_novel;
drop table if exists tag;
drop table if exists comments, notices, room, room_user, roomjoinedusers, rooms, sentences, tag, user, users;

/*
insert test
*/
insert into users(id, nickname, email, `password`, salt, thumbnail) values('user1', 'nickname1', 'email1@abcd.com', 'password1', 'salt1', 'thumbnail1');
insert into notices(title, `desc`, creatorId) values('title1', 'desc1', 'user1');
insert into rooms(tags, title, `desc`, creatorId) values('#tag1#tag2', 'title1', 'desc1', 'user1');
insert into roomJoinedUsers(userId, roomId) values('user1', 1);
insert into sentences(text, roomId, userId) values('text1', 1, 'user1');
insert into roomvisitors(visitorid, roomid) values('user1', 1);
insert into comments(text, roomid, userid) values('text1', 1, 'user1');
/*
select
*/
