const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/* =========================
   CREAR ANUNCIO
=========================*/
exports.crearAnuncio = async (req, res) => {
  try {
    const {
      titulo,
      descripcion,
      prioridad,
      fecha_publicacion,
      activo
    } = req.body;

    const nuevo = await prisma.anuncio.create({
      data: {
        titulo,
        descripcion,
        prioridad,
        fotografia: req.file ? req.file.filename : null, // 🔥 AQUÍ ESTÁ EL FIX
        fecha_publicacion: fecha_publicacion 
          ? new Date(fecha_publicacion) 
          : new Date(),
        activo: activo ?? true
      }
    });

    res.status(201).json(nuevo);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear anuncio' });
  }
};


/* =========================
   OBTENER ANUNCIOS
=========================*/
exports.obtenerAnuncios = async (req, res) => {
  try {
    const anuncios = await prisma.anuncio.findMany({
      orderBy: { id: 'desc' }
    });

    res.json(anuncios);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener anuncios' });
  }
};
/* =========================
   ELIMINAR ANUNCIO
=========================*/
exports.eliminarAnuncio = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("ID recibido:", id);

    const eliminado = await prisma.anuncio.deleteMany({
      where: {
        id: Number(id)
      }
    });

    if (eliminado.count === 0) {
      return res.status(404).json({ message: 'No existe el anuncio' });
    }

    res.json({ message: 'Anuncio eliminado correctamente' });

  } catch (error) {
    console.error("ERROR DELETE:", error);
    res.status(500).json({ message: 'Error al eliminar anuncio' });
  }
};
exports.actualizarAnuncio = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descripcion, prioridad } = req.body;

    const actualizado = await prisma.anuncio.update({
      where: {
        id: Number(id)
      },
      data: {
        titulo,
        descripcion,
        prioridad,
        fotografia: req.file ? req.file.filename : undefined // 🔥 clave
      }
    });

    res.json(actualizado);

  } catch (error) {
    console.error("ERROR UPDATE:", error);
    res.status(500).json({ message: 'Error al actualizar anuncio' });
  }
};