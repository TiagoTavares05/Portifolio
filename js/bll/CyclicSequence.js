/** BLL — Percorre uma lista em ciclo (frases do typewriter, falas do Game Boy). */
export class CyclicSequence {
    #items;
    #index = 0;

    /** @param {readonly unknown[]} items */
    constructor(items = []) {
        this.#items = [...items];
    }

    get size() {
        return this.#items.length;
    }

    get isEmpty() {
        return this.#items.length === 0;
    }

    /** Devolve o item atual e avança (volta ao início no fim). */
    next() {
        if (this.isEmpty) return undefined;
        const item = this.#items[this.#index];
        this.#index = (this.#index + 1) % this.#items.length;
        return item;
    }

    /** Troca os itens (ex.: mudança de idioma) e recomeça do início. */
    reset(items = this.#items) {
        this.#items = [...items];
        this.#index = 0;
    }
}
