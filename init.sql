CREATE DATABASE cats_api;

USE cats_api;

CREATE TABLE cats(
    id INT PRIMARY KEY,
    cat_name VARCHAR(255) NOT NULL,
    breed VARCHAR(255),
    age INT
);