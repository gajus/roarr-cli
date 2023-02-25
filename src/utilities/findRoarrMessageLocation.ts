export const findRoarrMessageLocation = (
  text: string,
): { end: number; start: number } | null => {
  const startIndex = text.indexOf('{"context":{');

  if (startIndex === -1) {
    return null;
  }

  const END = '"version":"2.0.0"}';

  const endIndex = text.indexOf(END);

  if (endIndex === -1) {
    return null;
  }

  return {
    end: endIndex + END.length,
    start: startIndex,
  };
};
