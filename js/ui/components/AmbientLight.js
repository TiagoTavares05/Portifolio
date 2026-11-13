import { Component } from "../Component.js";

/**
 * UI — Luz ambiente do fundo muda conforme o card em foco.
 * Mouse/teclado: hover e foco. Celular (sem hover): o card mais visível na tela.
 */
export class AmbientLight extends Component {
    #defaultTheme;
    #cards;

    constructor(root, { cardSelector = "[data-theme-hover]", defaultTheme = "red" } = {}) {
        super(root);
        this.#defaultTheme = defaultTheme;
        this.#cards = [...document.querySelectorAll(cardSelector)];
    }

    mount() {
        const canHover = globalThis.matchMedia?.("(hover: hover)").matches ?? true;
        if (canHover) this.#bindPointer();
        else this.#bindViewport();
        return this;
    }

    setTheme(theme) {
        this.root.dataset.ambient = theme || this.#defaultTheme;
    }

    reset() {
        this.setTheme(this.#defaultTheme);
    }

    #bindPointer() {
        for (const card of this.#cards) {
            const activate = () => this.setTheme(card.dataset.themeHover);
            this.listen(card, "mouseenter", activate);
            this.listen(card, "focusin", activate);
            this.listen(card, "mouseleave", () => this.reset());
            this.listen(card, "focusout", (event) => {
                if (!card.contains(event.relatedTarget)) this.reset();
            });
        }
    }

    #bindViewport() {
        if (!("IntersectionObserver" in globalThis)) return;
        const visible = new Set();
        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) visible.add(entry.target);
                    else visible.delete(entry.target);
                }
                const [current] = [...visible].slice(-1);
                if (current) this.setTheme(current.dataset.themeHover);
                else this.reset();
            },
            { threshold: 0.6 }
        );
        this.#cards.forEach((card) => observer.observe(card));
        this.addCleanup(() => observer.disconnect());
    }
}
