/* =====================================================================
   sim_lager.js - fane 1: lageret

   Tredive glas paa tre hylder har mistet halvdelen af etiketten. Man
   tager et glas ned paa arbejdsbordet og finder ionerne i panelet. Hver
   ion, man finder, dukker op som en kugle ved siden af glasset. Er
   formlen eller navnet rigtigt, laegges kuglerne i det antal, der faar
   ladningen til at gaa op, de ryger ned i glasset, og etiketmaskinen
   printer en ny etiket.

   Panelet er ét opgavekort med raekker: en pr. ion og én til sidst.
   Opgaven, hint, bedoemmelsen og knapperne staar paa papirkortet
   oeverst i scenen (6. nov. 2026, visSkort): Giv et hint giver foerst et
   hint og saa svaret til det felt, man staar i, og Indsend svar (eller
   Enter i feltet) tjekker feltet. Et forkert svar giver en besked, der
   passer til fejlen (js/tjek.js). Er glasset loest, bliver kortet paa
   opgaven med forklaringen, og Naeste glas staar, hvor Indsend svar stod.

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

    /* Spoergsmaalet paa kortet. Det kan staa alene (REGELSAET 5 og 7):
       det siger selv, hvilken ion eller hvilket stof det handler om.
       (22. nov. 2026, T7; foer "Skriv ionen for natrium i feltet i panelet") */
    function bestemt(navn) {
        return /ion$/.test(navn) ? navn + "en" : navn + "ionen";
    }
    function spoergsmaal(f, st) {
        var i = f.raekke.ion;
        if (f.slags === "ion") {
            return st.retning === "formel" ? "Hvad er formlen for " + bestemt(i.navn) + "?"
                : "Hvilken ion er " + NK.formel(i.formel) + " i " + st.formelTekst + "?";
        }
        if (f.slags === "ionnavn") return "Hvad hedder ionen " + i.tekst + "?";
        if (f.slags === "formel") return "Hvad er formlen for " + st.navn + "?";
        return "Hvad hedder " + st.formelTekst + "?";
    }

    /* ----- Tre svar at vaelge imellem ------------------------------------
       Paa det foerste glas paa hver hylde vaelger eleven mellem tre svar
       (REGELSAET 14). De forkerte er fejl, elever faktisk laver, og
       forklaringen til hvert er den samme, som tjekket giver, naar fejlen
       bliver skrevet (js/tjek.js). Svarene er raa tekst som det, eleven
       ellers ville skrive, og vises med haevet og saenket skrift. */
    function rigtigRaa(f, st) {
        var i = f.raekke && f.raekke.ion;
        if (f.slags === "ion") return i.formel + (Math.abs(i.q) > 1 ? Math.abs(i.q) : "") + (i.q > 0 ? "+" : "-");
        if (f.slags === "ionnavn") return i.navn;
        if (f.slags === "formel") return st.formel;
        return st.navn;
    }

    function bygFormel(k, a, p, n, uden) {
        function del(ion, antal) {
            if (antal <= 1) return ion.formel;
            return ion.sammensat && !uden && ion.formel.length > 1 ? "(" + ion.formel + ")" + antal : ion.formel + antal;
        }
        return del(k, p) + del(a, n);
    }

    function kandidater(f, st) {
        var i = f.raekke && f.raekke.ion, k = st.katIon, a = st.anIon, R = D.ROM;
        if (f.slags === "ion") {
            var m = Math.abs(i.q), t = i.q > 0 ? "+" : "-", mod = i.q > 0 ? "-" : "+";
            var c = [i.formel + (m > 1 ? m : "") + mod, i.formel];
            if (!i.sammensat && i.q < 0 && i.gruppe > 1) c.push(i.formel + i.gruppe + "-");
            if (i.beregnes) c.push(i.formel + (m + 1) + t);
            if (m > 1) c.push(i.formel + (m - 1 > 1 ? m - 1 : "") + t);
            c.push(i.formel + (m + 1) + t);
            return c;
        }
        if (f.slags === "ionnavn") {
            if (i.q > 0) {
                var p = [];
                if (i.variabel) {
                    p.push(i.stamme + "ion");
                    if (R[i.q + 1]) p.push(i.stamme + "(" + R[i.q + 1] + ")ion");
                    if (i.q > 1) p.push(i.stamme + "(" + R[i.q - 1] + ")ion");
                }
                p.push(i.grundnavn || i.stamme, i.stamme + "id");
                if (i.id === "NH4") p.unshift("ammoniak");
                return p;
            }
            return [i.navn + "ion", i.grundnavn || i.navn.replace(/at$/, "it"), i.navn.replace(/at$/, "id"),
                i.navn.replace(/id$/, "at"), i.navn.replace(/at$/, "it")];
        }
        if (f.slags === "formel") {
            return [bygFormel(k, a, st.n, st.p), bygFormel(k, a, 1, 1), bygFormel(k, a, st.p, st.n, true),
                bygFormel(k, a, Math.abs(k.q), Math.abs(a.q)), bygFormel(k, a, st.p, st.n + 1),
                bygFormel(k, a, st.p + 1, st.n), bygFormel(k, a, 2 * st.p, 2 * st.n)];
        }
        var c2 = [];
        if (k.variabel) {
            c2.push(k.stamme + a.navn);
            if (R[k.q + 1]) c2.push(k.stamme + "(" + R[k.q + 1] + ")" + a.navn);
            if (k.q > 1) c2.push(k.stamme + "(" + R[k.q - 1] + ")" + a.navn);
        }
        if (!a.sammensat) c2.push(k.saltdel + a.grundnavn);
        c2.push(k.navn + a.navn, k.saltdel + a.navn.replace(/at$/, "it"), k.saltdel + a.navn.replace(/at$/, "id"),
            k.saltdel + a.navn.replace(/id$/, "at"), a.navn + k.saltdel);
        if (st.n > 1) c2.push(k.saltdel + (st.n === 2 ? "di" : "tri") + a.navn);
        return c2;
    }

    /* Svaret er forkert, og beskeden siger noget om fejlen (ikke kun "Tjek skrivemaaden") */
    function forkertSvar(f, st, raa) {
        var r;
        if (f.slags === "ion") r = Tj.ion(raa, f.raekke.ion, st, st.retning);
        else if (f.slags === "ionnavn") r = Tj.ionNavn(raa, f.raekke.ion);
        else if (f.slags === "formel") r = Tj.formel(raa, st);
        else r = Tj.navn(raa, st);
        return !!(r && !r.ok && !r.tom && r.besked && !/^Næsten|Tjek skrivemåden/.test(r.besked));
    }

    function valgFor(f, st) {
        var ret = rigtigRaa(f, st), ion = f.raekke && f.raekke.ion;
        var set = [Tj.pynt(ret, f.slags, ion)], forkerte = [];
        kandidater(f, st).forEach(function (c) {
            var vist = Tj.pynt(c, f.slags, ion);
            if (forkerte.length >= 2 || !c || set.indexOf(vist) >= 0 || !forkertSvar(f, st, c)) return;
            set.push(vist);
            forkerte.push(c);
        });
        /* Det rigtige svar staar ikke altid samme sted */
        var alle = forkerte.slice(), h = 0, noegle = st.id + f.slags + (f.ri || 0);
        for (var j = 0; j < noegle.length; j++) h = (h * 31 + noegle.charCodeAt(j)) % 997;
        alle.splice(h % (forkerte.length + 1), 0, ret);
        return alle;
    }

    function SimLager() {
        this.L = new NK.Laerred(NK.el("lager-laerred"));
        this.tid = 0;
        /* Fremskridtet huskes pr. stof for alle 41, saa intet gaar tabt,
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
        this.besked(NK.indstil.svaer
            ? D.stort(D.SVAER_ANTAL_ORD) + " glas har fået sværere ioner. De nye sammensatte ioner står på plakaten."
            : "Reolen har igen de almindelige ioner.", "peger");
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
        lay.bordY = Math.round(H * 0.87);

        /* Reolen er saa bred og hoej, som bordet og plakaterne tillader,
           saa glassene paa hylderne bliver store nok til, at etiketten kan
           laeses. Glassets bredde bestemmer hoejden; reolen er ikke hoejere,
           end glassene kraever, og det store glas paa bordet faar resten,
           dog mindst storMin, saa dets etiket altid kan laeses. */
        /* Uden panel (22. nov. 2026) er scenen bred. Reolen og plakaterne
           staar samlet i midten (REGELSAET 32): glassene bliver ikke
           bredere, end hoejden tillader, og hullet til plakaterne er fast. */
        var ry = this.top();
        lay.tyk = NK.klamp(H * 0.018, 8, 14);
        /* Skiltet sidder paa hyldebraettet og naar lidt under det */
        lay.skiltUnder = 20 + 1 - lay.tyk;
        var luft = lay.skiltUnder + 5;
        /* Papirkortet tager toppen, saa reolen maa gaa lidt laengere ned
           end foer kortet (H * 0.62 og storMin 150; nu hoejst 130) */
        var storMin = NK.klamp(H * 0.2, 100, 130);
        var rhMax = Math.min(H * 0.70 - ry, lay.bordY - storMin - 34 - ry);
        var pb = NK.klamp(W * 0.17, 140, 240);
        var mellemrum = NK.klamp(W * 0.015, 12, 24);
        var kant = Math.max(10, W * 0.015);
        var hoejesteGlas = Math.max(30, (rhMax - lay.tyk) / 3 - lay.tyk - luft);
        var slotH = Tg.glasBredde(hoejesteGlas) / 0.88 * 1.12;
        lay.slot = Math.min((W - 2 * kant - mellemrum - pb - 24) / 10, slotH);
        var rb = lay.slot * 10 + 24;
        var gruppe = rb + mellemrum + pb;
        var rx = Math.max(kant, (W - gruppe) / 2);
        var breddeH = lay.slot * 0.88 / 0.77;
        var rh = Math.min(3 * (breddeH + lay.tyk + luft) + lay.tyk, rhMax);
        lay.reol = { x: rx, y: ry, b: rb, h: rh };
        /* Kortet staar over reolen og plakaterne og er mindst 1100 px bredt,
           naar scenen har plads, saa et langt hint ikke goer det hoejt */
        var kb = Math.min(W - 24, Math.max(gruppe, 1100));
        lay.kort = { x: Math.max(12, rx + gruppe / 2 - kb / 2), b: kb };
        var rum = (rh - lay.tyk) / 3;
        lay.hylder = [0, 1, 2].map(function (i) { return ry + lay.tyk + rum * (i + 1) - lay.tyk; });
        lay.lilleH = Math.max(30, Math.min(breddeH, rum - lay.tyk - luft));
        lay.pladser = this.stoffer.map(function (st) {
            return { x: rx + 12 + lay.slot * (st.pladsPaaHylde + 0.5), y: lay.hylder[st.hylde], h: lay.lilleH };
        });

        /* Plakaterne i en smal soejle til hoejre for reolen */
        var px = rx + rb + mellemrum;
        var ptH = NK.klamp(pb * 0.52, 60, rh * 0.45);
        lay.plakater = {
            pt: { x: px, y: ry + 6, b: pb, h: ptH },
            ioner: { x: px + pb * 0.04, y: ry + 6 + ptH + NK.klamp(rh * 0.06, 10, 22), b: pb * 0.92,
                     h: NK.klamp(rh - ptH - 34, 80, 230) }
        };

        /* Arbejdsbordet: det store glas, kuglerne og etiketmaskinen, samlet
           under reolen */
        var gx = rx, gb = rx + gruppe <= W ? gruppe : W - rx;
        lay.storH = NK.klamp(Math.min(H * 0.3, gb * 0.3, lay.bordY - (ry + rh + 34)), 100, 290);
        lay.stor = { x: gx + Math.max(gb * 0.13, Tg.glasBredde(lay.storH) / 2 + 12), y: lay.bordY };
        var mb = NK.klamp(gb * 0.25, 130, 300);
        var mh = mb * 150 / 240;
        /* Maskinen staar til venstre for plakatsoejlen, saa knappen Saet alle
           glas tilbage under plakaterne ikke rammer den */
        var mx = Math.min(gx + gb * 0.58, gx + gb - mb - 70);
        var stoerHoejre = lay.stor.x + Tg.glasBredde(lay.storH) / 2;
        if (px - mb - 16 - 14 - (stoerHoejre + 16) >= 140) mx = Math.min(mx, px - mb - 16);
        lay.maskine = { x: mx, y: lay.bordY - mh * 0.95, b: mb };
        var jarHoejre = lay.stor.x + Tg.glasBredde(lay.storH) / 2;
        lay.ionOmr = {
            x0: jarHoejre + 16, x1: lay.maskine.x - 14,
            y0: lay.bordY - lay.storH * 0.98, y1: lay.bordY - 14
        };
        lay.kop = { x: Math.min(gx + gb - 24, lay.maskine.x + mb + 40), y: lay.bordY };
        this.lay = lay;
        this.kortRamme();

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

        /* Knapperne i scenen: Saet alle glas tilbage under plakaterne, Oev
           glasset igen midt paa den tomme plads ved glasset paa bordet */
        var nk = this.el && this.el.nulstil, ok = this.el && this.el.oev;
        if (nk) {
            nk.style.left = Math.round(px + pb / 2) + "px";
            nk.style.top = Math.round(lay.plakater.ioner.y + lay.plakater.ioner.h + 14) + "px";
        }
        if (ok) {
            ok.style.left = Math.round((lay.ionOmr.x0 + lay.ionOmr.x1) / 2) + "px";
            ok.style.top = Math.round((lay.ionOmr.y0 + lay.ionOmr.y1) / 2) + "px";
        }
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
    /* Der er intet panel paa lageret (22. nov. 2026, T7): reolen er
       opgavelisten, feltet staar paa kortet, og de to knapper til at
       begynde forfra staar i scenen (Oev glasset igen ved glasset paa
       bordet, Saet alle glas tilbage under plakaterne). */
    P.bygPanel = function () {
        var mig = this;
        this.el = {
            skort: NK.el("lager-skort"),
            oev: NK.el("lager-oev"),
            nulstil: NK.el("lager-nulstil")
        };
        this.el.oev.addEventListener("click", function () {
            mig.el.oev.blur();
            if (mig.opg && mig.opg.gennemsyn) mig.nyOpgave(false);
        });
        this.beskedH = "";
        this.beskedK = "";
        this.el.skort.addEventListener("click", function (e) {
            var b = e.target.closest ? e.target.closest("button") : null;
            if (!b) return;
            b.blur();
            if (b.hasAttribute("data-videre")) mig.videre();
            else if (b.hasAttribute("data-valg")) mig.vaelgSvar(parseInt(b.getAttribute("data-valg"), 10));
            else if (b.classList.contains("hjaelp")) mig.knap();
            else if (b.classList.contains("indsend")) mig.indsend();
        });

        /* Feltet paa kortet. Det er det samme element hele tiden og flyttes
           ind i kortet, hver gang kortet tegnes om, saa markoeren bliver. */
        var inp = document.createElement("input");
        inp.type = "text";
        inp.className = "lager-felt";
        ["autocomplete", "autocapitalize", "autocorrect"].forEach(function (a) { inp.setAttribute(a, "off"); });
        inp.setAttribute("spellcheck", "false");
        inp.addEventListener("keydown", function (e) {
            if (e.key !== "Enter") return;
            e.preventDefault();
            /* Under praesentationen er Enter Naeste (feltet har markoeren) */
            if (mig.laererIIntro && mig.laererIIntro()) { mig.introNaeste(); return; }
            mig.tjek();
        });
        inp.addEventListener("input", function () { inp.classList.remove("ryst"); mig.tast(); });
        inp.addEventListener("focus", function () { mig.fokuseret = true; });
        inp.addEventListener("blur", function () { mig.fokuseret = false; });
        this.felt = inp;

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
        NK.saetHTML("lager-nulstil", this.nulstilSikker > 0 ? "↺ Sikker? Klik igen" : "↺ Sæt alle glas tilbage");
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
            hjaelp: 0, brugtSvar: false, faerdig: false, gennemsyn: !!gennemsyn,
            /* Foerste glas paa hver hylde: tre svar at vaelge imellem */
            valg: !gennemsyn && st.pladsPaaHylde === 0, valgtRaa: null
        };
        this.kugler = [];
        this.regn = null;
        this.etiketFlyv = null;
        this.plakatPuls = null;
        this.regnHint = false;
        this.beskedH = "";
        this.beskedK = "";
        this.pegHint = false;

        if (gennemsyn) {
            var mig = this;
            felter.forEach(function (f) { f.status = "ok"; f.vaerdi = mig.korrekt(f); });
            this.opg.k = felter.length;
            this.opg.faerdig = true;
            this.fuldeKugler();
        } else {
            this.aktiver(felter[0]);
        }
        this.visKort();
        if (!gennemsyn) this.fokus();
    };

    /* Feltet f er det, kortet spoerger om nu */
    P.aktiver = function (f) {
        var o = this.opg;
        f.status = "aktiv";
        o.valgtRaa = null;
        if (o.valg) {
            f.input = null;
            f.valg = valgFor(f, o.st);
            f.forkerte = {};
        } else {
            f.input = this.felt;
            var ph = PLADSHOLDER[f.slags];
            if (f.slags === "ionnavn" && f.raekke.ion.q < 0) ph = PLADSHOLDER.ionnavnMinus;
            this.felt.value = "";
            this.felt.placeholder = ph;
            this.felt.setAttribute("aria-label", spoergsmaal(f, o.st));
            this.felt.classList.remove("ryst");
        }
    };

    /* Et af de tre svar er valgt. Det vaelger kun; Indsend svar tjekker. */
    P.vaelgSvar = function (nr) {
        var o = this.opg, f = this.aktivtFelt();
        if (!o || !o.valg || !f || !f.valg || f.valg[nr] === undefined) return;
        if (f.forkerte[f.valg[nr]]) return;
        o.valgtRaa = f.valg[nr];
        this.visSkort();
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

    P.fokus = function () {
        var f = this.aktivtFelt();
        if (f && f.input && document.getElementById("fane-lager").classList.contains("aktiv") &&
            !document.querySelector(".overlay.vis") && !(NK.Rundvisning && NK.Rundvisning.aktiv())) {
            try { f.input.focus({ preventScroll: true }); } catch (e) { f.input.focus(); }
        }
    };

    /* Kortet og knapperne i scenen. Hylderne viser selv, hvor mange glas
       der er loest (skiltene), og glassene har stjernerne. */
    P.visKort = function () {
        var o = this.opg;
        if (this.el.oev) this.el.oev.hidden = !(o && o.faerdig && o.gennemsyn);
        this.visSkort();
    };
    P.opdaterFremskridt = function () {};

    /* ----- Papirkortet ------------------------------------------------------------
       Den hoejde, kortet har faaet sat af oeverst i scenen. Reolen begynder
       under top(). Selvtesten maaler kortet med det laengste hint, den
       laengste fejlbesked og den laengste forklaring i en almindelig og en
       lav skaerm. Kortet har tre linjer: glasset, spoergsmaalet og feltet
       med beskeden og knapperne (22. nov. 2026). */
    P.kortZone = function () {
        return window.innerHeight <= 720 ? 136 : 158;
    };

    P.top = function () { return 10 + this.kortZone() + 10; };

    /* Kortet staar over reolen og plakaterne, som staar under kortZone */
    P.kortRamme = function () {
        var e = this.el && this.el.skort, r = this.lay && this.lay.kort;
        if (!e || !r) return;
        e.style.left = Math.round(r.x) + "px";
        e.style.width = Math.round(r.b) + "px";
    };

    P.kanSendes = function () {
        var o = this.opg, f = this.aktivtFelt();
        if (!f) return false;
        if (o.valg) return !!o.valgtRaa;
        return !!(f.input && f.input.value.trim());
    };

    /* Indledningen: hvilket stof, og hvad der skal findes */
    P.indledning = function (st) {
        var stof = st.retning === "formel" ? NK.html(st.navn) : NK.html(st.formelTekst);
        return "Find ionerne i " + stof + ", og skriv " + (st.retning === "formel" ? "formlen." : "navnet.");
    };

    P.visSkort = function () {
        var o = this.opg, e = this.el && this.el.skort;
        if (!o || !e) return;
        var st = o.st, mig = this;
        var chip = '<span class="sk-chip">Glas ' + (st.pladsPaaHylde + 1) + " af 10</span> ";
        var html, kl, medFelt = false;
        if (o.faerdig) {
            var stjerne = this.status[this.valgt] && this.status[this.valgt].stjerne;
            var vist = !o.gennemsyn && o.brugtSvar;
            var maerke = o.gennemsyn ? (stjerne ? "Løst uden hjælp ★" : "Løst") : (vist ? "Løst med hjælp" : "Rigtigt");
            /* Svaret paa det sidste felt (uden sit maerke) eller selve svaret, og saa fakta */
            var note = o.gennemsyn ? "" : (o.slutNote || "").replace(/<span class="b-maerke">[^<]*<\/span>/g, "");
            var forkl = (note ? note + " " : "<b>" + NK.html(st.retning === "formel" ? st.formelTekst : st.navn) + "</b> er " +
                (st.retning === "formel" ? "formlen" : "navnet") + ". ") + NK.html(st.fakta);
            kl = "scenekort loest bliv" + (vist ? " svar" : "");
            html = '<p class="sk-tekst">' + chip + (o.gennemsyn
                    ? "Glasset med " + NK.html(D.kendt(st)) + " har allerede fået en ny etiket."
                    : this.indledning(st)) + "</p>" +
                (this.beskedK === "peger" && this.beskedH ? '<p class="sk-trin">' + this.beskedH + "</p>" : "") +
                NK.Papir.bliv(forkl, maerke, "Næste glas →", vist);
        } else {
            var f = this.aktivtFelt();
            kl = "scenekort opgave";
            var svar;
            if (o.valg) {
                svar = '<div class="sk-valg">' + f.valg.map(function (raa, nr) {
                    var forkert = f.forkerte[raa];
                    return '<button type="button" class="sk-knap' + (forkert ? " forkert" : "") +
                        (raa === o.valgtRaa ? " valgt" : "") + '" data-valg="' + nr + '"' + (forkert ? " disabled" : "") + ">" +
                        NK.html(Tj.pynt(raa, f.slags, f.raekke && f.raekke.ion)) + "</button>";
                }).join("") + "</div>";
            } else {
                svar = '<span class="sk-felt-plads"></span>';
                medFelt = true;
            }
            html = '<p class="sk-tekst">' + chip + this.indledning(st) + "</p>" +
                '<p class="sk-trin"><b>' + NK.html(spoergsmaal(f, st)) + "</b></p>" +
                '<div class="sk-svarrad">' + svar +
                '<div class="sk-bund' + (this.beskedK ? " " + this.beskedK : "") + (this.beskedH ? "" : " tom") + '">' +
                '<p class="st-tekst">' + this.beskedH + "</p></div>" +
                '<button type="button" class="knap hjaelp' + (o.hjaelp ? " svar" : "") + (this.pegHint ? " peg" : "") + '">' +
                (o.hjaelp ? "Vis svaret" : "Giv et hint") + "</button>" +
                '<button type="button" class="knap indsend ' + (this.kanSendes() ? "klar" : "ikke-klar") + '">Indsend svar</button></div>';
        }
        /* Feltet beholder markoeren, naar kortet tegnes om */
        var inp = this.felt, fokus = document.activeElement === inp;
        var a = 0, b = 0;
        if (fokus) { try { a = inp.selectionStart; b = inp.selectionEnd; } catch (x) { /* intet */ } }
        if (e.className.replace(" blink", "") !== kl) e.className = kl;
        e.innerHTML = html;
        var plads = medFelt ? e.querySelector(".sk-felt-plads") : null;
        if (plads) {
            plads.parentNode.replaceChild(inp, plads);
            if (fokus) {
                try { inp.focus({ preventScroll: true }); inp.setSelectionRange(a, b); } catch (x) { mig.fokus(); }
            }
        }
    };

    /* Indsend svar er graa, til der staar noget i feltet */
    P.visIndsend = function () {
        var b = this.el && this.el.skort.querySelector(".indsend");
        if (!b) return;
        var klar = this.kanSendes();
        b.classList.toggle("klar", klar);
        b.classList.toggle("ikke-klar", !klar);
    };

    P.kortBlink = function () {
        var e = this.el.skort;
        e.classList.remove("blink");
        void e.offsetWidth;
        e.classList.add("blink");
    };

    P.besked = function (html, klasse) {
        this.beskedH = html || "";
        this.beskedK = html ? (klasse || "") : "";
        this.visSkort();
    };

    /* Indsend svar paa kortet: det samme som Enter i feltet */
    P.indsend = function () {
        if (!this.kanSendes()) { this.kortBlink(); this.fokus(); return; }
        this.tjek();
    };

    /* Kortets groenne knap gaar altid fremad (brugeren 3. nov. 2026) */
    P.videre = function () {
        this.vaelg(this.naesteUloeste(this.valgt));
    };

    /* Giv et hint -> Vis svaret (til det felt, eleven staar i) */
    P.knap = function () {
        var o = this.opg;
        if (o.faerdig) { this.videre(); return; }
        var f = this.aktivtFelt();
        var h = D.hjaelp(o.st, f.raekke, f);
        this.pegHint = false;
        if (o.hjaelp === 0) {
            o.hjaelp = 1;
            if (h.plakat) this.plakatPuls = { slags: h.plakat, t: 0, fremhaev: h.fremhaev || null };
            if (h.regnskab) this.regnHint = true;
            this.besked('<span class="b-maerke">Hint</span>' + h.hint, "hint");
            this.fokus();
        } else {
            o.brugtSvar = true;
            this.feltRigtigt(f, "svar", '<span class="b-maerke">Svaret</span>' + h.svar);
        }
    };

    /* Det, der skal slaas op, naar hintet peger paa en plakat */
    P.fremhaevning = function (slags) {
        var p = this.plakatPuls;
        return p && p.slags === slags ? p.fremhaev : null;
    };

    P.tast = function () {
        this.taster.push({ i: Math.floor(Math.random() * 30), a: 1 });
        this.visIndsend();
    };

    P.tjek = function () {
        var o = this.opg, f = this.aktivtFelt();
        if (!f) return;
        var st = o.st, raa = o.valg ? (o.valgtRaa || "") : (f.input ? f.input.value : "");
        var res;
        if (f.slags === "ion") res = Tj.ion(raa, f.raekke.ion, st, st.retning);
        else if (f.slags === "ionnavn") res = Tj.ionNavn(raa, f.raekke.ion);
        else if (f.slags === "formel") res = Tj.formel(raa, st);
        else res = Tj.navn(raa, st);

        if (res.tom) {
            this.besked(o.valg ? "Vælg et af de tre svar, og tryk Indsend svar." : res.besked, "peger");
            this.kortBlink();
            this.fokus();
            return;
        }
        if (res.ok) {
            this.feltRigtigt(f, "ok", res.note || "");
            return;
        }
        f.forsoeg++;
        this.pegHint = true;
        /* Et forkert valg bliver roedt og kan ikke vaelges igen */
        if (o.valg) { f.forkerte[raa] = true; o.valgtRaa = null; }
        this.besked(res.besked, "skidt");
        if (!o.valg && this.felt) {
            this.felt.classList.remove("ryst");
            void this.felt.offsetWidth;
            this.felt.classList.add("ryst");
        }
        this.fokus();
    };

    /* Et felt er klaret, enten rigtigt eller ved at se svaret */
    /* note: svaret eller en bemaerkning til feltet. Den staar under det
       naeste felt, eller i forklaringen, naar glasset er loest. */
    P.feltRigtigt = function (f, maade, note) {
        var o = this.opg;
        f.status = maade;
        f.vaerdi = this.korrekt(f);
        if (f.slags === "ion") this.nyKugle(f.raekke.ion);
        o.hjaelp = 0;
        this.pegHint = false;
        this.plakatPuls = null;
        this.beskedH = note || "";
        this.beskedK = note ? "gul" : "";
        o.slutNote = note || "";
        if (o.k >= o.felter.length - 1) {
            o.k = o.felter.length;
            this.loes();
        } else {
            o.k++;
            this.aktiver(o.felter[o.k]);
        }
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
        var h = o.st.hylde;
        if (!foer && this.antalLoest(h) === 10 && !this.rost[h]) {
            this.rost[h] = true;
            this.ventRos = { t: 3.2, hylde: h, alt: this.antalLoest() === this.stoffer.length };
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

    /* ----- Kemichaels praesentation ------------------------------------------
       Foerste gang fanen aabnes i en browser, staar tilbuddet (js/app.js
       pakker startIntro ind), og K viser den igen. Selve praesentationen
       er den faelles (../kemichael/praesentation.js): trinnene staar i
       hans taleboble med Naeste og Spring praesentationen over. Esc sender
       ham ud. Man kan skrive og klikke paa scenen, mens han taler. */
    P.startIntro = function (tving) {
        if (!this.laererIntro) return;
        /* Intet tilbud paa lageret (22. nov. 2026, T7): kun K viser den */
        if (!tving) return;
        NK.gem("nk-sc2.3-intro", true);
        this.introVent = tving ? 0.1 : 0.9;
    };

    P.springIntro = function () {
        this.introVent = 0;
        return !!(this.laererIntroVaek && this.laererIntroVaek());
    };

    /* Hvert billede: ventetiden og taleboblen */
    P.opdaterIntro = function (dt) {
        if (this.introVent > 0) {
            this.introVent -= dt;
            if (this.introVent <= 0 && this.laererIntro) this.laererIntro();
        }
        if (this.introOpdaterBoble && (this.kmIntro || this.kmBobleAktiv)) this.introOpdaterBoble();
    };

    /* Enter uden for et felt: videre til naeste glas, naar det er loest */
    P.enter = function () {
        if (this.opg && this.opg.faerdig) this.videre();
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
        this.opdaterIntro(dt);
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
            Tg.skilt(ctx, lay.reol.x + 14, lay.hylder[nr] + 1, h.navn, mig.antalLoest(nr) + "/10", h.farve);
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
            if (gst.fare) linjer.push({ t: "Faremærke: " + D.FARE_NAVN[gst.fare], px: 12, vaegt: "400", farve: "#f0918a" });
            Tg.boble(ctx, gp.x, gp.y - gp.h - 4, linjer, lay.W, gp.y + lay.tyk);
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
            /* Displayet viser kun det, der er skrevet eller valgt, og peger
               ingen steder hen (REGELSAET 1: to steder at kigge) */
            var raa = o.valg ? (o.valgtRaa || "") : (f.input ? f.input.value : "");
            v.tekst = Tj.pynt(raa, f.slags, f.raekke.ion);
            v.tom = "";
            v.markoer = !o.valg && this.fokuseret && Math.floor(this.tid * 2) % 2 === 0;
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

        /* Navnet paa en ion, eleven har fundet, staar under kuglen, saa det
           kan bruges i stoffets navn (det stod foer i panelet) */
        var o0 = this.opg;
        if (o0 && !o0.faerdig) {
            ctx.save();
            ctx.textAlign = "left";
            ctx.textBaseline = "middle";
            ctx.font = "600 " + Math.round(NK.klamp(r * 0.62, 13, 16)) + "px 'Segoe UI', sans-serif";
            ctx.fillStyle = "#e6e9ee";
            o0.felter.forEach(function (f) {
                if (f.slags !== "ionnavn" || (f.status !== "ok" && f.status !== "svar")) return;
                mig.kugler.forEach(function (k) {
                    if (k.ion === f.raekke.ion && k.nr === 0 && k.skala > 0.5) ctx.fillText(f.raekke.ion.navn, k.x + r + 10, k.y);
                });
            });
            ctx.restore();
        }

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
        var e = Tg.etiketRekt(bp.x, bp.y, bp.h, bp.h < 110);
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
        var m = lay.maskine, mh = m.b * 150 / 240;
        if (this.aktivtFelt() && !this.opg.valg && pt.x >= m.x && pt.x <= m.x + m.b && pt.y >= m.y && pt.y <= m.y + mh) return { slags: "maskine" };
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
            if (mig.laererIntroKlik && mig.laererIntroKlik(pt.x, pt.y)) return;
            if (mig.laererKlik && mig.laererKlik(pt.x, pt.y)) return;
            var u = mig.hvadErUnder(pt);
            if (!u) return;
            if (u.slags === "kop" && mig.klikKop) { mig.klikKop(); return; }
            if (u.slags === "maskine") { mig.fokus(); return; }
            if (u.slags === "plakat") { NK.Opslag.aabn(u.i, mig.fremhaevning(u.i)); return; }
            if (u.slags === "glas") mig.vaelg(u.i);
        });
    };

    NK.SimLager = SimLager;
}());
