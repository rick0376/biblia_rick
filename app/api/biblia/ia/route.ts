import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

type Version = "acf" | "ara" | "nvi" | "kja";

const STOPWORDS = new Set([
  "a", "à", "ao", "aos", "as", "até", "com", "como", "da", "das", "de",
  "do", "dos", "e", "é", "em", "entre", "essa", "esse", "esta", "este",
  "eu", "foi", "há", "isso", "isto", "me", "na", "nas", "no", "nos", "o",
  "os", "ou", "para", "pela", "pelas", "pelo", "pelos", "por", "que", "qual",
  "quando", "se", "sem", "sobre", "sua", "suas", "seu", "seus", "também", "um",
  "uma", "umas", "uns", "daquela", "daquele", "dessa", "desse", "deste", "desta",
  "quem", "onde", "porque", "porquê", "meu", "minha", "meus", "minhas", "nosso",
  "nossa", "nossos", "nossas", "falar", "fala", "falam", "diz", "dizer", "ensina",
  "ensinar", "ensinado", "bíblia", "biblia", "versículo", "versiculos", "versículo",
]);

const RELATED_TERMS: Record<string, string[]> = {
  ansiedade: ["ansioso", "ansiosos", "ansiedade", "preocup", "aflição", "aflicao"],
  preocupação: ["preocup", "ansiedade", "ansioso", "aflição", "aflicao"],
  preocupado: ["preocup", "ansiedade", "ansioso", "aflição", "aflicao"],
  medo: ["medo", "temor", "temer", "receio", "coragem", "não temas", "nao temas"],
  fé: ["fé", "fe", "crer", "creia", "crê", "cre", "confiança", "confiar"],
  fe: ["fé", "fe", "crer", "creia", "crê", "cre", "confiança", "confiar"],
  confiança: ["confiança", "confiar", "confia", "fé", "fe", "esperança", "esperar"],
  confiar: ["confiar", "confia", "confiança", "fé", "fe", "esperança", "esperar"],
  perdão: ["perdão", "perdoar", "perdoa", "ofensa", "pecado", "misericórdia", "misericordia"],
  perdao: ["perdão", "perdoar", "perdoa", "ofensa", "pecado", "misericórdia", "misericordia"],
  amor: ["amor", "amar", "amai", "amou", "caridade"],
  família: ["família", "familia", "casa", "marido", "esposa", "filhos", "pais", "mãe", "mae", "pai"],
  familia: ["família", "familia", "casa", "marido", "esposa", "filhos", "pais", "mãe", "mae", "pai"],
  casamento: ["casamento", "marido", "esposa", "aliança", "alianca"],
  dinheiro: ["dinheiro", "riqueza", "rico", "pobre", "tesouro", "bens"],
  prosperidade: ["prosperidade", "prosperar", "riqueza", "bens", "provisão", "provisao"],
  depressão: ["triste", "tristeza", "angústia", "angustia", "abatido", "alma"],
  depressao: ["triste", "tristeza", "angústia", "angustia", "abatido", "alma"],
  cura: ["cura", "curar", "enfermidade", "doente", "doença", "doenca", "sarou", "sarar"],
  doença: ["doença", "doenca", "enfermidade", "doente", "cura", "curar", "sarar"],
  doenca: ["doença", "doenca", "enfermidade", "doente", "cura", "curar", "sarar"],
  oração: ["oração", "oracao", "orar", "orou", "pedido", "pedir", "súplica", "suplica"],
  oracao: ["oração", "oracao", "orar", "orou", "pedido", "pedir", "súplica", "suplica"],
  paz: ["paz", "descanso", "sossego", "tranquilidade", "refrigério", "refrigerio"],
  esperança: ["esperança", "esperanca", "esperar", "espera", "confiança", "confiar"],
  esperanca: ["esperança", "esperanca", "esperar", "espera", "confiança", "confiar"],
  salvação: ["salvação", "salvacao", "salvar", "salvo", "redenção", "redencao", "evangelho"],
  salvacao: ["salvação", "salvacao", "salvar", "salvo", "redenção", "redencao", "evangelho"],
  pecado: ["pecado", "pecar", "pecados", "iniquidade", "transgressão", "transgressao", "arrependimento"],
  arrependimento: ["arrependimento", "arrepender", "arrependei", "pecado", "confessar", "confissão", "confissao"],
  davi: ["davi", "daví"],
  jesus: ["jesus", "cristo", "senhor", "salvador"],
};

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

