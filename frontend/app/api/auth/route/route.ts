import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const endpoint = body.action === "login" ? "login" : "register"

    const response = await fetch(`${BACKEND_URL}/api/auth/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: body.email,
        password: body.password
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || "Une erreur est survenue" },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")
    if (!token) {
      return NextResponse.json(
        { message: "Non autorisé" },
        { status: 401 }
      )
    }

    const response = await fetch(`${BACKEND_URL}/api/auth/profile`, {
      headers: {
        "Authorization": token,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || "Une erreur est survenue" },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}