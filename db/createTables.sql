create TABLE users(
	id SERIAL PRIMARY KEY,
	login VARCHAR(255),
	password VARCHAR(255),
	datetime TIMESTAMP
);
create TABLE rating(
	id SERIAL PRIMARY KEY,
	rating INTEGER,
	datetime TIMESTAMP,
	login_id INTEGER,
	FOREIGN KEY (login_id) REFERENCES users (id)
);