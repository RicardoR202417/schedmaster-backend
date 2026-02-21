const db = require('../services/db');
const bcrypt = require('bcrypt');

// CONSTANTES Y CONFIGURACIÓN
const ERROR_MESSAGES = {
  DUPLICATE_EMAIL: 'El correo ya está registrado',
  INVALID_EMAIL: 'El formato del correo no es válido',
  USER_NOT_FOUND: 'Usuario no encontrado',
  WRONG_PASSWORD: 'Contraseña incorrecta',
  PENDING_APPROVAL: 'Tu cuenta está pendiente de aprobación',
  REGISTRATION_SUCCESS: 'Usuario registrado correctamente. En espera de aprobación.',
  LOGIN_SUCCESS: 'Login correcto',
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// VALIDATION STRATEGIES (Funciones helper)

/**
 * Normaliza el correo electrónico
 * @param {string} email 
 * @returns {string} Email normalizado
 */
const normalizeEmail = (email) => {
  return email?.trim().toLowerCase() || '';
};

/**
 * Valida el formato del correo electrónico
 * @param {string} email 
 * @returns {boolean}
 */
const isValidEmailFormat = (email) => {
  return EMAIL_REGEX.test(email);
};

/**
 * Verifica si un correo ya existe en la base de datos
 * @param {Connection} conn 
 * @param {string} email 
 * @returns {Promise<boolean>}
 */
const emailExists = async (conn, email) => {
  const [rows] = await conn.query(
    'SELECT id_usuario FROM usuarios WHERE correo = ?',
    [email]
  );
  return rows.length > 0;
};

/**
 * Valida el correo para registro (formato + duplicados)
 * Strategy Pattern: encapsula la lógica de validación
 * @param {Connection} conn 
 * @param {string} email 
 * @returns {Promise<Object>}
 */
const validateEmailForRegistration = async (conn, email) => {
  const normalizedEmail = normalizeEmail(email);
  
  // Validación de formato
  if (!isValidEmailFormat(normalizedEmail)) {
    return {
      isValid: false,
      error: ERROR_MESSAGES.INVALID_EMAIL,
      statusCode: 400
    };
  }
  
  // Validación de duplicados
  const exists = await emailExists(conn, normalizedEmail);
  if (exists) {
    return {
      isValid: false,
      error: ERROR_MESSAGES.DUPLICATE_EMAIL,
      statusCode: 400
    };
  }
  
  return {
    isValid: true,
    normalizedEmail
  };
};

// CONTROLLERS

// REGISTER
exports.register = async (req, res) => {
  const conn = await db.getConnection();

  try {
    const {
      nombre,
      apellido_paterno,
      apellido_materno,
      correo,
      password,
      id_carrera,
      id_division,
      cuatrimestre,
      id_rol,
    } = req.body;

    await conn.beginTransaction();

    // Validar correo usando Strategy
    const emailValidation = await validateEmailForRegistration(conn, correo);
    
    if (!emailValidation.isValid) {
      await conn.rollback();
      return res.status(emailValidation.statusCode).json({
        message: emailValidation.error,
      });
    }

    // Hash de contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar usuario con email normalizado
    const [result] = await conn.query(
      `INSERT INTO usuarios
      (nombre, apellido_paterno, apellido_materno, correo, contraseña, id_carrera, id_division, cuatrimestre, id_rol)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nombre,
        apellido_paterno,
        apellido_materno,
        emailValidation.normalizedEmail,
        hashedPassword,
        id_carrera || null,
        id_division || null,
        cuatrimestre,
        id_rol,
      ]
    );

    const idUsuario = result.insertId;

    // Crear inscripción pendiente
    await conn.query(
      `INSERT INTO inscripciones
      (id_usuario, fecha_inscripcion, estado, prioridad)
      VALUES (?, CURDATE(), 'pendiente', 'normal')`,
      [idUsuario]
    );

    await conn.commit();

    res.json({
      message: ERROR_MESSAGES.REGISTRATION_SUCCESS,
    });
    
  } catch (error) {
    await conn.rollback();
    console.error('Error en registro:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  } finally {
    conn.release();
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { correo, password } = req.body;
    
    // Normalizar email para búsqueda
    const normalizedEmail = normalizeEmail(correo);

    const [rows] = await db.query(
      `SELECT u.*, i.estado
       FROM usuarios u
       JOIN inscripciones i ON i.id_usuario = u.id_usuario
       WHERE u.correo = ?`,
      [normalizedEmail]
    );

    if (rows.length === 0) {
      return res.status(404).json({ 
        message: ERROR_MESSAGES.USER_NOT_FOUND 
      });
    }

    const user = rows[0];

    if (user.estado !== 'aprobado') {
      return res.status(403).json({
        message: ERROR_MESSAGES.PENDING_APPROVAL,
      });
    }

    const match = await bcrypt.compare(password, user.contraseña);

    if (!match) {
      return res.status(401).json({ 
        message: ERROR_MESSAGES.WRONG_PASSWORD 
      });
    }

    res.json({
      message: ERROR_MESSAGES.LOGIN_SUCCESS,
      usuario: user,
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
};
