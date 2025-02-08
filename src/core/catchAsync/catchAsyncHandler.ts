import { NextFunction, Request, Response } from "express";

const catchAsync = (controller: (req: Request, res: Response, next: NextFunction, err?: any) => Promise<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // controller(req, res, next).catch(next);
    controller(req, res, next).catch((err: any) => {
      console.log("error", err)
      return res.status(500).json({
        status: "error",
        message: "Unknown error",
        error: err
      });
    });
  };
};

export default catchAsync;
