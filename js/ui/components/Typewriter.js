import { Component } from "../Component.js";
import { CyclicSequence } from "../../bll/CyclicSequence.js";

/** UI — Alterna as frases do subtítulo do hero com efeito de fade. */
export class Typewriter extends Component {
    #i18n;
    #intervalMs;
    #fadeMs;
    #phrases = new CyclicSequence();

    constructor(root, { i18n, intervalMs = 3800, fadeMs = 250 }) {
        super(root);
        this.#i18n = i18n;
        this.#intervalMs = intervalMs;
        this.#fadeMs = Component.prefersReducedMotion() ? 0 : fadeMs;
    }

    mount() {
        this.root.style.transition = `opacity ${this.#fadeMs}ms ease`;
        this.#loadPhrases();
        // A primeira frase já está no HTML: pula para a próxima no primeiro ciclo.
        this.#phrases.next();

        const timer = setInterval(() => this.#tick(), this.#intervalMs);
        this.addCleanup(() => clearInterval(timer));
        this.addCleanup(
            this.#i18n.onChange(() => {
                this.#loadPhrases();
                this.root.textContent = this.#phrases.next() ?? this.root.textContent;
            })
        );
        return this;
    }

    #loadPhrases() {
        this.#phrases.reset(this.#i18n.list("hero.phrases"));
    }

    #tick() {
        if (document.hidden || this.#phrases.isEmpty) return;
        const phrase = this.#phrases.next();
        this.root.style.opacity = "0";
        setTimeout(() => {
            this.root.textContent = phrase;
            this.root.style.opacity = "1";
        }, this.#fadeMs);
    }
}
