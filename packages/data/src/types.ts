import { VocabWord } from "@alwa/core";

export type RawWord = Omit<VocabWord, "language" | "createdAt">;
