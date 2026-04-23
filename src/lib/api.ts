async function json<T>(r: Response): Promise<T> {
  if (!r.ok) {
    const t = await r.text();
    throw new Error(t || r.statusText);
  }
  return r.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) => fetch(path).then((r) => json<T>(r)),
  post: <T>(path: string, body?: unknown) =>
    fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    }).then((r) => json<T>(r)),
  patch: <T>(path: string, body?: unknown) =>
    fetch(path, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    }).then((r) => json<T>(r)),
  del: <T>(path: string) =>
    fetch(path, { method: 'DELETE' }).then((r) => json<T>(r)),
  upload: <T>(path: string, files: File[]) => {
    const fd = new FormData();
    for (const f of files) fd.append('files', f);
    return fetch(path, { method: 'POST', body: fd }).then((r) => json<T>(r));
  },
};
