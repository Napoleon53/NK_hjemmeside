/* =====================================================================
   sim_oploes.js - fane 1: hvad vandet goer ved krystallen

   Et lille udsnit af en krystal ligger i bunden af glasset. Otte
   vandmolekyler arbejder: de finder en ion i overfladen, vender den
   rigtige ende ind mod den, og naar fire har fat, river de den loes -
   to fulde hold paa fire kan altsaa arbejde parallelt.

   To ting bestemmer, hvor langt det gaar:
     temperaturen   - hvor hurtigt vandmolekylerne arbejder
     oploeseligheden - hvor mange ioner der overhovedet kan komme ud,
                      foer vandet ikke kan rumme mere (D.frieIoner)
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var T = NK.Tegn;

    var VAND_I_ARBEJDE = 8;      /* aktive vandmolekyler - to hold paa fire */
    var PAAKRAEVET = 4;          /* saa mange skal have fat, foer ionen slipper */
    var RAEKKER = 5;

    /* Naar en ion er revet loes, krymper den og sit vandlag lidt - den
       fylder mindre som fri ion i vaesken, end den gjorde i krystallen.
       Den maa dog aldrig blive saa lille, at bogstaverne (fx K⁺) ikke
       laengere kan laeses - MIN_TEKST_RADIUS er den mindste radius, hvor
       T.ion stadig skriver teksten paa. */
    var FRI_SKALA = 0.6;
    var FRI_SKALA_FART = 2.0;
    var MIN_TEKST_RADIUS = 11;

    /* De tre knapper. temp er den temperatur, oploeseligheden slaas op ved. */
    var TEMPERATURER = [
        { id: "kold",   navn: "Koldt",   tegn: "❄️", temp: 5,  fart: 0.55 },
        { id: "lunken", navn: "Lunkent", tegn: "💧", temp: 20, fart: 1.00 },
        { id: "varm",   navn: "Varmt",   tegn: "🔥", temp: 70, fart: 1.95 }
    ];

    NK.SimOploes = function () {
        this.L = new NK.Laerred(NK.el("oploes-laerred"));
        this.tempValg = TEMPERATURER[1];
        this.visDelta = true;
        this.ioner = [];
        this.vand = [];
        this.baggrund = [];
        this.fase = 0;
        this.bygget = "";

        this.koblPanel();
        NK.Valg.paa(this.nulstil.bind(this));
        this.nulstil();
        this.opdaterPanel();
    };

    var P = NK.SimOploes.prototype;

    /* ----- Panelet ------------------------------------------------------ */
    P.koblPanel = function () {
        var mig = this;

        NK.Valg.byg(NK.el("oploes-saltvalg"));

        var vaert = NK.el("oploes-temp");
        this.tempKnapper = [];
        TEMPERATURER.forEach(function (t) {
            var b = document.createElement("button");
            b.type = "button";
            b.className = "tilstandsknap" + (t.id === mig.tempValg.id ? " aktiv" : "");
            b.textContent = t.tegn + " " + t.navn;
            b.addEventListener("click", function () { mig.saetTemp(t); });
            vaert.appendChild(b);
            mig.tempKnapper.push({ el: b, id: t.id });
        });

        NK.el("oploes-nulstil").addEventListener("click", function () { mig.nulstil(); });
        NK.el("oploes-delta").addEventListener("change", function (e) {
            mig.visDelta = e.target.checked;
        });
    };

    P.saetTemp = function (t) {
        this.tempValg = t;
        for (var i = 0; i < this.tempKnapper.length; i++) {
            this.tempKnapper[i].el.classList.toggle("aktiv", this.tempKnapper[i].id === t.id);
        }
    };

    /* ----- Krystallen ---------------------------------------------------- */
    /* Moensteret gentager sig med p + n felter pr. raekke og er forskudt én
       plads for hver raekke. Med et lige antal felter pr. raekke giver det
       praecis forholdet i formlen: 1:1 bliver et skakbraet, 1:2 bliver to
       negative for hver positiv. */
    P.byg = function () {
        var salt = NK.Valg.salt();
        var k = salt.p + salt.n;
        var kolonner = k * Math.max(2, Math.round(6 / k));

        this.ioner = [];
        this.optaget = {};
        this.kolonner = kolonner;
        this.raekker = RAEKKER;

        for (var r = 0; r < RAEKKER; r++) {
            for (var c = 0; c < kolonner; c++) {
                var plads = (c + r) % k;
                var positiv = plads < salt.p;
                this.ioner.push({
                    r: r, c: c,
                    ion: D.ion(positiv ? salt.kat : salt.an),
                    tilstand: "fast",
                    x: 0, y: 0, hvileX: 0, hvileY: 0,
                    maalX: 0, maalY: 0,
                    vx: 0, vy: 0,
                    baerere: [],
                    reserveret: 0,
                    grundvinkel: Math.random() * Math.PI * 2,
                    skalfase: Math.random() * Math.PI * 2,
                    skala: 1
                });
                this.optaget[r + ":" + c] = true;
            }
        }

        this.vand = [];
        for (var i = 0; i < VAND_I_ARBEJDE; i++) {
            this.vand.push({
                x: 0, y: 0, hjemX: 0, hjemY: 0,
                vinkel: 0, tilstand: "hjemme",
                maal: null, plads: 0, afX: 0, afY: 0,
                fade: 1                       /* toner op, naar molekylet er nyt et sted */
            });
        }

        this.baggrund = [];
        for (var j = 0; j < 26; j++) {
            this.baggrund.push({
                x: Math.random(), y: Math.random(),
                fx: (Math.random() - 0.5) * 10,
                fy: (Math.random() - 0.5) * 10,
                vinkel: Math.random() * Math.PI * 2,
                drej: (Math.random() - 0.5) * 0.5,
                skala: 0.30 + Math.random() * 0.22
            });
        }

        this.bygget = salt.id;
        this.frie = 0;
        this.paabegyndt = 0;   /* frie + dem, der er ved at blive revet loes */
        this.layout(true);
    };

    P.nulstil = function () {
        this.byg();
    };

    /* ----- Maal ----------------------------------------------------------- */
    P.layout = function (flytAlt) {
        var L = this.L;
        var kant = Math.max(22, Math.min(70, L.b * 0.07));

        this.glasX = kant;
        this.glasB = L.b - kant * 2;
        this.glasY = Math.max(26, L.h * 0.12);
        this.glasH = L.h - this.glasY - 26;
        this.overflade = this.glasY + 20;

        /* Cellen skal baade kunne vaere i glassets bredde og levne plads
           over krystallen til de frie ioner. */
        var celleB = (this.glasB * 0.62) / this.kolonner;
        var celleH = (this.glasH * 0.40) / this.raekker;
        this.celle = NK.klamp(Math.min(celleB, celleH), 13, 34);

        var bredde = this.celle * this.kolonner;
        this.gitterX = this.glasX + (this.glasB - bredde) / 2 + this.celle / 2;
        this.gitterY = this.glasY + this.glasH - this.celle * this.raekker + this.celle / 2 - 10;
        this.gitterTop = this.gitterY - this.celle / 2;

        for (var i = 0; i < this.ioner.length; i++) {
            var o = this.ioner[i];
            o.hvileX = this.gitterX + o.c * this.celle;
            o.hvileY = this.gitterY + o.r * this.celle;
            if (flytAlt || o.tilstand === "fast") { o.x = o.hvileX; o.y = o.hvileY; }
            if (flytAlt && o.tilstand === "fri") {
                o.x = NK.klamp(o.x, this.glasX + 26, this.glasX + this.glasB - 26);
                o.y = NK.klamp(o.y, this.overflade + 26, this.gitterTop - 24);
            }
        }

        for (var j = 0; j < this.vand.length; j++) {
            var v = this.vand[j];
            if (flytAlt || v.tilstand === "hjemme") {
                this.nytHjem(v);
                v.x = v.hjemX;
                v.y = v.hjemY;
            }
        }
    };

    /* Et nyt sted at svoemme hen. Vandmolekylerne bor ikke ét bestemt sted -
       de er spredt tilfaeldigt ud over hele det frie vand, saa det ikke ser
       ud som om det samme molekyle bare bliver ved med at dukke op dér, hvor
       en ion lige er blevet revet loes. */
    P.nytHjem = function (v) {
        var top = this.overflade + 24;
        var bund = Math.max(top + 10, this.gitterTop - 14);
        v.hjemX = this.glasX + 26 + Math.random() * Math.max(10, this.glasB - 52);
        v.hjemY = top + Math.random() * (bund - top);
    };

    /* Det molekyle, der er faerdigt med sin ion, bliver ikke ved med at
       svoemme videre derfra - saa ville de fire baerere blive ved med at
       dukke op praecis dér, hvor saltet lige er gaaet i oploesning. I
       stedet forsvinder det, og et friskt et toner op et tilfaeldigt sted
       i vandet. Det er ogsaa naermere sandheden: der er vand overalt, og
       det er ikke de samme fire molekyler, der loeber frem og tilbage. */
    P.sendVaek = function (v) {
        this.nytHjem(v);
        v.x = v.hjemX;
        v.y = v.hjemY;
        v.maal = null;
        v.tilstand = "hjemme";
        v.vinkel = Math.random() * Math.PI * 2;
        v.fade = 0;
    };

    P.tilpas = function () {
        if (this.L.tilpas()) this.layout(true);
    };

    /* ----- Hvem kan angribes? --------------------------------------------- */
    /* Kun ioner i overfladen: en ion inde midt i krystallen er daekket paa
       alle fire sider, og der er ikke plads til vand omkring den. */
    P.iOverfladen = function (o) {
        return !this.optaget[(o.r - 1) + ":" + o.c] ||
               !this.optaget[(o.r + 1) + ":" + o.c] ||
               !this.optaget[o.r + ":" + (o.c - 1)] ||
               !this.optaget[o.r + ":" + (o.c + 1)];
    };

    P.maxFrie = function () {
        return D.frieIoner(NK.Valg.salt(), this.tempValg.temp);
    };

    P.faerdig = function () {
        return this.tilbage() === 0 || this.frie >= this.maxFrie();
    };

    P.tilbage = function () {
        var n = 0;
        for (var i = 0; i < this.ioner.length; i++) if (this.ioner[i].tilstand === "fast") n++;
        return n;
    };

    /* Den ion, der er naermest og allerede har flest vandmolekyler paa vej -
       saa bliver en paabegyndt ion faerdig, i stedet for at fem ioner staar
       halvfaerdige paa én gang. */
    P.naermesteFrie = function (v) {
        for (var mangler = PAAKRAEVET - 1; mangler >= 0; mangler--) {
            var bedst = null, bedstAfstand = Infinity;
            for (var i = 0; i < this.ioner.length; i++) {
                var o = this.ioner[i];
                if (o.tilstand !== "fast" || o.reserveret !== mangler) continue;
                if (!this.iOverfladen(o)) continue;
                var d = Math.hypot(o.x - v.x, o.y - v.y);
                if (d < bedstAfstand) { bedstAfstand = d; bedst = o; }
            }
            if (bedst) return bedst;
        }
        return null;
    };

    /* ----- Opdatering ------------------------------------------------------ */
    P.opdater = function (dt) {
        if (this.bygget !== NK.Valg.saltId) this.byg();

        var fart = this.tempValg.fart;
        var i;

        this.fase += dt * (0.5 + fart * 0.4);

        /* Ionerne */
        var rysten = (0.5 + fart * 0.9);
        for (i = 0; i < this.ioner.length; i++) {
            var o = this.ioner[i];
            if (o.tilstand === "fast") {
                o.x = o.hvileX + (Math.random() - 0.5) * rysten;
                o.y = o.hvileY + (Math.random() - 0.5) * rysten;
            } else if (o.tilstand === "paavej") {
                var dx = o.maalX - o.x, dy = o.maalY - o.y;
                var d = Math.hypot(dx, dy);
                var skridt = 95 * fart * dt;
                if (d > skridt) {
                    o.x += (dx / d) * skridt;
                    o.y += (dy / d) * skridt;
                } else {
                    o.x = o.maalX; o.y = o.maalY;
                    o.tilstand = "fri";
                    for (var b = 0; b < o.baerere.length; b++) {
                        this.sendVaek(o.baerere[b]);
                    }
                    o.baerere = [];
                    o.vx = (Math.random() - 0.5) * 26;
                    o.vy = (Math.random() - 0.5) * 26;
                }
            } else if (o.tilstand === "fri") {
                var fuldRadius = this.celle * 0.40 * o.ion.r;
                var bundSkala = fuldRadius > 0 ? Math.min(1, MIN_TEKST_RADIUS / fuldRadius) : 1;
                o.skala = NK.mod(o.skala, Math.max(FRI_SKALA, bundSkala), FRI_SKALA_FART, dt);
                o.x += o.vx * dt * fart;
                o.y += o.vy * dt * fart;
                var vLav = this.overflade + 22, vHoej = this.gitterTop - 20;
                if (o.x < this.glasX + 24) { o.x = this.glasX + 24; o.vx = Math.abs(o.vx); }
                if (o.x > this.glasX + this.glasB - 24) { o.x = this.glasX + this.glasB - 24; o.vx = -Math.abs(o.vx); }
                if (o.y < vLav) { o.y = vLav; o.vy = Math.abs(o.vy); }
                if (o.y > vHoej) { o.y = vHoej; o.vy = -Math.abs(o.vy); }
                o.skalfase += dt * 0.6;
            }
        }

        /* Vandmolekylerne */
        for (i = 0; i < this.vand.length; i++) this.opdaterVand(this.vand[i], 190 * fart * dt, dt);

        /* Baggrundsvandet */
        for (i = 0; i < this.baggrund.length; i++) {
            var g = this.baggrund[i];
            g.x += (g.fx * fart * dt) / Math.max(1, this.L.b);
            g.y += (g.fy * fart * dt) / Math.max(1, this.L.h);
            g.vinkel += g.drej * dt * fart;
            if (g.x < -0.06) g.x = 1.06; else if (g.x > 1.06) g.x = -0.06;
            if (g.y < -0.06) g.y = 1.06; else if (g.y > 1.06) g.y = -0.06;
        }

        this.opdaterPanel();
    };

    P.opdaterVand = function (v, skridt, dt) {
        var o = v.maal;

        if (v.fade < 1) v.fade = Math.min(1, v.fade + dt * 3);

        switch (v.tilstand) {
        case "hjemme":
            o = this.tilbage() === 0 ? null : this.naermesteFrie(v);
            /* En ion, der ikke er begyndt endnu, taeller med i graensen med
               det samme. Ellers ville de ioner, der allerede er i gang,
               naa at komme ud, efter graensen var naaet - og et
               tungtoploeseligt salt ville slippe flere ioner end det maa. */
            if (o && o.reserveret === 0) {
                if (this.paabegyndt >= this.maxFrie()) o = null;
                else this.paabegyndt++;
            }
            if (o) {
                v.plads = o.reserveret;
                o.reserveret++;
                v.maal = o;
                v.tilstand = "soeger";
            } else {
                v.vinkel += 0.25 * dt;
            }
            break;

        case "soeger": {
            if (!o || o.tilstand !== "fast") { this.sendVaek(v); break; }
            var vinkel = o.grundvinkel + v.plads * (Math.PI / 2);
            var afstand = this.ionRadius(o) + this.celle * 0.46;
            var maalX = o.x + Math.cos(vinkel) * afstand;
            var maalY = o.y + Math.sin(vinkel) * afstand;
            var dx = maalX - v.x, dy = maalY - v.y;
            var d = Math.hypot(dx, dy);

            v.vinkel = T.vendMod(v.x, v.y, o.x, o.y, o.ion.q > 0);

            if (d > skridt) {
                v.x += (dx / d) * skridt;
                v.y += (dy / d) * skridt;
            } else {
                v.x = maalX; v.y = maalY;
                v.afX = v.x - o.x;
                v.afY = v.y - o.y;
                v.tilstand = "fast";
                o.baerere.push(v);
                if (o.baerere.length >= PAAKRAEVET) this.rivLoes(o);
            }
            break;
        }

        case "fast":
            if (!o) { this.sendVaek(v); break; }
            v.x = o.x + v.afX;
            v.y = o.y + v.afY;
            v.vinkel = T.vendMod(v.x, v.y, o.x, o.y, o.ion.q > 0);
            if (o.tilstand === "fri") this.sendVaek(v);
            break;
        }
    };

    P.rivLoes = function (o) {
        o.tilstand = "paavej";
        delete this.optaget[o.r + ":" + o.c];
        this.frie++;

        o.maalX = this.glasX + 30 + Math.random() * (this.glasB - 60);
        o.maalY = this.overflade + 26 + Math.random() * Math.max(30, this.gitterTop - this.overflade - 60);

        for (var i = 0; i < o.baerere.length; i++) o.baerere[i].tilstand = "fast";
    };

    P.ionRadius = function (o) {
        var s = o.skala === undefined ? 1 : o.skala;
        return this.celle * 0.40 * o.ion.r * s;
    };

    /* ----- Panelteksten ----------------------------------------------------- */
    P.opdaterPanel = function () {
        var salt = NK.Valg.salt();
        var tung = D.erTung(salt);
        var loest = D.oploeselighed(salt, this.tempValg.temp);

        var ligningHTML = D.ligningHTML(salt);
        if (this._sidsteLigning !== ligningHTML) {
            NK.saetHTML("oploes-ligning", ligningHTML);
            NK.tilpasEnLinje("oploes-ligning");
            this._sidsteLigning = ligningHTML;
        }
        NK.saetTekst("oploes-navn", salt.navn);
        NK.saetTekst("oploes-hverdag", salt.hverdag);
        NK.saetTekst("oploes-type", tung ? "tungtopløseligt" : "letopløseligt");
        NK.saetKlasse("oploes-type", "maerke " + (tung ? "orange" : "groen"));
        NK.saetTekst("oploes-graense", NK.gram(loest) + " g pr. 100 mL");

        var besked, klasse = "besked";
        if (this.tilbage() === 0) {
            besked = "Hele krystallen er væk. Alle ionerne er nu " + D.ionTekst(D.ion(salt.kat)) +
                     "(aq) og " + D.ionTekst(D.ion(salt.an)) + "(aq).";
            klasse = "besked god";
        } else if (this.frie >= this.maxFrie()) {
            besked = "Der går ikke mere i opløsning. Resten bliver liggende i bunden som bundfald — " +
                     "det er dét, der menes med tungtopløseligt.";
            klasse = "besked gul";
        } else if (this.frie === 0) {
            besked = "Vandmolekylerne er på vej hen til krystallens overflade.";
        } else {
            besked = "Vandet river ionerne løs én ad gangen — udefra og ind.";
        }
        NK.saetTekst("oploes-besked", besked);
        NK.saetKlasse("oploes-besked", klasse);

        NK.saetTekst("oploes-status", this.statusTekst(salt, tung));
    };

    P.statusTekst = function (salt, tung) {
        if (this.tilbage() === 0) return "Alt saltet er opløst.";
        if (this.frie >= this.maxFrie()) {
            return tung
                ? "Mættet: der er kun plads til nogle ganske få ioner i vandet."
                : "Vandet kan ikke opløse mere.";
        }
        return "Fire vandmolekyler skal have fat, før en ion slipper.";
    };

    /* ----- Tegning ------------------------------------------------------------ */
    P.tegn = function () {
        var L = this.L, ctx = L.ctx, i;
        L.ryd("#10131a");

        var salt = NK.Valg.salt();

        /* Baggrundsvand - antyder de mange molekyler, der ikke er tegnet */
        for (i = 0; i < this.baggrund.length; i++) {
            var g = this.baggrund[i];
            T.vand(ctx, g.x * L.b, g.y * L.h, g.vinkel, g.skala, { alpha: 0.16 });
        }

        var toning = salt.vandfarve && this.frie > 0
            ? NK.klamp(this.frie / 14, 0, 1) * 0.7
            : 0;
        T.glas(ctx, this.glasX, this.glasY, this.glasB, this.glasH,
               this.overflade, salt.vandfarve, toning);

        /* Krystallen. De faste ioner tegnes bagerst, saa vandet ligger ovenpaa. */
        for (i = 0; i < this.ioner.length; i++) {
            var o = this.ioner[i];
            if (o.tilstand !== "fast") continue;
            T.ion(ctx, o.x, o.y, o.ion, this.ionRadius(o), {
                fremhaev: o.reserveret > 0
            });
        }

        /* De frie ioner med vand hele vejen rundt */
        for (i = 0; i < this.ioner.length; i++) {
            var f = this.ioner[i];
            if (f.tilstand !== "fri") continue;
            var r = this.ionRadius(f);
            T.vandskal(ctx, f.x, f.y, r, f.skalfase, 4, f.ion.q > 0);
            T.ion(ctx, f.x, f.y, f.ion, r);
        }

        /* Ioner paa vej ud tegnes efter baererne, saa de ligger oeverst */
        for (i = 0; i < this.vand.length; i++) {
            var v = this.vand[i];
            var arbejder = v.tilstand === "soeger" || v.tilstand === "fast";
            T.vand(ctx, v.x, v.y, v.vinkel, this.celle / 26, {
                delta: this.visDelta,
                alpha: (arbejder ? 1 : 0.55) * v.fade,
                spidsH: v.maal ? v.maal.ion.q < 0 : false
            });
        }
        for (i = 0; i < this.ioner.length; i++) {
            var pv = this.ioner[i];
            if (pv.tilstand !== "paavej") continue;
            T.ion(ctx, pv.x, pv.y, pv.ion, this.ionRadius(pv), { fremhaev: true });
        }
    };
}());
