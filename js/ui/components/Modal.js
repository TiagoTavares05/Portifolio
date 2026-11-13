import { Component } from "../Component.js";

/** UI — Modal acessível: abre por gatilhos, fecha por botão, Esc ou clique fora, e devolve o foco. */
export class Modal extends Component {
    #triggers;
    #closeButton;
    #lastFocused = null;

    constructor(root, { triggers = [] } = {}) {
        super(root);
        this.#triggers = triggers.filter(Boolean);
        this.#closeButton = this.$("[data-modal-close]");
    }

    get isOpen() {
        return this.root.classList.contains("active");
    }

    mount() {
        this.#triggers.forEach((trigger) => this.listen(trigger, "click", () => this.open(trigger)));
        this.listen(this.#closeButton, "click", () => this.close());
        this.listen(this.root, "click", (event) => {
            if (event.target === this.root) this.close();
        });
        this.listen(document, "keydown", (event) => {
            if (event.key === "Escape" && this.isOpen) this.close();
        });
        return this;
    }

    /** @param {Element} [trigger] Botão que abriu o modal (subclasses usam para preencher o conteúdo). */
    open(trigger) {
        this.#lastFocused = document.activeElement;
        this.root.classList.add("active");
        this.root.setAttribute("aria-hidden", "false");
        document.body.classList.add("modal-open");
        this.#closeButton?.focus();
    }

    close() {
        if (!this.isOpen) return;
        this.root.classList.remove("active");
        this.root.setAttribute("aria-hidden", "true");
        document.body.classList.remove("modal-open");
        this.#lastFocused?.focus?.();
    }
}
