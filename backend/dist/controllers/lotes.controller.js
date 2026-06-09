"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLoteResumen = exports.getLotesStats = exports.updateCantidadSalida = exports.deleteLote = exports.updateLote = exports.createLote = exports.getLote = exports.getLotes = void 0;
const Lote_1 = require("../models/Lote");
const ConsumoRegistro_1 = __importDefault(require("../models/ConsumoRegistro"));
const GastoAdicional_1 = __importDefault(require("../models/GastoAdicional"));
const VentaRegistro_1 = __importDefault(require("../models/VentaRegistro"));
const mongoose_1 = __importDefault(require("mongoose"));
const getEmpresaId = (req) => req.empresaId || req.query.empresaId;
const getLotes = async (req, res) => {
    try {
        const empresaId = getEmpresaId(req);
        const { estado } = req.query;
        const query = { empresaId };
        if (estado)
            query.estado = estado;
        const lotes = await Lote_1.Lote.find(query).sort({ fechaIngreso: -1 }).lean();
        res.status(200).json(lotes);
    }
    catch (error) {
        res.status(500).json({ error: 'Error al obtener los lotes' });
    }
};
exports.getLotes = getLotes;
const getLote = async (req, res) => {
    try {
        const empresaId = getEmpresaId(req);
        const lote = await Lote_1.Lote.findOne({ _id: req.params.id, empresaId });
        if (!lote)
            return res.status(404).json({ error: 'Lote no encontrado' });
        res.status(200).json(lote);
    }
    catch (error) {
        res.status(500).json({ error: 'Error al obtener el lote' });
    }
};
exports.getLote = getLote;
const createLote = async (req, res) => {
    try {
        const empresaId = getEmpresaId(req);
        const { nombre, fechaIngreso, horaIngreso, cantidadInicial, descripcion } = req.body;
        if (!nombre || !fechaIngreso || !cantidadInicial) {
            return res.status(400).json({ error: 'Faltan campos requeridos: nombre, fechaIngreso, cantidadInicial' });
        }
        const existe = await Lote_1.Lote.findOne({ empresaId, nombre: nombre.trim() });
        if (existe) {
            return res.status(400).json({ error: `Ya existe un lote con el nombre "${nombre.trim()}"` });
        }
        const lote = new Lote_1.Lote({
            empresaId,
            nombre,
            fechaIngreso: new Date(fechaIngreso),
            horaIngreso: horaIngreso || '00:00',
            cantidadInicial: Number(cantidadInicial),
            cantidadActual: Number(cantidadInicial),
            cantidadSalida: 0,
            descripcion: descripcion || '',
        });
        await lote.save();
        res.status(201).json({ message: 'Lote creado exitosamente', lote });
    }
    catch (error) {
        console.error('Error creating lote:', error);
        res.status(500).json({ error: 'Error al crear el lote' });
    }
};
exports.createLote = createLote;
const updateLote = async (req, res) => {
    try {
        const empresaId = getEmpresaId(req);
        const { nombre, descripcion, estado, cantidadSalida } = req.body;
        const lote = await Lote_1.Lote.findOne({ _id: req.params.id, empresaId });
        if (!lote)
            return res.status(404).json({ error: 'Lote no encontrado' });
        if (nombre !== undefined) {
            const existe = await Lote_1.Lote.findOne({ empresaId, nombre: nombre.trim(), _id: { $ne: lote._id } });
            if (existe) {
                return res.status(400).json({ error: `Ya existe un lote con el nombre "${nombre.trim()}"` });
            }
            lote.nombre = nombre;
        }
        if (descripcion !== undefined)
            lote.descripcion = descripcion;
        if (estado !== undefined)
            lote.estado = estado;
        if (cantidadSalida !== undefined) {
            const salida = Number(cantidadSalida);
            if (salida > lote.cantidadInicial) {
                return res.status(400).json({ error: 'La cantidad de salida no puede superar la cantidad inicial' });
            }
            lote.cantidadSalida = salida;
            lote.cantidadActual = Math.max(0, lote.cantidadInicial - salida - (lote.cantidadMuertas || 0));
        }
        await lote.save();
        res.status(200).json({ message: 'Lote actualizado exitosamente', lote });
    }
    catch (error) {
        res.status(500).json({ error: 'Error al actualizar el lote' });
    }
};
exports.updateLote = updateLote;
const deleteLote = async (req, res) => {
    try {
        const empresaId = getEmpresaId(req);
        const lote = await Lote_1.Lote.findOneAndDelete({ _id: req.params.id, empresaId });
        if (!lote)
            return res.status(404).json({ error: 'Lote no encontrado' });
        res.status(200).json({ message: 'Lote eliminado exitosamente' });
    }
    catch (error) {
        res.status(500).json({ error: 'Error al eliminar el lote' });
    }
};
exports.deleteLote = deleteLote;
const updateCantidadSalida = async (req, res) => {
    try {
        const empresaId = getEmpresaId(req);
        const { cantidadSalida } = req.body;
        const lote = await Lote_1.Lote.findOne({ _id: req.params.id, empresaId });
        if (!lote)
            return res.status(404).json({ error: 'Lote no encontrado' });
        const salida = Number(cantidadSalida);
        if (salida > lote.cantidadInicial) {
            return res.status(400).json({ error: 'La cantidad de salida no puede superar la cantidad inicial' });
        }
        lote.cantidadSalida = salida;
        lote.cantidadActual = Math.max(0, lote.cantidadInicial - salida - (lote.cantidadMuertas || 0));
        await lote.save();
        res.status(200).json({ message: 'Cantidad actualizada exitosamente', lote });
    }
    catch (error) {
        res.status(500).json({ error: 'Error al actualizar la cantidad' });
    }
};
exports.updateCantidadSalida = updateCantidadSalida;
const getLotesStats = async (req, res) => {
    try {
        const empresaId = getEmpresaId(req);
        if (!empresaId)
            return res.status(400).json({ error: 'empresaId es requerido' });
        const empresaOid = new mongoose_1.default.Types.ObjectId(empresaId);
        const [totalLotes, lotesActivos, totalAnimalesData] = await Promise.all([
            Lote_1.Lote.countDocuments({ empresaId }),
            Lote_1.Lote.countDocuments({ empresaId, estado: 'activo' }),
            Lote_1.Lote.aggregate([
                { $match: { empresaId: empresaOid } },
                { $group: { _id: null, total: { $sum: '$cantidadActual' } } },
            ]),
        ]);
        res.status(200).json({
            totalLotes,
            lotesActivos,
            totalAnimalesActivos: totalAnimalesData[0]?.total || 0,
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
};
exports.getLotesStats = getLotesStats;
const getLoteResumen = async (req, res) => {
    try {
        const empresaId = getEmpresaId(req);
        if (!empresaId)
            return res.status(400).json({ error: 'empresaId requerido' });
        const lote = await Lote_1.Lote.findOne({ _id: req.params.id, empresaId });
        if (!lote)
            return res.status(404).json({ error: 'Lote no encontrado' });
        const loteOid = new mongoose_1.default.Types.ObjectId(req.params.id);
        const empresaOid = new mongoose_1.default.Types.ObjectId(empresaId);
        const [consumos, gastos, ventas] = await Promise.all([
            ConsumoRegistro_1.default.aggregate([{ $match: { loteId: loteOid, empresaId: empresaOid } }, { $group: { _id: null, totalCostos: { $sum: '$costoTotal' } } }]),
            GastoAdicional_1.default.aggregate([{ $match: { loteId: loteOid, empresaId: empresaOid } }, { $group: { _id: null, totalGastos: { $sum: '$monto' } } }]),
            VentaRegistro_1.default.aggregate([{ $match: { loteId: loteOid, empresaId: empresaOid } }, { $group: { _id: null, totalIngresos: { $sum: '$ingresoTotal' }, totalCerdos: { $sum: '$cantidadCerdos' } } }]),
        ]);
        const costosConcentrado = consumos[0]?.totalCostos || 0;
        const otrosGastos = gastos[0]?.totalGastos || 0;
        const ingresos = ventas[0]?.totalIngresos || 0;
        const cerdosVendidos = ventas[0]?.totalCerdos || 0;
        const costosTotales = costosConcentrado + otrosGastos;
        const utilidad = ingresos - costosTotales;
        const margen = ingresos > 0 ? (utilidad / ingresos) * 100 : 0;
        const costoPorAnimal = lote.cantidadInicial > 0 ? costosTotales / lote.cantidadInicial : 0;
        res.status(200).json({
            lote,
            resumen: {
                costosConcentrado,
                otrosGastos,
                costosTotales,
                ingresos,
                utilidad,
                margen: Math.round(margen * 100) / 100,
                cerdosVendidos,
                cerdosActuales: lote.cantidadActual,
                costoPorAnimal: Math.round(costoPorAnimal * 100) / 100,
                estado: utilidad > 0 ? 'rentable' : utilidad < 0 ? 'perdida' : 'equilibrio',
            },
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Error al calcular resumen' });
    }
};
exports.getLoteResumen = getLoteResumen;
//# sourceMappingURL=lotes.controller.js.map