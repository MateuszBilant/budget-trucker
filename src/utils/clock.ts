export type Clock = (time?: string | Date) => Date;

export const clock = (time?: string | Date) => {
  return time ? new Date(time) : new Date();
};
