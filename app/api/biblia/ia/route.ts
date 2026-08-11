// app/api/biblia/ia/route.ts

import { NextRequest, NextResponse } from "next/server";

import {
  getBibleAuth,
  hasBiblePermission,
} from "../../../../lib/auth/server";

import { prisma } from "../../../../lib/prisma";

type Version = "acf" | "ara" | "nvi" | "kja";

type CandidateVerse = {
  id: string | number;
  number: number;
  text: string;

  chapter: {
    number: number;

    book: {
      name: string;
      slug: string;
      order: number;
    };
  };
};

type RankedVerse = CandidateVerse & {
  score: number;
};

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
};

/* =========================================================
   PALAVRAS IGNORADAS NA PESQUISA
========================================================= */

const STOPWORDS = new Set([
  "a",
  "ao",
  "aos",
  "as",
  "ate",
  "com",
  "como",
  "da",
  "das",
  "de",
  "do",
  "dos",
  "e",
  "em",
  "entre",
  "essa",
  "esse",
  "esta",
  "este",
  "eu",
  "foi",
  "ha",
  "isso",
  "isto",
  "me",
  "na",
  "nas",
  "no",
  "nos",
  "o",
  "os",
  "ou",
  "para",
  "pela",
  "pelas",
  "pelo",
  "pelos",
  "por",
  "que",
  "qual",
  "quando",
  "se",
  "sem",
  "sobre",
  "sua",
  "suas",
  "seu",
  "seus",
  "tambem",
  "um",
  "uma",
  "umas",
  "uns",
  "daquela",
  "daquele",
  "dessa",
  "desse",
  "deste",
  "desta",
  "quem",
  "onde",
  "porque",
  "meu",
  "minha",
  "meus",
  "minhas",
  "nosso",
  "nossa",
  "nossos",
  "nossas",
  "falar",
  "fala",
  "falam",
  "diz",
  "dizer",
  "ensina",
  "ensinar",
  "ensinado",
  "biblia",
  "versiculo",
  "versiculos",
]);

const SHORT_ALLOWED_TERMS = new Set([
  "fe",
  "jo",
]);

/* =========================================================
   TERMOS RELACIONADOS
========================================================= */

const RELATED_TERMS: Record<string, string[]> = {
  ansiedade: [
    "ansioso",
    "ansiosos",
    "ansiedade",
    "preocup",
    "aflição",
    "aflicao",
  ],

  preocupacao: [
    "preocup",
    "ansiedade",
    "ansioso",
    "aflição",
    "aflicao",
  ],

  preocupado: [
    "preocup",
    "ansiedade",
    "ansioso",
    "aflição",
    "aflicao",
  ],

  medo: [
    "medo",
    "temor",
    "temer",
    "receio",
    "coragem",
    "não temas",
    "nao temas",
  ],

  fe: [
    "fé",
    "fe",
    "crer",
    "creia",
    "crê",
    "cre",
    "confiança",
    "confiar",
  ],

  confianca: [
    "confiança",
    "confiar",
    "confia",
    "fé",
    "fe",
    "esperança",
    "esperar",
  ],

  confiar: [
    "confiar",
    "confia",
    "confiança",
    "fé",
    "fe",
    "esperança",
    "esperar",
  ],

  perdao: [
    "perdão",
    "perdoar",
    "perdoa",
    "ofensa",
    "pecado",
    "misericórdia",
    "misericordia",
  ],

  amor: [
    "amor",
    "amar",
    "amai",
    "amou",
    "caridade",
  ],

  familia: [
    "família",
    "familia",
    "casa",
    "marido",
    "esposa",
    "filhos",
    "pais",
    "mãe",
    "mae",
    "pai",
  ],

  casamento: [
    "casamento",
    "marido",
    "esposa",
    "aliança",
    "alianca",
  ],

  dinheiro: [
    "dinheiro",
    "riqueza",
    "rico",
    "pobre",
    "tesouro",
    "bens",
  ],

  prosperidade: [
    "prosperidade",
    "prosperar",
    "riqueza",
    "bens",
    "provisão",
    "provisao",
  ],

  depressao: [
    "triste",
    "tristeza",
    "angústia",
    "angustia",
    "abatido",
    "alma",
  ],

  cura: [
    "cura",
    "curar",
    "enfermidade",
    "doente",
    "doença",
    "doenca",
    "sarou",
    "sarar",
  ],

  doenca: [
    "doença",
    "doenca",
    "enfermidade",
    "doente",
    "cura",
    "curar",
    "sarar",
  ],

  oracao: [
    "oração",
    "oracao",
    "orar",
    "orou",
    "pedido",
    "pedir",
    "súplica",
    "suplica",
  ],

  paz: [
    "paz",
    "descanso",
    "sossego",
    "tranquilidade",
    "refrigério",
    "refrigerio",
  ],

  esperanca: [
    "esperança",
    "esperanca",
    "esperar",
    "espera",
    "confiança",
    "confiar",
  ],

  salvacao: [
    "salvação",
    "salvacao",
    "salvar",
    "salvo",
    "redenção",
    "redencao",
    "evangelho",
  ],

  pecado: [
    "pecado",
    "pecar",
    "pecados",
    "iniquidade",
    "transgressão",
    "transgressao",
    "arrependimento",
  ],

  arrependimento: [
    "arrependimento",
    "arrepender",
    "arrependei",
    "pecado",
    "confessar",
    "confissão",
    "confissao",
  ],

  alcool: [
    "vinho",
    "bebida",
    "bebidas",
    "embriaguez",
    "embriagar",
    "bêbado",
    "bebado",
  ],

  alcoolismo: [
    "vinho",
    "bebida",
    "bebidas",
    "embriaguez",
    "embriagar",
    "bêbado",
    "bebado",
  ],

  bebida: [
    "vinho",
    "bebida",
    "bebidas",
    "embriaguez",
    "embriagar",
  ],

  davi: [
    "davi",
  ],

  jesus: [
    "jesus",
    "cristo",
    "salvador",
    "messias",
  ],

  espirito: [
    "espírito",
    "espirito",
    "espírito santo",
    "espirito santo",
  ],
};

