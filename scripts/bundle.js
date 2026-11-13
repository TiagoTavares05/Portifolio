/**
 * Gera js/app.bundle.js (script clássico/IIFE) a partir dos módulos em js/.
 *   npm run bundle          → gera uma vez
 *   npm run bundle -- --watch → regera a cada alteração
 * As opções ficam aqui para o teste de "bundle atualizado" usar exatamente as mesmas.
 */
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export const bundleOptions = {
    absWorkingDir: root,
    entryPoints: ["js/app.js"],
    outfile: "js/app.bundle.js",
    bundle: true,
    format: "iife",
    target: "es2022",
    legalComments: "none",
    banner: { js: "/* Arquivo gerado por `npm run bundle` a partir de js/app.js. Não edite à mão. */" },
    logLevel: "info",
};

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    const esbuild = await import("esbuild");
    if (process.argv.includes("--watch")) {
        const context = await esbuild.context(bundleOptions);
        await context.watch();
    } else {
        await esbuild.build(bundleOptions);
    }
}
