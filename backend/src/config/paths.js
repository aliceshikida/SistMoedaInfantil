import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/** Raiz do pacote backend (pasta que contém `src/` e `uploads/`). */
const __configDir = path.dirname(fileURLToPath(import.meta.url));
export const BACKEND_DIR = path.resolve(__configDir, "..", "..");
export const UPLOADS_DIR = path.join(BACKEND_DIR, "uploads");

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
