"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.empresaController = void 0;
const Empresa_1 = require("../models/Empresa");
const Usuario_1 = require("../models/Usuario");
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
    async cancelarSuscripcion(req, res) {
        try {
            const empresaId = req.empresaId;
            if (!empresaId)
                return res.status(401).json({ error: 'No autenticado' });
            const empresa = await Empresa_1.Empresa.findById(empresaId);
            if (!empresa)
                return res.status(404).json({ error: 'Empresa no encontrada' });
            // Marcar suscripción como inactiva y bloquear acceso
            empresa.suscripcionActiva = false;
            empresa.accesoBloqueado = true;
            await empresa.save();
            // Desactivar todos los usuarios de la empresa
            await Usuario_1.Usuario.updateMany({ empresaId }, { activo: false });
            res.json({
                message: 'Suscripción cancelada. Todos los usuarios han sido desactivados.',
                empresa: {
                    id: empresa._id,
                    nombre: empresa.nombre,
                    suscripcionActiva: empresa.suscripcionActiva,
                    accesoBloqueado: empresa.accesoBloqueado,
                },
            });
        }
        catch (error) {
            res.status(500).json({ error: 'Error al cancelar suscripción', message: error instanceof Error ? error.message : undefined });
        }
    },
    async reactivarSuscripcion(req, res) {
        try {
            const { empresaId } = req.body;
            if (!empresaId)
                return res.status(400).json({ error: 'empresaId requerido' });
            // Solo superadmin puede hacer esto - verificado en middleware
            const empresa = await Empresa_1.Empresa.findById(empresaId);
            if (!empresa)
                return res.status(404).json({ error: 'Empresa no encontrada' });
            // Reactivar suscripción y desbloquear acceso
            empresa.suscripcionActiva = true;
            empresa.accesoBloqueado = false;
            await empresa.save();
            // Reactivar usuarios administrativos
            await Usuario_1.Usuario.updateMany({ empresaId, rol: 'administrador' }, { activo: true });
            res.json({
                message: 'Suscripción reactivada. Usuarios administrativos han sido reactivados.',
                empresa: {
                    id: empresa._id,
                    nombre: empresa.nombre,
                    suscripcionActiva: empresa.suscripcionActiva,
                    accesoBloqueado: empresa.accesoBloqueado,
                },
            });
        }
        catch (error) {
            res.status(500).json({ error: 'Error al reactivar suscripción', message: error instanceof Error ? error.message : undefined });
        }
    },
};
//# sourceMappingURL=empresa.controller.js.map