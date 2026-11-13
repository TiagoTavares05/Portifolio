import { Language } from "../models/Language.js";
import { interpolate } from "./template.js";

/**
 * BLL — Internacionalização.
 * Decide o idioma (preferência salva → idioma do navegador → padrão),
 * carrega dicionários via repositório, resolve chaves com fallback e notifica mudanças.
 */
export class I18nService {
    #repository;
    #preferences;
    #navigatorLanguages;
    #language = null;
    #dictionary = {};
    #fallback = {};
    #listeners = new Set();

    /**
     * @param {{
     *   repository: { getDictionary(code: string): Promise<object> },
     *   preferences: { getLanguage(): string | null, saveLanguage(code: string): boolean },
     *   navigatorLanguages?: readonly string[],
     * }} deps
     */
    constructor({ repository, preferences, navigatorLanguages = [] }) {
        this.#repository = repository;
        this.#preferences = preferences;
        this.#navigatorLanguages = navigatorLanguages;
    }

    /** @returns {Language | null} */
    get language() {
        return this.#language;
    }

    get isReady() {
        return this.#language !== null;
    }

    /** Idioma inicial: escolha salva > navegador > padrão. */
    resolveInitialLanguage() {
        const saved = Language.from(this.#preferences.getLanguage());
        if (saved) return saved;
        for (const candidate of this.#navigatorLanguages) {
            const language = Language.from(candidate);
            if (language) return language;
        }
        return Language.DEFAULT;
    }

    async init() {
        await this.setLanguage(this.resolveInitialLanguage(), { persist: false });
    }

    /** @param {string | Language} value */
    async setLanguage(value, { persist = true } = {}) {
        const language = Language.from(value) ?? Language.DEFAULT;
        const [dictionary, fallback] = await Promise.all([
            this.#repository.getDictionary(language.code),
            language.equals(Language.DEFAULT)
                ? null
                : this.#repository.getDictionary(Language.DEFAULT.code).catch(() => ({})),
        ]);

        this.#dictionary = dictionary ?? {};
        this.#fallback = fallback ?? this.#dictionary;
        const changed = !language.equals(this.#language);
        this.#language = language;
        if (persist) this.#preferences.saveLanguage(language.code);
        if (changed) this.#listeners.forEach((listener) => listener(language));
        return language;
    }

    toggle() {
        return this.setLanguage((this.#language ?? Language.DEFAULT).next());
    }

    has(key) {
        return this.#lookup(key) !== undefined;
    }

    /** Texto traduzido; devolve a própria chave se não existir. */
    t(key, params) {
        const value = this.#lookup(key);
        if (typeof value !== "string") return key;
        return params ? interpolate(value, params) : value;
    }

    /** Lista traduzida (ex.: frases do typewriter); [] se não existir. */
    list(key) {
        const value = this.#lookup(key);
        return Array.isArray(value) ? value : [];
    }

    /** @returns {() => void} função para cancelar a inscrição */
    onChange(listener) {
        this.#listeners.add(listener);
        return () => this.#listeners.delete(listener);
    }

    #lookup(key) {
        return I18nService.#resolve(this.#dictionary, key) ?? I18nService.#resolve(this.#fallback, key);
    }

    static #resolve(source, key) {
        return key.split(".").reduce((node, part) => (node && typeof node === "object" ? node[part] : undefined), source);
    }
}
