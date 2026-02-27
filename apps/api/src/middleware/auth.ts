import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { LEADS_SUPABASE_JWT_SECRET } from '../config/env.js';

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
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  // Permitir preflight CORS sin autenticación
  if (req.method === 'OPTIONS') {
    // #region agent log
    fetch('http://127.0.0.1:7290/ingest/b2c4cb70-d50c-4374-bc86-0b8f1906e582',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'1b185d'},body:JSON.stringify({sessionId:'1b185d',location:'auth.ts:requireAuth:options',message:'OPTIONS passthrough',data:{path:req.path},timestamp:Date.now(),hypothesisId:'CORS-H1'})}).catch(()=>{});
    // #endregion
    next();
    return;
  }

  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    // #region agent log
    fetch('http://127.0.0.1:7290/ingest/b2c4cb70-d50c-4374-bc86-0b8f1906e582',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'1b185d'},body:JSON.stringify({sessionId:'1b185d',location:'auth.ts:requireAuth:noToken',message:'Missing Authorization header',data:{method:req.method,path:req.path},timestamp:Date.now(),hypothesisId:'CORS-H2'})}).catch(()=>{});
    // #endregion
    res.status(401).json({ error: 'No autorizado: falta el token' });
    return;
  }

  try {
    const decoded = jwt.verify(token, LEADS_SUPABASE_JWT_SECRET) as { sub: string; email?: string };
    req.user = { sub: decoded.sub, email: decoded.email };
    // #region agent log
    fetch('http://127.0.0.1:7290/ingest/b2c4cb70-d50c-4374-bc86-0b8f1906e582',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'1b185d'},body:JSON.stringify({sessionId:'1b185d',location:'auth.ts:requireAuth:ok',message:'Auth OK',data:{sub:decoded.sub != null,hasEmail:decoded.email != null,method:req.method,path:req.path},timestamp:Date.now(),hypothesisId:'CORS-H3'})}).catch(()=>{});
    // #endregion
    next();
  } catch {
    // #region agent log
    fetch('http://127.0.0.1:7290/ingest/b2c4cb70-d50c-4374-bc86-0b8f1906e582',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'1b185d'},body:JSON.stringify({sessionId:'1b185d',location:'auth.ts:requireAuth:invalid',message:'Invalid token',data:{method:req.method,path:req.path},timestamp:Date.now(),hypothesisId:'CORS-H2'})}).catch(()=>{});
    // #endregion
    res.status(401).json({ error: 'No autorizado: token inválido o expirado' });
  }
}
