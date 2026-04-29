import { Request, Response } from 'express';
export declare const vacunacionController: {
    porLote(req: Request, res: Response): Promise<void>;
    index(req: Request, res: Response): Promise<void>;
    create(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    update(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    delete(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
};
//# sourceMappingURL=vacunacion.controller.d.ts.map