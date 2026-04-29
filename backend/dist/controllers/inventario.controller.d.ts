import { Request, Response } from 'express';
export declare const inventarioController: {
    stockActual(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    historial(req: Request, res: Response): Promise<void>;
    registrarCompra(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    registrarAjuste(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
};
//# sourceMappingURL=inventario.controller.d.ts.map