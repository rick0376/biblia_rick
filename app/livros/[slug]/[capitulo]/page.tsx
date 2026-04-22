//app/livros/[slug]/[capitulo]/page.tsx

import { prisma } from "../../../../lib/prisma";
import CapituloClient from "../../../components/CapituloClient";

type Version = "acf" | "ara" | "nvi" | "kja";

function normalizeVersion(v?: string): Version {
  if (v === "acf" || v === "ara" || v === "nvi" || v === "kja") return v;
  return "acf";
}

export default async function CapituloPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; capitulo: string }>;
  searchParams?: Promise<{ v?: string }>;
}) {
  const { slug, capitulo } = await params;
  const { v } = (await searchParams) ?? {};
  const version = normalizeVersion(v);

  const numeroCapitulo = Number(capitulo);
  if (!Number.isFinite(numeroCapitulo) || numeroCapitulo <= 0) {
    return <h1>Capítulo inválido</h1>;
  }

  const translation = await prisma.translation.findUnique({
    where: { code: version },
    select: { id: true },
  });

  if (!translation) return <h1>Tradução não encontrada</h1>;

  const chapter = await prisma.chapter.findFirst({
    where: {
      number: numeroCapitulo,
      book: { slug },
      verses: { some: { translationId: translation.id } },
    },
    include: {
      book: true,
      verses: {
        where: { translationId: translation.id },
        orderBy: { number: "asc" },
        include: {
          favorite: {
            select: { id: true },
          },
          note: {
            select: {
              content: true,
            },
          },
        },
      },
    },
  });

  if (!chapter) return <h1>Capítulo não encontrado</h1>;

  return (
    <CapituloClient
      slug={slug}
      livro={chapter.book.name}
      capitulo={chapter.number}
      versiculos={chapter.verses.map((vv) => ({
        id: vv.id,
        number: vv.number,
        text: vv.text,
        isFavorite: Boolean(vv.favorite),
        noteContent: vv.note?.content ?? null,
      }))}
      version={version}
    />
  );
}
