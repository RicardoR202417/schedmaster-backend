// controllers/horario.controller.js
const prisma = require('../../prisma/client');

// ==========================================
// 1. OBTENER TODOS LOS HORARIOS
// ==========================================
exports.getHorarios = async (req, res) => {
  try {
    const horarios = await prisma.horario.findMany({
      // Quitamos el 'where: { estado: 1 }' porque no existe la columna
      include: {
        horarioDias: { include: { dia: true } },
        periodo: true,
      },
      orderBy: { hora_inicio: 'asc' },
    });

    const mapped = horarios.map(h => ({
      id_horario: h.id_horario,
      hora_inicio: h.hora_inicio,
      hora_fin: h.hora_fin,
      tipo_actividad: h.tipo_actividad,
      capacidad_maxima: h.capacidad_maxima,
      dias_semana: h.horarioDias.map(hd => hd.dia.nombre).join(','),
    }));

    res.json(mapped);
  } catch (error) {
    console.error('❌ ERROR OBTENIENDO HORARIOS:', error);
    res.status(500).json({ message: 'Error obteniendo horarios', detalles: error.message });
  }
};

// ==========================================
// 2. OBTENER DÍAS POR HORARIO
// ==========================================
exports.getDiasPorHorario = async (req, res) => {
  try {
    const { id } = req.params;
    const dias = await prisma.horarioDia.findMany({
      where: { id_horario: Number(id) },
      include: { dia: true },
    });
    res.json(dias.map(d => d.dia));
  } catch (error) {
    console.error('❌ ERROR OBTENIENDO DÍAS:', error);
    res.status(500).json({ message: 'Error obteniendo días', detalles: error.message });
  }
};

// ==========================================
// 3. CREAR UN NUEVO HORARIO (CORREGIDO)
// ==========================================
exports.createHorario = async (req, res) => {
  try {
    const { id_periodo, hora_inicio, hora_fin, tipo_actividad, capacidad_maxima, dias } = req.body;

    const fechaBase = "1970-01-01T";
    const dateInicio = new Date(`${fechaBase}${hora_inicio}Z`);
    const dateFin = new Date(`${fechaBase}${hora_fin}Z`);

    const nuevoHorario = await prisma.horario.create({
      data: {
        id_periodo: Number(id_periodo),
        hora_inicio: dateInicio,
        hora_fin: dateFin,
        tipo_actividad,
        capacidad_maxima: Number(capacidad_maxima),
        // ❌ Quitamos 'estado: 1' porque no existe en tu schema.prisma
        horarioDias: {
          create: dias.map(id_dia => ({ id_dia: Number(id_dia) }))
        }
      },
      include: { horarioDias: true }
    });

    res.status(201).json({ message: 'Horario creado exitosamente', horario: nuevoHorario });
  } catch (error) {
    console.error('❌ ERROR DETALLADO AL CREAR HORARIO:', error);
    res.status(500).json({ message: 'Error al crear el horario', detalles: error.message });
  }
};

// ==========================================
// 4. EDITAR UN HORARIO EXISTENTE
// ==========================================
exports.updateHorario = async (req, res) => {
  try {
    const { id } = req.params;
    const { id_periodo, hora_inicio, hora_fin, tipo_actividad, capacidad_maxima, dias } = req.body;

    const fechaBase = "1970-01-01T";
    const dateInicio = hora_inicio ? new Date(`${fechaBase}${hora_inicio}Z`) : undefined;
    const dateFin = hora_fin ? new Date(`${fechaBase}${hora_fin}Z`) : undefined;

    const horarioActualizado = await prisma.horario.update({
      where: { id_horario: Number(id) },
      data: {
        id_periodo: id_periodo ? Number(id_periodo) : undefined,
        hora_inicio: dateInicio,
        hora_fin: dateFin,
        tipo_actividad,
        capacidad_maxima: capacidad_maxima ? Number(capacidad_maxima) : undefined,
        ...(dias && {
          horarioDias: {
            deleteMany: {}, 
            create: dias.map(id_dia => ({ id_dia: Number(id_dia) }))
          }
        })
      },
      include: { horarioDias: true }
    });

    res.json({ message: 'Horario actualizado correctamente', horario: horarioActualizado });
  } catch (error) {
    console.error('❌ ERROR ACTUALIZANDO HORARIO:', error);
    res.status(500).json({ message: 'Error al actualizar el horario', detalles: error.message });
  }
};

// ==========================================
// 5. BORRAR UN HORARIO (CAMBIADO A DELETE REAL)
// ==========================================
exports.deactivateHorario = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Como no tienes columna 'estado', vamos a borrarlo físicamente por ahora
    const horarioBorrado = await prisma.horario.delete({
      where: { id_horario: Number(id) }
    });

    res.json({ message: 'Horario eliminado correctamente', horario: horarioBorrado });
  } catch (error) {
    console.error('❌ ERROR ELIMINANDO HORARIO:', error);
    res.status(500).json({ message: 'Error al eliminar el horario', detalles: error.message });
  }
};