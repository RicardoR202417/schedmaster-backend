const express = require("express")
const router = express.Router()

const multer = require("multer")
const path = require("path")

const adminAsistenciaController = require("../controllers/adminAsistencia.controller")

/* ==========================
   CONFIGURACIÓN MULTER
========================== */

const storage = multer.diskStorage({

  destination:(req,file,cb)=>{
    cb(null,"uploads/")
  },

  filename:(req,file,cb)=>{
    cb(null,Date.now()+"_"+file.originalname)
  }

})

const upload = multer({storage})

/* ==========================
   RUTAS
========================== */

// =====================
// HISTÓRICO
// =====================

// subir archivo + generar hash
router.post(
  "/upload-and-hash",
  upload.single("archivo"),
  adminAsistenciaController.uploadAndHash
)

// obtener histórico
router.get(
  "/historico",
  adminAsistenciaController.obtenerHistorico
)


// =====================
// CRUD ASISTENCIAS 🔥
// =====================

// obtener asistencias por fecha
router.get(
  "/asistencias",
  adminAsistenciaController.obtenerAsistencias
)

// marcar asistencia (presente / ausente)
router.post(
  "/marcar",
  adminAsistenciaController.marcarAsistencia
)

module.exports = router