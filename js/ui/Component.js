/**
 * UI — Classe base dos componentes.
 * Centraliza o registro de eventos/observers e a limpeza em destroy().
 */
export class Component {
    #cleanups = [];

    /** @param {Element} root */
    constructor(root) {
        if (!(root instanceof Element)) {
            throw new TypeError(`${new.target.name}: elemento raiz não encontrado.`);
        }
        this.root = root;
    }

    /** Subclasses sobrescrevem e retornam `this`. */
    mount() {
        return this;
    }

    destroy() {
        this.#cleanups.splice(0).reverse().forEach((cleanup) => cleanup());
    }

    /** Atalho para querySelector dentro do componente. */
    $(selector) {
        return this.root.querySelector(selector);
    }

    $$(selector) {
        return [...this.root.querySelectorAll(selector)];
    }

    /** addEventListener com remoção automática no destroy(). */
    listen(target, type, handler, options) {
        if (!target) return;
        target.addEventListener(type, handler, options);
        this.addCleanup(() => target.removeEventListener(type, handler, options));
    }

    addCleanup(cleanup) {
        this.#cleanups.push(cleanup);
    }

    static prefersReducedMotion() {
        return globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    }
}
