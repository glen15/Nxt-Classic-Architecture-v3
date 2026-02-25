CREATE DATABASE IF NOT EXISTS texts;
USE texts;

CREATE TABLE IF NOT EXISTS texts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    text TEXT NOT NULL,
    username VARCHAR(255) NOT NULL
);

INSERT INTO texts (text, username) VALUES
('인생은 짧고, 예술은 길다 ...아마도...', '히포크라테스'),
('나는 생각한다, 고로 존재한다 ...아마도...', '데카르트'),
('지식이 힘이다 ...아마도...', '프랜시스 베이컨');
