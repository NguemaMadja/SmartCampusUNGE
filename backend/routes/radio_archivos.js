// backend/routes/radio_archivos.js

const express = require('express');
const { QueryTypes } = require('sequelize');
const sequelize = require('../db');

const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();


// =====================================
// CONFIGURACIÓN MULTER
// =====================================

const storage = multer.diskStorage({

  destination: (req, file, cb) => {

    const tipo =
      req.body.tipo || 'musica';

    let carpetaDestino;

    switch (tipo) {

      case 'programa':

        carpetaDestino =
          path.join(
            __dirname,
            '../../uploads/programas'
          );

        break;

      case 'anuncio':

        carpetaDestino =
          path.join(
            __dirname,
            '../../uploads/anuncios'
          );

        break;

      default:

        carpetaDestino =
          path.join(
            __dirname,
            '../../uploads/musica'
          );

    }

    if (!fs.existsSync(carpetaDestino)) {

      fs.mkdirSync(
        carpetaDestino,
        { recursive: true }
      );

    }

    cb(null, carpetaDestino);

  },

  filename: (req, file, cb) => {

    const nombreArchivo =
      `${Date.now()}-${file.originalname}`;

    cb(null, nombreArchivo);

  }

});

const upload = multer({

  storage,

  limits: {

    fileSize:
      50 * 1024 * 1024

  }

});


// =====================================
// LISTAR ARCHIVOS DE RADIO
// =====================================

router.get('/', async (req, res) => {

  try {

    const archivos =
      await sequelize.query(

        `
        SELECT *
        FROM radio_archivos
        WHERE activo = TRUE
        ORDER BY fecha_subida DESC
        `,

        {
          type:
            QueryTypes.SELECT
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

      error:
        'Error interno del servidor'

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
// SUBIR ARCHIVO REAL
// =====================================

router.post(
  '/upload',
  upload.single('archivo'),

  async (req, res) => {

    try {

      if (!req.file) {

        return res.status(400).json({

          error:
            'No se recibió ningún archivo'

        });

      }

      const {

        tipo,
        categoria,
        descripcion

      } = req.body;

      const archivo =
        req.file;

      const rutaArchivo =
        `/uploads/${tipo}/${archivo.filename}`;

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
          :usuario_subida
        )
        `,

        {

          replacements: {

            nombre_archivo:
              archivo.filename,

            nombre_original:
              archivo.originalname,

            tipo,

            categoria,

            descripcion,

            ruta_archivo:
              rutaArchivo,

            extension:
              path.extname(
                archivo.originalname
              ),

            tamano_bytes:
              archivo.size,

            usuario_subida:
              'Biblioteca'

          }

        }

      );

      console.log(

        `[RADIO ARCHIVOS] Archivo subido: ${archivo.filename}`

      );

      res.json({

        success: true,

        mensaje:
          'Archivo subido correctamente',

        archivo:
          archivo.filename,

        ruta:
          rutaArchivo

      });

    }

    catch (error) {

      console.error(
        'Error subiendo archivo:',
        error
      );

      res.status(500).json({

        error:
          'Error al subir archivo'

      });

    }

  }

);


// =====================================
// MODIFICAR ARCHIVO
// =====================================

router.put('/:id', async (req, res) => {

  try {

    const { id } = req.params;

    const {

      nombre_archivo,
      tipo,
      categoria,
      descripcion

    } = req.body;

    const existe =
      await sequelize.query(

        `
        SELECT *
        FROM radio_archivos
        WHERE id_archivo = :id
        `,

        {

          replacements: {
            id
          },

          type:
            QueryTypes.SELECT

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
          nombre_archivo = :nombre_archivo,
          tipo = :tipo,
          categoria = :categoria,
          descripcion = :descripcion,
          fecha_actualizacion = CURRENT_TIMESTAMP
      WHERE id_archivo = :id
      `,

      {

        replacements: {

          id,
          nombre_archivo,
          tipo,
          categoria,
          descripcion

        }

      }

    );

    console.log(

      `[RADIO ARCHIVOS] Archivo actualizado ID ${id}`

    );

    res.json({

      success: true,

      mensaje:
        'Archivo actualizado correctamente'

    });

  }

  catch (error) {

    console.error(
      'Error actualizando archivo:',
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

    const existe =
      await sequelize.query(

        `
        SELECT *
        FROM radio_archivos
        WHERE id_archivo = :id
        `,

        {

          replacements: {
            id
          },

          type:
            QueryTypes.SELECT

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
        fecha_actualizacion = CURRENT_TIMESTAMP
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


// =====================================
// DESCARGA PÚBLICA DE ARCHIVOS
// =====================================

router.get(
  '/descargar/:id',
  async (req, res) => {

    try {

      const { id } = req.params;

      const resultado =
        await sequelize.query(

          `
          SELECT *
          FROM radio_archivos
          WHERE id_archivo = :id
            AND activo = TRUE
          `,

          {

            replacements: {
              id
            },

            type:
              QueryTypes.SELECT

          }

        );

      if (!resultado.length) {

        return res.status(404).json({

          error:
            'Archivo no encontrado'

        });

      }

      const archivo =
        resultado[0];

      res.json({

        success: true,

        nombre:
          archivo.nombre_archivo,

        tipo:
          archivo.tipo,

        url:

          `https://smartcampusunge.onrender.com${archivo.ruta_archivo}`

      });

    }

    catch (error) {

      console.error(

        'Error obteniendo descarga:',
        error

      );

      res.status(500).json({

        error:
          'Error interno del servidor'

      });

    }

  }
);

module.exports = router;
