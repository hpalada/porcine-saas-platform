"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.settingsController = void 0;
const Settings_1 = require("../models/Settings");
exports.settingsController = {
    /**
     * Obtiene la configuración actual
     */
    async get(req, res) {
        try {
            let settings = await Settings_1.Settings.findOne();
            // Si no existe, crear la configuración por defecto
            if (!settings) {
                settings = new Settings_1.Settings({});
                await settings.save();
            }
            res.json(settings);
        }
        catch (error) {
            console.error('Error obteniendo configuración:', error);
            res.status(500).json({ error: 'Error al obtener configuración' });
        }
    },
    /**
     * Actualiza la configuración
     */
    async update(req, res) {
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
            const filteredUpdates = {};
            allowedFields.forEach((field) => {
                if (field in updates) {
                    filteredUpdates[field] = updates[field];
                }
            });
            let settings = await Settings_1.Settings.findOne();
            // Si no existe, crear la configuración por defecto
            if (!settings) {
                settings = new Settings_1.Settings(filteredUpdates);
            }
            else {
                // Actualizar
                Object.assign(settings, filteredUpdates);
            }
            await settings.save();
            res.json({
                message: 'Configuración actualizada exitosamente',
                data: settings,
            });
        }
        catch (error) {
            console.error('Error actualizando configuración:', error);
            res.status(500).json({ error: 'Error al actualizar configuración' });
        }
    },
    /**
     * Obtiene solo el tema actual
     */
    async getTheme(req, res) {
        try {
            let settings = await Settings_1.Settings.findOne();
            if (!settings) {
                settings = new Settings_1.Settings({});
                await settings.save();
            }
            res.json({ tema: settings.tema });
        }
        catch (error) {
            console.error('Error obteniendo tema:', error);
            res.status(500).json({ error: 'Error al obtener tema' });
        }
    },
    /**
     * Obtiene solo el idioma actual
     */
    async getLanguage(req, res) {
        try {
            let settings = await Settings_1.Settings.findOne();
            if (!settings) {
                settings = new Settings_1.Settings({});
                await settings.save();
            }
            res.json({ idioma: settings.idioma });
        }
        catch (error) {
            console.error('Error obteniendo idioma:', error);
            res.status(500).json({ error: 'Error al obtener idioma' });
        }
    },
    /**
     * Reinicia la configuración a valores por defecto
     */
    async reset(req, res) {
        try {
            await Settings_1.Settings.deleteMany({});
            const settings = new Settings_1.Settings({});
            await settings.save();
            res.json({
                message: 'Configuración reiniciada a valores por defecto',
                data: settings,
            });
        }
        catch (error) {
            console.error('Error reiniciando configuración:', error);
            res.status(500).json({ error: 'Error al reiniciar configuración' });
        }
    },
};
//# sourceMappingURL=settings.controller.js.map