/* =========================================================
   TERMOS QUE IDENTIFICAM ASSUNTO BÍBLICO
========================================================= */

const BIBLE_TOPIC_TERMS = new Set([
  // Deus e fé
  "deus",
  "senhor",
  "jesus",
  "cristo",
  "messias",
  "salvador",
  "espirito",
  "santo",
  "trindade",
  "fe",
  "oracao",
  "orar",
  "culto",
  "adoracao",
  "louvor",

  // Bíblia
  "biblia",
  "biblico",
  "biblica",
  "escritura",
  "escrituras",
  "versiculo",
  "versiculos",
  "evangelho",
  "evangelhos",
  "testamento",
  "profecia",
  "profeta",
  "apostolo",
  "apostolos",

  // Doutrina
  "pecado",
  "pecados",
  "salvacao",
  "arrependimento",
  "batismo",
  "ceia",
  "graca",
  "perdao",
  "santidade",
  "justificacao",
  "ressurreicao",
  "eternidade",
  "ceu",
  "inferno",
  "juizo",
  "mandamento",
  "mandamentos",
  "dizimo",
  "dizimos",
  "oferta",
  "ofertas",

  // Temas cristãos
  "amor",
  "ansiedade",
  "depressao",
  "medo",
  "esperanca",
  "confianca",
  "familia",
  "casamento",
  "divorcio",
  "adulterio",
  "alcool",
  "alcoolismo",
  "bebida",
  "vinho",
  "embriaguez",
  "cura",
  "doenca",
  "prosperidade",
  "dinheiro",

  // Personagens
  "adao",
  "eva",
  "noe",
  "abraao",
  "isaque",
  "jaco",
  "jose",
  "moises",
  "josue",
  "gideao",
  "sansao",
  "rute",
  "samuel",
  "saul",
  "davi",
  "salomao",
  "elias",
  "eliseu",
  "isaias",
  "jeremias",
  "daniel",
  "oseias",
  "jonas",
  "maria",
  "pedro",
  "paulo",
  "joao",
  "mateus",
  "marcos",
  "lucas",
  "tiago",
  "judas",

  // Livros da Bíblia
  "genesis",
  "exodo",
  "levitico",
  "numeros",
  "deuteronomio",
  "juizes",
  "reis",
  "cronicas",
  "esdras",
  "neemias",
  "ester",
  "jo",
  "salmos",
  "salmo",
  "proverbios",
  "eclesiastes",
  "cantares",
  "isaias",
  "jeremias",
  "lamentacoes",
  "ezequiel",
  "daniel",
  "oseias",
  "joel",
  "amos",
  "obadias",
  "jonas",
  "miqueias",
  "naum",
  "habacuque",
  "sofonias",
  "ageu",
  "zacarias",
  "malaquias",
  "mateus",
  "marcos",
  "lucas",
  "joao",
  "atos",
  "romanos",
  "corintios",
  "galatas",
  "efesios",
  "filipenses",
  "colossenses",
  "tessalonicenses",
  "timoteo",
  "tito",
  "filemom",
  "hebreus",
  "tiago",
  "pedro",
  "judas",
  "apocalipse",
]);

