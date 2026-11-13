import { test, describe } from "node:test";
import assert from "node:assert/strict";

import { ContactMessage } from "../js/models/ContactMessage.js";
import { Language } from "../js/models/Language.js";
import { ContactService } from "../js/bll/ContactService.js";
import { CyclicSequence } from "../js/bll/CyclicSequence.js";
import { I18nService } from "../js/bll/I18nService.js";
import { PlaybackSimulator } from "../js/bll/PlaybackSimulator.js";
import { interpolate } from "../js/bll/template.js";

describe("ContactMessage", () => {
    test("normaliza espaços e é válida com nome e mensagem", () => {
        const msg = new ContactMessage({ name: "  Maria   Silva ", message: "  Olá!  " });
        assert.equal(msg.name, "Maria Silva");
        assert.equal(msg.message, "Olá!");
        assert.equal(msg.isValid, true);
    });

    test("aponta campos obrigatórios vazios", () => {
        const errors = new ContactMessage({ name: "   ", message: "" }).validate();
        assert.deepEqual(errors, [ContactMessage.Errors.NAME_REQUIRED, ContactMessage.Errors.MESSAGE_REQUIRED]);
    });

    test("aponta textos acima do limite", () => {
        const errors = new ContactMessage({
            name: "a".repeat(ContactMessage.NAME_MAX_LENGTH + 1),
            message: "b".repeat(ContactMessage.MESSAGE_MAX_LENGTH + 1),
        }).validate();
        assert.deepEqual(errors, [ContactMessage.Errors.NAME_TOO_LONG, ContactMessage.Errors.MESSAGE_TOO_LONG]);
    });
});

describe("ContactService", () => {
    const service = new ContactService({ phoneNumber: "+55 (13) 99165-5339" });

    test("monta link do WhatsApp com texto codificado", () => {
        const result = service.prepare({ name: "Ana", message: "Vamos conversar? 100%" }, "Olá! Me chamo {name}. {message}");
        assert.equal(result.ok, true);
        const url = new URL(result.url);
        assert.equal(url.origin + url.pathname, "https://wa.me/5513991655339");
        assert.equal(url.searchParams.get("text"), "Olá! Me chamo Ana. Vamos conversar? 100%");
    });

    test("não monta link quando a mensagem é inválida", () => {
        const result = service.prepare({ name: "", message: "oi" }, "{name} {message}");
        assert.deepEqual(result, { ok: false, errors: [ContactMessage.Errors.NAME_REQUIRED] });
    });

    test("rejeita número de telefone inválido", () => {
        assert.throws(() => new ContactService({ phoneNumber: "123" }), RangeError);
        assert.throws(() => new ContactService({}), RangeError);
    });
});

describe("Language", () => {
    test("converte códigos de locale", () => {
        assert.equal(Language.from("en-US"), Language.EN);
        assert.equal(Language.from("PT_br"), Language.PT);
        assert.equal(Language.from("fr"), null);
        assert.equal(Language.from(null), null);
    });

    test("alterna em ciclo", () => {
        assert.equal(Language.PT.next(), Language.EN);
        assert.equal(Language.EN.next(), Language.PT);
    });
});

describe("CyclicSequence", () => {
    test("percorre e volta ao início", () => {
        const seq = new CyclicSequence(["a", "b"]);
        assert.deepEqual([seq.next(), seq.next(), seq.next()], ["a", "b", "a"]);
    });

    test("lista vazia devolve undefined e reset troca os itens", () => {
        const seq = new CyclicSequence();
        assert.equal(seq.next(), undefined);
        seq.reset(["x"]);
        assert.equal(seq.next(), "x");
    });
});

describe("PlaybackSimulator", () => {
    test("pausa sem avançar e avança ao voltar a tocar", () => {
        const playback = new PlaybackSimulator({ initialProgress: 45, durationSeconds: 225 });
        assert.equal(playback.currentTime, "01:41");
        assert.equal(playback.toggle(), false);
        assert.equal(playback.progress, 45);
        assert.equal(playback.toggle(), true);
        assert.equal(playback.progress, 70);
        assert.equal(playback.duration, "03:45");
    });
});

describe("interpolate", () => {
    test("substitui marcadores conhecidos e preserva os desconhecidos", () => {
        assert.equal(interpolate("{a}-{b}", { a: 1 }), "1-{b}");
    });
});

describe("I18nService", () => {
    const dictionaries = {
        pt: { hello: "Olá {name}", only: { pt: "só pt" }, list: ["um", "dois"] },
        en: { hello: "Hello {name}", list: ["one", "two"] },
    };

    function createService({ saved = null, navigatorLanguages = [] } = {}) {
        const preferences = {
            value: saved,
            getLanguage() {
                return this.value;
            },
            saveLanguage(code) {
                this.value = code;
                return true;
            },
        };
        const repository = {
            async getDictionary(code) {
                if (!dictionaries[code]) throw new Error(`sem ${code}`);
                return dictionaries[code];
            },
        };
        return { service: new I18nService({ repository, preferences, navigatorLanguages }), preferences };
    }

    test("prioriza preferência salva, depois navegador, depois padrão", () => {
        assert.equal(createService({ saved: "en", navigatorLanguages: ["pt-BR"] }).service.resolveInitialLanguage(), Language.EN);
        assert.equal(createService({ navigatorLanguages: ["fr-FR", "en-GB"] }).service.resolveInitialLanguage(), Language.EN);
        assert.equal(createService({ navigatorLanguages: ["fr-FR"] }).service.resolveInitialLanguage(), Language.PT);
    });

    test("traduz com parâmetros, listas e fallback para PT", async () => {
        const { service } = createService({ saved: "en" });
        await service.init();
        assert.equal(service.t("hello", { name: "Ana" }), "Hello Ana");
        assert.deepEqual(service.list("list"), ["one", "two"]);
        assert.equal(service.t("only.pt"), "só pt");
        assert.equal(service.t("missing.key"), "missing.key");
        assert.equal(service.has("missing.key"), false);
    });

    test("toggle troca idioma, persiste e notifica ouvintes", async () => {
        const { service, preferences } = createService();
        await service.init();
        const seen = [];
        const unsubscribe = service.onChange((language) => seen.push(language.code));

        await service.toggle();
        assert.equal(service.language, Language.EN);
        assert.equal(preferences.value, "en");

        unsubscribe();
        await service.toggle();
        assert.deepEqual(seen, ["en"]);
    });
});
