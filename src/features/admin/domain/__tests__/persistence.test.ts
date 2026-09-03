import { afterEach, describe, expect, it, vi } from 'vitest';
import { KEY, load, save } from '../persistence';
import { seed } from '../seed';

function stubStorage({ throwOnSet = false } = {}) {
  const getItem = vi.fn(() => null);
  const setItem = throwOnSet
    ? vi.fn(() => {
        throw new Error('QuotaExceededError');
      })
    : vi.fn();
  const removeItem = vi.fn();
  const clear = vi.fn();
  const key = vi.fn();
  vi.stubGlobal('localStorage', { getItem, setItem, removeItem, clear, key, length: 0 });
  return { getItem, setItem };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('persistence', () => {
  it('save persiste el store en localStorage', () => {
    const { setItem } = stubStorage();
    const s = seed();
    const ok = save(s);
    expect(ok).toBe(true);
    expect(setItem).toHaveBeenCalledWith(KEY, JSON.stringify(s));
  });

  it('save devuelve false y no lanza cuando localStorage falla', () => {
    stubStorage({ throwOnSet: true });
    expect(() => save(seed())).not.toThrow();
    expect(save(seed())).toBe(false);
  });

  it('load devuelve seed cuando no hay datos guardados', () => {
    stubStorage();
    expect(load()).toEqual(seed());
  });

  it('load no rompe si localStorage.getItem falla y devuelve seed', () => {
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(() => {
        throw new Error('denied');
      }),
      setItem: vi.fn(),
    });
    expect(load()).toEqual(seed());
  });

  it('load normaliza datos válidos guardados', () => {
    const s = seed();
    stubStorage();
    localStorage.getItem = vi.fn(() => JSON.stringify(s));
    const loaded = load();
    expect(loaded.students).toHaveLength(s.students.length);
    expect(loaded.meta.customized).toBe(false);
  });
});
