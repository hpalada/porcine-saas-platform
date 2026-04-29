import { Request, Response } from 'express';
export declare const authController: {
    registrarse(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    login(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    verificar(req: Request, res: Response): Promise<void>;
    solicitarReset(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    verificarPin(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    nuevaContraseña(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    googleRedirect(req: Request, res: Response): Response<any, Record<string, any>> | undefined;
    googleCallback(req: Request, res: Response): Promise<void>;
    completarPerfilGoogle(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
};
export declare function verificarToken(req: Request, res: Response, next: Function): Response<any, Record<string, any>> | undefined;
export declare function verificarRol(rolesPermitidos: string[]): (req: Request, res: Response, next: Function) => Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=auth.controller.d.ts.map