CREATE USER stuffmapper WITH CREATEDB LOGIN SUPERUSER ENCRYPTED PASSWORD 'SuperSecretPassword1!';

CREATE DATABASE stuffmapper WITH OWNER stuffmapper;

\c stuffmapper;

CREATE TABLE social_login (

);

CREATE TABLE pick_up_success (
    id BIGSERIAL PRIMARY KEY,
    dibber_id interger REFERENCES users(id),
    lister_id interger REFERENCES users(id),
    pick_up_success boolean DEFAULT FALSE
);

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    fname varchar(32) NOT NULL,
    lname varchar(32) NOT NULL,
    uname varchar(32) UNIQUE NOT NULL,
    email varchar(64) UNIQUE NOT NULL,
    password text NOT NULL,
    password_reset_token text NOT NULL,
    status varchar(32),
    phone_number varchar(10),
    verify_email_token varchar(64),
    verified_email boolean DEFAULT false,
    admin boolean DEFAULT false,
    date_created timestamp DEFAULT current_timestamp,
    last_sign_in timestamp DEFAULT current_timestamp,
    image_url text
);

CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    category varchar(32) UNIQUE NOT NULL
);

CREATE TABLE status (
    id BIGSERIAL PRIMARY KEY,
    name varchar(32)
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
    category integer REFERENCES categories(id),
    dibbed boolean DEFAULT false,
    dibber integer REFERENCES users(id),
    on_the_curb boolean NOT NULL
);

CREATE TABLE images (
    id BIGSERIAL PRIMARY KEY,
    post_id integer REFERENCES posts(id),
    image_url varchar(255) NOT NULL
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

CREATE TABLE watchlist (
    id BIGSERIAL PRIMARY KEY,
    user_id integer REFERENCES users(id)
);

CREATE TABLE watchlist_items (
    id BIGSERIAL PRIMARY KEY,
    tag_id integer REFERENCES tags(id),
    category_id integer REFERENCES categories(id)
);

WATCHLIST think of
    geolaction (radius), incl max radius
    max items on list (10)


emails
    appropriate flagging
    match search for (terms)

tax writable stuff
    fair market cost

div & deliver


------------------------------------------------------

brainstormed IP stuff mentioned

trademarking stuffmapper, dibs, and landfill tracker
trademark circle S logo
make a trademarkable logo delaney please
