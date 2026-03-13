export const getAmountSum = (items: { amount: number }[]): number => {
  return items.reduce((sum, { amount }) => sum + amount, 0);
};
