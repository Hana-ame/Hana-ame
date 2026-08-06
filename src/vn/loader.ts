/**
 * 资源加载器 — 按剧本声明的资源加载，纯 DOM（<img>）实现。
 *
 * 外链图无 CORS 也能显示（<img> 不需要 CORS），本地同源更稳。
 * 支持查询是否全部加载完成（用于 wait=true 时阻塞）。
 */

export interface LoadedAsset {
  key: string;
  url: string;
  loaded: boolean;
  img: HTMLImageElement | null;
  /** 媒体类型（audio/video）的预热元素；图片资源为 null。 */
  media: HTMLMediaElement | null;
  error: boolean;
}

/** 媒体文件扩展名（audio / video）。带 query/hash 也识别。 */
const MEDIA_RE = /\.(mp3|ogg|oga|wav|m4a|aac|flac|mp4|m4v|webm|ogv)(\?|#|$)/i;
const VIDEO_RE = /\.(mp4|m4v|webm|ogv)(\?|#|$)/i;

/** 预加载栏容器：媒体元素挂到它上面才会真正开始拉取（off-DOM 的 media 不保证加载）。 */
const WARM_HOST = (() => {
  const d = document.createElement('div');
  d.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;opacity:0;pointer-events:none;';
  document.body.appendChild(d);
  return d;
})();

export class VnAssetLoader {
  private _cache = new Map<string, LoadedAsset>();
  private _pending = new Map<string, Promise<LoadedAsset>>();
  private _listeners = new Set<() => void>();
  private _urlByKey = new Map<string, string>();

  /** 注册 key→url 映射（由剧本 preload 声明填充），并在用到时按需加载。 */
  register(asset: { key: string; url: string }): void {
    this._urlByKey.set(asset.key, asset.url);
    if (!this._cache.has(asset.key)) {
      this.load(asset.key);
    }
  }

  /** 声明资源并开始加载（不等待）。URL 从 key 解析或直接给 url。 */
  load(keyOrAsset: string | { key: string; url: string }): LoadedAsset {
    let key: string;
    let url: string;
    if (typeof keyOrAsset === 'string') {
      key = keyOrAsset;
      url = this._urlByKey.get(key) ?? '';
    } else {
      key = keyOrAsset.key;
      url = keyOrAsset.url;
      this._urlByKey.set(key, url);
    }

    const existing = this._cache.get(key);
    if (existing) return existing;

    const entry: LoadedAsset = { key, url, loaded: false, img: null, media: null, error: url === '' };
    this._cache.set(key, entry);
    if (url === '') {
      entry.loaded = true;
      return entry;
    }

    // 媒体资源（audio/video）：用 <audio>/<video preload=auto> 预热进媒体缓存，
    // 播放时同 URL 直接秒开。挂在 WARM_HOST 下确保真正拉取。
    if (MEDIA_RE.test(url)) {
      const el: HTMLMediaElement = VIDEO_RE.test(url)
        ? document.createElement('video')
        : document.createElement('audio');
      el.preload = 'auto';
      el.muted = false;
      el.setAttribute('playsinline', '');
      el.src = url;
      WARM_HOST.appendChild(el);
      const done = () => {
        entry.loaded = true;
        entry.media = el;
        this._emit();
      };
      el.onloadedmetadata = done;
      el.onerror = () => {
        entry.error = true;
        done();
      };
      el.load();
      entry.media = el;
      return entry;
    }

    const img = new Image();
    img.onload = () => {
      entry.loaded = true;
      entry.img = img;
      this._emit();
    };
    img.onerror = () => {
      entry.error = true;
      entry.loaded = true;
      this._emit();
    };
    img.src = url;
    entry.img = img;
    return entry;
  }

  /** 注册剧本中某个范围的 key→url（从 preload 行收集）。 */
  registerAssets(assets: Array<{ key: string; url: string }>): void {
    for (const a of assets) this.register(a);
  }

  /** 等某资源加载完成。 */
  waitFor(key: string): Promise<LoadedAsset> {
    const entry = this._cache.get(key);
    if (!entry) return Promise.resolve(this.load(key));
    if (entry.loaded) return Promise.resolve(entry);
    if (this._pending.has(key)) return this._pending.get(key)!;

    const p = new Promise<LoadedAsset>((resolve) => {
      const check = () => {
        const e = this._cache.get(key);
        if (e && e.loaded) {
          this._listeners.delete(check);
          resolve(e);
        }
      };
      this._listeners.add(check);
    });
    this._pending.set(key, p);
    return p;
  }

  /** 等待一组资源全部完成（wait=true 用）。 */
  waitAll(keys: string[]): Promise<void> {
    return Promise.all(keys.map((k) => this.waitFor(k))).then(() => undefined);
  }

  get(key: string): LoadedAsset | undefined {
    return this._cache.get(key);
  }

  /** 是否全部已加载完成。 */
  allLoaded(keys: string[]): boolean {
    return keys.every((k) => this._cache.get(k)?.loaded);
  }

  /** 已加载完成的资源数 / 总数（供 loading 进度显示）。 */
  progress(keys: string[]): { loaded: number; total: number } {
    const total = keys.length;
    const loaded = keys.filter((k) => this._cache.get(k)?.loaded).length;
    return { loaded, total };
  }

  /** 订阅加载状态变化。返回取消函数。 */
  subscribe(fn: () => void): () => void {
    this._listeners.add(fn);
    return () => this._listeners.delete(fn);
  }

  dispose(): void {
    for (const e of this._cache.values()) {
      if (e.media) e.media.remove();
    }
    this._cache.clear();
    this._pending.clear();
    this._listeners.clear();
  }

  private _emit(): void {
    for (const fn of [...this._listeners]) fn();
  }
}
