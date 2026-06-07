export async function commitDigestToGitHub(
  date: string,
  content: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const token = (process.env.GITHUB_TOKEN ?? '').trim();
  const repo = (process.env.GITHUB_REPO ?? '').trim();
  const branch = (process.env.GITHUB_BRANCH ?? 'main').trim();

  if (!token) return { ok: false, error: 'GITHUB_TOKEN env var is required' };
  if (!repo) return { ok: false, error: 'GITHUB_REPO env var is required' };

  const path = `articles/digest-${date}.md`;
  const apiBase = `https://api.github.com/repos/${repo}/contents/${path}`;
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'Content-Type': 'application/json',
  };

  // GET to check if file exists and retrieve its SHA for update
  let existingSha: string | undefined;
  try {
    const getRes = await fetch(apiBase, { method: 'GET', headers });
    if (getRes.ok) {
      const data = await getRes.json() as { sha?: string };
      existingSha = data.sha;
    }
  } catch {
    // network error on GET — proceed without SHA; PUT will create the file
  }

  const body: Record<string, string> = {
    message: `chore: archive digest ${date}`,
    content: Buffer.from(content, 'utf8').toString('base64'),
    branch,
  };
  if (existingSha) body.sha = existingSha;

  let putRes: Response;
  try {
    putRes = await fetch(apiBase, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: `github fetch error: ${msg}` };
  }

  if (putRes.status === 200 || putRes.status === 201) return { ok: true };

  const errText = await putRes.text().catch(() => '');
  return { ok: false, error: `github: ${putRes.status} ${errText}` };
}
