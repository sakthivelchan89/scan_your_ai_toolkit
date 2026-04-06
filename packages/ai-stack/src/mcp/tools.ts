import { buildProfile } from "../core/profiler.js";
import { renderSVG } from "../renderers/svg.js";
import { renderMarkdown } from "../renderers/markdown.js";
import { renderJSON } from "../renderers/json.js";
import { probeScan } from "@maiife-ai-pub/probe";

export async function aiStackGenerate(params: {
  path?: string;
  format?: string;
}) {
  const scanResult = await probeScan({ path: params.path });
  const profile = buildProfile(scanResult.findings);

  const format = params.format ?? "json";
  let rendered: string;
  if (format === "svg") rendered = renderSVG(profile);
  else if (format === "markdown") rendered = renderMarkdown(profile);
  else rendered = renderJSON(profile);

  return { profile, rendered };
}
