export const isRoarrLine = (text: string): boolean => {
  return text.includes('"message"') && text.includes('"sequence"');
};
