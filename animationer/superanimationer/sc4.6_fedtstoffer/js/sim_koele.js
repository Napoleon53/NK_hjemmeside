/* =====================================================================
   sim_koele.js - fane 2: Koeleskabet

   Et koekken med fire steder: fryseren (-18 °C), koeleskabet (5 °C),
   koekkenbordet (20 °C) og vindueskarmen i solen (35 °C). Paa bordet
   staar glas med smoer, kakaosmoer, olivenolie, solsikkeolie og
   hoerfroeolie, og det fedt, eleven byggede paa fane 1. Et glas kan
   traekkes hen til et andet sted; fedtet i glasset bliver fast, delvist
   fast eller flydende (NK.Fedt.fastAndel), og zoomvinduet viser
   molekylerne i det valgte glas (NK.Proeve): de faste ligger i raekker,
   de flydende bevaeger sig.

   Opgaverne i panelet: gaet foerst (fast, delvist fast eller flydende),
   saa flytter glasset derhen og viser svaret. Til sidst: hvorfor?
   Knappen: Giv hint -> Vis svaret -> Naeste opgave. Til sidst gaar
   den videre til fabrikken (fane 1); R starter forfra. Kemichael roser
   kun foerste gang.

   Paaskeaegget: staar smoerret i solen i 12 sekunder, gaar der tre uger.
   Smoerret bliver harskt (hydrolyse: der dannes smoersyre), og
   Kemichael kommer med nyt smoer.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var F = NK.Fedt;
    var Tg = NK.Tegn;
    var Proeve = NK.Proeve;

    var NOEGLE = "nk-sc6.6-koele";
    var SVAR = ["fast", "delvist", "flydende"];

    function SimKoele() {
        this.L = new NK.Laerred(NK.el("koele-laerred"));
        this.tid = 0;
        this.lay = null;
        this.over = null;
        this.traek = null;
        /* Ingen kop paa denne fane: der er ikke plads paa bordet */
        this.g = { kaffekop: { skjult: true, iHaand: false } };
        this.lagAlleGlas();
        this.valgt = this.glas[0];
        this.opgNr = 0;
        this.trin = "gaet";
        this.hjaelp = 0;
        this.forkert = [];
        this.gaettet = null;
        this.harskVent = 0;
        this.harskTekst = 0;
        this.bygPanel();
        this.bygTilbud();
        this.koblMus();
        if (this.laererStart) this.laererStart();
        this.visOpgave();
    }

    var P = SimKoele.prototype;

    /* ----- Glassene -------------------------------------------------------------------- */
    P.lagAlleGlas = function () {
        var mig = this;
        this.glas = D.FEDT.map(function (f, i) { return mig.nytGlas(f, i); });
        this.glas.push(this.nytGlas(this.ditFedt(), D.FEDT.length));
    };

    P.nytGlas = function (fedt, plads) {
        return {
            id: fedt.id, fedt: fedt, sted: "bord", plads: plads,
            x: 0, y: 0, placeret: false, vinkel: 0, fastVis: -1,
            proeve: fedt.tom ? null : new Proeve(fedt, 20, 10),
            solTid: 0, harsk: false
        };
    };

    /* Fedtet fra fane 1 som et fedt paa linje med de rigtige */
    P.ditFedt = function () {
        var k = NK.ditFedt;
        if (!k) return { id: "dit", navn: "dit fedtstof", Navn: "Dit fedtstof", delt: ["Dit", "fedtstof"], tom: true, farve: "#f2cf4a", laag: "#9b6bd6" };
        var andel = { S: 0, O: 0, L: 0, Ln: 0 };
        k.forEach(function (id) { andel[id] += 100 / 3; });
        var n = F.antalDb(k);
        return {
            id: "dit", navn: "dit fedtstof", Navn: "Dit fedtstof", delt: ["Dit", "fedtstof"], kaeder: k.slice(), andel: andel,
            farve: Tg.blandHex("#f4ecd0", "#f0c63c", NK.klamp(n / 5, 0, 1)), laag: "#9b6bd6"
        };
    };

    /* Fane 1 kan have bygget et nyt fedt, siden vi var her sidst */
    P.fokus = function () {
        var nu = NK.ditFedt ? NK.ditFedt.join(",") : "";
        var gl = this.glasMedId("dit");
        var foer = gl.fedt.kaeder ? gl.fedt.kaeder.join(",") : "";
        if (nu === foer) return;
        var f = this.ditFedt();
        gl.fedt = f;
        gl.proeve = f.tom ? null : new Proeve(f, D.sted(gl.sted).T, 10);
        gl.fastVis = -1;
        if (!f.tom) this.vaelg(gl);
    };

    P.glasMedId = function (id) {
        for (var i = 0; i < this.glas.length; i++) if (this.glas[i].id === id) return this.glas[i];
        return null;
    };

    P.vaelg = function (gl) {
        if (!gl || gl.fedt.tom) return;
        this.valgt = gl;
        if (gl.proeve) gl.proeve.T = D.sted(gl.sted).T;
        this.visDeklaration();
    };

    /* ----- Layout ------------------------------------------------------------------------ */
    P.layout = function () {
        var W = this.L.b, H = this.L.h, lay = { W: W, H: H };
        var kant = NK.klamp(W * 0.014, 8, 16);
        lay.kant = kant;
        lay.bordY = Math.round(H * 0.85);
        var gh = NK.klamp(H * 0.13, 56, 86);
        lay.gh = gh;
        /* Koeleskabet staar paa gulvet til venstre */
        var fh = Math.min(H - 6, W * 0.24 * 520 / 220);
        lay.K = Tg.koeleskabMaal(kant, H - 1 - 4 * fh / 520, fh);
        var K = lay.K;
        /* Vinduet til hoejre, med karmen et stykke over bordet */
        var vb = NK.klamp(W * 0.21, 140, 250);
        var karmY = lay.bordY - Math.max(gh + 48, H * 0.2);
        var vs = vb / 240;
        if (karmY - 306 * vs < 10) { vs = (karmY - 10) / 306; vb = 240 * vs; }
        lay.V = Tg.vindueMaal(W - kant - vb, karmY, vb);
        var V = lay.V;
        /* Pladserne */
        var mig = this;
        function raekke(x0, x1, y, n) {
            var ud = [], d = (x1 - x0) / n;
            for (var i = 0; i < n; i++) ud.push({ x: x0 + d * (i + 0.5), y: y });
            return ud;
        }
        lay.pladser = {
            fryser: raekke(K.rumV + 6, K.rumH - 6, K.fryserGulv, 2),
            koele: raekke(K.rumV + 6, K.rumH - 6, K.koeleGulv, 2),
            bord: raekke(K.x + K.b + 16, W - kant - 8, lay.bordY, 6),
            sol: raekke(V.karmV + 16, V.karmH - 16, V.karmY, 2)
        };
        /* Glassene maa ikke vaere hoejere end rummene i skabet */
        var rum = Math.min(K.fryserGulv - K.fryserTop, K.koeleGulv - K.koeleTop) - 44;
        lay.gh = Math.min(gh, rum);
        /* Zonerne, der lyser, naar et glas holdes over dem */
        lay.zoner = {
            fryser: { x: K.rumV, y: K.fryserTop, b: K.rumH - K.rumV, h: K.fryserGulv - K.fryserTop + 8 },
            koele: { x: K.rumV, y: K.koeleTop, b: K.rumH - K.rumV, h: K.koeleGulv - K.koeleTop + 8 },
            sol: { x: V.x, y: V.top, b: V.b, h: V.karmY - V.top + 10 },
            bord: { x: K.x + K.b + 4, y: lay.bordY - lay.gh - 20, b: W - K.x - K.b - kant, h: lay.gh + 34 }
        };
        /* Zoomvinduet over bordet, mellem skabet og vinduet */
        var zx0 = K.x + K.b + 24, zx1 = V.x - 24;
        var zy0 = 34, zy1 = lay.bordY - lay.gh - 44;
        var zb = Math.min(zx1 - zx0, (zy1 - zy0) * 36 / 34);
        var zh = zb * 34 / 36;
        lay.zoom = { x: Math.round(zx0 + (zx1 - zx0 - zb) / 2), y: Math.round(zy0 + (zy1 - zy0 - zh) / 2), b: Math.round(zb), h: Math.round(zh) };
        lay.kop = { x: -200, y: lay.bordY };
        this.lay = lay;
        this.glas.forEach(function (gl) { if (!gl.placeret) { var p = mig.pladsPos(gl); gl.x = p.x; gl.y = p.y; gl.placeret = true; } });
        this.saetAnker("koele-anker-skab", K.x, K.top, K.b, K.h);
        this.saetAnker("koele-anker-vindue", V.x, V.top, V.b, V.karmY - V.top + 12);
        var z = lay.zoom;
        this.saetAnker("koele-anker-zoom", z.x, z.y - 24, z.b, z.h + 44);
        this.saetAnker("koele-anker-bord", K.x + K.b + 8, lay.bordY - lay.gh - 10, W - K.x - K.b - kant - 8, lay.gh + 44);
    };

    P.saetAnker = function (id, x, y, b, h) {
        var e = NK.el(id);
        if (!e) return;
        e.style.left = Math.round(x) + "px";
        e.style.top = Math.round(y) + "px";
        e.style.width = Math.round(b) + "px";
        e.style.height = Math.round(h) + "px";
    };

    P.tilpas = function () {
        if (this.L.tilpas() || !this.lay) {
            this.layout();
            var mig = this;
            this.glas.forEach(function (gl) { var p = mig.pladsPos(gl); gl.x = p.x; gl.y = p.y; });
        }
    };

    P.pladsPos = function (gl) {
        var r = this.lay.pladser[gl.sted];
        return r[Math.min(gl.plads, r.length - 1)];
    };

    P.glasMaal = function (gl) {
        return Tg.glasMaal(gl.x, gl.y, this.lay.gh);
    };

    /* ----- At flytte glas ------------------------------------------------------------------ */
    P.ledigPlads = function (sted, undtagen) {
        var n = D.sted(sted).plads, optaget = [];
        this.glas.forEach(function (g) { if (g !== undtagen && g.sted === sted) optaget.push(g.plads); });
        for (var i = 0; i < n; i++) if (optaget.indexOf(i) < 0) return i;
        return -1;
    };

    /* Saet glasset et sted. Er der fuldt, bytter det plads med det
       glas, der staar naermest. */
    P.flyt = function (gl, sted, x) {
        var fraSted = gl.sted, fraPlads = gl.plads;
        var i = this.ledigPlads(sted, gl);
        if (i < 0) {
            var mig = this, bedst = null;
            this.glas.forEach(function (g) {
                if (g === gl || g.sted !== sted) return;
                var d = Math.abs(mig.pladsPos(g).x - (x === undefined ? 0 : x));
                if (!bedst || d < bedst.d) bedst = { g: g, d: d };
            });
            var anden = bedst.g;
            i = anden.plads;
            anden.sted = fraSted;
            anden.plads = fraPlads;
            anden.solTid = 0;
            if (anden.proeve) anden.proeve.T = D.sted(fraSted).T;
        }
        gl.sted = sted;
        gl.plads = i;
        if (sted !== "sol") gl.solTid = 0;
        if (gl.proeve) gl.proeve.T = D.sted(sted).T;
        this.vaelg(gl);
        if (fraSted !== sted) this.efterFlyt(gl);
    };

    /* Har eleven selv sat opgavens glas paa opgavens sted? */
    P.efterFlyt = function (gl) {
        var o = this.opgave();
        if (!o || this.trin !== "gaet") return;
        if (gl.id === o.fedt && gl.sted === o.sted) this.afslor(null);
    };

    /* ----- Opgaverne ------------------------------------------------------------------------ */
    P.opgave = function () {
        return this.opgNr < D.KOELE_OPGAVER.length ? D.KOELE_OPGAVER[this.opgNr] : null;
    };

    P.nyOpgave = function () {
        var o = this.opgave();
        this.trin = o ? "gaet" : "hvorfor";
        this.hjaelp = 0;
        this.gaettet = null;
        this.forkert = [];
        this.besked("", "");
        if (o) {
            var gl = this.glasMedId(o.fedt);
            /* Staar glasset allerede der, kommer det hjem paa bordet */
            if (gl.sted === o.sted) {
                var i = this.ledigPlads("bord", gl);
                if (i < 0) i = 0;
                gl.sted = "bord";
                gl.plads = i;
                gl.proeve.T = 20;
            }
            this.vaelg(gl);
        } else {
            this.vaelg(this.glasMedId("smoer"));
        }
        this.visOpgave();
    };

    P.gaet = function (svar) {
        if (this.trin !== "gaet") return;
        this.gaettet = svar;
        if (this.afvisTilbud) this.afvisTilbud();
        this.afslor(svar);
    };

    /* Glasset flytter derhen, og svaret vises */
    P.afslor = function (svar) {
        var o = this.opgave(), gl = this.glasMedId(o.fedt);
        if (gl.sted !== o.sted) this.flyt(gl, o.sted);
        this.vaelg(gl);
        this.trin = "set";
        var rigtigt = D.TILSTANDE[o.svar].navn;
        var hvor = D.fedt(o.fedt).Navn + " " + D.sted(o.sted).i + ": " + rigtigt + ".";
        if (svar === null) this.besked("<b>" + NK.html(hvor) + "</b> " + NK.html(o.efter), "");
        else if (svar === o.svar) this.besked("<b>Rigtigt.</b> " + NK.html(hvor) + " " + NK.html(o.efter), "god");
        else this.besked("Du gættede " + NK.html(D.TILSTANDE[svar].navn) + ". " + NK.html(hvor) + " " + NK.html(o.efter), "skidt");
        this.visOpgave();
    };

    P.svarHvorfor = function (k) {
        if (this.trin !== "hvorfor") return;
        var v = D.KOELE_HVORFOR.valg[k];
        if (v.rigtig) {
            this.trin = "faerdig";
            this.hjaelp = 0;
            this.besked("<b>Rigtigt.</b> " + NK.html(v.svar), "god");
            /* Rosen kommer kun foerste gang */
            if (!NK.hent(NOEGLE, {}).rost) this.ventRos = 0.8;
            NK.gem(NOEGLE, { loest: true, rost: true });
        } else {
            if (this.forkert.indexOf(k) < 0) this.forkert.push(k);
            this.besked(NK.html(v.svar), "skidt");
        }
        this.visOpgave();
    };

    P.knap = function () {
        if (this.trin === "set") {
            this.opgNr++;
            this.nyOpgave();
            return;
        }
        if (this.trin === "faerdig") {
            /* Videre til fabrikken: byg et fedt og proev det her */
            var fane = document.querySelector('[data-fane="fane-fabrik"]');
            if (fane) fane.click();
            return;
        }
        var o = this.opgave();
        if (this.hjaelp === 0) {
            this.hjaelp = 1;
            this.besked("<b>Hint:</b> " + NK.html(o ? o.hint : D.KOELE_HVORFOR.hint), "gul");
            this.visOpgave();
            return;
        }
        if (this.trin === "gaet") this.afslor(null);
        else if (this.trin === "hvorfor") {
            for (var k = 0; k < D.KOELE_HVORFOR.valg.length; k++) {
                if (D.KOELE_HVORFOR.valg[k].rigtig) { this.svarHvorfor(k); break; }
            }
        }
    };

    P.nulstil = function () {
        var mig = this;
        this.glas.forEach(function (gl, i) {
            gl.sted = "bord";
            gl.plads = i;
            gl.solTid = 0;
            if (gl.harsk) mig.nytSmoer(gl);
            if (gl.proeve) gl.proeve.T = 20;
        });
        this.opgNr = 0;
        this.nyOpgave();
    };

    P.enter = function () {
        if (this.trin === "set" || this.trin === "faerdig") this.knap();
    };

    P.tast = function (tast) {
        if (tast === "p" || tast === "P") {
            if (this.valgt && this.valgt.proeve) this.valgt.proeve.pause = !this.valgt.proeve.pause;
            return true;
        }
        return false;
    };

    /* ----- Paaskeaegget ------------------------------------------------------------------------ */
    P.bliverHarsk = function (gl) {
        gl.harsk = true;
        gl.proeve.bliverHarsk();
        this.harskTekst = 3.2;
        this.vaelg(gl);
        this.besked("Tre uger senere. Vand har spaltet noget af fedtet, og der er dannet smørsyre. Smørret er harskt.", "gul");
        if (this.laererHarsk) this.laererHarsk(gl);
        else this.harskVent = 4;
    };

    /* Kemichael (eller tiden) skifter det harske smoer ud med nyt */
    P.nytSmoer = function (gl) {
        gl = gl || this.glasMedId("smoer");
        gl.harsk = false;
        gl.solTid = 0;
        gl.proeve = new Proeve(gl.fedt, 20, 10);
        gl.fastVis = -1;
        var i = this.ledigPlads("bord", gl);
        gl.sted = "bord";
        gl.plads = i < 0 ? 0 : i;
        this.vaelg(gl);
    };

    /* ----- Panelet ---------------------------------------------------------------------------- */
    P.bygPanel = function () {
        var mig = this;
        this.el = {
            knap: NK.el("koele-knap"),
            besked: NK.el("koele-besked"),
            kort: NK.el("koele-kort"),
            valg: NK.el("koele-valg")
        };
        this.el.knap.addEventListener("click", function () { mig.knap(); });
        NK.el("koele-spring").addEventListener("click", function () { mig.springIntro(); });
        this.el.valg.addEventListener("click", function (e) {
            var b = e.target.closest ? e.target.closest("button") : null;
            if (!b || b.disabled) return;
            var v = b.getAttribute("data-svar");
            if (mig.trin === "gaet") mig.gaet(v);
            else if (mig.trin === "hvorfor") mig.svarHvorfor(parseInt(v, 10));
        });
        this.visDeklaration();
    };

    P.besked = function (html, klasse) {
        this.el.besked.innerHTML = html;
        this.el.besked.className = "besked" + (klasse ? " " + klasse : "");
    };

    P.visOpgave = function () {
        var o = this.opgave(), mig = this, html = "";
        var antal = D.KOELE_OPGAVER.length + 1;
        NK.saetHTML("koele-taeller", "<b>" + Math.min(antal, this.opgNr + 1) + "</b>/" + antal);
        if (this.trin === "gaet" || this.trin === "set") {
            var f = D.fedt(o.fedt), st = D.sted(o.sted);
            NK.saetTekst("koele-titel", "Gæt");
            NK.saetTekst("koele-spm", f.Navn + " " + st.i + " (" + D.gradTekst(st.T) + ")");
            NK.saetTekst("koele-under", this.trin === "gaet" ? "Fast, delvist fast eller flydende? Gæt først." : "");
            html = SVAR.map(function (s) {
                var kl = "valglinje";
                if (mig.trin === "set") {
                    if (s === o.svar) kl += " rigtig";
                    else if (s === mig.gaettet) kl += " forkert";
                }
                return '<button class="' + kl + '" type="button" data-svar="' + s + '"' + (mig.trin === "set" ? " disabled" : "") + ">" +
                    Tg.tilstandSvg(s) + '<span class="vl-navn">' + NK.html(D.TILSTANDE[s].Navn) + "</span></button>";
            }).join("");
        } else if (this.trin === "hvorfor") {
            NK.saetTekst("koele-titel", "Hvorfor?");
            NK.saetTekst("koele-spm", D.KOELE_HVORFOR.spm);
            NK.saetTekst("koele-under", "");
            html = D.KOELE_HVORFOR.valg.map(function (v, k) {
                var forkert = mig.forkert.indexOf(k) >= 0;
                return '<button class="valglinje' + (forkert ? " forkert" : "") + '" type="button" data-svar="' + k + '"' + (forkert ? " disabled" : "") + ">" +
                    '<span class="vl-navn">' + NK.html(v.t) + "</span></button>";
            }).join("");
        } else {
            NK.saetTekst("koele-titel", "Køkkenet");
            NK.saetTekst("koele-spm", "Rette kæder pakker tæt. Knæk holder molekylerne fra hinanden.");
            NK.saetTekst("koele-under", "Flyt glassene rundt, og se molekylerne.");
        }
        NK.saetHTML("koele-valg", html);
        var tekst, klasse = "knap";
        if (this.trin === "set") { tekst = this.opgNr + 1 >= D.KOELE_OPGAVER.length ? "Til hvorfor" : "Næste opgave"; klasse = "knap blaa banker"; }
        else if (this.trin === "faerdig") { tekst = "Byg dit eget fedt"; klasse = "knap blaa"; }
        else tekst = this.hjaelp === 0 ? "Giv hint" : "Vis svaret";
        this.el.knap.textContent = tekst;
        this.el.knap.className = klasse;
        this.el.kort.classList.toggle("sejr", this.trin === "faerdig");
    };

    /* Varedeklarationen for det valgte glas */
    P.visDeklaration = function () {
        var gl = this.valgt;
        if (!gl) return;
        var f = gl.fedt;
        NK.saetTekst("koele-dekl-navn", f.Navn);
        if (f.tom) { NK.saetHTML("koele-dekl", '<p class="note">Byg et fedtstof på fane 1.</p>'); return; }
        var t = D.typer(f.andel);
        var rk = [
            { navn: "Mættede", v: t.maettede, farve: D.syre("S").farve },
            { navn: "Enkeltumættede", v: t.enkelt, farve: D.syre("O").farve },
            { navn: "Flerumættede", v: t.fler, farve: D.syre("L").farve }
        ];
        var bar = '<div class="deklbar">' + rk.map(function (r) {
            return r.v > 0 ? '<span style="width:' + r.v.toFixed(1) + "%;background:" + r.farve + '"></span>' : "";
        }).join("") + "</div>";
        var linjer = rk.map(function (r) {
            return '<div class="talraekke"><span><span class="kaedeprik" style="background:' + r.farve + '"></span>' + r.navn +
                ' fedtsyrer</span><span class="tal">' + Math.round(r.v) + " %</span></div>";
        }).join("");
        var smp = f.kaeder ? '<div class="talraekke"><span>Smeltepunkt</span><span class="tal gul">' + NK.html(F.smpTekst(f.kaeder)) + "</span></div>" : "";
        NK.saetHTML("koele-dekl", bar + linjer + smp);
    };

    P.visStatus = function () {
        var t, tr = this.traek;
        if (this.harskTekst > 0) t = "<b>Tre uger senere …</b> Smørret har stået i solen.";
        else if (tr && tr.flyttet) {
            var z = this.overZone;
            t = z ? "Slip: " + NK.html(D.sted(z).i) + ", " + D.gradTekst(D.sted(z).T) + "." :
                "Sæt glasset i fryseren, i køleskabet, på bordet eller i solen.";
        } else if (this.trin === "gaet") {
            var o = this.opgave();
            t = "Gæt i panelet, eller sæt " + NK.html(D.fedt(o.fedt).navn) + " " + NK.html(D.sted(o.sted).i) + " og se selv.";
        } else if (this.valgt && !this.valgt.fedt.tom) {
            var gl = this.valgt, st = D.sted(gl.sted);
            t = NK.html(gl.fedt.Navn) + " " + NK.html(st.i) + ": <b>" + NK.html(D.TILSTANDE[D.tilstand(this.fastMaal(gl))].navn) + "</b>. Træk glasset et andet sted hen.";
        } else t = "Træk et glas hen et andet sted.";
        NK.saetHTML("koele-status", t);
    };

    P.fastMaal = function (gl) {
        if (gl.fedt.tom) return 0;
        return F.fastAndel(gl.fedt, D.sted(gl.sted).T);
    };

    /* ----- Tegneloekken ---------------------------------------------------------------------- */
    P.opdater = function (dt) {
        this.tid += dt;
        var mig = this;
        this.glas.forEach(function (gl) {
            if (mig.traek && mig.traek.gl === gl && mig.traek.flyttet) {
                gl.vinkel = NK.mod(gl.vinkel, NK.klamp(mig.traek.vx * 0.0012, -0.35, 0.35), 8, dt);
            } else {
                var p = mig.pladsPos(gl);
                gl.x = NK.mod(gl.x, p.x, 7, dt);
                gl.y = NK.mod(gl.y, p.y, 7, dt);
                gl.vinkel = NK.mod(gl.vinkel, 0, 6, dt);
            }
            /* Fedtet smelter eller stivner i loebet af et sekund eller to */
            var maal = mig.fastMaal(gl);
            gl.fastVis = gl.fastVis < 0 ? maal : NK.mod(gl.fastVis, maal, 1.6, dt);
            /* Smoerret i solen (paaskeaegget) */
            if (gl.id === "smoer" && gl.sted === "sol" && !gl.harsk && !(mig.traek && mig.traek.gl === gl)) {
                gl.solTid += dt;
                if (gl.solTid >= D.HARSK_TID) mig.bliverHarsk(gl);
            }
        });
        if (this.traek) this.traek.vx *= Math.exp(-dt * 6);
        if (this.valgt && this.valgt.proeve) this.valgt.proeve.opdater(dt);
        if (this.harskTekst > 0) this.harskTekst -= dt;
        if (this.harskVent > 0) {
            this.harskVent -= dt;
            if (this.harskVent <= 0) this.nytSmoer();
        }
        if (this.ventRos > 0) {
            this.ventRos -= dt;
            if (this.ventRos <= 0 && this.laererFaerdig) this.laererFaerdig();
        }
        if (this.opdaterLaerer) this.opdaterLaerer(dt);
        this.opdaterIntro(dt);
        this.visStatus();
    };

    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay;
        if (!lay) return;
        var mig = this, K = lay.K, V = lay.V, tr = this.traek;
        Tg.rum(ctx, lay.W, lay.H, lay.bordY + 6);
        Tg.bord(ctx, K.x + K.b - 6, lay.W, lay.bordY, lay.H + 10);
        Tg.vindue(ctx, V, this.tid);
        Tg.koeleskab(ctx, K);

        /* Zonerne lyser, mens et glas holdes over dem */
        if (tr && tr.flyttet && this.overZone) Tg.zone(ctx, lay.zoner[this.overZone], 1, this.tid);

        /* Skiltene ved stederne */
        var px = NK.klamp(lay.H * 0.021, 12, 14);
        var lysZ = tr && tr.flyttet ? this.overZone : null;
        Tg.stedSkilt(ctx, (K.rumV + K.rumH) / 2, K.fryserTop + px * 1.5, D.sted("fryser"), { px: px, lys: lysZ === "fryser" });
        Tg.stedSkilt(ctx, (K.rumV + K.rumH) / 2, K.koeleTop + px * 2.4, D.sted("koele"), { px: px, lys: lysZ === "koele" });
        Tg.stedSkilt(ctx, (V.x + V.b / 2), V.top + px * 2.2, D.sted("sol"), { px: px, lys: lysZ === "sol" });
        Tg.stedSkilt(ctx, K.x + K.b + 16, lay.bordY + px * 2.9 + 16, D.sted("bord"), { px: px, lys: lysZ === "bord", justering: "left" });

        /* Zoomvinduet med linjerne ned til det valgte glas */
        var gl = this.valgt, z = lay.zoom;
        if (gl && gl.proeve) {
            var G = this.glasMaal(gl);
            Tg.zoomLinjer(ctx, { x: G.venstre, y: G.top, b: G.b, h: G.h }, z);
            var tilst = D.tilstand(gl.fastVis);
            Tg.zoomKasse(ctx, z, gl.proeve, {
                titel: gl.fedt.Navn + (gl.harsk ? " (harskt)" : ""),
                tilstand: tilst, T: D.sted(gl.sted).T,
                lys: this.pegZoom ? 0.5 + 0.5 * Math.sin(this.tid * 6) : 0
            });
            Tg.farveForklaring(ctx, z.x, z.y + z.h + NK.klamp(lay.H * 0.022, 12, 16), z.b, { px: 12, smoersyre: gl.harsk });
        }

        /* Glassene: det, der holdes, til sidst */
        var o = this.opgave(), puls = 0.5 + 0.5 * Math.sin(this.tid * 5);
        this.glas.forEach(function (g) {
            if (tr && tr.gl === g && tr.flyttet) return;
            mig.tegnGlas(ctx, g, o && mig.trin === "gaet" && g.id === o.fedt ? puls : 0);
        });
        if (tr && tr.flyttet) this.tegnGlas(ctx, tr.gl, 0);

        /* Kaffekoppen er der ikke plads til her */
        if (this.laererTegnOver) this.laererTegnOver(ctx);
    };

    P.tegnGlas = function (ctx, gl, puls) {
        var G = this.glasMaal(gl), f = gl.fedt;
        var over = this.over && this.over.slags === "glas" && this.over.gl === gl;
        Tg.glas(ctx, G, {
            tom: !!f.tom, fast: gl.fastVis, farve: f.farve, laag: f.laag, vinkel: gl.vinkel,
            lys: over ? 1 : (puls || (this.valgt === gl ? 0.25 : 0)), harsk: gl.harsk, tid: this.tid,
            alfa: f.tom ? 0.55 : 1
        });
        var rk = this.lay.pladser.bord, bredde = rk.length > 1 ? rk[1].x - rk[0].x - 6 : 200;
        Tg.glasNavn(ctx, G, f.Navn, { farve: this.valgt === gl ? "#f2c53d" : undefined, bredde: bredde, delt: f.delt });
    };

    /* ----- Musen -------------------------------------------------------------------------------- */
    P.hvadErUnder = function (pt) {
        var lay = this.lay;
        if (!lay) return null;
        if (this.laererUnder && this.laererUnder(pt.x, pt.y)) return { slags: "laerer" };
        for (var i = this.glas.length - 1; i >= 0; i--) {
            var gl = this.glas[i], G = this.glasMaal(gl);
            if (pt.x >= G.venstre - 4 && pt.x <= G.venstre + G.b + 4 && pt.y >= G.top - 4 && pt.y <= G.bund + 22) return { slags: "glas", gl: gl };
        }
        var z = lay.zoom;
        if (pt.x >= z.x && pt.x <= z.x + z.b && pt.y >= z.y && pt.y <= z.y + z.h) return { slags: "zoom" };
        return null;
    };

    P.zoneVed = function (pt) {
        var Z = this.lay.zoner, raekke = ["sol", "fryser", "koele", "bord"];
        for (var i = 0; i < raekke.length; i++) {
            var r = Z[raekke[i]], m = 14;
            if (pt.x >= r.x - m && pt.x <= r.x + r.b + m && pt.y >= r.y - m && pt.y <= r.y + r.h + m) return raekke[i];
        }
        return null;
    };

    P.koblMus = function () {
        var mig = this, c = this.L.canvas;
        c.addEventListener("pointerdown", function (e) {
            var pt = mig.L.punkt(e);
            if (mig.laererIntroKlik && mig.laererIntroKlik(pt.x, pt.y)) return;
            var u = mig.hvadErUnder(pt);
            if (!u) return;
            if (u.slags === "laerer") { if (mig.laererKlik) mig.laererKlik(pt.x, pt.y); return; }
            if (u.slags === "zoom") {
                mig.besked("Hver kæde er en fedtsyre i sin farve. Faste molekyler ligger stille i rækker. Flydende bevæger sig.", "");
                return;
            }
            if (u.slags === "glas") {
                mig.traek = { gl: u.gl, x0: pt.x, y0: pt.y, dx: u.gl.x - pt.x, dy: u.gl.y - pt.y, flyttet: false, vx: 0, px: pt.x };
                try { c.setPointerCapture(e.pointerId); } catch (x) { /* ikke vigtigt */ }
            }
        });
        c.addEventListener("pointermove", function (e) {
            var pt = mig.L.punkt(e), tr = mig.traek;
            if (tr) {
                if (Math.abs(pt.x - tr.x0) + Math.abs(pt.y - tr.y0) > 6) tr.flyttet = true;
                if (tr.flyttet) {
                    tr.vx = tr.vx * 0.6 + (pt.x - tr.px) * 30 * 0.4;
                    tr.px = pt.x;
                    tr.gl.x = pt.x + tr.dx;
                    tr.gl.y = pt.y + tr.dy;
                    mig.overZone = mig.zoneVed(pt);
                }
                c.style.cursor = "grabbing";
                return;
            }
            mig.over = mig.hvadErUnder(pt);
            var s = mig.over && mig.over.slags;
            c.style.cursor = s === "glas" ? "grab" : (s ? "pointer" : "default");
        });
        c.addEventListener("pointerleave", function () { if (!mig.traek) { mig.over = null; c.style.cursor = "default"; } });
        function slip() {
            var tr = mig.traek;
            if (!tr) return;
            mig.traek = null;
            var gl = tr.gl, zone = mig.overZone;
            mig.overZone = null;
            if (!tr.flyttet) {
                if (gl.fedt.tom) { mig.besked("Glasset er tomt. Byg et fedtstof på fane 1, så står det her.", ""); return; }
                mig.vaelg(gl);
                var st = D.sted(gl.sted);
                mig.besked(NK.html(gl.fedt.Navn) + " " + NK.html(st.i) + ", " + D.gradTekst(st.T) + ". Zoomvinduet viser molekylerne.", "");
                return;
            }
            if (zone) mig.flyt(gl, zone, gl.x);
        }
        c.addEventListener("pointerup", slip);
        c.addEventListener("pointercancel", slip);
    };

    /* ----- Kemichaels praesentation ------------------------------------------- */
    NK.Praesentation.kobl(P, { noegle: "nk-sc6.6-intro-koele", tilbud: "koele-tilbud", spring: "koele-spring" });

    /* Mens han taler om zoomvinduet, lyser det */
    P.pegPaaFelt = function () {
        var i = this.laererIIntro && this.laererIIntro() ? this.introTrin : 0;
        this.pegZoom = i === 2;
    };

    NK.SimKoele = SimKoele;
}());
