BEGIN;


DROP TABLE IF EXISTS usernames;
DROP TABLE IF EXISTS round;

create table usernames (
    name CITEXT PRIMARY KEY,
	password VARCHAR(50)
);
create table round (
	id SERIAL PRIMARY KEY,
    doodle VARCHAR(100)
);

insert into usernames (name, password) values ('aysam', '1234');
insert into usernames (name, password) values ('najwan', '1234');
insert into usernames (name, password) values ('yousef', '1234');
insert into usernames (name, password) values ('mario', '1234');
insert into usernames (name, password) values ('rabeea', '1234');
insert into usernames (name, password) values ('ivan', '1234');
insert into usernames (name, password) values ('lina', '1234');
insert into usernames (name, password) values ('mina', '1234');
insert into usernames (name, password) values ('shireen', '1234');
insert into usernames (name, password) values ('fatima', '1234');
insert into usernames (name, password) values ('mahmood', '1234');
insert into usernames (name, password) values ('francis', '1234');
insert into usernames (name, password) values ('ghazal', 'ghazal');
insert into usernames (name, password) values ('sima', 'sima');
insert into usernames (name, password) values ('adhm', 'adhm');




insert into round (doodle) values ('camel');
insert into round (doodle) values ('car');
insert into round (doodle) values ('mario');
insert into round (doodle) values ('snake');
insert into round (doodle) values ('nature');
insert into round (doodle) values ('guitar');
insert into round (doodle) values ('sea');
insert into round (doodle) values ('laptop');
insert into round (doodle) values ('chair');





COMMIT;

