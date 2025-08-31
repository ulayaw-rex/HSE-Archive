import { type CategoryItem } from "../components/features/CategorySection";

export type NewsItem = CategoryItem & {
  content?: string;
};

const STORAGE_KEY = "hse_news_items";

function readStorage(): NewsItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as NewsItem[];
  } catch {
    return [];
  }
}

function writeStorage(items: NewsItem[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function getNewsItems(): NewsItem[] {
  return readStorage();
}

export function seedNewsIfEmpty(seed: NewsItem[]): void {
  const current = readStorage();
  if (current.length === 0 && seed.length > 0) {
    writeStorage(seed);
  }
}

export function createNewsItem(item: Omit<NewsItem, "id">): NewsItem {
  const items = readStorage();
  const newId = items.length > 0 ? Math.max(...items.map((i) => Number(i.id))) + 1 : 1;
  const newItem: NewsItem = { ...item, id: newId } as NewsItem;
  items.unshift(newItem);
  writeStorage(items);
  return newItem;
}

export function updateNewsItem(id: number, updates: Partial<NewsItem>): NewsItem | null {
  const items = readStorage();
  const idx = items.findIndex((i) => Number(i.id) === Number(id));
  if (idx === -1) return null;
  const updated: NewsItem = { ...items[idx], ...updates, id: items[idx].id };
  items[idx] = updated;
  writeStorage(items);
  return updated;
}

export function deleteNewsItem(id: number): boolean {
  const items = readStorage();
  const next = items.filter((i) => Number(i.id) !== Number(id));
  if (next.length === items.length) return false;
  writeStorage(next);
  return true;
}


