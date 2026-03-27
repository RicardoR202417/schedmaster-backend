const crypto = require("crypto");
const fs = require("fs");
const prisma = require("../../prisma/client");

/* ==========================
   SUBIR ARCHIVO + HASH
========================== */
exports.uploadAndHash = async (req,res)=>{
  try{
    const file = req.file;
    const {fecha,id_usuario} = req.body;

    if(!file){
      return res.status(400).json({ message:"No se recibió ningún archivo" });
    }

    const buffer = fs.readFileSync(file.path);

    const hash = crypto
      .createHash("sha256")
      .update(buffer)
      .digest("hex");

    const existente = await prisma.asistenciaHistorico.findFirst({
      where:{ hash_archivo:hash }
    });

    if(existente){
      return res.json({ message:"Este archivo ya fue subido anteriormente" });
    }

    await prisma.asistenciaHistorico.create({
      data:{
        nombre_archivo:file.originalname,
        ruta_archivo:`uploads/${file.filename}`,
        hash_archivo:hash,
        fecha_lista:new Date(fecha),
        id_usuario:parseInt(id_usuario)
      }
    });

    res.json({
      message:"Archivo subido y hash generado con éxito",
      filename:file.originalname,
      hash:hash
    });

  }catch(error){
    console.error(error);
    res.status(500).json({ message:"Error al subir archivo" });
  }
};


/* ==========================
   OBTENER HISTORICO
========================== */
exports.obtenerHistorico = async (req,res)=>{
  try{
    const historico = await prisma.asistenciaHistorico.findMany({
      orderBy:{ fecha_lista:"desc" }
    });

    res.json(historico);

  }catch(error){
    console.error(error);
    res.status(500).json({ message:"Error al obtener histórico" });
  }
};


/* ==========================
   OBTENER ASISTENCIAS (CRUD)
========================== */
exports.obtenerAsistencias = async (req, res) => {
  try {

    const asistencias = await prisma.inscripcion.findMany({
      include: {
        usuario: true,
        horario: true,
        asistencias: true // 👈 IMPORTANTE
      }
    });

    const formateadas = asistencias.map(a => {

      let estado = "pendiente";

      if (a.asistencias.length > 0) {
        estado = a.asistencias[0].asistio ? "presente" : "ausente";
      }

      return {
        id: a.id_inscripcion,
        nombre: a.usuario.nombre,
        apellido: a.usuario.apellido_paterno,
        iniciales: a.usuario.nombre[0] + a.usuario.apellido_paterno[0],
        horarioInicio: a.horario.hora_inicio,
        horarioFin: a.horario.hora_fin,
        tipoEntrenamiento: a.horario.tipo_actividad || "General",
        carrera: a.usuario.id_carrera || "N/A",
        matricula: a.usuario.id_usuario,
        estado // 🔥 dinámico
      };

    });

    res.json(formateadas);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error obteniendo asistencias" });
  }
};


/* ==========================
   MARCAR ASISTENCIA
========================== */
exports.marcarAsistencia = async (req, res) => {
  try {
    const { id_inscripcion, asistio } = req.body;

    // 🔥 traer inscripción real
    const inscripcion = await prisma.inscripcion.findUnique({
      where: { id_inscripcion: parseInt(id_inscripcion) }
    });

    if (!inscripcion) {
      return res.status(404).json({ message: "Inscripción no encontrada" });
    }

    // 🔥 evitar duplicados (IMPORTANTE)
    const existente = await prisma.asistencia.findFirst({
      where: {
        id_inscripcion: inscripcion.id_inscripcion
      }
    });

    if (existente) {
      // actualizar en lugar de crear
      await prisma.asistencia.update({
        where: { id_asistencia: existente.id_asistencia },
        data: { asistio }
      });

      return res.json({ message: "Asistencia actualizada" });
    }

    // 🔥 crear correctamente
    await prisma.asistencia.create({
      data: {
        id_usuario: inscripcion.id_usuario,
        id_inscripcion: inscripcion.id_inscripcion,
        id_horario: inscripcion.id_horario, // 👈 ESTE ES EL FIX REAL
        fecha: new Date(),
        asistio,
        id_registrado_por: inscripcion.id_usuario
      }
    });

    res.json({ message: "Asistencia registrada" });

  } catch (error) {
    console.error("ERROR ASISTENCIA:", error);
    res.status(500).json({ message: "Error registrando asistencia" });
  }
};