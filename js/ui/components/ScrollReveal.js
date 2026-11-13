import { Component } from "../Component.js";

/**
 * UI — Animações de entrada ao rolar a página.
 * A classe .reveal só é aplicada via JS: sem JS (ou com "reduzir movimento"), tudo aparece normalmente.
 */
export class ScrollReveal extends Component {
    #selector;
    #staggerMs;

    constructor(root, { selector, staggerMs = 90 } = {}) {
        super(root);
        this.#selector = selector;
        this.#staggerMs = staggerMs;
    }

    mount() {
        if (Component.prefersReducedMotion() || !("IntersectionObserver" in globalThis)) return this;

        const targets = this.$$(this.#selector);
        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (!entry.isIntersecting) continue;
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                }
            },
            { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
        );

        for (const el of targets) {
            // Atraso escalonado entre irmãos do mesmo grid (máx. 4 passos).
            const siblings = [...el.parentElement.children].filter((child) => targets.includes(child));
            const step = Math.min(siblings.indexOf(el), 4);
            el.style.setProperty("--reveal-delay", `${step * this.#staggerMs}ms`);
            el.classList.add("reveal");
            observer.observe(el);
        }

        this.addCleanup(() => observer.disconnect());
        return this;
    }
}
