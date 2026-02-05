export const hash01 = (n: number) => {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

export const noise2 = (i: number) => {
  const a = hash01(i * 7.13);
  const b = hash01(i * 13.7 + 99.1);
  return { x: a * 2 - 1, y: b * 2 - 1 };
};
