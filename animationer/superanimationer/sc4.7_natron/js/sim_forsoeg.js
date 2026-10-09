/* =====================================================================
   sim_forsoeg.js - fane 1: forsoeget

   Natron i en digel paa en vaegt, der er nulstillet med den tomme
   digel. Eleven gaetter foerst, hvad der bliver tilbage, aflaeser
   startmassen, saetter diglen paa trefoden, taender braenderen (lav
   eller hoej flamme), slukker og flytter diglen over paa vaegten,
   venter, til den er koelet af, og skriver massen i skemaet. Det
   gentages, til to vejninger giver det samme: massen er konstant.

   Hoej flamme fra start faar pulveret til at sproejte ud af diglen, og
   en varm digel vejer for lidt. Luppen viser Na⁺ og HCO₃⁻; det, der
   bliver tilbage, staar som ?, til eleven har fundet svaret paa fanen
   Hypoteserne. Grafen viser vejningerne og, naar de er regnet,
   hypotesernes forventede masser. Maalingen gemmes og bruges paa fane 2.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var K = NK.Kemi;
    var T = NK.Tjek;
    var Tg = NK.Tegn;

    /* ----- Maalingen deles med fane 2 og huskes i browseren ----------------------- */
    var NOEGLE_MAAL = "nk-sc4.7-maaling";
    var NOEGLE_GAET = "nk-sc4.7-gaet";
    NK.minMaaling = (function () {
        var g = NK.hent(NOEGLE_MAAL, null);
        if (g && g.mf > 0 && g.slut > 0 && g.vejninger && g.vejninger.length >= 2) return g;
        return null;
    }());
    NK.gaet = NK.hent(NOEGLE_GAET, null);
    /* Maalingen, fane 2 regner paa. Foerst den digel, der staar paa fane 1,
       saa snart startmassen er skrevet (ogsaa foer massen er konstant: saa
       er slut null, og dommen venter). Saa den sidste faerdige maaling, og
       til sidst eksemplet (brugerens oenske 29. sept. 2026: fane 2 maa ikke
       komme med helt nye tal, naar eleven har vejet selv). */
    NK.maaling = function () {
        var A = NK.sims && NK.sims["fane-forsoeg"];
        if (A && A.vejninger && A.vejninger.length && !A.gemtVist) {
            var v = A.vejninger;
            return { mf: A.proeve, slut: A.konstant ? v[v.length - 1].m : null, vejninger: v.slice(), sprojt: A.d.tabt > 0.02,
                     egen: true, faerdig: !!A.konstant };
        }
        var m = NK.minMaaling;
        if (m) return { mf: m.mf, slut: m.slut, vejninger: m.vejninger, sprojt: !!m.sprojt, egen: true, faerdig: true };
        var e = D.EKSEMPEL;
        return { mf: e.mf, slut: e.slut, vejninger: e.vejninger, sprojt: false, egen: false, faerdig: true };
    };

    var FLYT_TID = 0.7;     /* sekunder, tangen er om at flytte diglen */

    function SimForsoeg() {
        this.over = null;
        this.startFane(D.FORSOEG);
        this.el.valg = NK.el("forsoeg-valg");
        this.el.tbody = NK.el("forsoeg-tbody");
        this.introNu = true;
        this.vaelg(0, false);
    }

    var P = SimForsoeg.prototype;
    NK.Fane.paa(P, { navn: "forsoeg", naesteFane: "fane-hypoteser", naesteNavn: "Hypoteserne" });

    var vaelgFaelles = P.vaelg;
    P.vaelg = function (i, nyeTal) {
        vaelgFaelles.call(this, i, nyeTal);
        if (this.gemtVist) this.besked("Målingen står i skemaet. Tryk på Start forfra for at måle igen.", "god");
        this.visSkema();
    };

    /* ----- Opgaven -------------------------------------------------------------- */
    P.lavOpgave = function (i) {
        var o = D.FORSOEG[i];
        this.opg = o;
        this.valgt = null;
        if (NK.gaet) this.valgt = o.valg.svar.map(function (s) { return s.id; }).indexOf(NK.gaet);
        if (this.valgt < 0) this.valgt = null;
        this.forklaring = "";
        var gemt = NK.minMaaling;
        this.gemtVist = !!(this.status[i].loest && gemt);
        this.nyMaaling(this.gemtVist ? gemt.mf : null);
        if (this.gemtVist) {
            /* Den faerdige maaling: al natronen har reageret, diglen staar paa vaegten */
            this.d.nat = 0;
            this.d.na2co3 = gemt.slut;
            this.d.nat0 = gemt.mf;
            this.d.opv = gemt.vejninger[gemt.vejninger.length - 1].t;
            this.vejninger = gemt.vejninger.slice();
            this.faerdig = true;
            this.konstant = true;
        }
        this.sidsteFase = this.fase();
    };

    /* En ny digel med en ny proeve (m: en bestemt masse, ellers en ny) */
    P.nyMaaling = function (m) {
        if (!m) {
            var sidst = this.proeve;
            var mulige = D.PROEVER.filter(function (x) { return x !== sidst; });
            m = NK.tilfaeldig(mulige.length ? mulige : D.PROEVER);
        }
        this.proeve = m;
        this.d = new K.Digel({ m: m });
        this.vejninger = [];
        this.sidstVejet = 0;          /* opvarmning ved sidste vejning */
        this.maxT = D.STUE;           /* hoejeste temperatur siden sidste vejning */
        this.konstant = false;
        this.flyt = null;             /* { fra, til, t } */
        this.traek = null;
        this.lup = new Tg.Lup(9);
        this.damp = new NK.Damp(4);
        this.korn = new NK.Korn(6);
        this.sprojtAkku = 0;
        this.sprojtSet = false;
        this.hurtig = null;
        this.auto = null;
        this.holdSvar = "";
        this.rosNaeste = "";
        this.rosKlasse = "";
        this.sidsteFase = null;
        this.gemtVist = false;
        this.skemaSig = "";
    };

    P.harForfra = function () { return true; };
    P.harNyeTal = function () { return false; };

    /* Start forfra: en ny digel med en ny proeve (gaettet bliver) */
    P.forfra = function () {
        this.faerdig = false;
        this.nyMaaling(null);
        this.sidsteFase = this.fase();
        this.hjaelp = 0;
        this.brugtSvar = false;
        this.visKort();
        this.visListe();
        this.besked("En ny digel med " + K.g2(this.proeve) + " g natron. " + this.trinLinje(), "");
        this.visSkema();
        this.fokus();
    };

    /* Foer gaettet: spoergsmaalet. Bagefter: gaettet paa én linje og de tre
       trin, med det trin, eleven er naaet til, fremhaevet (brugerens oenske
       29. sept. 2026: det var uklart, hvad man skulle efter to vejninger). */
    P.promptHTML = function () {
        var o = this.opg;
        if (this.valgt === null && !this.faerdig) return '<p class="maal-tekst">' + NK.html(o.valg.spm) + "</p>";
        var gaet = this.valgt !== null ? '<p class="gaet-linje">Dit gæt: <b>' + NK.html(o.valg.svar[this.valgt].t) + "</b></p>" : "";
        var nu = this.trinNu();
        return gaet + '<ol class="trinliste">' + o.trin.map(function (t, i) {
            return '<li class="' + (i < nu ? "gjort" : (i === nu ? "nu" : "")) + '">' + NK.html(t) + "</li>";
        }).join("") + "</ol>";
    };

    /* Det trin i kortet, eleven er naaet til (3: alle er gjort) */
    P.trinNu = function () {
        if (this.faerdig || this.konstant) return 3;
        var n = this.vejninger.length;
        return n === 0 ? 0 : (n === 1 ? 1 : 2);
    };

    /* Valgknapperne til gaettet. De forsvinder, naar der er gaettet. */
    P.visKortEkstra = function () {
        var o = this.opg, mig = this, e = this.el.valg;
        e.innerHTML = "";
        e.hidden = this.valgt !== null || this.faerdig;
        if (e.hidden) return;
        o.valg.svar.forEach(function (s, j) {
            var b = document.createElement("button");
            b.type = "button";
            b.className = "knap";
            b.textContent = s.t;
            if (mig.valgt !== null) {
                b.disabled = true;
                if (j === mig.valgt) b.classList.add("valgt");
            }
            b.addEventListener("click", function () { mig.vaelgSvar(j, "gaet"); });
            e.appendChild(b);
        });
    };

    P.vaelgSvar = function (j, maade) {
        if (this.valgt !== null) return;
        var s = this.opg.valg.svar[j];
        this.valgt = j;
        NK.gaet = s.id;
        NK.gem(NOEGLE_GAET, s.id);
        this.hjaelp = 0;
        if (maade === "svar") {
            /* Der er intet rigtigt gaet her: forsoeget skal afgoere det */
            this.brugtSvar = false;
            this.holdSvar = NK.html("Et gæt er et gæt. " + s.t + " er valgt for dig. Forsøget afgør det.");
            this.svarVis(this.holdSvar);
        } else {
            this.rosNaeste = "Forsøget afgør det.";
            this.rosKlasse = "neutral";
        }
        this.visKort();
        this.visSkema();
        this.fokus();
    };

    /* ----- Faserne ------------------------------------------------------------------ */
    P.opvarmetSiden = function () { return this.d.opv - this.sidstVejet; };

    P.fase = function () {
        if (this.faerdig) return "faerdig";
        if (this.valgt === null) return "valg";
        var d = this.d;
        if (!this.vejninger.length) return d.opv > 0 || d.sted !== "vaegt" || this.flyt ? "startForfra" : "foer";
        var til = this.flyt ? this.flyt.til : d.sted;
        var varmet = this.opvarmetSiden() >= D.KONSTANT.minTid;
        if (til === "vaegt") {
            if (!varmet) return this.vejninger.length === 1 && d.opv === 0 ? "flyt" : "igen";
            if (this.flyt || !d.stille()) return "vaegtVent";
            return "vej";
        }
        if (!d.flamme) return varmet ? "tilVaegt" : (this.vejninger.length > 1 ? "slukket" : "taend");
        return "varm";
    };

    P.opgaveFaerdig = function () { return this.konstant; };

    P.trinLinje = function () {
        var f = this.fase();
        if (f === "faerdig") return "";
        if (f === "startForfra") return "Startmassen står ikke i skemaet. Sæt diglen tilbage på vægten, hvis den ikke er varmet. Ellers tryk på Start forfra.";
        if (f === "varm" && this.d.sprojtRate > 0) return "Det sprøjter! Pulver ryger ud af diglen. Skru ned på Lav.";
        if (f === "varm" && this.sprojtSet) return "Det sprøjtede, og noget pulver røg ud af diglen. Slutmassen bliver for lav. Fortsæt, eller tryk på Start forfra.";
        if (f === "varm" && this.d.nat > 0.01 && this.opvarmetSiden() > 12 && this.d.flamme === "lav") return D.LINJE.varm + " Lav flamme er langsom. Høj er fin nu.";
        return D.LINJE[f] || "";
    };

    P.slutLinje = function () { return this.forklaring; };

    /* holdSvar: det svar, eleven lige har bedt om. Det bliver staaende i linjen
       foran det naeste skridt, til fasen skifter igen. */
    P.faseSkift = function (f) {
        this.hjaelp = 0;
        var holdt = this.holdSvar;
        this.holdSvar = "";
        var klasse = this.rosNaeste ? (this.rosKlasse === "neutral" ? "" : (this.rosKlasse || "god")) : "";
        if (f !== "faerdig") {
            if (holdt) this.besked(holdt + " " + this.trinLinje(), "gul");
            else this.besked((this.rosNaeste ? this.rosNaeste + " " : "") + this.trinLinje(), klasse);
        }
        this.rosNaeste = "";
        this.rosKlasse = "";
        this.visKnap();
        this.visSkema();
        if (f === "foer" || f === "vej") this.fokus();
    };

    /* ----- Knappen: hint og svar for den fase, man er i ------------------------------ */
    D.LINJE.tilVaegt = "Flyt diglen over på vægten, og vej den. Du kan slukke brænderen, mens du venter.";
    D.HINT.tilVaegt = "Klik på diglen, eller træk den over på vægten.";
    D.SVAR.tilVaegt = "Diglen står på vægten.";
    D.HINT.startForfra = "Startmassen skal aflæses, før diglen varmes. Tryk på Start forfra.";

    P.trinInfo = function () {
        var o = this.opg, mig = this, f = this.fase();
        if (f === "faerdig") return null;
        if (f === "valg") {
            return { hint: NK.html(o.valg.hint), svar: function () { mig.vaelgSvar(NK.tilfaeldig([0, 1, 2]), "svar"); } };
        }
        if (f === "startForfra") return { hint: NK.html(D.HINT.startForfra), svar: function () { mig.forfra(); } };
        return { hint: NK.html(D.HINT[f]), svar: function () { mig.visSvar(f); } };
    };

    P.visSvar = function (f) {
        var d = this.d;
        this.brugtSvar = true;
        var tekst = D.SVAR[f] ? D.SVAR[f].replace("{m}", K.g2(d.visning() === null ? this.proeve : d.visning())) : "";
        if (f === "vej") { this.holdSvar = ""; this.noter("svar"); return; }
        this.holdSvar = NK.html(tekst);
        this.svarVis(this.holdSvar);
        if (f === "foer") { this.noter("svar"); return; }
        if (f === "flyt" || f === "igen") {
            this.startFlyt("trefod");
            if (f === "igen") this.auto = { slags: "taend", fl: d.reageret() > 0.6 ? "hoej" : "lav" };
        } else if (f === "taend" || f === "slukket") {
            d.flamme = "lav";
        } else if (f === "varm") {
            this.auto = { slags: "varm", slut: d.opv + (d.opv < 4 ? 4 - d.opv + 3 : 3) };
            if (d.opv >= 4 && d.sprojtRate === 0) d.flamme = "hoej";
        } else if (f === "tilVaegt") {
            d.flamme = "";
            this.startFlyt("vaegt");
        } else if (f === "vaegtVent") {
            this.hurtig = 8;
        }
        this.visKnap();
    };

    /* ----- Skemaet i panelet ------------------------------------------------------------
       En raekke pr. vejning. Den raekke, der skal skrives i nu, har et felt. */
    P.aktivRaekke = function () {
        var f = this.fase();
        return f === "foer" || f === "vej" || f === "vaegtVent";
    };

    /* Aendringen fra vejningen foer: "−0,50 g", eller "0,00 g", naar de er ens */
    function aendring(v, forrige) {
        if (!forrige) return "";
        var d = Math.round((v.m - forrige.m) * 100);
        return '<td class="aendr' + (d === 0 ? " ens" : "") + '">' + NK.komma(d) + " g</td>";
    }

    P.visSkema = function () {
        var mig = this, tb = this.el.tbody;
        if (!tb) return;
        var aktiv = this.aktivRaekke() && this.vejninger.length < D.MAX_VEJNINGER;
        /* Naeste raekke staar graa, mens diglen skal varmes */
        var n = this.vejninger.length;
        var naeste = !aktiv && !this.faerdig && !this.konstant && n >= 1 && n < D.MAX_VEJNINGER;
        var sig = this.vejninger.map(function (v) { return v.t.toFixed(1) + ":" + v.m; }).join("|") + (aktiv ? "|aktiv" + this.opvarmetTekst() : "") +
            (naeste ? "|n" : "") + (this.faerdig ? "|f" : "");
        if (sig === this.skemaSig) return;
        var gammel = tb.querySelector("input");
        var vaerdi = gammel ? gammel.value : "";
        var havdeFokus = gammel && document.activeElement === gammel;
        this.skemaSig = sig;
        tb.innerHTML = "";
        this.vejninger.forEach(function (v, i) {
            var tr = document.createElement("tr");
            var sidste = mig.faerdig && i >= mig.vejninger.length - 2 && i > 0;
            tr.className = sidste ? "konstant" : "";
            tr.innerHTML = "<th>" + (i === 0 ? "Før" : i + ". vejning") + "</th><td>" + (i === 0 ? "0 min" : K.min(v.t) + " min") +
                '</td><td><div class="felt lille ok"><input type="text" disabled value="' + K.g2(v.m) + '"><span class="felt-efter">g</span></div></td>' +
                (aendring(v, mig.vejninger[i - 1]) || "<td></td>");
            tb.appendChild(tr);
        });
        if (naeste) {
            var tn = document.createElement("tr");
            tn.className = "naeste";
            tn.innerHTML = "<th>" + n + ". vejning</th><td colspan=\"3\">" + (n === 1 ? "varm diglen først" : "varm igen først") + "</td>";
            tb.appendChild(tn);
        }
        if (aktiv) {
            var tr = document.createElement("tr");
            tr.className = "valgt";
            tr.innerHTML = "<th>" + (n === 0 ? "Før" : n + ". vejning") + "</th><td>" + (n === 0 ? "0 min" : this.opvarmetTekst()) +
                '</td><td><div class="felt lille aktiv"><input id="forsoeg-inp" type="text" inputmode="decimal" autocomplete="off" spellcheck="false" aria-label="Massen i diglen"><span class="felt-efter">g</span></div></td><td></td>';
            tb.appendChild(tr);
            var inp = tr.querySelector("input");
            inp.value = vaerdi;
            inp.addEventListener("keydown", function (ev) {
                if (ev.key === "Enter") { ev.preventDefault(); mig.tjekFelt(); }
            });
            if (havdeFokus) inp.focus({ preventScroll: true });
        }
        var m = this.vejninger.length ? this.vejninger[this.vejninger.length - 1] : null;
        NK.saetTekst("forsoeg-note", this.faerdig && m ? "Massen er konstant: " + K.g2(m.m) + " g. Natronen tabte " +
            K.g2(K.r2(this.vejninger[0].m - m.m)) + " g." : "Massen er konstant, når to vejninger i træk er ens: ændringen er 0,00 g.");
    };

    P.opvarmetTekst = function () { return K.min(this.d.opv) + " min"; };

    P.fokusFelt = function () {
        var inp = NK.el("forsoeg-inp");
        if (inp) inp.focus({ preventScroll: true });
    };

    function ryst(e) {
        var felt = e.parentNode;
        felt.classList.remove("ryst");
        void felt.offsetWidth;
        felt.classList.add("ryst");
    }

    P.tjekFelt = function () {
        var e = NK.el("forsoeg-inp");
        if (!e || this.faerdig) return;
        var f = this.fase();
        var raa = e.value;
        if (!String(raa).trim()) { this.besked("Skriv tallet fra vægten.", "gul"); return; }
        var t = T.tal(raa);
        if (!t) { ryst(e); this.besked("Skriv et tal, fx 5,21.", "skidt"); return; }
        var v = Math.round(t.v * 100), vis = this.d.visning();
        var visV = vis === null ? null : Math.round(vis * 100);
        if (f === "foer") {
            if (v === Math.round(this.proeve * 100)) { this.noter("ok"); return; }
            ryst(e);
            this.besked("Det står der ikke på vægten. Skriv tallet med to decimaler.", "skidt");
            return;
        }
        if (f === "vaegtVent") {
            ryst(e);
            if (visV !== null && v === visV) this.besked("Diglen er stadig varm, og vægten viser for lidt. Vent, til tallet står stille.", "skidt");
            else this.besked("Vægten har ikke fundet ro endnu. Vent, til tallet står stille.", "skidt");
            return;
        }
        if (f !== "vej") return;
        if (v === visV) { this.noter("ok"); return; }
        ryst(e);
        var forrige = this.vejninger[this.vejninger.length - 1];
        if (v === Math.round(forrige.m * 100)) this.besked("Det er massen fra sidste vejning. Hvad viser vægten nu?", "skidt");
        else this.besked("Det står der ikke på vægten. Skriv tallet med to decimaler.", "skidt");
    };

    /* En vejning skrives i skemaet */
    P.noter = function (maade) {
        var d = this.d, f = this.fase();
        var m = f === "foer" ? this.proeve : d.visning();
        var ny = { t: Math.round(d.opv * 10) / 10, m: m };
        var forrige = this.vejninger[this.vejninger.length - 1];
        this.vejninger.push(ny);
        var varmTil = this.maxT;
        this.sidstVejet = d.opv;
        this.maxT = d.T;
        if (f === "foer") {
            this.rosNaeste = NK.tilfaeldig(D.ROS);
            this.visSkema();
            this.visKort();
            return;
        }
        var ens = forrige && this.vejninger.length >= 3 && Math.abs(forrige.m - m) < D.KONSTANT.tol;
        if (ens && varmTil >= 200) { this.slut(maade); return; }
        /* Massen er ikke konstant endnu: linjen siger, hvor meget den faldt */
        var fald = K.r2(forrige.m - m);
        this.rosKlasse = "gul";
        if (ens) this.rosNaeste = "Det samme som sidst, men diglen nåede ikke at blive rigtig varm. Varm længere.";
        else if (this.vejninger.length >= D.MAX_VEJNINGER) this.rosNaeste = "Skemaet er fuldt. Tryk på Start forfra, og varm længere ad gangen.";
        else if (fald > 0) this.rosNaeste = "Massen faldt " + K.g2(fald) + " g. Den er ikke konstant endnu.";
        else this.rosNaeste = "Noteret: " + K.g2(m) + " g.";
        this.visSkema();
        this.visKort();
    };

    /* Massen er konstant: maalingen gemmes */
    P.slut = function (maade) {
        var d = this.d, v = this.vejninger;
        var slutM = v[v.length - 1].m;
        this.konstant = true;
        d.flamme = "";
        NK.minMaaling = { mf: this.proeve, slut: slutM, vejninger: v.slice(), sprojt: d.tabt > 0.02 };
        NK.gem(NOEGLE_MAAL, NK.minMaaling);
        var tab = K.r2(this.proeve - slutM);
        var s = "Massen er konstant: " + K.g2(slutM) + " g. Natronen tabte " + K.g2(tab) + " g gas.";
        if (d.tabt > 0.02) s += " Men pulveret sprøjtede, så noget af tabet er natron, der røg ud af diglen.";
        s += " Regn på fanen Hypoteserne, hvilken hypotese massen passer med.";
        this.forklaring = NK.html(s);
        this.sidsteFase = "faerdig";
        this.trinLoest(maade, maade === "svar" ? NK.html("Vægten viser " + K.g2(slutM) + " g. Det samme som sidst.") : null);
        this.visSkema();
        if (NK.sims && NK.sims["fane-hypoteser"]) NK.sims["fane-hypoteser"].nyMaaling();
    };

    /* ----- Diglen flytter sig -------------------------------------------------------- */
    P.startFlyt = function (til) {
        var d = this.d;
        if (this.flyt) return;
        var fra = d.sted;
        if (fra === til) return;
        this.flyt = { fra: fra, til: til, t: 0 };
        d.sted = "flyt";
    };

    /* Hvor diglen staar: { x, bund, b } */
    P.digelPlads = function (sted) {
        var lay = this.lay;
        if (sted === "trefod") return lay.op.digel;
        return { x: lay.vaegt.x, bund: lay.vaegt.skaal + 1, b: lay.op.digel.b };
    };

    P.digelNu = function () {
        var lay = this.lay, d = this.d;
        if (this.traek) return { x: this.traek.x, bund: this.traek.y, b: lay.op.digel.b, luft: true };
        if (this.flyt) {
            var a = this.digelPlads(this.flyt.fra), b = this.digelPlads(this.flyt.til);
            var u = NK.blod(this.flyt.t / FLYT_TID);
            return { x: NK.lerp(a.x, b.x, u), bund: NK.lerp(a.bund, b.bund, u) - Math.sin(u * Math.PI) * lay.op.th * 0.35, b: a.b, luft: true };
        }
        return this.digelPlads(d.sted);
    };

    /* ----- Musen ------------------------------------------------------------------------- */
    P.hvad = function (pt) {
        var lay = this.lay;
        if (!lay || !pt) return null;
        var i;
        for (i = 0; i < (lay.knapper || []).length; i++) {
            var r = lay.knapper[i];
            if (pt.x >= r.x && pt.x <= r.x + r.b && pt.y >= r.y && pt.y <= r.y + r.h) return "knap:" + r.id;
        }
        var dg = this.digelNu(), dh = Tg.digelHoejde(dg.b);
        if (pt.x >= dg.x - dg.b * 0.6 && pt.x <= dg.x + dg.b * 0.6 && pt.y >= dg.bund - dh - 10 && pt.y <= dg.bund + 4) return "digel";
        var b = lay.op.braender;
        if (pt.x >= b.x - b.b * 0.8 && pt.x <= b.x + b.b * 0.8 && pt.y >= b.mund - 4 && pt.y <= lay.bordY) return "braender";
        var v = lay.vaegt;
        if (pt.x >= v.x - v.b / 2 && pt.x <= v.x + v.b / 2 && pt.y >= v.top && pt.y <= lay.bordY) return "vaegt";
        var z = lay.zoom;
        if (z && Math.hypot(pt.x - z.x, pt.y - z.y) < z.r) return "zoom";
        var g = lay.graf;
        if (g && pt.x >= g.x && pt.x <= g.x + g.b && pt.y >= g.y && pt.y <= g.y + g.h) return "graf";
        var gl = lay.glasR;
        if (gl && pt.x >= gl.x && pt.x <= gl.x + gl.b && pt.y >= gl.y && pt.y <= gl.y + gl.h) return "glas";
        return null;
    };

    P.overScene = function (pt) {
        this.over = this.hvad(pt);
        return this.over && this.over !== "zoom" && this.over !== "graf" ? this.over : null;
    };

    P.nedScene = function (pt) {
        var u = this.hvad(pt), d = this.d;
        if (u && u.indexOf("knap:") === 0) { this.saetFlamme(u.slice(5)); return false; }
        if (u === "digel") {
            if (this.faerdig) { this.kortBesked(this.gemtVist ? "Målingen er færdig. Tryk på Start forfra for at måle igen." : "Massen er konstant. Målingen er færdig."); return false; }
            if (this.fase() === "valg") { this.blokValg(); return false; }
            if (this.flyt) return false;
            if (this.fase() === "foer") { this.kortBesked("Aflæs først vægten, og skriv startmassen i skemaet."); return false; }
            var dg = this.digelNu();
            this.traek = { x: dg.x, y: dg.bund, sx: pt.x, sy: pt.y, dx: dg.x - pt.x, dy: dg.bund - pt.y, trukket: false, fra: d.sted };
            d.sted = "flyt";
            return true;
        }
        if (u === "braender") {
            if (this.fase() === "valg") { this.blokValg(); return false; }
            this.saetFlamme(d.flamme ? "" : "lav");
            return false;
        }
        if (u === "vaegt") this.kortBesked("Vægten er nulstillet med den tomme digel. Den viser massen af det, der er i diglen.");
        if (u === "zoom") this.kortBesked(NK.dommen ? "Luppen: to HCO₃⁻ bliver til CO₃²⁻, CO₂ og H₂O. CO₂ og H₂O forsvinder op i luften, og Na⁺ bliver." :
            "Luppen viser natronen: Na⁺ og HCO₃⁻. Gas forsvinder, og det, der bliver tilbage, står som ?.");
        if (u === "graf") this.kortBesked("Grafen viser de masser, du har skrevet i skemaet. Når massen er konstant, bliver kurven vandret.");
        if (u === "glas") this.kortBesked(D.KRUKKE);
        return false;
    };

    P.flytScene = function (pt) {
        var s = this.traek;
        if (!s) return;
        s.x = pt.x + s.dx;
        s.y = pt.y + s.dy;
        if (Math.hypot(pt.x - s.sx, pt.y - s.sy) > 6) s.trukket = true;
    };

    P.opScene = function (pt) {
        var s = this.traek, d = this.d, lay = this.lay;
        if (!s) return;
        this.traek = null;
        d.sted = s.fra;
        var andet = s.fra === "vaegt" ? "trefod" : "vaegt";
        if (!s.trukket) { this.startFlyt(andet); return; }
        /* Sluppet over trefoden eller vaegten */
        var op = lay.op, v = lay.vaegt;
        var overTrefod = Math.abs(pt.x - op.x) < op.b * 0.5 && pt.y < lay.bordY && pt.y > op.top - op.th * 0.8;
        var overVaegt = Math.abs(pt.x - v.x) < v.b * 0.55 && pt.y < lay.bordY && pt.y > v.top - op.th * 0.8;
        var maal = overTrefod ? "trefod" : (overVaegt ? "vaegt" : null);
        if (maal && maal !== s.fra) {
            this.flyt = { fra: "slip", til: maal, t: FLYT_TID * 0.55, sx: s.x, sy: s.y };
            d.sted = "flyt";
            return;
        }
        if (!maal) this.kortBesked("Slip diglen over trefoden eller vægten.");
    };

    P.saetFlamme = function (id) {
        var d = this.d;
        if (this.faerdig) { this.kortBesked("Massen er konstant. Brænderen er slukket."); return; }
        if (this.fase() === "valg") { this.blokValg(); return; }
        d.flamme = id;
        if (id && d.sted !== "trefod" && !(this.flyt && this.flyt.til === "trefod")) this.kortBesked("Brænderen er tændt, men diglen står ikke på trefoden.");
    };

    P.blokValg = function () {
        this.kortBesked("Gæt først: vælg et af svarene i kortet.");
        this.pegT = 1.6;
    };

    /* ----- Layout ----------------------------------------------------------------------- */
    P.layout = function () {
        var W = this.L.b, H = this.L.h;
        var Hs = H;
        var lay = { W: W, H: H, Hs: Hs };
        lay.bordY = Math.round(Hs - NK.klamp(Hs * 0.1, 40, 54));
        /* Hoejre spalte: luppen og grafen */
        var rw = Math.round(NK.klamp(W * 0.34, 190, 360));
        var rx0 = W - rw - 12;
        var zr = Math.round(NK.klamp(Math.min(rw * 0.4, Hs * 0.2), 50, 125));
        lay.zoom = { x: rx0 + rw / 2, y: zr + 32, r: zr };
        var fp = NK.klamp(zr * 0.13, 12, 13);
        lay.lupFp = fp;
        var gy = lay.zoom.y + zr + fp * 2 + 26;
        lay.graf = { x: rx0, y: gy, b: rw, h: Math.max(90, lay.bordY - 12 - gy) };
        if (lay.graf.h < 110) {
            /* Lav skaerm: luppen mindre */
            zr = Math.round(NK.klamp(zr * 0.75, 40, 90));
            lay.zoom = { x: rx0 + rw / 2, y: zr + 30, r: zr };
            gy = lay.zoom.y + zr + fp * 2 + 24;
            lay.graf = { x: rx0, y: gy, b: rw, h: Math.max(80, lay.bordY - 12 - gy) };
        }
        /* Udstyret til venstre */
        var x0 = 14, eqW = rx0 - 14 - x0;
        var th = Math.round(NK.klamp(Math.min(eqW * 0.4, (lay.bordY - 60) * 0.62), 100, 250));
        var tb = th * NK.Sprites.MAAL.trefod.b / NK.Sprites.MAAL.trefod.h;
        var vb = NK.klamp(eqW * 0.3, 120, 220), vh = Tg.vaegtHoejde(vb);
        var jb = NK.klamp(eqW * 0.09, 40, 64);
        var gap = NK.klamp(eqW * 0.05, 14, 40);
        var gruppe = tb + gap + vb;
        var medGlas = eqW - gruppe > jb + gap + 10;
        if (medGlas) gruppe += jb + gap;
        var x = x0 + Math.max(0, (eqW - gruppe) / 2);
        if (medGlas) { lay.glasX = x + jb / 2; lay.glasB = jb; x += jb + gap; }
        lay.op = Tg.opstilling(x + tb / 2, lay.bordY, th);
        x += tb + gap;
        var M = NK.Sprites.MAAL.vaegt;
        lay.vaegt = { x: x + vb / 2, b: vb, h: vh, top: lay.bordY - vh, skaal: lay.bordY - (M.bund - M.skaalY) * vb / M.b };
        /* Knapperne til flammen paa bordets forside under trefoden */
        var kbr = NK.klamp(tb * 0.95, 120, 190), kh = NK.klamp(Hs - lay.bordY - 20, 22, 30);
        lay.knapRamme = { x: lay.op.x - kbr / 2, y: lay.bordY + 15, b: kbr, h: kh };
        this.lay = lay;
        this.saetAnker("opstilling", lay.op.x - tb / 2, lay.op.top - th * 0.3, tb, lay.bordY - lay.op.top + th * 0.3);
        this.saetAnker("knapper", lay.knapRamme.x - 4, lay.knapRamme.y - 4, lay.knapRamme.b + 8, lay.knapRamme.h + 8);
        this.saetAnker("vaegt", lay.vaegt.x - vb / 2, lay.vaegt.top - th * 0.4, vb, vh + th * 0.4);
        this.saetAnker("zoom", lay.zoom.x - zr, lay.zoom.y - zr - 26, 2 * zr, 2 * zr + 56);
        this.saetAnker("graf", lay.graf.x, lay.graf.y, lay.graf.b, lay.graf.h);
    };

    /* ----- Opdater ----------------------------------------------------------------------- */
    P.opdaterScene = function (dt) {
        var lay = this.lay, d = this.d, mig = this;
        if (!lay) return;
        var tf = this.hurtig || (this.auto && this.auto.slags === "varm" ? 6 : 1);
        var min = dt * D.MIN_PR_S * tf;
        /* Tangen flytter diglen */
        if (this.flyt) {
            this.flyt.t += dt;
            if (this.flyt.t >= FLYT_TID) {
                d.sted = this.flyt.til;
                this.flyt = null;
                if (this.auto && this.auto.slags === "taend" && d.sted === "trefod") { d.flamme = this.auto.fl; this.auto = null; }
            }
        }
        if (!this.faerdig) d.opdater(min);
        if (d.varmes() || d.sted === "trefod") this.maxT = Math.max(this.maxT, d.T);
        /* Vis svaret: tiden gaar hurtigere, til diglen er faerdig med det, der skal ske */
        if (this.hurtig && (d.stille() || d.sted !== "vaegt")) this.hurtig = null;
        if (this.auto && this.auto.slags === "varm" && d.opv >= this.auto.slut) {
            this.auto = null;
            d.flamme = "";
            this.startFlyt("vaegt");
        }
        /* Sproejt: korn flyver ud af diglen */
        if (d.sprojtRate > 0) {
            this.sprojtSet = true;
            this.sprojtAkku += d.sprojtRate * min * 400;
            var n = Math.floor(this.sprojtAkku);
            if (n > 0) { this.sprojtAkku -= n; this.korn.sprojt(Math.min(n, 12)); }
        }
        var dg = this.digelNu();
        this.damp.opdater(dt, this.faerdig ? 0 : d.gas);
        this.korn.opdater(dt, (lay.bordY - (dg.bund - Tg.digelHoejde(dg.b) * 0.87)) / dg.b);
        this.lup.opdater(dt * (tf > 1 ? 3 : 1), d.reageret(), !!NK.dommen);
        var auto = !!(this.hurtig || (this.auto && this.auto.slags === "varm") || this.flyt);
        if (auto !== !!this.autoKnap) { this.autoKnap = auto; this.visKnap(); }
        /* Fasen */
        var f = this.fase();
        if (f !== this.sidsteFase) {
            this.sidsteFase = f;
            this.faseSkift(f);
        } else if (f === "varm") {
            /* Sproejtet og den langsomme lave flamme aendrer linjen undervejs */
            var linje = this.trinLinje();
            if (linje !== this.sidstLinje) { this.sidstLinje = linje; this.besked(linje, d.sprojtRate > 0 ? "skidt" : ""); }
        }
        if (f !== "varm") this.sidstLinje = null;
        this.visSkema();
        if (this.pegT > 0) {
            this.pegT -= dt;
            this.el.valg.classList.toggle("peg", this.pegT > 0);
        }
        void mig;
    };

    /* Knappen er laast, mens Vis svaret arbejder */
    var visKnapFaelles = P.visKnap;
    P.visKnap = function () {
        visKnapFaelles.call(this);
        if (this.autoKnap && !this.faerdig) this.el.knap.disabled = true;
    };

    /* ----- Tegn --------------------------------------------------------------------------- */
    P.grafData = function () {
        var linjer = null;
        if (NK.forventet) {
            linjer = {};
            D.HYP_IDS.forEach(function (id) { if (NK.forventet[id] !== undefined) linjer[id] = NK.forventet[id]; });
        }
        var pkt = this.vejninger.slice();
        var mf = this.proeve;
        return { punkter: pkt, linjer: linjer && this.minMaalingMatcher() ? linjer : null, yMax: Math.ceil(mf + 0.3),
                 xMax: Math.max(20, Math.ceil((this.d.opv + 1) / 5) * 5) };
    };

    /* Hypotesernes streger passer kun til den maaling, de er regnet paa */
    P.minMaalingMatcher = function () { return NK.forventetFor === this.proeve; };

    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay, d = this.d, t = this.tid;
        if (!lay) return;
        this.L.ryd();
        Tg.rum(ctx, lay.W, lay.Hs, lay.bordY + 12);
        Tg.bord(ctx, 0, lay.W, lay.bordY, lay.Hs);
        var px = NK.klamp(lay.vaegt.b * 0.07, 13, 15);
        var op = lay.op, f = this.fase();

        /* Pynten: natronglasset */
        lay.glasR = lay.glasX ? Tg.glas(ctx, lay.glasX, lay.bordY + 1, lay.glasB, this.over === "glas") : null;

        /* Trefoden bagfra, braenderen og flammen */
        Tg.trefodBag(ctx, op);
        Tg.braender(ctx, op, this.over === "braender");
        Tg.flamme(ctx, op.braender.x, op.braender.mund, op.braender.k * 0.95, d.flamme, t);

        /* Vaegten */
        var vis = d.visning();
        var vtekst = vis === null ? "0,00 g" : K.g2(vis) + " g";
        var vg = Tg.vaegt(ctx, lay.vaegt.x, lay.bordY, lay.vaegt.b, vtekst, { lys: this.over === "vaegt" ? 1 : 0, roed: vis !== null && !d.stille() });
        lay.vaegt.top = vg.top;
        Tg.bordEtiket(ctx, "Vægten", lay.vaegt.x, lay.bordY + 26, px);

        /* Diglen, hvor den nu er */
        var dg = this.digelNu();
        var varme = NK.klamp((d.T - 150) / 250, 0, 1);
        var fyld = NK.klamp((d.masse()) / this.proeve, 0, 1);
        var rand = Tg.digel(ctx, dg.x, dg.bund, dg.b, { fyld: fyld, reageret: d.reageret(), bobler: this.faerdig ? 0 : d.gas,
            lys: this.over === "digel", varme: varme, t: t });
        if (dg.luft || this.flyt) Tg.tang(ctx, rand.x + rand.rx * 0.96, rand.y + 3, NK.klamp(dg.b * 1.9, 110, 190), -0.12);
        Tg.flimmer(ctx, rand.x, rand.y - 4, dg.b, NK.klamp((d.T - 80) / 200, 0, 1), t);
        this.damp.tegn(ctx, rand.x, rand.y - 2, dg.b);
        this.korn.tegn(ctx, rand.x, rand.y, dg.b);

        /* Trefoden forfra (foran diglen, naar den staar i trekanten) */
        Tg.trefodFor(ctx, op);

        /* Knapperne til flammen */
        var peg = null;
        if (f === "taend" || f === "slukket") peg = "lav";
        lay.knapper = Tg.flammeknapper(ctx, lay.knapRamme.x, lay.knapRamme.y, lay.knapRamme.b, lay.knapRamme.h, d.flamme,
            this.over && this.over.indexOf("knap:") === 0 ? this.over.slice(5) : null, peg);

        /* Skiltet med tiden og temperaturen */
        Tg.infoskilt(ctx, 12, 12, [{ t: "Opvarmet i alt: " + K.min(d.opv) + " min" },
            { t: "Diglen: " + Math.round(d.T) + " °C", farve: d.T > 60 ? "#ffb38a" : "#dfe6ee" }], NK.klamp(lay.W / 70, 12, 14));

        /* Pilen over det, der skal bruges nu */
        if (f === "foer") Tg.pegepil(ctx, lay.vaegt.x + lay.vaegt.b * 0.1, vg.disp.y - 8, t);
        else if ((f === "flyt" || f === "igen" || f === "tilVaegt") && !this.flyt && !this.traek) Tg.pegepil(ctx, rand.x, rand.top - 12, t);
        else if (f === "taend" || f === "slukket") Tg.pegepil(ctx, lay.knapRamme.x + lay.knapRamme.b / 2, lay.knapRamme.y - 4, t);
        else if (f === "vej") Tg.pegepil(ctx, lay.vaegt.x + lay.vaegt.b * 0.1, vg.disp.y - 8, t);

        /* Luppen */
        var z = lay.zoom;
        Tg.lupLinje(ctx, rand.x, rand.y + 3, z.x - z.r * 0.7, z.y + z.r * 0.7);
        Tg.lup(ctx, this.lup, z.x, z.y, z.r, { titel: "Luppen: pulveret i diglen", lys: this.over === "zoom", varm: d.T > 120, t: t });
        Tg.lupForklaring(ctx, z.x, z.y + z.r + lay.lupFp + 10, lay.lupFp, !!NK.dommen);

        /* Grafen */
        var gd = this.grafData();
        Tg.graf(ctx, lay.graf, { serier: [{ punkter: gd.punkter, farve: "#f2a93d" }], linjer: gd.linjer, yMax: gd.yMax, xMax: gd.xMax,
            fremhaev: NK.dommen && gd.linjer ? D.RIGTIG : null });

    };

    NK.SimForsoeg = SimForsoeg;
}());
