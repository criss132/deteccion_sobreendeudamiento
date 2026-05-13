-- ============================================================
-- SCRIPT UNIFICADO MYSQL
-- CreditoSeguro Digital S.A.S.
-- Crea la base de datos, estructura, funciones, triggers, vista
-- y carga datos iniciales de prueba.
-- ============================================================

CREATE DATABASE IF NOT EXISTS creditoseguro
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_spanish_ci;

USE creditoseguro;

-- ============================================================
-- TABLAS
-- ============================================================

CREATE TABLE IF NOT EXISTS cliente (
    idcliente       INT             NOT NULL AUTO_INCREMENT,
    nombre          VARCHAR(150)    NOT NULL,
    iddocumento     VARCHAR(20)     NOT NULL,
    ingresos_m      DECIMAL(15, 2)  NOT NULL CHECK (ingresos_m >= 0),
    tipo_empleado   ENUM('dependiente', 'independiente', 'pensionado', 'desempleado') NOT NULL,
    score_credito   INT             CHECK (score_credito BETWEEN 0 AND 1000),
    fecha_registro  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    activo          BOOLEAN         NOT NULL DEFAULT TRUE,
    PRIMARY KEY (idcliente),
    UNIQUE KEY uq_cliente_iddocumento (iddocumento)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

CREATE TABLE IF NOT EXISTS credito (
    idcredito       INT             NOT NULL AUTO_INCREMENT,
    idcliente       INT             NOT NULL,
    monto           DECIMAL(15, 2)  NOT NULL CHECK (monto > 0),
    tasa_interes    DECIMAL(6, 4)   NOT NULL CHECK (tasa_interes > 0),
    plazo_meses     INT             NOT NULL CHECK (plazo_meses > 0),
    cuota_mensual   DECIMAL(15, 2)  NOT NULL CHECK (cuota_mensual > 0),
    estado          ENUM('activo', 'pagado', 'en_mora', 'reestructurado', 'castigado') NOT NULL DEFAULT 'activo',
    fecha_apertura  DATE            NOT NULL DEFAULT (CURRENT_DATE),
    fecha_cierre    DATE,
    PRIMARY KEY (idcredito),
    CONSTRAINT fk_credito_cliente
        FOREIGN KEY (idcliente) REFERENCES cliente(idcliente)
        ON DELETE RESTRICT,
    CONSTRAINT fecha_cierre_valida
        CHECK (fecha_cierre IS NULL OR fecha_cierre > fecha_apertura)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

CREATE TABLE IF NOT EXISTS pago (
    idpago          INT             NOT NULL AUTO_INCREMENT,
    idcredito       INT             NOT NULL,
    idcliente       INT             NOT NULL,
    fecha_pago      DATE            NOT NULL,
    monto_pagado    DECIMAL(15, 2)  NOT NULL CHECK (monto_pagado >= 0),
    retraso_dias    INT             NOT NULL DEFAULT 0 CHECK (retraso_dias >= 0),
    estado_pago     ENUM('a_tiempo', 'retraso_leve', 'retraso_moderado', 'retraso_grave') NOT NULL DEFAULT 'a_tiempo',
    fecha_registro  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (idpago),
    CONSTRAINT fk_pago_credito
        FOREIGN KEY (idcredito) REFERENCES credito(idcredito)
        ON DELETE RESTRICT,
    CONSTRAINT fk_pago_cliente
        FOREIGN KEY (idcliente) REFERENCES cliente(idcliente)
        ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

CREATE TABLE IF NOT EXISTS historial_financiero (
    idhistorial              INT             NOT NULL AUTO_INCREMENT,
    idcliente                INT             NOT NULL,
    deuda_total              DECIMAL(15, 2)  NOT NULL DEFAULT 0 CHECK (deuda_total >= 0),
    total_creditos           INT             NOT NULL DEFAULT 0 CHECK (total_creditos >= 0),
    ingresos_declarados      DECIMAL(15, 2)  NOT NULL CHECK (ingresos_declarados >= 0),
    porcentaje_endeudamiento DECIMAL(6, 2)   GENERATED ALWAYS AS (
        CASE
            WHEN ingresos_declarados = 0 THEN NULL
            ELSE ROUND((deuda_total / ingresos_declarados) * 100, 2)
        END
    ) STORED,
    reestructuraciones       INT             NOT NULL DEFAULT 0,
    ultima_actualizacion     TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (idhistorial),
    UNIQUE KEY uq_historial_cliente (idcliente),
    CONSTRAINT fk_historial_cliente
        FOREIGN KEY (idcliente) REFERENCES cliente(idcliente)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

CREATE TABLE IF NOT EXISTS modelo_ai (
    idmodelo          INT             NOT NULL AUTO_INCREMENT,
    modelo            VARCHAR(100)    NOT NULL,
    version           VARCHAR(20)     NOT NULL,
    umbral_riesgo     DECIMAL(5, 4)   NOT NULL CHECK (umbral_riesgo BETWEEN 0 AND 1),
    descripcion       TEXT,
    activo            BOOLEAN         NOT NULL DEFAULT FALSE,
    fecha_creacion    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    metricas          JSON,
    modelo_activo_key TINYINT         GENERATED ALWAYS AS (
        CASE WHEN activo = TRUE THEN 1 ELSE NULL END
    ) STORED,
    PRIMARY KEY (idmodelo),
    UNIQUE KEY uq_un_modelo_activo (modelo_activo_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

CREATE TABLE IF NOT EXISTS detector_sobreendeudamiento (
    iddetector          INT             NOT NULL AUTO_INCREMENT,
    idcliente           INT             NOT NULL,
    idmodelo            INT             NOT NULL,
    nivel_riesgo        ENUM('bajo', 'medio', 'alto', 'critico') NOT NULL,
    probabilidad        DECIMAL(5, 4)   NOT NULL CHECK (probabilidad BETWEEN 0 AND 1),
    estado_evaluacion   ENUM('pendiente', 'en_proceso', 'completada', 'fallida') NOT NULL DEFAULT 'pendiente',
    fecha_evaluacion    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    variables_entrada   JSON,
    resultado_detalle   TEXT,
    PRIMARY KEY (iddetector),
    CONSTRAINT fk_detector_cliente
        FOREIGN KEY (idcliente) REFERENCES cliente(idcliente)
        ON DELETE RESTRICT,
    CONSTRAINT fk_detector_modelo
        FOREIGN KEY (idmodelo) REFERENCES modelo_ai(idmodelo)
        ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

CREATE TABLE IF NOT EXISTS alerta_riesgo (
    idalerta            INT             NOT NULL AUTO_INCREMENT,
    iddetector          INT             NOT NULL,
    idcliente           INT             NOT NULL,
    nivel_riesgo        ENUM('bajo', 'medio', 'alto', 'critico') NOT NULL,
    mensaje_alerta      TEXT            NOT NULL,
    fecha_generacion    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    enviada             BOOLEAN         NOT NULL DEFAULT FALSE,
    fecha_envio         TIMESTAMP       NULL,
    leida               BOOLEAN         NOT NULL DEFAULT FALSE,
    PRIMARY KEY (idalerta),
    CONSTRAINT fk_alerta_detector
        FOREIGN KEY (iddetector) REFERENCES detector_sobreendeudamiento(iddetector)
        ON DELETE CASCADE,
    CONSTRAINT fk_alerta_cliente
        FOREIGN KEY (idcliente) REFERENCES cliente(idcliente)
        ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

CREATE TABLE IF NOT EXISTS recomendacion_financiera (
    idrecomendacion     INT             NOT NULL AUTO_INCREMENT,
    iddetector          INT             NOT NULL,
    idcliente           INT             NOT NULL,
    tipo_accion         ENUM(
        'reduccion_cupo',
        'asesoria_financiera',
        'seguimiento_personalizado',
        'reestructuracion_deuda',
        'bloqueo_nuevos_creditos',
        'educacion_financiera'
    ) NOT NULL,
    mensaje             TEXT            NOT NULL,
    fecha_generacion    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    enviada             BOOLEAN         NOT NULL DEFAULT FALSE,
    fecha_envio         TIMESTAMP       NULL,
    aplicada            BOOLEAN         NOT NULL DEFAULT FALSE,
    fecha_aplicacion    TIMESTAMP       NULL,
    PRIMARY KEY (idrecomendacion),
    CONSTRAINT fk_recomendacion_detector
        FOREIGN KEY (iddetector) REFERENCES detector_sobreendeudamiento(iddetector)
        ON DELETE CASCADE,
    CONSTRAINT fk_recomendacion_cliente
        FOREIGN KEY (idcliente) REFERENCES cliente(idcliente)
        ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

-- ============================================================
-- INDICES
-- ============================================================

CREATE INDEX idx_credito_idcliente       ON credito(idcliente);
CREATE INDEX idx_pago_idcredito          ON pago(idcredito);
CREATE INDEX idx_pago_idcliente          ON pago(idcliente);
CREATE INDEX idx_detector_idcliente      ON detector_sobreendeudamiento(idcliente);
CREATE INDEX idx_detector_nivel_riesgo   ON detector_sobreendeudamiento(nivel_riesgo);
CREATE INDEX idx_alerta_idcliente        ON alerta_riesgo(idcliente);
CREATE INDEX idx_alerta_no_enviada       ON alerta_riesgo(enviada);
CREATE INDEX idx_recomendacion_idcliente ON recomendacion_financiera(idcliente);

-- ============================================================
-- FUNCIONES, PROCEDIMIENTOS Y TRIGGERS
-- ============================================================

DELIMITER $$

CREATE FUNCTION calcular_cuota_mensual(
    p_monto DECIMAL(15, 2),
    p_tasa_anual DECIMAL(10, 6),
    p_plazo_meses INT
)
RETURNS DECIMAL(15, 2)
DETERMINISTIC
BEGIN
    DECLARE v_tasa_mensual DECIMAL(10, 8);

    SET v_tasa_mensual = p_tasa_anual / 12;

    IF v_tasa_mensual = 0 THEN
        RETURN ROUND(p_monto / p_plazo_meses, 2);
    END IF;

    RETURN ROUND(
        p_monto * (v_tasa_mensual * POWER(1 + v_tasa_mensual, p_plazo_meses))
                / (POWER(1 + v_tasa_mensual, p_plazo_meses) - 1),
        2
    );
END$$

CREATE PROCEDURE actualizar_historial_financiero(IN p_idcliente INT)
BEGIN
    DECLARE v_deuda_total DECIMAL(15, 2);
    DECLARE v_total_creditos INT;
    DECLARE v_reestructuraciones INT;

    SELECT COALESCE(SUM(monto), 0), COUNT(*)
    INTO v_deuda_total, v_total_creditos
    FROM credito
    WHERE idcliente = p_idcliente AND estado = 'activo';

    SELECT COUNT(*)
    INTO v_reestructuraciones
    FROM credito
    WHERE idcliente = p_idcliente AND estado = 'reestructurado';

    UPDATE historial_financiero
    SET
        deuda_total = v_deuda_total,
        total_creditos = v_total_creditos,
        reestructuraciones = v_reestructuraciones,
        ultima_actualizacion = CURRENT_TIMESTAMP
    WHERE idcliente = p_idcliente;
END$$

CREATE TRIGGER crear_historial_on_cliente
AFTER INSERT ON cliente
FOR EACH ROW
BEGIN
    INSERT INTO historial_financiero (idcliente, ingresos_declarados)
    VALUES (NEW.idcliente, NEW.ingresos_m);
END$$

CREATE TRIGGER sync_historial_on_credito_insert
AFTER INSERT ON credito
FOR EACH ROW
BEGIN
    CALL actualizar_historial_financiero(NEW.idcliente);
END$$

CREATE TRIGGER sync_historial_on_credito_update
AFTER UPDATE ON credito
FOR EACH ROW
BEGIN
    CALL actualizar_historial_financiero(NEW.idcliente);

    IF OLD.idcliente <> NEW.idcliente THEN
        CALL actualizar_historial_financiero(OLD.idcliente);
    END IF;
END$$

DELIMITER ;

-- ============================================================
-- VISTA: dashboard para analistas de riesgo
-- ============================================================

CREATE OR REPLACE VIEW v_dashboard_riesgo AS
SELECT
    c.idcliente,
    c.nombre,
    c.iddocumento,
    c.score_credito,
    c.tipo_empleado,
    hf.deuda_total,
    hf.ingresos_declarados,
    hf.porcentaje_endeudamiento,
    hf.total_creditos,
    hf.reestructuraciones,
    d.nivel_riesgo,
    d.probabilidad,
    d.fecha_evaluacion,
    d.estado_evaluacion
FROM cliente c
JOIN historial_financiero hf ON hf.idcliente = c.idcliente
LEFT JOIN detector_sobreendeudamiento d
    ON d.iddetector = (
        SELECT d2.iddetector
        FROM detector_sobreendeudamiento d2
        WHERE d2.idcliente = c.idcliente
        ORDER BY d2.fecha_evaluacion DESC, d2.iddetector DESC
        LIMIT 1
    )
WHERE c.activo = TRUE;

-- ============================================================
-- DATOS INICIALES
-- ============================================================

START TRANSACTION;

INSERT INTO modelo_ai (modelo, version, umbral_riesgo, descripcion, activo, metricas)
VALUES (
    'RandomForest', '1.0.0', 0.6500,
    'Clasificacion binaria entrenado con historial de 24 meses',
    TRUE,
    '{"precision": 0.82, "recall": 0.78, "auc": 0.85, "f1": 0.80}'
);

INSERT INTO cliente (nombre, iddocumento, ingresos_m, tipo_empleado, score_credito)
VALUES
    ('Ana Torres Perez',      '1045678901', 2500000, 'dependiente',   720),
    ('Carlos Ruiz Lopez',     '1034567890', 1800000, 'independiente', 580),
    ('Maria Gomez Diaz',      '1056789012', 3200000, 'dependiente',   810),
    ('Luis Martinez Soto',    '1023456789', 1200000, 'independiente', 430),
    ('Paola Herrera Castro',  '1067890123', 2100000, 'pensionado',    670);

INSERT INTO credito (idcliente, monto, tasa_interes, plazo_meses, cuota_mensual, estado, fecha_apertura)
VALUES
    (1, 5000000,  0.0200, 24, calcular_cuota_mensual(5000000,  0.24,  24), 'activo',         CURRENT_DATE - INTERVAL 2 MONTH),
    (2, 3000000,  0.0250, 12, calcular_cuota_mensual(3000000,  0.30,  12), 'activo',         CURRENT_DATE - INTERVAL 5 MONTH),
    (2, 1500000,  0.0220, 6,  calcular_cuota_mensual(1500000,  0.264, 6),  'reestructurado', CURRENT_DATE - INTERVAL 8 MONTH),
    (3, 10000000, 0.0180, 36, calcular_cuota_mensual(10000000, 0.216, 36), 'activo',         CURRENT_DATE - INTERVAL 1 MONTH),
    (4, 800000,   0.0280, 6,  calcular_cuota_mensual(800000,   0.336, 6),  'en_mora',        CURRENT_DATE - INTERVAL 3 MONTH),
    (5, 2000000,  0.0210, 18, calcular_cuota_mensual(2000000,  0.252, 18), 'activo',         CURRENT_DATE - INTERVAL 6 MONTH),
    (5, 1000000,  0.0230, 12, calcular_cuota_mensual(1000000,  0.276, 12), 'activo',         CURRENT_DATE - INTERVAL 2 MONTH);

INSERT INTO pago (idcredito, idcliente, fecha_pago, monto_pagado, retraso_dias, estado_pago)
VALUES
    (1, 1, CURRENT_DATE - INTERVAL 60 DAY, 270000, 0,  'a_tiempo'),
    (1, 1, CURRENT_DATE - INTERVAL 30 DAY, 270000, 0,  'a_tiempo'),
    (1, 1, CURRENT_DATE,                   270000, 0,  'a_tiempo'),
    (2, 2, CURRENT_DATE - INTERVAL 90 DAY, 290000, 8,  'retraso_leve'),
    (2, 2, CURRENT_DATE - INTERVAL 60 DAY, 290000, 15, 'retraso_leve'),
    (2, 2, CURRENT_DATE - INTERVAL 30 DAY, 290000, 22, 'retraso_leve'),
    (5, 4, CURRENT_DATE - INTERVAL 60 DAY, 160000, 45, 'retraso_grave'),
    (6, 5, CURRENT_DATE - INTERVAL 30 DAY, 135000, 35, 'retraso_moderado'),
    (7, 5, CURRENT_DATE,                   100000, 0,  'a_tiempo');

INSERT INTO detector_sobreendeudamiento
    (idcliente, idmodelo, nivel_riesgo, probabilidad, estado_evaluacion, variables_entrada)
VALUES
    (1, 1, 'bajo',    0.1200, 'completada',
     '{"deuda_ingreso": 0.32, "retrasos_ultimos_6m": 0, "reestructuraciones": 0}'),
    (2, 1, 'alto',    0.7800, 'completada',
     '{"deuda_ingreso": 0.75, "retrasos_ultimos_6m": 3, "reestructuraciones": 1}'),
    (3, 1, 'bajo',    0.0900, 'completada',
     '{"deuda_ingreso": 0.28, "retrasos_ultimos_6m": 0, "reestructuraciones": 0}'),
    (4, 1, 'critico', 0.9400, 'completada',
     '{"deuda_ingreso": 0.95, "retrasos_ultimos_6m": 1, "reestructuraciones": 0}'),
    (5, 1, 'medio',   0.5500, 'completada',
     '{"deuda_ingreso": 0.60, "retrasos_ultimos_6m": 1, "reestructuraciones": 0}');

INSERT INTO alerta_riesgo (iddetector, idcliente, nivel_riesgo, mensaje_alerta)
VALUES
    (2, 2, 'alto',
     'Cliente con 3 retrasos en ultimos 6 meses y 1 reestructuracion. Probabilidad de deterioro: 78%. Se recomienda intervencion preventiva.'),
    (4, 4, 'critico',
     'Cliente en mora activa con relacion deuda-ingreso superior al 90%. Riesgo critico de sobreendeudamiento. Accion inmediata requerida.');

INSERT INTO recomendacion_financiera (iddetector, idcliente, tipo_accion, mensaje)
VALUES
    (2, 2, 'asesoria_financiera',
     'Programar sesion de asesoria financiera. El cliente muestra patron de retrasos progresivos que puede derivar en mora estructural.'),
    (2, 2, 'seguimiento_personalizado',
     'Activar monitoreo mensual de comportamiento de pago durante los proximos 3 meses.'),
    (4, 4, 'bloqueo_nuevos_creditos',
     'Bloquear solicitudes de nuevos creditos hasta regularizacion de obligacion en mora.'),
    (4, 4, 'reduccion_cupo',
     'Revisar y reducir cupo disponible en lineas de credito rotativas si aplica.'),
    (5, 5, 'educacion_financiera',
     'Enviar modulo de educacion financiera sobre manejo de multiples obligaciones simultaneas.');
