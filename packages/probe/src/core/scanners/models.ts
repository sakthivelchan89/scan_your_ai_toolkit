import * as net from "node:net";
import type { LocalModelFinding, Scanner, ScanConfig } from "../types.js";

const RUNTIMES: Array<{ name: string; port: number }> = [
  { name: "ollama", port: 11434 },
  { name: "vllm", port: 8000 },
  { name: "lmstudio", port: 1234 },
  { name: "localai", port: 8080 },
];

function checkPort(port: number, timeout = 500): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let resolved = false;

    const done = (result: boolean) => {
      if (!resolved) {
        resolved = true;
        socket.destroy();
        resolve(result);
      }
    };

    socket.setTimeout(timeout);
    socket.once("connect", () => done(true));
    socket.once("error", () => done(false));
    socket.once("timeout", () => done(false));
    socket.connect(port, "127.0.0.1");
  });
}

export function createModelsScanner(): Scanner<LocalModelFinding> {
  return {
    name: "models",
    async scan(_config: ScanConfig): Promise<LocalModelFinding[]> {
      const findings: LocalModelFinding[] = [];

      await Promise.all(
        RUNTIMES.map(async ({ name, port }) => {
          const open = await checkPort(port);
          if (open) {
            findings.push({
              runtime: name,
              port,
              models: [],
              status: "running",
            });
          }
        })
      );

      return findings;
    },
  };
}
