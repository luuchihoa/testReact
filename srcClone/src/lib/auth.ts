// utils/auth.ts
export const toFakeEmail = (username: string) =>
  `${username.toLowerCase()}@giaoly.local`;

export const fromFakeEmail = (email: string) =>
  email.replace(/@giaoly\.local$/, "");