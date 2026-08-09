# Inteligência Bíblica — Fase 1

Esta versão adiciona o componente **Pergunte à Bíblia** à página inicial.

## Como configurar

1. Crie um arquivo `.env.local` na raiz do projeto.
2. Mantenha a sua `DATABASE_URL` existente.
3. Adicione:

```env
GEMINI_API_KEY="sua_chave_da_openai"
GEMINI_MODEL="gemini-2.5-flash-lite"
```

4. Instale as dependências normalmente e execute:

```bash
npm install
npm run dev
```

A chave da Google Gemini é usada apenas pela rota do servidor `/api/biblia/ia`.
Não use `NEXT_PUBLIC_GEMINI_API_KEY`.

## Como a busca funciona nesta fase

- A pergunta chega ao servidor.
- O servidor seleciona a tradução escolhida (ACF, ARA, NVI ou KJA).
- São gerados termos relacionados e o PostgreSQL procura versículos candidatos.
- Os candidatos são ranqueados localmente.
- Os melhores resultados são enviados como contexto para a Google Gemini.
- A resposta é devolvida junto com referências que existem no banco.
- Cada referência possui um link para o capítulo e para o versículo no site.

## Próxima etapa

A Fase 2 pode substituir a recuperação por palavras por **embeddings + pgvector no Neon**, melhorando bastante perguntas semânticas como “como vencer a preocupação com o futuro?” mesmo quando as palavras exatas não aparecem no versículo.
