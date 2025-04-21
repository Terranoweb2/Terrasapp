import { Request, Response, NextFunction } from 'express';

// Definition of the custom request handler type
export type RequestHandler = (req: Request, res: Response, next: NextFunction) => Promise<void> | void;
