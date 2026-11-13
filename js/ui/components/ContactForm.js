import { Component } from "../Component.js";
import { ContactMessage } from "../../models/ContactMessage.js";

/** UI — Formulário de contato. A validação e o link ficam no ContactService (BLL). */
export class ContactForm extends Component {
    static #FIELD_BY_ERROR = {
        [ContactMessage.Errors.NAME_REQUIRED]: "nome",
        [ContactMessage.Errors.NAME_TOO_LONG]: "nome",
        [ContactMessage.Errors.MESSAGE_REQUIRED]: "mensagem",
        [ContactMessage.Errors.MESSAGE_TOO_LONG]: "mensagem",
    };

    #service;
    #i18n;
    #openUrl;
    #feedback;

    /**
     * @param {HTMLFormElement} root
     * @param {{ service: import("../../bll/ContactService.js").ContactService | null, i18n: any, openUrl?: (url: string) => void }} deps
     */
    constructor(root, { service, i18n, openUrl = (url) => window.open(url, "_blank", "noopener,noreferrer") }) {
        super(root);
        this.#service = service;
        this.#i18n = i18n;
        this.#openUrl = openUrl;
        this.#feedback = this.$(".form-feedback");
    }

    mount() {
        this.listen(this.root, "submit", (event) => {
            event.preventDefault();
            this.#submit();
        });
        this.listen(this.root, "input", (event) => {
            event.target.removeAttribute("aria-invalid");
        });
        this.addCleanup(this.#i18n.onChange(() => this.#showFeedback("")));
        return this;
    }

    #submit() {
        if (!this.#service) {
            this.#showFeedback(this.#i18n.t("contact.errors.unavailable"), "error");
            return;
        }

        const data = new FormData(this.root);
        const result = this.#service.prepare(
            { name: data.get("nome"), message: data.get("mensagem") },
            this.#i18n.t("contact.whatsappTemplate")
        );

        this.$$("[aria-invalid]").forEach((field) => field.removeAttribute("aria-invalid"));

        if (!result.ok) {
            const fields = result.errors.map((code) => this.root.elements[ContactForm.#FIELD_BY_ERROR[code]]);
            fields.forEach((field) => field?.setAttribute("aria-invalid", "true"));
            fields[0]?.focus();
            this.#showFeedback(result.errors.map((code) => this.#i18n.t(`contact.errors.${code}`)).join(" "), "error");
            return;
        }

        this.#showFeedback(this.#i18n.t("contact.success"), "success");
        this.#openUrl(result.url);
    }

    #showFeedback(message, status = "") {
        if (!this.#feedback) return;
        this.#feedback.textContent = message;
        this.#feedback.dataset.status = status;
    }
}
