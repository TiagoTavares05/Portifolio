/**
 * DAL — Preferências do visitante (idioma) no localStorage.
 * O acesso ao storage pode lançar exceção (aba anônima, cookies bloqueados),
 * então toda leitura/escrita é protegida e falha de forma silenciosa.
 */
export class PreferencesRepository {
    static #LANGUAGE_KEY = "portfolio.language";
    #storageProvider;

    /** @param {() => Storage} [storageProvider] */
    constructor(storageProvider = () => globalThis.localStorage) {
        this.#storageProvider = storageProvider;
    }

    getLanguage() {
        try {
            return this.#storageProvider()?.getItem(PreferencesRepository.#LANGUAGE_KEY) ?? null;
        } catch {
            return null;
        }
    }

    saveLanguage(code) {
        try {
            this.#storageProvider()?.setItem(PreferencesRepository.#LANGUAGE_KEY, code);
            return true;
        } catch {
            return false;
        }
    }
}
