import { Request, Response } from 'express';
export declare const getLotes: (req: Request, res: Response) => Promise<void>;
export declare const getLote: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createLote: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateLote: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteLote: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateCantidadSalida: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getLotesStats: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getLoteResumen: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=lotes.controller.d.ts.map