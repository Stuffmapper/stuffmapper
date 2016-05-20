CREATE USER stuffmapper WITH CREATEDB LOGIN SUPERUSER ENCRYPTED PASSWORD 'SuperSecretPassword1!';

CREATE DATABASE stuffmapper WITH OWNER stuffmapper;

\c stuffmapper;

CREATE TABLE status (
	id BIGSERIAL PRIMARY KEY,
	name varchar(32)
);

CREATE TABLE users (
	id BIGSERIAL PRIMARY KEY,
	fname varchar(32) NOT NULL,
	lname varchar(32) NOT NULL,
	uname varchar(32) UNIQUE NOT NULL,
	email varchar(64) UNIQUE NOT NULL,
	password text,
	password_reset_token text,
	status integer REFERENCES status(id),
	phone_number varchar(10),
	verify_email_token varchar(32) UNIQUE DEFAULT md5(random()::text),
	verified_email boolean DEFAULT false,
	admin boolean DEFAULT false,
	date_created timestamp DEFAULT current_timestamp,
	last_sign_in timestamp DEFAULT current_timestamp,
	google_id varchar(64),
	google_token varchar(64),
	facebook_id varchar(64),
	facebook_token varchar(64),
	image_url text
);

CREATE TABLE pick_up_success (
	id BIGSERIAL PRIMARY KEY,
	dibber_id integer REFERENCES users(id),
	lister_id integer REFERENCES users(id),
	pick_up_success boolean DEFAULT FALSE,
	pick_up_date timestamp
);

CREATE TABLE categories (
	id BIGSERIAL PRIMARY KEY,
	category varchar(32) UNIQUE NOT NULL
);

CREATE TABLE posts (
	id BIGSERIAL PRIMARY KEY,
	user_id integer REFERENCES users(id),
	title char(32) NOT NULL,
	description text,
	date_created timestamp DEFAULT current_timestamp,
	date_edited timestamp,
	date_picked_up timestamp,
	lat FLOAT NOT NULL,
	lng FLOAT NOT NULL,
	status integer REFERENCES status(id),
	category integer REFERENCES categories(id),
	dibbed boolean DEFAULT false,
	dibber integer REFERENCES users(id),
	on_the_curb boolean NOT NULL,
	quality integer
);

CREATE TABLE images (
	id BIGSERIAL PRIMARY KEY,
	post_id integer REFERENCES posts(id),
	image_url varchar(255) NOT NULL,
	main boolean DEFAULT false,
	quality integer
);

CREATE TABLE tag_names (
	id BIGSERIAL PRIMARY KEY,
	tag_name varchar(32) UNIQUE NOT NULL
);

CREATE TABLE tags (
	id BIGSERIAL PRIMARY KEY,
	post_id integer REFERENCES posts(id),
	name integer REFERENCES tag_names(id)
);

CREATE TABLE conversations (
	id BIGSERIAL PRIMARY KEY,
	post_id integer REFERENCES posts(id),
	date_created timestamp DEFAULT current_timestamp,
	date_edited timestamp DEFAULT current_timestamp
);

CREATE TABLE messages (
	id BIGSERIAL PRIMARY KEY,
	user_id integer REFERENCES users(id),
	messages text NOT NULL,
	date_created timestamp DEFAULT current_timestamp,
	date_edited timestamp DEFAULT current_timestamp
);

CREATE TABLE last_message_read (
	id BIGSERIAL PRIMARY KEY,
	message_read integer REFERENCES messages(id),
	user_id integer REFERENCES users(id),
	conversation_id integer REFERENCES conversations(id)
);

CREATE TABLE watchlist (
	id BIGSERIAL PRIMARY KEY,
	user_id integer REFERENCES users(id)
);

CREATE TABLE watchlist_items (
	id BIGSERIAL PRIMARY KEY,
	watchlist_id integer REFERENCES watchlist(id),
	archived boolean DEFAULT false,
	radius_miles FLOAT DEFAULT 15.0 NOT NULL
);

CREATE TABLE watchlist_keys (
	id BIGSERIAL PRIMARY KEY,
	watchlist_item integer REFERENCES watchlist_items(id),
	tag_id integer REFERENCES tags(id),
	category_id integer REFERENCES categories(id)
);

CREATE TABLE tracker (
	id BIGSERIAL PRIMARY KEY,
	user_id integer REFERENCES users(id)
);

CREATE TABLE tracker_action (
	id BIGSERIAL PRIMARY KEY,
	action varchar(16) NOT NULL
);

CREATE TABLE tracker_item (
	id BIGSERIAL PRIMARY KEY,
	tracker_id integer REFERENCES tracker(id),
	tracker_action integer REFERENCES tracker_action(id),
	tracker_time timestamp default current_timestamp
);
