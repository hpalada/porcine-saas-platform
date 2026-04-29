import { Request, Response } from 'express';
export declare const consumosController: {
    index(req: Request, res: Response): Promise<void>;
    porLote(req: Request, res: Response): Promise<void>;
    resumen(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    registrar(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    delete(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
};
//# sourceMappingURL=consumos.controller.d.ts.map