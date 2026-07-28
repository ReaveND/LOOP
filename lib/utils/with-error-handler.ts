import { NextResponse } from "next/server";
import { AppError } from "@/lib/errors";

type RouteHandler = (request: Request) => Promise<Response>;

export function withErrorHandler(handler: RouteHandler): RouteHandler {
  return async (request: Request) => {
    try {
      return await handler(request);
    } catch (error) {
      if (error instanceof AppError) {
        return NextResponse.json(
          {
            message: error.message,
          },
          {
            status: error.statusCode,
          }
        );
      }

      console.error(error);

      return NextResponse.json(
        {
          message: "Internal Server Error",
        },
        {
          status: 500,
        }
      );
    }
  };
}