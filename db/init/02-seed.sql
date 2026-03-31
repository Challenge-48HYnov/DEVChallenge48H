INSERT INTO Localisation (pays, ville, latitude, longitude) VALUES
('France', 'Paris', 48.8566, 2.3522),
('France', 'Lyon', 45.7640, 4.8357),
('Belgique', 'Bruxelles', 50.8503, 4.3517),
('Suisse', 'Zurich', 47.3769, 8.5417),
('Allemagne', 'Berlin', 52.5200, 13.4050)
ON DUPLICATE KEY UPDATE pays = VALUES(pays);

INSERT INTO indice (date, indice, localisation_id) VALUES
('2024-01-15 00:00:00', 95.5, 1),
('2024-01-16 00:00:00', 98.2, 1),
('2024-01-15 00:00:00', 92.1, 2),
('2024-01-16 00:00:00', 94.3, 2),
('2024-01-15 00:00:00', 97.8, 3),
('2024-01-16 00:00:00', 96.5, 3),
('2024-01-15 00:00:00', 93.2, 4),
('2024-01-16 00:00:00', 91.7, 4),
('2024-01-15 00:00:00', 99.1, 5),
('2024-01-16 00:00:00', 98.9, 5)
ON DUPLICATE KEY UPDATE indice = VALUES(indice);
