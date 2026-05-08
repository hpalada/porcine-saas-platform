import { Request, Response } from 'express';
export declare const mortalidadController: {
    index(req: Request, res: Response): Promise<void>;
    porLote(req: Request, res: Response): Promise<void>;
    crear(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    actualizar(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    eliminar(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
};
//# sourceMappingURL=mortalidad.controller.d.ts.map