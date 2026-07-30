import { NextResponse } from "next/server";
import { AppError } from "@/lib/errors";

export function withErrorHandler<T extends any[]>(
  handler: (...args: T) => Promise<Response>
): (...args: T) => Promise<Response> {
  return async (...args: T) => {
    try {
      return await handler(...args);
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