-- ==========================================
-- SmartCampusUNGE - Esquema Base de Datos
-- ==========================================

-- Usuarios y roles
CREATE TABLE Usuarios (
    id_usuario SERIAL PRIMARY KEY,
    nombre VARCHAR(100),
    correo VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol VARCHAR(50) CHECK (rol IN ('estudiante','profesor','radio','superadmin'))
);

-- Facultades
CREATE TABLE Facultades (
    id_facultad SERIAL PRIMARY KEY,
    nombre VARCHAR(100) UNIQUE
);

-- Departamentos
CREATE TABLE Departamentos (
    id_departamento SERIAL PRIMARY KEY,
    nombre VARCHAR(100) UNIQUE
);

-- Asignaturas
CREATE TABLE Asignaturas (
    id_asignatura SERIAL PRIMARY KEY,
    nombre VARCHAR(100) UNIQUE
);

-- Edificios y aulas
CREATE TABLE Edificios (
    id_edificio SERIAL PRIMARY KEY,
    nombre VARCHAR(100),
    descripcion TEXT,
    latitud NUMERIC,
    longitud NUMERIC
);

-- Relaciones muchos-a-muchos
CREATE TABLE ProfesorFacultad (
    id_profesor INT REFERENCES Usuarios(id_usuario),
    id_facultad INT REFERENCES Facultades(id_facultad),
    PRIMARY KEY (id_profesor, id_facultad)
);

CREATE TABLE ProfesorDepartamento (
    id_profesor INT REFERENCES Usuarios(id_usuario),
    id_departamento INT REFERENCES Departamentos(id_departamento),
    PRIMARY KEY (id_profesor, id_departamento)
);

CREATE TABLE ProfesorAsignatura (
    id_profesor INT REFERENCES Usuarios(id_usuario),
    id_asignatura INT REFERENCES Asignaturas(id_asignatura),
    PRIMARY KEY (id_profesor, id_asignatura)
);

CREATE TABLE ProfesorAula (
    id_profesor INT REFERENCES Usuarios(id_usuario),
    id_aula INT REFERENCES Edificios(id_edificio),
    PRIMARY KEY (id_profesor, id_aula)
);

-- Materiales académicos
CREATE TABLE Materiales (
    id_material SERIAL PRIMARY KEY,
    id_usuario INT REFERENCES Usuarios(id_usuario),
    asignatura VARCHAR(100),
    archivo VARCHAR(255),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transporte y métricas
CREATE TABLE Transporte (
    id_linea SERIAL PRIMARY KEY,
    nombre_linea VARCHAR(100),
    descripcion TEXT,
    paradas JSONB,
    tiempos JSONB,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Programas de radio
CREATE TABLE RadioProgramas (
    id_programa SERIAL PRIMARY KEY,
    titulo VARCHAR(100),
    descripcion TEXT,
    tipo VARCHAR(50) CHECK (tipo IN ('vivo','retransmitido','musica')),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Estadísticas de radio
CREATE TABLE EstadisticasRadio (
    id_estadistica SERIAL PRIMARY KEY,
    oyentes INT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    programa_id INT REFERENCES RadioProgramas(id_programa)
);

-- Asistencia profesores vía QR
CREATE TABLE Asistencia (
    id_asistencia SERIAL PRIMARY KEY,
    id_profesor INT REFERENCES Usuarios(id_usuario),
    id_aula INT REFERENCES Edificios(id_edificio),
    id_asignatura INT REFERENCES Asignaturas(id_asignatura),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(20) CHECK (estado IN ('presente','ausente','tarde')),
    metodo VARCHAR(50) DEFAULT 'QR'
);

-- Sensores ambientales y WiFi
CREATE TABLE Sensores (
    id_sensor SERIAL PRIMARY KEY,
    tipo VARCHAR(50) CHECK (tipo IN ('temperatura','humedad','co2','wifi')),
    valor NUMERIC,
    id_aula INT REFERENCES Edificios(id_edificio),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Gestión energética de aulas
CREATE TABLE EnergiaAulas (
    id_energia SERIAL PRIMARY KEY,
    id_aula INT REFERENCES Edificios(id_edificio),
    temperatura NUMERIC,
    humedad NUMERIC,
    co2 NUMERIC,
    luces BOOLEAN DEFAULT FALSE,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Huella de actividad de usuarios
CREATE TABLE HuellaActividad (
    id_huella SERIAL PRIMARY KEY,
    id_usuario INT REFERENCES Usuarios(id_usuario),
    accion TEXT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Configuración del sistema (SuperAdmin)
CREATE TABLE ConfiguracionSistema (
    id_config SERIAL PRIMARY KEY,
    clave VARCHAR(100) UNIQUE NOT NULL,
    valor TEXT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_por INT REFERENCES Usuarios(id_usuario)
);