const BIBLE_PHRASES = [
  "palavra de deus",
  "palavra do senhor",
  "segundo a biblia",
  "na biblia",
  "da biblia",
  "pela biblia",
  "a biblia diz",
  "a biblia ensina",
  "o que deus diz",
  "o que deus ensina",
  "jesus disse",
  "jesus ensina",
  "espirito santo",
  "antigo testamento",
  "novo testamento",
  "vida eterna",
  "segunda vinda",
  "volta de jesus",
];

/* =========================================================
   NORMALIZA TEXTO
========================================================= */

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

/* =========================================================
   VERIFICA SE A PERGUNTA É BÍBLICA
========================================================= */

function isBiblicalQuestion(question: string) {
  const normalizedQuestion =
    normalize(question);

  if (
    BIBLE_PHRASES.some((phrase) =>
      normalizedQuestion.includes(phrase),
    )
  ) {
    return true;
  }

  const words = normalizedQuestion
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .split(/\s+/)
    .filter(Boolean);

  return words.some((word) =>
    BIBLE_TOPIC_TERMS.has(word),
  );
}

/* =========================================================
   TOKENIZA PERGUNTA
========================================================= */

function tokenize(question: string) {
  return normalize(question)
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .split(/\s+/)
    .filter(
      (word) =>
        (word.length >= 3 ||
          SHORT_ALLOWED_TERMS.has(word)) &&
        !STOPWORDS.has(word),
    );
}

/* =========================================================
   TERMOS DE PESQUISA
========================================================= */

function getSearchTerms(question: string) {
  const tokens = tokenize(question);

  const terms = new Set<string>();

  for (const token of tokens) {
    terms.add(token);

    for (
      const related of
      RELATED_TERMS[token] ?? []
    ) {
      terms.add(related);
    }
  }

  return Array.from(terms).slice(0, 28);
}

/* =========================================================
   PONTUA VERSÍCULOS
========================================================= */

function scoreVerse(
  text: string,
  terms: string[],
  question: string,
) {
  const normalizedText =
    normalize(text);

  let score = 0;

  for (const term of terms) {
    const normalizedTerm =
      normalize(term).trim();

    if (!normalizedTerm) {
      continue;
    }

    if (
      normalizedText.includes(
        normalizedTerm,
      )
    ) {
      score +=
        normalizedTerm.includes(" ")
          ? 5
          : 2;
    }
  }

  const questionTokens =
    tokenize(question);

  for (const token of questionTokens) {
    if (
      normalizedText.includes(token)
    ) {
      score += 3;
    }
  }

  return score;
}

/* =========================================================
   VALIDA VERSÃO
========================================================= */

function isVersion(
  value: string,
): value is Version {
  return (
    value === "acf" ||
    value === "ara" ||
    value === "nvi" ||
    value === "kja"
  );
}

/* =========================================================
   POST
========================================================= */

