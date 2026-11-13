import { Component } from "../Component.js";
import { CyclicSequence } from "../../bll/CyclicSequence.js";

/** UI — Botões A/B do card Gameboy Agent exibindo falas na tela LCD. */
export class GameboyConsole extends Component {
    #i18n;
    #dialogue;
    #linesA = new CyclicSequence();
    #linesB = new CyclicSequence();

    constructor(root, { i18n }) {
        super(root);
        this.#i18n = i18n;
        this.#dialogue = this.$(".gb-dialogue-box");
    }

    mount() {
        if (!this.#dialogue) return this;
        this.#loadLines();
        this.listen(this.$("[data-gb-button='A']"), "click", () => this.#show(this.#linesA));
        this.listen(this.$("[data-gb-button='B']"), "click", () => this.#show(this.#linesB));
        this.addCleanup(this.#i18n.onChange(() => this.#loadLines()));
        return this;
    }

    #loadLines() {
        this.#linesA.reset(this.#i18n.list("projects.gameboy.linesA"));
        this.#linesB.reset(this.#i18n.list("projects.gameboy.linesB"));
    }

    #show(sequence) {
        const line = sequence.next();
        if (line) this.#dialogue.textContent = line;
    }
}
