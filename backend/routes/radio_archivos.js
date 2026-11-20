// backend/routes/radio_archivos.js

const express = require('express');
const { QueryTypes } = require('sequelize');
const sequelize = require('../db');

const router = express.Router();


// =====================================
// LISTAR ARCHIVOS DE RADIO
// =====================================

router.get('/', async (req, res) => {

  try {

    const archivos = await sequelize.query(

      `
      SELECT *
      FROM radio_archivos
      WHERE activo = TRUE
      ORDER BY fecha_subida DESC
      `,

      {
        type: QueryTypes.SELECT
      }

    );

    res.json(archivos);

  }

  catch (error) {

    console.error(
      'Error listando archivos:',
      error
    );

    res.status(500).json({
      error: 'Error interno del servidor'
    });

  }

});


// =====================================
// REGISTRAR ARCHIVO
// =====================================

router.post('/', async (req, res) => {

  try {

    const {
      nombre_archivo,
      nombre_original,
      tipo,
      categoria,
      descripcion,
      ruta_archivo,
      extension,
      tamano_bytes,
      duracion_segundos,
      usuario_subida
    } = req.body;

    if (
      !nombre_archivo ||
      !tipo ||
      !ruta_archivo
    ) {

      return res.status(400).json({
        error:
          'Faltan datos obligatorios'
      });

    }

    await sequelize.query(

      `
      INSERT INTO radio_archivos
      (
          nombre_archivo,
          nombre_original,
          tipo,
          categoria,
          descripcion,
          ruta_archivo,
          extension,
          tamano_bytes,
          duracion_segundos,
          usuario_subida
      )
      VALUES
      (
          :nombre_archivo,
          :nombre_original,
          :tipo,
          :categoria,
          :descripcion,
          :ruta_archivo,
          :extension,
          :tamano_bytes,
          :duracion_segundos,
          :usuario_subida
      )
      `,

      {
        replacements: {

          nombre_archivo,

          nombre_original,

          tipo,

          categoria,

          descripcion,

          ruta_archivo,

          extension,

          tamano_bytes,

          duracion_segundos,

          usuario_subida

        }
      }

    );

    console.log(
      `[RADIO ARCHIVOS] Archivo registrado: ${nombre_archivo}`
    );

    res.json({

      success: true,

      mensaje:
        'Archivo registrado correctamente'

    });

  }

  catch (error) {

    console.error(
      'Error registrando archivo:',
      error
    );

    res.status(500).json({

      error:
        'Error interno del servidor'

    });

  }

});


// =====================================
// ELIMINAR ARCHIVO
// =====================================

router.delete('/:id', async (req, res) => {

  try {

    const { id } = req.params;

    const existe = await sequelize.query(

      `
      SELECT *
      FROM radio_archivos
      WHERE id_archivo = :id
      `,

      {
        replacements: {
          id
        },
        type: QueryTypes.SELECT
      }

    );

    if (!existe.length) {

      return res.status(404).json({

        error:
          'Archivo no encontrado'

      });

    }

    await sequelize.query(

      `
      UPDATE radio_archivos
      SET
        activo = FALSE,
        fecha_actualizacion =
        CURRENT_TIMESTAMP
      WHERE id_archivo = :id
      `,

      {
        replacements: {
          id
        }
      }

    );

    console.log(
      `[RADIO ARCHIVOS] Archivo eliminado ID ${id}`
    );

    res.json({

      success: true,

      mensaje:
        'Archivo eliminado correctamente'

    });

  }

  catch (error) {

    console.error(
      'Error eliminando archivo:',
      error
    );

    res.status(500).json({

      error:
        'Error interno del servidor'

    });

  }

});

module.exports = router;