function tokenize(question: string) {
  return normalize(question)
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .split(/\s+/)
    .filter((word) => word.length >= 3 && !STOPWORDS.has(word));
}

function getSearchTerms(question: string) {
  const tokens = tokenize(question);
  const terms = new Set<string>();

  for (const token of tokens) {
    terms.add(token);
    for (const related of RELATED_TERMS[token] ?? []) {
      terms.add(related);
    }
  }

  return Array.from(terms).slice(0, 28);
}

function scoreVerse(text: string, terms: string[], question: string) {
  const normalizedText = normalize(text);
  const normalizedQuestion = normalize(question);
  let score = 0;

  for (const term of terms) {
    const normalizedTerm = normalize(term).trim();
    if (!normalizedTerm) continue;

    if (normalizedText.includes(normalizedTerm)) {
      score += normalizedTerm.includes(" ") ? 5 : 2;
    }
  }

  // Dá um pequeno bônus quando palavras relevantes aparecem próximas da pergunta.
  const questionTokens = tokenize(normalizedQuestion);
  for (const token of questionTokens) {
    if (normalizedText.includes(token)) score += 3;
  }

  return score;
}

function extractResponseText(data: unknown): string {
  if (!data || typeof data !== "object") return "";
  const value = data as Record<string, unknown>;

  if (typeof value.output_text === "string") return value.output_text;

  const output = value.output;
  if (!Array.isArray(output)) return "";

  const texts: string[] = [];
  for (const item of output) {
    if (!item || typeof item !== "object") continue;
    const content = (item as Record<string, unknown>).content;
    if (!Array.isArray(content)) continue;

    for (const part of content) {
      if (!part || typeof part !== "object") continue;
      const text = (part as Record<string, unknown>).text;
      if (typeof text === "string") texts.push(text);
    }
  }

  return texts.join("\n").trim();
}

