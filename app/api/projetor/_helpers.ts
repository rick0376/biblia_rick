//app/api/projetor/_helpers.ts

import { NextRequest, NextResponse } from "next/server";

export function validarTokenProjetor(req: NextRequest) {
  const tokenRecebido = req.headers.get("x-projetor-token");

  const tokenEsperado =
    process.env.PROJETOR_API_TOKEN || "lhp-projetor-igreja-2026";

  return tokenRecebido === tokenEsperado;
}

export function unauthorized() {
  return NextResponse.json(
    {
      ok: false,
      error: "Token do projetor inválido.",
    },
    {
      status: 401,
    },
  );
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json(
    {
      ok: false,
      error: message,
    },
    {
      status,
    },
  );
}
