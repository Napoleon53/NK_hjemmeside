/* =====================================================================
   sim_dryp.js - fane 1 (Dryp og tæl) og fane 3 (Ukendte fedtstoffer)

   En raekke reagensglas med et fedtstof oploest i heptan. Over det glas,
   opgaven handler om, haenger en pipette med bromvand. Et klik paa
   pipetten (eller glasset) drypper én draabe i; glasset ryster sig selv,
   og luppen viser, hvordan dibrom adderer til dobbeltbindingerne. Naar
   farven i det oeverste lag bliver ved, trykker eleven Indsend svar med
   antallet af draaber. Pipetten og knappen loeser aldrig opgaven selv.

   Fane 1 har de fem glas fra oevelse 4.6b og skemaet. Fane 3 har fire
   flasker med et ukendt fedtstof; luppen viser en flaske, foerst naar
   fedtstoffet er fundet, og panelet har varedeklarationerne.

   Glassene er js/glas.js, luppen js/lup.js, modellen js/fedt.js.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var F = NK.Fedt;
    var Tg = NK.Tegn;

    /* valg: navn, glas (D.D_GLAS), maal, ukendt (fane 3), ord ("glas" eller "flaske"),
       naesteFane, naesteNavn */
    function lav(valg) {
        function SimDryp() {
            this.v = valg;
            this.glasData = valg.glas;
            this.glas = valg.glas.map(function (g) { return new NK.Roer({ fedt: g.fedt }); });
            this.resultat = valg.glas.map(function () { return 0; });
            this.lup = new NK.Lup();
            this.valgt = -1;
            this.over = null;
            this.indsendT = "";
            this.startFane(valg.maal);
            this.visPanel();
        }

        var P = SimDryp.prototype;
        NK.Fane.paa(P, { navn: valg.navn, naesteFane: valg.naesteFane, naesteNavn: valg.naesteNavn });

        P.hvad = function (i) { return valg.ord + " " + this.glasData[i].nr; };
        P.fedtNavn = function (i) { return F.FEDT[this.glasData[i].fedt].navn; };

        /* Fane 3: navnet staar foerst, naar flasken er fundet */
        P.kendt = function (i) {
            if (!valg.ukendt) return true;
            var mig = this, ok = false;
            this.opgaver.forEach(function (o, j) { if (o.glas === i && mig.status[j].loest) ok = true; });
            return ok;
        };

        /* ----- Maalene --------------------------------------------------------------- */
        P.nyOpgave = function (o) {
            var mig = this;
            /* glassene fra opgaver, eleven har loest foer, staar med deres resultat */
            if (!this.hentet) {
                this.hentet = true;
                this.opgaver.forEach(function (x, j) {
                    if (mig.status[j].loest) { mig.glas[x.glas].tilEndepunkt(); mig.resultat[x.glas] = F.endepunkt(mig.glasData[x.glas].fedt); }
                });
            }
            this.glas[o.glas].nulstil();
            this.resultat[o.glas] = 0;
            this.valgt = o.glas;
            if (this.status) this.visPanel();
        };

        P.efterOpgave = function () {
            this.valgt = this.opg.o.glas;
            this.visPanel();
        };

        P.nulstilScene = function () {
            if (!this.iForsoeg()) { this.kortBlink(); return; }
            var i = this.opg.o.glas;
            this.glas[i].nulstil();
            this.valgt = i;
            this.visPanel();
            this.visIndsend();
        };

        P.forsoegSvar = function (o) {
            var i = o.glas;
            this.glas[i].tilEndepunkt();
            this.resultat[i] = F.endepunkt(this.glasData[i].fedt);
            this.valgt = i;
            this.visPanel();
        };

        /* ----- Indsend svar: antallet af draaber -------------------------------------------- */
        P.kanIndsendes = function () {
            var gl = this.glas[this.opg.o.glas];
            return gl.draaber() > 0 && gl.rolig();
        };

        P.indsendTekst = function () {
            var n = this.glas[this.opg.o.glas].draaber();
            return n > 0 ? "Indsend svar: " + D.draaberTekst(n) : "Indsend svar";
        };

        P.ikkeKlar = function () {
            var i = this.opg.o.glas;
            return this.glas[i].draaber() === 0 ? D.ingenDraaber(this.hvad(i)) : D.venter;
        };

        P.forsoegIndsend = function () {
            var i = this.opg.o.glas, gl = this.glas[i], n = gl.draaber();
            var slut = F.endepunkt(this.glasData[i].fedt);
            if (gl.proeve.frie() === 0) {
                this.fejlLinje(D.forTidligt(this.hvad(i), n));
                return;
            }
            this.resultat[i] = slut;
            this.visPanel();
            var foer = "";
            if (n > slut) {
                /* for mange draaber: tallet i skemaet er den foerste draabe, hvor farven blev */
                this.brugtSvar = true;
                foer = D.forMange(this.hvad(i), slut) + " ";
            }
            this.forsoegKlaret(foer + this.opg.o.forsoeg.set);
        };

        /* ----- Panelet ------------------------------------------------------------------- */
        P.visPanel = function () {
            var mig = this, html;
            if (!valg.ukendt) {
                var blind = this.resultat[4];
                html = '<table class="skema"><thead><tr><th>Glas</th><th>Fedtstof</th><th>Dråber</th>' + (blind ? "<th>Minus glas 5</th>" : "") + "</tr></thead><tbody>";
                this.glasData.forEach(function (g, i) {
                    var r = mig.resultat[i], n = mig.glas[i].draaber();
                    var tal = r ? String(r) : (n ? '<span class="mat">' + n + " …</span>" : "");
                    html += "<tr" + (mig.opg && mig.opg.o.glas === i && !mig.faerdig ? ' class="nu"' : "") + "><td>" + g.nr + "</td><td>" + NK.html(F.FEDT[g.fedt].navn) + "</td><td>" + tal + "</td>" +
                        (blind ? "<td>" + (r ? String(r - blind) : "") + "</td>" : "") + "</tr>";
                });
                NK.saetHTML(valg.navn + "-skema", html + "</tbody></table>");
                return;
            }
            /* Fane 3: varedeklarationerne og flaskerne */
            html = '<table class="skema dekl"><thead><tr><th>Fedtstof</th><th>Mættede</th><th>Mono&shy;umættede</th><th>Poly&shy;umættede</th></tr></thead><tbody>';
            D.KANDIDATER.forEach(function (id) {
                var f = F.FEDT[id];
                html += "<tr><td>" + NK.html(f.Navn) + "</td><td>" + f.tabel[0] + " %</td><td>" + f.tabel[1] + " %</td><td>" + f.tabel[2] + " %</td></tr>";
            });
            html += '</tbody></table><p class="note">' + NK.html(D.TRAN_NOTE) + "</p>";
            NK.saetHTML(valg.navn + "-dekl", html);
            html = '<table class="skema"><thead><tr><th>Flaske</th><th>Fedtstof</th><th>Dråber</th></tr></thead><tbody>';
            this.glasData.forEach(function (g, i) {
                var r = mig.resultat[i], n = mig.glas[i].draaber();
                var tal = r ? String(r) : (n ? '<span class="mat">' + n + " …</span>" : "");
                html += "<tr" + (mig.opg && mig.opg.o.glas === i && !mig.faerdig ? ' class="nu"' : "") + "><td>" + g.nr + "</td><td>" +
                    (mig.kendt(i) ? NK.html(F.FEDT[g.fedt].navn) : '<span class="mat">ukendt</span>') + "</td><td>" + tal + "</td></tr>";
            });
            NK.saetHTML(valg.navn + "-skema", html + "</tbody></table>");
        };

        /* ----- Scenen -------------------------------------------------------------------- */
        P.layout = function () {
            var W = this.L.b, H = this.L.h;
            var lay = { W: W, H: H };
            lay.yBord = H - 48;
            var kortBund = 10 + this.kortZone();
            var n = this.glas.length;
            var gh = NK.klamp((lay.yBord - kortBund) * 0.3, 92, 185), gb = gh * 60 / 230;
            lay.gh = gh;
            lay.gb = gb;
            var xs = [];
            for (var i = 0; i < n; i++) xs.push(W * (0.5 + (i - (n - 1) / 2) * (n === 5 ? 0.17 : 0.2)));
            this.glas.forEach(function (g, j) { g.plads(xs[j], lay.yBord, gb); });
            lay.xs = xs;
            var m = this.glas[0].maal(true);
            lay.glasTop = m.y0;
            /* pipetten haenger med spidsen lige over glassets kant */
            lay.ph = NK.klamp(gh * 0.5, 52, 100);
            lay.pb = lay.ph * 30 / 132;
            lay.spidsY = m.kant - 4;
            lay.pipTop = lay.spidsY - lay.ph;
            var lb = Math.min(W - 40, 760), ly = kortBund + 30;
            lay.lup = { x: W / 2 - lb / 2, y: ly, b: lb, h: Math.max(80, lay.pipTop - 36 - ly) };
            this.lay = lay;
            this.saetAnker("glas", xs[0] - gb, lay.glasTop - 4, xs[n - 1] - xs[0] + 2 * gb, gh + 50);
            this.saetAnker("lup", lay.lup.x, ly - 24, lb, lay.lup.h + 28);
        };

        /* Det glas, luppen viser: det valgte, hvis eleven maa se det */
        P.lupNu = function () {
            var i = this.valgt;
            if (i < 0 || this.gaetNu()) return -1;
            if (valg.ukendt && !this.kendt(i)) return -1;
            return i;
        };

        P.pipetteNu = function () {
            if (this.faerdig || !this.opg) return -1;
            return this.opg.o.glas;
        };

        P.pipetteRekt = function () {
            var i = this.pipetteNu(), lay = this.lay;
            if (i < 0 || !lay) return null;
            return { x: lay.xs[i] - lay.pb / 2, y: lay.pipTop, b: lay.pb, h: lay.ph };
        };

        P.opdaterScene = function (dt) {
            this.glas.forEach(function (g) { g.opdater(dt); });
            /* knappen Indsend svar foelger antallet af draaber */
            if (this.opg && this.opg.fase === "forsoeg") {
                var t = this.indsendTekst() + (this.kanIndsendes() ? "+" : "-");
                if (t !== this.indsendT) { this.indsendT = t; this.visIndsend(); this.visPanel(); }
            }
            NK.el(valg.navn + "-anker-lup").hidden = this.lupNu() < 0;
        };

        /* ----- Tegning ------------------------------------------------------------------- */
        P.tegn = function () {
            var ctx = this.L.ctx, lay = this.lay, mig = this;
            if (!lay) return;
            ctx.fillStyle = "#14141a";
            ctx.fillRect(0, 0, lay.W, lay.H);
            Tg.bord(ctx, lay.W, lay.yBord, lay.H);
            var om = this.omNu(), lup = this.lupNu(), pip = this.pipetteNu();

            if (lup >= 0) {
                var R = lay.lup, gl = this.glas[lup];
                Tg.zoomRamme(ctx, R, gl.zoomFelt(lup === pip), om.indexOf("lup") >= 0);
                this.lup.tegn(ctx, gl.proeve, R);
                var navn = this.fedtNavn(lup);
                NK.tekst(ctx, "Det øverste lag i " + this.hvad(lup) + ": " + navn + (F.FEDT[this.glasData[lup].fedt].heptan ? "" : " i heptan"),
                    R.x + 4, R.y - 9, { font: Tg.font("700", 15), farve: "#e6eaef" });
                var pr = gl.proeve, under = "", farve = "#b8f0cf";
                if (pr.frie() > 0) { under = "Frit dibrom giver farve"; farve = "#f7c9a0"; }
                else if (pr.adderet() > 0) under = "Dibrom har adderet til " + F.dbTekst(pr.adderet());
                if (under) NK.tekst(ctx, under, R.x + R.b - 4, R.y - 9, { font: Tg.font("600", 14), justering: "right", farve: farve });
            }

            this.glas.forEach(function (g, i) {
                g.tegnHolder(ctx);
                var spids = i === pip ? { x: lay.xs[i], y: lay.spidsY } : null;
                g.tegn(ctx, { maerke: mig.glasData[i].nr, aaben: i === pip, om: om.indexOf(i) >= 0 && i !== pip, tid: mig.tid, spids: spids });
                /* navnet og antallet af draaber under glasset */
                var kendt = mig.kendt(i), loest = kendt && mig.resultat[i] > 0;
                var navn = kendt ? F.FEDT[mig.glasData[i].fedt].navn : "ukendt";
                NK.tekst(ctx, mig.glasData[i].nr + " · " + navn, g.x, lay.yBord + 21, { font: Tg.font("700", 14), justering: "center", farve: loest ? "#9af0c0" : (kendt ? "#f2f3f5" : "#9aa3ae") });
                var n = g.draaber();
                if (n) NK.tekst(ctx, D.draaberTekst(n), g.x, lay.yBord + 39, { font: Tg.font("600", 13), justering: "center", farve: "#a9b0ba" });
            });

            /* Pipetten over det glas, opgaven handler om */
            var pr2 = this.pipetteRekt();
            if (pr2) {
                var gl2 = this.glas[pip], klem = gl2.fase === "falder" && gl2.t < 0.15 ? 0.9 : 1;
                ctx.save();
                ctx.translate(pr2.x + pr2.b / 2, pr2.y + pr2.h);
                ctx.scale(klem, 1);
                NK.Sprites.tegn(ctx, "pipette", -pr2.b / 2, -pr2.h, pr2.b, pr2.h);
                ctx.restore();
                var aktiv = this.iForsoeg() && gl2.klar();
                if (aktiv && gl2.draaber() === 0) Tg.ring(ctx, pr2.x - 4, pr2.y - 2, pr2.b + 8, pr2.h + 6, this.tid, 12);
                else if (om.indexOf("pipette") >= 0 && aktiv && this.over === "pipette") Tg.omRing(ctx, pr2.x, pr2.y, pr2.b, pr2.h);
                if (aktiv) Tg.skilt(ctx, "Klik: 1 dråbe", pr2.x + pr2.b / 2, pr2.y - 6, 8, lay.W - 8);
            }
            this.tegnSejr(ctx, lay.W, lay.H);
        };

        /* ----- Musen --------------------------------------------------------------------- */
        P.glasVed = function (pt) {
            for (var i = 0; i < this.glas.length; i++) if (this.glas[i].rammer(pt)) return i;
            return -1;
        };

        P.paaPipette = function (pt) {
            var r = this.pipetteRekt();
            return !!r && pt.x >= r.x - 10 && pt.x <= r.x + r.b + 10 && pt.y >= r.y - 34 && pt.y <= r.y + r.h + 4;
        };

        P.overScene = function (pt) {
            this.over = null;
            if (!pt || !this.lay) return null;
            if (this.paaPipette(pt)) { this.over = "pipette"; return "klik"; }
            var i = this.glasVed(pt);
            if (i >= 0) { this.over = i; return "klik"; }
            var lup = this.lupNu();
            return lup >= 0 && this.lup.ved(this.glas[lup].proeve, this.lay.lup, pt) ? "klik" : null;
        };

        P.klikScene = function (pt) {
            if (!this.lay) return;
            var pip = this.pipetteNu();
            if (this.paaPipette(pt) || (pip >= 0 && this.glasVed(pt) === pip)) { this.dryp(); return; }
            var i = this.glasVed(pt);
            if (i >= 0) { this.andetGlas(i); return; }
            var lup = this.lupNu();
            if (lup < 0) return;
            var hit = this.lup.ved(this.glas[lup].proeve, this.lay.lup, pt);
            if (!hit) return;
            if (hit.slags === "br") { this.kortBesked(D.lupBrom, 7); return; }
            var pr = this.glas[lup].proeve, medBrom = false;
            F.kaede(hit.id).dobbelt.forEach(function (k) { if (pr.harBrom(hit.m, hit.nr, k)) medBrom = true; });
            this.kortBesked(D.lupKaede(F.syre(hit.id), medBrom), 7);
        };

        /* Én draabe bromvand i det glas, opgaven handler om */
        P.dryp = function () {
            /* Laasen: kun mens kortet viser forsoeget */
            if (this.spaer()) return false;
            var i = this.opg.o.glas;
            if (!this.glas[i].dryp()) return false;
            this.valgt = i;
            this.nulstilHjaelp();
            this.visPanel();
            return true;
        };

        /* Et klik paa et andet glas: det kan ses i luppen, men pipetten flytter ikke */
        P.andetGlas = function (i) {
            if (this.opg && !this.faerdig) {
                var opgI = this.opg.o.glas;
                if (this.iForsoeg()) this.kortBesked(D.andetGlas(this.hvad(i), this.hvad(opgI)), 6);
                else this.kortBlink();
            }
            if (this.glas[i].draaber() > 0 && (!valg.ukendt || this.kendt(i))) this.valgt = i;
        };

        return SimDryp;
    }

    NK.SimDrypD = lav({ navn: "d", glas: D.D_GLAS, maal: D.D_MAAL, ord: "glas", naesteFane: "fane-m", naesteNavn: "Ét molekyle" });
    NK.SimDrypU = lav({ navn: "u", glas: D.U_GLAS, maal: D.U_MAAL, ord: "flaske", ukendt: true });
}());
