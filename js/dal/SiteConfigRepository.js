import { Repository } from "./Repository.js";

/** DAL — Configurações do site (contato, tempos de animação) em data/site.json. */
export class SiteConfigRepository extends Repository {
    getConfig() {
        return this.read("site.json");
    }
}
