import { Request, Response } from 'express';
export declare const currencyController: {
    /**
     * Convierte USD a HNL
     */
    convertToHNL(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Obtiene la información del tipo de cambio actual
     */
    exchangeRate(req: Request, res: Response): Promise<void>;
};
//# sourceMappingURL=currency.controller.d.ts.map