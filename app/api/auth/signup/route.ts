import { NextResponse } from "next/server";

import { AppError } from "@/lib/errors";
import { AuthService } from "@/lib/services/auth.service";
import { signupSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const validation = signupSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          message: "Validation failed.",
          errors: validation.error.flatten().fieldErrors,
        },
        {
          status: 400,
        }
      );
    }

    const result = await AuthService.signup(validation.data);

    return NextResponse.json(result, {
      status: 201,
    });
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
}