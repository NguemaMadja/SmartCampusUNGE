// backend/routes/radio_emisiones.js

const express = require('express');
const { QueryTypes } = require('sequelize');
const sequelize = require('../db');

const router = express.Router();


// =====================================
// LISTAR EMISIONES PENDIENTES
// =====================================

router.get(
  '/pendientes',
  async (req, res) => {

    try {

      const pendientes =
      await sequelize.query(

        `
        SELECT
            re.*,
            ra.nombre_archivo,
            ra.ruta_archivo,
            ra.tipo
        FROM radio_emisiones re
        INNER JOIN radio_archivos ra
            ON ra.id_archivo =
               re.id_archivo
        WHERE re.estado = 'pendiente'
        ORDER BY re.fecha_solicitud ASC
        `,

        {
          type:
          QueryTypes.SELECT
        }

      );

      res.json(
        pendientes
      );

    }
    catch (error) {

      console.error(
        'Error obteniendo emisiones pendientes:',
        error
      );

      res.status(500).json({

        error:
        'Error interno del servidor'

      });

    }

  }
);


// =====================================
// CREAR SOLICITUD DE EMISION
// =====================================

router.post(
  '/',
  async (req, res) => {

    try {

      const {
        id_archivo
      } = req.body;

      if (!id_archivo) {

        return res.status(400).json({

          error:
          'id_archivo es obligatorio'

        });

      }

      await sequelize.query(

        `
        INSERT INTO radio_emisiones
        (
            id_archivo,
            estado
        )
        VALUES
        (
            :id_archivo,
            'pendiente'
        )
        `,

        {

          replacements: {

            id_archivo

          }

        }

      );

      res.json({

        success: true,

        mensaje:
        'Solicitud de emisión registrada'

      });

    }
    catch (error) {

      console.error(
        'Error registrando emisión:',
        error
      );

      res.status(500).json({

        error:
        'Error interno del servidor'

      });

    }

  }
);


// =====================================
// MARCAR COMO EMITIENDO
// =====================================

router.put(
  '/:id/emitiendo',
  async (req, res) => {

    try {

      const { id } =
      req.params;

      await sequelize.query(

        `
        UPDATE radio_emisiones
        SET
            estado = 'emitiendo',
            fecha_inicio = CURRENT_TIMESTAMP
        WHERE id_emision = :id
        `,

        {

          replacements: {
            id
          }

        }

      );

      res.json({

        success: true

      });

    }
    catch (error) {

      console.error(error);

      res.status(500).json({

        error:
        'Error interno'

      });

    }

  }
);


// =====================================
// MARCAR FINALIZADA
// =====================================

router.put(
  '/:id/finalizada',
  async (req, res) => {

    try {

      const { id } =
      req.params;

      await sequelize.query(

        `
        UPDATE radio_emisiones
        SET
            estado = 'finalizada',
            fecha_fin = CURRENT_TIMESTAMP
        WHERE id_emision = :id
        `,

        {

          replacements: {
            id
          }

        }

      );

      res.json({

        success: true

      });

    }
    catch (error) {

      console.error(error);

      res.status(500).json({

        error:
        'Error interno'

      });

    }

  }
);

module.exports = router;
