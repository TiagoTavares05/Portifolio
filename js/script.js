"use strict";

document.addEventListener("DOMContentLoaded", () => {
    /* ======================================================================
       1. EFEITO TYPEWRITER NO HERO
       ====================================================================== */
    const typewriterEl = document.getElementById("typewriter");
    const phrases = [
        "Agentes Autônomos com Google ADK & Gemini Enterprise",
        "Google Cloud Certified: Generative AI Leader",
        "Servidores MCP, RAG & Integração BigQuery",
        "Python • TypeScript • Google Cloud Agent Platform"
    ];
    let phraseIdx = 0;

    if (typewriterEl) {
        typewriterEl.style.transition = "opacity 0.25s ease";
        setInterval(() => {
            phraseIdx = (phraseIdx + 1) % phrases.length;
            typewriterEl.style.opacity = "0";
            setTimeout(() => {
                typewriterEl.textContent = phrases[phraseIdx];
                typewriterEl.style.opacity = "1";
            }, 250);
        }, 3800);
    }

    /* ======================================================================
       2. LUZ AMBIENTE DINÂMICA POR CARD (VOLTA PARA VERMELHO NO MOUSELEAVE)
       ====================================================================== */
    const themedCards = document.querySelectorAll("[data-theme-hover]");
    themedCards.forEach((card) => {
        card.addEventListener("mouseenter", () => {
            const theme = card.getAttribute("data-theme-hover");
            if (theme) {
                document.body.setAttribute("data-ambient", theme);
            }
        });
        card.addEventListener("mouseleave", () => {
            document.body.setAttribute("data-ambient", "red");
        });
    });

    /* ======================================================================
       3. BOTÕES A / B DO GAME BOY AGENT
       ====================================================================== */
    const gbDialogue = document.getElementById("gbDialogue");
    const gbBtnA = document.getElementById("gbBtnA");
    const gbBtnB = document.getElementById("gbBtnB");

    const gbLinesA = [
        "> PIKACHU #025: ELÉTRICO | VELOCIDADE: 90 ⚡",
        "> CHARIZARD #006: FOGO/VOADOR | SP.ATK: 109 🔥",
        "> GENGAR #094: FANTASMA | AGENTE IA ATIVO! 👻",
        "> LUCARIO #448: LUTADOR/AÇO | AURA DETECTADA 💠"
    ];
    const gbLinesB = [
        "> [AGENTE IA]: QUAL POKÉMON DESEJA ANALISAR HOJE?",
        "> [SISTEMA]: CONECTADO AO MODELO GEMINI + POKEAPI!",
        "> [DICA]: CLIQUE EM 'START' PARA VER O REPOSITÓRIO!"
    ];
    let idxA = 0;
    let idxB = 0;

    if (gbBtnA && gbDialogue) {
        gbBtnA.addEventListener("click", () => {
            gbDialogue.textContent = gbLinesA[idxA % gbLinesA.length];
            idxA++;
        });
    }
    if (gbBtnB && gbDialogue) {
        gbBtnB.addEventListener("click", () => {
            gbDialogue.textContent = gbLinesB[idxB % gbLinesB.length];
            idxB++;
        });
    }

    /* ======================================================================
       4. PLAYER INTERATIVO DO CARD SPOTIFY
       ====================================================================== */
    const spotifyPlayBtn = document.getElementById("spotifyPlayBtn");
    const spotifyEq = document.getElementById("spotifyEq");
    const spProgressFill = document.getElementById("spProgressFill");
    const spCurrentTime = document.getElementById("spCurrentTime");
    let isPlaying = true;
    let progress = 45;

    if (spotifyPlayBtn && spotifyEq) {
        spotifyPlayBtn.addEventListener("click", () => {
            isPlaying = !isPlaying;
            spotifyPlayBtn.textContent = isPlaying ? "❚❚" : "▶";
            spotifyEq.classList.toggle("paused", !isPlaying);
            if (isPlaying && spProgressFill && spCurrentTime) {
                progress = ((progress + 15) % 85) + 10;
                spProgressFill.style.width = `${progress}%`;
                const secs = Math.floor((progress / 100) * 225);
                const m = String(Math.floor(secs / 60)).padStart(2, "0");
                const s = String(secs % 60).padStart(2, "0");
                spCurrentTime.textContent = `${m}:${s}`;
            }
        });
    }

    /* ======================================================================
       5. MODAL DO DIPLOMA OFICIAL GOOGLE CLOUD
       ====================================================================== */
    const certModal = document.getElementById("certModal");
    const btnOpenCertModal = document.getElementById("btnOpenCertModal");
    const btnCloseCertModal = document.getElementById("btnCloseCertModal");

    if (btnOpenCertModal && certModal) {
        btnOpenCertModal.addEventListener("click", () => {
            certModal.classList.add("active");
            certModal.setAttribute("aria-hidden", "false");
        });
    }
    if (btnCloseCertModal && certModal) {
        btnCloseCertModal.addEventListener("click", () => {
            certModal.classList.remove("active");
            certModal.setAttribute("aria-hidden", "true");
        });
    }
    if (certModal) {
        certModal.addEventListener("click", (e) => {
            if (e.target === certModal) {
                certModal.classList.remove("active");
                certModal.setAttribute("aria-hidden", "true");
            }
        });
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && certModal.classList.contains("active")) {
                certModal.classList.remove("active");
                certModal.setAttribute("aria-hidden", "true");
            }
        });
    }

    /* ======================================================================
       6. ENVIO DE MENSAGEM PARA O WHATSAPP
       ====================================================================== */
    const formulario = document.getElementById("formulario");
    if (formulario) {
        formulario.addEventListener("submit", (event) => {
            event.preventDefault();
            const nome = document.getElementById("nome").value.trim();
            const mensagem = document.getElementById("mensagem").value.trim();
            const telefone = "5513991655339";

            const texto = `Olá Tiago! Me chamo ${nome}. ${mensagem}`;
            const msgFormatada = encodeURIComponent(texto);
            const url = `https://wa.me/${telefone}/?text=${msgFormatada}`;

            window.open(url, "_blank", "noopener,noreferrer");
        });
    }
});
