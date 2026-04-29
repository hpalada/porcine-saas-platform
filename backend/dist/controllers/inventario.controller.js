"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.inventarioController = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const ConcentradoTipo_1 = __importDefault(require("../models/ConcentradoTipo"));
const InventarioMovimiento_1 = __importDefault(require("../models/InventarioMovimiento"));
const getEmpresaId = (req) => req.empresaId;
async function getStock(concentradoTipoId, empresaId) {
    const movs = await InventarioMovimiento_1.default.aggregate([
        { $match: { concentradoTipoId, empresaId } },
        {
            $group: {
                _id: null,
                entradas: { $sum: { $cond: [{ $eq: ['$tipo', 'entrada'] }, '$cantidad', 0] } },
                salidas: { $sum: { $cond: [{ $eq: ['$tipo', 'salida'] }, '$cantidad', 0] } },
                ajustes: { $sum: { $cond: [{ $eq: ['$tipo', 'ajuste'] }, '$cantidad', 0] } },
            },
        },
    ]);
    const m = movs[0] || { entradas: 0, salidas: 0, ajustes: 0 };
    return m.entradas - m.salidas + m.ajustes;
}
exports.inventarioController = {
    async stockActual(req, res) {
        try {
            const empresaId = getEmpresaId(req);
            if (!empresaId)
                return res.status(401).json({ error: 'No autenticado' });
            const empresaOid = new mongoose_1.default.Types.ObjectId(empresaId);
            const concentrados = await ConcentradoTipo_1.default.find({ empresaId }).select('_id nombre unidad precioActual');
            const stockPorTipo = await Promise.all(concentrados.map(async (c) => {
                const movs = await InventarioMovimiento_1.default.aggregate([
                    { $match: { concentradoTipoId: c._id, empresaId: empresaOid } },
                    {
                        $group: {
                            _id: null,
                            entradas: { $sum: { $cond: [{ $eq: ['$tipo', 'entrada'] }, '$cantidad', 0] } },
                            salidas: { $sum: { $cond: [{ $eq: ['$tipo', 'salida'] }, '$cantidad', 0] } },
                            ajustes: { $sum: { $cond: [{ $eq: ['$tipo', 'ajuste'] }, '$cantidad', 0] } },
                        },
                    },
                ]);
                const m = movs[0] || { entradas: 0, salidas: 0, ajustes: 0 };
                const stock = Math.round((m.entradas - m.salidas + m.ajustes) * 100) / 100;
                return {
                    _id: c._id,
                    nombre: c.nombre,
                    unidad: c.unidad,
                    precioActual: c.precioActual,
                    stock,
                    entradas: m.entradas,
                    salidas: m.salidas,
                    ajustes: m.ajustes,
                    valorTotal: stock * c.precioActual,
                };
            }));
            res.json(stockPorTipo);
        }
        catch (error) {
            res.status(500).json({ error: 'Error al obtener inventario', message: error instanceof Error ? error.message : undefined });
        }
    },
    async historial(req, res) {
        try {
            const empresaId = getEmpresaId(req);
            const { concentradoTipoId, tipo, limite = 50 } = req.query;
            const query = { empresaId };
            if (concentradoTipoId)
                query.concentradoTipoId = new mongoose_1.default.Types.ObjectId(concentradoTipoId);
            if (tipo)
                query.tipo = tipo;
            const movimientos = await InventarioMovimiento_1.default.find(query)
                .populate('concentradoTipoId', 'nombre unidad')
                .sort({ fecha: -1, createdAt: -1 })
                .limit(Number(limite))
                .select('-__v');
            res.json(movimientos);
        }
        catch (error) {
            res.status(500).json({ error: 'Error al obtener historial', message: error instanceof Error ? error.message : undefined });
        }
    },
    async registrarCompra(req, res) {
        try {
            const empresaId = getEmpresaId(req);
            if (!empresaId)
                return res.status(401).json({ error: 'No autenticado' });
            const empresaOid = new mongoose_1.default.Types.ObjectId(empresaId);
            const { concentradoTipoId, cantidad, motivo } = req.body;
            if (!concentradoTipoId || !cantidad) {
                return res.status(400).json({ error: 'concentradoTipoId y cantidad son requeridos' });
            }
            if (Number(cantidad) <= 0) {
                return res.status(400).json({ error: 'La cantidad debe ser mayor a 0' });
            }
            const concentrado = await ConcentradoTipo_1.default.findOne({ _id: concentradoTipoId, empresaId });
            if (!concentrado)
                return res.status(404).json({ error: 'Tipo de concentrado no encontrado' });
            const stockAnterior = await getStock(new mongoose_1.default.Types.ObjectId(concentradoTipoId), empresaOid);
            const stockNuevo = stockAnterior + Number(cantidad);
            const movimiento = new InventarioMovimiento_1.default({
                empresaId: empresaOid,
                concentradoTipoId,
                tipo: 'entrada',
                cantidad: Number(cantidad),
                stockAnterior,
                stockNuevo,
                motivo: motivo || 'Compra de concentrado',
                fecha: new Date(),
            });
            await movimiento.save();
            res.status(201).json({ message: 'Compra registrada correctamente', movimiento, stockAnterior, stockNuevo });
        }
        catch (error) {
            res.status(400).json({ error: 'Error al registrar compra', message: error instanceof Error ? error.message : undefined });
        }
    },
    async registrarAjuste(req, res) {
        try {
            const empresaId = getEmpresaId(req);
            if (!empresaId)
                return res.status(401).json({ error: 'No autenticado' });
            const empresaOid = new mongoose_1.default.Types.ObjectId(empresaId);
            const { concentradoTipoId, cantidad, motivo } = req.body;
            if (!concentradoTipoId || cantidad === undefined || cantidad === null || cantidad === '' || !motivo) {
                return res.status(400).json({ error: 'concentradoTipoId, cantidad y motivo son requeridos' });
            }
            const cantidadNum = Number(cantidad);
            if (cantidadNum === 0) {
                return res.status(400).json({ error: 'La cantidad no puede ser 0' });
            }
            const concentrado = await ConcentradoTipo_1.default.findOne({ _id: concentradoTipoId, empresaId });
            if (!concentrado)
                return res.status(404).json({ error: 'Tipo de concentrado no encontrado' });
            const stockAnterior = await getStock(new mongoose_1.default.Types.ObjectId(concentradoTipoId), empresaOid);
            const stockNuevo = stockAnterior + cantidadNum;
            if (stockNuevo < 0) {
                return res.status(400).json({ error: `El ajuste resultaría en stock negativo (actual: ${stockAnterior})` });
            }
            // Positive adjustment → 'ajuste' (adds), negative → 'salida' (subtracts).
            // Aggregation does: entradas - salidas + ajustes, so signs work out.
            const tipo = cantidadNum > 0 ? 'ajuste' : 'salida';
            const movimiento = new InventarioMovimiento_1.default({
                empresaId: empresaOid,
                concentradoTipoId,
                tipo,
                cantidad: Math.abs(cantidadNum),
                stockAnterior,
                stockNuevo,
                motivo: `[Ajuste] ${motivo}`,
                fecha: new Date(),
            });
            await movimiento.save();
            res.status(201).json({ message: 'Ajuste registrado correctamente', movimiento, stockAnterior, stockNuevo });
        }
        catch (error) {
            res.status(400).json({ error: 'Error al registrar ajuste', message: error instanceof Error ? error.message : undefined });
        }
    },
};
//# sourceMappingURL=inventario.controller.js.map