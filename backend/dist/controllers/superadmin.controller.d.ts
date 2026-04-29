import { Request, Response } from 'express';
export declare function verificarSuperAdmin(req: Request, res: Response, next: Function): Response<any, Record<string, any>> | undefined;
export declare const superadminController: {
    login(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getClientes(req: Request, res: Response): Promise<void>;
    getCliente(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    toggleSuscripcion(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    toggleAcceso(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    setPlan(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getDashboardStats(req: Request, res: Response): Promise<void>;
};
//# sourceMappingURL=superadmin.controller.d.ts.map