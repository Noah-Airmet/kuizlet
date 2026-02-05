export const shuffle = <T,>(items: T[]): T[] => {
  const array = [...items];
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

export const pickRandom = <T,>(items: T[], count: number): T[] => {
  if (count <= 0) return [];
  if (items.length <= count) return [...items];
  return shuffle(items).slice(0, count);
};
