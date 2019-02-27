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

/*
drop
*/
drop database relay_novel;
drop table tag;
drop table if exists comments, notices, room, room_user, roomjoinedusers, rooms, sentences, tag, user, users;

/*
insert test
*/
insert into users(userId, nickname, email, password, salt, thumbnail) values('user1', 'nickname1', 'email1@abcd.com', 'password1', 'salt1', 'thumbnail1');

/*
select
*/
select * from users;
