export const findRoarrMessageLocation = (
  text: string,
): { end: number; start: number } | null => {
  const startIndex = text.indexOf('{"context":{');

  if (startIndex === -1) {
    return null;
  }

  const endIndex = text.indexOf('"version":"2.0.0"}');

  if (endIndex === -1) {
    return null;
  }

  return {
    end: endIndex,
    start: startIndex,
  };
};
