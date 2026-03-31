CREATE TABLE IF NOT EXISTS Localisation (
    id INT PRIMARY KEY AUTO_INCREMENT,
    pays VARCHAR(100) NOT NULL,
    ville VARCHAR(100) NOT NULL,
    latitude DECIMAL(9,6),
    longitude DECIMAL(10,6)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS indice (
    id INT PRIMARY KEY AUTO_INCREMENT,
    indice FLOAT NOT NULL,
    localisation_id INT NOT NULL,
    date DATETIME NOT NULL,
    CONSTRAINT fk_localisation
      FOREIGN KEY (localisation_id)
      REFERENCES Localisation(id)
      ON DELETE CASCADE
) ENGINE=InnoDB;
