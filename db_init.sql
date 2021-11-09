CREATE TABLE users (
	id INT NOT NULL AUTO_INCREMENT,
	account VARCHAR(255) NOT NULL,
	name VARCHAR(255) NOT NULL,
	email VARCHAR(255) NOT NULL,
	password VARCHAR(255) NOT NULL,
	created TIMESTAMP(3) NOT NULL,
	updated TIMESTAMP(3) NOT NULL,
	PRIMARY KEY (id)
);

CREATE TABLE organizations (
	id INT NOT NULL AUTO_INCREMENT,
	name VARCHAR(255) NOT NULL,
	created TIMESTAMP(3) NOT NULL,
	updated TIMESTAMP(3) NOT NULL,
	PRIMARY KEY (id)
);

CREATE TABLE tokens (
	id INT NOT NULL AUTO_INCREMENT,
	user_id INT NOT NULL,
	value VARCHAR(255) NOT NULL,
	created TIMESTAMP(3) NOT NULL,
	updated TIMESTAMP(3) NOT NULL,
	valid VARCHAR(1) NOT NULL DEFAULT("Y"),
	FOREIGN KEY (user_id) REFERENCES users(id),
	PRIMARY KEY (id)
);

CREATE TABLE user_relations (
	id INT NOT NULL AUTO_INCREMENT,
	user_id INT NOT NULL,
	organization_id INT NOT NULL,
	role VARCHAR(255) NOT NULL,
	created TIMESTAMP(3) NOT NULL,
	PRIMARY KEY (id),
	FOREIGN KEY (user_id) REFERENCES users(id),
	FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

CREATE TABLE daily_reports (
	id INT NOT NULL AUTO_INCREMENT,
	user_id INT NOT NULL,
	organization_id INT NOT NULL,
	content VARCHAR(255) NOT NULL,
	date VARCHAR(15) NOT NULL,
	created TIMESTAMP(3) NOT NULL,
	updated TIMESTAMP(3),
	PRIMARY KEY (id),
	FOREIGN KEY (user_id) REFERENCES users(id),
	FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

CREATE TABLE change_logs (
	id INT NOT NULL AUTO_INCREMENT,
	title VARCHAR(255) NOT NULL,
	platform VARCHAR(255) NOT NULL,
	author VARCHAR(255) NOT NULL,
	content VARCHAR(1024) NOT NULL,
	created TIMESTAMP(3) NOT NULL,
	PRIMARY KEY (id)
);

-- CREATE TABLE report_email_tasks (
-- 	id INT NOT NULL AUTO_INCREMENT,
-- 	author_id INT NOT NULL,
-- 	organization_id INT NOT NULL,
-- 	title VARCHAR(100) NOT NULL,
-- 	activate VARCHAR(1) NOT NULL DEFAULT("N"),
-- 	meta_data VARCHAR(1024),
-- 	content VARCHAR(2048),
-- 	html VARCHAR(2048),
-- 	PRIMARY KEY (id),
-- 	FOREIGN KEY (author_id) REFERENCES users(id),
-- 	FOREIGN KEY (organization_id) REFERENCES organizations(id)
-- );

-- CREATE TABLE remind_email_tasks (
-- 	id INT NOT NULL AUTO_INCREMENT,
-- 	author_id INT NOT NULL,
-- 	organization_id INT NOT NULL,
-- 	title VARCHAR(100) NOT NULL,
-- 	activate VARCHAR(1) NOT NULL DEFAULT("N"),
-- 	meta_data VARCHAR(1024),
-- 	content VARCHAR(2048),
-- 	html VARCHAR(2048),
-- 	PRIMARY KEY (id),
-- 	FOREIGN KEY (author_id) REFERENCES users(id),
-- 	FOREIGN KEY (organization_id) REFERENCES organizations(id)
-- );