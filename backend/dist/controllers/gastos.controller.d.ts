import { Request, Response } from 'express';
export declare const gastosController: {
    index(req: Request, res: Response): Promise<void>;
    show(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    create(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    update(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    delete(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
};
//# sourceMappingURL=gastos.controller.d.ts.map