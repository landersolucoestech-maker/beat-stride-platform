import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

import { Injectable } from "@nestjs/common";

function deriveKey(password: string, salt: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, 64, { N: 16_384, r: 8, p: 1 }, (error, derivedKey) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(derivedKey);
    });
  });
}

@Injectable()
export class PasswordHasher {
  async hash(password: string): Promise<{ passwordHash: string; passwordSalt: string }> {
    const passwordSalt = randomBytes(16).toString("base64");
    const derivedKey = await deriveKey(password, passwordSalt);
    return {
      passwordHash: derivedKey.toString("base64"),
      passwordSalt,
    };
  }

  async verify(password: string, expectedHash: string, passwordSalt: string): Promise<boolean> {
    const actual = await deriveKey(password, passwordSalt);
    const expected = Buffer.from(expectedHash, "base64");
    if (actual.length !== expected.length) return false;
    return timingSafeEqual(actual, expected);
  }
}
