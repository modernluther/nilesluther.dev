// A resume tag is a short lowercase slug naming the resume cut that linked here.
const TAG = /^[a-z0-9-]{1,64}$/;
const KEY = 'resume_tag';
const TTL = 30 * 60e3;

type Store = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export function readTag(url: URL): string | null {
  const r = url.searchParams.get('r');
  return r !== null && TAG.test(r) ? r : null;
}

export function stripTag(url: URL): string {
  const u = new URL(url.href);
  u.searchParams.delete('r');
  return u.pathname + u.search + u.hash;
}

// The tag outlives the tab (a project opened in a new tab starts empty sessionStorage) for 30 minutes
// after its last use. Storage that throws (blocked, private mode) simply drops the tag.
export function stashTag(store: Store, tag: string, now = Date.now()): void {
  try { store.setItem(KEY, JSON.stringify({ tag, exp: now + TTL })); } catch {}
}

export function stashedTag(store: Store, now = Date.now()): string | null {
  try {
    const raw = store.getItem(KEY);
    if (raw === null) return null;
    const v = JSON.parse(raw);
    if (typeof v?.tag === 'string' && TAG.test(v.tag) && typeof v.exp === 'number' && v.exp > now) return v.tag;
    store.removeItem(KEY);
  } catch {
    try { store.removeItem(KEY); } catch {}
  }
  return null;
}
