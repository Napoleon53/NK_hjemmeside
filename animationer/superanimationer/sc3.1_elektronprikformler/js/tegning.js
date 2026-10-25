/* =====================================================================
   tegning.js - alt, der tegnes paa laerredet

   Prikformlerne tegnes som i bogen: symbolet med elektronerne paa de
   fire sider og de faelles elektronpar mellem symbolerne. Hver elektron
   har farven fra det atom, den kom fra (oxygen blaa, hydrogen groen
   som i bogens figur), saa et faelles par viser én elektron fra hvert
   atom. Symbolet har samme farve som atomets elektroner (brugerens
   oenske 25. okt. 2026).

   NK.T.geometri(M, pos, F) regner hver priks plads ud. Den samme
   geometri bruges til at tegne, til at ramme elektronerne med musen og
   til at taelle, saa de tre aldrig er uenige.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var P = NK.Prik;
    var T = {};
    var HEL = Math.PI * 2;

    T.FARVE = { gul: "#f2c53d", roed: "#e05446", groen: "#3fae72", blaa: "#3d9ee0", hvid: "#f2f3f5" };
    var ETIKET = { roed: "#f0918a", groen: "#7ee0a8", gul: "#f2c53d", hvid: "#f2f3f5", blaa: "#9fd3ff" };

    /* Maalene, naar symbolet har skriftstoerrelsen F */
    T.maal = function (F) {
        return {
            F: F,
            prikR: Math.max(3.2, F * 0.125),
            par: F * 0.15,
            kolonne: F * 0.33,
            afstand: F * 0.27,
            bind: F * 2.45
        };
    };

    T.halv = function (symbol, F) {
        return { b: F * (symbol.length > 1 ? 0.55 : 0.37), h: F * 0.36 };
    };

    /* Ringen om et atom: stor nok til symbolet og dets elektroner */
    T.ringR = function (symbol, F) {
        var m = T.maal(F), h = T.halv(symbol, F);
        return Math.max(h.b, h.h) + m.afstand + m.prikR + 5;
    };

    /* ----- Geometrien ------------------------------------------------------
       pos: { id: { x, y } } atomernes midte i pixels. Svar:
         frie:  [{ id, side, i, x, y, farve, enlig }]  atomernes egne elektroner
         par:   [{ binding, x, y, farver: [a, b], prikker: [{x, y, farve}] }]
         sider: { id: P.sider(M, a) } */
    T.geometri = function (M, pos, F) {
        var m = T.maal(F);
        var ud = { frie: [], par: [], sider: {}, F: F };
        M.atomer.forEach(function (a) {
            var p = pos[a.id];
            if (!p) return;
            var el = D.EL[a.z];
            var h = T.halv(el.s, F);
            var sider = P.sider(M, a);
            ud.sider[a.id] = sider;
            sider.forEach(function (x, s) {
                if (!x || x.b || !x.e) return;
                var r = (s === 1 || s === 3) ? h.b + m.afstand : h.h + m.afstand;
                var dx = P.RET[s].x, dy = P.RET[s].y;
                var cx = p.x + dx * r, cy = p.y + dy * r;
                var px = -dy, py = dx;           /* paa tvaers af siden */
                var forsk;
                if (x.e === 1) forsk = [0];
                else if (x.e === 2) forsk = [-m.par, m.par];
                else forsk = [-3 * m.par, -m.par, m.par, 3 * m.par];
                forsk.forEach(function (f, i) {
                    ud.frie.push({ id: a.id, side: s, i: i, x: cx + px * f, y: cy + py * f, farve: el.farve, enlig: x.e === 1 });
                });
            });
        });
        M.bindinger.forEach(function (b) {
            var A = M.atomer[b.a], B = M.atomer[b.b];
            var pa = pos[A.id], pb = pos[B.id];
            if (!pa || !pb) return;
            var dx = pb.x - pa.x, dy = pb.y - pa.y;
            var len = Math.hypot(dx, dy) || 1;
            var ux = dx / len, uy = dy / len;
            var mx = (pa.x + pb.x) / 2, my = (pa.y + pb.y) / 2;
            for (var i = 0; i < b.n; i++) {
                var l = (i - (b.n - 1) / 2) * m.kolonne;
                var cx = mx + ux * l, cy = my + uy * l;
                ud.par.push({
                    binding: b, i: i, x: cx, y: cy,
                    prikker: [
                        { x: cx - uy * m.par, y: cy + ux * m.par, farve: D.EL[A.z].farve, id: A.id },
                        { x: cx + uy * m.par, y: cy - ux * m.par, farve: D.EL[B.z].farve, id: B.id }
                    ]
                });
            }
        });
        return ud;
    };

    /* Alle prikker, der taeller med hos atomet: dets frie elektroner og
       begge elektroner i hvert faelles par. Med uret fra toppen, saa en
       optaelling kan foelges. */
    T.atometsPrikker = function (G, M, a, pos) {
        var p = pos[a.id];
        var alle = G.frie.filter(function (x) { return x.id === a.id; }).map(function (x) { return { x: x.x, y: x.y }; });
        G.par.forEach(function (q) {
            if (q.binding.a === a.id || q.binding.b === a.id) q.prikker.forEach(function (d) { alle.push({ x: d.x, y: d.y }); });
        });
        function vinkel(d) {
            var v = Math.atan2(d.y - p.y, d.x - p.x) + Math.PI / 2;
            return ((v % HEL) + HEL) % HEL;
        }
        return alle.sort(function (u, v) { return vinkel(u) - vinkel(v); });
    };

    /* ----- Smaa tegnestykker ---------------------------------------------- */
    function prik(ctx, x, y, r, farve) {
        ctx.beginPath();
        ctx.arc(x, y, r, 0, HEL);
        ctx.fillStyle = farve;
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = "rgba(0, 0, 0, 0.45)";
        ctx.stroke();
    }
    T.prik = prik;

    T.ring = function (ctx, x, y, r, farve, opt) {
        opt = opt || {};
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, r, 0, HEL);
        if (opt.fyld) { ctx.fillStyle = opt.fyld; ctx.fill(); }
        ctx.strokeStyle = farve;
        ctx.lineWidth = opt.bredde || 3;
        if (opt.stiplet) ctx.setLineDash(opt.stiplet);
        if (opt.gloed) { ctx.shadowColor = farve; ctx.shadowBlur = opt.gloed; }
        ctx.stroke();
        ctx.restore();
    };

    T.etiket = function (ctx, tekst, x, y, farve, F) {
        ctx.save();
        ctx.font = "700 " + Math.round(Math.max(14, F * 0.42)) + "px 'Segoe UI', sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.lineWidth = 4;
        ctx.lineJoin = "round";
        ctx.strokeStyle = "#14141a";
        ctx.strokeText(tekst, x, y);
        ctx.fillStyle = ETIKET[farve] || farve || ETIKET.hvid;
        ctx.fillText(tekst, x, y);
        ctx.restore();
    };

    /* Etiketten staar skraat nede til hoejre for atomet: dér sidder
       hverken bindinger eller elektroner. */
    T.etiketPunkt = function (a, pos, F) {
        var p = pos[a.id];
        var r = T.ringR(D.EL[a.z].s, F) + F * 0.32;
        return { x: p.x + r * 0.78, y: p.y + r * 0.72 };
    };

    function symbol(ctx, tekst, x, y, F, farve) {
        ctx.font = "700 " + Math.round(F) + "px 'Segoe UI', sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = farve || T.FARVE.hvid;
        ctx.fillText(tekst, x, y + F * 0.03);
    }
    T.symbol = symbol;

    /* ----- Et molekyle ------------------------------------------------------
       vis:
         tid           til gloeden om de uparrede elektroner
         gloed         de uparrede elektroner gloeder (de kan traekkes)
         skjul         { id, side } en elektron, der er i haanden
         valgt         { id, side } en elektron, der er klikket paa
         over          { id, side } eller { binding } under musen
         maal          elektronen under musen er et maal for den, der traekkes
         ringe         { id: farve | { farve, stiplet } }
         etiketter     { id: { tekst, farve } }
         taelling      { id, n, faerdig }: de foerste n prikker lyser op
         alfa          gennemsigtighed for det hele */
    T.molekyle = function (ctx, M, pos, F, vis) {
        vis = vis || {};
        var G = T.geometri(M, pos, F);
        var m = T.maal(F);
        ctx.save();
        if (vis.alfa !== undefined) ctx.globalAlpha *= vis.alfa;

        /* Ringe om atomerne */
        M.atomer.forEach(function (a) {
            var r = vis.ringe && vis.ringe[a.id];
            if (!r || !pos[a.id]) return;
            var farve = typeof r === "string" ? r : r.farve;
            var navn = T.FARVE[farve] || farve;
            var R = T.ringR(D.EL[a.z].s, F);
            T.ring(ctx, pos[a.id].x, pos[a.id].y, R, navn, {
                bredde: 3, gloed: r.gloed === false ? 0 : 12, stiplet: r.stiplet,
                fyld: farve === "gul" ? "rgba(242, 197, 61, 0.07)" : (farve === "blaa" ? "rgba(61, 158, 224, 0.08)" : null)
            });
        });

        /* Et faelles par under musen kan klikkes: lys bag det */
        if (vis.over && vis.over.binding) {
            G.par.forEach(function (q) {
                if (q.binding !== vis.over.binding || q.i !== q.binding.n - 1) return;
                ctx.save();
                ctx.beginPath();
                ctx.arc(q.x, q.y, m.par * 2.6, 0, HEL);
                ctx.fillStyle = "rgba(255, 255, 255, 0.10)";
                ctx.fill();
                ctx.restore();
            });
        }

        /* De faelles elektronpar */
        G.par.forEach(function (q) {
            q.prikker.forEach(function (d) { prik(ctx, d.x, d.y, m.prikR, d.farve); });
        });

        /* Symbolerne */
        M.atomer.forEach(function (a) {
            var p = pos[a.id];
            if (!p) return;
            symbol(ctx, D.EL[a.z].s, p.x, p.y, F, D.EL[a.z].farve);
        });

        /* Atomernes egne elektroner. De uparrede gloeder, naar de kan traekkes. */
        var puls = 0.5 + 0.5 * Math.sin((vis.tid || 0) * 3.2);
        G.frie.forEach(function (d) {
            if (vis.skjul && vis.skjul.id === d.id && vis.skjul.side === d.side) return;
            var valgt = vis.valgt && vis.valgt.id === d.id && vis.valgt.side === d.side;
            var over = vis.over && vis.over.id === d.id && vis.over.side === d.side;
            if (d.enlig && (vis.gloed || valgt)) {
                ctx.save();
                ctx.beginPath();
                ctx.arc(d.x, d.y, m.prikR + 4 + (valgt || over ? 3 : 2 * puls), 0, HEL);
                ctx.fillStyle = valgt ? "rgba(255, 255, 255, 0.35)" : "rgba(255, 255, 255, " + (over ? 0.32 : 0.10 + 0.12 * puls) + ")";
                ctx.fill();
                ctx.restore();
            }
            prik(ctx, d.x, d.y, m.prikR * (over && d.enlig && vis.gloed ? 1.2 : 1), d.farve);
            if (valgt || (over && d.enlig && vis.maal)) T.ring(ctx, d.x, d.y, m.prikR + 7, "#ffffff", { bredde: 2 });
        });

        /* Optaellingen: de talte prikker faar en hvid ring én ad gangen, saa
           man stadig kan se, hvilket atom hver elektron kom fra */
        var t = vis.taelling, talt = null;
        if (t) {
            talt = M.atomer[t.id];
            var prikker = T.atometsPrikker(G, M, talt, pos);
            var n = Math.min(prikker.length, Math.floor(t.n));
            ctx.save();
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 2;
            ctx.shadowColor = "#bfe6ff";
            ctx.shadowBlur = 8;
            for (var i = 0; i < n; i++) {
                var ny = !t.faerdig && i === n - 1;
                ctx.beginPath();
                ctx.arc(prikker[i].x, prikker[i].y, m.prikR + (ny ? 4 : 1.9), 0, HEL);
                ctx.stroke();
            }
            ctx.restore();
        }

        /* Etiketterne */
        M.atomer.forEach(function (a) {
            if (!pos[a.id]) return;
            var tekst = null, farve = null;
            if (talt === a) {
                var st = P.status(M, a);
                tekst = Math.min(st.nu, Math.floor(t.n)) + " e" + NK.haevet("-");
                farve = !t.faerdig ? "hvid" : (st.ok ? "groen" : "roed");
            } else if (vis.etiketter && vis.etiketter[a.id]) {
                tekst = vis.etiketter[a.id].tekst;
                farve = vis.etiketter[a.id].farve;
            }
            if (tekst) {
                var ep = T.etiketPunkt(a, pos, F);
                T.etiket(ctx, tekst, ep.x, ep.y, farve, F);
            }
        });
        ctx.restore();
        return G;
    };

    /* ----- Stregformlen: hvert faelles elektronpar er en streg ------------- */
    T.stregformel = function (ctx, M, pos, F, alfa) {
        ctx.save();
        ctx.globalAlpha *= (alfa === undefined ? 1 : alfa);
        ctx.strokeStyle = "#c9d0d9";
        ctx.lineWidth = Math.max(2, F * 0.07);
        ctx.lineCap = "round";
        M.bindinger.forEach(function (b) {
            var A = M.atomer[b.a], B = M.atomer[b.b];
            var pa = pos[A.id], pb = pos[B.id];
            var dx = pb.x - pa.x, dy = pb.y - pa.y;
            var len = Math.hypot(dx, dy) || 1;
            var ux = dx / len, uy = dy / len;
            var ha = T.halv(D.EL[A.z].s, F), hb = T.halv(D.EL[B.z].s, F);
            var ra = (Math.abs(ux) > 0.5 ? ha.b : ha.h) + F * 0.16;
            var rb = (Math.abs(ux) > 0.5 ? hb.b : hb.h) + F * 0.16;
            for (var i = 0; i < b.n; i++) {
                var f = (i - (b.n - 1) / 2) * F * 0.17;
                ctx.beginPath();
                ctx.moveTo(pa.x + ux * ra - uy * f, pa.y + uy * ra + ux * f);
                ctx.lineTo(pb.x - ux * rb - uy * f, pb.y - uy * rb + ux * f);
                ctx.stroke();
            }
        });
        M.atomer.forEach(function (a) { symbol(ctx, D.EL[a.z].s, pos[a.id].x, pos[a.id].y, F, D.EL[a.z].farve); });
        ctx.restore();
    };

    /* ----- Atomet, eleven bygger (fanen Byg, foerste trin) -----------------
       Hver side har to pladser. pladser er [[0/1, 0/1] x 4]: om der sidder
       en elektron paa pladsen. Tomme pladser er stiplede cirkler, saa man
       kan se, hvor elektronerne kan sidde. over: { side, plads } under musen. */
    T.pladsPunkter = function (x, y, F, z) {
        var m = T.maal(F), h = T.halv(D.EL[z].s, F), ud = [];
        for (var s = 0; s < 4; s++) {
            var r = (s === 1 || s === 3) ? h.b + m.afstand : h.h + m.afstand;
            var dx = P.RET[s].x, dy = P.RET[s].y;
            var px = -dy, py = dx;
            [-m.par * 1.25, m.par * 1.25].forEach(function (f, k) {
                ud.push({ side: s, plads: k, x: x + dx * r + px * f, y: y + dy * r + py * f });
            });
        }
        return ud;
    };

    /* Den plads, punktet rammer (eller null) */
    T.pladsVed = function (x, y, F, z, pt) {
        var r = Math.max(15, T.maal(F).par * 1.2), bedst = null;
        T.pladsPunkter(x, y, F, z).forEach(function (q) {
            var d = Math.hypot(pt.x - q.x, pt.y - q.y);
            if (d < r && (!bedst || d < bedst.d)) bedst = { side: q.side, plads: q.plads, d: d };
        });
        return bedst;
    };

    T.byggeAtom = function (ctx, x, y, F, z, pladser, over) {
        var el = D.EL[z];
        var m = T.maal(F);
        ctx.save();
        symbol(ctx, el.s, x, y, F, el.farve);
        T.pladsPunkter(x, y, F, z).forEach(function (q) {
            var fyldt = pladser[q.side][q.plads];
            var lys = over && over.side === q.side && over.plads === q.plads;
            if (lys) {
                ctx.beginPath();
                ctx.arc(q.x, q.y, m.prikR + 7, 0, HEL);
                ctx.fillStyle = fyldt ? "rgba(224, 84, 70, 0.22)" : "rgba(242, 197, 61, 0.22)";
                ctx.fill();
            }
            if (fyldt) prik(ctx, q.x, q.y, m.prikR, el.farve);
            else T.ring(ctx, q.x, q.y, m.prikR, lys ? "rgba(255, 223, 107, 0.9)" : "rgba(255, 255, 255, 0.3)", { bredde: 1.4, stiplet: [3, 3] });
        });
        ctx.restore();
    };

    /* Hvilken side af atomet et punkt er ved (eller -1 langt vaek) */
    T.sideVed = function (x, y, F, pt) {
        var dx = pt.x - x, dy = pt.y - y;
        var d = Math.hypot(dx, dy);
        if (d > F * 2.7 || d < F * 0.2) return -1;
        return P.side(Math.abs(dx) >= Math.abs(dy) ? Math.sign(dx) : 0, Math.abs(dy) > Math.abs(dx) ? Math.sign(dy) : 0);
    };

    /* ----- Det periodiske system med hovedgrupperne ------------------------
       z: grundstoffet, kortet spoerger om (gul ring). gruppe: kolonnen
       lyser svagt (andet hint). Giver felternes pladser til musen. */
    T.periodisk = function (ctx, x, y, celle, z, gruppe) {
        var felter = [];
        var mark = z ? D.EL[z].s : null;
        ctx.save();
        ctx.font = "700 " + Math.round(celle * 0.3) + "px 'Segoe UI', sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#a9b0ba";
        ctx.fillText("Hovedgruppe", x + celle * 4, y - celle * 0.95);
        for (var g = 0; g < 8; g++) {
            ctx.font = "700 " + Math.round(celle * 0.34) + "px 'Segoe UI', sans-serif";
            ctx.fillStyle = gruppe === g + 1 ? "#ffdf6b" : "#cfd6de";
            ctx.fillText(String(g + 1), x + celle * (g + 0.5), y - celle * 0.42);
        }
        if (gruppe) {
            ctx.fillStyle = "rgba(242, 197, 61, 0.13)";
            NK.rundtRekt(ctx, x + celle * (gruppe - 1) + 1, y - celle * 0.72, celle - 2, celle * 4.72, 6);
            ctx.fill();
        }
        D.PT.forEach(function (raekke, r) {
            raekke.forEach(function (f, g) {
                if (!f) return;
                var fx = x + g * celle + 2, fy = y + r * celle + 2, fb = celle - 4;
                var kendt = !!Object.keys(D.EL).filter(function (k) { return D.EL[k].s === f[0]; }).length;
                NK.rundtRekt(ctx, fx, fy, fb, fb, 5);
                ctx.fillStyle = kendt ? "#2f3240" : "#25262f";
                ctx.fill();
                ctx.lineWidth = 1;
                ctx.strokeStyle = "#454a59";
                ctx.stroke();
                ctx.fillStyle = "#8d95a1";
                ctx.font = "600 " + Math.round(celle * 0.22) + "px 'Segoe UI', sans-serif";
                ctx.textAlign = "left";
                ctx.fillText(String(f[1]), fx + 4, fy + celle * 0.17);
                ctx.textAlign = "center";
                ctx.font = "700 " + Math.round(celle * 0.36) + "px 'Segoe UI', sans-serif";
                ctx.fillStyle = kendt ? "#f2f3f5" : "#9aa1ab";
                ctx.fillText(f[0], fx + fb / 2, fy + fb * 0.58);
                if (f[0] === mark) T.ring(ctx, fx + fb / 2, fy + fb / 2, fb * 0.62, T.FARVE.gul, { bredde: 2.5, gloed: 10 });
                felter.push({ s: f[0], x: fx, y: fy, b: fb, h: fb });
            });
        });
        ctx.restore();
        return felter;
    };

    /* ----- Et ark med en lille overskrift (Find fejlen) -------------------- */
    T.ark = function (ctx, r, titel, farve, alfa) {
        ctx.save();
        ctx.globalAlpha *= alfa === undefined ? 1 : alfa;
        NK.rundtRekt(ctx, r.x, r.y, r.b, r.h, 14);
        ctx.fillStyle = "rgba(255, 255, 255, 0.035)";
        ctx.fill();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.14)";
        ctx.lineWidth = 1;
        ctx.stroke();
        NK.tekst(ctx, titel, r.x + 14, r.y + 22, { font: "700 13px 'Segoe UI', sans-serif", farve: farve || "#a9b0ba" });
        ctx.restore();
    };

    /* En pil fra venstre mod hoejre */
    T.pil = function (ctx, x1, x2, y, farve) {
        ctx.save();
        ctx.strokeStyle = farve || "#7e8590";
        ctx.fillStyle = farve || "#7e8590";
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(x1, y);
        ctx.lineTo(x2 - 10, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x2, y);
        ctx.lineTo(x2 - 13, y - 8);
        ctx.lineTo(x2 - 13, y + 8);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    };

    /* Et gult skilt med en kort tekst (det, et klik goer) */
    T.skilt = function (ctx, tekst, x, y, alfa) {
        ctx.save();
        ctx.globalAlpha *= alfa === undefined ? 1 : alfa;
        ctx.font = "700 14px 'Segoe UI', sans-serif";
        var b = ctx.measureText(tekst).width + 22, h = 28;
        NK.rundtRekt(ctx, x - b / 2, y - h / 2, b, h, 8);
        ctx.fillStyle = "#ffdf6b";
        ctx.fill();
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#33290a";
        ctx.fillText(tekst, x, y + 1);
        ctx.restore();
    };

    NK.T = T;
}());
