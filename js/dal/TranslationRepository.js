import { Repository } from "./Repository.js";

/** DAL — Dicionários de tradução (data/i18n/{codigo}.json). */
export class TranslationRepository extends Repository {
    /** @param {string} languageCode */
    getDictionary(languageCode) {
        return this.read(`i18n/${languageCode}.json`);
    }
}
