/**
 * Composition root do portfólio.
 * Monta as camadas: DAL (repositórios) → BLL (serviços) → UI (componentes).
 *
 * Este arquivo é a entrada do bundle (npm run build → js/app.bundle.js).
 * O navegador carrega o bundle como script clássico, então o site funciona
 * na Vercel e também abrindo o index.html direto (file://).
 */
import site from "../data/site.json" with { type: "json" };
import pt from "../data/i18n/pt.json" with { type: "json" };
import en from "../data/i18n/en.json" with { type: "json" };
import { StaticDataSource } from "./dal/DataSource.js";
import { TranslationRepository } from "./dal/TranslationRepository.js";
import { SiteConfigRepository } from "./dal/SiteConfigRepository.js";
import { PreferencesRepository } from "./dal/PreferencesRepository.js";
import { I18nService } from "./bll/I18nService.js";
import { ContactService } from "./bll/ContactService.js";
import { DomTranslator } from "./ui/DomTranslator.js";
import { MobileMenu } from "./ui/components/MobileMenu.js";
import { ScrollSpy } from "./ui/components/ScrollSpy.js";
import { ScrollReveal } from "./ui/components/ScrollReveal.js";
import { AmbientLight } from "./ui/components/AmbientLight.js";
import { CertificateViewer } from "./ui/components/CertificateViewer.js";
import { LanguageSwitcher } from "./ui/components/LanguageSwitcher.js";
import { Typewriter } from "./ui/components/Typewriter.js";
import { GameboyConsole } from "./ui/components/GameboyConsole.js";
import { SpotifyPlayer } from "./ui/components/SpotifyPlayer.js";
import { ContactForm } from "./ui/components/ContactForm.js";

const dataSource = new StaticDataSource({
    "site.json": site,
    "i18n/pt.json": pt,
    "i18n/en.json": en,
});

const REVEAL_SELECTOR = [
    ".hero-content > *",
    ".section-header",
    ".sobre-caixa",
    ".cert-featured",
    ".cert-specialist",
    ".exp-card",
    ".habilidade-card",
    ".ai-specialties-bar",
    ".projetos-card",
    ".formulario-contato",
].join(", ");

class PortfolioApp {
    #doc;
    #components = [];
    #i18n;
    #translator;
    #siteConfig;

    constructor(doc) {
        this.#doc = doc;
        this.#siteConfig = new SiteConfigRepository(dataSource);
        this.#i18n = new I18nService({
            repository: new TranslationRepository(dataSource),
            preferences: new PreferencesRepository(),
            navigatorLanguages: navigator.languages ?? [navigator.language],
        });
        this.#translator = new DomTranslator(doc, this.#i18n);
    }

    async start() {
        // 1) Componentes estruturais: não dependem de dados, montam imediatamente.
        const nav = this.#doc.querySelector(".navegacao");
        this.#mount(nav, (el) => new MobileMenu(el, { i18n: this.#i18n }));
        this.#mount(nav, (el) => new ScrollSpy(el));
        this.#mount(this.#doc.body, (el) => new ScrollReveal(el, { selector: REVEAL_SELECTOR }));
        this.#mount(this.#doc.body, (el) => new AmbientLight(el));
        this.#mount(this.#doc.getElementById("certModal"), (el) =>
            new CertificateViewer(el, { triggers: [...this.#doc.querySelectorAll("[data-cert-open]")] })
        );

        // 2) Dados (traduções + configuração) carregados em paralelo.
        this.#i18n.onChange(() => this.#translator.apply());
        const [, config] = await Promise.all([
            this.#i18n.init().catch((error) => console.warn("i18n indisponível; mantendo textos do HTML.", error)),
            this.#siteConfig.getConfig().catch((error) => {
                console.warn("Configuração do site indisponível.", error);
                return null;
            }),
        ]);
        this.#translator.apply();

        // 3) Componentes que dependem de textos/configuração.
        this.#mount(this.#doc.querySelector(".lang-switch"), (el) => new LanguageSwitcher(el, { i18n: this.#i18n }));
        this.#mount(this.#doc.getElementById("typewriter"), (el) =>
            new Typewriter(el, { i18n: this.#i18n, intervalMs: config?.typewriter?.intervalMs })
        );
        this.#mount(this.#doc.querySelector(".theme-gameboy"), (el) => new GameboyConsole(el, { i18n: this.#i18n }));
        this.#mount(this.#doc.querySelector(".theme-spotify"), (el) => new SpotifyPlayer(el, { i18n: this.#i18n }));
        this.#mount(this.#doc.getElementById("formulario"), (el) =>
            new ContactForm(el, { service: this.#createContactService(config), i18n: this.#i18n })
        );
    }

    #createContactService(config) {
        try {
            return new ContactService({ phoneNumber: config?.contact?.whatsapp });
        } catch (error) {
            console.warn(error);
            return null;
        }
    }

    /** Monta o componente só se o elemento existir; uma falha isolada não derruba o resto. */
    #mount(element, factory) {
        if (!element) return;
        try {
            this.#components.push(factory(element).mount());
        } catch (error) {
            console.error("Falha ao montar componente:", error);
        }
    }
}

new PortfolioApp(document).start();
