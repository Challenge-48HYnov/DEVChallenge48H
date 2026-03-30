CREATE DATABASE IF NOT EXISTS projet48h;
USE projet48h;


CREATE TABLE IF NOT EXISTS Localisation (
    id INT PRIMARY KEY AUTO_INCREMENT,
    pays VARCHAR(100) NOT NULL,
    ville VARCHAR(100) NOT NULL,
    latitude DECIMAL(9,6),
    longitude DECIMAL(10,6)
);

CREATE TABLE IF NOT EXISTS Indice (
    id INT PRIMARY KEY AUTO_INCREMENT,
    indice FLOAT NOT NULL,
    localisation_id INT NOT NULL,
    date DATETIME NOT NULL,
    CONSTRAINT fk_localisation
        FOREIGN KEY (localisation_id) 
        REFERENCES Localisation(id)
        ON DELETE CASCADE
);