export async function POST(
  req: NextRequest,
) {
  /* -------------------------------------------------------
     1. LOGIN
  ------------------------------------------------------- */

  const auth = await getBibleAuth();

  if (!auth) {
    return NextResponse.json(
      {
        ok: false,

        error:
          "Sua sessão expirou. Faça login novamente.",
      },
      {
        status: 401,
      },
    );
  }

  /* -------------------------------------------------------
     2. PERMISSÃO DA IA
  ------------------------------------------------------- */

  if (
    !hasBiblePermission(
      auth,
      "use_ai",
    )
  ) {
    return NextResponse.json(
      {
        ok: false,

        error:
          "Seu usuário não possui permissão para utilizar a Inteligência Bíblica.",
      },
      {
        status: 403,
      },
    );
  }

  /* -------------------------------------------------------
     3. CONFIGURAÇÃO GEMINI
  ------------------------------------------------------- */

  const apiKey =
    process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        ok: false,

        error:
          "A inteligência bíblica ainda não foi configurada. Adicione GEMINI_API_KEY no arquivo .env do servidor.",
      },
      {
        status: 503,
      },
    );
  }

  /* -------------------------------------------------------
     4. RECEBE A PERGUNTA
  ------------------------------------------------------- */

  let body: {
    question?: unknown;
    version?: unknown;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: "JSON inválido.",
      },
      {
        status: 400,
      },
    );
  }

  const question =
    typeof body.question === "string"
      ? body.question.trim()
      : "";

  const version =
    typeof body.version === "string"
      ? body.version.toLowerCase()
      : "acf";

  if (question.length < 3) {
    return NextResponse.json(
      {
        ok: false,

        error:
          "Digite uma pergunta com pelo menos 3 caracteres.",
      },
      {
        status: 400,
      },
    );
  }

  if (question.length > 500) {
    return NextResponse.json(
      {
        ok: false,

        error:
          "A pergunta deve ter no máximo 500 caracteres.",
      },
      {
        status: 400,
      },
    );
  }

  if (!isVersion(version)) {
    return NextResponse.json(
      {
        ok: false,

        error: "Tradução inválida.",
      },
      {
        status: 400,
      },
    );
  }

  /* -------------------------------------------------------
     5. BLOQUEIA ASSUNTOS FORA DA BÍBLIA
  ------------------------------------------------------- */

  if (!isBiblicalQuestion(question)) {
    return NextResponse.json({
      ok: true,

      answer:
        "Esta ferramenta responde somente perguntas relacionadas à Bíblia, à Palavra de Deus e aos ensinamentos cristãos. Reformule sua pergunta dentro desse contexto.",

      references: [],

      translation: version,

      restricted: true,
    });
  }

  try {
    /* -----------------------------------------------------
       6. TRADUÇÃO
    ----------------------------------------------------- */

    const translation =
      await prisma.translation.findUnique({
        where: {
          code: version,
        },

        select: {
          id: true,
          code: true,
          name: true,
        },
      });

    if (!translation) {
      return NextResponse.json(
        {
          ok: false,

          error:
            "Tradução não encontrada.",
        },
        {
          status: 404,
        },
      );
    }

    /* -----------------------------------------------------
       7. TERMOS DA PESQUISA
    ----------------------------------------------------- */

    const terms =
      getSearchTerms(question);

    if (terms.length === 0) {
      return NextResponse.json({
        ok: true,

        answer:
          "Não encontrei palavras suficientes para realizar a pesquisa bíblica. Tente formular a pergunta de outra maneira.",

        references: [],

        translation:
          translation.code,
      });
    }

    /* -----------------------------------------------------
       8. BUSCA VERSÍCULOS
    ----------------------------------------------------- */

    const candidates =
      await prisma.verse.findMany({
        where: {
          translationId:
            translation.id,

          OR: terms.map((term) => ({
            text: {
              contains: term,
              mode: "insensitive",
            },
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
                select: {
                  name: true,
                  slug: true,
                  order: true,
                },
              },
            },
          },
        },

        take: 500,
      });

    /* -----------------------------------------------------
       9. RANKING
    ----------------------------------------------------- */

    const ranked: RankedVerse[] =
      candidates
        .map(
          (
            verse: CandidateVerse,
          ): RankedVerse => ({
            id: verse.id,
            number: verse.number,
            text: verse.text,
            chapter: verse.chapter,

            score: scoreVerse(
              verse.text,
              terms,
              question,
            ),
          }),
        )
        .sort(
          (
            a: RankedVerse,
            b: RankedVerse,
          ) => {
            if (
              b.score !== a.score
            ) {
              return (
                b.score - a.score
              );
            }

            if (
              a.chapter.book.order !==
              b.chapter.book.order
            ) {
              return (
                a.chapter.book.order -
                b.chapter.book.order
              );
            }

            if (
              a.chapter.number !==
              b.chapter.number
            ) {
              return (
                a.chapter.number -
                b.chapter.number
              );
            }

            return (
              a.number - b.number
            );
          },
        )
        .slice(0, 18);

    /* -----------------------------------------------------
       10. CONTEXTO
    ----------------------------------------------------- */

    const context = ranked
      .map(
        (
          verse: RankedVerse,
          index: number,
        ) =>
          `[${index + 1}] ${verse.chapter.book.name} ${verse.chapter.number}:${verse.number} — ${verse.text}`,
      )
      .join("\n");

    if (!context) {
      return NextResponse.json({
        ok: true,

        answer:
          "Não encontrei versículos suficientemente relacionados à sua pergunta na tradução selecionada. Tente usar outras palavras ou uma pergunta mais específica.",

        references: [],

        translation:
          translation.code,
      });
    }

    /* -----------------------------------------------------
       11. MODELO GEMINI
    ----------------------------------------------------- */

    const model =
      process.env.GEMINI_MODEL ||
      "gemini-2.5-flash-lite";

    const prompt = `
Você é um assistente dedicado exclusivamente ao estudo da Bíblia e da Palavra de Deus.

Sua função é responder somente perguntas relacionadas a:
- Bíblia;
- personagens bíblicos;
- acontecimentos bíblicos;
- ensinamentos de Jesus Cristo;
- doutrina cristã fundamentada nas Escrituras;
- fé cristã;
- vida espiritual;
- pecado;
- salvação;
- oração;
- família;
- casamento;
- comportamento cristão;
- temas morais analisados à luz das Escrituras.

Responda sempre em português brasileiro, de forma clara, respeitosa e objetiva.

Pergunta do usuário:
${question}

Tradução selecionada:
${translation.name} (${translation.code.toUpperCase()})

Versículos recuperados:
${context}

REGRAS OBRIGATÓRIAS:

1. Responda somente dentro do contexto bíblico.

2. Use somente os versículos fornecidos acima como base para referências bíblicas.

3. Não invente capítulos, versículos, citações, personagens ou acontecimentos.

4. Não transforme perguntas não bíblicas em histórias bíblicas apenas porque alguma palavra parecida apareceu nos versículos.

5. Não forneça notícias, resultados esportivos, informações políticas atuais, previsão do tempo, receitas, programação, preços, celebridades ou outros assuntos externos à Bíblia.

6. Se perceber que a pergunta não é realmente bíblica, responda somente:
"Esta ferramenta responde somente perguntas relacionadas à Bíblia, à Palavra de Deus e aos ensinamentos cristãos."

7. Se os versículos recuperados não forem suficientes para responder com segurança, diga isso claramente.

8. Quando houver diferentes interpretações cristãs, não apresente uma interpretação como fato indiscutível.

9. Prefira expressões como:
"o texto apresenta",
"o versículo ensina",
"à luz desses versículos",
"uma leitura possível é".

10. Não diga que consultou banco de dados, algoritmo, sistema de busca ou inteligência artificial.

11. Não crie uma lista de referências no final. As referências serão exibidas separadamente pela aplicação.
`;

    /* -----------------------------------------------------
       12. GEMINI
    ----------------------------------------------------- */

    const geminiResponse =
      await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
          model,
        )}:generateContent?key=${encodeURIComponent(
          apiKey,
        )}`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            systemInstruction: {
              parts: [
                {
                  text:
                    "Você é um assistente dedicado exclusivamente ao estudo da Bíblia e da Palavra de Deus. Não responda assuntos externos à Bíblia ou à fé cristã.",
                },
              ],
            },

            contents: [
              {
                role: "user",

                parts: [
                  {
                    text: prompt,
                  },
                ],
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
      const errorText =
        await geminiResponse.text();

      console.error(
        "Erro do Gemini:",
        geminiResponse.status,
        errorText,
      );

      return NextResponse.json(
        {
          ok: false,

          error:
            "Não foi possível obter a resposta da inteligência bíblica.",
        },
        {
          status: 502,
        },
      );
    }

    /* -----------------------------------------------------
       13. RESPOSTA
    ----------------------------------------------------- */

    const data =
      (await geminiResponse.json()) as GeminiResponse;

    const answer =
      data.candidates?.[0]?.content?.parts
        ?.map((part) =>
          typeof part.text ===
            "string"
            ? part.text
            : "",
        )
        .join("\n")
        .trim() || "";

    if (!answer) {
      return NextResponse.json(
        {
          ok: false,

          error:
            "A inteligência bíblica não retornou uma resposta válida.",
        },
        {
          status: 502,
        },
      );
    }

    /* -----------------------------------------------------
       14. RETORNO
    ----------------------------------------------------- */

    return NextResponse.json({
      ok: true,

      answer,

      translation:
        translation.code,

      references: ranked.map(
        (verse: RankedVerse) => ({
          id: verse.id,

          number: verse.number,

          text: verse.text,

          reference:
            `${verse.chapter.book.name} ${verse.chapter.number}:${verse.number}`,

          book:
            verse.chapter.book.name,

          slug:
            verse.chapter.book.slug,

          chapter:
            verse.chapter.number,
        }),
      ),
    });
  } catch (error) {
    console.error(
      "Erro na inteligência bíblica:",
      error,
    );

    return NextResponse.json(
      {
        ok: false,

        error:
          "Não foi possível pesquisar a Bíblia agora.",
      },
      {
        status: 500,
      },
    );
  }
}