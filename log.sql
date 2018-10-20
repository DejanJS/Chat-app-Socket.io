CREATE TABLE History( -- renamed to Users
	id INT, -- Primary key
	Timestamp TIMESTAMP with time zone, -- moved to Messages
	message TEXT,-- moved to Messages as Text
	username varchar(200)
);


ALTER TABLE History
ADD COLUMN pass TEXT;

ALTER TABLE History ADD PRIMARY KEY (id);

Select username from History;
SELECT * FROM Users;
ALTER TABLE History RENAME TO Users; --changing name to Users

CREATE TABLE Messages (
	Id SERIAL,
 	UserId int references Users(Id), -- foreign key
	Text TEXT,
 	Timestamp timestamp with time zone
);

ALTER TABLE Users DROP COLUMN Timestamp;
ALTER TABLE Users DROP COLUMN message;
ALTER TABLE Users ALTER COLUMN pass TYPE CHAR (256);
ALTER TABLE Users ALTER COLUMN username TYPE VARCHAR (255);
DELETE FROM Users; -- wipe all data
INSERT INTO Users(id,username,pass) VALUES(1,'John','12321');
INSERT INTO Messages(UserId,Text,Timestamp) VALUES(1,'hello world',current_timestamp);
SELECT 
Messages.id,
Users.username,
Messages.text,
Messages.timestamp
FROM Messages JOIN Users ON Users.id = Messages.UserId;
SELECT * FROM Users;
ALTER TABLE Users
ADD COLUMN Salt CHAR(16);
DELETE FROM Messages;
DELETE FROM Users; 
ALTER TABLE Users
ALTER COLUMN Salt TYPE VARCHAR(255);
SELECT COALESCE(MAX(ID)+1,1) as NewId FROM Users;


