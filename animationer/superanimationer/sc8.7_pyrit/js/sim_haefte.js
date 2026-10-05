/* =====================================================================
   sim_haefte.js - fane 2 (Pyrit) og fane 3 (Ristning)

   Begge faner har et haefte paa ternet papir og en tegning over det.
   En opgave er én af tre slags (type i D.OPGAVER):

     afstem   et reaktionsskema afstemmes i smaa bidder:
                ox        oxidationstallet over de maerkede atomer
                redox     (kun Sur regn) er det en redoxreaktion?
                for       (kun med indekstal) lige mange atomer paa klammen
                klammer   stigning ↑ eller fald ↓ ved hver klamme
                gange     gangetallene: stigning i alt = fald i alt
                med       tallet foran det stof, der foelger med
                ladning   ladningen foer og efter pilen
                ion       H⁺
                brint     H-atomerne foer og efter pilen
                vand      H₂O paa den side, der har faerrest H
     sum      de to skemaer for pyrit ganges og laegges sammen
     spm      spoergsmaal til det samlede skema

   Kun den bid, eleven er ved, kan skrives i. Et forkert svar faar en
   besked, der passer til fejlen. Tomme felter taeller som ikke
   besvaret, og det, der foelger med, mens eleven skriver, regnes kun
   af elevens egne tal.

   NK.Fane.paa (js/fane.js) giver listen, knappen og statuslinjen.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var X = NK.Redox;
    var lav = NK.Formel.lav;

    var F = {};

    /* ----- Opstart ------------------------------------------------------------------ */
    F.init = function () {
        var mig = this, navn = this.cfg.navn;
        this.haefte = new NK.Haefte(NK.el(navn + "-haefte"));
        this.haefte.vedEnter = function () { mig.tjekTrin(); };
        this.haefte.vedInput = function (k, inp) { mig.input(k, inp); };
        this.haefte.vedTast = function (k, e) { return mig.tast(k, e); };
        this.haefte.vedPil = function (k) { mig.vendPil(k); };
        this.haefte.vedValg = function (id) { mig.valgt(id, "selv"); };
        this.sumEl = NK.el(navn + "-sumark");
        this.spmEl = NK.el(navn + "-spmark");
        this.papir = NK.el(navn + "-papir");
        this.strimmel = NK.el(navn + "-strimmel");
        this.token = 0;
        this.R = {};
        D.OPGAVER[navn].forEach(function (o) { if (o.type === "afstem") mig.R[o.id] = X.reaktion(o); });
        NK.Scener.byg(this.strimmel, navn);
        this.startFane(D.OPGAVER[navn]);
        this.vaelg(this.startOpgave());
    };

    /* Paa fane 2 sker reaktionerne efter hinanden: den naeste opgave aabner
       foerst, naar den foer er loest */
    F.laast = function (i) {
        return !!this.cfg.iRaekke && i > 0 && !this.status[i - 1].loest;
    };

    F.aktivt = function () { return this.opg.trin[this.opg.nr]; };
    F.naaet = function (t) { var i = this.opg.trin.indexOf(t); return i >= 0 && i <= this.opg.nr; };
    F.forbi = function (t) { var i = this.opg.trin.indexOf(t); return i >= 0 && i < this.opg.nr; };

    /* ----- En ny opgave ------------------------------------------------------------------ */
    F.lavOpgave = function (i) {
        var def = this.opgaver[i];
        this.token++;
        this.haefte.el.hidden = def.type !== "afstem";
        this.sumEl.hidden = def.type !== "sum";
        this.spmEl.hidden = def.type !== "spm";
        if (def.type === "afstem") this.lavAfstem(def);
        else if (def.type === "sum") this.lavSum(def);
        else this.lavSpm(def);
        this.visScene();
    };

    F.lavAfstem = function (def) {
        var R = this.R[def.id];
        var trin = ["ox"];
        if (def.ikkeRedox) trin.push("redox");
        if (R.forafstem) trin.push("for");
        if (R.K.length) trin.push("klammer", "gange");
        if (R.med.length) trin.push("med");
        if (R.miljoe) {
            trin.push("ladning");
            if (R.ion.antal) trin.push("ion");
            trin.push("brint");
            if (R.vand.antal) trin.push("vand");
        }
        var tal = {};
        /* Det, der er givet, staar med blyant fra start */
        R.led.forEach(function (l, n) {
            Object.keys(R.maerker[n]).forEach(function (E) {
                if (R.maerker[n][E] === "givet") tal["ox" + n + "_" + E] = { v: l.st.ox[E], slags: "blyant" };
            });
        });
        this.opg = {
            def: def, R: R, type: "afstem", trin: trin, nr: 0,
            tal: tal,                                         /* fundne tal: { v, slags } */
            pil: R.K.map(function () { return null; }),       /* elevens pile ved klammerne */
            forkert: {},
            koefFaerdig: false
        };
        this.haefte.byg(this.opg);
        this.visHaefte();
    };

    /* Tegningen over haeftet foelger opgaven: foer og efter reaktionen */
    F.visScene = function () {
        NK.Scener.saet(this.strimmel, this.cfg.navn, this.opgaver[this.nr].id, !!this.faerdig);
    };

    /* ----- Teksterne i opgavekortet ------------------------------------------------------ */
    F.visKortEkstra = function () {
        var mig = this, g = this.opg, navn = this.navn, html = "";
        NK.saetTekst(navn + "-tekst", g.def.tekst);
        g.trin.forEach(function (t, i) {
            var n = D.TRIN_NAVN[t] || "Spørgsmål " + (i + 1);
            if (i < g.nr) html += '<span class="tl-trin ok">✓ ' + NK.html(n) + "</span>";
            else if (i === g.nr) html += '<span class="tl-trin nu">' + (i + 1) + ". " + NK.html(n) + "</span>";
        });
        var rest = g.trin.length - g.nr - 1;
        if (g.nr < g.trin.length && g.trin.length > 1) html += '<span class="tl-rest">' + (rest > 0 ? "og " + rest + " mere" : "sidste") + "</span>";
        NK.saetHTML(navn + "-trin", html);

        /* De skemaer, eleven har afstemt, bliver staaende i panelet */
        var linjer = "";
        this.opgaver.forEach(function (o, i) {
            if (!mig.status[i].loest) return;
            if (o.type === "afstem") linjer += '<div class="regn-linje"><span class="rl-navn">' + NK.html(o.kort) + "</span>" + NK.html(X.skemaTekst(mig.R[o.id])) + "</div>";
            if (o.type === "sum") linjer += '<div class="regn-linje svar"><span class="rl-navn">' + NK.html(o.kort) + "</span><b>" + NK.html(mig.sumData(o).slutTekst) + "</b></div>";
        });
        NK.saetHTML(navn + "-skemaer", linjer || '<p class="note-tekst">Her kommer de skemaer, du har afstemt.</p>');
    };

    function ogListe(l) {
        if (l.length < 2) return l.join("");
        return l.slice(0, -1).join(", ") + " og " + l[l.length - 1];
    }

    /* Grundstofferne i de felter, der skal udfyldes i trinnet ox */
    F.oxAtomer = function () {
        var set = [];
        this.noegler("ox").forEach(function (k) {
            var E = k.split("_")[1];
            if (set.indexOf(E) < 0) set.push(E);
        });
        return set;
    };

    /* Klammen, der skal forafstemmes */
    F.forK = function () {
        return this.opg.R.K.filter(function (K) { return !K.fri && (K.pv > 1 || K.ph > 1); })[0];
    };

    /* Grupper med flere klammer fra samme stof */
    F.bundne = function () {
        return this.opg.R.grupper.filter(function (G) { return G.K.length > 1; });
    };

    /* Naeste skridt i hele saetninger (statuslinjen) */
    F.trinLinje = function () {
        var g = this.opg, t = this.aktivt();
        if (g.type === "sum") return this.sumLinje(false);
        if (g.type === "spm") return "Se på oxidationstallene over atomerne, og vælg et svar.";
        var R = g.R, K, st;
        switch (t) {
        case "ox":
            var mangler = this.noegler("ox").filter(function (k) { return !g.tal[k]; }).length;
            if (mangler < this.noegler("ox").length) return "Skriv de sidste oxidationstal, og tryk Enter.";
            return "Skriv oxidationstallet i hvert felt over atomerne, og tryk Enter." +
                (g.def.givet ? " Tallet med blyant er givet." : "");
        case "redox":
            return "Sammenlign oxidationstallene før og efter pilen. Er det en redoxreaktion? Vælg under skemaet.";
        case "for":
            K = this.forK();
            var foran = R.led[K.pv > 1 ? K.v : K.h].st;
            return "Der er " + Math.max(K.nV, K.nH) + " " + K.E + " i " + R.led[K.nV > K.nH ? K.v : K.h].st.tekst + ", men kun " +
                Math.min(K.nV, K.nH) + " i " + foran.tekst + ". Skriv et tal foran " + foran.tekst + ", så der er lige mange " + K.E + ".";
        case "klammer":
            var flere = R.K.filter(function (k) { return k.antal > 1; }).map(function (k) { return k.antal + " " + k.E; });
            return "Klik på pilen ved hver klamme, så den peger op eller ned, og skriv, hvor meget tallet stiger eller falder." +
                (flere.length ? " Tæl alle atomerne på klammen med: " + ogListe(flere) + "." : "");
        case "gange":
            var b = this.bundne()[0];
            if (b) {
                st = R.led[b.led].st;
                return "Skriv et gangetal foran hver pil, så stigning i alt bliver lige så stor som fald i alt. " +
                    ogListe(b.K.map(function (k) { return k.E; })) + " sidder i samme " + st.tekst + " og skal have samme tal.";
            }
            return "Skriv et gangetal foran hver pil, så stigning gange tal bliver lige så meget som fald gange tal. Brug de mindste tal.";
        case "med":
            var m = R.med[0];
            return m.E + " skifter ikke, men skal også gå op. Tæl " + m.E + " " + (R.led[m.led].side === "h" ? "før" : "efter") +
                " pilen, og skriv tallet foran " + R.led[m.led].st.tekst + ".";
        case "ladning":
            return "Tallene står nu foran formlerne. Læg ladningerne sammen på hver side af pilen, og skriv dem i rækken Ladning.";
        case "ion":
            return "Der dannes syre, så ladningen afstemmes med H⁺. Skriv antallet af H⁺ på den side, hvor ladningen er lavest.";
        case "brint":
            return "Tæl H-atomerne på hver side af pilen, og skriv dem i rækken H-atomer." + (R.ion.antal ? " Tæl H i H⁺ med." : "");
        case "vand":
            return "Hvert H₂O har 2 H. Skriv antallet af H₂O på den side, der har færrest H.";
        }
        return "";
    };

    /* Den helt korte udgave: staar oeverst paa papiret, hvor oejnene er */
    F.kortLinje = function () {
        var g = this.opg, R = g.R, d = g.def, K;
        if (this.faerdig) return d.navn + (d.ikkeRedox ? ": ikke en redoxreaktion ✓" : ": afstemt ✓");
        switch (this.aktivt()) {
        case "ox": return "Skriv oxidationstallene for " + ogListe(this.oxAtomer()) + " i skemaet";
        case "redox": return "Er det en redoxreaktion?";
        case "for":
            K = this.forK();
            return "Skriv et tal foran " + R.led[K.pv > 1 ? K.v : K.h].st.tekst + ", så der er lige mange " + K.E;
        case "klammer": return "Skriv stigningen ↑ eller faldet ↓ ved hver klamme";
        case "gange": return "Skriv et gangetal foran hver pil, så stigning og fald bliver lige store";
        case "med": return "Skriv tallet foran " + R.led[R.med[0].led].st.tekst + ", så " + R.med[0].E + " går op";
        case "ladning": return "Skriv ladningen på hver side af pilen";
        case "ion": return "Afstem ladningen med H⁺";
        case "brint": return "Tæl H-atomerne på hver side af pilen";
        case "vand": return "Afstem H-atomerne med H₂O";
        }
        return d.navn;
    };

    /* ----- Haeftet: det, der skal vises lige nu ------------------------------------------------- */
    F.noegler = function (t) {
        var g = this.opg, R = g.R, ud = [];
        if (g.type === "sum") return this.sumNoegler(t);
        if (g.type !== "afstem") return [];
        switch (t) {
        case "ox":
            R.led.forEach(function (l, n) {
                l.st.atomer.forEach(function (a) {
                    var k = "ox" + n + "_" + a.s;
                    if (R.maerker[n][a.s] === "felt" && ud.indexOf(k) < 0) ud.push(k);
                });
            });
            return ud;
        case "for":
            R.K.forEach(function (K) {
                if (K.fri) return;
                if (K.pv > 1) ud.push("for" + K.v);
                if (K.ph > 1) ud.push("for" + K.h);
            });
            return ud;
        case "klammer": return R.K.map(function (K, k) { return "kl" + k; });
        case "gange": return R.K.map(function (K, k) { return "g" + k; });
        case "med": return R.med.map(function (m) { return "for" + m.led; });
        case "ladning": return ["lad-v", "lad-h"];
        case "ion": return ["ion-v", "ion-h"];
        case "brint": return ["brint-v", "brint-h"];
        case "vand": return ["vand-v", "vand-h"];
        }
        return [];
    };

    /* Har den bid, eleven er ved, felter? (saa vises knappen Tjek) */
    F.harFelter = function () {
        if (this.faerdig || !this.opg) return false;
        return this.noegler(this.aktivt()).length > 0;
    };

    F.inp = function (k) {
        if (this.opg.type === "sum") return this.sf[k] ? this.sf[k].inp : null;
        return this.haefte.inp(k);
    };

    F.vaerdi = function (k) { var i = this.inp(k); return i ? i.value : ""; };

    /* Et tal, eleven har skrevet (men ikke faaet tjekket) */
    F.skrevet = function (k) {
        var v = X.laesTal(this.vaerdi(k));
        return v === null || isNaN(v) ? null : v;
    };

    /* Tomt giver null, noget ulaeseligt NaN */
    F.laest = function (k) {
        var v = this.skrevet(k);
        return v === null && this.vaerdi(k).trim() ? NaN : v;
    };

    F.erMed = function (i) {
        return this.opg.R.med.some(function (m) { return m.led === i; });
    };

    F.visning = function () {
        var mig = this, g = this.opg, R = g.R, t = this.faerdig ? null : this.aktivt();
        var aktiv = t ? this.noegler(t).filter(function (k) { return !g.tal[k]; }) : [];
        return {
            navn: this.kortLinje(),
            faerdig: this.faerdig,
            aktiv: aktiv,
            tal: function (k) { return g.tal[k] || null; },
            koef: function (i) {
                var f = g.tal["for" + i];
                if (mig.erMed(i)) return f ? { tekst: f.v === 1 ? "" : String(f.v), slags: f.slags } : { tekst: "" };
                if (g.koefFaerdig) {
                    var k = R.koef[i];
                    return { tekst: k === 1 ? "" : String(k), slags: g.tal.g0 && g.tal.g0.slags === "vist" ? "vist" : "ok" };
                }
                if (f) return { tekst: String(f.v), slags: "blyant" };
                return { tekst: "" };
            },
            klammer: this.naaet("klammer"),
            pil: function (k) { return g.pil[k]; },
            pilLaast: function (k) { return !!g.tal["kl" + k]; },
            gange: this.naaet("gange"),
            prod: function (k) {
                var K = R.K[k];
                if (g.tal["g" + k]) return { tekst: "= " + g.tal["g" + k].v * K.tot, slags: "ok" };
                if (t !== "gange") return { tekst: "" };
                var v = mig.skrevet("g" + k);
                if (v === null || v <= 0) return { tekst: "" };
                var s = mig.gangeSum();
                return { tekst: "= " + v * K.tot, slags: s.alle && s.op === s.ned ? "lige" : "vent" };
            },
            ekstra: function (slags, side) {
                if (!R.miljoe || !mig.naaet(slags)) return "";
                if (mig.forbi(slags) || mig.faerdig) return R[slags].side === side ? "tal" : "";
                return "felt";
            },
            rad: function (r) {
                if (r === "lad") return mig.naaet("ladning");
                if (r === "brint") return mig.naaet("brint");
                return !!mig.faerdig && !!(R.slut.v.O || R.slut.h.O);
            },
            celle: function (r, side) { return mig.celle(r, side); },
            valg: t === "redox" ? [
                { id: "ja", tekst: "Redoxreaktion", forkert: !!g.forkert.ja },
                { id: "nej", tekst: "Ikke en redoxreaktion", forkert: !!g.forkert.nej }
            ] : null
        };
    };

    /* Stigning og fald i alt med de gangetal, eleven har skrevet */
    F.gangeSum = function () {
        var mig = this, s = { op: 0, ned: 0, alle: true };
        this.opg.R.K.forEach(function (K, k) {
            var v = mig.opg.tal["g" + k] ? mig.opg.tal["g" + k].v : mig.skrevet("g" + k);
            if (v === null || v <= 0) { s.alle = false; return; }
            s[K.op ? "op" : "ned"] += v * K.tot;
        });
        return s;
    };

    /* Teksten i en celle under skemaet. Efter H⁺ og vand vises det nye
       tal efter en pil: 0 → 4. Mens eleven skriver, er det nye tal gult,
       og det regnes kun af elevens eget tal. */
    F.celle = function (r, side) {
        var g = this.opg, R = g.R, t = this.faerdig ? null : this.aktivt();
        /* O-raekken er kontrollen til sidst: den kommer af sig selv */
        if (r === "ilt") return this.faerdig ? { html: String(R.slut[side].O || 0) + " ✓", slags: "ok" } : null;
        var noegle = r + "-" + side, fundet = g.tal[noegle];
        if (!fundet) return null;
        var html = String(r === "lad" ? X.lad(fundet.v) : fundet.v), slags = fundet.slags;
        var ekstra = r === "lad" ? "ion" : "vand";
        var stk = r === "lad" ? R.ionSt.q : 2;
        if (this.forbi(ekstra) || (this.faerdig && R[ekstra].side)) {
            if (R[ekstra].side === side) {
                var ny = fundet.v + R[ekstra].antal * stk;
                html += ' <span class="pil">→</span> ' + (r === "lad" ? X.lad(ny) : ny);
            }
            html += " ✓";
        } else if (t === ekstra) {
            var n = this.skrevet(ekstra + "-" + side);
            if (n) html += ' <span class="pil">→</span> <span class="vent">' + (r === "lad" ? X.lad(fundet.v + n * stk) : fundet.v + n * stk) + "</span>";
        } else if (this.forbi(r === "lad" ? "ladning" : "brint") && !R[ekstra].side) {
            html += " ✓";
        }
        return { html: html, slags: slags };
    };

    F.visHaefte = function () {
        this.haefte.visTilstand(this.visning());
    };

    F.vis = function () {
        var t = this.opg.type;
        if (t === "afstem") this.visHaefte();
        else if (t === "sum") this.visSum();
        else this.visSpm();
        this.visScene();
    };

    /* ----- Hvad eleven goer i haeftet ---------------------------------------------------------- */
    F.input = function (k, inp) {
        var g = this.opg;
        if (/^kl\d/.test(k)) {
            /* Et fortegn eller en pil i feltet vender pilen */
            var s = inp.value, nr = +k.slice(2), ny = s;
            if (/^[+↑]/.test(s)) { g.pil[nr] = true; ny = s.slice(1); }
            else if (/^[-−–↓]/.test(s)) { g.pil[nr] = false; ny = s.slice(1); }
            if (ny !== s) inp.value = ny;
        }
        this.vis();
    };

    F.tast = function (k, e) {
        if (!/^kl\d/.test(k)) return false;
        var nr = +k.slice(2);
        if (e.key === "ArrowUp") { this.opg.pil[nr] = true; this.visHaefte(); return true; }
        if (e.key === "ArrowDown") { this.opg.pil[nr] = false; this.visHaefte(); return true; }
        return false;
    };

    F.vendPil = function (k) {
        var g = this.opg;
        if (this.faerdig || this.aktivt() !== "klammer" || g.tal["kl" + k]) return;
        g.pil[k] = g.pil[k] === true ? false : true;
        this.visHaefte();
        this.haefte.fokus("kl" + k);
    };

    /* ----- Redoxreaktion eller ej (Sur regn) ------------------------------------------------- */
    F.valgt = function (id, maade) {
        var g = this.opg;
        if (this.faerdig || g.type !== "afstem" || this.aktivt() !== "redox") return;
        if (id === "nej") { this.loesTrin(maade, "", ""); return; }
        g.forkert[id] = true;
        this.visHaefte();
        var atomer = this.noegler("ox").map(function (k) { return g.tal[k]; });
        this.fejlLinje("I en redoxreaktion skifter mindst ét atom oxidationstal. Her er tallet " + X.ox(atomer[0].v) + " både før og efter pilen.");
    };

    /* ----- Tjek den bid, eleven er ved ------------------------------------------------------ */
    F.tjekTrin = function () {
        if (this.faerdig || this.mellem) return;
        var g = this.opg;
        if (g.type === "sum") { this.tjekSum(); return; }
        if (g.type === "spm") { this.kortBesked("Vælg et af svarene på papiret.", 3); return; }
        switch (this.aktivt()) {
        case "ox": this.tjekOx(); return;
        case "redox": this.kortBesked("Vælg et af de to svar under skemaet.", 3); return;
        case "for": this.tjekFor(); return;
        case "klammer": this.tjekKlammer(); return;
        case "gange": this.tjekGange(); return;
        case "med": this.tjekMed(); return;
        case "ladning": this.tjekLad(); return;
        case "ion": this.tjekIon(); return;
        case "brint": this.tjekBrint(); return;
        case "vand": this.tjekVand(); return;
        }
    };

    F.rystFelt = function (k) {
        if (this.opg.type === "sum") {
            var f = this.sf[k];
            if (!f) return;
            f.felt.classList.remove("fejl");
            void f.felt.offsetWidth;
            f.felt.classList.add("fejl");
            return;
        }
        this.haefte.ryst(k);
    };

    F.fokusNoegle = function (k) {
        var i = this.inp(k);
        if (i && !i.parentNode.hidden && document.activeElement !== i) {
            try { i.focus({ preventScroll: true }); } catch (e) { i.focus(); }
        }
    };

    /* Felterne i en bid, der tjekkes hver for sig. laes(k) giver det
       skrevne, rigtig(k) det rigtige tal, fejl(k, v) beskeden. */
    F.tjekHver = function (t, laes, rigtig, fejl, tomTekst, ros) {
        var mig = this, g = this.opg, forste = null, noget = false;
        this.noegler(t).forEach(function (k) {
            if (g.tal[k]) return;
            var v = laes(k);
            if (v === null) return;
            noget = true;
            if (v === rigtig(k)) { g.tal[k] = { v: v, slags: "ok" }; return; }
            if (!forste) forste = { k: k, tekst: fejl(k, v) };
            mig.rystFelt(k);
        });
        var mangler = this.noegler(t).filter(function (k) { return !g.tal[k]; });
        if (!mangler.length) { this.loesTrin("selv", ros ? ros() : ""); return; }
        this.vis();
        if (forste) { this.fejlLinje(forste.tekst); this.fokusNoegle(forste.k); return; }
        if (!noget) { this.fejlLinje(tomTekst); this.fokusNoegle(mangler[0]); return; }
        this.godLinje(this.trinLinje());
        this.fokusNoegle(mangler[0]);
    };

    /* "ox3_S" -> { led, E, st } */
    F.oxNoegle = function (k) {
        var to = k.slice(2).split("_");
        return { led: +to[0], E: to[1], st: this.opg.R.led[+to[0]].st };
    };

    F.tjekOx = function () {
        var mig = this, g = this.opg;
        this.tjekHver("ox",
            function (k) { return X.laesOx(mig.vaerdi(k)); },
            function (k) { var o = mig.oxNoegle(k); return o.st.ox[o.E]; },
            function (k, v) { var o = mig.oxNoegle(k); return X.oxFejl(o.st, o.E, v); },
            "Skriv et oxidationstal i feltet over atomet, fx +VI, −II eller 0.",
            function () { return g.def.efterOx || ""; });
    };

    F.ledK = function (i) {
        return this.opg.R.K.filter(function (K) { return !K.fri && (K.v === i || K.h === i); })[0];
    };

    F.tjekFor = function () {
        var mig = this, R = this.opg.R;
        this.tjekHver("for",
            function (k) { return mig.laest(k); },
            function (k) { var i = +k.slice(3), K = mig.ledK(i); return i === K.v ? K.pv : K.ph; },
            function (k, v) {
                var i = +k.slice(3), K = mig.ledK(i), st = R.led[i].st, n = st.el[K.E];
                var anden = R.led[i === K.v ? K.h : K.v].st, m = anden.el[K.E];
                if (isNaN(v) || v < 1) return "Skriv et helt tal foran " + st.tekst + ".";
                return "Med " + v + " " + st.tekst + " er der " + v * n + " " + K.E + " på den side, men " + m + " " + K.E + " i " + anden.tekst + ".";
            },
            "Skriv et tal i feltet foran formlen.",
            null);
    };

    F.tjekKlammer = function () {
        var mig = this, g = this.opg, R = g.R, forste = null, noget = false;
        R.K.forEach(function (K, k) {
            var noegle = "kl" + k;
            if (g.tal[noegle]) return;
            var op = g.pil[k], n = mig.laest(noegle);
            if (op === null && n === null) return;
            noget = true;
            var f = X.klammeFejl(K, op, n);
            if (!f) { g.tal[noegle] = { v: K.tot, slags: "ok" }; return; }
            if (!forste) forste = { k: noegle, tekst: f };
            mig.haefte.ryst(noegle);
        });
        var mangler = this.noegler("klammer").filter(function (k) { return !g.tal[k]; });
        if (!mangler.length) { this.loesTrin("selv", ""); return; }
        this.visHaefte();
        if (forste) { this.fejlLinje(forste.tekst); this.haefte.fokus(forste.k); return; }
        if (!noget) { this.fejlLinje("Klik på pilen ved klammen, så den peger op eller ned, og skriv tallet ved siden af."); this.haefte.fokus(mangler[0]); return; }
        this.godLinje(mangler.length > 1 ? "Nu de andre klammer." : "Nu den sidste klamme.");
        this.haefte.fokus(mangler[0]);
    };

    /* "2 · 14 = 28" eller "1 · 2 + 1 · 4 = 6" med de tal, eleven skrev */
    function sumTekst(R, tal, op) {
        var dele = [], sum = 0;
        R.K.forEach(function (K, k) {
            if (K.op !== op) return;
            dele.push(tal[k] + " · " + K.tot);
            sum += tal[k] * K.tot;
        });
        return dele.join(" + ") + " = " + sum;
    }

    F.tjekGange = function () {
        var mig = this, g = this.opg, R = g.R, tal = [], tom = [], daarlig = false;
        R.K.forEach(function (K, k) {
            if (!mig.vaerdi("g" + k).trim()) { tom.push(k); return; }
            tal[k] = mig.skrevet("g" + k);
            if (tal[k] === null || tal[k] <= 0) daarlig = true;
        });
        if (tom.length) {
            tom.forEach(function (k) { mig.haefte.ryst("g" + k); });
            this.fejlLinje("Skriv et tal foran hver pil. Skriv 1, hvis tallet er 1.");
            this.haefte.fokus("g" + tom[0]);
            return;
        }
        if (daarlig) { this.fejlLinje("Skriv et helt tal, der er større end 0."); return; }
        var uens = this.bundne().filter(function (G) {
            return G.K.some(function (K) { return tal[K.nr] !== tal[G.K[0].nr]; });
        })[0];
        if (uens) {
            uens.K.forEach(function (K) { mig.haefte.ryst("g" + K.nr); });
            this.fejlLinje(ogListe(uens.K.map(function (K) { return K.E; })) + " sidder i samme " + R.led[uens.led].st.tekst +
                ". Tallet foran " + R.led[uens.led].st.tekst + " gælder dem begge, så de skal have samme gangetal.");
            return;
        }
        var s = this.gangeSum();
        if (s.op !== s.ned) {
            R.K.forEach(function (K, k) { mig.haefte.ryst("g" + k); });
            this.fejlLinje("Stigning: " + sumTekst(R, tal, true) + ". Fald: " + sumTekst(R, tal, false) + ". De to tal skal være lige store.");
            return;
        }
        var d = tal.reduce(function (a, b) { return NK.gcd(a, b); });
        if (d > 1) { this.fejlLinje("Det går op, men alle tallene kan deles med " + d + ". Brug de mindste tal."); return; }
        R.K.forEach(function (K, k) { g.tal["g" + k] = { v: tal[k], slags: "ok" }; });
        this.loesTrin("selv", "Der flytter " + R.elektroner + " elektroner.");
    };

    F.tjekMed = function () {
        var mig = this, R = this.opg.R;
        function m(k) { var i = +k.slice(3); return R.med.filter(function (x) { return x.led === i; })[0]; }
        this.tjekHver("med",
            function (k) { return mig.laest(k); },
            function (k) { return m(k).koef; },
            function (k, v) {
                var x = m(k), st = R.led[x.led].st, n = st.el[x.E];
                var hvor = R.led[x.led].side === "h" ? ["efter", "før"] : ["før", "efter"];
                if (isNaN(v) || v < 1) return "Skriv et helt tal foran " + st.tekst + ".";
                return "Med " + v + " " + st.tekst + " er der " + v * n + " " + x.E + " " + hvor[0] + " pilen, men " + x.antal + " " + x.E + " " + hvor[1] + " pilen.";
            },
            "Skriv et tal i feltet foran formlen.",
            null);
    };

    F.tjekLad = function () {
        var mig = this, R = this.opg.R;
        this.tjekHver("ladning",
            function (k) { return mig.laest(k); },
            function (k) { return R.ladning[k.slice(4)]; },
            function (k, v) { return mig.ladFejl(k.slice(4), v); },
            "Skriv ladningen som et tal med fortegn, fx +8 eller −4. Skriv 0, hvis der ingen ladning er.",
            null);
    };

    F.ladFejl = function (side, svar) {
        var R = this.opg.R, uden = 0, eks = null, rigtig = R.ladning[side];
        if (svar === null || isNaN(svar)) return "Skriv ladningen som et tal med fortegn, fx +8 eller −4.";
        R.led.forEach(function (l, i) {
            if (l.side !== side) return;
            uden += l.st.q;
            if (!eks && R.koef[i] > 1 && l.st.q) eks = R.koef[i] + " " + l.st.tekst + " har ladningen " + R.koef[i] + " · " + X.talP(l.st.q) + " = " + X.lad(R.koef[i] * l.st.q) + ".";
        });
        var hvor = side === "v" ? "Før pilen" : "Efter pilen";
        if (rigtig === 0) return hvor + ": ingen af stofferne har en ladning, så summen er 0.";
        if (svar === uden && eks) return hvor + ": husk tallene foran. " + eks;
        if (svar === -rigtig) return hvor + ": tjek fortegnene.";
        return hvor + ": gang hver ladning med tallet foran, og læg sammen.";
    };

    F.ryst2 = function (slags) { this.haefte.ryst(slags + "-v"); this.haefte.ryst(slags + "-h"); };

    F.tjekIon = function () {
        var g = this.opg, R = g.R, rig = R.ion, ion = R.ionSt.tekst;
        var a = this.laest("ion-v"), b = this.laest("ion-h");
        var n = { v: a || 0, h: b || 0 };
        if ((a !== null && isNaN(a)) || (b !== null && isNaN(b)) || n.v < 0 || n.h < 0) { this.fejlLinje("Skriv antallet som et helt tal."); return; }
        var anden = rig.side === "v" ? "h" : "v";
        if (n[rig.side] === rig.antal && !n[anden]) {
            g.tal["ion-" + rig.side] = { v: rig.antal, slags: "ok" };
            this.loesTrin("selv", "");
            return;
        }
        var q0 = R.ladning;
        if (n.v > 0 && n.h > 0) { this.ryst2("ion"); this.fejlLinje("Kun på den ene side. " + ion + " på begge sider går ud mod hinanden."); return; }
        if (!n.v && !n.h) { this.ryst2("ion"); this.fejlLinje("Skriv antallet af " + ion + " i feltet på den side, hvor de skal stå."); return; }
        if (n[anden] > 0) {
            this.haefte.ryst("ion-" + anden);
            this.fejlLinje(ion + " er positive. Før pilen er ladningen " + X.lad(q0.v) + ", og efter pilen er den " + X.lad(q0.h) +
                ". " + ion + " skal på den side, hvor ladningen er lavest.");
            return;
        }
        var q1 = X.ladninger(R, R.koef, { side: rig.side, antal: n[rig.side] });
        this.haefte.ryst("ion-" + rig.side);
        this.fejlLinje("Nu er ladningen " + X.lad(q1.v) + " før pilen og " + X.lad(q1.h) + " efter. Der er " +
            Math.abs(q1.v - q1.h) + " " + ion + " for " + (n[rig.side] > rig.antal ? "mange" : "få") + ".");
    };

    /* H-atomerne: vandet afstemmer H, som man goer i Danmark */
    F.tjekBrint = function () {
        var mig = this, R = this.opg.R;
        this.tjekHver("brint",
            function (k) { return mig.laest(k); },
            function (k) { return R.foer[k.slice(6)].H || 0; },
            function (k, v) { return mig.brintFejl(k.slice(6), v); },
            "Skriv antallet af H-atomer på hver side. Skriv 0, hvis der ingen er.",
            null);
    };

    F.brintFejl = function (side, v) {
        var R = this.opg.R, uden = 0, eks = null, rigtig = R.foer[side].H || 0;
        if (v === null || isNaN(v)) return "Skriv antallet af H som et helt tal.";
        R.led.forEach(function (l, i) {
            var n = l.st.el.H || 0;
            if (l.side !== side || !n) return;
            uden += n;
            if (!eks && R.koef[i] > 1) eks = R.koef[i] + " " + l.st.tekst + " har " + R.koef[i] + " · " + n + " = " + R.koef[i] * n + " H.";
        });
        var ionH = R.ion.side === side ? R.ion.antal : 0;
        var hvor = side === "v" ? "Før pilen" : "Efter pilen";
        if (rigtig === 0) return hvor + ": ingen af formlerne har H i sig.";
        if (ionH && v === rigtig - ionH) return hvor + ": husk H i " + R.ion.antal + " " + R.ionSt.tekst + ".";
        if (eks && (v === uden || v === uden + ionH)) return hvor + ": husk tallene foran. " + eks;
        return hvor + ": gang antallet af H i hver formel med tallet foran, og læg sammen.";
    };

    F.tjekVand = function () {
        var g = this.opg, R = g.R, rig = R.vand;
        var a = this.laest("vand-v"), b = this.laest("vand-h");
        var w = { v: a || 0, h: b || 0 };
        if ((a !== null && isNaN(a)) || (b !== null && isNaN(b)) || w.v < 0 || w.h < 0) { this.fejlLinje("Skriv antallet som et helt tal."); return; }
        var anden = rig.side === "v" ? "h" : "v";
        if (w[rig.side] === rig.antal && !w[anden]) {
            g.tal["vand-" + rig.side] = { v: rig.antal, slags: "ok" };
            this.loesTrin("selv", "");
            return;
        }
        var t0 = R.foer;
        if (w.v > 0 && w.h > 0) { this.ryst2("vand"); this.fejlLinje("Kun på den ene side. Vand på begge sider går ud mod hinanden."); return; }
        if (!w.v && !w.h) { this.ryst2("vand"); this.fejlLinje("Skriv antallet af H₂O i feltet på den side, der mangler H."); return; }
        if (w[anden] > 0) {
            this.haefte.ryst("vand-" + anden);
            this.fejlLinje("Vandet skal på den side, der har færrest H. Før pilen er der " + (t0.v.H || 0) + " H, og efter pilen er der " + (t0.h.H || 0) + ".");
            return;
        }
        var nu = (t0[rig.side].H || 0) + 2 * w[rig.side], andenH = t0[anden].H || 0;
        this.haefte.ryst("vand-" + rig.side);
        if (w[rig.side] === 2 * rig.antal) {
            this.fejlLinje("Hvert H₂O har 2 H. Så skal der kun halvt så mange H₂O, som der mangler H.");
            return;
        }
        this.fejlLinje("Nu er der " + nu + " H " + (rig.side === "v" ? "før" : "efter") + " pilen og " + andenH + " " + (rig.side === "v" ? "efter" : "før") + ". Hvert H₂O giver 2 H.");
    };

    /* ----- En bid er loest --------------------------------------------------------------- */
    F.loesTrin = function (maade, ros, svarTekst) {
        var g = this.opg, t = this.aktivt();
        g.nr++;
        this.hjaelp = 0;
        this.pegKnap = false;
        this.efterTrin(t);
        if (g.nr >= g.trin.length) {
            this.faerdig = true;
            this.vis();
            this.loest(maade, (maade === "svar" && svarTekst ? svarTekst + " " : "") + this.slutLinje());
            return;
        }
        this.vis();
        this.visKort();
        var naeste = this.trinLinje();
        if (maade === "svar") this.svarLinje((svarTekst ? svarTekst + " " : "") + naeste);
        else this.godLinje((ros ? ros + " " : "") + naeste);
        this.startTrin();
        this.fokus();
    };

    F.slutLinje = function () {
        var g = this.opg;
        if (g.type === "sum") return "Det er det samlede skema for forvitringen af pyrit.";
        if (g.type === "spm") return "";
        return g.def.slut || "";
    };

    /* Det, der sker, naar en bid er klaret */
    F.efterTrin = function (t) {
        var mig = this, g = this.opg, R = g.R, token = this.token;
        if (g.type !== "afstem" || t !== "gange") return;
        /* Gangetallene flyver op foran formlerne */
        var fly = [];
        R.grupper.forEach(function (G) {
            var til = [G.led];
            G.K.forEach(function (K) { if (!K.fri) til.push(K.h); });
            fly.push({ k: G.K[0].nr, til: til, tekst: String(G.gange) });
        });
        var tilbage = fly.length;
        function faerdig() {
            if (token !== mig.token) return;
            tilbage--;
            if (!tilbage) { g.koefFaerdig = true; if (mig.opg === g) mig.visHaefte(); }
        }
        if (!NK.Haefte.FLYV_MS) { g.koefFaerdig = true; return; }
        setTimeout(function () {
            if (token !== mig.token) return;
            fly.forEach(function (f) { mig.haefte.flyv(f.k, f.til, f.tekst, faerdig); });
        }, 60);
    };

    /* Det, der sker, naar en ny bid begynder */
    F.startTrin = function () {
        if (this.opg.type === "afstem" && !this.faerdig && this.aktivt() === "klammer") this.haefte.tegnKlammerFrem();
    };

    F.efterOpgave = function () {
        this.vis();
    };

    /* ----- Hjaelpen: hinttrappen og Vis svaret ---------------------------------------------- */
    function unik(l) {
        return l.filter(function (x, i) { return x && l.indexOf(x) === i; });
    }

    F.hintNu = function () {
        var g = this.opg, t = this.aktivt();
        if (g.type === "sum") return this.sumHint();
        if (g.type === "spm") return [D.SPM[g.nr].hint];
        var R = g.R, K, st;
        switch (t) {
        case "ox":
            var o = this.oxNoegle(this.noegler("ox").filter(function (k) { return !g.tal[k]; })[0]);
            return unik([X.oxHint(o.st, o.E), X.oxHint2(o.st, o.E)]);
        case "redox":
            return ["I en redoxreaktion skifter mindst ét atom oxidationstal.", "Sammenlign tallet over S før pilen med tallet over S efter pilen."];
        case "for":
            K = this.forK();
            return ["Tæl " + K.E + " på hver side af pilen. Der skal være lige mange.",
                R.led[K.v].st.tekst + " har " + K.nV + " " + K.E + ", og " + R.led[K.h].st.tekst + " har " + K.nH + ". Hvilket tal foran giver lige mange?"];
        case "klammer":
            K = R.K.filter(function (k, i) { return !g.tal["kl" + i]; })[0];
            return [X.gaarTekst(K) + ". Går tallet op eller ned, og hvor mange trin?",
                K.antal > 1 ? "Ét " + K.E + " flytter sig " + K.delta + " trin. Der er " + K.antal + " " + K.E + " på klammen, så gang med " + K.antal + "." :
                    "Pilen peger op, når tallet bliver større. Tæl trinene fra " + X.ox(K.fra) + " til " + X.ox(K.til) + "."];
        case "gange":
            var op = R.grupper.filter(function (G) { return G.netto > 0; })[0], ned = R.grupper.filter(function (G) { return G.netto < 0; })[0];
            if (this.bundne().length) {
                st = R.led[this.bundne()[0].led].st;
                return ["Klammerne fra " + st.tekst + " skal have samme gangetal. Læg alle stigninger sammen og alle fald sammen.",
                    "Prøv med 1 foran alle pilene, og regn stigning i alt og fald i alt ud."];
            }
            var faelles = op.gange * op.netto;
            return ["Find det mindste tal, som både " + op.netto + " og " + (-ned.netto) + " går op i.",
                "Det mindste tal er " + faelles + ". Hvad skal " + op.netto + " ganges med for at give " + faelles + ", og hvad skal " + (-ned.netto) + " ganges med?"];
        case "med":
            var m = R.med[0], kilde = R.led.filter(function (l) { return l.side !== R.led[m.led].side && l.st.el[m.E]; })[0];
            return ["Tæl " + m.E + " på den anden side af pilen. Husk tallet foran formlen.",
                R.koef[kilde.nr] + " " + kilde.st.tekst + " har " + m.antal + " " + m.E + ". Der skal være lige så mange " + m.E + " i " + R.led[m.led].st.tekst + "."];
        case "ladning":
            return ["Gang hver ladning med tallet foran, og læg sammen. Et stof uden ladning tæller 0.",
                "Før pilen: " + X.ladBeregning(R, "v") + ". Efter pilen: " + X.ladBeregning(R, "h") + "."];
        case "ion":
            return ["H⁺ er positive. Sæt dem på den side, hvor ladningen er lavest.",
                "Ladningen er " + X.lad(R.ladning.v) + " før pilen og " + X.lad(R.ladning.h) + " efter. Hvor mange H⁺ skal der til, før de to er ens?"];
        case "brint":
            return ["Tæl H i hver formel, og gang med tallet foran." + (R.ion.antal ? " Husk H i H⁺." : ""),
                "Før pilen: " + X.brintBeregning(R, "v") + ". Efter pilen: " + X.brintBeregning(R, "h") + "."];
        case "vand":
            var dH = Math.abs((R.foer.v.H || 0) - (R.foer.h.H || 0));
            return ["Hvert H₂O har 2 H. Sæt vand på den side, der har færrest H.",
                "Der mangler " + dH + " H " + (R.vand.side === "v" ? "før" : "efter") + " pilen. Del med 2."];
        }
        return [];
    };

    /* Vis svaret: resten af bidden udfyldes med brunt blaek */
    F.visSvar = function () {
        var mig = this, g = this.opg, t = this.aktivt();
        if (g.type === "sum") { this.sumSvar(); return; }
        if (g.type === "spm") { this.spmSvar(); return; }
        var R = g.R, kort = "";
        function vis(k, v) { if (!g.tal[k]) g.tal[k] = { v: v, slags: "vist" }; }
        function side(s) { return s === "v" ? "før pilen" : "efter pilen"; }
        switch (t) {
        case "ox":
            var forste = this.oxNoegle(this.noegler("ox").filter(function (k) { return !g.tal[k]; })[0]);
            this.noegler("ox").forEach(function (k) { var o = mig.oxNoegle(k); vis(k, o.st.ox[o.E]); });
            kort = X.oxBeregning(forste.st, forste.E);
            break;
        case "redox":
            this.valgt("nej", "svar");
            return;
        case "for":
            this.noegler("for").forEach(function (k) {
                var i = +k.slice(3), K = mig.ledK(i), v = i === K.v ? K.pv : K.ph;
                vis(k, v);
                kort = "Der skal " + v + " foran " + R.led[i].st.tekst + ".";
            });
            break;
        case "klammer":
            R.K.forEach(function (K, k) { g.pil[k] = K.op; vis("kl" + k, K.tot); });
            kort = R.K.map(function (K) { return K.E + " " + (K.op ? "stiger " : "falder ") + K.tot; }).join(", ") + ".";
            break;
        case "gange":
            R.K.forEach(function (K, k) { vis("g" + k, K.gange); });
            kort = "Gangetallene er " + ogListe(R.grupper.map(function (G) { return String(G.gange); })) + ". Der flytter " + R.elektroner + " elektroner.";
            break;
        case "med":
            R.med.forEach(function (m) { vis("for" + m.led, m.koef); kort = "Der skal " + m.koef + " foran " + R.led[m.led].st.tekst + "."; });
            break;
        case "ladning":
            vis("lad-v", R.ladning.v);
            vis("lad-h", R.ladning.h);
            kort = "Ladningen er " + X.lad(R.ladning.v) + " før pilen og " + X.lad(R.ladning.h) + " efter.";
            break;
        case "ion":
            vis("ion-" + R.ion.side, R.ion.antal);
            kort = R.ion.antal + " " + R.ionSt.tekst + " " + side(R.ion.side) + ".";
            break;
        case "brint":
            vis("brint-v", R.foer.v.H || 0);
            vis("brint-h", R.foer.h.H || 0);
            kort = (R.foer.v.H || 0) + " H før pilen og " + (R.foer.h.H || 0) + " efter.";
            break;
        case "vand":
            vis("vand-" + R.vand.side, R.vand.antal);
            kort = R.vand.antal + " H₂O " + side(R.vand.side) + ".";
            break;
        }
        this.loesTrin("svar", "", kort);
    };

    /* =====================================================================
       SUM: de to skemaer ganges og laegges sammen (fane 2, opgave 3)
       ===================================================================== */
    function antalAf(liste, f) {
        var n = 0;
        liste.forEach(function (x) { if (x.f === f) n += x.n; });
        return n;
    }

    /* Alt, der kan regnes ud af de to afstemte skemaer */
    F.sumData = function (def) {
        var mig = this, f = def.gaarUd;
        var dele = def.dele.map(function (id) { return X.termer(mig.R[id]); });
        var dannet = antalAf(dele[0].h, f), brugt = antalAf(dele[1].v, f), d = NK.gcd(dannet, brugt);
        var gange = [brugt / d, dannet / d];
        var ganget = dele.map(function (s, i) { return X.ganget(s, gange[i]); });
        var samlet = X.sum(ganget, def.raekke);
        /* De stoffer, der staar i begge skemaer paa samme side, skal laegges sammen */
        var felter = [];
        ["v", "h"].forEach(function (side) {
            samlet[side].forEach(function (x) {
                var led = ganget.map(function (s) { return antalAf(s[side], x.f); }).filter(function (n) { return n > 0; });
                if (led.length > 1) felter.push({ noegle: "sum-" + side + "-" + x.f, side: side, f: x.f, led: led, n: x.n });
            });
        });
        /* SO₄²⁻ og H⁺ skrevet som svovlsyre */
        var nSyre = antalAf(samlet.h, def.syre.af[0]);
        var slut = { v: samlet.v, h: samlet.h.filter(function (x) { return def.syre.af.indexOf(x.f) < 0; }).concat([{ f: def.syre.f, n: nSyre }]) };
        return { f: f, dele: dele, dannet: dannet, brugt: brugt, gange: gange, ganget: ganget, samlet: samlet, felter: felter,
            nSyre: nSyre, slut: slut, slutTekst: X.termTekst(slut) };
    };

    F.lavSum = function (def) {
        this.opg = { def: def, type: "sum", trin: ["gang", "sum", "syre"], nr: 0, tal: {}, S: this.sumData(def) };
        this.bygSum();
        this.visSum();
    };

    F.sumNoegler = function (t) {
        var S = this.opg.S;
        if (t === "gang") return ["gang0", "gang1"];
        if (t === "sum") return S.felter.map(function (x) { return x.noegle; });
        if (t === "syre") return ["syre"];
        return [];
    };

    F.sumFelt = function (noegle, aria) {
        var mig = this;
        var f = lav("span", "hf-felt");
        var inp = document.createElement("input");
        inp.type = "text";
        inp.autocomplete = "off";
        inp.spellcheck = false;
        inp.setAttribute("aria-label", aria);
        inp.setAttribute("data-noegle", noegle);
        inp.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); mig.tjekTrin(); } });
        inp.addEventListener("input", function () { f.classList.remove("fejl"); mig.visSum(); });
        f.appendChild(inp);
        this.sf[noegle] = { felt: f, inp: inp, tal: lav("span", "sa-tal") };
        return f;
    };

    /* Et led i et skema: tallet foran og formlen. Med et felt, hvis leddet
       skal regnes ud. */
    F.sumLed = function (x, felt, klasse) {
        var e = lav("span", "sa-led" + (klasse ? " " + klasse : ""));
        if (felt) {
            e.appendChild(this.sumFelt(felt.noegle, "Antallet af " + X.stof(x.f).tekst));
            e.appendChild(this.sf[felt.noegle].tal);
        } else if (x.n !== 1) e.appendChild(lav("span", "sa-n", String(x.n)));
        e.appendChild(lav("span", "sa-f", X.stof(x.f).tekst));
        return e;
    };

    F.sumSkema = function (s, valg) {
        var mig = this, e = lav("span", "sa-skema");
        valg = valg || {};
        ["v", "h"].forEach(function (side) {
            s[side].forEach(function (x, i) {
                if (i) e.appendChild(lav("span", "sa-plus", "+"));
                var felt = valg.felter ? valg.felter.filter(function (f) { return f.side === side && f.f === x.f; })[0] : null;
                e.appendChild(mig.sumLed(x, felt, valg.maerk && valg.maerk === x.f ? valg.klasse : ""));
            });
            if (side === "v") e.appendChild(lav("span", "sa-pil", "⟶"));
        });
        return e;
    };

    F.bygSum = function () {
        var mig = this, g = this.opg, S = g.S, el = this.sumEl;
        this.sf = {};
        el.innerHTML = "";
        el.classList.remove("faerdig");
        this.sa = {};
        this.sa.navn = lav("div", "hf-navn");
        el.appendChild(this.sa.navn);
        var ind = lav("div", "sa-indhold");
        el.appendChild(ind);

        /* De to skemaer med et felt til gangetallet foran */
        this.sa.dele = S.dele.map(function (s, i) {
            var linje = lav("div", "sa-linje del");
            var gg = lav("span", "sa-gange");
            gg.appendChild(mig.sumFelt("gang" + i, "Hvor mange gange skema " + (i + 1) + " skal bruges"));
            gg.appendChild(mig.sf["gang" + i].tal);
            gg.appendChild(lav("span", "sa-x", "×"));
            linje.appendChild(gg);
            linje.appendChild(mig.sumSkema(s, { maerk: S.f, klasse: "ud" }));
            ind.appendChild(linje);
            return linje;
        });
        this.sa.regnskab = lav("div", "sa-regnskab");
        ind.appendChild(this.sa.regnskab);

        /* De gangede skemaer, hvor Fe²⁺ er streget ud, og summen under stregen */
        this.sa.ganget = S.ganget.map(function (s, i) {
            var linje = lav("div", "sa-linje ganget");
            linje.appendChild(lav("span", "sa-gange", i ? "+" : ""));
            linje.appendChild(mig.sumSkema(s, { maerk: S.f, klasse: "vaek" }));
            ind.appendChild(linje);
            return linje;
        });
        this.sa.sum = lav("div", "sa-linje sum");
        this.sa.sum.appendChild(lav("span", "sa-gange", "="));
        this.sa.sum.appendChild(this.sumSkema(S.samlet, { felter: S.felter }));
        ind.appendChild(this.sa.sum);

        /* Svovlsyren */
        this.sa.syre = lav("div", "sa-linje syre");
        var af = g.def.syre.af.map(function (f) { return { f: f, n: antalAf(S.samlet.h, f) }; });
        this.sa.syre.appendChild(lav("span", "sa-tekst", X.ledTekst(af) + " er det samme som"));
        var led = lav("span", "sa-led");
        led.appendChild(this.sumFelt("syre", "Antallet af H₂SO₄"));
        led.appendChild(this.sf.syre.tal);
        led.appendChild(lav("span", "sa-f", X.stof(g.def.syre.f).tekst));
        this.sa.syre.appendChild(led);
        this.sa.syre.appendChild(lav("span", "sa-tekst", "i vand"));
        ind.appendChild(this.sa.syre);

        this.sa.slut = lav("div", "sa-linje slut", S.slutTekst);
        ind.appendChild(this.sa.slut);
    };

    F.visSum = function () {
        var mig = this, g = this.opg, S = g.S, t = this.faerdig ? null : this.aktivt();
        var aktiv = t ? this.sumNoegler(t).filter(function (k) { return !g.tal[k]; }) : [];
        this.sa.navn.textContent = this.sumLinje(true);
        Object.keys(this.sf).forEach(function (k) {
            var f = mig.sf[k], er = aktiv.indexOf(k) >= 0, fundet = g.tal[k];
            f.felt.hidden = !er;
            f.felt.classList.toggle("aktiv", er);
            f.tal.textContent = fundet ? String(fundet.v) : "";
            f.tal.className = "sa-tal" + (fundet ? " " + fundet.slags : "");
        });
        var gangFaerdig = this.forbi("gang") || this.faerdig;
        this.sa.dele.forEach(function (l) { l.classList.toggle("dim", gangFaerdig); });
        this.sa.ganget.forEach(function (l) { l.hidden = !gangFaerdig; });
        this.sa.sum.hidden = !gangFaerdig;
        this.sa.syre.hidden = !(this.naaet("syre") || this.faerdig);
        this.sa.slut.hidden = !this.faerdig;
        this.sumEl.classList.toggle("faerdig", !!this.faerdig);

        /* Regnskabet for Fe²⁺ foelger de tal, eleven skriver */
        var a = g.tal.gang0 ? g.tal.gang0.v : this.skrevet("gang0"), b = g.tal.gang1 ? g.tal.gang1.v : this.skrevet("gang1");
        var navn = X.stof(S.f).tekst, html = "";
        if (gangFaerdig) {
            html = navn + " går ud: der dannes " + a * S.dannet + ", og der bruges " + b * S.brugt + ".";
        } else {
            html = navn + " dannet: " + (a > 0 ? a + " · " + S.dannet + " = <b>" + a * S.dannet + "</b>" : "? · " + S.dannet) +
                '<span class="sa-luft"></span>' + navn + " brugt: " + (b > 0 ? b + " · " + S.brugt + " = <b>" + b * S.brugt + "</b>" : "? · " + S.brugt);
        }
        this.sa.regnskab.innerHTML = html;
        this.sa.regnskab.classList.toggle("lige", gangFaerdig || (a > 0 && b > 0 && a * S.dannet === b * S.brugt));
    };

    /* kort: linjen oeverst paa papiret. Ellers statuslinjen. */
    F.sumLinje = function (kort) {
        var g = this.opg, S = g.S, navn = X.stof(S.f).tekst;
        if (this.faerdig) return kort ? "Det samlede skema ✓" : "";
        switch (this.aktivt()) {
        case "gang":
            return kort ? "Hvor mange gange skal hvert skema bruges, så " + navn + " går ud?" :
                navn + " dannes i det første skema og bruges i det andet. Skriv et tal foran hvert skema, så der dannes lige så mange " + navn + ", som der bruges.";
        case "sum":
            return kort ? "Læg de to skemaer sammen" :
                "Nu er begge skemaer ganget igennem, og " + navn + " går ud. Læg de to skemaer sammen: skriv tallene foran de stoffer, der står i dem begge.";
        case "syre":
            return kort ? "Skriv sulfat og H⁺ som svovlsyre" :
                "I vand er svovlsyre delt i H⁺ og SO₄²⁻. Skriv, hvor mange H₂SO₄ ionerne svarer til.";
        }
        return "";
    };

    F.sumHint = function () {
        var g = this.opg, S = g.S, navn = X.stof(S.f).tekst;
        switch (this.aktivt()) {
        case "gang":
            return ["Det første skema danner " + S.dannet + " " + navn + " ad gangen. Det andet bruger " + S.brugt + " ad gangen.",
                "Brug det andet skema 1 gang. Hvor mange gange skal det første bruges for at danne " + S.brugt + " " + navn + "?"];
        case "sum":
            var x = S.felter.filter(function (f) { return !g.tal[f.noegle]; })[0];
            return ["Find " + X.stof(x.f).tekst + " i begge skemaer over stregen, og læg tallene sammen.",
                X.stof(x.f).tekst + ": " + x.led.join(" + ") + "."];
        case "syre":
            return ["Hvert H₂SO₄ giver 2 H⁺ og 1 SO₄²⁻ i vand.", "Der er " + S.nSyre + " SO₄²⁻. Hvert H₂SO₄ har ét."];
        }
        return [];
    };

    F.tjekSum = function () {
        var mig = this, g = this.opg, S = g.S, t = this.aktivt();
        if (t === "gang") {
            var a = this.laest("gang0"), b = this.laest("gang1");
            if (a === null || b === null) {
                if (a === null) this.rystFelt("gang0");
                if (b === null) this.rystFelt("gang1");
                this.fejlLinje("Skriv et tal foran begge skemaer. Skriv 1, hvis skemaet skal bruges én gang.");
                this.fokusNoegle(a === null ? "gang0" : "gang1");
                return;
            }
            if (isNaN(a) || isNaN(b) || a < 1 || b < 1) { this.fejlLinje("Skriv et helt tal, der er større end 0."); return; }
            var navn = X.stof(S.f).tekst;
            if (a * S.dannet !== b * S.brugt) {
                this.rystFelt("gang0");
                this.rystFelt("gang1");
                this.fejlLinje("Dannet: " + a + " · " + S.dannet + " = " + a * S.dannet + " " + navn + ". Brugt: " + b + " · " + S.brugt + " = " + b * S.brugt + " " + navn + ". De to tal skal være ens.");
                return;
            }
            var d = NK.gcd(a, b);
            if (d > 1) { this.fejlLinje("Det går op, men begge tal kan deles med " + d + ". Brug de mindste tal."); return; }
            g.tal.gang0 = { v: a, slags: "ok" };
            g.tal.gang1 = { v: b, slags: "ok" };
            this.loesTrin("selv", "");
            return;
        }
        if (t === "sum") {
            this.tjekHver("sum",
                function (k) { return mig.laest(k); },
                function (k) { return S.felter.filter(function (f) { return f.noegle === k; })[0].n; },
                function (k, v) {
                    var x = S.felter.filter(function (f) { return f.noegle === k; })[0], st = X.stof(x.f).tekst;
                    if (isNaN(v)) return "Skriv et helt tal foran " + st + ".";
                    if (x.led.indexOf(v) >= 0) return st + " står i begge skemaer. Læg de to tal sammen.";
                    return st + ": læg tallene fra de to skemaer over stregen sammen.";
                },
                "Skriv tallene i felterne i den nederste linje.",
                null);
            return;
        }
        this.tjekHver("syre",
            function (k) { return mig.laest(k); },
            function () { return S.nSyre; },
            function (k, v) {
                if (isNaN(v)) return "Skriv et helt tal.";
                if (v === 2 * S.nSyre) return "Hvert H₂SO₄ har 2 H. " + 2 * S.nSyre + " H⁺ rækker til " + S.nSyre + " H₂SO₄.";
                return "Hvert H₂SO₄ giver 1 SO₄²⁻ og 2 H⁺. Tæl SO₄²⁻.";
            },
            "Skriv antallet af H₂SO₄ i feltet.",
            null);
    };

    F.sumSvar = function () {
        var g = this.opg, S = g.S, t = this.aktivt(), kort = "";
        function vis(k, v) { if (!g.tal[k]) g.tal[k] = { v: v, slags: "vist" }; }
        if (t === "gang") {
            vis("gang0", S.gange[0]);
            vis("gang1", S.gange[1]);
            kort = S.gange[0] + " · " + S.dannet + " = " + S.gange[1] + " · " + S.brugt + ".";
        } else if (t === "sum") {
            S.felter.forEach(function (x) { vis(x.noegle, x.n); });
            kort = S.felter.map(function (x) { return X.stof(x.f).tekst + ": " + x.led.join(" + ") + " = " + x.n; }).join(". ") + ".";
        } else {
            vis("syre", S.nSyre);
            kort = S.nSyre + " SO₄²⁻ og " + 2 * S.nSyre + " H⁺ er " + S.nSyre + " H₂SO₄.";
        }
        this.loesTrin("svar", "", kort);
    };

    /* =====================================================================
       SPM: spoergsmaal til det samlede skema (fane 2, opgave 4)
       ===================================================================== */
    F.lavSpm = function (def) {
        var sumDef = this.opgaver[this.idx("sum")];
        this.opg = { def: def, type: "spm", trin: D.SPM.map(function (s, i) { return "spm" + i; }), nr: 0, tal: {},
            forkert: {}, rigtig: -1, S: this.sumData(sumDef) };
        this.bygSpm();
        this.visSpm();
    };

    F.bygSpm = function () {
        var mig = this, g = this.opg, el = this.spmEl;
        el.innerHTML = "";
        el.classList.remove("faerdig");
        this.sp = {};
        this.sp.navn = lav("div", "hf-navn");
        el.appendChild(this.sp.navn);
        var ind = lav("div", "sp-indhold");
        el.appendChild(ind);

        /* Det samlede skema med oxidationstallene over atomerne, med blyant */
        var skema = lav("div", "sp-skema");
        ["v", "h"].forEach(function (side) {
            g.S.slut[side].forEach(function (x, i) {
                if (i) skema.appendChild(lav("span", "hf-plus", "+"));
                var st = X.stof(x.f), led = lav("span", "hf-led");
                if (x.n !== 1) led.appendChild(lav("span", "sp-n", String(x.n)));
                var formel = lav("span", "hf-formel");
                var maerker = {}, set = {};
                st.atomer.forEach(function (a, n) {
                    if (a.s !== "H" && !set[a.s] && x.f !== "H2O") { maerker[n] = "givet"; set[a.s] = true; }
                });
                var pladser = NK.Formel.byg(formel, st, maerker, { noegle: function (n, a) { return a.s; } });
                Object.keys(pladser).forEach(function (E) {
                    pladser[E].tal.textContent = X.ox(st.ox[E]);
                    pladser[E].tal.className = "hf-oxtal blyant";
                });
                led.appendChild(formel);
                skema.appendChild(led);
            });
            if (side === "v") skema.appendChild(lav("span", "sa-pil", "⟶"));
        });
        ind.appendChild(skema);

        this.sp.spm = lav("div", "sp-spm");
        ind.appendChild(this.sp.spm);
        this.sp.svar = lav("div", "sp-svar");
        this.sp.svar.addEventListener("click", function (e) {
            var k = e.target.closest ? e.target.closest("[data-svar]") : null;
            if (!k || k.disabled) return;
            mig.spmValg(+k.getAttribute("data-svar"), "selv");
        });
        ind.appendChild(this.sp.svar);
    };

    F.visSpm = function () {
        var g = this.opg, i = Math.min(g.nr, D.SPM.length - 1), s = D.SPM[i];
        this.sp.navn.textContent = this.faerdig ? "Río Tinto: besvaret ✓" : "Spørgsmål " + (i + 1) + " af " + D.SPM.length;
        this.sp.spm.textContent = s.tekst;
        var html = "";
        s.svar.forEach(function (sv, j) {
            var kl = "sp-knap", laast = false;
            if (g.forkert[j]) { kl += " forkert"; laast = true; }
            if (g.rigtig === j) kl += " rigtig";
            if (g.rigtig >= 0) laast = true;
            html += '<button type="button" class="' + kl + '" data-svar="' + j + '"' + (laast ? " disabled" : "") + '><span class="v-bogstav">' +
                "ABC".charAt(j) + "</span>" + NK.html(sv.t) + "</button>";
        });
        this.sp.svar.innerHTML = html;
        this.spmEl.classList.toggle("faerdig", !!this.faerdig);
    };

    F.spmValg = function (j, maade) {
        var mig = this, g = this.opg;
        if (this.faerdig || this.mellem || g.rigtig >= 0) return;
        var s = D.SPM[g.nr];
        if (!s.svar[j].ok) {
            g.forkert[j] = true;
            this.visSpm();
            this.fejlLinje(s.svar[j].f);
            return;
        }
        g.rigtig = j;
        this.hjaelp = 0;
        this.pegKnap = false;
        if (g.nr >= D.SPM.length - 1) {
            g.nr = D.SPM.length;
            this.faerdig = true;
            this.visSpm();
            this.loest(maade, s.rigtig);
            return;
        }
        this.visSpm();
        /* Forklaringen staar alene, til eleven selv gaar videre */
        this.mellem = { tekst: "Næste spørgsmål →", gaa: function () {
            g.nr++;
            g.forkert = {};
            g.rigtig = -1;
            mig.visSpm();
            mig.visKort();
            mig.naesteLinje("", "");
        } };
        if (maade === "svar") this.svarLinje(s.rigtig);
        else this.godLinje(s.rigtig);
        this.visKnap();
    };

    F.spmSvar = function () {
        var s = D.SPM[this.opg.nr], rigtig = 0;
        s.svar.forEach(function (sv, j) { if (sv.ok) rigtig = j; });
        this.spmValg(rigtig, "svar");
    };

    /* ----- Fokus og taster --------------------------------------------------------------------- */
    F.fokusFelt = function () {
        var g = this.opg;
        if (this.faerdig || this.mellem) return;
        var t = this.aktivt();
        var a = document.activeElement;
        var k = this.noegler(t).filter(function (x) { return !g.tal[x]; });
        if (a && a.getAttribute && k.indexOf(a.getAttribute("data-noegle")) >= 0) return;
        if (k.length) this.fokusNoegle(k[0]);
    };

    F.enter = function () {
        if (this.faerdig || this.mellem) { this.knap(); return; }
        this.tjekTrin();
    };

    /* Tal skrives i felterne, ikke som faneskift, naar der er felter */
    F.tagerTal = function () { return this.harFelter(); };

    /* ----- Papirets stoerrelse ------------------------------------------------------------------ */
    F.tilpas = function () {
        if (!this.erAktiv() || !this.opg) return;
        /* Tegningen er 1000 × 220: strimlen faar den hoejde, bredden giver,
           dog hoejst knap en tredjedel af scenen */
        var scene = this.strimmel.parentNode;
        if (scene.clientWidth) {
            this.strimmel.style.height = Math.round(NK.klamp(scene.clientWidth / 4.6, 96, scene.clientHeight * 0.29)) + "px";
        }
        var b = this.papir.clientWidth, h = this.papir.clientHeight;
        if (!b || !h) return;
        if (this.opg.type === "afstem") { this.haefte.tilpas(b, h); return; }
        /* De to andre ark: skriften vaelges, saa alle linjer kan vaere der */
        var el = this.opg.type === "sum" ? this.sumEl : this.spmEl;
        var linjer = this.opg.type === "sum" ? 12.5 : 9.5;
        var fs = NK.klamp(Math.min((h - 30) / linjer, (b - 40) / 26), 13, 30);
        el.style.setProperty("--fs", fs.toFixed(1) + "px");
        /* Den bredeste linje skal kunne vaere der, ogsaa dem, der kommer
           senere: de maales med, mens arket har klassen maaler */
        var ind = el.querySelector(".sa-indhold, .sp-indhold"), bredest = 0;
        el.classList.add("maaler");
        for (var i = 0; i < ind.children.length; i++) bredest = Math.max(bredest, ind.children[i].scrollWidth);
        var plads = ind.clientWidth;
        el.classList.remove("maaler");
        if (bredest > plads && plads > 0) {
            fs = Math.max(12, fs * plads / bredest - 0.4);
            el.style.setProperty("--fs", fs.toFixed(1) + "px");
        }
    };

    /* ----- Klasserne til de to faner ------------------------------------------------------------ */
    function lavSim(navn, valg) {
        function Sim() { this.init(); }
        var P = Sim.prototype;
        P.cfg = { navn: navn, iRaekke: !!valg.iRaekke };
        NK.Fane.paa(P, { navn: navn, naesteFane: valg.naesteFane, naesteNavn: valg.naesteNavn });
        Object.keys(F).forEach(function (k) { P[k] = F[k]; });
        return Sim;
    }

    NK.SimPyrit = lavSim("p", { iRaekke: true, naesteFane: "fane-r", naesteNavn: "Ristning" });
    NK.SimRistning = lavSim("r", {});
}());
