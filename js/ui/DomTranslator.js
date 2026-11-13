/**
 * UI — Aplica as traduções do I18nService no DOM.
 *  data-i18n="chave"            → textContent
 *  data-i18n-html="chave"       → innerHTML (apenas conteúdo estático do próprio repositório)
 *  data-i18n-attr="alt:chave;title:chave2"
 */
export class DomTranslator {
    #document;
    #i18n;

    constructor(document, i18n) {
        this.#document = document;
        this.#i18n = i18n;
    }

    apply() {
        const i18n = this.#i18n;
        const doc = this.#document;
        if (!i18n.isReady) return;

        doc.documentElement.lang = i18n.language.locale;
        if (i18n.has("meta.title")) doc.title = i18n.t("meta.title");
        const description = doc.querySelector('meta[name="description"]');
        if (description && i18n.has("meta.description")) description.content = i18n.t("meta.description");

        doc.querySelectorAll("[data-i18n]").forEach((el) => {
            const key = el.dataset.i18n;
            if (i18n.has(key)) el.textContent = i18n.t(key);
        });
        doc.querySelectorAll("[data-i18n-html]").forEach((el) => {
            const key = el.dataset.i18nHtml;
            if (i18n.has(key)) el.innerHTML = i18n.t(key);
        });
        doc.querySelectorAll("[data-i18n-attr]").forEach((el) => {
            for (const pair of el.dataset.i18nAttr.split(";")) {
                const [attr, key] = pair.split(":").map((part) => part.trim());
                if (attr && key && i18n.has(key)) el.setAttribute(attr, i18n.t(key));
            }
        });
    }
}
