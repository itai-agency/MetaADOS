import type { Request, Response, NextFunction } from 'express';
export interface AuthPayload {
    sub: string;
    email?: string;
}
declare global {
    namespace Express {
        interface Request {
            user?: AuthPayload;
        }
    }
}
/**
 * Verifica el JWT de Supabase Auth (proyecto SDR/Leads).
 * Espera header: Authorization: Bearer <access_token>
 */
export declare function requireAuth(req: Request, res: Response, next: NextFunction): void;
//# sourceMappingURL=auth.d.ts.map