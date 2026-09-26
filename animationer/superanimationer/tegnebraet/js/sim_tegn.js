/* =====================================================================
   sim_tegn.js - tegnebraettet

   Frit tegnebraet til rapporter. Samme tavle og samme regler for at
   tegne som paa quizfanerne i sc6.2, men med C, H, O, N, Cl, Br og I
   (S og F er taget af paletten: de bruges naesten ikke i gymnasiet),
   ringe, dobbelt- og tripelbindinger og flere molekyler paa én gang. Et
   molekyle kan flyttes med Shift eller Flyt.

   Reaktionspil, ligevaegtspil og plus saettes paa med et klik og flyttes
   ved at traekke i dem. Den valgte pil faar tekst over og under i
   panelet (H2SO4 bliver til H₂SO₄). Feltet Skriv et navn tegner et
   molekyle eller et helt skema ud fra navnene (NK.NavnLaeser), ogsaa
   trivialnavne som eddikesyre og acetone.

   Panelet viser for hvert molekyle navnet (med de mest almindelige
   trivialnavne i parentes, se trivialnavne.js), stofklassen,
   molekylformlen og molarmassen. Tegningen kan kopieres som billede eller
   gemmes som PNG eller SVG: sort streg paa hvid baggrund, som i bogen,
   og med navnet under, hvis det er valgt.

   Grupper med ét klik (-OH, =O, -CHO, -COOH, -COO⁻, -NH₂) og en
   ladning saettes paa et atom med et klik. Kortet Det markerede har Pæn
   tegning, Spejlvend, Kopiér, Indsæt og Slet (ogsaa Ctrl+C, Ctrl+V og
   Ctrl+X). Gem som SVG gemmer ogsaa selve tegningen i filen (metadata
   nk-tegnebraet), saa Åbn tegning, eller en fil, der traekkes ind paa
   tavlen, giver den tilbage.

   Kemichaels skuffe: de klistermaerker, eleven har laast op i quizzerne
   i sc6.2 (klistermaerker.js), saettes paa med et klik, flyttes ved at
   traekke og goeres stoerre eller mindre i panelet.

   Tegningen huskes i browseren (localStorage), saa den er der igen,
   naar siden aabnes. Indtil 25. sept. 2026 laa tegnebraettet i sc6.2 og
   gemte under nk-sc6.2-tegnebraet; den gamle tegning hentes, hvis der
   ikke er en ny.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var NOEGLE = "nk-tegnebraet";
    var GAMMEL = "nk-sc6.2-tegnebraet";
    var FOLD = "nk-tegnebraet-foldet";
    var TOM_SKUFFE = 'Tom. Klar en quiz i <a href="../sc6.2_zigzagformler/index.html" target="_blank" rel="noopener">Zigzagformler</a>.';

    /* Hvorfor et molekyle ikke faar et navn (res.grund fra navngivning.js) */
    var GRUND = {
        hetero: "Stoffer med S kan tegnebrættet ikke give navn.",
        heteroring: "Ringe med O eller N i ringen kan tegnebrættet ikke give navn.",
        gruppe: "Den gruppe kender tegnebrættet ikke navnet på.",
        ringe: "Navne på molekyler med flere ringe kan tegnebrættet ikke give.",
        kompleks: "Det navn kan tegnebrættet ikke give.",
        lang: "Kæden er for lang til et navn her.",
        ingenC: "Der er intet C i molekylet.",
        ion: "Den ion kan tegnebrættet ikke give navn. Det kan carboxylat-ioner som ethanoat, CH₃COO⁻.",
        tom: ""
    };

    /* Navnet, som det staar i panelet og under molekylet: det systematiske
       navn og de mest almindelige trivialnavne i parentes */
    function visNavn(res) {
        var t = NK.Trivialnavne ? NK.Trivialnavne.vis(res) : null;
        return res.navn + (t ? " (" + t + ")" : "");
    }

    function SimTegn() {
        this.startFane();
        this.braet.stil = "zigzag";
        var gemt = NK.hent(NOEGLE, null) || NK.hent(GAMMEL, null);
        var data = gemt && (gemt.m || gemt);
        if (data && data.atomer && (data.atomer.length || (gemt.o && gemt.o.length))) {
            try { this.braet.gendan(gemt.m ? gemt : { m: gemt, o: [] }); } catch (e) { this.braet.nulstil(true, true); }
        } else {
            this.braet.nulstil(true, true);
        }
        this.bygPanel();
        this.visPanel();
    }

    var P = SimTegn.prototype;
    NK.Fane.bland(P, "tb");

    P.regler = function () {
        return {
            kunC: false, ringe: true, tripel: true, dobbelt: true, knaek: true, sletAlt: true, flyt: true, udsnit: true,
            maks: function () { return 80; },
            maksTekst: function () { return "Tavlen er fuld. 80 atomer er nok til en rapport."; }
        };
    };

    P.aendret = function (hvad) {
        if (hvad === "laerer") return;
        NK.gem(NOEGLE, this.braet.billede());
        this.visPanel();
    };

    P.nulstil = function () { this.braet.nulstil(true); };

    /* ----- Molekylerne paa tavlen ------------------------------------------
       Et startpunkt (et C uden bindinger, som eleven ikke har tegnet fra
       endnu) er ikke et molekyle: det taeller ikke med i aflaesningen og
       kommer ikke med i billedet. Methan, der er skrevet med navn, gor. */
    P.rapportMol = function () {
        var mol = this.braet.mol;
        return mol.del(mol.atomer.filter(function (a) { return !(a.start && !mol.grad(a.id)); }).map(function (a) { return a.id; }));
    };

    /* Listen gemmes, til tegningen aendrer sig: tavlen tegnes mange gange i
       sekundet, og navngivningen skal ikke koere hver gang */
    P.molekyler = function () {
        var b = this.braet, alle = b.mol;
        var noegle = b.stil + "#" + alle.atomer.map(function (a) {
            return a.id + a.el + Math.round(a.x * 1000) + "," + Math.round(a.y * 1000) + (a.start ? "s" : "") + (a.q ? "q" + a.q : "");
        }).join("|") + "#" + alle.bindinger.map(function (bd) { return bd.a + "-" + bd.b + ":" + bd.orden; }).join(",");
        if (this.molGemt && this.molGemt.noegle === noegle) return this.molGemt.liste;
        var mol = this.rapportMol();
        var liste = mol.fragmenter().map(function (ids) {
            var del = mol.del(ids);
            var res = NK.Navn.analyser(del);
            /* Navnet staar midt under det, der tegnes (ogsaa HO, H2O og H-atomerne) */
            var geo = NK.Struktur.geometri(del, { skala: 40, stil: b.stil });
            return { ids: ids, mol: del, res: res, navnX: (geo.x0 + geo.x1) / 80, navnY: geo.y1 / 40 + 0.05 };
        }).sort(function (a, c) {
            /* Raekke for raekke, fra venstre mod hoejre */
            var ga = a.mol.graenser(), gc = c.mol.graenser();
            var dy = (ga.y0 + ga.y1) / 2 - (gc.y0 + gc.y1) / 2;
            return Math.abs(dy) > 1.2 ? dy : ga.x0 - gc.x0;
        });
        this.molGemt = { noegle: noegle, liste: liste };
        return liste;
    };

    P.visAflaesning = function () {
        var liste = this.molekyler();
        if (!liste.length) { NK.saetHTML("tb-aflaes", '<div class="aflaes-navn ukendt">Tavlen er tom. Træk fra startpunktet, eller skriv et navn.</div>'); return; }
        var html = liste.map(function (m) {
            var t = m.res.navn && NK.Trivialnavne ? NK.Trivialnavne.vis(m.res) : null;
            var navn = m.res.navn
                ? '<div class="aflaes-navn">' + NK.html(m.res.navn) + (t ? ' <span class="trivial">(' + NK.html(t) + ")</span>" : "") + "</div>"
                : '<div class="aflaes-navn ukendt">' + NK.html(GRUND[m.res.grund] || "Uden navn.") + "</div>";
            if (m.res.stereoNote === "ez") navn += '<div class="note">E/Z-navngivning er ikke med her.</div>';
            var klasse = m.res.stofklasse ? '<div class="talraekke"><span>Stofklasse</span><span class="tal">' + NK.html(m.res.stofklasse) + "</span></div>" : "";
            return '<div class="aflaes-mol">' + navn + klasse +
                '<div class="talraekke"><span>' + (m.res.ladning ? "Formel" : "Molekylformel") + '</span><span class="tal">' + m.mol.formel() + "</span></div>" +
                '<div class="talraekke"><span>Molarmasse</span><span class="tal">' + NK.komma(m.mol.molarmasse()) + " g/mol</span></div></div>";
        }).join("");
        NK.saetHTML("tb-aflaes", html);
    };

    /* Numre paa kaeden for hvert molekyle med navn */
    P.saetNumre = function () {
        var b = this.braet;
        if (!NK.el("tb-numre").checked) { b.lokanter = null; return; }
        var lok = {};
        this.molekyler().forEach(function (m) {
            if (m.res.kaede && m.mol.atomer.length > 1) m.res.kaede.forEach(function (id, i) { lok[id] = i + 1; });
        });
        b.lokanter = lok;
    };

    /* ----- Billedet til rapporten ---------------------------------------------- */
    P.billedValg = function () {
        return { skala: 40, stil: this.braet.stil, farve: "#111111", linje: 2, skrift: 15, lokanter: this.braet.lokanter,
            objekter: this.braet.objekter };
    };

    /* Navnet lige under hvert molekyle, der har et: midt under det, der er
       tegnet, og under det nederste bogstav (OH, Br, og H-atomerne, naar
       alle atomer vises) */
    P.undertekst = function () {
        if (!NK.el("tb-under").checked) return null;
        return this.molekyler().filter(function (m) { return m.res.navn; }).map(function (m) {
            return { x: m.navnX, y: m.navnY, t: visNavn(m.res) };
        });
    };

    P.filnavn = function (endelse) {
        var l = this.molekyler();
        var navn = l.length === 1 && l[0].res.navn ? l[0].res.navn : "molekyle";
        return navn.replace(/[^a-z0-9,\-()æøå]/gi, "_") + "." + endelse;
    };

    P.gemFil = function (blob, navn) {
        var a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = navn;
        document.body.appendChild(a);
        a.click();
        setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
    };

    P.tomTavle = function () {
        if (this.rapportMol().atomer.length || this.braet.objekter.length) return false;
        this.note("Tavlen er tom. Tegn noget først.");
        return true;
    };

    P.note = function (t) { NK.saetTekst("tb-note", t); };

    /* Kopiér: billedet som PNG (3 gange opløsning) i udklipsholderen */
    P.png = function () {
        if (this.tomTavle()) return;
        var mig = this;
        var c = NK.Struktur.billede(this.rapportMol(), this.billedValg(), { undertekst: this.undertekst(), faktor: 3 });
        try { c.toBlob(behandl, "image/png"); } catch (e) { mig.note("Billedet kunne ikke laves i denne browser. Brug Gem som SVG."); }
        function behandl(blob) {
            if (!blob) { mig.note("Billedet kunne ikke laves."); return; }
            if (!navigator.clipboard || !window.ClipboardItem) {
                mig.note("Kopiering virker ikke i denne browser. Brug Gem som SVG.");
                return;
            }
            navigator.clipboard.write([new window.ClipboardItem({ "image/png": blob })]).then(function () {
                mig.note("Kopieret. Indsæt med Ctrl+V i Word eller OneNote.");
                mig.toast("Billedet er kopieret.", "god");
            }, function () {
                mig.note("Kopiering blev afvist af browseren. Brug Gem som SVG.");
            });
        }
    };

    /* SVG-filen har ogsaa selve tegningen (atomer, bindinger og pile), saa
       den kan aabnes her igen */
    P.svgTekst = function () {
        var data = JSON.stringify({ nk: "tegnebraet", v: 1, tegning: this.braet.billede() });
        return NK.Struktur.svg(this.rapportMol(), this.billedValg(), { undertekst: this.undertekst(), baggrund: "#ffffff", pad: 14,
            metadata: { id: "nk-tegnebraet", tekst: data } });
    };

    P.svg = function () {
        if (this.tomTavle()) return;
        this.gemFil(new Blob([this.svgTekst()], { type: "image/svg+xml" }), this.filnavn("svg"));
        this.note("Gemt som " + this.filnavn("svg") + ". Filen kan åbnes her igen.");
    };

    /* ----- Åbn en tegning ----------------------------------------------------------
       En SVG fra Gem som SVG (eller den rene tegning som JSON). Den gamle
       tegning kan faas tilbage med Fortryd. */
    P.aabnTekst = function (tekst) {
        var b = this.braet, data = null;
        try {
            var m = /<metadata id="nk-tegnebraet">([\s\S]*?)<\/metadata>/.exec(tekst);
            var json = m ? m[1].replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&") : (/^\s*\{/.test(tekst) ? tekst : null);
            if (json) data = JSON.parse(json);
        } catch (e) { data = null; }
        var t = data && (data.tegning || data);
        if (!t || !t.m || !Array.isArray(t.m.atomer)) {
            this.note("Filen er ikke en tegning fra tegnebrættet. Kun SVG-filer, der er gemt her, kan åbnes.");
            this.toast("Filen kunne ikke åbnes.", "fejl");
            return false;
        }
        b.gem();
        b.gendan(t);
        b.rydValg();
        b.valgtObj = null;
        b.vaerktoej = "tegn";
        b.efter("aabn");
        this.tilpasAlt(false);
        this.note("Tegningen er åbnet. Fortryd (Ctrl+Z) giver den gamle tilbage.");
        this.toast("Tegningen er åbnet.", "god");
        return true;
    };

    P.aabnFil = function (fil) {
        if (!fil) return;
        var mig = this, laeser = new FileReader();
        laeser.onload = function () { mig.aabnTekst(String(laeser.result || "")); };
        laeser.onerror = function () { mig.note("Filen kunne ikke læses."); };
        laeser.readAsText(fil);
    };

    /* ----- Panelet ------------------------------------------------------------------ */
    /* ----- Navn -> tegning ------------------------------------------------------
       Et navn eller et skema tegnes i én raekke: midt paa tavlen, hvis den er
       tom (eller kun har startatomet), ellers under det, der staar. */
    P.tomt = function () {
        var b = this.braet, a = b.mol.atomer;
        if (b.objekter.length) return false;
        return !a.length || (a.length === 1 && a[0].start && !b.mol.grad(a[0].id));
    };

    /* Kassen om alt paa tavlen (bindingslaengder), med navnene under
       molekylerne, naar de vises. Et startpunkt taeller ikke med. */
    P.indholdKasse = function () {
        var b = this.braet, k = null, s = b.s();
        function med(x0, y0, x1, y1) {
            if (!k) k = { x0: x0, y0: y0, x1: x1, y1: y1 };
            else { k.x0 = Math.min(k.x0, x0); k.y0 = Math.min(k.y0, y0); k.x1 = Math.max(k.x1, x1); k.y1 = Math.max(k.y1, y1); }
        }
        b.mol.atomer.forEach(function (a) {
            if (a.start && !b.mol.grad(a.id)) return;
            med(a.x - 0.4, a.y - 0.4, a.x + 0.4, a.y + 0.4);
        });
        b.objekter.forEach(function (o) { var q = b.objKasse(o); med(q.x0, q.y0, q.x1, q.y1); });
        var navne = this.undertekst();
        if (navne && navne.length) {
            var ctx = this.L.ctx;
            ctx.save();
            ctx.font = navneSkrift(s);
            navne.forEach(function (n) {
                var h = ctx.measureText(n.t).width / s / 2;
                med(n.x - h, n.y, n.x + h, n.y + 1.1 * navneStr(s) / s + 0.2);
            });
            ctx.restore();
        }
        return k;
    };

    function navneStr(s) { return Math.max(13, NK.klamp(s * 0.36, 12, 30) * 0.9); }
    function navneSkrift(s) { return "600 " + navneStr(s) + "px 'Segoe UI', sans-serif"; }

    /* Vis alt paa tavlen. kunHvisSkjult: kun hvis noget ligger uden for
       udsnittet, og saa kun ved at zoome ud (efter et navn i feltet) */
    P.tilpasAlt = function (kunHvisSkjult) {
        var b = this.braet, k = this.indholdKasse();
        if (!k) { b.nulstilUdsnit(); return; }
        var m = { x0: k.x0 - 0.3, y0: k.y0 - 0.3, x1: k.x1 + 0.3, y1: k.y1 + 0.3 };
        if (kunHvisSkjult && b.synlig(m)) return;
        /* To gange: navnenes bredde afhaenger lidt af zoom */
        b.tilpasTil(m, kunHvisSkjult ? Math.min(1, b.zoom) : 1);
        k = this.indholdKasse();
        b.tilpasTil({ x0: k.x0 - 0.3, y0: k.y0 - 0.3, x1: k.x1 + 0.3, y1: k.y1 + 0.3 }, kunHvisSkjult ? Math.min(1, b.zoom) : 1);
    };

    /* Foerste gang tavlen har sin stoerrelse: en gemt tegning skal kunne ses */
    P.efterLayout = function () {
        if (this.udsnitSat || !this.braet) return;
        this.udsnitSat = true;
        this.tilpasAlt(true);
    };

    P.tegnNavn = function () {
        var b = this.braet, inp = NK.el("tb-navn");
        var sk = NK.NavnLaeser.skema(inp.value);
        if (sk.fejl) { this.navnBesked(NK.html(sk.fejl), "skidt"); return; }
        var s = b.s();
        /* Navnet under molekylet skal ogsaa have plads: ethansyre (eddikesyre) */
        var ctx = this.L.ctx, visNavne = NK.el("tb-under").checked;
        ctx.save();
        ctx.font = navneSkrift(s);
        var dele = sk.dele.map(function (d) {
            if (d.type === "mol") {
                var g = d.mol.graenser();
                var nb = visNavne && d.res && d.res.navn ? ctx.measureText(visNavn(d.res)).width / s + 0.5 : 0;
                return { d: d, b: Math.max(g.x1 - g.x0 + 1.1, nb), h: g.y1 - g.y0 + 1, cx: (g.x0 + g.x1) / 2, cy: (g.y0 + g.y1) / 2 };
            }
            if (d.type === "plus") return { d: d, b: 1, h: 0.8 };
            return { d: d, b: NK.Struktur.pilLaengde({}, s) + 0.7, h: 0.8 };
        });
        ctx.restore();
        var W = 0, H = 0;
        dele.forEach(function (x) { W += x.b; H = Math.max(H, x.h); });
        /* Paa en tom tavle midt paa; ellers under det, der staar. Tavlen er
           stoerre end skaermen, og udsnittet zoomer bagefter ud, saa alt kan ses */
        var tomt = this.tomt(), y = 0, x = -W / 2;
        if (!tomt) {
            var k = this.indholdKasse();
            y = k.y1 + 0.6 + H / 2;
            x = (k.x0 + k.x1) / 2 - W / 2;
        }
        b.gem();
        if (tomt) { b.mol = new NK.Molekyle(); b.objekter = []; b.nulstilUdsnit(); }
        dele.forEach(function (it) {
            var cx = x + it.b / 2;
            if (it.d.type === "mol") b.mol.indsaet(it.d.mol, cx - it.cx, y - it.cy);
            else b.objekter.push({ id: b.objId++, type: it.d.type, x: cx, y: y, over: "", under: "" });
            x += it.b;
        });
        b.valgtObj = null;
        b.rydValg();
        b.vaerktoej = "tegn";
        var mol = sk.dele.filter(function (d) { return d.type === "mol"; });
        var noter = mol.filter(function (d) { return d.note; }).map(function (d) { return NK.html(d.note); });
        this.navnBesked("Tegnet: <b>" + mol.map(function (d) { return NK.html(d.navn); }).join(", ") + "</b>." +
            (noter.length ? " " + noter.join(" ") : ""), "god");
        b.efter("navn");
        this.tilpasAlt(true);
    };

    P.navnBesked = function (html, klasse) {
        var e = NK.el("tb-navn-besked");
        e.innerHTML = html;
        e.className = "besked" + (klasse ? " " + klasse : "");
    };

    /* ----- Grundstof og vaerktoej (knapperne og tasterne C, H, O, N, L, B, I, M) ----- */
    P.vaelgGrundstof = function (el) {
        var b = this.braet;
        b.grundstof = el;
        b.vaerktoej = "tegn";
        b.rydValg();
        this.visPanel();
    };

    /* Et vaerktoej til og fra: et klik mere paa samme knap gaar tilbage til at tegne */
    P.vaelgVaerktoej = function (v) {
        var b = this.braet;
        b.vaerktoej = b.vaerktoej === v ? "tegn" : v;
        if (b.vaerktoej !== "marker") b.rydValg();
        this.visPanel();
    };

    /* ----- Panelet ------------------------------------------------------------------ */
    P.bygPanel = function () {
        var mig = this, b = this.braet;
        Array.prototype.forEach.call(document.querySelectorAll("#tb-palet button"), function (k) {
            k.addEventListener("click", function () { mig.vaelgGrundstof(k.getAttribute("data-el")); });
        });
        Array.prototype.forEach.call(document.querySelectorAll("#tb-grupper button, #tb-ringe button, #tb-pile button"), function (k) {
            k.addEventListener("click", function () { mig.vaelgVaerktoej(k.getAttribute("data-v")); });
        });
        /* Det markerede */
        NK.el("tb-paen").addEventListener("click", function () {
            if (!b.paenTegning()) mig.toast("Der er ikke noget at tegne pænere.", "advar");
        });
        NK.el("tb-spejl").addEventListener("click", function () { b.spejlvend(); });
        NK.el("tb-kopier-valg").addEventListener("click", function () { mig.kopierValgte(); });
        NK.el("tb-indsaet").addEventListener("click", function () { b.indsaet(); });
        NK.el("tb-slet-valg").addEventListener("click", function () { b.sletValgte(); });
        /* Åbn tegning: knappen eller en fil, der traekkes ind paa tavlen */
        var fil = NK.el("tb-fil");
        NK.el("tb-aabn").addEventListener("click", function () { fil.value = ""; fil.click(); });
        fil.addEventListener("change", function () { mig.aabnFil(fil.files && fil.files[0]); });
        var scene = NK.el("tb-laerred").parentNode;
        scene.addEventListener("dragover", function (e) { e.preventDefault(); });
        scene.addEventListener("drop", function (e) {
            e.preventDefault();
            var f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
            if (f) mig.aabnFil(f);
        });
        /* Zoom og Vis alt */
        NK.el("tb-zoom-ud").addEventListener("click", function () { b.zoomVed(1 / 1.25); });
        NK.el("tb-zoom-ind").addEventListener("click", function () { b.zoomVed(1.25); });
        NK.el("tb-zoom-tilpas").addEventListener("click", function () { mig.tilpasAlt(false); });
        /* Molekyler paa tavlen: foldes ind og ud, og valget huskes */
        NK.el("tb-fold").addEventListener("click", function () {
            mig.foldet = !mig.foldet;
            NK.gem(FOLD, mig.foldet);
            mig.visPanel();
        });
        this.foldet = !!NK.hent(FOLD, false);
        Array.prototype.forEach.call(document.querySelectorAll("#tb-stil button"), function (k) {
            k.addEventListener("click", function () { b.stil = k.getAttribute("data-v"); mig.visPanel(); });
        });
        /* Teksten ved pilen: ét fortryd-trin for hele rettelsen */
        [["tb-over", "over"], ["tb-under-pil", "under"]].forEach(function (p) {
            var inp = NK.el(p[0]);
            inp.addEventListener("focus", function () { if (b.valgtObj) b.gem(); });
            inp.addEventListener("input", function () {
                if (!b.valgtObj) return;
                b.valgtObj[p[1]] = inp.value;
                NK.gem(NOEGLE, b.billede());
            });
            inp.addEventListener("keydown", function (e) { if (e.key === "Enter") inp.blur(); });
        });
        NK.el("tb-slet-pil").addEventListener("click", function () { if (b.valgtObj) b.sletObjekt(b.valgtObj); });
        NK.el("tb-mindre").addEventListener("click", function () { b.klisterSkala(1 / 1.25); });
        NK.el("tb-stoerre").addEventListener("click", function () { b.klisterSkala(1.25); });
        NK.el("tb-slet-klister").addEventListener("click", function () { if (b.valgtObj) b.sletObjekt(b.valgtObj); });
        this.bygSkuffe();
        NK.el("tb-navn-ok").addEventListener("click", function () { mig.tegnNavn(); });
        NK.el("tb-navn").addEventListener("keydown", function (e) {
            if (e.key === "Enter") { e.preventDefault(); mig.tegnNavn(); }
        });
        NK.el("tb-numre").addEventListener("change", function () { mig.visPanel(); });
        NK.el("tb-under").addEventListener("change", function () { mig.visPanel(); });
        NK.el("tb-fortryd").addEventListener("click", function () { b.fortryd(); });
        NK.el("tb-gentag").addEventListener("click", function () { b.gentag(); });
        NK.el("tb-ryd").addEventListener("click", function () { b.nulstil(true); });
        NK.el("tb-kopier").addEventListener("click", function () { mig.png(); });
        NK.el("tb-svg").addEventListener("click", function () { mig.svg(); });
    };

    P.visPanel = function () {
        var b = this.braet;
        Array.prototype.forEach.call(document.querySelectorAll("#tb-palet button"), function (k) {
            k.classList.toggle("aktiv", b.vaerktoej === "tegn" && k.getAttribute("data-el") === b.grundstof);
        });
        Array.prototype.forEach.call(document.querySelectorAll("#tb-grupper button, #tb-ringe button, #tb-pile button"), function (k) {
            k.classList.toggle("aktiv", b.vaerktoej === k.getAttribute("data-v"));
        });
        /* Det markerede: med Markér, eller naar noget er markeret */
        var valgt = b.harValgte();
        NK.el("tb-markeret").hidden = !(valgt || b.vaerktoej === "marker");
        var nMol = valgt ? b.valgteMolekyler().length : 0, nObj = Object.keys(b.valgte.o).length;
        var dele = [];
        if (nMol) dele.push(nMol + (nMol === 1 ? " molekyle" : " molekyler"));
        if (nObj) dele.push(nObj + (nObj === 1 ? " pil eller plus" : " pile og plus"));
        NK.saetTekst("tb-mark-antal", valgt ? (dele.join(" og ") || "atomer") : "intet");
        NK.el("tb-spejl").disabled = !valgt;
        NK.el("tb-kopier-valg").disabled = !valgt;
        NK.el("tb-slet-valg").disabled = !valgt;
        NK.el("tb-indsaet").disabled = !b.udklip;
        NK.el("tb-paen").title = valgt ? "Tegn det markerede som i bogen, med zigzag" : "Tegn alt på tavlen som i bogen, med zigzag";
        Array.prototype.forEach.call(document.querySelectorAll("#tb-stil button"), function (k) {
            k.classList.toggle("aktiv", k.getAttribute("data-v") === b.stil);
        });
        /* Pilens kort, naar en pil er valgt */
        var vo = b.valgtObj && b.objekter.indexOf(b.valgtObj) >= 0 ? b.valgtObj : null;
        var klister = vo && vo.type === "klister" ? vo : null;
        if (klister) vo = null;
        NK.el("tb-pilkort").hidden = !vo;
        NK.el("tb-klisterkort").hidden = !klister;
        if (klister) {
            var kk = NK.Skuffe.klister(klister.navn);
            NK.saetTekst("tb-klister-titel", kk ? kk.titel : "Klistermærket");
        }
        this.visSkuffe();
        if (vo) {
            [["tb-over", "over"], ["tb-under-pil", "under"]].forEach(function (p) {
                var inp = NK.el(p[0]);
                if (document.activeElement !== inp) inp.value = vo[p[1]] || "";
            });
        }
        NK.el("tb-fortryd").disabled = !b.hist.length;
        NK.el("tb-gentag").disabled = !b.frem.length;
        this.saetNumre();
        this.visAflaesning();
        /* Molekyler paa tavlen: foldet ind eller ud, og hvor mange der er */
        NK.el("tb-fold").setAttribute("aria-expanded", this.foldet ? "false" : "true");
        NK.el("tb-aflaes").hidden = !!this.foldet;
        var antal = this.molekyler().length;
        NK.saetTekst("tb-antal-mol", antal ? String(antal) : "");
        this.visStatus();
    };

    P.visStatus = function () {
        var b = this.braet;
        var t = D.STATUS.tegnebraet;
        if (b.vaerktoej === "marker") t = b.harValgte() ? "Træk i det markerede for at flytte det. Ctrl+C og Ctrl+V kopierer. Højreklik: tilbage til C." : "Klik på et molekyle for at markere det, eller træk en ramme om flere. Ctrl+A markerer alt. Højreklik: tilbage til C.";
        else if (b.vaerktoej === "ladning") t = "Klik på et atom: første klik giver −, næste +, og så ingen ladning. Højreklik: tilbage til C.";
        else if (b.vaerktoej.indexOf("gruppe:") === 0) t = "Klik på et atom for at sætte " + GRUPPE_NAVN[b.vaerktoej.slice(7)] + " på. Højreklik: tilbage til C.";
        else if (b.vaerktoej === "flyt") t = "Træk i et atom for at flytte det. Træk i tavlen for at flytte udsnittet.";
        else if (b.vaerktoej === "pil" || b.vaerktoej === "lig") t = "Klik på tavlen, hvor pilen skal stå. Træk i den bagefter for at flytte den.";
        else if (b.vaerktoej === "plus") t = "Klik på tavlen, hvor plusset skal stå.";
        else if (b.vaerktoej.indexOf("klister:") === 0) t = "Klik på tavlen, hvor klistermærket skal sidde. Træk i det bagefter for at flytte det.";
        else if (b.vaerktoej !== "tegn") t = "Klik på tavlen for en fri ring, på et atom for en ring på atomet, eller på en binding for en ring, der deler bindingen.";
        else if (b.grundstof !== "C") t = "Klik på et atom for at gøre det til " + b.grundstof + ", eller træk fra et atom for at sætte " + b.grundstof + " på.";
        this.status(t);
    };

    var GRUPPE_NAVN = { OH: "–OH", O: "=O", CHO: "–CHO", COOH: "–COOH", COO: "–COO⁻", NH2: "–NH₂" };

    /* Kopiér det markerede (knappen og Ctrl+C) */
    P.kopierValgte = function () {
        if (!this.braet.kopier()) return false;
        this.toast("Kopieret. Ctrl+V indsætter en kopi.", "god");
        this.visPanel();
        return true;
    };

    /* Tavlen viser navnene, som de kommer paa billedet */
    P.tegnFane = function (ctx) {
        var b = this.braet;
        b.tegn(ctx);
        var navne = this.undertekst();
        if (!navne || !navne.length) return;
        var s = b.s(), fs = Math.max(13, NK.klamp(s * 0.36, 12, 30) * 0.9);
        ctx.save();
        ctx.font = "600 " + fs + "px 'Segoe UI', sans-serif";
        ctx.fillStyle = "#4d5563";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        navne.forEach(function (n) {
            var p = b.px({ x: n.x, y: n.y });
            ctx.fillText(n.t, p.x, p.y + fs * 0.9);
        });
        ctx.restore();
    };

    /* ----- Kemichaels skuffe --------------------------------------------------- */
    P.bygSkuffe = function () {
        var mig = this, b = this.braet, e = NK.el("tb-skuffe-felter");
        e.innerHTML = "";
        NK.Skuffe.ALLE.forEach(function (k) {
            var knap = document.createElement("button");
            knap.type = "button";
            knap.setAttribute("data-navn", k.navn);
            knap.hidden = true;
            knap.addEventListener("click", function () {
                if (!NK.Skuffe.aaben(k.navn)) return;
                var v = "klister:" + k.navn;
                b.vaerktoej = b.vaerktoej === v ? "tegn" : v;
                NK.saetHTML("tb-skuffe-note", NK.html(b.vaerktoej === v ? k.titel + ": klik på tavlen, hvor det skal sidde." : "Klik på et klistermærke og så på tavlen."));
                mig.visPanel();
            });
            e.appendChild(knap);
        });
    };

    /* Kun de klistermaerker, eleven har laast op, kan ses; de andre er skjult */
    P.visSkuffe = function () {
        var b = this.braet, antal = NK.Skuffe.antalAabne();
        NK.saetTekst("tb-skuffe-antal", String(antal));
        /* Skuffen er usynlig, til eleven har klaret en quiz i Zigzagformler */
        NK.el("tb-skuffe").hidden = antal === 0;
        NK.el("tb-skuffe-felter").hidden = antal === 0;
        if (antal === 0) NK.saetHTML("tb-skuffe-note", TOM_SKUFFE);
        else if (this.skuffeTom !== false) NK.saetHTML("tb-skuffe-note", NK.html("Klik på et klistermærke og så på tavlen."));
        this.skuffeTom = antal === 0;
        Array.prototype.forEach.call(document.querySelectorAll("#tb-skuffe-felter button"), function (knap) {
            var k = NK.Skuffe.klister(knap.getAttribute("data-navn"));
            var aaben = NK.Skuffe.aaben(k.navn);
            knap.hidden = !aaben;
            if (aaben && !knap.firstChild) {
                knap.innerHTML = '<img src="' + k.adresse + '" alt="' + NK.html(k.titel) + '">';
                knap.title = k.titel;
            }
            knap.classList.toggle("aktiv", b.vaerktoej === "klister:" + k.navn);
        });
    };

    /* Fra vinduet med det nye klistermaerke: klar til at saette paa tavlen */
    P.vaelgKlister = function (navn) {
        var k = NK.Skuffe.klister(navn);
        if (!k || !NK.Skuffe.aaben(navn)) return;
        this.braet.vaerktoej = "klister:" + navn;
        NK.saetHTML("tb-skuffe-note", NK.html(k.titel + ": klik på tavlen, hvor det skal sidde."));
        this.visPanel();
    };

    P.enter = function () {};
    P.fokus = function () { this.visSkuffe(); };

    /* Delete: den valgte pil */
    P.slet = function () { var b = this.braet; if (b.valgtObj) { b.sletObjekt(b.valgtObj); return true; } return false; };

    NK.Praesentation.kobl(P, { noegle: "nk-tegnebraet-intro", tilbud: "tb-tilbud", spring: "tb-spring" });
    P.pegPaaFelt = function (til) { NK.el("tb-rapport").classList.toggle("peg", !!til); };

    NK.SimTegn = SimTegn;
}());
