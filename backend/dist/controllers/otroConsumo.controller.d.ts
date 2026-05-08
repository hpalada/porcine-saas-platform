import { Request, Response } from 'express';
export declare const otroConsumoController: {
    index(req: Request, res: Response): Promise<void>;
    porLote(req: Request, res: Response): Promise<void>;
    resumenPorLote(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    registrar(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    update(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    delete(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
};
//# sourceMappingURL=otroConsumo.controller.d.ts.map