import { spawn } from "child_process";

const parseArgs = (args: string[]) => {
  const result: Record<string, string> = {};

  for (const arg of args) {
    if (arg.startsWith("--")) {
      const [key, value] = arg.slice(2).split("=");
      result[key] = value;
    }
  }

  return result;
};

const startApp = () => {
  const args = parseArgs(process.argv.slice(2));
  if (!args.path) {
    // eslint-disable-next-line no-console
    return console.error("Argument --path=PATH_TO_SCHEMA is required");
  }

  process.env.VISUALIZER_PATH_TO_PRISMA_SCHEMA = args.path;

  // eslint-disable-next-line no-console
  console.log(process.env.VISUALIZER_PATH_TO_PRISMA_SCHEMA);

  const child = spawn("npx", ["next", "start"], {
    shell: process.platform === "win32",
    stdio: "inherit"
  });

  child.on("close", (code) => {
    // eslint-disable-next-line no-console
    console.log(`Next.js stopped with code ${code}`);
  });
  // eslint-disable-next-line no-console
  child.on("error", console.error);
};

startApp();
