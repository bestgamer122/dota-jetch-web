/* Глобальные сущности DOTA JETCH.

   Важно: функции, объявленные в самих .js файлах (qs, el, switchPage, Store,
   THEMES и т.п.), tsc уже видит — их здесь дублировать нельзя, иначе конфликт
   объявлений. Здесь описано только то, чего в файлах нет: интерфейсы данных
   и хелперы, которые fallback.js вешает на window. */

interface DotaStore {
  get<T = unknown>(key: string, fallback?: T): T;
  set(key: string, value: unknown): void;
  remove(key: string): void;
  clear(): void;
}

interface SyncStatus {
  status: "saved" | "syncing" | "pending" | "error" | "offline";
  detail: string;
  pending: number;
  error: unknown;
  lastSavedAt: number;
  uid: string | null;
}

interface CloudSyncApi {
  uid: string | null;
  active: boolean;
  activate(uid: string): Promise<void>;
  deactivate(): Promise<void>;
  stop(): void;
  get<T = unknown>(key: string, fallback?: T): T;
  set(key: string, value: unknown): void;
  remove(key: string): void;
  clear(): void;
  flush(): Promise<unknown>;
  getStatus(): SyncStatus;
  replaceFromRemote(data: Record<string, unknown>, source?: string): void;
}

interface Hero {
  id: number;
  name: string;
  slug?: string;
}

interface HeroWithSlug extends Hero {
  slug: string;
}

interface ItemInfo {
  id: number;
  name: string;
  slug: string;
  short?: string;
}

interface MatchEntry {
  matchId: number | string;
  heroId: number;
  heroName: string;
  heroSlug?: string;
  kills: number;
  deaths: number;
  assists: number;
  won: boolean;
  durMin: number;
  ts: number;
}

interface DiaryNote {
  id: string;
  title: string;
  text: string;
  tags: string[];
  ts: number;
}

/* ─── Firebase (минимум, который нужен проекту) ────────────── */
interface FirebaseUserLike {
  uid: string;
  email?: string | null;
  emailVerified?: boolean;
  reload?: () => Promise<void>;
}

interface FirebaseAuthLike {
  currentUser: FirebaseUserLike | null;
  app: unknown;
}

interface FirebaseSnapshotLike {
  val(): unknown;
  exists(): boolean;
}

interface FirebaseDbLike {
  db: unknown;
  ref(db: unknown, path: string): unknown;
  get(ref: unknown): Promise<FirebaseSnapshotLike>;
  update(ref: unknown, values: object): Promise<void>;
  remove(ref: unknown): Promise<void>;
  set(ref: unknown, value: unknown): Promise<void>;
  onValue(ref: unknown, callback: (snapshot: FirebaseSnapshotLike) => void): (() => void) | void;
  runTransaction(
    ref: unknown,
    updater: (current: unknown) => unknown
  ): Promise<{ committed: boolean; snapshot: FirebaseSnapshotLike }>;
}

/* ─── Хелперы, которые fallback.js вешает на window ────────── */
declare function getHeroes(): Promise<HeroWithSlug[]>;
declare function findHeroId(query: string): Promise<HeroWithSlug | null>;
declare function getItemCatalog(): Promise<Record<number, ItemInfo>>;
declare function heroImgEl(hero: Hero | null, size?: number, extra?: string): HTMLElement;
declare function heroTileEl(hero: Hero | null, opts?: Record<string, unknown>): HTMLElement;
declare function itemImgEl(item: ItemInfo | null): HTMLElement;
declare function heroShort(name: string): string;
declare function heroGradient(name: string): string;
declare function percentileOf(
  bench: Record<string, Array<{ percentile: number; value: number }>> | null,
  key: string,
  value: number
): number | null;
declare function pctGrade(percentile: number | null): string;
declare function pctColor(percentile: number | null): string;
declare function buildMedalSVG(rankIdx: number, size?: number, animate?: boolean): SVGElement;
declare function getMedalForMMR(mmr: number): {
  medal: { rankIdx: number; ru: string; a: string; stars: number[] };
  stars: number;
  mmr: number;
};

interface Window {
  FIREBASE_CONFIG: Record<string, string>;
  webkitAudioContext?: typeof AudioContext;
  CloudSync: CloudSyncApi;
  CloudSyncTest?: { getQueryUid(): string; safeParse(raw: string, fallback: unknown): unknown };
  __fbAuth: FirebaseAuthLike;
  __fbDB: FirebaseDbLike;
  __fbSignOut?: () => Promise<void>;
  __cloud?: Record<string, unknown>;
  chatMatchContext?: unknown;
  __chatPending?: unknown;
  openProfileModal?: () => void;
  closeProfileModal?: () => void;
  refreshUserUI?: () => void;
  renderLeaderboard?: (game?: string) => Promise<HTMLElement> | HTMLElement;
  renderRatingWidget?: () => HTMLElement;
  renderDailyWidget?: () => HTMLElement;
  submitGameScore?: (game: string, score: number, won?: boolean) => { gained: number; newMMR: number };
  getRatingData?: () => Record<string, unknown>;
  syncPublicProfile?: () => Promise<void>;
  syncPublicProfileMMR?: (mmr: number) => void;
  processNode?: (node: Node) => void;
  changeNickname?: (nick: string) => Promise<{ ok: boolean; msg: string }>;
  changeAvatar?: (dataUrl: string) => { ok: boolean; msg: string };
  nicknameCooldownDaysLeft?: () => number;
  checkMaintenance?: () => Promise<boolean>;
  renderLeaderboardPage?: () => void;
  submitToLeaderboard?: (game: string, score: number, mmr: number) => Promise<void>;
  fetchLeaderboard?: (game: string, limit?: number) => Promise<Array<Record<string, unknown>>>;
  fetchTopByMMR?: (limit?: number) => Promise<Array<Record<string, unknown>>>;
  showAllRanksDialog?: () => void;
}
