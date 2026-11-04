/* =====================================================================
   opgave.js - motoren bag de tre niveauer

   Et niveau er en raekke trin. Hvert trin er et lille objekt i
   niveauer.js med sit spoergsmaal, sine svarmuligheder eller felter,
   et hint og svaret. Motoren her holder styr paa, hvor eleven er, og
   tegner tekstboksen, tavlen, panelets trinliste og opslaget.

   Tekstboksen (4. nov. 2026) er et lyst papirkort oeverst i scenen som i
   de andre superanimationer (../faelles/papirkort.css). Al tekst staar
   dér: trinnet, blandingen, spoergsmaalet, svarmulighederne, beskeden og
   knapperne. Svarknapper vaelger kun; Indsend svar sender ind. Naar et
   trin er klaret, bliver kortet staaende paa spoergsmaalet med
   forklaringen og knappen Naeste trin samme sted som Indsend svar.

   Opslaget (4. nov. 2026, brugerens oenske): i de trin, hvor svaret
   findes i faeldningstabellen, siger tekstboksen "Slå op i
   fældningstabellen". Knappen (eller et klik paa tabellen i panelet)
   aabner tabellen i naesten fuld skaerm sammen med reaktionsskemaet.
   Naar eleven har klikket paa det rigtige, lukker opslaget af sig selv
   efter et kort ojeblik, og eleven er tilbage ved blandingen. Tabellen
   er det samme element; den flyttes ind i opslaget og tilbage igen.

   De tre niveauer deler scenen og panelet. Hvert niveau har sin egen
   opgave, sine egne baegerglas og sin egen taeller, saa man kan skifte
   frem og tilbage uden at miste noget.

   Et trin kan have:
     navn, spm           trinlisten og spoergsmaalet i tekstboksen
     opslagSpm           spoergsmaalet i opslaget
     start(niv)          naar trinnet begynder
     muligheder(niv)     svarmuligheder [{tekst, rigtig, fundet}] i tekstboksen
     flere               eleven vaelger flere svar (ellers ét)
     bedoem(niv, valgt)  Indsend svar med svarmuligheder (indeks eller liste)
     tjek(niv)           Indsend svar med felterne paa tavlen (og Enter)
     vaerktoej(niv)      HTML under tavlen, fx ladningsknapperne
     tabelKlik(niv,k,a)  klik i faeldningstabellen
     slaaOp(niv)         trinnet er et opslag lige nu (ellers: har tabelKlik)
     hint(niv)           teksten til Giv et hint
     vis(niv)            Vis svaret
     efter(niv)          naar trinnet er klaret, fx at glassene blandes
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var F = NK.Formel;

    var aktiv = null;
    var tabel = null;

    /* Saa laenge opslaget staar fremme, naar det rigtige er fundet */
    var OPSLAG_VENT = 1700;

    NK.ionChip = function (ion, ekstra) {
        return '<span class="ion ' + (ion.q > 0 ? "kat" : "an") + (ekstra ? " " + ekstra : "") + '">' + D.ionTekst(ion) + "</span>";
    };

    function stort(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

    NK.Niveau = function (def) {
        this.def = def;
        this.id = def.id;
        this.loest = 0;
        this.antal = 0;
        this.seneste = [];
        this.baeger = new NK.Baeger();
        this.nyOpgave();
    };

    var P = NK.Niveau.prototype;

    /* ----- Forloebet ---------------------------------------------------- */
    /* par og byt bruges kun af selvtesten: en bestemt opgave i en
       bestemt raekkefoelge. */
    P.nyOpgave = function (par, byt) {
        if (aktiv === this && Opslag.aaben()) Opslag.luk(false);
        if (!par) par = this.def.vaelgPar(this);
        this.seneste.push(par.noegle);
        if (this.seneste.length > 10) this.seneste.shift();
        this.o = D.lavOpgave(par, byt);
        this.trin = -1;
        this.hjaelp = 0;
        this.vist = false;
        this.delVist = false;
        this.faerdig = false;
        this.klaret = null;
        this.status = [];
        this.s = { felt: {}, ok: {}, fejl: {}, valgt: null, forkerte: {} };
        this.hint = null;
        this.besked = { tekst: "", klasse: "" };
        this.fokusFelt = null;
        this.sidsteFelt = null;
        this.baeger.saetOpgave(this.o, !!this.def.ionerSynlige);
        this.frem();
        this.vis();
    };

    P.trinDef = function () { return this.def.trin[Math.max(0, this.trin)]; };

    /* Det trin, tekstboksen viser: det klarede, indtil eleven trykker
       Naeste trin. */
    P.kortTrin = function () { return this.klaret ? this.klaret.trin : this.trin; };

    /* Videre til naeste trin. Et givet trin (paa Let: ionerne, formlen og
       ionskemaet) klares af sig selv, saa alle tre sværhedsgrader har de
       samme fire trin. */
    P.frem = function () {
        for (;;) {
            if (this.trin >= this.def.trin.length - 1) {
                this.faerdig = true;
                this.antal++;
                if (!this.vist) this.loest++;
                return;
            }
            this.trin++;
            this.s.valgt = null;
            this.s.forkerte = {};
            var t = this.trinDef();
            if (t.start) t.start(this);
            if (!t.givet) return;
            this.status[this.trin] = "givet";
            if (t.efter) t.efter(this);
        }
    };

    /* Er resten af trinene givet, er opgaven slut, naar dette er klaret. */
    P.restenGivet = function () {
        for (var i = this.trin + 1; i < this.def.trin.length; i++) if (!this.def.trin[i].givet) return false;
        return true;
    };

    /* Trinnet er klaret, af eleven selv eller fordi svaret blev vist. Er
       en del af trinnet vist (delVist), taeller det som vist. Kortet
       bliver staaende paa spoergsmaalet med forklaringen. */
    P.loes = function (vist, tekst) {
        var t = this.trinDef(), v = vist || this.delVist;
        this.status[this.trin] = v ? "vist" : "gjort";
        if (v) this.vist = true;
        if (t.efter) t.efter(this);
        this.klaret = { trin: this.trin, tekst: tekst || "", vist: !!vist };
        this.besked = { tekst: "", klasse: "" };
        this.hjaelp = 0;
        this.delVist = false;
        this.hint = null;
        this.s.fejl = {};
        if (this.restenGivet()) this.frem();
        this.vis();
    };

    /* Den groenne knap: Naeste trin, eller Ny opgave til sidst. */
    P.videre = function () {
        if (this.faerdig) { this.nyOpgave(); return; }
        if (!this.klaret) return;
        this.klaret = null;
        this.besked = { tekst: "", klasse: "" };
        this.frem();
        this.vis();
    };

    /* Den gule knap: Giv et hint, saa Vis svaret. Er trinnet klaret,
       foerer den videre (bruges af selvtesten). */
    P.knap = function () {
        if (this.klaret || this.faerdig) { this.videre(); return; }
        var t = this.trinDef();
        if (this.hjaelp === 0) {
            this.hjaelp = 1;
            this.besked = { tekst: t.hint(this), klasse: "hint" };
            this.visKort();
            this.visTabel();
            return;
        }
        t.vis(this);
    };

    /* ----- Svar ------------------------------------------------------------ */
    P.muligheder = function () {
        var t = this.def.trin[Math.max(0, this.kortTrin())];
        return t && t.muligheder ? t.muligheder(this) : null;
    };

    /* Et klik paa en svarmulighed vaelger den (eller fravaelger, naar der
       kan vaelges flere). Det sender intet ind. */
    P.valgKlik = function (i) {
        if (this.faerdig || this.klaret) return;
        var t = this.trinDef(), m = this.muligheder();
        if (!m || !m[i] || m[i].fundet || this.s.forkerte[i]) return;
        if (t.flere) {
            var v = this.s.valgt || [], j = v.indexOf(i);
            if (j >= 0) v.splice(j, 1); else v.push(i);
            this.s.valgt = v;
        } else {
            this.s.valgt = i;
        }
        if (this.besked.klasse === "peger") this.besked = { tekst: "", klasse: "" };
        this.visKort();
    };

    P.harValgt = function () {
        var v = this.s.valgt;
        return this.trinDef().flere ? !!(v && v.length) : v !== null && v !== undefined;
    };

    /* Indsend svar: svarmulighederne eller felterne paa tavlen. */
    P.indsend = function () {
        if (this.faerdig || this.klaret) return;
        var t = this.trinDef();
        if (this.muligheder()) {
            if (!this.harValgt()) {
                this.saetBesked(t.flere ? "Klik på de svar, du vælger, og tryk så Indsend svar." : "Klik på et svar, og tryk så Indsend svar.", "peger");
                return;
            }
            var v = this.s.valgt;
            this.s.valgt = t.flere ? [] : null;
            t.bedoem(this, v);
            return;
        }
        if (t.tjek) t.tjek(this);
    };
    P.tjek = P.indsend;

    P.tabelKlik = function (k, a) {
        if (!this.kanSlaaOp()) return;
        this.trinDef().tabelKlik(this, k, a);
    };

    /* Trinnet er et opslag i tabellen lige nu. */
    P.kanSlaaOp = function () {
        if (this.faerdig || this.klaret) return false;
        var t = this.trinDef();
        return !!t.tabelKlik && (!t.slaaOp || t.slaaOp(this));
    };

    P.saetBesked = function (tekst, klasse) {
        this.besked = { tekst: tekst || "", klasse: klasse || "" };
        if (aktiv === this) this.visKort();
    };

    P.blink = function (k, a) {
        if (aktiv === this && tabel) tabel.blink(k, a);
    };

    /* ----- Tavlen ----------------------------------------------------------- */
    /* Ionerne under et salt, med tilskuerionerne streget ud, naar
       bundfaldet er fundet. */
    P.ionKlasse = function (ion) {
        if (!this.s.pKendt) return "";
        if (this.o.tilskuere.indexOf(ion) >= 0) return "tilskuer";
        if (this.o.faeld.some(function (S) { return S.kat === ion || S.an === ion; })) return "faelder";
        return "";
    };

    P.ionChips = function (S) {
        var self = this;
        return [S.kat, S.an].map(function (ion) { return NK.ionChip(ion, self.ionKlasse(ion)); }).join("");
    };

    P.tilskuerNote = function () {
        if (!this.s.pKendt) return "";
        if (this.o.udfald === "ingen") return "Alle fire ioner bliver i opløsning.";
        if (!this.o.tilskuere.length) return "";
        return "Tilskuerioner: " + this.o.tilskuere.map(D.ionTekst).join(" og ") + ". De bliver i opløsning.";
    };

    P.tavleHTML = function () {
        var o = this.o, d = this.def, self = this;
        function stof(S, sid) {
            return '<div class="stof"><div class="sformel">' + S.formel + '<span class="tilst">(aq)</span></div>'
                + '<div class="ionplads">' + d.ionOmraade(self, S, sid) + "</div></div>";
        }
        var h = '<div class="skema">' + stof(o.A, "A") + '<span class="op">+</span>' + stof(o.B, "B")
            + '<span class="op pil">→</span><div class="produkt">' + d.produkt(self) + "</div></div>";
        var r2 = d.skemaRaekke ? d.skemaRaekke(self) : "";
        if (r2) h += '<div class="skema ionskema">' + r2 + "</div>";
        var note = this.tilskuerNote();
        if (note) h += '<p class="tavle-note">' + note + "</p>";
        return h;
    };

    /* Et skrivefelt. key er noeglen i s.felt. */
    P.felt = function (key, klasse, pladsholder) {
        var v = this.s.felt[key] || "", ok = this.s.ok[key], fejl = this.s.fejl[key];
        var laast = ok || !!this.klaret || this.faerdig;
        return '<input type="text" class="skrivefelt ' + (klasse || "") + (ok ? " rigtig" : "") + (fejl ? " fejl" : "")
            + '" data-felt="' + key + '" value="' + NK.html(v) + '" autocomplete="off" autocapitalize="off" spellcheck="false"'
            + (pladsholder ? ' placeholder="' + pladsholder + '"' : "")
            + (laast ? " readonly" : "") + ' aria-label="Skriv her">';
    };

    /* ----- Tekstboksen ------------------------------------------------------ */
    P.blanding = function () {
        return stort(this.o.A.navn + " og " + this.o.B.navn) + " blandes.";
    };

    P.trinEtiket = function () {
        return "Trin " + (this.kortTrin() + 1) + " af " + this.def.trin.length;
    };

    function spmTekst(t, niv, felt) {
        var s = t[felt] || t.spm;
        return typeof s === "function" ? s(niv) : s;
    }

    P.muligHTML = function () {
        var m = this.muligheder(), self = this;
        if (!m) return "";
        var t = this.def.trin[this.kortTrin()], laast = !!this.klaret || this.faerdig;
        var v = this.s.valgt;
        var lang = m.some(function (x) { return x.tekst.length > 16; });
        return '<div class="sk-svar ' + (t.flere ? "chips" : (lang ? "lange" : "korte")) + '">' + m.map(function (x, i) {
            var k = "";
            if (x.fundet) k = "rigtig";
            else if (self.s.forkerte[i]) k = "forkert";
            else if (self.klaret && x.rigtig) k = self.klaret.vist ? "svar-vist" : "rigtig";
            else if (!laast && (t.flere ? (v || []).indexOf(i) >= 0 : v === i)) k = "valgt";
            var fra = laast || x.fundet || self.s.forkerte[i];
            return '<button type="button" class="sk-knap' + (t.flere ? " ionvalg" : "") + (k ? " " + k : "") + '" data-i="' + i + '"'
                + (fra ? " disabled" : "") + ' aria-pressed="' + (k === "valgt") + '">' + x.tekst + "</button>";
        }).join("") + "</div>";
    };

    P.bundHTML = function (iOpslag) {
        var t = this.trinDef();
        if (this.klaret) {
            var k = this.klaret, knap = this.faerdig ? "Ny opgave →" : "Næste trin →";
            if (iOpslag) return '<div class="sk-bund ' + (k.vist ? "gul" : "god") + '"><p class="st-tekst">' + k.tekst + "</p></div>";
            return '<div class="sk-bund bliv ' + (k.vist ? "svar" : "god") + '"><p class="st-tekst">' + k.tekst + "</p>"
                + '<button type="button" class="sk-videre" data-videre="1">' + knap + "</button></div>";
        }
        var b = this.besked;
        var h = '<div class="sk-bund ' + (b.klasse || "") + (b.tekst ? "" : " tom") + '"><p class="st-tekst">' + (b.tekst || "") + "</p>";
        if (iOpslag) {
            if (this.kanSlaaOp()) {
                h += '<button type="button" class="knap hjaelp" data-hjaelp="1">' + (this.hjaelp === 0 ? "Giv et hint" : "Vis svaret") + "</button>"
                    + '<button type="button" class="knap luk" data-luk="1">Luk tabellen</button>';
            }
            return h + "</div>";
        }
        h += '<button type="button" class="knap hjaelp" id="opgaveknap" data-hjaelp="1">' + (this.hjaelp === 0 ? "Giv et hint" : "Vis svaret") + "</button>";
        if (this.kanSlaaOp()) {
            h += '<button type="button" class="knap indsend slaa-op" id="slaa-op" data-slaa-op="1">Slå op i fældningstabellen</button>';
        } else if (this.muligheder() || t.tjek) {
            var klar = !this.muligheder() || this.harValgt();
            h += '<button type="button" class="knap indsend' + (klar ? "" : " ikke-klar") + '" id="indsend" data-indsend="1">Indsend svar</button>';
        }
        return h + "</div>";
    };

    P.kortHTML = function () {
        var t = this.def.trin[this.kortTrin()];
        var tekst = NK.Papir.tekst(this.blanding() + " " + spmTekst(t, this, "spm"));
        return '<p class="sk-tekst"><span class="sk-chip">' + this.trinEtiket() + "</span>" + tekst + "</p>"
            + this.muligHTML() + this.bundHTML(false);
    };

    P.visKort = function () {
        if (aktiv !== this) return;
        var k = NK.el("tekstboks");
        k.innerHTML = this.kortHTML();
        k.classList.toggle("loest", !!this.klaret);
        k.classList.toggle("svar", !!(this.klaret && this.klaret.vist));
        if (Opslag.aaben()) this.visOpslag();
    };

    /* ----- Tegning af det hele ----------------------------------------------- */
    P.vis = function () {
        if (aktiv !== this) return;
        NK.el("tavle").innerHTML = this.tavleHTML();
        var t = this.trinDef();
        NK.el("ab-valg").innerHTML = !this.faerdig && !this.klaret && t.vaerktoej ? t.vaerktoej(this) : "";
        this.visKort();
        this.visPanel();
        this.visTabel();
        this.fokus();
    };

    P.visPanel = function () {
        var self = this, h = "";
        this.def.trin.forEach(function (t, i) {
            var st = self.status[i] || (i === self.trin && !self.faerdig ? "aktiv" : "");
            var maerke = st === "vist" ? '<span class="tvist">svaret vist</span>'
                : (t.givet ? '<span class="tgivet">' + t.givet(self) + "</span>" : "");
            h += '<li class="trin-punkt ' + st + (t.givet ? " givet" : "") + '"><span class="tnr">'
                + (st === "gjort" || st === "givet" ? "✓" : (i + 1)) + '</span>'
                + '<span class="tnavn">' + t.navn + "</span>" + maerke + "</li>";
        });
        NK.el("trinliste").innerHTML = h;
        NK.el("loest").textContent = this.loest;
    };

    P.visTabel = function () {
        if (!tabel) return;
        var m = this.def.tabelMarker ? this.def.tabelMarker(this) : {};
        m.hint = this.hint || [];
        m.aktiv = this.kanSlaaOp();
        tabel.marker(m);
        tabel.hvile = this.kanSlaaOp() && !Opslag.aaben() ? "Klik på tabellen for at slå op i den." : "Hold musen over et felt.";
        tabel.over(null, null);
        NK.el("tabelkort").classList.toggle("kan-slaa-op", this.kanSlaaOp() && !Opslag.aaben());
    };

    /* Opslaget: kort, reaktionsskema og tabel. Er det rigtige fundet,
       lukker det af sig selv lidt efter. */
    P.visOpslag = function () {
        var t = this.def.trin[this.kortTrin()];
        var tekst = NK.Papir.tekst(spmTekst(t, this, "opslagSpm"));
        var kort = NK.el("opslag-kort");
        kort.innerHTML = '<p class="sk-tekst"><span class="sk-chip">' + this.trinEtiket() + "</span>" + tekst + "</p>" + this.bundHTML(true);
        kort.classList.toggle("loest", !this.kanSlaaOp());
        NK.el("opslag-skema").innerHTML = this.tavleHTML();
        if (!this.kanSlaaOp()) Opslag.lukOm(OPSLAG_VENT);
    };

    /* Markoeren i det foerste felt, der mangler, saa man kan skrive med
       det samme. */
    P.fokus = function () {
        var felter = NK.el("tavle").querySelectorAll(".skrivefelt:not([readonly])");
        var maal = null;
        for (var i = 0; i < felter.length; i++) {
            if (this.fokusFelt && felter[i].getAttribute("data-felt") === this.fokusFelt) { maal = felter[i]; break; }
            if (!maal && !felter[i].value) maal = felter[i];
        }
        this.fokusFelt = null;
        if (!maal || Opslag.aaben() || NK.Rundvisning.aktiv() || document.querySelector(".overlay.vis")) return;
        try {
            maal.focus({ preventScroll: true });
            maal.setSelectionRange(maal.value.length, maal.value.length);
        } catch (e) { /* aeldre browsere */ }
    };

    /* Ladningsknapperne saetter ladningen paa det felt, man sidst stod i. */
    P.ladning = function (q) {
        var tavle = NK.el("tavle");
        var el = this.sidsteFelt ? tavle.querySelector('.skrivefelt[data-felt="' + this.sidsteFelt + '"]') : null;
        if (!el || el.readOnly) el = tavle.querySelector(".skrivefelt:not([readonly])");
        if (!el) return;
        el.value = F.saetLadning(el.value, q);
        this.s.felt[el.getAttribute("data-felt")] = el.value;
        el.classList.remove("fejl");
        el.focus();
        try { el.setSelectionRange(el.value.length, el.value.length); } catch (e) {}
    };

    /* ----- Opslaget ----------------------------------------------------------- */
    var Opslag = (function () {
        var erAaben = false, timer = null, forrigeFokus = null;

        function aaben() { return erAaben; }

        function aabn() {
            if (erAaben || !aktiv || !aktiv.kanSlaaOp()) return false;
            erAaben = true;
            forrigeFokus = document.activeElement;
            var hus = NK.el("opslag-tabel");
            hus.appendChild(NK.el("tabel"));
            hus.appendChild(NK.el("tabelinfo"));
            var o = NK.el("opslag");
            o.hidden = false;
            void o.offsetWidth;
            o.classList.add("vis");
            aktiv.visOpslag();
            aktiv.visTabel();
            try { NK.el("opslag-boks").focus({ preventScroll: true }); } catch (e) {}
            return true;
        }

        /* faerdig: det rigtige er fundet, og opslaget lukker af sig selv.
           Saa er beskeden fra opslaget brugt og fjernes fra tekstboksen. */
        function luk(faerdig) {
            if (!erAaben) return;
            if (timer) { clearTimeout(timer); timer = null; }
            erAaben = false;
            var hjem = NK.el("tabel-hjem");
            hjem.appendChild(NK.el("tabel"));
            hjem.appendChild(NK.el("tabelinfo"));
            var o = NK.el("opslag");
            o.classList.remove("vis");
            o.hidden = true;
            if (aktiv) {
                if (faerdig && !aktiv.klaret) aktiv.besked = { tekst: "", klasse: "" };
                aktiv.vis();
            }
            if (forrigeFokus && forrigeFokus.focus && document.contains(forrigeFokus)) {
                try { forrigeFokus.focus({ preventScroll: true }); } catch (e) {}
            }
        }

        function lukOm(ms) {
            if (!erAaben || timer) return;
            timer = setTimeout(function () { timer = null; luk(true); }, ms);
        }

        /* Til selvtesten: luk nu i stedet for at vente */
        function lukNu() { if (timer) { clearTimeout(timer); timer = null; luk(true); } }
        function lukker() { return !!timer; }

        return { aaben: aaben, aabn: aabn, luk: luk, lukOm: lukOm, lukNu: lukNu, lukker: lukker };
    }());
    NK.Opslag = Opslag;

    /* ----- Faelles haendelser ------------------------------------------------- */
    NK.Niveau.aktiver = function (niv) {
        if (Opslag.aaben()) Opslag.luk(false);
        aktiv = niv;
        niv.vis();
    };
    NK.Niveau.aktivt = function () { return aktiv; };

    /* Klik i tekstboksen og i opslagets kort */
    function kortKlik(e) {
        var b = e.target.closest ? e.target.closest("button") : null;
        if (!b || !aktiv || b.disabled) return;
        if (b.hasAttribute("data-i")) aktiv.valgKlik(parseInt(b.getAttribute("data-i"), 10));
        else if (b.hasAttribute("data-indsend")) aktiv.indsend();
        else if (b.hasAttribute("data-hjaelp")) aktiv.knap();
        else if (b.hasAttribute("data-videre")) aktiv.videre();
        else if (b.hasAttribute("data-slaa-op")) Opslag.aabn();
        else if (b.hasAttribute("data-luk")) Opslag.luk(false);
    }

    NK.Niveau.init = function () {
        tabel = new NK.Tabel(NK.el("tabel"), NK.el("tabelinfo"), function (k, a) {
            if (!aktiv) return;
            /* I panelet aabner et klik opslaget; i opslaget er det et svar */
            if (!Opslag.aaben()) { if (aktiv.kanSlaaOp()) Opslag.aabn(); return; }
            aktiv.tabelKlik(k, a);
        });
        NK.tabel = tabel;

        var tavle = NK.el("tavle"), valg = NK.el("ab-valg");

        NK.el("tekstboks").addEventListener("click", kortKlik);
        NK.el("opslag-kort").addEventListener("click", kortKlik);
        NK.el("opslag").addEventListener("click", function (e) {
            /* Klik ved siden af opslaget lukker det */
            if (e.target === NK.el("opslag")) Opslag.luk(Opslag.lukker());
        });
        NK.el("nyknap").addEventListener("click", function () { if (aktiv) aktiv.nyOpgave(); });

        tavle.addEventListener("input", function (e) {
            var el = e.target, key = el.getAttribute("data-felt");
            if (!aktiv || !key) return;
            if (el.classList.contains("skrivefelt")) {
                /* Tegnene skifter normalt kun udseende. Kommer der en
                   parentes til, flyttes markoeren tilsvarende. */
                var pos = el.selectionStart, ny = F.formater(el.value);
                if (ny !== el.value) {
                    pos += ny.length - el.value.length;
                    el.value = ny;
                    try { el.setSelectionRange(pos, pos); } catch (fejl) {}
                }
            } else if (el.classList.contains("koeffelt")) {
                el.value = el.value.replace(/[^0-9]/g, "").slice(0, 2);
            }
            aktiv.s.felt[key] = el.value;
            el.classList.remove("fejl");
        });
        tavle.addEventListener("change", function (e) {
            var key = e.target.getAttribute("data-felt");
            if (aktiv && key) { aktiv.s.felt[key] = e.target.value; e.target.classList.remove("fejl"); }
        });
        tavle.addEventListener("focusin", function (e) {
            if (aktiv && e.target.classList.contains("skrivefelt")) aktiv.sidsteFelt = e.target.getAttribute("data-felt");
        });
        tavle.addEventListener("keydown", function (e) {
            if (e.key === "Enter" && aktiv && /^(INPUT|SELECT)$/.test(e.target.tagName)) {
                e.preventDefault();
                aktiv.indsend();
            }
        });
        tavle.addEventListener("click", function (e) {
            var b = e.target.closest ? e.target.closest("button") : null;
            if (!b || !aktiv || aktiv.klaret || aktiv.faerdig) return;
            var t = aktiv.trinDef();
            if (t.tavleKlik) t.tavleKlik(aktiv, b);
        });

        valg.addEventListener("mousedown", function (e) {
            /* Ladningsknapperne maa ikke tage markoeren fra feltet. */
            if (e.target.closest && e.target.closest("[data-q]")) e.preventDefault();
        });
        valg.addEventListener("click", function (e) {
            var b = e.target.closest ? e.target.closest("button") : null;
            if (!b || !aktiv || b.disabled) return;
            if (b.hasAttribute("data-q")) aktiv.ladning(parseInt(b.getAttribute("data-q"), 10));
        });
    };
}());
