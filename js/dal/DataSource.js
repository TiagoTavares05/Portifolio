/**
 * DAL — Fontes de dados (Strategy).
 * Os repositórios não sabem de onde os dados vêm: só pedem `read(caminho)`.
 *  - StaticDataSource: dados embutidos no bundle (funciona até abrindo o index.html direto, via file://).
 *  - HttpJsonDataSource: busca JSON por HTTP com cache (útil para APIs externas, ex.: GitHub).
 */
export class DataAccessError extends Error {
    constructor(message, { cause, path } = {}) {
        super(message, { cause });
        this.name = "DataAccessError";
        this.path = path;
    }
}

export class DataSource {
    constructor() {
        if (new.target === DataSource) {
            throw new TypeError("DataSource é abstrata: use uma subclasse.");
        }
    }

    /** @param {string} path @returns {Promise<unknown>} */
    async read(path) {
        throw new Error(`${this.constructor.name}.read(${path}) não implementado.`);
    }
}

export class StaticDataSource extends DataSource {
    #records;

    /** @param {Record<string, unknown>} records Mapa caminho → dados */
    constructor(records) {
        super();
        this.#records = new Map(Object.entries(records));
    }

    async read(path) {
        if (!this.#records.has(path)) {
            throw new DataAccessError(`Dado não encontrado: ${path}`, { path });
        }
        return this.#records.get(path);
    }
}

export class HttpJsonDataSource extends DataSource {
    #baseUrl;
    #fetch;
    #cache = new Map();

    /**
     * @param {string} baseUrl Ex.: "https://api.github.com/"
     * @param {(input: string) => Promise<Response>} [fetchFn] Injetável para testes
     */
    constructor(baseUrl, fetchFn = (input) => globalThis.fetch(input)) {
        super();
        this.#baseUrl = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
        this.#fetch = fetchFn;
    }

    read(path) {
        if (!this.#cache.has(path)) {
            const request = this.#load(path);
            this.#cache.set(path, request);
            // Falhas não ficam em cache: permite nova tentativa.
            request.catch(() => this.#cache.delete(path));
        }
        return this.#cache.get(path);
    }

    async #load(path) {
        const url = `${this.#baseUrl}${path}`;
        let response;
        try {
            response = await this.#fetch(url);
        } catch (cause) {
            throw new DataAccessError(`Falha de rede ao carregar ${url}`, { cause, path });
        }
        if (!response.ok) {
            throw new DataAccessError(`HTTP ${response.status} ao carregar ${url}`, { path });
        }
        try {
            return await response.json();
        } catch (cause) {
            throw new DataAccessError(`JSON inválido em ${url}`, { cause, path });
        }
    }
}
