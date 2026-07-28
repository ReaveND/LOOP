import { NextResponse } from "next/server";

import { AuthService } from "@/lib/services/auth.service";
import { signupSchema } from "@/lib/validations/auth";
import { withErrorHandler } from "@/lib/utils/with-error-handler";

export const POST = withErrorHandler(async (request: Request) => {
  const body = await request.json();

  const validated = signupSchema.safeParse(body);

  if (!validated.success) {
    return NextResponse.json(
      {
        message: "Invalid input",
        errors: validated.error.flatten(),
      },
      {
        status: 400,
      }
    );
  }

  const user = await AuthService.signup(validated.data);

  return NextResponse.json(user, {
    status: 201,
  });
});