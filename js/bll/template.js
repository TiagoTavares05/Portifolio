/**
 * BLL — Substitui marcadores {chave} por valores.
 * interpolate("Olá {name}", { name: "Ana" }) → "Olá Ana"
 */
export function interpolate(template, params = {}) {
    return String(template).replace(/\{(\w+)\}/g, (match, key) =>
        Object.hasOwn(params, key) ? String(params[key]) : match
    );
}
