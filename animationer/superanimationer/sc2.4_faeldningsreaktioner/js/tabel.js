/* =====================================================================
   tabel.js - faeldningstabellen i panelet

   Raekkerne er de positive ioner, soejlerne de negative. Et felt er
   L, T eller ÷. Tabellen er baade et opslagsvaerk og, i de trin, hvor
   det giver mening, selve maaden at svare paa: eleven klikker paa det
   par, der falder ud.

   marker(m) tegner opgavens maerker paa tabellen:
     fundet  [{kat, an, klasse}]  par, eleven har fundet ("fundet", "faeld")
     hint    [{kat, an}]          raekke og soejle lyser op
     aktiv   true, naar et klik er et svar
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;

    var TEGN = { L: "L", T: "T", x: "÷" };
    var ORD = { L: "letopløseligt", T: "tungtopløseligt" };

    NK.Tabel = function (vaert, info, vedKlik) {
        this.vaert = vaert;
        this.info = info;
        this.vedKlik = vedKlik;
        this.celler = {};
        this.byg();
    };

    NK.Tabel.prototype.byg = function () {
        var self = this;
        var h = '<table class="ftabel"><thead><tr><th class="hjoerne"></th>';
        D.AN_ORDEN.forEach(function (a) {
            h += '<th class="an" data-an="' + a + '">' + D.ionTekst(D.ion(a)) + "</th>";
        });
        h += "</tr></thead><tbody>";
        D.KAT_ORDEN.forEach(function (k) {
            h += '<tr><th class="kat" data-kat="' + k + '">' + D.ionTekst(D.ion(k)) + "</th>";
            D.AN_ORDEN.forEach(function (a) {
                var kode = D.opl(k, a);
                h += '<td class="k' + kode + '" data-kat="' + k + '" data-an="' + a + '">' + TEGN[kode] + "</td>";
            });
            h += "</tr>";
        });
        h += "</tbody></table>";
        this.vaert.innerHTML = h;

        var tds = this.vaert.querySelectorAll("td");
        for (var i = 0; i < tds.length; i++) {
            this.celler[tds[i].getAttribute("data-kat") + "-" + tds[i].getAttribute("data-an")] = tds[i];
        }
        this.kanter = {};
        var ths = this.vaert.querySelectorAll("th[data-kat], th[data-an]");
        for (i = 0; i < ths.length; i++) {
            this.kanter[ths[i].getAttribute("data-kat") || ths[i].getAttribute("data-an")] = ths[i];
        }

        this.vaert.addEventListener("mouseover", function (e) {
            var td = e.target.closest ? e.target.closest("td") : null;
            if (td) self.over(td.getAttribute("data-kat"), td.getAttribute("data-an"));
        });
        this.vaert.addEventListener("mouseleave", function () { self.over(null, null); });
        this.vaert.addEventListener("click", function (e) {
            var td = e.target.closest ? e.target.closest("td") : null;
            if (!td) return;
            var k = td.getAttribute("data-kat"), a = td.getAttribute("data-an");
            self.over(k, a);
            if (self.vedKlik) self.vedKlik(k, a);
        });
        this.over(null, null);
    };

    /* Raekke og soejle lyser svagt op under musen, og infolinjen siger,
       hvad feltet betyder. Formlen staar der ikke: den skal eleven
       selv finde paa niveau 2 og 3. */
    NK.Tabel.prototype.over = function (k, a) {
        var aktive = this.vaert.querySelectorAll(".over");
        for (var i = 0; i < aktive.length; i++) aktive[i].classList.remove("over");
        if (!k) {
            this.info.textContent = "Hold musen over et felt.";
            this.info.className = "tabelinfo";
            return;
        }
        this.kanter[k].classList.add("over");
        this.kanter[a].classList.add("over");
        var kode = D.opl(k, a), par = D.ionTekst(D.ion(k)) + " og " + D.ionTekst(D.ion(a));
        this.info.textContent = kode === "x" ? D.FINDES_IKKE[k + "-" + a] : par + ": " + ORD[kode] + ".";
        this.info.className = "tabelinfo k" + kode;
    };

    NK.Tabel.prototype.marker = function (m) {
        m = m || {};
        var n, c;
        for (n in this.celler) {
            if (!this.celler.hasOwnProperty(n)) continue;
            c = this.celler[n];
            c.classList.remove("fundet", "faeld", "hint", "hintlinje", "blink");
        }
        for (n in this.kanter) if (this.kanter.hasOwnProperty(n)) this.kanter[n].classList.remove("hint");
        this.vaert.classList.toggle("aktiv", !!m.aktiv);

        var self = this;
        (m.hint || []).forEach(function (h) {
            self.kanter[h.kat].classList.add("hint");
            self.kanter[h.an].classList.add("hint");
            D.AN_ORDEN.forEach(function (a) { self.celler[h.kat + "-" + a].classList.add("hintlinje"); });
            D.KAT_ORDEN.forEach(function (k) { self.celler[k + "-" + h.an].classList.add("hintlinje"); });
            self.celler[h.kat + "-" + h.an].classList.add("hint");
        });
        (m.fundet || []).forEach(function (f) {
            self.celler[f.kat + "-" + f.an].classList.add(f.klasse || "fundet");
        });
    };

    /* Et kort blink paa et felt efter et forkert klik. */
    NK.Tabel.prototype.blink = function (k, a) {
        var c = this.celler[k + "-" + a];
        if (!c) return;
        c.classList.remove("blink");
        void c.offsetWidth;
        c.classList.add("blink");
    };
}());
