import { ContactMessage } from "../models/ContactMessage.js";
import { interpolate } from "./template.js";

/** BLL — Regras do contato: valida a mensagem e monta o link do WhatsApp. */
export class ContactService {
    #phoneNumber;

    /** @param {{ phoneNumber: string }} options Número com DDI, só dígitos (ex.: 5513...) */
    constructor({ phoneNumber }) {
        const digits = String(phoneNumber ?? "").replace(/\D/g, "");
        if (digits.length < 10 || digits.length > 15) {
            throw new RangeError("ContactService: número de WhatsApp inválido.");
        }
        this.#phoneNumber = digits;
    }

    /**
     * @param {{ name: string, message: string }} input
     * @param {string} template Ex.: "Olá Tiago! Me chamo {name}. {message}"
     * @returns {{ ok: true, url: string } | { ok: false, errors: string[] }}
     */
    prepare(input, template) {
        const contact = new ContactMessage(input);
        const errors = contact.validate();
        if (errors.length > 0) return { ok: false, errors };

        const text = interpolate(template, { name: contact.name, message: contact.message });
        const url = `https://wa.me/${this.#phoneNumber}?text=${encodeURIComponent(text)}`;
        return { ok: true, url };
    }
}
