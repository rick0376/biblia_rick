export type HarpaHino = {
  number: number;
  title: string;
  verses: string[];
};

export const harpaHinos: HarpaHino[] = [
  {
    number: 1,
    title: "Chuvas de Graça",
    verses: [
      "Deus prometeu com certeza\nChuvas de graça mandar;",
      "Ele nos dá fortaleza,\nE ricas bênçãos sem par.",
      "Chuvas de graça,\nChuvas pedimos, Senhor;\nManda-nos chuvas constantes,\nChuvas do Consolador.",
    ],
  },

  {
    number: 2,
    title: "Saudosa Lembrança",
    verses: [
      "Oh! Que saudosa lembrança\nTenho de Ti, ó Jesus!",
      "Era pequena criança\nQuando me deste a luz.",
    ],
  },

  // 👉 depois vamos acrescentando até chegar aos 640
];
