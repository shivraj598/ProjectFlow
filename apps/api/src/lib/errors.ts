import type { NextFunction, Request, RequestHandler, Response } from "express";

export class AppError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

type AsyncHandler<TReq extends Request = Request> = (req: TReq, res: Response, next: NextFunction) => Promise<unknown>;

export function asyncHandler<TReq extends Request = Request>(fn: AsyncHandler<TReq>): RequestHandler {
  return (req, res, next) => {
    fn(req as TReq, res, next).catch(next);
  };
}

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ error: "Not found" });
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  console.error(err);
  if (err instanceof AppError) {
    return res.status(err.status).json({ error: err.message });
  }
  res.status(500).json({ error: "Internal server error" });
}
