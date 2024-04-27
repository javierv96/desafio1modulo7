create database desafio1modulo7;

\c desafio1modulo7;

create table estudiantes (
	Rut VARCHAR(14) PRIMARY KEY,
	Nombre VARCHAR(25) NOT NULL,
	Curso VARCHAR(25) NOT NULL,
	Nivel INT NOT NULL
);