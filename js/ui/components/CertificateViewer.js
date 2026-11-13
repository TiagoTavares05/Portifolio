import { Modal } from "./Modal.js";

/**
 * UI — Modal único para todos os certificados (herda de Modal).
 * Cada botão [data-cert-open] descreve o certificado nos próprios atributos:
 *   data-cert-src, data-cert-width, data-cert-height, data-cert-title,
 *   data-cert-meta, data-cert-alt e (opcional) data-cert-verify.
 */
export class CertificateViewer extends Modal {
    #image;
    #title;
    #meta;
    #verify;

    constructor(root, { triggers = [] } = {}) {
        super(root, { triggers });
        this.#image = this.$(".cert-modal-img");
        this.#title = this.$(".cert-modal-name");
        this.#meta = this.$(".cert-modal-id");
        this.#verify = this.$(".cert-modal-verify");
    }

    open(trigger) {
        if (trigger) this.#render(trigger.dataset);
        super.open(trigger);
    }

    #render({ certSrc, certWidth, certHeight, certTitle = "", certMeta = "", certAlt = "", certVerify }) {
        if (this.#image && certSrc) {
            this.#image.src = certSrc;
            if (certWidth) this.#image.width = Number(certWidth);
            if (certHeight) this.#image.height = Number(certHeight);
            this.#image.alt = certAlt;
        }
        if (this.#title) this.#title.textContent = certTitle;
        if (this.#meta) {
            this.#meta.textContent = certMeta;
            this.#meta.hidden = !certMeta;
        }
        if (this.#verify) {
            this.#verify.hidden = !certVerify;
            if (certVerify) this.#verify.href = certVerify;
        }
    }
}
