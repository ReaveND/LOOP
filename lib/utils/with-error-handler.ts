import { NextResponse } from "next/server";
import { AppError } from "@/lib/errors";

export function withErrorHandler<T extends Request = Request>(
  handler: (request: T) => Promise<Response>
): (request: T) => Promise<Response> {
  return async (request: T) => {
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