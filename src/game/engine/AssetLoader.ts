export interface AssetManifest {
  images?: Record<string, string>;
  sounds?: Record<string, string>;
  fonts?: Record<string, string>;
}

interface LoadedAssets {
  images: Map<string, HTMLImageElement>;
  sounds: Map<string, HTMLAudioElement>;
  fonts: Set<string>;
}

/**
 * 资源预加载器
 * 支持图片、音效、字体预加载，带进度回调
 */
export class AssetLoader {
  private assets: LoadedAssets = {
    images: new Map(),
    sounds: new Map(),
    fonts: new Set(),
  };

  private loaded = 0;
  private total = 0;

  getProgress(): number {
    return this.total === 0 ? 1 : this.loaded / this.total;
  }

  /**
   * 加载所有资源
   */
  async loadAll(manifest: AssetManifest, onProgress?: (progress: number) => void): Promise<void> {
    this.loaded = 0;
    this.total = 0;

    const tasks: Promise<void>[] = [];

    if (manifest.images) {
      this.total += Object.keys(manifest.images).length;
      for (const [key, url] of Object.entries(manifest.images)) {
        tasks.push(this.loadImage(key, url, onProgress));
      }
    }

    if (manifest.sounds) {
      this.total += Object.keys(manifest.sounds).length;
      for (const [key, url] of Object.entries(manifest.sounds)) {
        tasks.push(this.loadSound(key, url, onProgress));
      }
    }

    if (manifest.fonts) {
      this.total += Object.keys(manifest.fonts).length;
      for (const [name, url] of Object.entries(manifest.fonts)) {
        tasks.push(this.loadFont(name, url, onProgress));
      }
    }

    await Promise.all(tasks);
  }

  private loadImage(key: string, url: string, onProgress?: (progress: number) => void): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.assets.images.set(key, img);
        this.loaded++;
        onProgress?.(this.getProgress());
        resolve();
      };
      img.onerror = () => {
        this.loaded++;
        onProgress?.(this.getProgress());
        console.warn(`Failed to load image: ${url}`);
        resolve(); // 继续加载其他资源
      };
      img.src = url;
    });
  }

  private loadSound(key: string, url: string, onProgress?: (progress: number) => void): Promise<void> {
    return new Promise((resolve) => {
      const audio = new Audio();
      audio.oncanplaythrough = () => {
        this.assets.sounds.set(key, audio);
        this.loaded++;
        onProgress?.(this.getProgress());
        resolve();
      };
      audio.onerror = () => {
        this.loaded++;
        onProgress?.(this.getProgress());
        console.warn(`Failed to load sound: ${url}`);
        resolve();
      };
      audio.src = url;
      audio.load();
    });
  }

  private async loadFont(name: string, url: string, onProgress?: (progress: number) => void): Promise<void> {
    try {
      const font = new FontFace(name, `url(${url})`);
      await font.load();
      document.fonts.add(font);
      this.assets.fonts.add(name);
    } catch (e) {
      console.warn(`Failed to load font: ${url}`, e);
    } finally {
      this.loaded++;
      onProgress?.(this.getProgress());
    }
  }

  getImage(key: string): HTMLImageElement | undefined {
    return this.assets.images.get(key);
  }

  getSound(key: string): HTMLAudioElement | undefined {
    return this.assets.sounds.get(key);
  }

  playSound(key: string): void {
    const sound = this.assets.sounds.get(key);
    if (sound) {
      const clone = sound.cloneNode() as HTMLAudioElement;
      clone.play().catch(() => {});
    }
  }

  hasFont(name: string): boolean {
    return this.assets.fonts.has(name);
  }

  clear(): void {
    this.assets.images.clear();
    this.assets.sounds.clear();
    this.assets.fonts.clear();
    this.loaded = 0;
    this.total = 0;
  }
}
