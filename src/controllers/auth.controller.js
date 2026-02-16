const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authService = require('../services/auth.service');

exports.login = async (req, res) => {
  try {
    const { correo, password } = req.body;

    const usuario = await authService.login(correo);

    if (!usuario) {
      return res.status(401).json({
        message: 'Credenciales incorrectas',
      });
    }

    const passwordValida = await bcrypt.compare(
      password,
      usuario.contraseña
    );

    if (!passwordValida) {
      return res.status(401).json({
        message: 'Credenciales incorrectas',
      });
    }

    const token = jwt.sign(
      { id: usuario.id_usuario, rol: usuario.id_rol },
      'secreto_super_seguro',
      { expiresIn: '8h' }
    );

    res.json({
      message: 'Login exitoso',
      token,
      usuario: {
        id: usuario.id_usuario,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.id_rol,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};