function isVersion(value: string): value is Version {
  return value === "acf" || value === "ara" || value === "nvi" || value === "kja";
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "A inteligência bíblica ainda não foi configurada. Adicione GEMINI_API_KEY no arquivo .env do servidor.",
      },
      { status: 503 },
    );
  }

  let body: { question?: unknown; version?: unknown };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON inválido." }, { status: 400 });
  }

  const question = typeof body.question === "string" ? body.question.trim() : "";
  const version = typeof body.version === "string" ? body.version.toLowerCase() : "acf";

  if (question.length < 3) {
    return NextResponse.json(
      { ok: false, error: "Digite uma pergunta com pelo menos 3 caracteres." },
      { status: 400 },
    );
  }

  if (question.length > 500) {
    return NextResponse.json(
      { ok: false, error: "A pergunta deve ter no máximo 500 caracteres." },
      { status: 400 },
    );
  }

  if (!isVersion(version)) {
    return NextResponse.json({ ok: false, error: "Tradução inválida." }, { status: 400 });
  }

  try {
    const translation = await prisma.translation.findUnique({
      where: { code: version },
      select: { id: true, code: true, name: true },
    });

    if (!translation) {
      return NextResponse.json(
        { ok: false, error: "Tradução não encontrada." },
        { status: 404 },
      );
    }

    const terms = getSearchTerms(question);

    // Busca inicial barata usando o próprio PostgreSQL/Prisma.
    // Não substitui a futura busca vetorial; nesta fase serve como recuperação inicial.
    const candidates = await prisma.verse.findMany({
      where: {
        translationId: translation.id,
        OR: terms.map((term) => ({
          text: { contains: term, mode: "insensitive" },
        })),
      },
      select: {
        id: true,
        number: true,
        text: true,
        chapter: {
          select: {
            number: true,
            book: {
              select: { name: true, slug: true, order: true },
            },
          },
        },
      },
      take: 500,
    });

    const ranked = candidates
      .map((verse) => ({
        ...verse,
        score: scoreVerse(verse.text, terms, question),
      }))
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        if (a.chapter.book.order !== b.chapter.book.order) {
          return a.chapter.book.order - b.chapter.book.order;
        }
        if (a.chapter.number !== b.chapter.number) {
          return a.chapter.number - b.chapter.number;
        }
        return a.number - b.number;
      })
      .slice(0, 18);

    const context = ranked
      .map(
        (verse, index) =>
          `[${index + 1}] ${verse.chapter.book.name} ${verse.chapter.number}:${verse.number} — ${verse.text}`,
      )
      .join("\n");

    if (!context) {
      return NextResponse.json({
        ok: true,
        answer:
          "Não encontrei versículos suficientemente relacionados à sua pergunta na tradução selecionada. Tente usar outras palavras ou uma pergunta mais específica.",
        references: [],
        translation: translation.code,
      });
    }

    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";

    const prompt = `
Você é um assistente de estudo bíblico. Responda em português brasileiro, de forma clara, respeitosa e objetiva.

Pergunta do usuário:
${question}

Tradução selecionada: ${translation.name} (${translation.code.toUpperCase()})

Versículos recuperados do banco de dados da Bíblia:
${context}

Regras obrigatórias:
- Use somente os versículos fornecidos acima como base bíblica para as referências.
- Não invente capítulos, versículos, citações ou personagens.
- Não diga que você consultou uma base de dados.
- Se os versículos recuperados não forem suficientes para responder com segurança, diga isso explicitamente.
- Não faça afirmações doutrinárias como se fossem fatos indiscutíveis quando houver diferentes interpretações cristãs; prefira dizer "o texto apresenta", "o versículo ensina" ou "uma leitura possível é".
- Não crie uma lista de referências no final: as referências serão exibidas pela aplicação.
`;

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: {
            parts: [
              {
                text: "Você é um assistente de estudo bíblico. Sua função é explicar perguntas sobre a Bíblia com base exclusivamente no contexto fornecido pela aplicação.",
              },
            ],
          },
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 500,
          },
        }),
      },
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error("Erro do Gemini:", geminiResponse.status, errorText);
      return NextResponse.json(
        { ok: false, error: "Não foi possível obter a resposta da inteligência bíblica." },
        { status: 502 },
      );
    }

    const data = (await geminiResponse.json()) as any;
    const answer =
      data?.candidates?.[0]?.content?.parts
        ?.map((part: any) => (typeof part?.text === "string" ? part.text : ""))
        .join("\n")
        .trim() || "";

    if (!answer) {
      return NextResponse.json(
        { ok: false, error: "A inteligência bíblica não retornou uma resposta válida." },
        { status: 502 },
      );
    }

    return NextResponse.json({
      ok: true,
      answer,
      translation: translation.code,
      references: ranked.map((verse) => ({
        id: verse.id,
        number: verse.number,
        text: verse.text,
        reference: `${verse.chapter.book.name} ${verse.chapter.number}:${verse.number}`,
        book: verse.chapter.book.name,
        slug: verse.chapter.book.slug,
        chapter: verse.chapter.number,
      })),
    });
  } catch (error) {
    console.error("Erro na inteligência bíblica:", error);
    return NextResponse.json(
      { ok: false, error: "Não foi possível pesquisar a Bíblia agora." },
      { status: 500 },
    );
  }
}
