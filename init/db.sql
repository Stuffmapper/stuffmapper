CREATE USER stuffmapper WITH CREATEDB LOGIN SUPERUSER ENCRYPTED PASSWORD 'SuperSecretPassword1!';

CREATE DATABASE stuffmapper1 WITH OWNER stuffmapper;

\c stuffmapper1;

CREATE TABLE status (
	id BIGSERIAL PRIMARY KEY,
	name varchar(32)
);

CREATE TABLE users (
	id BIGSERIAL PRIMARY KEY,
	fname varchar(32),
	lname varchar(32),
	uname varchar(32) UNIQUE NOT NULL,
	email varchar(64) UNIQUE NOT NULL,
	password text,
	password_reset_token text UNIQUE,
	phone_number varchar(10),
	verify_email_token varchar(32) UNIQUE DEFAULT md5(random()::text),
	verified_email boolean DEFAULT false,
	admin boolean DEFAULT false,
	date_created timestamp DEFAULT current_timestamp,
	last_sign_in timestamp DEFAULT current_timestamp,
	google_id text,
	facebook_id text,
	image_url text,
	news_letter boolean DEFAULT false,
	date_archived timestamp DEFAULT current_timestamp,
	archived boolean DEFAULT false,
	country varchar(32),
	city varchar(32),
	state varchar(32),
	zip_code varchar(10),
	address varchar(64),
	braintree_token text
);

CREATE TABLE ip_addresses (
	id BIGSERIAL PRIMARY KEY,
	user_id integer REFERENCES users(id),
	ip_address varchar(16)
);

CREATE TABLE addresses (
	id BIGSERIAL PRIMARY KEY,
	user_id integer REFERENCES users(id),
	main_address boolean DEFAULT false,
	country varchar(32),
	city varchar(32),
	state varchar(32),
	zip_code varchar(10),
	address varchar(64)
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
	date_edited timestamp DEFAULT current_timestamp,
	lat FLOAT NOT NULL,
	lng FLOAT NOT NULL,
	attended boolean NOT NULL,
	category_id integer REFERENCES categories(id),
	dibbed boolean DEFAULT false,
	dibber_id integer REFERENCES users(id),
	quality integer,
	date_archived timestamp,
	archived boolean DEFAULT false,
	expired boolean DEFAULT false,
	date_expired timestamp,
	transaction_id text,
	suspended boolean DEFAULT false,
	date_suspended timestamp
);

CREATE TABLE pick_up_success (
	id BIGSERIAL PRIMARY KEY,
	post_id integer REFERENCES posts(id),
	dibber_id integer REFERENCES users(id),
	lister_id integer REFERENCES users(id),
	pick_up_init timestamp DEFAULT current_timestamp,
	pick_up_success boolean DEFAULT FALSE,
	undibbed boolean DEFAULT FALSE,
	undibbed_date timestamp,
	pick_up_date timestamp,
	rejected boolean,
	rejection_date timestamp,
	omw_attempt integer DEFAULT 0,
	omw boolean DEFAULT FALSE,
	omw_time timestamp,
	omw_lat FLOAT,
	omw_lng FLOAT,
	dib_lat FLOAT,
	dib_lng FLOAT
);

CREATE TABLE images (
	id BIGSERIAL PRIMARY KEY,
	post_id integer REFERENCES posts(id),
	image_url varchar(255) NOT NULL,
	main boolean DEFAULT false,
	quality integer,
	date_archived timestamp DEFAULT current_timestamp,
	archived boolean DEFAULT false
);

CREATE TABLE tag_names (
	id BIGSERIAL PRIMARY KEY,
	date_created timestamp DEFAULT current_timestamp,
	tag_name varchar(32) UNIQUE NOT NULL
);

CREATE TABLE tags (
	id BIGSERIAL PRIMARY KEY,
	date_created timestamp DEFAULT current_timestamp,
	post_id integer REFERENCES posts(id),
	name integer REFERENCES tag_names(id)
);

CREATE TABLE conversations (
	id BIGSERIAL PRIMARY KEY,
	post_id integer REFERENCES posts(id),
	date_created timestamp DEFAULT current_timestamp,
	date_edited timestamp DEFAULT current_timestamp,
	lister_id integer REFERENCES users(id),
	dibber_id integer REFERENCES users(id),
	archived boolean DEFAULT false
);

CREATE TABLE messages (
	id BIGSERIAL PRIMARY KEY,
	user_id integer REFERENCES users(id),
	conversation_id integer REFERENCES conversations(id),
	message text NOT NULL,
	date_created timestamp DEFAULT current_timestamp,
	date_edited timestamp DEFAULT current_timestamp,
	read boolean DEFAULT false,
	archived boolean DEFAULT false,
	emailed boolean DEFAULT false
);

CREATE TABLE watchlist_items (
	id BIGSERIAL PRIMARY KEY,
	user_id integer REFERENCES users(id),
	archived boolean DEFAULT false,
	radius_miles FLOAT DEFAULT 15.0
);

CREATE TABLE watchlist_keys (
	id BIGSERIAL PRIMARY KEY,
	watchlist_item integer REFERENCES watchlist_items(id),
	tag_id integer REFERENCES tag_names(id),
	category_id integer REFERENCES categories(id)
);

-- user does not have to be logged in
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

CREATE TABLE event (
	id BIGSERIAL PRIMARY KEY,
	-- event_message_id integer REFERENCES event_title(id),
	post_id integer REFERENCES posts(id),
	user_id1 integer REFERENCES users(id),
	user_id2 integer REFERENCES users(id),
	date_created timestamp DEFAULT current_timestamp,
	message text,
	level integer
);

-- CREATE TABLE event_message (
-- 	id BIGSERIAL PRIMARY KEY,
-- 	message text
-- );

INSERT INTO categories (category) VALUES
('Arts & Crafts'),
('Books, Games, Media'),
('Building & Garden Materials'),
('Clothing & Accessories'),
('Electronics'),
('Furniture & Household'),
('General'),
('Kids & Babies'),
('Recreation');

-- INSERT INTO event_message (message) VALUES
-- ('{{title}} was dibs\'d by {{dibber}}'),
-- ('{{title}} was undibs\'d by {{dibber}}'),
-- ('{{lister}} rejected you for {{title}}'),
-- ('{{dibber}} picked up {{title}}'),
-- ('You picked up {{title}}'),
-- ('You deleted {{title}}'),
-- ('You rejected {{user}} from {{title}}'),
-- ('You undibs\'d {{title}}'),
-- ('You dibs\'d {{title}}'),
-- ('Your dibs was cancelled; you did not message the user'),
