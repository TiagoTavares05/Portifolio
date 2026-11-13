import { Component } from "../Component.js";
import { PlaybackSimulator } from "../../bll/PlaybackSimulator.js";

/** UI — Player decorativo do card Spotify (play/pause + barra de progresso). */
export class SpotifyPlayer extends Component {
    #i18n;
    #playback;

    constructor(root, { i18n, playback = new PlaybackSimulator() }) {
        super(root);
        this.#i18n = i18n;
        this.#playback = playback;
    }

    mount() {
        const button = this.$(".spotify-floating-play");
        if (!button) return this;
        this.listen(button, "click", () => {
            this.#playback.toggle();
            this.render();
        });
        this.addCleanup(this.#i18n.onChange(() => this.render()));
        this.render();
        return this;
    }

    render() {
        const playing = this.#playback.isPlaying;
        const button = this.$(".spotify-floating-play");
        button.textContent = playing ? "❚❚" : "▶";
        button.setAttribute("aria-pressed", String(playing));
        if (this.#i18n.isReady) {
            button.setAttribute("aria-label", this.#i18n.t(playing ? "projects.spotify.pause" : "projects.spotify.play"));
        }
        this.$(".eq-bars")?.classList.toggle("paused", !playing);

        const fill = this.$(".sp-fill");
        const time = this.$(".sp-current-time");
        if (fill) fill.style.width = `${this.#playback.progress}%`;
        if (time) time.textContent = this.#playback.currentTime;
    }
}
