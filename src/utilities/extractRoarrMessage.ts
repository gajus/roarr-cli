export const extractRoarrMessage = (
  subject: string,
  messageLocation: {
    end: number;
    start: number;
  },
) => {
  const head = subject.slice(0, messageLocation.start);
  const body = subject.slice(messageLocation.start, messageLocation.end);
  const tail = subject.slice(messageLocation.end);

  return {
    body,
    head,
    tail,
  };
};
