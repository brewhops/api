import { createDecipheriv } from "crypto";

export const decrypt = (encrypted: string): string => {
  try {
    const { ALGORITHM, KEY, IV } = process.env;
    const decipher = createDecipheriv(ALGORITHM as string, KEY as string, IV as string);
    decipher.setAutoPadding(false);

    return decipher.update(encrypted, "base64", "utf8") + decipher.final("utf8");
  } catch (error) {
    // tslint:disable-next-line: no-unsafe-any
    throw new Error(error.message);
  }
};
