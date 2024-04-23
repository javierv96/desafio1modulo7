create database desafio1modulo7;

\c desafio1modulo7;

create table estudiantes (
	nombre VARCHAR(25) NOT NULL,
	rut VARCHAR(14) PRIMARY KEY,
	curso VARCHAR(25) NOT NULL,
	nivel INT NOT NULL
);