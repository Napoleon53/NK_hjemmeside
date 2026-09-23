/* =====================================================================
   sim_lager.js - fane 1: lageret

   Tredive glas paa tre hylder har mistet halvdelen af etiketten. Man
   tager et glas ned paa arbejdsbordet og finder ionerne i panelet. Hver
   ion, man finder, dukker op som en kugle ved siden af glasset. Er
   formlen eller navnet rigtigt, laegges kuglerne i det antal, der faar
   ladningen til at gaa op, de ryger ned i glasset, og etiketmaskinen
   printer en ny etiket.

   Panelet er ét opgavekort med raekker: en pr. ion og én til sidst.
   Knappen under raekkerne giver foerst et hint og saa svaret til det
   felt, man staar i. Et forkert svar giver en besked, der passer til
   fejlen (js/tjek.js).

   Hvad eleven har loest, og om det blev loest uden at se svaret
   (stjernen), huskes i browseren under NOEGLE.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var Tg = NK.Tegn;
    var Tj = NK.Tjek;

    var NOEGLE = "nk-sc2.3-lager";
    var FLYV_TID = 0.55;        /* glasset ned paa bordet og op igen (s) */
    var POP_MELLEM = 0.13;      /* mellem hver ny kugle i regnskabet (s) */

    var PLADSHOLDER = {
        ion: "fx K+ eller Cl-",
        ionnavn: "fx kaliumion",
        ionnavnMinus: "fx chlorid",
        formel: "fx CaCl2",
        navn: "fx calciumchlorid"
    };

    var DISPLAY_TOM = {
        ion: "ionen med ladning?",
        ionnavn: "ionens navn?",
        formel: "formlen?",
        navn: "stoffets navn?"
    };

    function SimLager() {
        this.L = new NK.Laerred(NK.el("lager-laerred"));
        this.tid = 0;
        /* Fremskridtet huskes pr. stof for alle 36, saa intet gaar tabt,
           naar Sværere ioner slaas til eller fra */
        var gemt = NK.hent(NOEGLE, {});
        this.statusAlle = {};
        var mig = this;
        D.STOFFER.forEach(function (st) {
            var g = gemt[st.id];
            mig.statusAlle[st.id] = { loest: !!(g && g.l), stjerne: !!(g && g.s) };
        });
        this.brugSaet();
        this.rost = {};              /* hylder, Kemichael har rost i denne sidevisning */
        this.mus = null;
        this.over = null;            /* det, musen er over: { slags, i } */
        this.taster = [];
        this.plakatPuls = null;
        this.retur = null;
        this.flyv = null;
        this.kugler = [];
        this.regn = null;
        this.etiketFlyv = null;
        this.ventRos = null;
        this.lay = null;
        this.g = { kaffekop: { skjult: false, iHaand: false } };
        this.valgt = -1;

        this.bygPanel();
        this.koblMus();
        if (this.laererStart) this.laererStart();
        this.vaelg(this.naesteUloeste(-1), true);
    }

    var P = SimLager.prototype;

    /* ----- Hukommelse og sæt ------------------------------------------------ */
    P.gem = function () {
        var ud = {};
        var s = this.statusAlle;
        Object.keys(s).forEach(function (id) {
            if (s[id].loest) ud[id] = { l: 1, s: s[id].stjerne ? 1 : 0 };
        });
        NK.gem(NOEGLE, ud);
    };

    /* De 30 glas paa reolen efter kontakten Sværere ioner. status[i] er
       det samme objekt som statusAlle[id], saa aendringer huskes. */
    P.brugSaet = function () {
        var mig = this;
        this.stoffer = D.aktive(NK.indstil.svaer);
        this.status = this.stoffer.map(function (st) { return mig.statusAlle[st.id]; });
    };

    /* Kontakten er slaaet til eller fra: reolen skifter sæt, og glasset
       paa bordet bliver det, der nu staar paa samme plads */
    P.skiftSaet = function () {
        var plads = this.valgt >= 0 ? this.valgt : 0;
        this.brugSaet();
        if (this.lay) this.layout();
        this.retur = null;
        this.flyv = null;
        this.opg = null;
        this.valgt = -1;
        this.vaelg(plads, true);
        this.over = null;
        NK.saetHTML("lager-status", NK.indstil.svaer
            ? "Seks glas har fået sværere ioner: " + D.SVAER_IONER + "."
            : "Reolen har igen de almindelige ioner.");
    };

    P.antalLoest = function (hylde) {
        var n = 0, mig = this;
        this.stoffer.forEach(function (st, i) {
            if ((hylde === undefined || st.hylde === hylde) && mig.status[i].loest) n++;
        });
        return n;
    };

    P.antalStjerner = function (hylde) {
        var n = 0, mig = this;
        this.stoffer.forEach(function (st, i) {
            if ((hylde === undefined || st.hylde === hylde) && mig.status[i].stjerne) n++;
        });
        return n;
    };

    /* Det naeste uloeste glas efter fra: foerst resten af samme hylde,
       saa de andre. Er alle loest, bare det naeste glas. */
    P.naesteUloeste = function (fra) {
        var n = this.stoffer.length;
        for (var d = 1; d <= n; d++) {
            var i = (fra + d + n) % n;
            if (!this.status[i].loest) return i;
        }
        return (fra + 1 + n) % n;
    };

    /* ----- Layout ------------------------------------------------------------- */
    P.layout = function () {
        var W = this.L.b, H = this.L.h;
        var lay = {};
        lay.W = W;
        lay.H = H;
        lay.bordY = Math.round(H * 0.84);

        var rx = Math.max(10, W * 0.02);
        var rb = W * 0.68 - rx;
        var ry = Math.max(8, H * 0.03);
        var rh = H * 0.5 - ry;
        lay.reol = { x: rx, y: ry, b: rb, h: rh };
        lay.tyk = NK.klamp(H * 0.018, 8, 14);
        var rum = rh / 3;
        lay.hylder = [0, 1, 2].map(function (i) { return ry + rum * (i + 1) - lay.tyk; });
        lay.slot = (rb - 24) / 10;
        lay.lilleH = Math.max(30, Math.min(lay.slot * 0.84 / 0.77, rum - lay.tyk - 30));
        lay.pladser = this.stoffer.map(function (st) {
            return { x: rx + 12 + lay.slot * (st.pladsPaaHylde + 0.5), y: lay.hylder[st.hylde], h: lay.lilleH };
        });

        /* Plakaterne til hoejre for reolen */
        var px = W * 0.715, pb = Math.min(W * 0.965 - px, 260);
        px = W * 0.965 - pb;
        var ptH = NK.klamp(pb * 0.52, 90, rh * 0.5);
        lay.plakater = {
            pt: { x: px, y: ry + 6, b: pb, h: ptH },
            ioner: { x: px + pb * 0.08, y: ry + 6 + ptH + NK.klamp(rh * 0.07, 10, 26), b: pb * 0.84, h: NK.klamp(rh - ptH - 40, 80, 190) }
        };

        /* Arbejdsbordet: det store glas, kuglerne og etiketmaskinen */
        /* Det store glas skal staa under reolen og dens nederste skilt */
        lay.storH = NK.klamp(Math.min(H * 0.34, W * 0.28, lay.bordY - (ry + rh + 34)), 100, 290);
        lay.stor = { x: Math.max(W * 0.19, Tg.glasBredde(lay.storH) / 2 + 20), y: lay.bordY };
        var mb = NK.klamp(W * 0.25, 130, 300);
        var mh = mb * 150 / 240;
        lay.maskine = { x: Math.min(W * 0.6, W - mb - 90), y: lay.bordY - mh * 0.95, b: mb };
        var jarHoejre = lay.stor.x + Tg.glasBredde(lay.storH) / 2;
        lay.ionOmr = {
            x0: jarHoejre + 16, x1: lay.maskine.x - 14,
            y0: lay.bordY - lay.storH * 0.98, y1: lay.bordY - 14
        };
        lay.kop = { x: Math.min(W - 34, lay.maskine.x + mb + 40), y: lay.bordY };
        this.lay = lay;

        /* Kuglerne springer til deres nye plads, naar vinduet skifter */
        var antal = {}, mig = this;
        this.kugler.forEach(function (k) { antal[k.ion.id] = (antal[k.ion.id] || 0) + 1; });
        this.kugler.forEach(function (k) {
            var p = mig.kuglePlads(k.ion, k.nr, antal[k.ion.id]);
            k.x = p.x;
            k.y = p.y;
        });

        this.saetAnker("lager-anker-reol", rx, ry, rb, rh + 26);
        this.saetAnker("lager-anker-bord", lay.stor.x - Tg.glasBredde(lay.storH) / 2 - 8, lay.bordY - lay.storH - 12,
            lay.maskine.x + mb - (lay.stor.x - Tg.glasBredde(lay.storH) / 2) + 16, lay.storH + 20);
        this.saetAnker("lager-anker-plakater", px - 6, ry, pb + 12, lay.plakater.ioner.y + lay.plakater.ioner.h - ry + 8);
    };

    /* Usynlige felter oven paa laerredet, som rundvisningen kan pege paa */
    P.saetAnker = function (id, x, y, b, h) {
        var e = NK.el(id);
        if (!e) return;
        e.style.left = Math.round(x) + "px";
        e.style.top = Math.round(y) + "px";
        e.style.width = Math.round(b) + "px";
        e.style.height = Math.round(h) + "px";
    };

    P.tilpas = function () {
        if (this.L.tilpas() || !this.lay) this.layout();
    };

    /* ----- Panelet ------------------------------------------------------------- */
    P.bygPanel = function () {
        var mig = this;
        this.el = {
            hylde: NK.el("lager-hylde"),
            prompt: NK.el("lager-prompt"),
            spm: NK.el("lager-spm"),
            raekker: NK.el("lager-raekker"),
            besked: NK.el("lager-besked"),
            knap: NK.el("lager-knap"),
            kort: NK.el("lager-kort"),
            hylder: NK.el("lager-hylder"),
            nulstil: NK.el("lager-nulstil")
        };
        this.el.knap.addEventListener("click", function () { mig.knap(); });

        /* Fremskridtet: én linje pr. hylde. Et klik henter det naeste
           uloeste glas fra den hylde. */
        D.HYLDER.forEach(function (h, nr) {
            var knap = document.createElement("button");
            knap.type = "button";
            knap.className = "hyldelinje";
            knap.innerHTML = '<span class="hl-farve" style="background:' + h.farve + '"></span>' +
                '<span class="hl-navn">' + h.navn + '<em>' + h.kort + '</em></span>' +
                '<span class="hl-tal" id="lager-hl-tal-' + nr + '"></span>' +
                '<span class="hl-stjerner" id="lager-hl-stj-' + nr + '"></span>';
            knap.addEventListener("click", function () { mig.vaelgHylde(nr); });
            mig.el.hylder.appendChild(knap);
        });

        this.nulstilSikker = 0;
        this.el.nulstil.addEventListener("click", function () {
            if (mig.nulstilSikker > 0) {
                mig.nulstilSikker = 0;
                mig.nulstilAlt();
            } else {
                mig.nulstilSikker = 3;
            }
            mig.visNulstil();
        });
    };

    P.visNulstil = function () {
        NK.saetHTML("lager-nulstil", this.nulstilSikker > 0
            ? "<span>Sikker? Klik igen</span><span class=\"tegn\">↺</span>"
            : "<span>Sæt alle glas tilbage</span><span class=\"tegn\">↺</span>");
    };

    P.vaelgHylde = function (nr) {
        var foerste = nr * 10;
        for (var i = foerste; i < foerste + 10; i++) {
            if (!this.status[i].loest) { this.vaelg(i); return; }
        }
        this.vaelg(foerste);
    };

    P.opdaterFremskridt = function () {
        for (var h = 0; h < D.HYLDER.length; h++) {
            NK.saetTekst("lager-hl-tal-" + h, this.antalLoest(h) + "/10");
            var s = this.antalStjerner(h);
            NK.saetTekst("lager-hl-stj-" + h, s ? "★ " + s : "");
        }
        NK.saetTekst("lager-loest", String(this.antalLoest()));
    };

    /* ----- Opgaven ------------------------------------------------------------ */

    /* Tager glas i ned paa bordet og stiller det forrige tilbage */
    P.vaelg = function (i, straks) {
        if (i === this.valgt && this.opg) return;
        var lay = this.lay;
        if (this.valgt >= 0 && lay) {
            this.retur = { i: this.valgt, fra: this.bankPos(), t: 0, etiket: this.status[this.valgt].loest ? "ny" : "gammel" };
        }
        this.valgt = i;
        var st = this.stoffer[i];
        this.flyv = (straks || !lay) ? null : { fra: { x: lay.pladser[i].x, y: lay.pladser[i].y, h: lay.pladser[i].h }, t: 0 };
        this.nyOpgave(this.status[i].loest);
        this.visStatus();
        return st;
    };

    /* Bygger raekkerne. Er glasset loest, vises facit; ellers en ny opgave. */
    P.nyOpgave = function (gennemsyn) {
        var st = this.stoffer[this.valgt];
        var trin = D.trin(st);
        var felter = [];
        trin.forEach(function (r, ri) {
            r.felter.forEach(function (f, fi) {
                f.raekke = r;
                f.ri = ri;
                f.fi = fi;
                f.status = "laast";
                f.forsoeg = 0;
                felter.push(f);
            });
        });
        this.opg = {
            st: st, trin: trin, felter: felter, k: 0,
            hjaelp: 0, brugtSvar: false, faerdig: false, gennemsyn: !!gennemsyn
        };
        this.kugler = [];
        this.regn = null;
        this.etiketFlyv = null;
        this.plakatPuls = null;
        this.regnHint = false;
        this.besked("", "");

        if (gennemsyn) {
            var mig = this;
            felter.forEach(function (f) { f.status = "ok"; f.vaerdi = mig.korrekt(f); });
            this.opg.k = felter.length;
            this.opg.faerdig = true;
            this.fuldeKugler();
            this.besked(this.status[this.valgt].stjerne ? "Løst uden hjælp. ★" : "Løst.", "god");
        } else {
            felter[0].status = "aktiv";
        }
        this.bygRaekker();
        this.visKort();
        if (!gennemsyn) this.fokus();
    };

    P.korrekt = function (f) {
        var st = this.opg.st;
        if (f.slags === "ion") return f.raekke.ion.tekst;
        if (f.slags === "ionnavn") return f.raekke.ion.navn;
        if (f.slags === "formel") return st.formelTekst;
        return st.navn;
    };

    P.aktivtFelt = function () {
        var o = this.opg;
        return o && !o.faerdig ? o.felter[o.k] : null;
    };

    P.bygRaekker = function () {
        var mig = this, o = this.opg;
        var vaert = this.el.raekker;
        vaert.innerHTML = "";
        o.trin.forEach(function (r, ri) {
            var rk = document.createElement("div");
            rk.className = "raekke" + (r.slut ? " slut" : "");
            var hoved = '<div class="raekke-hoved"><span class="raekke-etiket">' + r.etiket + '</span>' +
                (r.del ? '<span class="raekke-del">' + NK.html(r.del) + '</span>' : "") + "</div>";
            rk.innerHTML = hoved + '<div class="felter"></div>';
            var felterEl = rk.querySelector(".felter");
            o.felter.forEach(function (f) {
                if (f.ri !== ri) return;
                var fe = document.createElement("div");
                fe.className = "felt " + f.status + (r.felter.length > 1 ? " halv" : "");
                if (f.status === "ok" || f.status === "svar") {
                    fe.innerHTML = '<span class="felt-svar">' + NK.html(f.vaerdi) + '</span><span class="felt-maerke">' +
                        (f.status === "ok" ? "✓" : "↩") + "</span>";
                    fe.title = f.status === "ok" ? "Rigtigt" : "Svaret blev vist";
                } else {
                    var ph = PLADSHOLDER[f.slags];
                    if (f.slags === "ionnavn" && r.ion.q < 0) ph = PLADSHOLDER.ionnavnMinus;
                    fe.innerHTML = '<input type="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false"' +
                        ' aria-label="' + r.etiket + (f.slags === "ionnavn" ? ", navn" : "") + '" placeholder="' + ph + '"' +
                        (f.status === "aktiv" ? "" : " disabled") + '>' +
                        '<button type="button" class="felt-ok" aria-label="Tjek svaret" tabindex="-1"' +
                        (f.status === "aktiv" ? "" : " disabled") + '>↵</button>';
                    var inp = fe.querySelector("input");
                    inp.addEventListener("keydown", function (e) {
                        if (e.key === "Enter") { e.preventDefault(); mig.tjek(); }
                    });
                    inp.addEventListener("input", function () { mig.tast(); });
                    inp.addEventListener("focus", function () { mig.fokuseret = true; });
                    inp.addEventListener("blur", function () { mig.fokuseret = false; });
                    fe.querySelector(".felt-ok").addEventListener("click", function () { mig.tjek(); });
                    f.input = inp;
                    f.feltEl = fe;
                }
                felterEl.appendChild(fe);
            });
            vaert.appendChild(rk);
        });
    };

    P.fokus = function () {
        var f = this.aktivtFelt();
        if (f && f.input && document.getElementById("fane-lager").classList.contains("aktiv") &&
            !document.querySelector(".overlay.vis") && !(NK.Rundvisning && NK.Rundvisning.aktiv())) {
            try { f.input.focus({ preventScroll: true }); } catch (e) { f.input.focus(); }
        }
    };

    P.visKort = function () {
        var o = this.opg, st = o.st;
        var h = D.HYLDER[st.hylde];
        NK.saetHTML("lager-hylde", '<span class="hyldeprik" style="background:' + h.farve + '"></span>' + h.navn);
        NK.saetTekst("lager-nr", String(st.pladsPaaHylde + 1));
        NK.saetTekst("lager-prompt", D.kendt(st));
        NK.saetTekst("lager-spm", st.retning === "formel"
            ? "Find ionerne, og skriv formlen."
            : "Find ionerne, og skriv navnet.");
        this.el.kort.classList.toggle("sejr", o.faerdig && !o.gennemsyn);
        this.visKnap();
        this.opdaterFremskridt();
    };

    P.visKnap = function () {
        var o = this.opg, tekst, klasse = "knap blaa";
        if (o.faerdig) {
            if (o.gennemsyn) tekst = "Øv glasset igen";
            else { tekst = "Næste glas →"; klasse += " banker"; }
        } else {
            tekst = o.hjaelp === 0 ? "Giv hint" : "Vis svaret";
            klasse = "knap";
        }
        this.el.knap.textContent = tekst;
        this.el.knap.className = klasse;
    };

    P.besked = function (html, klasse) {
        this.el.besked.innerHTML = html;
        this.el.besked.className = "besked" + (klasse ? " " + klasse : "");
    };

    /* Hint -> svar -> naeste glas, eller: oev det loeste glas igen */
    P.knap = function () {
        var o = this.opg;
        if (o.faerdig) {
            if (o.gennemsyn) this.nyOpgave(false);
            else this.vaelg(this.naesteUloeste(this.valgt));
            return;
        }
        var f = this.aktivtFelt();
        var h = D.hjaelp(o.st, f.raekke, f);
        if (o.hjaelp === 0) {
            o.hjaelp = 1;
            this.besked("<b>Hint:</b> " + h.hint, "gul");
            if (h.plakat) this.plakatPuls = { slags: h.plakat, t: 0, fremhaev: h.fremhaev || null };
            if (h.regnskab) this.regnHint = true;
            this.visKnap();
            this.fokus();
        } else {
            o.brugtSvar = true;
            this.feltRigtigt(f, "svar");
            this.besked(h.svar, "gul");
        }
    };

    /* Det, der skal slaas op, naar hintet peger paa en plakat */
    P.fremhaevning = function (slags) {
        var p = this.plakatPuls;
        return p && p.slags === slags ? p.fremhaev : null;
    };

    P.tast = function () {
        this.taster.push({ i: Math.floor(Math.random() * 30), a: 1 });
    };

    P.tjek = function () {
        var o = this.opg, f = this.aktivtFelt();
        if (!f) return;
        var st = o.st, raa = f.input ? f.input.value : "";
        var res;
        if (f.slags === "ion") res = Tj.ion(raa, f.raekke.ion, st, st.retning);
        else if (f.slags === "ionnavn") res = Tj.ionNavn(raa, f.raekke.ion);
        else if (f.slags === "formel") res = Tj.formel(raa, st);
        else res = Tj.navn(raa, st);

        if (res.tom) { this.besked(res.besked, ""); this.fokus(); return; }
        if (res.ok) {
            this.feltRigtigt(f, "ok");
            if (res.note) this.besked(res.note, "gul");
            return;
        }
        f.forsoeg++;
        this.besked(res.besked, "skidt");
        if (f.feltEl) {
            f.feltEl.classList.remove("ryst");
            void f.feltEl.offsetWidth;
            f.feltEl.classList.add("ryst");
        }
        this.fokus();
    };

    /* Et felt er klaret, enten rigtigt eller ved at se svaret */
    P.feltRigtigt = function (f, maade) {
        var o = this.opg;
        f.status = maade;
        f.vaerdi = this.korrekt(f);
        if (f.slags === "ion") this.nyKugle(f.raekke.ion);
        o.hjaelp = 0;
        this.plakatPuls = null;
        this.besked("", "");
        if (o.k >= o.felter.length - 1) {
            o.k = o.felter.length;
            this.loes();
        } else {
            o.k++;
            o.felter[o.k].status = "aktiv";
        }
        this.bygRaekker();
        this.visKort();
        this.fokus();
    };

    /* Hele glasset er loest */
    P.loes = function () {
        var o = this.opg, i = this.valgt;
        o.faerdig = true;
        this.regnHint = false;
        var s = this.status[i];
        var foer = s.loest;
        s.loest = true;
        s.stjerne = s.stjerne || !o.brugtSvar;
        this.gem();
        this.startRegnskab();
        this.visStatus();
        var h = o.st.hylde;
        if (!foer && this.antalLoest(h) === 10 && !this.rost[h]) {
            this.rost[h] = true;
            this.ventRos = { t: 3.2, hylde: h, alt: this.antalLoest() === this.stoffer.length };
        }
    };

    P.visStatus = function () {
        var o = this.opg;
        if (o && o.faerdig) {
            NK.saetHTML("lager-status", "<b>" + NK.html(o.st.formelTekst) + "</b> · " + NK.html(o.st.fakta));
        } else {
            NK.saetHTML("lager-status", "Klik på et andet glas på reolen for at skifte opgave.");
        }
    };

    P.nulstil = function () {
        if (!this.opg) return;
        if (this.opg.faerdig && !this.opg.gennemsyn) return;
        this.nyOpgave(false);
    };

    P.nulstilAlt = function () {
        var s = this.statusAlle;
        Object.keys(s).forEach(function (id) { s[id].loest = false; s[id].stjerne = false; });
        this.rost = {};
        this.gem();
        this.valgt = -1;
        this.opg = null;
        this.retur = null;
        this.vaelg(0, true);
    };

    /* Enter uden for et felt: videre til naeste glas, naar det er loest */
    P.enter = function () {
        if (this.opg && this.opg.faerdig && !this.opg.gennemsyn) this.knap();
    };

    /* ----- Kuglerne og regnskabet -------------------------------------------- */

    /* Hvor kugle nr i af antal staar i sin raekke */
    P.kuglePlads = function (ion, nr, antal) {
        var o = this.lay.ionOmr;
        var r = this.kugleR();
        var raekkeY = ion.q > 0 ? o.y0 + (o.y1 - o.y0) * 0.3 : o.y0 + (o.y1 - o.y0) * 0.72;
        var mellem = this.kugleMellem();
        var start = o.x0 + r + 4;
        return { x: start + nr * mellem + (3 - Math.max(antal, 1)) * mellem * 0.25, y: raekkeY };
    };

    P.kugleR = function () {
        var o = this.lay.ionOmr;
        return NK.klamp(Math.min((o.x1 - o.x0 - 60) / 6.6, (o.y1 - o.y0) / 4.6), 12, 27);
    };

    /* Afstanden mellem kuglerne. Er der lidt plads, rykker de sammen, saa
       summen til hoejre for tre kugler stadig kan staa fri af dem. */
    P.kugleMellem = function () {
        var o = this.lay.ionOmr, r = this.kugleR();
        return Math.max(r * 2, Math.min(r * 2.3, (o.x1 - o.x0 - 2 * r - 52) / 2));
    };

    P.nyKugle = function (ion) {
        var p = this.kuglePlads(ion, 0, 1);
        this.kugler.push({ ion: ion, nr: 0, x: p.x, y: p.y, skala: 0, t: 0, forsinket: 0, ind: 0 });
    };

    /* Glasset er loest fra start (facit): alle kuglerne staar klar */
    P.fuldeKugler = function () {
        var st = this.opg.st, mig = this;
        this.kugler = [];
        [[st.katIon, st.p], [st.anIon, st.n]].forEach(function (par) {
            for (var i = 0; i < par[1]; i++) {
                var p = mig.lay ? mig.kuglePlads(par[0], i, par[1]) : { x: 0, y: 0 };
                mig.kugler.push({ ion: par[0], nr: i, x: p.x, y: p.y, skala: 1, t: 1, forsinket: 0, ind: 1 });
            }
        });
        this.regn = { fase: "faerdig", t: 0 };
    };

    P.startRegnskab = function () {
        var st = this.opg.st, mig = this;
        var gamle = this.kugler;
        this.kugler = [];
        var n = 0;
        [[st.katIon, st.p], [st.anIon, st.n]].forEach(function (par) {
            for (var i = 0; i < par[1]; i++) {
                var fandtes = null;
                if (i === 0) {
                    for (var j = 0; j < gamle.length; j++) if (gamle[j].ion === par[0]) fandtes = gamle[j];
                }
                if (fandtes) {
                    fandtes.nr = 0;
                    mig.kugler.push(fandtes);
                } else {
                    var p = mig.kuglePlads(par[0], i, par[1]);
                    mig.kugler.push({ ion: par[0], nr: i, x: p.x, y: p.y, skala: 0, t: 0, forsinket: 0.25 + n * POP_MELLEM, ind: 0 });
                    n++;
                }
            }
        });
        this.regn = { fase: "viser", t: 0, popSlut: 0.25 + n * POP_MELLEM + 0.3 };
    };

    /* ----- Tegneloekken -------------------------------------------------------- */
    P.bankPos = function () {
        var lay = this.lay;
        var til = { x: lay.stor.x, y: lay.stor.y, h: lay.storH };
        if (!this.flyv) return til;
        var t = NK.blod(this.flyv.t / FLYV_TID);
        return {
            x: NK.lerp(this.flyv.fra.x, til.x, t),
            y: NK.lerp(this.flyv.fra.y, til.y, t) - Math.sin(t * Math.PI) * 40,
            h: NK.lerp(this.flyv.fra.h, til.h, t)
        };
    };

    P.opdater = function (dt) {
        this.tid += dt;
        var mig = this;
        if (this.flyv) {
            this.flyv.t += dt;
            if (this.flyv.t >= FLYV_TID) this.flyv = null;
        }
        if (this.retur) {
            this.retur.t += dt;
            if (this.retur.t >= FLYV_TID) this.retur = null;
        }
        if (this.nulstilSikker > 0) {
            this.nulstilSikker -= dt;
            if (this.nulstilSikker <= 0) { this.nulstilSikker = 0; this.visNulstil(); }
        }
        this.taster = this.taster.filter(function (t) { t.a -= dt * 5; return t.a > 0; });
        if (this.plakatPuls) this.plakatPuls.t += dt;

        /* Kuglerne glider mod deres plads og popper frem */
        if (this.lay) {
            var antal = {};
            this.kugler.forEach(function (k) { antal[k.ion.id] = (antal[k.ion.id] || 0) + 1; });
            this.kugler.forEach(function (k) {
                if (k.forsinket > 0) { k.forsinket -= dt; return; }
                k.t = Math.min(1, k.t + dt / 0.35);
                k.skala = NK.pop(k.t);
                var p = mig.kuglePlads(k.ion, k.nr, antal[k.ion.id]);
                k.x = NK.mod(k.x, p.x, 12, dt);
                k.y = NK.mod(k.y, p.y, 12, dt);
            });
        }

        /* Regnskabet: vis -> ned i glasset -> print -> paa glasset */
        var r = this.regn;
        if (r && r.fase !== "faerdig") {
            r.t += dt;
            if (r.fase === "viser" && r.t >= r.popSlut + 1.3) { r.fase = "ind"; r.t = 0; }
            else if (r.fase === "ind") {
                this.kugler.forEach(function (k) { k.ind = NK.klamp(r.t / 0.55, 0, 1); });
                if (r.t >= 0.6) { r.fase = "print"; r.t = 0; }
            } else if (r.fase === "print" && r.t >= 1.35) {
                r.fase = "faerdig";
                r.t = 0;
            }
        }

        if (this.ventRos) {
            this.ventRos.t -= dt;
            if (this.ventRos.t <= 0 && this.laererHylde) {
                var v = this.ventRos;
                this.ventRos = null;
                this.laererHylde(v.hylde, this.antalStjerner(v.hylde) === 10, v.alt);
            }
        }
        if (this.opdaterLaerer) this.opdaterLaerer(dt);
    };

    P.tegn = function () {
        var L = this.L, ctx = L.ctx, lay = this.lay;
        if (!lay) return;
        var mig = this, o = this.opg;
        Tg.rum(ctx, lay.W, lay.H, lay.bordY + 6);

        /* Plakaterne */
        ["pt", "ioner"].forEach(function (slags) {
            var p = lay.plakater[slags];
            var lys = mig.over && mig.over.slags === "plakat" && mig.over.i === slags ? 1 : 0;
            if (mig.plakatPuls && mig.plakatPuls.slags === slags) lys = Math.max(lys, 0.45 + 0.45 * Math.sin(mig.plakatPuls.t * 6));
            Tg.plakat(ctx, p.x, p.y, p.b, p.h, slags, {
                vinkel: slags === "pt" ? -0.012 : 0.018, lys: lys,
                fremhaev: slags === "pt" ? mig.fremhaevning("pt") : null
            });
        });

        /* Reolen og glassene */
        Tg.reol(ctx, lay.reol.x, lay.reol.y, lay.reol.b, lay.reol.h, lay.hylder, lay.tyk);
        this.stoffer.forEach(function (st, i) {
            if (i === mig.valgt) return;
            if (mig.retur && mig.retur.i === i) return;
            var p = lay.pladser[i], s = mig.status[i];
            var lys = mig.over && mig.over.slags === "glas" && mig.over.i === i ? 1 : 0;
            Tg.glas(ctx, p.x, p.y, p.h, st, { etiket: s.loest ? "ny" : "gammel", lys: lys, stjerne: s.stjerne ? 1 : 0 });
        });
        /* Den tomme plads, hvor glasset paa bordet hoerer til */
        if (this.valgt >= 0) {
            var tp = lay.pladser[this.valgt];
            ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
            ctx.setLineDash([4, 4]);
            ctx.lineWidth = 1;
            var tb = Tg.glasBredde(tp.h);
            NK.rundtRekt(ctx, tp.x - tb / 2 + 3, tp.y - tp.h + 3, tb - 6, tp.h - 4, 6);
            ctx.stroke();
            ctx.setLineDash([]);
        }
        D.HYLDER.forEach(function (h, nr) {
            Tg.skilt(ctx, lay.reol.x + 14, lay.hylder[nr] + lay.tyk + 3, h.navn, mig.antalLoest(nr) + "/10", h.farve);
        });

        /* Bordet, koppen og etiketmaskinen */
        Tg.bord(ctx, 0, lay.W, lay.bordY, lay.H + 10);
        if (this.retur) {
            var rt = NK.blod(this.retur.t / FLYV_TID), rp = lay.pladser[this.retur.i];
            var rs = this.status[this.retur.i];
            Tg.glas(ctx, NK.lerp(this.retur.fra.x, rp.x, rt), NK.lerp(this.retur.fra.y, rp.y, rt) - Math.sin(rt * Math.PI) * 40,
                NK.lerp(this.retur.fra.h, rp.h, rt), this.stoffer[this.retur.i],
                { etiket: this.retur.etiket, stjerne: rs.stjerne ? 1 : 0 });
        }
        var kop = this.g.kaffekop;
        if (!kop.skjult && !kop.iHaand) {
            var kk = NK.klamp(lay.H / 600, 0.8, 1.4);
            NK.Sprites.tegn(ctx, "kaffekop", lay.kop.x - 18 * kk, lay.kop.y - 40 * kk, 42 * kk, 40 * kk);
            if (this.over && this.over.slags === "kop") {
                ctx.strokeStyle = "rgba(242, 197, 61, 0.8)";
                ctx.lineWidth = 2;
                NK.rundtRekt(ctx, lay.kop.x - 22 * kk, lay.kop.y - 44 * kk, 50 * kk, 46 * kk, 6);
                ctx.stroke();
            }
        }

        var m = lay.maskine;
        Tg.maskine(ctx, m.x, m.y, m.b, this.displayIndhold());

        /* Glasset paa bordet */
        if (o && this.valgt >= 0) {
            var bp = this.bankPos();
            var ny = o.faerdig && (!this.regn || this.regn.fase === "faerdig");
            Tg.glas(ctx, bp.x, bp.y, bp.h, o.st, {
                etiket: ny ? "ny" : "gammel",
                fyld: 0.6,
                stjerne: ny && this.status[this.valgt].stjerne ? 1 : 0
            });
            if (!this.flyv) this.tegnKugler(ctx);
            this.tegnPrint(ctx);
        }

        /* Forklaringen over det glas, musen er over */
        if (this.over && this.over.slags === "glas") {
            var gi = this.over.i, gp = lay.pladser[gi], gst = this.stoffer[gi];
            var gs = this.status[gi];
            var linjer = [{ t: gs.loest ? gst.formelTekst + "  " + gst.navn : D.kendt(gst), px: 14 }];
            linjer.push({
                t: gs.loest ? (gs.stjerne ? "Løst uden hjælp ★" : "Løst") : "Mangler " + (gst.retning === "formel" ? "formlen" : "navnet"),
                px: 12, vaegt: "400", farve: gs.loest ? "#7ee0a8" : "#a9b0ba"
            });
            Tg.boble(ctx, gp.x, gp.y - gp.h - 4, linjer, lay.W);
        }

        if (this.laererTegnOver) this.laererTegnOver(ctx);
    };

    /* Det, der staar i etiketmaskinens display */
    P.displayIndhold = function () {
        var v = { taster: this.taster };
        var o = this.opg;
        if (!o) return v;
        var f = this.aktivtFelt();
        if (f) {
            var raa = f.input ? f.input.value : "";
            v.tekst = Tj.pynt(raa, f.slags, f.raekke.ion);
            v.tom = DISPLAY_TOM[f.slags];
            v.markoer = this.fokuseret && Math.floor(this.tid * 2) % 2 === 0;
        } else {
            v.tekst = o.st.retning === "formel" ? o.st.formelTekst : o.st.navn;
        }
        return v;
    };

    P.tegnKugler = function (ctx) {
        var lay = this.lay, r = this.kugleR(), mig = this;
        var regn = this.regn;
        var bp = this.bankPos();
        var aabning = { x: bp.x, y: bp.y - bp.h * 0.78 };
        this.kugler.forEach(function (k) {
            if (k.forsinket > 0) return;
            var x = k.x, y = k.y, rr = r * k.skala;
            if (k.ind > 0) {
                var t = NK.blod(k.ind);
                x = NK.lerp(k.x, aabning.x, t);
                y = NK.lerp(k.y, aabning.y, t) - Math.sin(t * Math.PI) * 30;
                rr = r * (1 - 0.8 * t);
                if (k.ind >= 1) return;
            }
            Tg.ion(ctx, x, y, k.ion, rr);
        });

        /* Summerne ud for raekkerne og nul til sidst */
        var st = this.opg.st;
        var o = lay.ionOmr;
        var vis = regn && regn.fase === "viser" ? NK.klamp((regn.t - regn.popSlut) / 0.35, 0, 1) : 0;
        if (vis > 0) {
            ctx.save();
            ctx.globalAlpha = vis;
            var sx = this.kuglePlads(st.katIon, Math.max(st.p, st.n) - 1, Math.max(st.p, st.n)).x + r + 10;
            ctx.textBaseline = "middle";
            ctx.textAlign = "left";
            ctx.font = "700 " + Math.round(NK.klamp(r * 0.8, 13, 19)) + "px 'Segoe UI', sans-serif";
            var yk = this.kuglePlads(st.katIon, 0, 1).y, ya = this.kuglePlads(st.anIon, 0, 1).y;
            ctx.fillStyle = "#f7a79d";
            ctx.fillText(NK.fortegn(st.p * st.katIon.q), sx, yk);
            ctx.fillStyle = "#97cff5";
            ctx.fillText(NK.fortegn(st.n * st.anIon.q), sx, ya);
            ctx.fillStyle = "#7ee0a8";
            ctx.textAlign = "center";
            ctx.fillText("i alt 0 ✓", (o.x0 + sx + 30) / 2, Math.min(o.y1 - 4, ya + r * 1.75));
            ctx.restore();
        }

        /* Hintet til formlen: hvor mange af hver? Et spoergsmaalstegn ved
           hver kugle og "i alt 0" ved siden af */
        if (this.regnHint && !this.opg.faerdig) {
            ctx.save();
            var br = NK.klamp(r * 0.46, 9, 13);
            this.kugler.forEach(function (k) {
                var bx = k.x + r * 0.78, by = k.y - r * 0.78;
                ctx.fillStyle = "#f2c53d";
                ctx.beginPath();
                ctx.arc(bx, by, br, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = "#1b1b21";
                ctx.font = "800 " + Math.round(br * 1.35) + "px 'Segoe UI', sans-serif";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText("?", bx, by + 1);
            });
            ctx.font = "700 " + Math.round(NK.klamp(r * 0.72, 13, 17)) + "px 'Segoe UI', sans-serif";
            ctx.textAlign = "left";
            ctx.textBaseline = "middle";
            ctx.fillStyle = "#f2c53d";
            var hx = Math.min(o.x1 - 50, this.kuglePlads(st.katIon, 0, 1).x + r * 2.2);
            ctx.fillText("i alt 0", hx, (this.kuglePlads(st.katIon, 0, 1).y + this.kuglePlads(st.anIon, 0, 1).y) / 2);
            ctx.restore();
        }
    };

    /* Den nye etiket: ud af maskinen og over paa glasset */
    P.tegnPrint = function (ctx) {
        var r = this.regn;
        if (!r || r.fase !== "print") return;
        var lay = this.lay, st = this.opg.st;
        var mm = Tg.maskineMaal(lay.maskine.x, lay.maskine.y, lay.maskine.b);
        var bp = this.bankPos();
        var e = Tg.etiketRekt(bp.x, bp.y, bp.h);
        var ud = NK.klamp(r.t / 0.7, 0, 1);
        var over = NK.blod(NK.klamp((r.t - 0.8) / 0.5, 0, 1));
        var cx0 = mm.slids.x - e.b / 2, cy0 = mm.slids.y;
        var cx = NK.lerp(cx0, e.x + e.b / 2, over);
        var cy = NK.lerp(cy0, e.y + e.h / 2, over) - Math.sin(over * Math.PI) * 30;
        ctx.save();
        if (over <= 0) {
            ctx.beginPath();
            ctx.rect(mm.slids.x - e.b * ud - 2, cy0 - e.h, e.b * ud + 2, e.h * 2);
            ctx.clip();
            cx = mm.slids.x - e.b * ud + e.b / 2;
        }
        Tg.friEtiket(ctx, cx, cy, e.b, e.h, st, (1 - over) * -0.04);
        ctx.restore();
    };

    /* ----- Musen ---------------------------------------------------------------- */
    P.hvadErUnder = function (pt) {
        var lay = this.lay;
        if (!lay) return null;
        if (this.laererUnder && this.laererUnder(pt.x, pt.y)) return { slags: "laerer" };
        var kop = this.g.kaffekop;
        if (!kop.skjult && !kop.iHaand && Math.abs(pt.x - lay.kop.x) < 30 && pt.y < lay.kop.y + 4 && pt.y > lay.kop.y - 60) {
            return { slags: "kop" };
        }
        var pl = lay.plakater;
        for (var navn in pl) {
            if (!Object.prototype.hasOwnProperty.call(pl, navn)) continue;
            var p = pl[navn];
            if (pt.x >= p.x && pt.x <= p.x + p.b && pt.y >= p.y && pt.y <= p.y + p.h) return { slags: "plakat", i: navn };
        }
        for (var i = 0; i < this.stoffer.length; i++) {
            if (i === this.valgt) continue;
            var g = lay.pladser[i], b = Tg.glasBredde(g.h);
            if (pt.x >= g.x - b / 2 && pt.x <= g.x + b / 2 && pt.y >= g.y - g.h - 4 && pt.y <= g.y + 4) return { slags: "glas", i: i };
        }
        return null;
    };

    P.koblMus = function () {
        var mig = this, c = this.L.canvas;
        c.addEventListener("pointermove", function (e) {
            var pt = mig.L.punkt(e);
            mig.over = mig.hvadErUnder(pt);
            c.style.cursor = mig.over ? "pointer" : "default";
        });
        c.addEventListener("pointerleave", function () { mig.over = null; c.style.cursor = "default"; });
        c.addEventListener("click", function (e) {
            var pt = mig.L.punkt(e);
            if (mig.laererKlik && mig.laererKlik(pt.x, pt.y)) return;
            var u = mig.hvadErUnder(pt);
            if (!u) return;
            if (u.slags === "kop" && mig.klikKop) { mig.klikKop(); return; }
            if (u.slags === "plakat") { NK.Opslag.aabn(u.i, mig.fremhaevning(u.i)); return; }
            if (u.slags === "glas") mig.vaelg(u.i);
        });
    };

    NK.SimLager = SimLager;
}());
