/** Model — Mensagem enviada pelo formulário de contato, com regras de validação. */
export class ContactMessage {
    static NAME_MAX_LENGTH = 80;
    static MESSAGE_MAX_LENGTH = 1000;

    static Errors = Object.freeze({
        NAME_REQUIRED: "nameRequired",
        NAME_TOO_LONG: "nameTooLong",
        MESSAGE_REQUIRED: "messageRequired",
        MESSAGE_TOO_LONG: "messageTooLong",
    });

    /** @param {{ name?: string, message?: string }} data */
    constructor({ name = "", message = "" } = {}) {
        this.name = String(name).trim().replace(/\s+/g, " ");
        this.message = String(message).trim();
        Object.freeze(this);
    }

    /** @returns {string[]} Códigos de erro (vazio quando válida) */
    validate() {
        const { Errors, NAME_MAX_LENGTH, MESSAGE_MAX_LENGTH } = ContactMessage;
        const errors = [];
        if (!this.name) errors.push(Errors.NAME_REQUIRED);
        else if (this.name.length > NAME_MAX_LENGTH) errors.push(Errors.NAME_TOO_LONG);
        if (!this.message) errors.push(Errors.MESSAGE_REQUIRED);
        else if (this.message.length > MESSAGE_MAX_LENGTH) errors.push(Errors.MESSAGE_TOO_LONG);
        return errors;
    }

    get isValid() {
        return this.validate().length === 0;
    }
}
