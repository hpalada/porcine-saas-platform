import { Request, Response } from 'express';
export declare const settingsController: {
    /**
     * Obtiene la configuración actual
     */
    get(req: Request, res: Response): Promise<void>;
    /**
     * Actualiza la configuración
     */
    update(req: Request, res: Response): Promise<void>;
    /**
     * Obtiene solo el tema actual
     */
    getTheme(req: Request, res: Response): Promise<void>;
    /**
     * Obtiene solo el idioma actual
     */
    getLanguage(req: Request, res: Response): Promise<void>;
    /**
     * Reinicia la configuración a valores por defecto
     */
    reset(req: Request, res: Response): Promise<void>;
};
//# sourceMappingURL=settings.controller.d.ts.map