# Creacion de las tablas de la base de datos
CREATE DATABASE IF NOT EXISTS rankia;
USE rankia;
-- =========================
-- TABLA USUARIOS
-- =========================
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- TABLA PREFERENCIAS USUARIO
-- =========================
CREATE TABLE preferencias_usuario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL UNIQUE,
    tipo_preferido ENUM('pelicula','serie','ambos') NOT NULL,
    duracion_preferida ENUM('corta','media','larga','indiferente') NOT NULL,
    max_temporadas ENUM('1','2-3','4+','indiferente') NOT NULL,
    preferencia_popularidad ENUM('popular','indiferente','menos_conocido') NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- =========================
-- TABLA GENEROS
-- =========================
CREATE TABLE generos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);

-- =========================
-- GENEROS FAVORITOS DEL USUARIO
-- =========================
CREATE TABLE usuario_generos (
    usuario_id INT NOT NULL,
    genero_id INT NOT NULL,
    PRIMARY KEY (usuario_id, genero_id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (genero_id) REFERENCES generos(id) ON DELETE CASCADE
);

-- =========================
-- TABLA CONTENIDOS (PELÍCULAS/SERIES)
-- =========================
CREATE TABLE contenidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    external_id VARCHAR(50) NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    tipo ENUM('pelicula','serie') NOT NULL,
    sinopsis TEXT,
    poster VARCHAR(255),
    fecha_lanzamiento DATE,
    duracion INT NULL,
    numero_temporadas INT NULL,
    popularidad DECIMAL(10,2) NULL,
    UNIQUE (external_id, tipo)
);

-- =========================
-- GENEROS DE CADA CONTENIDO
-- =========================
CREATE TABLE contenido_generos (
    contenido_id INT NOT NULL,
    genero_id INT NOT NULL,
    PRIMARY KEY (contenido_id, genero_id),
    FOREIGN KEY (contenido_id) REFERENCES contenidos(id) ON DELETE CASCADE,
    FOREIGN KEY (genero_id) REFERENCES generos(id) ON DELETE CASCADE
);

-- =========================
-- TABLA LISTAS
-- =========================
CREATE TABLE listas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    tipo_lista ENUM('predefinida','personalizada') NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- =========================
-- CONTENIDOS DENTRO DE LISTAS
-- =========================
CREATE TABLE lista_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lista_id INT NOT NULL,
    contenido_id INT NOT NULL,
    fecha_agregado DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (lista_id, contenido_id),
    FOREIGN KEY (lista_id) REFERENCES listas(id) ON DELETE CASCADE,
    FOREIGN KEY (contenido_id) REFERENCES contenidos(id) ON DELETE CASCADE
);

-- =========================
-- TABLA RESEÑAS
-- =========================
CREATE TABLE resenas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    contenido_id INT NOT NULL,
    puntuacion TINYINT NOT NULL CHECK (puntuacion BETWEEN 1 AND 5),
    comentario TEXT,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME NULL,
    UNIQUE (usuario_id, contenido_id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (contenido_id) REFERENCES contenidos(id) ON DELETE CASCADE
);