CREATE DATABASE documindai_db;
CREATE USER 'documindai_user'@'%' IDENTIFIED BY 'documindai_pass';
GRANT ALL PRIVILEGES ON documindai_db.* TO 'documindai_user'@'%';
FLUSH PRIVILEGES;
