# 📘 schedMaster – Guía Oficial de Trabajo en GitHub

Este documento define la metodología oficial de trabajo en GitHub para el proyecto **schedMaster**.

Aplica para ambos repositorios:
- schedmaster-frontend
- schedmaster-backend

---

# 🎯 Objetivo

- Mantener la rama `main` estable y funcional.
- Permitir que cada integrante trabaje de forma aislada.
- Integrar cambios mediante Pull Requests revisados.
- Evitar conflictos innecesarios.
- Mantener un historial limpio y entendible.

---

# 🌳 Estructura de Ramas

Cada repositorio tendrá la siguiente estructura:

```
main
feature/nombre-integrante
```

## 🔹 Reglas Importantes

- ❌ No hacer `push` directo a `main`.
- ✅ Cada integrante trabaja únicamente en su propia rama.
- ✅ Los cambios se integran mediante Pull Request (PR).
- ✅ Todo PR debe ser revisado antes de hacer merge.
- ✅ La rama `main` debe estar siempre estable.

---

# 👤 Creación de Rama Individual (Solo la primera vez)

Cada integrante debe crear su rama personal una sola vez al inicio del proyecto.

## 1️⃣ Clonar el repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd nombre-del-repo
```

## 2️⃣ Asegurarse de estar en main actualizado

```bash
git checkout main
git pull origin main
```

## 3️⃣ Crear tu rama personal

```bash
git checkout -b feature/tu-nombre
git push -u origin feature/tu-nombre
```

Ejemplo:

```bash
git checkout -b feature/ricardo
git push -u origin feature/ricardo
```

Una vez creada, siempre trabajarás sobre esa misma rama.

---

# 🔁 Flujo de Trabajo Diario

## 1️⃣ Verificar que estás en tu rama

```bash
git branch
```

Debe aparecer:

```
* feature/tu-nombre
```

Si no estás en tu rama:

```bash
git checkout feature/tu-nombre
```

---

## 2️⃣ Realizar cambios y commits

Agregar cambios:

```bash
git add .
```

Crear commit:

```bash
git commit -m "feat: descripción clara del cambio"
```

Subir cambios:

```bash
git push
```

---

# 🏷 Convención de Commits

Usar los siguientes prefijos:

| Prefijo     | Uso |
|------------|------|
| feat:      | Nueva funcionalidad |
| fix:       | Corrección de error |
| refactor:  | Mejora interna sin cambiar comportamiento |
| chore:     | Configuración o mantenimiento |
| docs:      | Cambios en documentación |

Ejemplos:

```
feat: agregar módulo de reservas
fix: corregir validación de cupo
refactor: mejorar estructura del controlador
docs: actualizar README
```

---

# 🔀 Crear un Pull Request

Cuando tu funcionalidad esté lista:

1. Ir al repositorio en GitHub.
2. Ir a la pestaña **Pull Requests**.
3. Click en **New Pull Request**.
4. Base: `main`
5. Compare: `feature/tu-nombre`
6. Agregar una descripción clara del cambio.
7. Solicitar revisión.
8. Esperar aprobación antes de hacer merge.

⚠ Nunca hacer merge sin revisión previa.

---

# 🔄 Actualizar tu Rama con Cambios de Main

Cada vez que alguien haga merge a `main`, debes actualizar tu rama antes de continuar trabajando.

## Paso 1: Actualizar main

```bash
git checkout main
git pull origin main
```

## Paso 2: Volver a tu rama

```bash
git checkout feature/tu-nombre
```

## Paso 3: Traer cambios de main

```bash
git merge main
git push
```

---

# ⚠ Resolución de Conflictos

Si Git indica conflictos:

1. Abrir el archivo afectado.
2. Buscar bloques como:

```
<<<<<<< HEAD
Tu código
=======
Código de main
>>>>>>> main
```

3. Editar el archivo dejando únicamente la versión correcta.
4. Guardar cambios.
5. Ejecutar:

```bash
git add .
git commit -m "fix: resolver conflictos"
git push
```

---

# 🚫 Reglas Obligatorias

- No subir archivos `.env`
- No subir `node_modules`
- No hacer force push en `main`
- No modificar código en la rama de otro integrante
- No hacer merge sin Pull Request
- No borrar ramas sin autorización del equipo

---

# 📂 .gitignore Recomendado (Node.js)

Agregar un archivo `.gitignore` con lo siguiente:

```
node_modules/
.env
dist/
build/
coverage/
```

---

# 🧪 Buenas Prácticas

- Hacer commits pequeños y frecuentes.
- Probar el proyecto antes de abrir PR.
- Escribir mensajes de commit claros.
- Mantener comunicación con el equipo antes de cambios grandes.
- Actualizar tu rama con `main` regularmente.

---

# 📌 Resumen del Flujo

1. Trabajas en `feature/tu-nombre`
2. Haces commits
3. Haces push
4. Creas Pull Request a `main`
5. Se revisa
6. Se hace merge
7. Todos actualizan su rama

---

# 🧠 Filosofía del Proyecto

La rama `main` representa la versión estable del proyecto.

Las ramas individuales permiten desarrollar funcionalidades sin afectar el trabajo del resto del equipo.

El orden, la claridad y la disciplina en Git son parte fundamental del desarrollo profesional del proyecto schedMaster.
