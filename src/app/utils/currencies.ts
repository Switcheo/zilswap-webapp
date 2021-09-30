import { TokenInfo } from "app/store/types";
import { TOKEN_SYMBOLS } from "./constants";

export const formatSymbol = (token?: TokenInfo | null) => TOKEN_SYMBOLS[token?.symbol ?? ""] ?? token?.symbol;
