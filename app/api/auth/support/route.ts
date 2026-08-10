// app/api/auth/support/route.ts

import { NextResponse } from "next/server";
import {
    getBibleAppKey,
    getPanelApiUrl,
} from "../../../../lib/auth/config";

export async function GET() {
    try {
        const panelUrl = getPanelApiUrl();
        const appKey = getBibleAppKey();

        const response = await fetch(
            `${panelUrl}/api/apk/support?appKey=${encodeURIComponent(appKey)}`,
            {
                method: "GET",
                cache: "no-store",
            }
        );

        const data = await response.json().catch(() => null);

        if (!response.ok) {
            console.error("Erro suporte painel:", data);

            return NextResponse.json(
                {
                    error:
                        data?.error ||
                        "Não foi possível carregar o suporte.",
                },
                {
                    status: response.status || 500,
                },
            );
        }

        return NextResponse.json(
            {
                support: data?.support ?? null,
            },
            {
                headers: {
                    "Cache-Control": "no-store",
                },
            },
        );
    } catch (error) {
        console.error("Erro ao carregar suporte:", error);

        return NextResponse.json(
            {
                error: "Não foi possível conectar ao painel.",
            },
            {
                status: 500,
            },
        );
    }
}