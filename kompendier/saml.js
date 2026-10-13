/* Sætter et kompendium sammen af de dele, lav_kompendium.py har lavet (data/kapitel-N.js).
 *
 * Bruges af index.html og af kompendier/proev.js. Delene ligger som sider i én PDF. Her bliver de valgte
 * sider kopieret over i en ny PDF, sidetallene bliver sat på, og siden Indhold bliver fyldt ud. Tal og
 * linjer til indholdet klippes ud af PDF'ens hjælpesider, så de får samme skrift som resten.
 * PDF-arbejdet laves af pdf-lib (pdf-lib.min.js).
 */
(function (rod) {
  'use strict';

  var NIVEAUER = ['lav', 'mellem', 'mange'];
  var EGEN = 'Egen øvelsesvejledning';

  function del(data, id) {
    for (var i = 0; i < data.dele.length; i++) {
      if (data.dele[i].id === id) return data.dele[i];
    }
    return null;
  }

  // Valgene, når siden åbnes første gang: alle afsnit med noter og en mellem mængde opgaver.
  function standardvalg(data) {
    var valg = { forside: true, indhold: true, afsnit: {}, oevelser: {}, bilag: {} };
    data.afsnit.forEach(function (a) { valg.afsnit[a.nr] = { med: true, opgaver: 'mellem' }; });
    data.oevelser.forEach(function (id) { valg.oevelser[id] = false; });
    data.bilag.forEach(function (id) { valg.bilag[id] = true; });
    return valg;
  }

  // Planen for kompendiet: delene i rækkefølge med første side og antal sider.
  // egne er lærerens egne vejledninger: [{ navn, sider }].
  function plan(data, valg, egne) {
    var poster = [];
    var side = 1;
    function tilfoej(post) {
      post.side = side;
      side += post.sider;
      poster.push(post);
    }
    if (valg.forside) tilfoej({ slags: 'forside', titel: 'Forside', sider: 1 });
    if (valg.indhold) tilfoej({ slags: 'indhold', titel: 'Indhold', sider: 1 });
    data.afsnit.forEach(function (a) {
      var v = valg.afsnit[a.nr];
      if (!v || !v.med) return;
      var noter = del(data, a.noter);
      tilfoej({ slags: 'del', del: noter, titel: noter.titel, sider: noter.sider });
      var opgaver = a.opgaver[v.opgaver] && del(data, a.opgaver[v.opgaver]);
      if (opgaver) tilfoej({ slags: 'del', del: opgaver, titel: opgaver.titel, sider: opgaver.sider });
    });
    data.oevelser.forEach(function (id) {
      if (valg.oevelser[id]) tilfoej({ slags: 'del', del: del(data, id), titel: del(data, id).titel, sider: del(data, id).sider });
    });
    (egne || []).forEach(function (e, i) {
      tilfoej({ slags: 'egen', nr: i, titel: EGEN, navn: e.navn, sider: e.sider });
    });
    // Bilagene står sidst, og det periodiske system er den sidste side.
    data.bilag.forEach(function (id) {
      if (valg.bilag[id]) tilfoej({ slags: 'del', del: del(data, id), titel: del(data, id).titel, sider: del(data, id).sider });
    });
    return { poster: poster, sider: side - 1 };
  }

  // Det felt på en hjælpeside, hvor tallet n står. g er målene fra skabelonen, og h er sidens højde.
  function talfelt(g, n, h) {
    var x = g.x + ((n - 1) % g.kolonner) * g.dx;
    var y = g.y + Math.floor((n - 1) / g.kolonner) * g.dy;
    return { left: x, bottom: h - y - g.h, right: x + g.b, top: h - y };
  }

  // Sætter kompendiet sammen og giver PDF'en som bytes.
  // egne: [{ navn, sider, bytes }], hvor bytes er lærerens egen PDF.
  function saml(PDFLib, data, valg, egne) {
    egne = egne || [];
    var p = plan(data, valg, egne);
    var geo = data.geometri;
    var kilde, ud;

    // PDF'en med delene læses kun første gang.
    var hent = data._kilde ? Promise.resolve(data._kilde) : PDFLib.PDFDocument.load(data.pdf);
    return hent.then(function (dok) {
      data._kilde = kilde = dok;
      return PDFLib.PDFDocument.create();
    }).then(function (nyt) {
      ud = nyt;
      ud.setTitle('Kompendium til kapitel ' + data.kapitel + ': ' + data.titel);
      ud.setCreator('Kemibogen');
      // Alle sider fra delene hentes på én gang, så skrifter og figurer kun kommer med én gang.
      var numre = [];
      p.poster.forEach(function (post) {
        if (post.slags === 'forside') numre.push(data.forside);
        else if (post.slags === 'indhold') numre.push(data.hjaelpesider.indhold);
        else if (post.slags === 'del') {
          for (var i = 0; i < post.del.sider; i++) numre.push(post.del.start + i);
        }
      });
      return ud.copyPages(kilde, numre);
    }).then(function (sider) {
      // Siderne lægges ind i rækkefølge. Lærerens egne filer hentes ind, hvor de skal stå.
      var naeste = 0;
      var kaede = Promise.resolve();
      p.poster.forEach(function (post) {
        kaede = kaede.then(function () {
          if (post.slags !== 'egen') {
            for (var i = 0; i < post.sider; i++) ud.addPage(sider[naeste++]);
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
      // Det, der skal klippes ud af hjælpesiderne: et sidetal til hver side (ikke forsiden og ikke
      // lærerens egne sider) og en linje og et tal til hver post i indholdet.
      var h = kilde.getPage(data.hjaelpesider.sidetal).getHeight();
      var klip = [];
      function klipud(navn, felt, tegn) {
        klip.push({ side: kilde.getPage(data.hjaelpesider[navn]), felt: felt, tegn: tegn });
      }
      p.poster.forEach(function (post) {
        if (post.slags === 'forside' || post.slags === 'egen') return;
        for (var i = 0; i < post.sider; i++) {
          (function (n) {
            klipud('sidetal', talfelt(geo.sidetal, n, h), function (stykke) {
              var side = ud.getPage(n - 1);
              side.drawPage(stykke, { x: (side.getWidth() - geo.sidetal.b) / 2, y: geo.fod });
            });
          })(post.side + i);
        }
      });
      var indhold = null;
      p.poster.forEach(function (post) { if (post.slags === 'indhold') indhold = ud.getPage(post.side - 1); });
      if (indhold) {
        var linje = 0;
        p.poster.forEach(function (post) {
          if (post.slags !== 'del' && post.slags !== 'egen') return;
          var nr = data.strimler.indexOf(post.titel);
          var top = geo.indhold.y + linje * geo.indhold.trin;
          var bund = indhold.getHeight() - top - geo.strimmel.h;
          linje += 1;
          if (nr >= 0) {
            var y = geo.strimmel.y + nr * geo.strimmel.h;
            klipud('strimler', { left: geo.strimmel.x, bottom: h - y - geo.strimmel.h, right: geo.strimmel.x + geo.strimmel.b, top: h - y },
              function (stykke) { indhold.drawPage(stykke, { x: geo.indhold.x, y: bund }); });
          }
          klipud('indholdstal', talfelt(geo.indholdstal, post.side, h), function (stykke) {
            indhold.drawPage(stykke, { x: geo.indhold.x + geo.indhold.bredde - geo.indholdstal.b, y: bund });
          });
        });
      }
      if (!klip.length) return [];
      return ud.embedPages(klip.map(function (k) { return k.side; }), klip.map(function (k) { return k.felt; }))
        .then(function (stykker) {
          stykker.forEach(function (stykke, i) { klip[i].tegn(stykke); });
        });
    }).then(function () {
      return ud.save();
    });
  }

  var Kompendium = { NIVEAUER: NIVEAUER, standardvalg: standardvalg, plan: plan, saml: saml };
  if (typeof module !== 'undefined' && module.exports) module.exports = Kompendium;
  else rod.Kompendium = Kompendium;
})(typeof window !== 'undefined' ? window : this);
