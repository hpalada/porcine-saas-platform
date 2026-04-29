"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.empresaController = void 0;
const Empresa_1 = require("../models/Empresa");
exports.empresaController = {
    async get(req, res) {
        try {
            const empresaId = req.empresaId;
            const empresa = await Empresa_1.Empresa.findById(empresaId).select('-__v');
            if (!empresa)
                return res.status(404).json({ error: 'Empresa no encontrada' });
            res.json(empresa);
        }
        catch (error) {
            res.status(500).json({ error: 'Error al obtener empresa' });
        }
    },
    async update(req, res) {
        try {
            const empresaId = req.empresaId;
            const { nombre, descripcion, ubicacion, contacto, notificacionesActivas, alertaStockBajo, nivelStockCritico } = req.body;
            const updateData = {};
            if (nombre !== undefined)
                updateData.nombre = nombre;
            if (descripcion !== undefined)
                updateData.descripcion = descripcion;
            if (ubicacion !== undefined)
                updateData.ubicacion = ubicacion;
            if (contacto !== undefined)
                updateData.contacto = contacto;
            if (notificacionesActivas !== undefined)
                updateData.notificacionesActivas = !!notificacionesActivas;
            if (alertaStockBajo !== undefined)
                updateData.alertaStockBajo = !!alertaStockBajo;
            if (nivelStockCritico !== undefined) {
                const n = Number(nivelStockCritico);
                if (!Number.isFinite(n) || n < 0)
                    return res.status(400).json({ error: 'nivelStockCritico inválido' });
                updateData.nivelStockCritico = n;
            }
            const empresa = await Empresa_1.Empresa.findByIdAndUpdate(empresaId, updateData, { new: true, runValidators: true }).select('-__v');
            if (!empresa)
                return res.status(404).json({ error: 'Empresa no encontrada' });
            res.json(empresa);
        }
        catch (error) {
            res.status(400).json({ error: 'Error al actualizar empresa', message: error instanceof Error ? error.message : undefined });
        }
    },
};
//# sourceMappingURL=empresa.controller.js.map