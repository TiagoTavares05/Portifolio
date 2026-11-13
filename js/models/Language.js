/** Model — Idioma suportado pelo site (objeto de valor imutável). */
export class Language {
    static #registry = new Map();

    /**
     * @param {string} code Código curto usado nos arquivos (pt, en)
     * @param {string} locale Valor para <html lang>
     * @param {string} label Rótulo curto exibido no botão
     */
    constructor(code, locale, label) {
        this.code = code;
        this.locale = locale;
        this.label = label;
        Object.freeze(this);
    }

    static PT = Language.#register(new Language("pt", "pt-BR", "PT"));
    static EN = Language.#register(new Language("en", "en", "EN"));
    static DEFAULT = Language.PT;

    static #register(language) {
        Language.#registry.set(language.code, language);
        return language;
    }

    static get supported() {
        return [...Language.#registry.values()];
    }

    /**
     * Converte "en-US", "PT_br", Language etc. no idioma suportado, ou null.
     * @param {string | Language | null | undefined} value
     */
    static from(value) {
        if (value instanceof Language) return value;
        if (typeof value !== "string" || value.trim() === "") return null;
        const code = value.trim().toLowerCase().split(/[-_]/)[0];
        return Language.#registry.get(code) ?? null;
    }

    /** Próximo idioma da lista (usado pelo botão de alternância). */
    next() {
        const all = Language.supported;
        return all[(all.indexOf(this) + 1) % all.length];
    }

    equals(other) {
        return other instanceof Language && other.code === this.code;
    }
}
