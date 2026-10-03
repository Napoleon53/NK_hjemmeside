/* =====================================================================
   regning.js - regnestykkerne i panelet

   NK.Regn: ét regnestykke i tre bidder, saadan som eleverne skal
   skrive det (som sc5.1 og sc4.3):

       a = A / c                  1. formlen: eleven vaelger formens
                                     skabelon (□/□, □ · □, □ · □ over □
                                     eller □ − □) og skriver et bogstav
                                     i hvert felt
         = 0,520 / 20,0 µM        2. tallene i de samme felter, med
                                     enheden staaende efter feltet
         = 0,0260 µM⁻¹            3. resultatet

   Broeker staar med en rigtig broekstreg, ogsaa i felterne. Over
   regnestykket staar de tre bidder (Formlen › Tallene › Resultatet).

   NK.TalFelter: kun resultater, én raekke pr. tal (standard 3 til 6,
   spildevandet, de to farvestoffer). Hvert felt tjekkes for sig.

   Begge faar en spec af fanen og melder tilbage med
   fane.delOk(tekst), fane.fejl(tekst) og fane.regnLoest(...).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var F = NK.Formel;
    var T = NK.Tal;

    var FASER = ["formel", "tal", "res"];
    var FASENAVN = { formel: "Formlen", tal: "Tallene ind", res: "Resultatet" };

    /* Formens skabelon med indholdet i hver plads */
    function form(sk, celler) {
        if (sk === "broek") return vbroek(celler[0], celler[1]);
        if (sk === "gange") return celler[0] + '<span class="op">·</span>' + celler[1];
        if (sk === "gangebroek") return vbroek(celler[0] + '<span class="op">·</span>' + celler[1], celler[2]);
        if (sk === "minus") return celler[0] + '<span class="op">−</span>' + celler[1];
        return "";
    }
    function vbroek(t, n) {
        return '<span class="rbroek"><span class="rb-t">' + t + '</span><span class="rb-n">' + n + "</span></span>";
    }

    /* ===================================================================
       ET REGNESTYKKE
       =================================================================== */
    function Regn(boks, spec, fane) {
        this.boks = boks;
        this.spec = spec;
        this.fane = fane;
        this.fase = "formel";
        this.sk = null;
        this.bogst = ["", "", ""];
        this.tal = ["", "", ""];
        this.res = "";
        this.talOk = null;       /* tallene, naar de er rigtige */
        this.resultat = null;
        this.fejlFelt = -1;
        this.byg();
    }
    var P = Regn.prototype;

    P.antal = function () { return this.sk ? F.SKABELONER[this.sk].felter : 0; };

    P.byg = function () {
        var s = this.spec, mig = this;
        var h = '<div class="regn-trin">';
        FASER.forEach(function (f, i) {
            var kl = f === mig.fase ? "aktiv" : (FASER.indexOf(mig.fase) > i || mig.fase === "faerdig" ? "ok" : "");
            h += (i ? '<span class="rt-pil">›</span>' : "") + '<span class="rt ' + kl + '">' + (kl === "ok" ? "✓ " : "") + FASENAVN[f] + "</span>";
        });
        h += "</div>";
        h += '<div class="regn-gitter">';
        /* 1. Formlen */
        h += '<div class="rv">' + F.vis(s.venstre) + " =</div><div class=\"rh\">";
        if (this.fase === "formel") {
            if (!this.sk) {
                h += '<div class="skabeloner">';
                ["broek", "gange", "gangebroek", "minus"].forEach(function (sk) {
                    h += '<button type="button" class="skabelon" data-sk="' + sk + '" title="' + F.SKABELONER[sk].navn + '">' +
                        form(sk, ['<i class="kasse"></i>', '<i class="kasse"></i>', '<i class="kasse"></i>']) + "</button>";
                });
                h += '</div><p class="regn-note">Vælg formens form. Bogstaverne skriver du bagefter.</p>';
            } else {
                var celler = [];
                for (var i = 0; i < this.antal(); i++) {
                    celler.push('<input type="text" class="bogst-felt' + (this.fejlFelt === i ? " forkert" : "") + '" data-i="' + i +
                        '" maxlength="9" autocomplete="off" spellcheck="false" aria-label="Bogstav ' + (i + 1) + '" value="' + NK.html(this.bogst[i]) + '">');
                }
                h += form(this.sk, celler) + ' <button type="button" class="skift" title="Vælg en anden form">↺ form</button>';
            }
        } else {
            h += '<span class="fast">' + form(this.sk, this.spec.felter.map(F.vis)) + "</span>";
        }
        h += "</div>";
        /* 2. Tallene */
        if (this.fase !== "formel") {
            h += '<div class="rv">=</div><div class="rh">';
            if (this.fase === "tal") {
                var tc = [];
                for (var j = 0; j < this.antal(); j++) {
                    var enh = s.enheder[j] ? '<span class="enhed">' + s.enheder[j] + "</span>" : "";
                    tc.push('<span class="talcelle"><input type="text" inputmode="decimal" class="tal-felt' + (this.fejlFelt === j ? " forkert" : "") +
                        '" data-i="' + j + '" autocomplete="off" spellcheck="false" aria-label="' + F.vis(s.felter[j]).replace(/<[^>]+>/g, "") + '" value="' + NK.html(this.tal[j]) + '">' + enh + "</span>");
                }
                h += form(this.sk, tc);
            } else {
                h += '<span class="fast">' + form(this.sk, this.visTal()) + "</span>";
            }
            h += "</div>";
        }
        /* 3. Resultatet */
        if (this.fase === "res" || this.fase === "faerdig") {
            h += '<div class="rv">=</div><div class="rh">';
            if (this.fase === "res") {
                h += '<input type="text" inputmode="decimal" class="tal-felt res-felt' + (this.fejlFelt === 9 ? " forkert" : "") + '" aria-label="Resultatet" autocomplete="off" value="' +
                    NK.html(this.res) + '"> <span class="enhed">' + s.resEnhed + "</span>";
            } else {
                h += '<span class="fast resultat">' + s.visRes(this.resultat) + " " + s.resEnhed + "</span>";
            }
            h += "</div>";
        }
        h += "</div>";
        if (this.fase !== "faerdig" && (this.fase !== "formel" || this.sk)) {
            h += '<div class="regn-knapper"><button type="button" class="knap blaa tjek">Tjek ' + (this.fase === "formel" ? "formlen" : (this.fase === "tal" ? "tallene" : "resultatet")) + "</button></div>";
        }
        this.boks.innerHTML = h;
        this.bindEl();
    };

    P.bindEl = function () {
        var mig = this, b = this.boks;
        Array.prototype.forEach.call(b.querySelectorAll(".skabelon"), function (k) {
            k.addEventListener("click", function () { mig.vaelg(k.getAttribute("data-sk")); });
        });
        var sk = b.querySelector(".skift");
        if (sk) sk.addEventListener("click", function () { mig.sk = null; mig.fejlFelt = -1; mig.byg(); mig.fane.nulstilHjaelp(); });
        Array.prototype.forEach.call(b.querySelectorAll(".bogst-felt"), function (inp) {
            inp.addEventListener("input", function () {
                mig.bogst[parseInt(inp.getAttribute("data-i"), 10)] = inp.value;
                inp.classList.remove("forkert");
            });
        });
        Array.prototype.forEach.call(b.querySelectorAll(".tal-felt"), function (inp) {
            inp.addEventListener("input", function () {
                if (inp.classList.contains("res-felt")) mig.res = inp.value;
                else mig.tal[parseInt(inp.getAttribute("data-i"), 10)] = inp.value;
                inp.classList.remove("forkert");
            });
        });
        var tj = b.querySelector(".tjek");
        if (tj) tj.addEventListener("click", function () { mig.tjek(); });
    };

    P.vaelg = function (sk) {
        this.sk = sk;
        this.bogst = ["", "", ""];
        this.fejlFelt = -1;
        this.byg();
        this.fokus();
        this.fane.nulstilHjaelp();
    };

    P.fokus = function () {
        var felter = this.boks.querySelectorAll("input");
        for (var i = 0; i < felter.length; i++) {
            if (!felter[i].value) { felter[i].focus(); return; }
        }
        if (felter.length) felter[0].focus();
    };

    P.visTal = function () {
        var s = this.spec;
        var v = this.talOk || [];
        var ud = [];
        for (var i = 0; i < this.antal(); i++) {
            ud.push(s.visTal(i, v[i]) + (s.enheder[i] ? " " + s.enheder[i] : ""));
        }
        return ud;
    };

    /* ----- Tjek ----------------------------------------------------------------------- */
    P.tjek = function () {
        if (this.fase === "formel") return this.tjekFormel();
        if (this.fase === "tal") return this.tjekTal();
        if (this.fase === "res") return this.tjekRes();
    };

    P.tjekFormel = function () {
        if (!this.sk) { this.fane.fejl("Vælg først formens form."); return; }
        var felter = [];
        for (var i = 0; i < this.antal(); i++) felter.push(F.norm(this.bogst[i]));
        var dom = F.dom(this.sk, felter, this.spec);
        if (dom.ok) {
            this.fase = "tal";
            this.fejlFelt = -1;
            this.byg();
            this.fokus();
            this.fane.delOk("Rigtig formel. Nu tallene: skriv dem i felterne.");
            return;
        }
        this.fejlFelt = dom.felt === undefined ? -1 : dom.felt;
        this.byg();
        this.fokus();
        this.fane.fejl(this.formelBesked(dom));
    };

    P.formelBesked = function (dom) {
        var s = this.spec;
        var egen = s.formelFejl ? s.formelFejl(dom, this.sk) : null;
        if (egen) return egen;
        if (dom.slags === "tom") return "Skriv et bogstav i hvert felt.";
        if (dom.slags === "ukendt") return "\"" + NK.html(dom.raa) + "\" er ikke en størrelse i opgaven. Skriv fx A, a, c, " + F.vis("c_foer") + " eller " + F.vis("V_efter") + ".";
        if (dom.slags === "hvilkenC") return "Skriv, hvilken c det er: " + F.vis("c_foer") + " eller " + F.vis("c_efter") + ".";
        if (dom.slags === "hvilkenV") return "Skriv, hvilket rumfang det er: " + F.vis("V_foer") + " eller " + F.vis("V_efter") + ".";
        if (dom.slags === "smaaA") return "Lille a er hældningen. Absorbansen skrives med stort A.";
        if (dom.slags === "stortA") return "Stort A er absorbansen. Hældningen skrives med lille a.";
        if (dom.slags === "vendt") return "Brøken er vendt.";
        if (dom.slags === "fremmed") return "Den størrelse hører ikke med i formlen her.";
        if (dom.slags === "form") return "Formlen har ikke den form. Prøv en anden skabelon.";
        return "Den formel passer ikke her.";
    };

    P.tjekTal = function () {
        var v = [];
        for (var i = 0; i < this.antal(); i++) {
            if (!String(this.tal[i]).trim()) { this.fejlFelt = i; this.byg(); this.fokus(); this.fane.fejl("Skriv et tal i hvert felt."); return; }
            var x = T.laes(this.tal[i]);
            if (!isFinite(x)) { this.fejlFelt = i; this.byg(); this.fokus(); this.fane.fejl("\"" + NK.html(this.tal[i]) + "\" er ikke et tal. Brug komma, fx 0,520."); return; }
            v.push(x);
        }
        var dom = this.spec.tjekTal(v);
        if (dom.ok) {
            this.talOk = dom.vaerdier || v;
            this.fase = "res";
            this.fejlFelt = -1;
            this.byg();
            this.fokus();
            this.fane.delOk("Rigtige tal. Regn det ud, og skriv resultatet.");
            return;
        }
        this.fejlFelt = dom.felt === undefined ? -1 : dom.felt;
        this.byg();
        this.fokus();
        this.fane.fejl(dom.besked);
    };

    P.tjekRes = function () {
        if (!String(this.res).trim()) { this.fejlFelt = 9; this.byg(); this.fokus(); this.fane.fejl("Skriv resultatet i feltet."); return; }
        var x = T.laes(this.res);
        if (!isFinite(x)) { this.fejlFelt = 9; this.byg(); this.fokus(); this.fane.fejl("\"" + NK.html(this.res) + "\" er ikke et tal. Brug komma, fx 0,0260."); return; }
        var dom = this.spec.tjekRes(x, this.talOk);
        if (dom.ok) {
            this.resultat = dom.vaerdi;
            this.fase = "faerdig";
            this.fejlFelt = -1;
            this.byg();
            this.fane.regnLoest(this);
            return;
        }
        this.fejlFelt = 9;
        this.byg();
        this.fokus();
        this.fane.fejl(dom.besked);
    };

    /* ----- Hjaelpen ---------------------------------------------------------------------- */
    P.hint = function () {
        var h = this.spec.hint || {};
        if (this.fase === "formel") return h.formel || [];
        if (this.fase === "tal") return h.tal || [];
        return h.res || [];
    };

    /* Vis svaret: den bid, eleven er ved, bliver udfyldt, og naeste bid begynder */
    P.visSvar = function () {
        var s = this.spec;
        if (this.fase === "formel") {
            this.sk = s.sk;
            this.fase = "tal";
            this.fejlFelt = -1;
            this.byg();
            this.fokus();
            return "Formlen er " + F.vis(s.venstre) + " = " + s.formelTekst + ". Skriv nu tallene.";
        }
        if (this.fase === "tal") {
            var sv = s.svarTal();
            this.talOk = sv;
            this.fase = "res";
            this.byg();
            this.fokus();
            return "Tallene er sat ind. Regn det ud, og skriv resultatet.";
        }
        if (this.fase === "res") {
            this.resultat = s.svarRes(this.talOk);
            this.fase = "faerdig";
            this.byg();
            this.fane.regnLoest(this, true);
            return null;
        }
        return null;
    };

    /* Den faerdige beregning som én linje: a = A / c = 0,520 / 20,0 µM = 0,0260 µM⁻¹ */
    P.linje = function () {
        var s = this.spec;
        var t = this.visTal();
        return F.vis(s.venstre) + " = " + form(s.sk, s.felter.map(F.vis)) + " = " + form(s.sk, t) + " = " + s.visRes(this.resultat) + " " + s.resEnhed;
    };

    P.faerdig = function () { return this.fase === "faerdig"; };

    NK.Regn = Regn;
    NK.Regn.form = form;

    /* ===================================================================
       RESULTATFELTER
       felter: [{ id, etiket, venstre, enhed, tjek(v) -> { ok, vaerdi } |
                 { ok:false, besked }, hint: [...], svar() -> tal, vis(v) }]
       =================================================================== */
    function TalFelter(boks, felter, fane) {
        this.boks = boks;
        this.felter = felter;
        this.fane = fane;
        this.vaerdi = felter.map(function () { return ""; });
        this.ok = felter.map(function () { return null; });
        this.fejlFelt = -1;
        this.byg();
    }
    var Q = TalFelter.prototype;

    Q.byg = function () {
        var mig = this;
        var h = '<div class="talfelter">';
        this.felter.forEach(function (f, i) {
            var ok = mig.ok[i] !== null;
            h += '<div class="tf-raekke' + (ok ? " ok" : "") + '">' +
                (f.etiket ? '<span class="tf-etiket">' + f.etiket + "</span>" : "") +
                '<span class="tf-venstre">' + f.venstre + " " + (f.lig || "=") + "</span>";
            if (ok) {
                h += '<span class="fast resultat">' + f.vis(mig.ok[i]) + " " + f.enhed + '</span><span class="tf-flueben">✓</span>';
            } else {
                h += '<input type="text" inputmode="decimal" class="tal-felt' + (mig.fejlFelt === i ? " forkert" : "") + '" data-i="' + i +
                    '" autocomplete="off" aria-label="' + NK.html((f.etiket || "") + " " + f.venstre).replace(/<[^>]+>/g, "") + '" value="' + NK.html(mig.vaerdi[i]) + '">' +
                    ' <span class="enhed">' + f.enhed + "</span>";
            }
            h += "</div>";
        });
        h += "</div>";
        if (!this.faerdig()) h += '<div class="regn-knapper"><button type="button" class="knap blaa tjek">Tjek</button></div>';
        this.boks.innerHTML = h;
        Array.prototype.forEach.call(this.boks.querySelectorAll(".tal-felt"), function (inp) {
            inp.addEventListener("input", function () {
                mig.vaerdi[parseInt(inp.getAttribute("data-i"), 10)] = inp.value;
                inp.classList.remove("forkert");
            });
        });
        var tj = this.boks.querySelector(".tjek");
        if (tj) tj.addEventListener("click", function () { mig.tjek(); });
    };

    Q.fokus = function () {
        var felter = this.boks.querySelectorAll("input");
        for (var i = 0; i < felter.length; i++) {
            if (!felter[i].value || felter[i].classList.contains("forkert")) { felter[i].focus(); return; }
        }
        if (felter.length) felter[0].focus();
    };

    Q.foersteAabne = function () {
        for (var i = 0; i < this.felter.length; i++) if (this.ok[i] === null) return i;
        return -1;
    };

    Q.faerdig = function () { return this.foersteAabne() < 0; };

    /* Hvert udfyldte felt tjekkes. Den foerste fejl faar beskeden. */
    Q.tjek = function () {
        var mig = this, fejl = null, nye = 0, tomme = 0;
        this.fejlFelt = -1;
        this.felter.forEach(function (f, i) {
            if (mig.ok[i] !== null) return;
            var s = String(mig.vaerdi[i]).trim();
            if (!s) { tomme++; return; }
            var x = T.laes(s);
            var dom = isFinite(x) ? f.tjek(x) : { ok: false, besked: "\"" + NK.html(s) + "\" er ikke et tal. Brug komma, fx 4,00." };
            if (dom.ok) { mig.ok[i] = dom.vaerdi; nye++; if (f.efterOk) f.efterOk(dom.vaerdi); }
            else if (!fejl) { fejl = (f.etiket ? f.etiket + ": " : "") + dom.besked; mig.fejlFelt = i; }
        });
        this.byg();
        if (fejl) { this.fokus(); this.fane.fejl(fejl); return; }
        if (this.faerdig()) { this.fane.talLoest(this); return; }
        if (nye) { this.fokus(); this.fane.delOk(nye === 1 ? "Rigtigt. Fortsæt med det næste." : "Rigtigt. Fortsæt med de næste."); return; }
        if (tomme) { this.fokus(); this.fane.fejl("Skriv et tal i feltet."); }
    };

    Q.hint = function () {
        var i = this.foersteAabne();
        return i < 0 ? [] : (this.felter[i].hint || []);
    };

    Q.visSvar = function () {
        var i = this.foersteAabne();
        if (i < 0) return;
        var f = this.felter[i];
        var v = f.svar();
        this.ok[i] = v;
        if (f.efterOk) f.efterOk(v);
        this.byg();
        if (this.faerdig()) this.fane.talLoest(this, true);
        else this.fokus();
        return (f.etiket ? f.etiket + ": " : "") + f.venstre + " = " + f.vis(v) + " " + f.enhed + ".";
    };

    NK.TalFelter = TalFelter;
}());
