// ============================================================
// src/routes/neurona.js
// ============================================================

const express = require('express')
const router  = express.Router()
const fs      = require('fs')
const path    = require('path')

// Ajustado a tu estructura: src/lib/prisma.js y src/lib/modelo.json
const prisma      = require('../lib/prisma')
const MODELO_PATH = path.join(__dirname, '../lib/modelo.json')

// ── Utilidades ───────────────────────────────────────────────
function sigmoid(x) {
  return 1 / (1 + Math.exp(-x))
}

function entrenar(dataset, epochs = 1000, lr = 0.01) {
  let w1 = Math.random()
  let w2 = Math.random()
  let b  = Math.random()

  for (let i = 0; i < epochs; i++) {
    dataset.forEach(({ x, y }) => {
      const [asistencias, faltas] = x
      const z    = asistencias * w1 + faltas * w2 + b
      const pred = sigmoid(z)
      const err  = pred - y

      w1 -= lr * err * asistencias
      w2 -= lr * err * faltas
      b  -= lr * err
    })
  }

  return { w1, w2, b }
}

async function generarDataset() {
  const usuarios = await prisma.usuario.findMany({
    include: { asistencias: true }
  })

  return usuarios.map(u => {
    const total     = u.asistencias.length
    const asistidas = u.asistencias.filter(a => a.asistio).length
    const faltas    = total - asistidas
    const pct       = total > 0 ? asistidas / total : 0
    return { x: [asistidas, faltas], y: pct >= 0.7 ? 1 : 0 }
  })
}

// ── POST /api/neurona/entrenar ───────────────────────────────
router.post('/entrenar', async (req, res) => {
  try {
    const dataset = await generarDataset()

    if (dataset.length === 0) {
      return res.status(400).json({ error: 'No hay usuarios con asistencias para entrenar.' })
    }

    const modelo = entrenar(dataset)

    fs.writeFileSync(MODELO_PATH, JSON.stringify(modelo, null, 2))

    res.json({
      ok: true,
      mensaje: `Modelo entrenado con ${dataset.length} usuarios.`,
      modelo,
      usuarios: dataset.length
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al entrenar el modelo.' })
  }
})

// ── GET /api/neurona/modelo ──────────────────────────────────
router.get('/modelo', (req, res) => {
  try {
    if (!fs.existsSync(MODELO_PATH)) {
      return res.status(404).json({ error: 'Modelo no encontrado. Entrena primero.' })
    }
    const modelo = JSON.parse(fs.readFileSync(MODELO_PATH, 'utf-8'))
    res.json(modelo)
  } catch (error) {
    res.status(500).json({ error: 'Error al leer el modelo.' })
  }
})

// ── POST /api/neurona/evaluar ────────────────────────────────
router.post('/evaluar', (req, res) => {
  try {
    if (!fs.existsSync(MODELO_PATH)) {
      return res.status(404).json({ error: 'Modelo no encontrado. Entrena primero.' })
    }

    const { asistencias, faltas } = req.body

    if (asistencias === undefined || faltas === undefined) {
      return res.status(400).json({ error: 'Se requieren asistencias y faltas.' })
    }

    const { w1, w2, b } = JSON.parse(fs.readFileSync(MODELO_PATH, 'utf-8'))
    const z    = asistencias * w1 + faltas * w2 + b
    const prob = sigmoid(z)

    res.json({
      probabilidad:  prob,
      clasificacion: prob >= 0.5 ? 'Regular' : 'En riesgo',
      asistencias,
      faltas
    })
  } catch (error) {
    res.status(500).json({ error: 'Error al evaluar.' })
  }
})

// ── GET /api/neurona/evaluar-todos ──────────────────────────
router.get('/evaluar-todos', async (req, res) => {
  try {
    if (!fs.existsSync(MODELO_PATH)) {
      return res.status(404).json({ error: 'Modelo no encontrado. Entrena primero.' })
    }

    const { w1, w2, b } = JSON.parse(fs.readFileSync(MODELO_PATH, 'utf-8'))

    const usuarios = await prisma.usuario.findMany({
      include: { asistencias: true }
    })

    const resultados = usuarios.map(u => {
      const total     = u.asistencias.length
      const asistidas = u.asistencias.filter(a => a.asistio).length
      const faltas    = total - asistidas
      const z         = asistidas * w1 + faltas * w2 + b
      const prob      = sigmoid(z)

      return {
        id:            u.id_usuario,
        nombre:        `${u.nombre} ${u.apellido_paterno}`,
        asistencias:   asistidas,
        faltas,
        total,
        probabilidad:  Math.round(prob * 100),
        clasificacion: prob >= 0.5 ? 'Regular' : 'En riesgo'
      }
    })

    res.json(resultados)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al evaluar usuarios.' })
  }
})

module.exports = router