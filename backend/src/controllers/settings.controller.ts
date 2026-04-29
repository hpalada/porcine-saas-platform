import { Request, Response } from 'express';
import { Settings, ISettings } from '../models/Settings';

export const settingsController = {
  /**
   * Obtiene la configuración actual
   */
  async get(req: Request, res: Response) {
    try {
      let settings = await Settings.findOne();

      // Si no existe, crear la configuración por defecto
      if (!settings) {
        settings = new Settings({});
        await settings.save();
      }

      res.json(settings);
    } catch (error) {
      console.error('Error obteniendo configuración:', error);
      res.status(500).json({ error: 'Error al obtener configuración' });
    }
  },

  /**
   * Actualiza la configuración
   */
  async update(req: Request, res: Response) {
    try {
      const updates = req.body;

      // Campos permitidos para actualizar
      const allowedFields = [
        'idioma',
        'tema',
        'nombreGranja',
        'ubicacion',
        'contacto',
        'email',
        'moneda',
        'tasaCambio',
        'notificacionesActivas',
        'alertaStockBajo',
        'nivelStockCritico',
        'horaBackup',
        'backupAutomatico',
        'registroAuditoria',
      ];

      // Filtrar solo campos permitidos
      const filteredUpdates: any = {};
      allowedFields.forEach((field) => {
        if (field in updates) {
          filteredUpdates[field] = updates[field];
        }
      });

      let settings = await Settings.findOne();

      // Si no existe, crear la configuración por defecto
      if (!settings) {
        settings = new Settings(filteredUpdates);
      } else {
        // Actualizar
        Object.assign(settings, filteredUpdates);
      }

      await settings.save();

      res.json({
        message: 'Configuración actualizada exitosamente',
        data: settings,
      });
    } catch (error) {
      console.error('Error actualizando configuración:', error);
      res.status(500).json({ error: 'Error al actualizar configuración' });
    }
  },

  /**
   * Obtiene solo el tema actual
   */
  async getTheme(req: Request, res: Response) {
    try {
      let settings = await Settings.findOne();

      if (!settings) {
        settings = new Settings({});
        await settings.save();
      }

      res.json({ tema: settings.tema });
    } catch (error) {
      console.error('Error obteniendo tema:', error);
      res.status(500).json({ error: 'Error al obtener tema' });
    }
  },

  /**
   * Obtiene solo el idioma actual
   */
  async getLanguage(req: Request, res: Response) {
    try {
      let settings = await Settings.findOne();

      if (!settings) {
        settings = new Settings({});
        await settings.save();
      }

      res.json({ idioma: settings.idioma });
    } catch (error) {
      console.error('Error obteniendo idioma:', error);
      res.status(500).json({ error: 'Error al obtener idioma' });
    }
  },

  /**
   * Reinicia la configuración a valores por defecto
   */
  async reset(req: Request, res: Response) {
    try {
      await Settings.deleteMany({});

      const settings = new Settings({});
      await settings.save();

      res.json({
        message: 'Configuración reiniciada a valores por defecto',
        data: settings,
      });
    } catch (error) {
      console.error('Error reiniciando configuración:', error);
      res.status(500).json({ error: 'Error al reiniciar configuración' });
    }
  },
};
