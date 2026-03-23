export class SoundManager {
  private static sounds: { [key: string]: HTMLAudioElement } = {};
  private static enabled: boolean = true;
  private static bgm: HTMLAudioElement | null = null;

  static init() {
    if (typeof window === 'undefined') return;
    
    // SFX
    this.sounds.correct = new Audio('/sounds/correct.mp3');
    this.sounds.wrong = new Audio('/sounds/wrong.mp3');
    this.sounds.win = new Audio('/sounds/win.mp3');
    this.sounds.lose = new Audio('/sounds/lose.mp3');
    this.sounds.click = new Audio('/sounds/click.mp3');
    
    // BGM
    this.bgm = new Audio('/sounds/bgm.mp3');
    this.bgm.loop = true;
    this.bgm.volume = 0.3;
  }

  static play(sound: string) {
    if (!this.enabled || !this.sounds[sound]) return;
    this.sounds[sound].currentTime = 0;
    this.sounds[sound].play().catch(() => {});
  }

  static startBGM() {
    if (!this.enabled || !this.bgm) return;
    this.bgm.play().catch(() => {});
  }

  static stopBGM() {
    if (this.bgm) {
      this.bgm.pause();
      this.bgm.currentTime = 0;
    }
  }

  static toggle(enabled: boolean) {
    this.enabled = enabled;
    if (!enabled) this.stopBGM();
    else this.startBGM();
  }
}
