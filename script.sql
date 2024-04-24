create database desafio1modulo7;

\c desafio1modulo7;

create table estudiantes (
	Nombre VARCHAR(25) NOT NULL,
	Rut VARCHAR(14) PRIMARY KEY,
	Curso VARCHAR(25) NOT NULL,
	Nivel INT NOT NULL
);