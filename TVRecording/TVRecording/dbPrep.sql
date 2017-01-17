drop table if exists shows;
drop table if exists episodes;

create table shows (
  id integer primary key,
  name text not null,
  url text
);

create table episodes (
	id integer primary key,
	show_name text not null,
	episode_name text not null,
	date_aired date,
	season integer,
	episode_num integer,
	recorded integer
	);