export const getPublisherName = (publisher: any) => {
  return `${publisher.name} ${publisher.lastName} ${publisher.firstName}`.trim();
};
