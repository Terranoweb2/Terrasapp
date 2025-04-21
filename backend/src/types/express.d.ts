import { Request as ExpressRequest, Response as ExpressResponse } from 'express';

// Extension des types Express avec les champs utilisateur
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        [key: string]: any;
      };
    }
  }
}

// Types courants pour les fonctions de contrôleur
export type Request = ExpressRequest;
export type Response = ExpressResponse;
export type RequestHandler = (req: Request, res: Response) => Promise<void> | void;
