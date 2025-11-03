export const getRowArrValues = (arr: string[]) => {
  if (!arr.length) {
    return "";
  }
  return arr.join(", ");
};
