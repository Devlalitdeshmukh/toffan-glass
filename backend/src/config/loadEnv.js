const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

const backendRoot = path.resolve(__dirname, "..", "..");

const resolveCandidatePath = (fileName) => path.resolve(backendRoot, fileName);

const loadEnv = () => {
  const mode = process.env.NODE_ENV || "development";
  const candidates = [];

  if (process.env.DOTENV_PATH) {
    candidates.push(process.env.DOTENV_PATH);
  }

  candidates.push(`.env.${mode}.local`);
  candidates.push(`.env.${mode}`);
  candidates.push(".env.local");
  candidates.push(".env");

  for (const candidate of candidates) {
    const fullPath = path.isAbsolute(candidate)
      ? candidate
      : resolveCandidatePath(candidate);

    if (fs.existsSync(fullPath)) {
      dotenv.config({ path: fullPath });
      return fullPath;
    }
  }

  dotenv.config();
  return null;
};

module.exports = { loadEnv };
