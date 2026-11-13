import { Component } from "../Component.js";

/** UI — Botão PT/EN. Delega a troca ao I18nService e reflete o idioma ativo. */
export class LanguageSwitcher extends Component {
    #i18n;

    constructor(root, { i18n }) {
        super(root);
        this.#i18n = i18n;
    }

    mount() {
        // Sem dicionários carregados não há como traduzir: o botão continua oculto.
        if (!this.#i18n.isReady) return this;
        this.root.hidden = false;

        this.listen(this.root, "click", async () => {
            this.root.disabled = true;
            try {
                await this.#i18n.toggle();
            } catch (error) {
                console.warn("Não foi possível trocar o idioma.", error);
            } finally {
                this.root.disabled = false;
            }
        });
        this.addCleanup(this.#i18n.onChange(() => this.render()));
        this.render();
        return this;
    }

    render() {
        const language = this.#i18n.language;
        if (!language) return;
        this.$$("[data-lang]").forEach((el) => el.classList.toggle("is-active", el.dataset.lang === language.code));
        this.root.setAttribute("aria-label", this.#i18n.t("nav.switchLanguage"));
    }
}
