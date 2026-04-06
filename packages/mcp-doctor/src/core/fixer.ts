import type { ServerHealth, FixAction } from "./types.js";

export function suggestFixes(report: ServerHealth[]): FixAction[] {
  const actions: FixAction[] = [];
  for (const server of report) {
    if (server.status === "healthy") continue;
    for (const check of server.checks) {
      if (check.passed) continue;
      if (check.name === "command_exists") {
        actions.push({ serverName: server.name, description: `Install missing command for ${server.name}`, autoFixable: false });
      }
      if (check.name === "npx_package") {
        actions.push({ serverName: server.name, description: `Update or reinstall npx package for ${server.name}`, command: `npm cache clean --force`, autoFixable: true });
      }
      if (check.name === "env_vars") {
        actions.push({ serverName: server.name, description: check.details, autoFixable: false });
      }
    }
  }
  return actions;
}
