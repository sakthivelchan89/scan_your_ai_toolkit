export interface PostFlags {
  postTo?: string;
  key?: string;
}

export interface PostConfig {
  gateway: string | undefined;
  apiKey: string | undefined;
}

export function resolvePostConfig(input: { flags: PostFlags; env: Record<string, string | undefined> }): PostConfig {
  const { flags, env } = input;
  return {
    gateway: flags.postTo ?? env.MAIIFE_GATEWAY,
    apiKey: flags.key ?? env.MAIIFE_API_KEY,
  };
}
