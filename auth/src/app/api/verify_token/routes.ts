import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// Verify if a bearer token is valid
export async function POST(request: NextRequest) {
  try {
    // Get token from request body
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { error: "Missing token" },
        { status: 400 }
      );
    }

    // Verify the token using Better Auth
    const session = await auth.api.getSession({
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    if (!session || !session.user) {
      return NextResponse.json(
        { valid: false, error: "Invalid or expired token" },
        { status: 200 }
      );
    }

    // Return user information
    return NextResponse.json({
      valid: true,
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
      },
      session: {
        expiresAt: session.session.expiresAt,
      },
    });
  } catch (error) {
    console.error("Token verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}