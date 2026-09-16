/* =====================================================================
   app.js - binder rummene og panelet sammen

   Rumknapperne, aflaesningen af det valgte glas, zoomboblen, intro,
   tastatur og tegneloekken. Selve rummene staar i js/plan.js og
   motoren i ../js/rum.js.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var St = NK.Stof;
    var B = NK.Beholder;

    var rum, bobleL;
    var sidsteTid = 0;
    var sidsteSignatur = "";
    var beskedUr = null;
    var dampAdvaret = -99;

    function tal(x, dec) {
        return x.toFixed(dec === undefined ? 1 : dec).replace(".", ",");
    }

    function bord() { return rum.aktiv(); }

    /* ----- Rumknapperne ------------------------------------------------- */
    function bygRumknapper() {
        var boks = NK.el("rumknapper");
        boks.innerHTML = "";
        rum.rum.forEach(function (r) {
            var k = document.createElement("button");
            k.type = "button";
            k.className = "knap";
            k.textContent = r.titel;
            k.dataset.rum = r.navn;
            k.addEventListener("click", function () {
                var d = r.i < rum.nu.i ? -1 : (r.i > rum.nu.i ? 1 : 0);
                rum.gaaTil(r, d);
            });
            boks.appendChild(k);
        });
        visRum();
    }

    function visRum() {
        var knapper = NK.el("rumknapper").querySelectorAll("button");
        for (var i = 0; i < knapper.length; i++) {
            var aktiv = knapper[i].dataset.rum === rum.nu.navn;
            knapper[i].classList.toggle("aktiv", aktiv);
            knapper[i].setAttribute("aria-pressed", aktiv ? "true" : "false");
        }
        NK.saetTekst("glas-titel", "Det valgte glas");
        opdaterPanel();
    }

    /* ----- Aflaesningen af det valgte glas ------------------------------- */
    function opdaterPanel() {
        var b = bord();
        var c = b.valgtBeholder();
        var tabel = NK.el("glas-indhold");
        NK.saetTekst("uheld-taeller", String(rum.antalUheld()));
        NK.el("boble-laerred").hidden = !c;
        if (!c) {
            NK.saetTekst("glas-titel", "Det valgte glas");
            NK.saetTekst("glas-volumen", "");
            NK.el("glas-tom").hidden = false;
            NK.saetTekst("glas-tom", "Klik på et glas eller en flaske for at se, hvad der er i. Alt andet gør du ved at trække.");
            tabel.hidden = true;
            NK.el("glas-temp").hidden = true;
            sidsteSignatur = signatur();
            return;
        }
        var o = B.samlet(c);
        NK.saetTekst("glas-titel", c.titel.charAt(0).toUpperCase() + c.titel.slice(1));
        NK.saetTekst("glas-volumen", tal(B.volumen(c)) + " mL");
        var raekker = [];
        Object.keys(o.n).sort().forEach(function (navn) {
            var s = St.stof(navn);
            if (o.n[navn] < 1e-3) return;
            if (s.fase === "s") raekker.push({ formel: St.formel(navn, true), vaerdi: tal(o.n[navn] / 1000, 2), enhed: "mmol", fast: true });
            else if (s.fase === "aq") raekker.push({ formel: St.formel(navn, true), vaerdi: tal(St.konc(o, navn), o.V > 0 && St.konc(o, navn) < 1 ? 2 : 1), enhed: "mM" });
        });
        NK.el("glas-tom").hidden = raekker.length > 0 || B.volumen(c) > 0.05;
        if (!raekker.length && B.volumen(c) > 0.05) {
            NK.el("glas-tom").hidden = false;
            NK.saetTekst("glas-tom", "Kun vand.");
        } else if (!raekker.length) {
            NK.saetTekst("glas-tom", "Tomt.");
            NK.el("glas-tom").hidden = false;
        }
        tabel.innerHTML = "";
        raekker.forEach(function (rk) {
            var tr = document.createElement("tr");
            if (rk.fast) tr.className = "fast";
            var th = document.createElement("th");
            th.textContent = rk.formel;
            var td = document.createElement("td");
            td.textContent = rk.vaerdi;
            var te = document.createElement("td");
            te.className = "enhed";
            te.textContent = rk.enhed;
            tr.appendChild(th); tr.appendChild(td); tr.appendChild(te);
            tabel.appendChild(tr);
        });
        tabel.hidden = !raekker.length;
        var temp = NK.el("glas-temp");
        temp.hidden = B.volumen(c) < 0.05;
        var ph = St.pH(o);
        temp.textContent = "Temperatur: " + NK.Tegning.temperaturTekst(o.T) + (c.koger ? " (koger)" : "") + (ph === null ? "" : " · pH " + tal(ph, 1));
        sidsteSignatur = signatur();
    }

    function signatur() {
        var b = bord();
        var c = b.valgtBeholder();
        if (!c) return rum.nu.navn + "|ingen|" + rum.antalUheld();
        var o = B.samlet(c);
        var ph = St.pH(o);
        var dele = [rum.nu.navn, c.navn, Math.round(B.volumen(c) * 10), Math.round(o.T * 2), rum.antalUheld(), c.koger ? 1 : 0, ph === null ? "" : Math.round(ph * 10)];
        Object.keys(o.n).sort().forEach(function (n) { dele.push(n + ":" + Math.round(o.n[n] * 10)); });
        return dele.join("|");
    }

    /* ----- Zoomboblen i panelet ---------------------------------------- */
    function tegnBoble() {
        var c = NK.el("boble-laerred");
        var vis = !!bord().valgtBeholder();
        if (c.hidden !== !vis) c.hidden = !vis;
        if (!vis) return;
        bobleL.tilpas();
        var ctx = bobleL.ctx;
        ctx.clearRect(0, 0, bobleL.b, bobleL.h);
        rum.tegnBoble(ctx, bobleL.b / 2, bobleL.h / 2);
    }

    /* ----- Beskeden paa scenen ------------------------------------------ */
    function besked(tekst, slags) {
        var el = NK.el("scenebesked");
        el.className = "scenebesked";
        void el.offsetWidth;
        el.textContent = tekst;
        el.className = "scenebesked vis " + (slags || "");
        window.clearTimeout(beskedUr);
        beskedUr = window.setTimeout(function () { el.classList.remove("vis"); }, 2800);
    }

    /* Farvede dampe uden for stinkskabet er et uheld i sig selv */
    function vedHaendelse(type, data, r) {
        if (type !== "gas" || r !== rum.nu) return;
        var s = St.stof(data.stof);
        if (!s.farve || data.iStinkskab) return;
        if (rum.tid - dampAdvaret < 20) return;
        dampAdvaret = rum.tid;
        besked(St.formel(data.stof) + " uden for stinkskabet. Det hører til derinde.", "advarsel");
    }

    /* ----- Intro, lyd, start forfra ----------------------------------------- */
    var INTRO_GEMT = "nk-proeverum-intro";

    function aabnIntro() {
        NK.Rundvisning.luk();
        lukOverlay();
        NK.el("intro").classList.add("vis");
        NK.el("intro-start").focus({ preventScroll: true });
    }

    function introFoersteGang() {
        var set = false;
        try {
            set = !!window.localStorage.getItem(INTRO_GEMT);
            window.localStorage.setItem(INTRO_GEMT, "set");
        } catch (fejl) { /* file:// eller privat browsing */ }
        if (!set) aabnIntro();
    }

    function lukOverlay() {
        var aabne = document.querySelectorAll(".overlay.vis");
        for (var i = 0; i < aabne.length; i++) aabne[i].classList.remove("vis");
    }

    function visLyd() {
        var til = NK.Lyd.erTil();
        var knap = NK.el("lydknap");
        knap.classList.toggle("fra", !til);
        knap.setAttribute("aria-pressed", til ? "true" : "false");
    }

    function skiftLyd() {
        NK.Lyd.saet(!NK.Lyd.erTil());
        NK.Lyd.laasOp();
        visLyd();
    }

    function startForfra() {
        rum.nulstil();
        visRum();
    }

    /* ----- Tastatur ----------------------------------------------------- */
    function tastNed(e) {
        if (e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        if (e.key === "Escape") { lukOverlay(); NK.Rundvisning.luk(); return; }
        if (e.key === "?" || e.key === "h" || e.key === "H") {
            if (NK.Rundvisning.aktiv()) NK.Rundvisning.luk();
            else { lukOverlay(); NK.Rundvisning.start(); }
            return;
        }
        if (NK.Rundvisning.aktiv() || document.querySelector(".overlay.vis")) return;
        if (e.key === "m" || e.key === "M") { skiftLyd(); return; }
        if (rum.tast(e)) e.preventDefault();
    }

    /* ----- Tegneloekken ------------------------------------------------ */
    function loekke(ts) {
        var dt = (ts - sidsteTid) / 1000;
        sidsteTid = ts;
        if (!isFinite(dt) || dt < 0) dt = 0;
        if (dt > 0.1) dt = 0.1;

        rum.tilpas();
        rum.opdater(dt);
        rum.tegn();
        tegnBoble();

        if (signatur() !== sidsteSignatur) opdaterPanel();
        window.requestAnimationFrame(loekke);
    }

    /* ----- Opstart ------------------------------------------------------- */
    function start() {
        NK.Sprites.start();
        rum = new NK.Rum(NK.el("scene-laerred"), NK.RUM_PLAN);
        rum.bindMus();
        bobleL = new NK.Laerred(NK.el("boble-laerred"));

        /* Saa rummene kan pilles ved fra konsollen og fra _selvtest.html */
        NK.rum = rum;
        NK.opdaterPanel = opdaterPanel;
        NK.startForfra = startForfra;

        rum.vedAendring = function () { opdaterPanel(); };
        rum.vedBesked = besked;
        rum.vedHaendelse = vedHaendelse;
        rum.vedSkift = function () { visRum(); };

        bygRumknapper();
        NK.el("forfraknap").addEventListener("click", startForfra);
        NK.el("lydknap").addEventListener("click", skiftLyd);
        NK.el("hjaelpknap").addEventListener("click", function () { lukOverlay(); NK.Rundvisning.start(); });
        NK.el("introknap").addEventListener("click", aabnIntro);
        NK.el("intro-start").addEventListener("click", lukOverlay);
        NK.el("intro-rundvisning").addEventListener("click", function () { lukOverlay(); NK.Rundvisning.start(); });
        NK.el("intro").addEventListener("click", function (e) { if (e.target === this) lukOverlay(); });
        NK.intro = { aabn: aabnIntro, luk: lukOverlay };

        document.addEventListener("keydown", tastNed);

        visLyd();
        rum.tilpas();
        opdaterPanel();
        introFoersteGang();

        window.requestAnimationFrame(function (ts) {
            sidsteTid = ts;
            window.requestAnimationFrame(loekke);
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", start);
    } else {
        start();
    }
}());
