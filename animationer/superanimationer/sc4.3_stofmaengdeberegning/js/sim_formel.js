/* =====================================================================
   sim_formel.js - fane 1: Formlen

   Seks runder, der traener at huske n = m / M med navne og enheder, og
   at vende den. Tavlen har formlen (broek eller linje) og et skema med
   n, m og M, deres navne og enheder. Brikkerne ligger i bunden af tavlen
   og traekkes op paa pladserne (eller: klik paa en brik og saa paa en
   plads). Stilladset forsvinder runde for runde: blege bogstaver,
   lokkebrikker, navne, enheder, formlen vendt, og til sidst skrives det
   hele i felter uden brikker.

   En del (formlen, navnene, enhederne) vurderes, naar alle dens pladser
   er fyldt. Formlen vurderes som helhed, saa m = n · M og m = M · n er
   det samme; en forkert formel faar en besked med enhederne. De
   brikker, der sidder rigtigt, laases; resten hopper tilbage.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var T = NK.Tjek;
    var Tg = NK.Tegn;

    var RAEKKER = ["n", "m", "M"];
    var FACIT_NAVN = { n: "stofmængde", m: "masse", M: "molarmasse" };

    function SimFormel() {
        var mig = this;
        this.over = null;
        this.startFane(D.FORMEL);
        this.el.raekker = NK.el("formel-raekker");
        /* Fokus i sidste runde: det aktive felt */
        this.regning = { fokus: function () { mig.skrivFokus(); } };
        this.introNu = true;
        this.vaelg(0, false);
    }

    var P = SimFormel.prototype;
    NK.Fane.paa(P, { navn: "formel", naesteFane: "fane-vaegt", naesteNavn: "Vægten" });

    /* ----- Runden ------------------------------------------------------------------ */
    P.lavOpgave = function (i) {
        var r = D.FORMEL[i];
        this.runde = r;
        this.valgt = null;
        this.traekker = null;
        this.overPlads = null;
        this.enhedT = 0;
        this.muldvarp = null;
        this.pilT = 0;
        this.rystT = 0;
        this.lavPladser();
        var mig = this;
        this.brikker = (r.brikker ? NK.bland(r.brikker) : []).map(function (tekst, j) {
            return { id: "b" + j, tekst: tekst, slags: D.BRIK[tekst].slags, x: 0, y: 0, b: 1, h: 1, hx: 0, hy: 0,
                     plads: null, laast: false, roed: 0, groen: 0, fly: null };
        });
        this.dele = {};
        (r.aabne || []).forEach(function (d) { mig.dele[d] = false; });
        if (r.ramme === "skriv") this.lavSkriv(); else this.el.raekker.innerHTML = "";
        this.el.raekker.hidden = r.ramme !== "skriv";
    };

    /* Pladserne: formlen (F_), navnene (N_) og enhederne (E_) */
    P.lavPladser = function () {
        var r = this.runde, pl = {};
        var aabenF = r.aabne.indexOf("formel") >= 0 && r.ramme !== "skriv";
        function ny(id, slags, del, facit, aaben) {
            pl[id] = { id: id, slags: slags, del: del, facit: facit, aaben: aaben, brik: null, x: 0, y: 0, b: 1, h: 1 };
        }
        if (r.ramme === "linje") {
            var kan = r.maal === "m" ? ["m", "n", "·", "M"] : ["M", "m", "/", "n"];
            ny("F_v", "sym", "formel", kan[0], aabenF);
            ny("F_a", "sym", "formel", kan[1], aabenF);
            ny("F_op", "op", "formel", kan[2], aabenF);
            ny("F_b", "sym", "formel", kan[3], aabenF);
        } else {
            ny("F_v", "sym", "formel", "n", aabenF);
            ny("F_t", "sym", "formel", "m", aabenF);
            ny("F_n", "sym", "formel", "M", aabenF);
        }
        RAEKKER.forEach(function (s) {
            ny("N_" + s, "navn", "navn", FACIT_NAVN[s], r.aabne.indexOf("navn") >= 0);
            ny("E_" + s, "enhed", "enhed", D.ENHED_TEKST[s], r.aabne.indexOf("enhed") >= 0 && r.ramme !== "skriv");
        });
        this.pl = pl;
    };

    P.harNyeTal = function () { return false; };
    P.nulstil = function () { this.vaelg(this.nr, true); };

    P.promptHTML = function () {
        return '<p class="maal-tekst">' + NK.html(this.runde.tekst) + "</p>";
    };

    P.opgaveFaerdig = function () {
        var d = this.dele;
        return Object.keys(d).every(function (k) { return d[k]; });
    };

    var DELNAVN = { formel: "formlen", navn: "navnene", enhed: "enhederne" };

    P.trinLinje = function () {
        var r = this.runde, d = this.dele;
        if (r.ramme === "skriv") {
            var f = this.skrivAktivt();
            return f ? "Skriv " + (f.id === "formel" ? "<b>formlen</b> for n." : "<b>enheden</b> for " + f.id + ".") : "";
        }
        if (r.skygge) return "Træk n, m og M fra bunden op på de blege bogstaver.";
        var mangler = Object.keys(d).filter(function (k) { return !d[k]; }).map(function (k) { return DELNAVN[k]; });
        if (!mangler.length) return "";
        if (r.ramme === "linje") return "Byg " + r.maal + " = … med brikkerne.";
        return "Træk brikkerne op: " + mangler.join(" og ") + ".";
    };

    /* ----- Knappen: hint, trekant og svar -------------------------------------------- */
    P.trinInfo = function () {
        var r = this.runde, mig = this;
        if (this.opgaveFaerdig()) return null;
        if (r.ramme === "skriv") {
            var f = this.skrivAktivt();
            if (!f) return null;
            var d = D.SKRIV.filter(function (x) { return x.id === f.id; })[0];
            return { hint: NK.html(d.hint), svar: function () { mig.skrivSvar(); } };
        }
        var hint = r.hint;
        if (this.dele.formel && this.dele.navn === false) hint = D.HINT_DEL.navn;
        else if (this.dele.formel && this.dele.enhed === false) hint = D.HINT_DEL.enhed;
        return { hint: NK.html(hint), hint2: r.trekant && !this.dele.formel ? { maal: r.maal } : null,
                 svar: function () { mig.visSvar(); } };
    };

    /* Vis svaret: de rigtige brikker flyver op, de forkerte gaar hjem */
    P.visSvar = function () {
        var mig = this;
        Object.keys(this.dele).forEach(function (del) {
            if (mig.dele[del]) return;
            mig.pladserI(del).forEach(function (p) {
                var b = p.brik ? mig.brik(p.brik) : null;
                if (b && b.tekst === p.facit) { b.laast = true; return; }
                if (b) mig.hjem(b);
            });
            mig.pladserI(del).forEach(function (p) {
                if (p.brik) return;
                var b = mig.brikker.filter(function (x) { return x.tekst === p.facit && !x.laast && !x.plads; })[0] ||
                        mig.brikker.filter(function (x) { return x.tekst === p.facit && !x.laast; })[0];
                if (!b) return;
                if (b.plads) mig.pl[b.plads].brik = null;
                mig.saetI(b, p, true);
                b.laast = true;
            });
            mig.dele[del] = true;
        });
        this.valgt = null;
        this.efterLoest();
        this.trinLoest("svar", "<b>Svaret:</b> " + NK.html(this.svarTekst()) + ".");
    };

    P.svarTekst = function () {
        var r = this.runde;
        if (r.maal === "m") return "m = n · M";
        if (r.maal === "M") return "M = m / n";
        var t = "n = m / M";
        if (r.aabne.indexOf("navn") >= 0) t += ": n er stofmængde, m er masse, M er molarmasse";
        if (r.aabne.indexOf("enhed") >= 0) t += ", målt i mol, g og g/mol";
        return t;
    };

    P.efterLoest = function () {
        if (this.runde.efter) this.enhedT = 0.001;
    };

    P.slutLinje = function () { return this.runde.faerdig || ""; };

    /* ----- Brikker og pladser ----------------------------------------------------------- */
    P.brik = function (id) {
        for (var i = 0; i < this.brikker.length; i++) if (this.brikker[i].id === id) return this.brikker[i];
        return null;
    };

    P.pladserI = function (del) {
        var pl = this.pl;
        return Object.keys(pl).map(function (k) { return pl[k]; }).filter(function (p) { return p.del === del && p.aaben; });
    };

    /* Brikken flyver til (x, y) */
    function flyv(b, x, y) {
        b.fly = { fx: b.x, fy: b.y, tx: x, ty: y, t: 0 };
    }

    P.hjem = function (b, roed) {
        if (b.plads) { this.pl[b.plads].brik = null; b.plads = null; }
        if (roed) b.roed = 1;
        flyv(b, b.hx, b.hy);
    };

    P.saetI = function (b, p, animer) {
        if (p.brik && p.brik !== b.id) {
            var gammel = this.brik(p.brik);
            if (gammel) this.hjem(gammel);
        }
        if (b.plads && b.plads !== p.id) this.pl[b.plads].brik = null;
        p.brik = b.id;
        b.plads = p.id;
        var x = p.x + (p.b - b.b) / 2, y = p.y + (p.h - b.h) / 2;
        if (animer) flyv(b, x, y);
        else { b.x = x; b.y = y; b.fly = null; }
    };

    /* En brik er sat paa en plads: de blege bogstaver tjekkes med det samme,
       ellers vurderes delen, naar den er fyldt */
    P.placeret = function (b, p) {
        this.pilT = -1;
        if (this.runde.skygge) {
            if (b.tekst === p.facit) {
                b.laast = true; b.groen = 1;
                if (this.pladserI("formel").every(function (q) { return !!q.brik; })) this.delLoest("formel", "ok");
                else this.besked("Den passer. " + this.trinLinje(), "god");
            } else {
                this.hjem(b, true);
                var mM = (b.tekst === "m" && p.facit === "M") || (b.tekst === "M" && p.facit === "m");
                this.besked(mM ? "Lille m og stort M er to forskellige ting. Se det blege bogstav." :
                    "Den passer ikke der. Se det blege bogstav.", "skidt");
            }
            return;
        }
        var del = p.del;
        if (this.pladserI(del).every(function (q) { return !!q.brik; })) this.vurder(del);
    };

    /* ----- Vurderingen af en fyldt del ---------------------------------------------------- */
    P.formelFraPladser = function () {
        var r = this.runde, pl = this.pl, mig = this;
        function t(id) { var b = pl[id].brik ? mig.brik(pl[id].brik) : null; return b ? b.tekst : null; }
        if (r.ramme === "linje") {
            var op = t("F_op") === "·" ? "*" : "/";
            return { venstre: t("F_v"), hoejre: { op: op, a: { s: t("F_a") }, b: { s: t("F_b") } } };
        }
        return { venstre: t("F_v"), hoejre: { op: "/", a: { s: t("F_t") }, b: { s: t("F_n") } } };
    };

    P.vurderFormel = function () {
        var r = this.runde, f = this.formelFraPladser(), maal = r.maal;
        if (T.LOKKER[f.venstre]) return { besked: T.LOKKER[f.venstre] };
        if (f.venstre !== maal) {
            if (r.ramme === "linje") return { besked: "Det er ikke en formel for " + maal + ". Isolér " + maal + ": den skal stå alene på venstre side." };
            return { besked: "Formlen skal give stofmængden n. Den står alene på venstre side." };
        }
        return T.vurder(maal, f.venstre, f.hoejre);
    };

    /* Den rigtige placering, der ligner elevens mest (m = n · M eller m = M · n) */
    P.bedsteFacit = function () {
        var r = this.runde, pl = this.pl, mig = this;
        var ids = r.ramme === "linje" ? ["F_v", "F_a", "F_op", "F_b"] : ["F_v", "F_t", "F_n"];
        var muligheder = [ids.map(function (id) { return pl[id].facit; })];
        if (r.ramme === "linje" && r.maal === "m") muligheder.push(["m", "M", "·", "n"]);
        var bedst = muligheder[0], score = -1;
        muligheder.forEach(function (mu) {
            var s = 0;
            ids.forEach(function (id, i) {
                var b = pl[id].brik ? mig.brik(pl[id].brik) : null;
                if (b && b.tekst === mu[i]) s++;
            });
            if (s > score) { score = s; bedst = mu; }
        });
        var ud = {};
        ids.forEach(function (id, i) { ud[id] = bedst[i]; });
        return ud;
    };

    P.vurder = function (del) {
        var mig = this, besked = null;
        if (del === "formel") {
            var res = this.vurderFormel();
            var facit = this.bedsteFacit();
            this.pladserI("formel").forEach(function (p) {
                var b = mig.brik(p.brik);
                if (res.ok || b.tekst === facit[p.id]) {
                    /* En rigtig formel med m og M byttet i m = n · M: pladsernes facit foelger elevens */
                    if (res.ok) p.facit = b.tekst;
                    b.laast = true;
                    b.groen = 1;
                } else mig.hjem(b, true);
            });
            if (res.ok) this.delLoest("formel", "ok", res.note);
            else besked = res.besked;
        } else {
            this.pladserI(del).forEach(function (p) {
                var b = mig.brik(p.brik);
                if (b.tekst === p.facit) { b.laast = true; b.groen = 1; return; }
                if (!besked) besked = del === "navn" ? SimFormel.navnFejl(p.id.slice(2), b.tekst) : SimFormel.enhedFejl(p.id.slice(2), b.tekst);
                mig.hjem(b, true);
            });
            if (!besked) this.delLoest(del, "ok");
        }
        if (besked) {
            this.rystT = 0.4;
            this.besked(NK.html(besked), "skidt");
        }
    };

    P.delLoest = function (del, maade) {
        this.dele[del] = true;
        this.valgt = null;
        if (this.opgaveFaerdig()) this.efterLoest();
        this.trinLoest(maade);
    };

    SimFormel.navnFejl = function (sym, tekst) {
        if (tekst === "antal partikler") return "Antallet af partikler er stort N. Det er ikke med i denne formel.";
        if (sym === "M" && tekst === "masse") return "Stort M er ikke massen. Massen er lille m.";
        if (sym === "m" && tekst === "molarmasse") return "Lille m er ikke molarmassen. Molarmassen er stort M.";
        if (sym === "n") return "Lille n er ikke " + tekst + ". Hvilken størrelse måles i mol?";
        if (tekst === "stofmængde") return "Stofmængden er lille n, den, der måles i mol.";
        return "Det navn passer ikke til " + sym + ".";
    };

    SimFormel.enhedFejl = function (sym, tekst) {
        if (tekst === "mol/g") return "mol/g er vendt om. Molarmassen er gram pr. mol.";
        if (tekst === "g · mol") return "Molarmassen er gram pr. mol. Pr. skrives med en brøkstreg, ikke et gangetegn.";
        if (sym === "n") return tekst === "g" ? "Gram er massen. Stofmængden tælles i mol." : "Det er molarmassens enhed. Stofmængden er ikke pr. noget.";
        if (sym === "m") return tekst === "mol" ? "Mol er stofmængden. Massen er det, vægten viser." : "Det er molarmassens enhed. Massen er det, vægten viser.";
        if (sym === "M") return tekst === "g" ? "Gram er massen. Molarmassen er massen af 1 mol." : "Mol er stofmængden. Molarmassen er massen af 1 mol.";
        return "Den enhed passer ikke.";
    };

    /* ----- Sidste runde: skriv det hele ------------------------------------------------ */
    P.lavSkriv = function () {
        this.skrivF = D.SKRIV.map(function (d, i) { return { id: d.id, status: i === 0 ? "aktiv" : "laast" }; });
        this.bygSkriv();
    };

    P.skrivAktivt = function () {
        if (!this.skrivF) return null;
        for (var i = 0; i < this.skrivF.length; i++) if (this.skrivF[i].status === "aktiv") return this.skrivF[i];
        return null;
    };

    P.skrivLoest = function (id) {
        return !!this.skrivF && this.skrivF.some(function (f) { return f.id === id && (f.status === "ok" || f.status === "svar"); });
    };

    function skrivFacit(id) { return id === "formel" ? "m / M" : D.ENHED_TEKST[id]; }

    P.bygSkriv = function () {
        var mig = this, vaert = this.el.raekker;
        vaert.innerHTML = "";
        this.skrivF.forEach(function (f, i) {
            var d = D.SKRIV[i];
            var rk = document.createElement("div");
            rk.className = "raekke";
            rk.innerHTML = '<div class="raekke-hoved"><span class="raekke-etiket">' + (i + 1) + ". " + NK.html(d.navn) + '</span></div><div class="felter"></div>';
            var fe = document.createElement("div");
            f.feltEl = fe;
            f.input = null;
            if (f.status === "ok" || f.status === "svar") {
                fe.className = "felt " + f.status;
                fe.innerHTML = '<span class="felt-pre">' + NK.html(d.pre) + '</span><span class="felt-svar"><b>' + NK.html(skrivFacit(f.id)) +
                    '</b></span><span class="felt-maerke">' + (f.status === "ok" ? "✓" : "↩") + "</span>";
            } else {
                var fra = f.status === "aktiv" ? "" : " disabled";
                fe.className = "felt " + f.status;
                fe.innerHTML = '<span class="felt-pre">' + NK.html(d.pre) + '</span><input type="text" autocomplete="off" spellcheck="false" aria-label="' +
                    NK.html(d.navn) + '" placeholder="' + (f.id === "formel" ? "skriv formlen" : "skriv enheden") + '"' + fra + '>' +
                    '<button type="button" class="felt-ok" aria-label="Tjek svaret" tabindex="-1"' + fra + '>↵</button>';
                var inp = fe.querySelector("input");
                inp.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); mig.skrivTjek(); } });
                inp.addEventListener("input", function () { mig.k.skriver(); });
                fe.querySelector(".felt-ok").addEventListener("click", function () { mig.skrivTjek(); });
                f.input = inp;
            }
            rk.querySelector(".felter").appendChild(fe);
            vaert.appendChild(rk);
        });
    };

    P.skrivFokus = function () {
        var f = this.skrivAktivt();
        if (this.runde && this.runde.ramme === "skriv" && f && f.input) {
            try { f.input.focus({ preventScroll: true }); } catch (e) { f.input.focus(); }
        }
    };

    /* Enheden, eleven har skrevet: { ok } eller { besked } */
    SimFormel.tjekEnhed = function (id, raa) {
        var s = String(raa || "").trim();
        if (!s) return { tom: true, besked: "Skriv enheden." };
        if (/muldvarp/i.test(s)) return { muldvarp: true, besked: D.MULDVARP };
        var e = T.normEnhed(s);
        if (e === D.ENHED_TEKST[id]) return { ok: true };
        if (id === "M" && e === "gmol") return { besked: "Gram pr. mol skrives med en brøkstreg: g/mol." };
        if (id === "m" && e === "kg") return { besked: "I kemi vejes der i gram. Molarmassen er jo i g/mol." };
        var brik = { "mol": "mol", "g": "g", "g/mol": "g/mol", "mol/g": "mol/g" }[e];
        if (brik) return { besked: SimFormel.enhedFejl(id, brik) };
        return { besked: "Den enhed kender jeg ikke her. Tryk på Giv hint, hvis du sidder fast." };
    };

    P.skrivTjek = function () {
        var f = this.skrivAktivt();
        if (!f || !f.input) return;
        var raa = f.input.value, svar;
        if (f.id === "formel") svar = T.formel("n", raa);
        else svar = SimFormel.tjekEnhed(f.id, raa);
        if (svar.ok) {
            this.skrivNaeste("ok", svar.note);
            return;
        }
        if (svar.muldvarp) this.visMuldvarp(this.lay ? this.lay.tray.x + this.lay.tray.b / 2 : 100, null);
        if (!svar.tom) {
            f.feltEl.classList.remove("ryst");
            void f.feltEl.offsetWidth;
            f.feltEl.classList.add("ryst");
        }
        this.besked(NK.html(svar.besked), svar.tom ? "gul" : "skidt");
        this.skrivFokus();
    };

    P.skrivSvar = function () { this.skrivNaeste("svar"); };

    P.skrivNaeste = function (maade, note) {
        var f = this.skrivAktivt(), i = this.skrivF.indexOf(f);
        f.status = maade;
        if (i + 1 < this.skrivF.length) this.skrivF[i + 1].status = "aktiv";
        this.bygSkriv();
        var faerdigt = i + 1 >= this.skrivF.length;
        if (faerdigt) { this.dele.formel = true; this.dele.enhed = true; this.efterLoest(); }
        else if (f.id === "formel") this.dele.formel = true;
        var svarHTML = maade === "svar" ? "<b>Svaret:</b> " + NK.html(f.id === "formel" ? "n = m / M" : "enheden for " + f.id + " er " + D.ENHED_TEKST[f.id]) + "." : null;
        this.trinLoest(maade, svarHTML);
        if (note && maade === "ok" && !faerdigt) this.besked(NK.html(note) + " <b>n = m / M</b>. " + this.trinLinje(), "god");
    };

    /* ----- Paaskeaegget: to klik paa mol-brikken ------------------------------------------ */
    P.visMuldvarp = function (x, b) {
        var lay = this.lay;
        if (!lay) return;
        this.muldvarp = { x: b ? b.hx + b.b / 2 : x, y: lay.tray.y + lay.tray.h - 6, t: 0 };
        if (!this.k.inde()) this.kortBesked(NK.html(D.MULDVARP), 4);
        else this.k.svar(NK.html(D.MULDVARP), "", 4);
    };

    /* ----- Musen ------------------------------------------------------------------ */
    function inde(pt, r, m) {
        m = m || 0;
        return pt.x >= r.x - m && pt.x <= r.x + r.b + m && pt.y >= r.y - m && pt.y <= r.y + r.h + m;
    }

    P.brikUnder = function (pt) {
        for (var i = this.brikker.length - 1; i >= 0; i--) {
            var b = this.brikker[i];
            if (!b.laast && inde(pt, b, 2)) return b;
        }
        return null;
    };

    P.pladsUnder = function (pt, slags) {
        var pl = this.pl, bedst = null, mig = this;
        Object.keys(pl).forEach(function (k) {
            var p = pl[k];
            if (!p.aaben || (slags && p.slags !== slags)) return;
            /* En plads, hvor brikken sidder rigtigt og er laast, er optaget */
            if (p.brik && mig.brik(p.brik) && mig.brik(p.brik).laast) return;
            if (inde(pt, p, 10)) bedst = p;
        });
        return bedst;
    };

    P.overScene = function (pt) {
        this.over = null;
        if (!pt || !this.lay) return null;
        var b = this.brikUnder(pt);
        if (b) { this.over = b.id; return "brik"; }
        if (this.pladsUnder(pt)) return "plads";
        return null;
    };

    P.nedScene = function (pt) {
        if (this.faerdig && this.runde.ramme !== "skriv") {
            if (this.brikUnder(pt) || this.pladsUnder(pt)) this.kortBesked("Runden er løst. Knappen i kortet går videre.");
            return false;
        }
        var b = this.brikUnder(pt);
        if (b) {
            this.traekker = { id: b.id, dx: pt.x - b.x, dy: pt.y - b.y, x0: pt.x, y0: pt.y, flyttet: false, fraPlads: b.plads };
            if (b.plads) { this.pl[b.plads].brik = null; b.plads = null; }
            b.fly = null;
            /* Oeverst i bunken, mens den holdes */
            this.brikker.splice(this.brikker.indexOf(b), 1);
            this.brikker.push(b);
            return true;
        }
        var p = this.pladsUnder(pt);
        if (p && this.valgt) {
            var v = this.brik(this.valgt);
            if (v && v.slags === p.slags) { this.saetI(v, p, true); this.valgt = null; this.placeret(v, p); }
            else if (v) this.kortBesked(SimFormel.forkertSlags(v.slags));
            return false;
        }
        if (p && p.brik) return false;
        if (p) { this.kortBesked(this.runde.ramme === "skriv" ? "Skriv i felterne i kortet til højre." : "Træk en brik hen på pladsen, eller klik på en brik og så på pladsen."); return false; }
        if (this.runde.ramme === "skriv") this.kortBesked("Ingen brikker denne gang. Skriv i felterne i kortet til højre.");
        else if (this.lay && inde(pt, this.lay.tray)) this.kortBesked("Træk en brik op på en plads på tavlen.");
        this.valgt = null;
        return false;
    };

    SimFormel.forkertSlags = function (slags) {
        return { sym: "Et bogstav skal stå i formlen.", navn: "Et navn hører til i kolonnen NAVN.",
                 enhed: "En enhed hører til i kolonnen ENHED.", op: "Et regnetegn hører til mellem bogstaverne." }[slags];
    };

    P.flytScene = function (pt) {
        var t = this.traekker;
        if (!t) return;
        var b = this.brik(t.id);
        if (Math.abs(pt.x - t.x0) + Math.abs(pt.y - t.y0) > 5) t.flyttet = true;
        b.x = pt.x - t.dx;
        b.y = pt.y - t.dy;
        var p = this.pladsUnder({ x: b.x + b.b / 2, y: b.y + b.h / 2 });
        this.overPlads = p ? p.id : null;
    };

    P.opScene = function (pt) {
        var t = this.traekker;
        this.traekker = null;
        this.overPlads = null;
        if (!t) return;
        var b = this.brik(t.id);
        if (!t.flyttet) {
            /* Et klik: en brik paa en plads gaar hjem; en brik i bunken vaelges */
            if (t.fraPlads) { this.hjem(b); this.valgt = null; return; }
            var nu = this.tid;
            if (b.tekst === "mol" && this.sidstMol && nu - this.sidstMol < 0.5) { this.visMuldvarp(0, b); this.sidstMol = 0; }
            else if (b.tekst === "mol") this.sidstMol = nu;
            this.valgt = this.valgt === b.id ? null : b.id;
            flyv(b, b.hx, b.hy);
            if (this.valgt) this.kortBesked("Klik nu på den plads, brikken skal hen på.", 3);
            return;
        }
        this.valgt = null;
        var c = { x: b.x + b.b / 2, y: b.y + b.h / 2 };
        var p = this.pladsUnder(c) || this.pladsUnder(pt);
        if (p && p.slags === b.slags) {
            this.saetI(b, p, true);
            this.placeret(b, p);
        } else {
            if (p) this.kortBesked(SimFormel.forkertSlags(b.slags));
            this.hjem(b);
        }
    };

    /* ----- Tid ------------------------------------------------------------------ */
    P.opdaterScene = function (dt) {
        var mig = this;
        this.brikker.forEach(function (b) {
            if (b.fly) {
                b.fly.t = Math.min(1, b.fly.t + dt / 0.28);
                var u = NK.blod(b.fly.t);
                b.x = NK.lerp(b.fly.fx, b.fly.tx, u);
                b.y = NK.lerp(b.fly.fy, b.fly.ty, u);
                if (b.fly.t >= 1) b.fly = null;
            } else if (b.plads && !(mig.traekker && mig.traekker.id === b.id)) {
                var p = mig.pl[b.plads];
                b.x = p.x + (p.b - b.b) / 2;
                b.y = p.y + (p.h - b.h) / 2;
            } else if (!b.plads && !(mig.traekker && mig.traekker.id === b.id)) {
                b.x = b.hx; b.y = b.hy;
            }
            b.roed = Math.max(0, b.roed - dt * 1.4);
            b.groen = Math.max(0, b.groen - dt * 1.2);
        });
        if (this.enhedT > 0 && this.enhedT < 1) this.enhedT = Math.min(1, this.enhedT + dt / 2.4);
        if (this.pilT >= 0) this.pilT += dt;
        if (this.rystT > 0) this.rystT = Math.max(0, this.rystT - dt);
        if (this.muldvarp) {
            this.muldvarp.t += dt;
            if (this.muldvarp.t > 4) this.muldvarp = null;
        }
    };

    /* ----- Layout -------------------------------------------------------------------- */
    P.layout = function () {
        var W = this.L.b, H = this.L.h, r = this.runde, ctx = this.L.ctx, mig = this;
        var baand = this.k.layout(W, H);
        var R = { x: 16, y: 16, b: W - 32, h: Math.max(160, baand.y - 16 - 24) };
        var lay = { W: W, H: H, Hs: baand.y, tavle: R };
        var navne = RAEKKER.map(function (s) { return FACIT_NAVN[s]; });
        var enheder = RAEKKER.map(function (s) { return D.ENHED_TEKST[s]; });
        this.brikker.forEach(function (b) {
            if (b.slags === "navn") navne.push(b.tekst);
            if (b.slags === "enhed") enheder.push(b.tekst);
        });
        function maal(s) {
            var bh = Math.round(s * 0.72), px = NK.klamp(bh * 0.4, 12, 22);
            ctx.font = Tg.font("700", px);
            var bred = function (t) { return ctx.measureText(t).width + 24; };
            var nW = Math.max(s * 1.6, Math.max.apply(null, navne.map(bred)));
            var eW = Math.max(s * 1.15, Math.max.apply(null, enheder.map(bred)));
            var fW = r.ramme === "linje" ? s * 4.7 : s * 2.9;
            var tW = s * 0.9 + nW + s * 0.35 + eW;
            var ts = r.trekant ? NK.klamp(s * 2.3, 80, 150) : 0;
            var trayB = R.b - 20 - (ts ? ts + 16 : 0);
            /* Brikkernes stoerrelse og raekkerne i bunken */
            var x = 0, rk = mig.brikker.length ? 1 : 0;
            mig.brikker.forEach(function (b) {
                var w = b.slags === "sym" ? s : (b.slags === "op" ? Math.round(s * 0.8) : Math.round(b.slags === "navn" ? nW - 6 : eW - 6));
                if (x > 0 && x + w > trayB - 20) { rk++; x = 0; }
                x += w + 10;
            });
            var trayH = rk ? Math.max(rk * (s + 10) + 14, ts ? ts + 12 : 0) : Math.round(s * 0.9);
            var topH = R.h - trayH - 8;
            return { s: s, bh: bh, nW: nW, eW: eW, fW: fW, tW: tW, ts: ts, trayB: trayB, trayH: trayH, topH: topH,
                     ok: fW + s * 0.8 + tW <= R.b * 0.94 && topH >= s * 3.7 };
        }
        var s = NK.klamp(Math.min(R.h * 0.62 / 3.7, R.b / 10.5), 30, 86), m = maal(s);
        for (var i = 0; i < 14 && !m.ok && s > 26; i++) { s *= 0.93; m = maal(s); }
        lay.s = m.s; lay.bh = m.bh;
        s = m.s;
        var topH = m.topH;
        lay.topH = topH;
        lay.tray = { x: R.x + 10, y: R.y + topH + 4, b: R.b - 20, h: m.trayH };
        lay.trayB = m.trayB;
        lay.ts = m.ts;
        /* Skemaet til hoejre og formlen midt i pladsen til venstre for det,
           i hoejde med skemaets midterste raekke */
        var tx0 = R.x + R.b * 0.97 - m.tW;
        var pitch = Math.min((topH - s * 0.85) / 3, s * 1.3);
        var top = R.y + (topH - s * 0.55 - pitch * 3) / 2 + s * 0.55;
        var fx0 = Math.max(R.x + R.b * 0.04, R.x + (tx0 - R.x - m.fW) / 2);
        var fy = top + pitch * 1.5;
        lay.fx0 = fx0; lay.fy = fy;
        var pl = this.pl;
        function saet(id, x, y, b, h) { var p = pl[id]; p.x = x; p.y = y; p.b = b; p.h = h; }
        if (r.ramme === "linje") {
            saet("F_v", fx0, fy - s / 2, s, s);
            lay.lig = { x: fx0 + s * 1.3, y: fy };
            saet("F_a", fx0 + s * 1.6, fy - s / 2, s, s);
            saet("F_op", fx0 + s * 2.75, fy - s / 2, Math.round(s * 0.8), s);
            saet("F_b", fx0 + s * 3.7, fy - s / 2, s, s);
            lay.enhedY = fy + s * 1.0;
        } else {
            saet("F_v", fx0, fy - s / 2, s, s);
            lay.lig = { x: fx0 + s * 1.35, y: fy };
            var fcx = fx0 + s * 2.2;
            saet("F_t", fcx - s / 2, fy - s - s * 0.12, s, s);
            saet("F_n", fcx - s / 2, fy + s * 0.12, s, s);
            lay.broek = { x0: fcx - s * 0.65, x1: fcx + s * 0.65, y: fy };
            lay.enhedY = fy + s * 1.62;
        }
        /* Skemaet */
        lay.tx0 = tx0;
        lay.tHoved = top - s * 0.3;
        RAEKKER.forEach(function (sym, j) {
            var cy = top + pitch * (j + 0.5);
            saet("N_" + sym, tx0 + s * 0.9, cy - m.bh / 2, m.nW, m.bh);
            saet("E_" + sym, tx0 + s * 0.9 + m.nW + s * 0.35, cy - m.bh / 2, m.eW, m.bh);
        });
        lay.symX = tx0 + s * 0.4;
        lay.nX = tx0 + s * 0.9;
        lay.eX = tx0 + s * 0.9 + m.nW + s * 0.35;
        /* Brikkerne i bunken: raekker, der er centreret */
        var rows = [], cur = [], x = 0;
        this.brikker.forEach(function (b) {
            b.b = b.slags === "sym" ? s : (b.slags === "op" ? Math.round(s * 0.8) : Math.round(b.slags === "navn" ? m.nW - 6 : m.eW - 6));
            b.h = b.slags === "sym" || b.slags === "op" ? s : m.bh;
            if (cur.length && x + b.b > m.trayB - 20) { rows.push({ b: cur, w: x - 10 }); cur = []; x = 0; }
            cur.push(b);
            x += b.b + 10;
        });
        if (cur.length) rows.push({ b: cur, w: x - 10 });
        var ty = lay.tray.y + 8;
        rows.forEach(function (row) {
            var xx = lay.tray.x + (m.trayB - row.w) / 2;
            row.b.forEach(function (b) {
                b.hx = xx;
                b.hy = ty + (s - b.h) / 2;
                xx += b.b + 10;
            });
            ty += s + 10;
        });
        /* Brikkerne, der ikke holdes, staar, hvor de hoerer til */
        this.brikker.forEach(function (b) {
            if (b.fly) return;
            if (b.plads) { var p = pl[b.plads]; b.x = p.x + (p.b - b.b) / 2; b.y = p.y + (p.h - b.h) / 2; }
            else { b.x = b.hx; b.y = b.hy; }
        });
        this.lay = lay;
        this.saetAnker("formel", R.x, R.y, tx0 - R.x - 8, topH);
        this.saetAnker("skema", tx0 - 6, R.y + 4, R.x + R.b - tx0 + 2, topH - 4);
        this.saetAnker("bunke", lay.tray.x, lay.tray.y, lay.tray.b, lay.tray.h);
        this.saetAnker("laerer", 0, baand.y, W * 0.45, baand.h);
    };

    /* ----- Tegn ----------------------------------------------------------------------- */
    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay, r = this.runde, mig = this;
        if (!lay) return;
        var s = lay.s, R = lay.tavle;
        this.L.ryd();
        Tg.rum(ctx, lay.W, lay.Hs, lay.Hs);
        Tg.tavle(ctx, R);

        /* Bunken med brikker: et lidt moerkere felt nederst paa tavlen */
        var tr = lay.tray;
        ctx.save();
        ctx.fillStyle = "rgba(60, 72, 90, 0.07)";
        NK.rundtRekt(ctx, tr.x, tr.y, tr.b, tr.h, 8);
        ctx.fill();
        ctx.strokeStyle = "rgba(60, 72, 90, 0.16)";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
        if (r.ramme === "skriv") {
            NK.tekst(ctx, "Ingen brikker denne gang", tr.x + tr.b / 2, tr.y + tr.h / 2, { font: Tg.font("600", NK.klamp(s * 0.3, 12, 16)),
                justering: "center", linje: "middle", farve: "rgba(60, 72, 90, 0.45)" });
        }

        /* Formlen */
        var pl = this.pl;
        var hvidF = r.ramme === "linje" ? null : lay.broek;
        if (r.ramme === "linje") {
            NK.tekst(ctx, "n = m / M", lay.fx0, lay.fy - s * 1.05, { font: Tg.matte(NK.klamp(s * 0.36, 13, 22)), linje: "middle", farve: "#8a93a0" });
        }
        Tg.tegnPaaTavle(ctx, "=", lay.lig.x, lay.lig.y, Math.round(s * 0.6));
        if (hvidF) {
            ctx.save();
            ctx.strokeStyle = "#2a2f36";
            ctx.lineWidth = Math.max(2.5, s * 0.05);
            ctx.lineCap = "round";
            ctx.beginPath();
            ctx.moveTo(hvidF.x0, hvidF.y);
            ctx.lineTo(hvidF.x1, hvidF.y);
            ctx.stroke();
            ctx.restore();
        }
        var skrivF = r.ramme === "skriv" && this.skrivLoest("formel");
        /* Maalene lyser op, mens en brik holdes eller er valgt */
        var holdt = this.traekker ? this.brik(this.traekker.id) : (this.valgt ? this.brik(this.valgt) : null);
        function lys(p) {
            if (mig.overPlads === p.id) return 1;
            return holdt && holdt.slags === p.slags && !p.brik ? 0.45 : 0;
        }
        Object.keys(pl).forEach(function (k) {
            var p = pl[k];
            if (p.del !== "formel") return;
            if (p.aaben) Tg.plads(ctx, p, { lys: lys(p), skygge: r.skygge ? p.facit : "" });
            else if (r.ramme === "skriv" && !skrivF) Tg.plads(ctx, p, {});
            else Tg.plads(ctx, p, { tekst: p.facit });
        });

        /* Skemaet */
        var lille = NK.klamp(s * 0.22, 12, 14);
        Tg.etiket(ctx, "Navn", lay.nX, lay.tHoved, lille);
        Tg.etiket(ctx, "Enhed", lay.eX, lay.tHoved, lille);
        RAEKKER.forEach(function (sym) {
            var pn = pl["N_" + sym], pe = pl["E_" + sym];
            NK.tekst(ctx, sym, lay.symX, pn.y + pn.h / 2 + 1, { font: Tg.matte(Math.round(s * 0.5), "700"), justering: "center", linje: "middle", farve: "#2a2f36" });
            if (pn.aaben) Tg.plads(ctx, pn, { lys: lys(pn) });
            else Tg.plads(ctx, pn, { tekst: pn.facit });
            if (pe.aaben) Tg.plads(ctx, pe, { lys: lys(pe) });
            else if (r.ramme === "skriv" && !mig.skrivLoest(sym)) Tg.plads(ctx, pe, {});
            else Tg.plads(ctx, pe, { tekst: pe.facit });
        });

        /* Linjen med enhederne, naar runden er loest */
        if (r.efter && this.enhedT > 0) {
            var dele = T.ENHEDSLINJE[r.efter];
            var px = NK.klamp(s * 0.34, 13, 22);
            var plads = lay.tx0 - lay.fx0 - 16;
            while (px > 12 && Tg.enhedslinjeBredde(ctx, dele, px) + Tg.enhedslinjeBredde(ctx, [{ t: "Enhederne: " }], px) > plads) px -= 0.5;
            ctx.save();
            var bred = Tg.enhedslinjeBredde(ctx, dele, px) + Tg.enhedslinjeBredde(ctx, [{ t: "Enhederne: " }], px);
            ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
            NK.rundtRekt(ctx, lay.fx0 - 6, lay.enhedY - px * 0.85, bred + 12, px * 1.7, 6);
            ctx.fill();
            ctx.restore();
            var bx = Tg.enhedslinje(ctx, lay.fx0, lay.enhedY, [{ t: "Enhederne: " }], px, 1);
            Tg.enhedslinje(ctx, lay.fx0 + bx, lay.enhedY, dele, px, this.enhedT);
        }

        /* Trekanten i bunkens hoejre side */
        if (this.trekant && lay.ts) {
            Tg.trekant(ctx, tr.x + tr.b - lay.ts - 6, tr.y + (tr.h - Tg.trekantHoejde(lay.ts)) / 2, lay.ts, this.trekant, this.trekantT);
        }

        /* Muldvarpen */
        if (this.muldvarp) {
            var mt = this.muldvarp.t, pop = mt < 0.35 ? mt / 0.35 : (mt > 3.5 ? Math.max(0, (4 - mt) / 0.5) : 1);
            Tg.muldvarp(ctx, this.muldvarp.x, this.muldvarp.y, NK.klamp(s * 0.7, 26, 44), pop);
        }

        /* Brikkerne: den, der holdes, oeverst */
        var ryst = this.rystT > 0 ? Math.sin(this.rystT * 60) * 3 * (this.rystT / 0.4) : 0;
        this.brikker.forEach(function (b) {
            var holdes = mig.traekker && mig.traekker.id === b.id;
            ctx.save();
            if (b.roed > 0.3 && !b.plads) ctx.translate(ryst, 0);
            Tg.brik(ctx, b, { over: mig.over === b.id && !b.laast, valgt: mig.valgt === b.id, roed: b.roed, groen: b.groen,
                laast: b.laast, loeft: holdes ? 1 : 0 });
            ctx.restore();
        });

        /* En lille pil ved foerste brik i foerste runde, til noget er flyttet */
        if (r.skygge && this.pilT >= 0 && this.brikker.length && !this.faerdig) {
            var b0 = this.brikker.filter(function (b) { return !b.plads; })[0];
            if (b0) {
                var hop = Math.sin(this.pilT * 5) * 4;
                var ax = b0.x + b0.b / 2, ay = b0.y - 10 + hop;
                ctx.save();
                ctx.fillStyle = "#e0a82e";
                ctx.beginPath();
                ctx.moveTo(ax, ay);
                ctx.lineTo(ax - 9, ay - 12);
                ctx.lineTo(ax - 3, ay - 12);
                ctx.lineTo(ax - 3, ay - 24);
                ctx.lineTo(ax + 3, ay - 24);
                ctx.lineTo(ax + 3, ay - 12);
                ctx.lineTo(ax + 9, ay - 12);
                ctx.closePath();
                ctx.fill();
                ctx.restore();
            }
        }
        this.k.tegn(ctx);
    };

    NK.SimFormel = SimFormel;
}());
