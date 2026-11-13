import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { DataAccessError, DataSource, HttpJsonDataSource, StaticDataSource } from "../js/dal/DataSource.js";
import { Repository } from "../js/dal/Repository.js";
import { TranslationRepository } from "../js/dal/TranslationRepository.js";
import { SiteConfigRepository } from "../js/dal/SiteConfigRepository.js";
import { bundleOptions } from "../scripts/bundle.js";

describe("StaticDataSource + repositórios", () => {
    const source = new StaticDataSource({
        "site.json": { contact: { whatsapp: "5513991655339" } },
        "i18n/pt.json": { hello: "Olá" },
    });

    test("repositórios leem pelo caminho certo", async () => {
        assert.deepEqual(await new TranslationRepository(source).getDictionary("pt"), { hello: "Olá" });
        assert.equal((await new SiteConfigRepository(source).getConfig()).contact.whatsapp, "5513991655339");
    });

    test("caminho inexistente gera DataAccessError", async () => {
        await assert.rejects(new TranslationRepository(source).getDictionary("fr"), DataAccessError);
    });

    test("classes abstratas e injeção inválida são bloqueadas", () => {
        assert.throws(() => new DataSource(), TypeError);
        assert.throws(() => new Repository(source), TypeError);
        assert.throws(() => new TranslationRepository({}), TypeError);
    });
});

describe("HttpJsonDataSource", () => {
    test("busca uma vez e reaproveita o cache", async () => {
        let calls = 0;
        const source = new HttpJsonDataSource("https://exemplo.test", async (url) => {
            calls++;
            assert.equal(url, "https://exemplo.test/a.json");
            return { ok: true, json: async () => ({ a: 1 }) };
        });
        assert.deepEqual(await source.read("a.json"), { a: 1 });
        await source.read("a.json");
        assert.equal(calls, 1);
    });

    test("erro HTTP não fica em cache", async () => {
        let ok = false;
        const source = new HttpJsonDataSource("https://exemplo.test/", async () => ({
            ok,
            status: 500,
            json: async () => ({ fine: true }),
        }));
        await assert.rejects(source.read("x.json"), DataAccessError);
        ok = true;
        assert.deepEqual(await source.read("x.json"), { fine: true });
    });
});

describe("bundle", () => {
    test("js/app.bundle.js está atualizado com o código-fonte (rode `npm run bundle`)", async () => {
        const esbuild = await import("esbuild");
        const result = await esbuild.build({ ...bundleOptions, write: false, logLevel: "silent" });
        const expected = result.outputFiles[0].text;
        const actual = await readFile(path.join(bundleOptions.absWorkingDir, bundleOptions.outfile), "utf8");
        assert.equal(actual.replace(/\r\n/g, "\n"), expected.replace(/\r\n/g, "\n"));
    });
});
