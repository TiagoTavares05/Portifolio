import { Component } from "../Component.js";

/** UI — Destaca no menu o link da seção que está visível. */
export class ScrollSpy extends Component {
    #links = new Map();

    mount() {
        if (!("IntersectionObserver" in globalThis)) return this;

        for (const link of this.$$('a.menu-link[href^="#"]')) {
            const section = document.getElementById(link.hash.slice(1));
            if (section) this.#links.set(section, link);
        }

        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) this.#activate(entry.target);
                }
            },
            // "Faixa" no meio da tela: a seção que cruzar essa linha fica ativa.
            { rootMargin: "-45% 0px -50% 0px" }
        );
        this.#links.forEach((_, section) => observer.observe(section));
        this.addCleanup(() => observer.disconnect());
        return this;
    }

    #activate(section) {
        this.#links.forEach((link, target) => {
            const active = target === section;
            link.classList.toggle("is-active", active);
            if (active) link.setAttribute("aria-current", "true");
            else link.removeAttribute("aria-current");
        });
    }
}
