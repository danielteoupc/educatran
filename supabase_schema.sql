-- ============================================================
-- EDUCATRAN — Schema Completo para Supabase
-- Ejecutar en: Supabase → SQL Editor → New Query → Run
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ────────────────────────────────────────────
-- TABLA: roles
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(50) NOT NULL UNIQUE,
  descripcion TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO roles (nombre, descripcion) VALUES
  ('admin',   'Administrador con acceso total al sistema'),
  ('gestor',  'Gestor de donaciones y patrocinadores — comisión 5%'),
  ('bombero', 'Bombero voluntario — registra visitas y entregas'),
  ('auditor', 'Solo lectura de reportes y finanzas')
ON CONFLICT (nombre) DO NOTHING;

-- ────────────────────────────────────────────
-- TABLA: usuarios (extiende auth.users)
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS usuarios (
  id        UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre    VARCHAR(150) NOT NULL,
  apellido  VARCHAR(150),
  email     VARCHAR(255),
  telefono  VARCHAR(20),
  rol_id    UUID REFERENCES roles(id),
  activo    BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────────
-- TABLA: gestores
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gestores (
  id                            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id                    UUID REFERENCES usuarios(id),
  nombre                        VARCHAR(150) NOT NULL,
  apellido                      VARCHAR(150),
  email                         VARCHAR(255),
  telefono                      VARCHAR(20),
  dni                           VARCHAR(20),
  banco                         VARCHAR(100),
  cuenta_bancaria               VARCHAR(60),
  cci                           VARCHAR(30),
  comision_porcentaje           DECIMAL(5,2) DEFAULT 5.00,
  total_donaciones_gestionadas  DECIMAL(15,2) DEFAULT 0,
  total_comisiones_pagadas      DECIMAL(15,2) DEFAULT 0,
  activo                        BOOLEAN DEFAULT TRUE,
  notas                         TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────────
-- TABLA: patrocinadores
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS patrocinadores (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  razon_social      VARCHAR(250) NOT NULL,
  nombre_comercial  VARCHAR(250),
  ruc               VARCHAR(20),
  pais              VARCHAR(100) DEFAULT 'Perú',
  ciudad            VARCHAR(100),
  direccion         TEXT,
  email_contacto    VARCHAR(255),
  telefono_contacto VARCHAR(20),
  nombre_contacto   VARCHAR(150),
  sector            VARCHAR(100),
  logo_url          TEXT,
  total_donado      DECIMAL(15,2) DEFAULT 0,
  activo            BOOLEAN DEFAULT TRUE,
  notas             TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────────
-- TABLA: estaciones_bomberos
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS estaciones_bomberos (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre          VARCHAR(250) NOT NULL,
  codigo          VARCHAR(50) UNIQUE,
  departamento    VARCHAR(100),
  provincia       VARCHAR(100),
  distrito        VARCHAR(100),
  direccion       TEXT,
  telefono        VARCHAR(20),
  email           VARCHAR(255),
  comandante      VARCHAR(150),
  num_voluntarios INTEGER DEFAULT 0,
  activa          BOOLEAN DEFAULT TRUE,
  notas           TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────────
-- TABLA: colegios
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS colegios (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre          VARCHAR(250) NOT NULL,
  codigo_modular  VARCHAR(50),
  nivel           VARCHAR(50),
  departamento    VARCHAR(100),
  provincia       VARCHAR(100),
  distrito        VARCHAR(100),
  direccion       TEXT,
  telefono        VARCHAR(20),
  email           VARCHAR(255),
  director        VARCHAR(150),
  num_alumnos     INTEGER DEFAULT 0,
  estacion_id     UUID REFERENCES estaciones_bomberos(id),
  activo          BOOLEAN DEFAULT TRUE,
  notas           TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────────
-- TABLA: kits_juegos
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS kits_juegos (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre              VARCHAR(250) NOT NULL,
  descripcion         TEXT,
  contenido           JSONB DEFAULT '[]',
  precio_unitario     DECIMAL(15,2),
  proveedor           VARCHAR(200),
  cantidad_producida  INTEGER DEFAULT 0,
  cantidad_disponible INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────────
-- TABLA: contratos
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contratos (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  numero_contrato     VARCHAR(100) UNIQUE,
  tipo                VARCHAR(100),
  patrocinador_id     UUID REFERENCES patrocinadores(id),
  gestor_id           UUID REFERENCES gestores(id),
  estacion_id         UUID REFERENCES estaciones_bomberos(id),
  colegio_id          UUID REFERENCES colegios(id),
  titulo              VARCHAR(350) NOT NULL,
  descripcion         TEXT,
  monto_comprometido  DECIMAL(15,2),
  moneda              VARCHAR(10) DEFAULT 'PEN',
  fecha_inicio        DATE,
  fecha_fin           DATE,
  estado              VARCHAR(50) DEFAULT 'borrador',
  archivo_url         TEXT,
  notas               TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────────
-- TABLA: donaciones
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS donaciones (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patrocinador_id   UUID REFERENCES patrocinadores(id),
  gestor_id         UUID REFERENCES gestores(id),
  contrato_id       UUID REFERENCES contratos(id),
  monto             DECIMAL(15,2) NOT NULL,
  moneda            VARCHAR(10) DEFAULT 'PEN',
  monto_usd         DECIMAL(15,2),
  tipo_cambio       DECIMAL(8,4),
  fecha_donacion    DATE NOT NULL,
  fecha_recepcion   DATE,
  metodo_pago       VARCHAR(100),
  referencia_pago   VARCHAR(200),
  estado            VARCHAR(50) DEFAULT 'pendiente',
  comision_gestor   DECIMAL(15,2),
  comision_pagada   BOOLEAN DEFAULT FALSE,
  descripcion       TEXT,
  comprobante_url   TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────────
-- TABLA: comisiones
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS comisiones (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gestor_id        UUID REFERENCES gestores(id),
  donacion_id      UUID REFERENCES donaciones(id),
  monto_donacion   DECIMAL(15,2),
  porcentaje       DECIMAL(5,2) DEFAULT 5,
  monto_comision   DECIMAL(15,2),
  fecha_calculo    DATE DEFAULT CURRENT_DATE,
  fecha_pago       DATE,
  metodo_pago      VARCHAR(100),
  referencia_pago  VARCHAR(200),
  estado           VARCHAR(50) DEFAULT 'pendiente',
  comprobante_url  TEXT,
  notas            TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────────
-- TABLA: visitas_entregas
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS visitas_entregas (
  id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  colegio_id                UUID REFERENCES colegios(id),
  estacion_id               UUID REFERENCES estaciones_bomberos(id),
  bombero_responsable_id    UUID REFERENCES usuarios(id),
  fecha_visita              DATE NOT NULL,
  hora_inicio               TIME,
  hora_fin                  TIME,
  kit_id                    UUID REFERENCES kits_juegos(id),
  cantidad_kits_entregados  INTEGER DEFAULT 0,
  num_alumnos_capacitados   INTEGER DEFAULT 0,
  num_profesores_presentes  INTEGER DEFAULT 0,
  temas_tratados            TEXT,
  observaciones             TEXT,
  fotos_urls                JSONB DEFAULT '[]',
  estado                    VARCHAR(50) DEFAULT 'programada',
  firma_director_url        TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────────
-- TABLA: gastos
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gastos (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tipo            VARCHAR(100) NOT NULL,
  categoria       VARCHAR(100),
  descripcion     TEXT NOT NULL,
  monto           DECIMAL(15,2) NOT NULL,
  moneda          VARCHAR(10) DEFAULT 'PEN',
  fecha           DATE NOT NULL,
  proveedor       VARCHAR(200),
  factura_numero  VARCHAR(100),
  comprobante_url TEXT,
  aprobado_por    UUID REFERENCES usuarios(id),
  estado          VARCHAR(50) DEFAULT 'pendiente',
  notas           TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────────
-- TABLA: equipos_bomberos
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS equipos_bomberos (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  estacion_id      UUID REFERENCES estaciones_bomberos(id),
  tipo_equipo      VARCHAR(200) NOT NULL,
  descripcion      TEXT,
  cantidad         INTEGER DEFAULT 1,
  valor_estimado   DECIMAL(15,2),
  proveedor        VARCHAR(200),
  fecha_entrega    DATE,
  estado           VARCHAR(50) DEFAULT 'pendiente',
  contrato_id      UUID REFERENCES contratos(id),
  notas            TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────────
-- RPC: incrementar total_donado en patrocinador
-- ────────────────────────────────────────────
CREATE OR REPLACE FUNCTION increment_patrocinador_total(pid UUID, amt DECIMAL)
RETURNS VOID AS $$
  UPDATE patrocinadores SET total_donado = COALESCE(total_donado, 0) + amt WHERE id = pid;
$$ LANGUAGE SQL;

-- ────────────────────────────────────────────
-- TRIGGER: auto-crear perfil usuario al registrarse
-- ────────────────────────────────────────────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  rol_default UUID;
BEGIN
  SELECT id INTO rol_default FROM roles WHERE nombre = 'admin' LIMIT 1;
  INSERT INTO usuarios (id, nombre, email, rol_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nombre', split_part(NEW.email, '@', 1)),
    NEW.email,
    rol_default
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ────────────────────────────────────────────
-- TRIGGER: calcular comisión al insertar donación
-- ────────────────────────────────────────────
CREATE OR REPLACE FUNCTION calcular_comision_donacion()
RETURNS TRIGGER AS $$
DECLARE
  pct DECIMAL;
BEGIN
  SELECT comision_porcentaje INTO pct FROM gestores WHERE id = NEW.gestor_id;
  IF pct IS NULL THEN pct := 5; END IF;
  NEW.comision_gestor := ROUND(NEW.monto * pct / 100, 2);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tg_comision_donacion ON donaciones;
CREATE TRIGGER tg_comision_donacion
  BEFORE INSERT ON donaciones
  FOR EACH ROW EXECUTE FUNCTION calcular_comision_donacion();

-- ────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ────────────────────────────────────────────
ALTER TABLE usuarios            ENABLE ROW LEVEL SECURITY;
ALTER TABLE gestores            ENABLE ROW LEVEL SECURITY;
ALTER TABLE patrocinadores      ENABLE ROW LEVEL SECURITY;
ALTER TABLE estaciones_bomberos ENABLE ROW LEVEL SECURITY;
ALTER TABLE colegios            ENABLE ROW LEVEL SECURITY;
ALTER TABLE donaciones          ENABLE ROW LEVEL SECURITY;
ALTER TABLE contratos           ENABLE ROW LEVEL SECURITY;
ALTER TABLE kits_juegos         ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitas_entregas    ENABLE ROW LEVEL SECURITY;
ALTER TABLE gastos              ENABLE ROW LEVEL SECURITY;
ALTER TABLE comisiones          ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipos_bomberos    ENABLE ROW LEVEL SECURITY;

-- Políticas: usuarios autenticados pueden leer/escribir todo
-- (Ajustar por rol en producción con función get_my_role())
CREATE POLICY "auth_all_usuarios"            ON usuarios            FOR ALL TO authenticated USING (true);
CREATE POLICY "auth_all_gestores"            ON gestores            FOR ALL TO authenticated USING (true);
CREATE POLICY "auth_all_patrocinadores"      ON patrocinadores      FOR ALL TO authenticated USING (true);
CREATE POLICY "auth_all_estaciones"          ON estaciones_bomberos FOR ALL TO authenticated USING (true);
CREATE POLICY "auth_all_colegios"            ON colegios            FOR ALL TO authenticated USING (true);
CREATE POLICY "auth_all_donaciones"          ON donaciones          FOR ALL TO authenticated USING (true);
CREATE POLICY "auth_all_contratos"           ON contratos           FOR ALL TO authenticated USING (true);
CREATE POLICY "auth_all_kits"               ON kits_juegos         FOR ALL TO authenticated USING (true);
CREATE POLICY "auth_all_visitas"             ON visitas_entregas    FOR ALL TO authenticated USING (true);
CREATE POLICY "auth_all_gastos"              ON gastos              FOR ALL TO authenticated USING (true);
CREATE POLICY "auth_all_comisiones"          ON comisiones          FOR ALL TO authenticated USING (true);
CREATE POLICY "auth_all_equipos"             ON equipos_bomberos    FOR ALL TO authenticated USING (true);

-- ────────────────────────────────────────────
-- DATOS DE DEMOSTRACIÓN
-- ────────────────────────────────────────────

-- Estaciones de bomberos
INSERT INTO estaciones_bomberos (nombre, codigo, departamento, provincia, distrito, direccion, comandante, num_voluntarios) VALUES
  ('CIA. de Bomberos Lima N°1',          'CB-LIM-001', 'Lima', 'Lima', 'Cercado de Lima', 'Jr. Camaná 300, Lima',          'Cnel. José Rodríguez Vargas', 45),
  ('CIA. de Bomberos Miraflores N°45',   'CB-MIR-045', 'Lima', 'Lima', 'Miraflores',      'Av. Larco 1200, Miraflores',    'Cnel. María Sánchez Torres',  38),
  ('CIA. de Bomberos San Borja N°102',   'CB-SBO-102', 'Lima', 'Lima', 'San Borja',       'Av. San Borja Norte 800',       'Cnel. Carlos Vega Quispe',    29)
ON CONFLICT DO NOTHING;

-- Patrocinadores
INSERT INTO patrocinadores (razon_social, nombre_comercial, ruc, pais, ciudad, email_contacto, telefono_contacto, nombre_contacto, sector, total_donado) VALUES
  ('Toyota del Perú S.A.',        'Toyota Perú',      '20100128218', 'Perú',    'Lima',  'rse@toyota.com.pe',       '01-215-0000', 'Ana García Pérez',    'Automotriz', 50000),
  ('Volkswagen Group Perú S.A.',  'Volkswagen Perú',  '20515213234', 'Perú',    'Lima',  'contacto@vwperu.pe',      '01-614-0000', 'Pedro Quispe Rojas',  'Automotriz', 35000),
  ('BMW Group Latin America',     'BMW Perú',         '20603982341', 'Alemania', 'Lima', 'rse@bmwperu.pe',          '01-441-0000', 'Luisa Mendoza Díaz',  'Automotriz', 80000),
  ('Hyundai del Perú S.A.C.',     'Hyundai Perú',     '20549871235', 'Perú',    'Lima',  'rse@hyundai.pe',          '01-630-0000', 'Roberto Kim Torres',  'Automotriz',  0)
ON CONFLICT DO NOTHING;

-- Gestores
INSERT INTO gestores (nombre, apellido, email, telefono, dni, banco, cuenta_bancaria, cci, comision_porcentaje, total_donaciones_gestionadas, total_comisiones_pagadas) VALUES
  ('Carlos',  'López Meza',    'carlos.lopez@educatran.pe',  '999-111-222', '44123456', 'BCP',      '191-12345678-0-21',  '00219100123456780021', 5, 130000, 2500),
  ('María',   'Soto Flores',   'maria.soto@educatran.pe',    '999-333-444', '45234567', 'Interbank', '200-23456789-0-62', '00320200234567890062', 5, 35000,  1750),
  ('Roberto', 'Huanca Torres', 'roberto.h@educatran.pe',     '999-555-666', '46345678', 'BBVA',     '011-34567890-0-01',  '01101103456789000100', 5, 0,      0)
ON CONFLICT DO NOTHING;

-- Colegios (se insertarán después de tener IDs de estaciones — usar subquery)
INSERT INTO colegios (nombre, codigo_modular, nivel, departamento, provincia, distrito, director, num_alumnos, estacion_id)
SELECT 'I.E. José de San Martín', '0900001', 'Primaria', 'Lima', 'Lima', 'Cercado de Lima', 'Prof. Rosa Huanca Quispe', 420, e.id
FROM estaciones_bomberos e WHERE e.codigo = 'CB-LIM-001' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO colegios (nombre, codigo_modular, nivel, departamento, provincia, distrito, director, num_alumnos, estacion_id)
SELECT 'I.E. Nuestra Señora de Guadalupe', '0900002', 'Secundaria', 'Lima', 'Lima', 'Cercado de Lima', 'Prof. Juan Ríos Vera', 850, e.id
FROM estaciones_bomberos e WHERE e.codigo = 'CB-LIM-001' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO colegios (nombre, codigo_modular, nivel, departamento, provincia, distrito, director, num_alumnos, estacion_id)
SELECT 'I.E. Ricardo Palma', '0900003', 'Primaria', 'Lima', 'Lima', 'Miraflores', 'Prof. Silvia Torres Paredes', 380, e.id
FROM estaciones_bomberos e WHERE e.codigo = 'CB-MIR-045' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO colegios (nombre, codigo_modular, nivel, departamento, provincia, distrito, director, num_alumnos, estacion_id)
SELECT 'I.E. Fe y Alegría N°2', '0900004', 'Primaria', 'Lima', 'Lima', 'San Borja', 'Prof. Marco Díaz Luna', 520, e.id
FROM estaciones_bomberos e WHERE e.codigo = 'CB-SBO-102' LIMIT 1
ON CONFLICT DO NOTHING;

-- Kits de juego
INSERT INTO kits_juegos (nombre, descripcion, precio_unitario, proveedor, cantidad_producida, cantidad_disponible) VALUES
  ('Kit Seguridad Vial Básico',    'Juego de mesa con señales de tránsito, semáforos y personajes. Para 4-6 jugadores.',   250, 'JuguEdu S.A.C.', 100, 72),
  ('Kit Seguridad Vial Avanzado',  'Set completo: tablero, tarjetas de situaciones, fichas metálicas. Para aulas de 30+.', 450, 'JuguEdu S.A.C.', 50,  35)
ON CONFLICT DO NOTHING;

-- Contratos demo
INSERT INTO contratos (numero_contrato, tipo, titulo, monto_comprometido, moneda, fecha_inicio, fecha_fin, estado,
  patrocinador_id, gestor_id)
SELECT 'CONT-2025-001', 'Donación Corporativa', 'Donación Anual Toyota — Programa Educatran 2025',
  50000, 'PEN', '2025-01-01', '2025-12-31', 'activo',
  p.id, g.id
FROM patrocinadores p, gestores g
WHERE p.nombre_comercial = 'Toyota Perú' AND g.nombre = 'Carlos'
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO contratos (numero_contrato, tipo, titulo, monto_comprometido, moneda, fecha_inicio, fecha_fin, estado,
  patrocinador_id, gestor_id)
SELECT 'CONT-2025-002', 'Donación Corporativa', 'Programa VW Seguridad Vial Escolar 2025',
  35000, 'PEN', '2025-02-01', '2025-11-30', 'activo',
  p.id, g.id
FROM patrocinadores p, gestores g
WHERE p.nombre_comercial = 'Volkswagen Perú' AND g.nombre = 'María'
LIMIT 1
ON CONFLICT DO NOTHING;

-- Donaciones demo (la comisión se calcula automáticamente por trigger)
INSERT INTO donaciones (patrocinador_id, gestor_id, monto, moneda, fecha_donacion, metodo_pago, referencia_pago, estado, descripcion)
SELECT p.id, g.id, 50000, 'PEN', '2025-03-15', 'Transferencia Bancaria', 'OP-2025-0031', 'recibida',
  'Primera donación del año — Toyota Perú'
FROM patrocinadores p, gestores g
WHERE p.nombre_comercial = 'Toyota Perú' AND g.nombre = 'Carlos'
ON CONFLICT DO NOTHING;

INSERT INTO donaciones (patrocinador_id, gestor_id, monto, moneda, fecha_donacion, metodo_pago, referencia_pago, estado, descripcion)
SELECT p.id, g.id, 35000, 'PEN', '2025-04-02', 'Transferencia Bancaria', 'OP-2025-0047', 'recibida',
  'Donación Volkswagen Perú — Q1 2025'
FROM patrocinadores p, gestores g
WHERE p.nombre_comercial = 'Volkswagen Perú' AND g.nombre = 'María'
ON CONFLICT DO NOTHING;

INSERT INTO donaciones (patrocinador_id, gestor_id, monto, moneda, fecha_donacion, metodo_pago, referencia_pago, estado, descripcion)
SELECT p.id, g.id, 80000, 'PEN', '2025-04-10', 'Transferencia Bancaria', 'OP-2025-0055', 'pendiente',
  'Donación BMW Perú — Programa anual'
FROM patrocinadores p, gestores g
WHERE p.nombre_comercial = 'BMW Perú' AND g.nombre = 'Carlos'
ON CONFLICT DO NOTHING;

-- Gastos demo
INSERT INTO gastos (tipo, categoria, descripcion, monto, moneda, fecha, proveedor, factura_numero, estado) VALUES
  ('Producción Kits',  'Juegos',      'Fabricación de 100 kits de juego vial básico',              25000, 'PEN', '2025-03-01', 'JuguEdu S.A.C.',    'F001-000123', 'aprobado'),
  ('Operativo',        'Transporte',  'Flete de kits a estaciones de bomberos',                    3500,  'PEN', '2025-03-18', 'Trans Express SRL', 'F001-000456', 'aprobado'),
  ('Equipos Bomberos', 'Renovación',  'Equipos de protección personal — CIA Lima N°1',            15000, 'PEN', '2025-04-05', 'Seguridad Total',   'F002-001020', 'pendiente'),
  ('Administrativo',   'Oficina',     'Útiles de oficina y papelería Q1',                           850,  'PEN', '2025-01-15', 'Tai Loy',           'B001-002341', 'aprobado'),
  ('Producción Kits',  'Diseño',      'Diseño gráfico de manuales y material educativo',           4200,  'PEN', '2025-02-20', 'Estudio Creativo',  'E001-000088', 'aprobado');

-- ────────────────────────────────────────────
-- FIN DEL SCHEMA
-- ────────────────────────────────────────────
-- SIGUIENTE PASO: crear usuarios en Supabase Auth:
--   Authentication > Users > Add user
--   admin@educatran.pe   / demo123
--   gestor@educatran.pe  / demo123
--   bombero@educatran.pe / demo123
-- El trigger handle_new_user() creará el perfil automáticamente.
-- Luego actualiza el rol de cada usuario en la tabla 'usuarios'.
