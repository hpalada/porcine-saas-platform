export interface Lote {
  _id: string;
  nombre: string;
  fechaIngreso: string;
  horaIngreso: string;
  cantidadInicial: number;
  cantidadActual: number;
  cantidadSalida: number;
  estado: 'activo' | 'finalizado';
  descripcion?: string;
  empresaId: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotaLote {
  _id: string;
  loteId: string;
  tipo: 'vacunacion' | 'desparasitacion' | 'vitaminas' | 'medicina' | 'observacion' | 'otro';
  descripcion: string;
  fecha: string;
  createdAt: string;
}

export interface ConcentradoTipo {
  _id: string;
  nombre: string;
  descripcion?: string;
  precioActual: number;
  unidad: 'saco' | 'kg';
  pesoPorSaco?: number;
  createdAt: string;
  updatedAt: string;
}

export interface InventarioStock {
  _id: string;
  nombre: string;
  unidad: 'saco' | 'kg';
  precioActual: number;
  stock: number;
  entradas: number;
  salidas: number;
  ajustes: number;
}

export interface InventarioMovimiento {
  _id: string;
  concentradoTipoId: string | ConcentradoTipo;
  tipo: 'entrada' | 'salida' | 'ajuste';
  cantidad: number;
  stockAnterior: number;
  stockNuevo: number;
  motivo: string;
  referenciaId?: string;
  fecha: string;
  createdAt: string;
}

export interface ConsumoRegistro {
  _id: string;
  loteId: string | Lote;
  concentradoTipoId: string | ConcentradoTipo;
  cantidad: number;
  precioUnitario: number;
  costoTotal: number;
  fecha: string;
  observaciones?: string;
  createdAt: string;
}

export interface GastoAdicional {
  _id: string;
  loteId?: string | Lote;
  categoria: 'medicina' | 'transporte' | 'mano_obra' | 'servicios' | 'lechon' | 'trabajador' | 'otro';
  descripcion: string;
  monto: number;
  fecha: string;
  createdAt: string;
}

export interface VentaRegistro {
  _id: string;
  loteId: string | Lote;
  cantidadCerdos: number;
  pesoTotal: number;
  precioPorKg: number;
  ingresoTotal: number;
  fechaVenta: string;
  comprador?: string;
  createdAt: string;
}

export interface ReporteRentabilidad {
  lote: {
    _id: string;
    nombre: string;
    cantidadInicial: number;
    cantidadActual: number;
    cantidadSalida: number;
    fechaIngreso: string;
    estado: string;
  };
  ingresos: {
    total: number;
    cerdosVendidos: number;
    pesoTotal: number;
    precioPromedio: number;
  };
  costos: {
    concentrado: { total: number; cantidad: number };
    otrosGastos: { total: number; porCategoria: Record<string, number> };
    totales: number;
  };
  resultado: {
    utilidad: number;
    margen: number;
    estado: 'rentable' | 'perdida' | 'equilibrio';
  };
  indicadores: {
    costoPorCerdo: number;
    costoPorKg: number;
    cerdosActuales: number;
  };
}
