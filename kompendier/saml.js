/* Sætter et kompendium sammen af de dele, lav_kompendium.py har lavet.
 *
 * Bruges af index.html og af kompendier/proev.js. Hvert kapitels dele ligger som sider i én PDF
 * (data/kapitel-N-pdf.js), og data/kapitler.js siger, hvilke sider der hører til hvilken del. Her bliver
 * de valgte sider kopieret over i en ny PDF, sidetallene bliver sat på, og indholdet bliver skrevet.
 * Indholdet står på forsiden i et hvidt felt under navn og klasse. Det får sin egen side, når læreren
 * vælger separat forside, når der ingen forside er, eller når der er flere linjer, end forsiden har plads til.
 * Et kompendium kan have dele fra flere kapitler: så ligger hvert kapitels forside foran kapitlets dele.
 * Tal og linjer til indholdet klippes ud af PDF'ens hjælpesider, så de får samme skrift som resten.
 * PDF-arbejdet laves af pdf-lib (pdf-lib.min.js).
 */
(function (rod) {
  'use strict';

  var NIVEAUER = ['lav', 'mellem', 'mange'];
  var EGEN = 'Egen øvelsesvejledning';
  var SIDSTE_BILAG = 'bilag-periodesystem';

  // Kapitlernes numre i rækkefølge.
  function numre(kapitler) {
    return Object.keys(kapitler).sort(function (a, b) { return parseFloat(a) - parseFloat(b) || (a < b ? -1 : 1); });
  }

  function del(data, id) {
    for (var i = 0; i < data.dele.length; i++) {
      if (data.dele[i].id === id) return data.dele[i];
    }
    return null;
  }

  // Valgene for ét kapitel, første gang det vælges: alle afsnit med noter og en mellem mængde opgaver.
  function kapitelvalg(data) {
    var v = { med: false, afsnit: {}, oevelser: {}, udgaver: {} };
    data.afsnit.forEach(function (a) { v.afsnit[a.nr] = { med: true, noter: true, opgaver: 'mellem' }; });
    data.oevelser.forEach(function (id) { v.oevelser[id] = false; });
    return v;
  }

  // En øvelse kan have to udgaver. Den åbne udgave er en del for sig, og valget står i v.udgaver.
  function oevelsesdel(data, v, id) {
    var u = data.udgaver && data.udgaver[id];
    return u && v.udgaver && v.udgaver[id] === 'aaben' ? u.aaben : id;
  }

  // Valgene, når siden åbnes første gang: intet kapitel er valgt.
  function standardvalg(kapitler) {
    var valg = { forside: true, indhold: true, separat: false, kapitler: {}, bilag: {} };
    numre(kapitler).forEach(function (nr) { valg.kapitler[nr] = kapitelvalg(kapitler[nr]); });
    return valg;
  }

  function valgte(kapitler, valg) {
    return numre(kapitler).filter(function (nr) { return valg.kapitler[nr] && valg.kapitler[nr].med; });
  }

  // De bilag, de valgte kapitler har, hvert bilag én gang. Det periodiske system står altid sidst.
  function bilagene(kapitler, valg) {
    var ud = [], sidst = null;
    valgte(kapitler, valg).forEach(function (nr) {
      kapitler[nr].bilag.forEach(function (id) {
        if (id === SIDSTE_BILAG) { sidst = sidst || { id: id, kap: nr }; return; }
        if (!ud.some(function (b) { return b.id === id; })) ud.push({ id: id, kap: nr });
      });
    });
    if (sidst) ud.push(sidst);
    return ud.map(function (b) { b.del = del(kapitler[b.kap], b.id); return b; });
  }

  function kapitelnavn(data) {
    return 'Kapitel ' + data.kapitel + ': ' + data.titel;
  }

  // "kapitel 2" eller "kapitel 1, 2 og 3".
  function kapitelord(liste) {
    if (!liste.length) return '';
    if (liste.length === 1) return 'kapitel ' + liste[0];
    return 'kapitel ' + liste.slice(0, -1).join(', ') + ' og ' + liste[liste.length - 1];
  }

  // Hvordan et antal linjer står i et felt med højden hoejde. g har linjernes største afstand (trin) og
  // størrelse (skala), og strimmel er en linjes højde i fuld størrelse. Er der ikke plads, rykker
  // linjerne sammen, og når de ikke kan stå tættere, bliver de mindre. passer siger, om de stadig er
  // store nok at læse (minskala).
  function opstilling(antal, hoejde, g, strimmel) {
    var s = g.skala || 1, t = g.trin;
    var taet = 0.66 * strimmel;
    if (antal > 1) t = Math.min(t, (hoejde - strimmel * s) / (antal - 1));
    if (t < taet * s) {
      s = hoejde / (taet * (antal - 1) + strimmel);
      t = taet * s;
    }
    return { trin: t, skala: s, passer: s >= (g.minskala || 0) };
  }

  // Feltet med indholdet på forsiden: ordet Indhold og linjerne under det. Alle mål er i punkt fra
  // sidens øverste venstre hjørne. Giver null, når der er flere linjer, end forsiden har plads til.
  // OVER og UNDER er luften over ordet Indhold og under den sidste linje, og EFTER er den ekstra luft
  // mellem ordet Indhold og den første linje.
  var OVER = 6, UNDER = 9, EFTER = 4;
  function forsidefelt(geo, antal) {
    var f = geo.forside;
    if (!f || !geo.etiket) return null;
    var o = opstilling(antal + 1, f.bund - f.top - OVER - UNDER - EFTER, f, geo.strimmel.h);
    if (!o.passer) return null;
    return { x: f.x, y: f.top + OVER, trin: o.trin, skala: o.skala, efter: EFTER,
      kant: { x: f.x - f.luft, y: f.top, b: o.skala * geo.indhold.bredde + 2 * f.luft,
        h: OVER + UNDER + EFTER + geo.strimmel.h * o.skala + antal * o.trin } };
  }

  // Højden af det felt, linjerne står i, når indholdet har sin egen side.
  function indholdshoejde(geo) {
    return (geo.indhold.bund || 767) - geo.indhold.y;
  }

  // Hvor mange sider indholdet fylder, når det ikke står på forsiden. Linjerne må ikke blive mindre end
  // MINDST af fuld størrelse, så er der mange linjer, deles de på flere sider.
  var MINDST = 0.8;
  function indholdssider(geo, antal) {
    var sh = geo.strimmel.h;
    var plads = Math.floor((indholdshoejde(geo) / (geo.indhold.minskala || MINDST) - sh) / (0.66 * sh)) + 1;
    return Math.max(1, Math.ceil(antal / plads));
  }

  // Planen for kompendiet: delene i rækkefølge med første side og antal sider (poster), og linjerne til
  // indholdet (linjer). egne er lærerens egne vejledninger: [{ navn, sider }]. indhold siger, hvor
  // indholdet står: 'forside', 'side' (sine egne sider) eller null. forlangt er sand, når indholdet skulle
  // have stået på forsiden, men har for mange linjer.
  function plan(kapitler, valg, egne) {
    var paaForside = !!(valg.forside && valg.indhold && !valg.separat);
    var p = laeg(kapitler, valg, egne, paaForside ? 0 : 1);
    if (!p.kapitler.length) return p;
    var geo = kapitler[p.kapitler[0]].geometri;
    var forlangt = paaForside && !forsidefelt(geo, p.linjer.length);
    var sider = forlangt || p.indhold === 'side' ? indholdssider(geo, p.linjer.length) : 0;
    if (forlangt || sider > 1) {
      p = laeg(kapitler, valg, egne, sider);
      p.forlangt = forlangt;
    }
    return p;
  }

  // egnesider: antallet af sider, indholdet får for sig selv. 0 betyder, at det står på forsiden.
  function laeg(kapitler, valg, egne, egnesider) {
    var poster = [], linjer = [], indhold = null;
    var side = 1;
    var med = valgte(kapitler, valg);
    function tilfoej(post) {
      post.side = side;
      side += post.sider;
      poster.push(post);
      return post;
    }
    function delpost(nr, id) {
      var d = del(kapitler[nr], id);
      var post = tilfoej({ slags: 'del', kap: nr, del: d, titel: d.titel, sider: d.sider });
      linjer.push({ kap: nr, titel: d.titel, side: post.side });
    }
    med.forEach(function (nr, i) {
      var data = kapitler[nr], v = valg.kapitler[nr];
      var foerste = side;
      var kapitellinje = { kap: nr, titel: kapitelnavn(data), side: side, fed: true };
      var plads = linjer.length;
      var forside = valg.forside ? tilfoej({ slags: 'forside', kap: nr, titel: 'Forside til kapitel ' + nr, sider: 1 }) : null;
      if (i === 0 && valg.indhold) {
        if (forside && !egnesider) {
          forside.indhold = true;
          indhold = 'forside';
        } else {
          tilfoej({ slags: 'indhold', kap: nr, titel: 'Indhold', sider: Math.max(1, egnesider) });
          indhold = 'side';
          // Uden forside er indholdet kompendiets første side, og kapitlet begynder på siden efter.
          if (!valg.forside) kapitellinje.side = side;
        }
      }
      data.afsnit.forEach(function (a) {
        var av = v.afsnit[a.nr];
        if (!av || !av.med) return;
        if (av.noter !== false) delpost(nr, a.noter);
        if (a.opgaver[av.opgaver]) delpost(nr, a.opgaver[av.opgaver]);
      });
      data.oevelser.forEach(function (id) { if (v.oevelser[id]) delpost(nr, oevelsesdel(data, v, id)); });
      // Med flere kapitler får hvert kapitel sin egen linje i indholdet.
      if (med.length > 1 && side > foerste && side > kapitellinje.side) linjer.splice(plads, 0, kapitellinje);
    });
    (egne || []).forEach(function (e, i) {
      var post = tilfoej({ slags: 'egen', nr: i, titel: EGEN, navn: e.navn, sider: e.sider });
      linjer.push({ kap: null, titel: EGEN, side: post.side });
    });
    bilagene(kapitler, valg).forEach(function (b) {
      if (valg.bilag[b.id] === false) return;
      var post = tilfoej({ slags: 'del', kap: b.kap, del: b.del, titel: b.del.titel, sider: b.del.sider });
      linjer.push({ kap: b.kap, titel: b.del.titel, side: post.side });
    });
    return { poster: poster, linjer: linjer, sider: side - 1, kapitler: med, indhold: indhold, forlangt: false };
  }

  // Kompendiets navn: "Kompendium til kapitel 2 og 3".
  function navn(kapitler, valg) {
    var med = valgte(kapitler, valg);
    return 'Kompendium' + (med.length ? ' til ' + kapitelord(med) : '');
  }

  // Det felt på en hjælpeside, hvor tallet n står. g er målene fra skabelonen, og h er sidens højde.
  function talfelt(g, n, h) {
    var x = g.x + ((n - 1) % g.kolonner) * g.dx;
    var y = g.y + Math.floor((n - 1) / g.kolonner) * g.dy;
    return { left: x, bottom: h - y - g.h, right: x + g.b, top: h - y };
  }

  // Sætter kompendiet sammen og giver PDF'en som bytes.
  // hentPdf(nr) giver et løfte om kapitlets PDF (base64). egne: [{ navn, sider, bytes }].
  function saml(PDFLib, kapitler, hentPdf, valg, egne) {
    egne = egne || [];
    var p = plan(kapitler, valg, egne);
    var kilder = {};   // kapitlets nummer -> PDF'en med kapitlets dele
    var koe = {};      // kapitlets nummer -> de kopierede sider, i den rækkefølge de skal bruges
    var flere = [];    // de ekstra sider til indholdet, når det fylder mere end én side
    var ud;
    var brugte = [];
    p.poster.forEach(function (post) {
      if (post.kap && brugte.indexOf(post.kap) < 0) brugte.push(post.kap);
    });

    // Hvert kapitels PDF læses kun første gang.
    var hent = Promise.all(brugte.map(function (nr) {
      var data = kapitler[nr];
      if (data._kilde) { kilder[nr] = data._kilde; return null; }
      return Promise.resolve(hentPdf(nr)).then(function (pdf) { return PDFLib.PDFDocument.load(pdf); })
        .then(function (dok) { data._kilde = kilder[nr] = dok; });
    }));

    return hent.then(function () {
      return PDFLib.PDFDocument.create();
    }).then(function (nyt) {
      ud = nyt;
      ud.setTitle(navn(kapitler, valg));
      ud.setCreator('Kemibogen');
      // Alle sider fra ét kapitel hentes på én gang, så skrifter og figurer kun kommer med én gang.
      return Promise.all(brugte.map(function (nr) {
        var data = kapitler[nr], sidenumre = [];
        p.poster.forEach(function (post) {
          if (post.kap !== nr) return;
          if (post.slags === 'forside') sidenumre.push(data.forside);
          else if (post.slags === 'indhold') sidenumre.push(data.hjaelpesider.indhold);
          else for (var i = 0; i < post.del.sider; i++) sidenumre.push(post.del.start + i);
        });
        return ud.copyPages(kilder[nr], sidenumre).then(function (sider) { koe[nr] = sider; });
      }));
    }).then(function () {
      // Fylder indholdet flere sider, hentes siden Indhold én gang til for hver ekstra side. Det sker i
      // hvert sit kald, så siderne ikke kommer til at dele indhold.
      var kaede = Promise.resolve();
      p.poster.forEach(function (post) {
        if (post.slags !== 'indhold') return;
        for (var i = 1; i < post.sider; i++) {
          kaede = kaede.then(function () {
            return ud.copyPages(kilder[post.kap], [kapitler[post.kap].hjaelpesider.indhold]);
          }).then(function (sider) { flere.push(sider[0]); });
        }
      });
      return kaede;
    }).then(function () {
      // Siderne lægges ind i rækkefølge. Lærerens egne filer hentes ind, hvor de skal stå.
      var kaede = Promise.resolve();
      p.poster.forEach(function (post) {
        kaede = kaede.then(function () {
          if (post.slags !== 'egen') {
            for (var i = 0; i < post.sider; i++) ud.addPage(post.slags === 'indhold' && i ? flere.shift() : koe[post.kap].shift());
            return null;
          }
          return PDFLib.PDFDocument.load(egne[post.nr].bytes, { ignoreEncryption: true }).then(function (egen) {
            return ud.copyPages(egen, egen.getPageIndices());
          }).then(function (egnesider) {
            egnesider.forEach(function (s) { ud.addPage(s); });
          });
        });
      });
      return kaede;
    }).then(function () {
      if (!brugte.length) return null;
      // Tallene og linjen til lærerens egne vejledninger klippes fra det første kapitel, og hver dels
      // linje fra delens eget kapitel. Sidetal kommer på alle sider undtagen forsider og lærerens egne.
      var hoved = brugte[0];
      var geo = kapitler[hoved].geometri;
      var klip = {};
      function klipud(nr, hjaelpeside, felt, tegn) {
        (klip[nr] = klip[nr] || []).push({ side: kilder[nr].getPage(kapitler[nr].hjaelpesider[hjaelpeside]), felt: felt, tegn: tegn });
      }
      var h = kilder[hoved].getPage(kapitler[hoved].hjaelpesider.sidetal).getHeight();
      p.poster.forEach(function (post) {
        if (post.slags === 'forside' || post.slags === 'egen') return;
        for (var i = 0; i < post.sider; i++) {
          (function (n) {
            klipud(hoved, 'sidetal', talfelt(geo.sidetal, n, h), function (stykke) {
              var side = ud.getPage(n - 1);
              side.drawPage(stykke, { x: (side.getWidth() - geo.sidetal.b) / 2, y: geo.fod });
            });
          })(post.side + i);
        }
      });
      // Indholdet: på sin egen side eller i et hvidt felt på forsiden. m er stedet, linjerne står:
      // første linjes øverste venstre hjørne (x, y fra sidens top), afstanden mellem linjerne og skalaen.
      // indhold er siderne, linjerne står på, og prSide er antallet af linjer på hver.
      var indhold = null, m = null, foerste = 0, prSide = Math.max(1, p.linjer.length);
      var sh = geo.strimmel.h;
      p.poster.forEach(function (post) {
        if (post.slags === 'indhold') {
          indhold = [];
          for (var i = 0; i < post.sider; i++) indhold.push(ud.getPage(post.side - 1 + i));
          prSide = Math.max(1, Math.ceil(p.linjer.length / post.sider));
          var o = opstilling(prSide, indholdshoejde(geo), geo.indhold, sh);
          m = { x: geo.indhold.x, y: geo.indhold.y, trin: o.trin, skala: o.skala };
        } else if (post.slags === 'forside' && post.indhold) {
          indhold = [ud.getPage(post.side - 1)];
          m = forsidefelt(geo, p.linjer.length);
          foerste = 1;
        }
      });
      if (indhold && m) {
        var hoejde = indhold[0].getHeight();
        // En linjes nederste kant, målt fra sidens bund som i PDF'en.
        var bund = function (nr) { return hoejde - (m.y + nr * m.trin + (nr ? m.efter || 0 : 0)) - sh * m.skala; };
        var tegn = function (x, nr, side) {
          return function (stykke) { indhold[side || 0].drawPage(stykke, { x: x, y: bund(nr), xScale: m.skala, yScale: m.skala }); };
        };
        if (m.kant) {
          // Det hvide felt dækker forsidens motiv, så linjerne kan læses. Øverst står ordet Indhold.
          var r = 6, k = m.kant;
          indhold[0].drawSvgPath('M' + r + ',0 H' + (k.b - r) + ' Q' + k.b + ',0 ' + k.b + ',' + r + ' V' + (k.h - r) +
            ' Q' + k.b + ',' + k.h + ' ' + (k.b - r) + ',' + k.h + ' H' + r + ' Q0,' + k.h + ' 0,' + (k.h - r) + ' V' + r + ' Q0,0 ' + r + ',0 Z',
            { x: k.x, y: hoejde - k.y, color: PDFLib.rgb(1, 1, 1), borderColor: PDFLib.rgb(0.765, 0.839, 0.831), borderWidth: 0.75 });
          var e = geo.etiket;
          klipud(hoved, 'strimler', { left: e.x, bottom: h - e.y - e.h, right: e.x + e.b, top: h - e.y }, tegn(m.x, 0));
        }
        p.linjer.forEach(function (linje, i) {
          var side = Math.floor(i / prSide);
          var nr = i - side * prSide + foerste;
          var kap = linje.kap || hoved;
          var strimmel = kapitler[kap].strimler.indexOf(linje.titel);
          if (strimmel >= 0) {
            var y = geo.strimmel.y + strimmel * sh;
            klipud(kap, 'strimler', { left: geo.strimmel.x, bottom: h - y - sh, right: geo.strimmel.x + geo.strimmel.b, top: h - y }, tegn(m.x, nr, side));
          }
          klipud(hoved, 'indholdstal', talfelt(geo.indholdstal, linje.side, h),
            tegn(m.x + m.skala * (geo.indhold.bredde - geo.indholdstal.b), nr, side));
        });
      }
      return Promise.all(Object.keys(klip).map(function (nr) {
        return ud.embedPages(klip[nr].map(function (k) { return k.side; }), klip[nr].map(function (k) { return k.felt; }))
          .then(function (stykker) {
            stykker.forEach(function (stykke, i) { klip[nr][i].tegn(stykke); });
          });
      }));
    }).then(function () {
      return ud.save();
    });
  }

  var Kompendium = { NIVEAUER: NIVEAUER, numre: numre, kapitelvalg: kapitelvalg, standardvalg: standardvalg,
    oevelsesdel: oevelsesdel,
    bilagene: bilagene, plan: plan, navn: navn, saml: saml };
  if (typeof module !== 'undefined' && module.exports) module.exports = Kompendium;
  else rod.Kompendium = Kompendium;
})(typeof window !== 'undefined' ? window : this);
