const db = require('../services/db');
const bcrypt = require('bcrypt');

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

    //  validar correo
    const [exists] = await conn.query(
      'select id_usuario from usuarios where correo = ?',
      [correo]
    );

    if (exists.length > 0) {
      await conn.rollback();
      return res.status(400).json({
        message: 'El correo ya está registrado',
      });
    }

    //  hash
    const hashedPassword = await bcrypt.hash(password, 10);

    // usuario
   const [result] = await conn.query(
  `insert into usuarios
  (nombre, apellido_paterno, apellido_materno, correo, contraseña, id_carrera, id_division, cuatrimestre, id_rol)
  values (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [
    nombre,
    apellido_paterno,
    apellido_materno,
    correo,
    hashedPassword,
    id_carrera || null,
    id_division || null,
    cuatrimestre,
    id_rol,
  ]
);


    const idUsuario = result.insertId;

    // inscripción pendiente
    await conn.query(
      `insert into inscripciones
      (id_usuario, fecha_inscripcion, estado, prioridad)
      values (?, curdate(), 'pendiente', 'normal')`,
      [idUsuario]
    );

    await conn.commit();

    res.json({
      message: 'Usuario registrado correctamente. En espera de aprobación.',
    });
  } catch (error) {
    await conn.rollback();
    res.status(500).json(error);
  } finally {
    conn.release();
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { correo, password } = req.body;

    const [rows] = await db.query(
      `select u.*, i.estado
       from usuarios u
       join inscripciones i on i.id_usuario = u.id_usuario
       where u.correo = ?`,
      [correo]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const user = rows[0];

    if (user.estado !== 'aprobado') {
      return res.status(403).json({
        message: 'Tu cuenta está pendiente de aprobación',
      });
    }

    const match = await bcrypt.compare(password, user.contraseña);

    if (!match) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    res.json({
      message: 'Login correcto',
      usuario: user,
    });
  } catch (error) {
    res.status(500).json(error);
  }
};
