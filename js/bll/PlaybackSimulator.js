/** BLL — Simulação do player do card Spotify (estado de play/pause e progresso). */
export class PlaybackSimulator {
    #isPlaying;
    #progress;
    #durationSeconds;

    constructor({ durationSeconds = 225, initialProgress = 45, isPlaying = true } = {}) {
        this.#durationSeconds = durationSeconds;
        this.#progress = initialProgress;
        this.#isPlaying = isPlaying;
    }

    get isPlaying() {
        return this.#isPlaying;
    }

    /** Progresso em % (10–94). */
    get progress() {
        return this.#progress;
    }

    get currentTime() {
        return PlaybackSimulator.formatTime((this.#progress / 100) * this.#durationSeconds);
    }

    get duration() {
        return PlaybackSimulator.formatTime(this.#durationSeconds);
    }

    /** Alterna play/pause; ao voltar a tocar, avança a faixa. */
    toggle() {
        this.#isPlaying = !this.#isPlaying;
        if (this.#isPlaying) {
            this.#progress = ((this.#progress + 15) % 85) + 10;
        }
        return this.#isPlaying;
    }

    static formatTime(totalSeconds) {
        const secs = Math.max(0, Math.floor(totalSeconds));
        const m = String(Math.floor(secs / 60)).padStart(2, "0");
        const s = String(secs % 60).padStart(2, "0");
        return `${m}:${s}`;
    }
}
