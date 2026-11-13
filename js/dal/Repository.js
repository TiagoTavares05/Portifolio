import { DataSource } from "./DataSource.js";

/** DAL — Classe base dos repositórios: recebe a fonte de dados por injeção de dependência. */
export class Repository {
    #source;

    /** @param {DataSource} source */
    constructor(source) {
        if (new.target === Repository) {
            throw new TypeError("Repository é abstrata: use uma subclasse.");
        }
        if (!(source instanceof DataSource)) {
            throw new TypeError(`${new.target.name}: informe uma DataSource.`);
        }
        this.#source = source;
    }

    /** @protected */
    read(path) {
        return this.#source.read(path);
    }
}
