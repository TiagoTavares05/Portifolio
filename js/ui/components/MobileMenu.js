import { Component } from "../Component.js";

/** UI — Menu hambúrguer: abre/fecha o painel de links no celular. */
export class MobileMenu extends Component {
    #toggle;
    #panel;
    #i18n;
    #desktopQuery;

    constructor(root, { i18n, breakpoint = 960 } = {}) {
        super(root);
        this.#toggle = this.$(".nav-toggle");
        this.#panel = this.$(".menu");
        this.#i18n = i18n;
        this.#desktopQuery = globalThis.matchMedia(`(min-width: ${breakpoint + 1}px)`);
    }

    get isOpen() {
        return this.root.classList.contains("is-open");
    }

    mount() {
        if (!this.#toggle || !this.#panel) return this;

        // Aprimoramento progressivo: só vira hambúrguer quando o JS está ativo.
        this.root.classList.add("has-menu");
        this.#toggle.hidden = false;

        this.listen(this.#toggle, "click", () => this.setOpen(!this.isOpen));
        this.listen(this.#panel, "click", (event) => {
            if (event.target.closest("a")) this.setOpen(false);
        });
        this.listen(document, "keydown", (event) => {
            if (event.key === "Escape" && this.isOpen) {
                this.setOpen(false);
                this.#toggle.focus();
            }
        });
        this.listen(document, "click", (event) => {
            if (this.isOpen && !this.root.contains(event.target)) this.setOpen(false);
        });
        this.listen(this.#desktopQuery, "change", (event) => {
            if (event.matches) this.setOpen(false);
        });
        if (this.#i18n) this.addCleanup(this.#i18n.onChange(() => this.#updateLabel()));

        this.#updateLabel();
        return this;
    }

    setOpen(open) {
        this.root.classList.toggle("is-open", open);
        document.body.classList.toggle("menu-open", open);
        this.#toggle.setAttribute("aria-expanded", String(open));
        this.#updateLabel();
    }

    #updateLabel() {
        if (!this.#i18n?.isReady) return;
        this.#toggle.setAttribute("aria-label", this.#i18n.t(this.isOpen ? "nav.closeMenu" : "nav.openMenu"));
    }

    destroy() {
        if (this.isOpen) this.setOpen(false);
        this.root.classList.remove("has-menu");
        if (this.#toggle) this.#toggle.hidden = true;
        super.destroy();
    }
}
