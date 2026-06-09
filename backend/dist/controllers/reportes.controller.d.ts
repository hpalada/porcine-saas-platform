import { Request, Response } from 'express';
export declare const reportesController: {
    rentabilidad(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    dashboard(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    consumoDiario(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    exportar(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    costoAcumulado(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    porFecha(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    resumenCompletoPorLote(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
};
//# sourceMappingURL=reportes.controller.d.ts.map