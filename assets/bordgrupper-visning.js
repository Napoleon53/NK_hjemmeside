// Fælles visning og eksport for bordgrupper.html (lodtrækning) og bordgrupper-faerdige.html
// (grupper, læreren selv har lavet). Filen kender ikke lodtrækningen: den får par, trioer og
// grupper ind og giver lokaleplaner, rækkeopstilling og Word-/PDF-sider ud. Hver side i filen
// er en stående A4 med alle tre lokaler, så den passer, uanset hvor klassen har time.
// Siderne henter filen med ?v=dato, så browseren ikke bruger en gammel, gemt udgave: ret
// datoen i begge sider, når filen ændres.
(function(global){
  'use strict';

  // Faste opstillinger: 7 firemandsborde, 5 sekskantede borde med 6 pladser og 3 rækker med 10 pladser.
  var MAX_HEX_TABLES = 5;
  var HEX_CAPACITY = 6;
  var MAX_ROWS = 3;
  var ROW_CAPACITY = 10;

  function escapeHtml(s){
    return String(s).replace(/[&<>"]/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]; });
  }

  function joinDa(parts){
    if(parts.length <= 1) return parts.join('');
    return parts.slice(0, -1).join(', ') + ' og ' + parts[parts.length - 1];
  }

  // "7 grupper på 4" eller "7 grupper: 6 på 4 og 1 på 3"
  function describeSizes(sizes){
    var counts = {};
    sizes.forEach(function(s){ counts[s] = (counts[s] || 0) + 1; });
    var keys = Object.keys(counts).map(Number).sort(function(a,b){ return b - a; });
    var groupWord = sizes.length === 1 ? ' gruppe' : ' grupper';
    if(keys.length === 1) return sizes.length + groupWord + ' på ' + keys[0];
    return sizes.length + groupWord + ': ' + joinDa(keys.map(function(k){ return counts[k] + ' på ' + k; }));
  }

  // Makkerpar får en lys farve i alle tre lokaler, så man kan se, hvem der sidder sammen:
  // 1., 2. og 3. makkerpar ved et bord eller i en række er blå, orange og lilla, og en trio er
  // grøn. Ved firemandsbordene er det samme farver som kolonnerne i gruppekortene. Ved et
  // sekskantet bord eller i en række kan to trioer sidde side om side; den anden er lyserød.
  var PAIR_TINTS = ['#dbeafe', '#ffedd5', '#ede9fe'];
  var TRIO_TINTS = ['#dcfce7', '#fce7f3'];

  // Farven til hver enhed (par eller trio) i rækkefølge, ud fra henvisningen ("p3" eller "t1").
  function unitTints(units){
    var pairNo = 0, trioNo = 0;
    return units.map(function(u){
      return u.ref.charAt(0) === 't'
        ? TRIO_TINTS[trioNo++ % TRIO_TINTS.length]
        : PAIR_TINTS[pairNo++ % PAIR_TINTS.length];
    });
  }

  // Sikkerhedsloft: meget lange (fx fulde) navne kan ødelægge de faste bordopstillinger,
  // så de afkortes automatisk her - uanset om "Forkort navne"-knappen er brugt.
  var MAX_NAME_LENGTH = 24;

  function capName(s){
    return s.length > MAX_NAME_LENGTH ? (s.slice(0, MAX_NAME_LENGTH - 1) + '…') : s;
  }

  function shuffle(arr){
    var a = arr.slice();
    for(var i=a.length-1;i>0;i--){
      var j = Math.floor(Math.random()*(i+1));
      var tmp=a[i]; a[i]=a[j]; a[j]=tmp;
    }
    return a;
  }


  function bundleMembers(b){
    return b.pairs.reduce(function(acc,p){ return acc.concat(p); }, []).concat(b.trio || []);
  }

  // Hvilken gruppe hvert par og hver trio hører til, så det kan vises ved borde og rækker.
  function unitLabels(pairsGroups, triplesGroups, bundles){
    var labels = { pairs:{}, trios:{} };
    bundles.forEach(function(b){
      b.pairs.forEach(function(p){ labels.pairs[pairsGroups.indexOf(p)] = b.label; });
      if(b.trio) labels.trios[triplesGroups.indexOf(b.trio)] = b.label;
    });
    return labels;
  }

  function bundleSizes(groups){
    return groups.bundles.map(function(b){ return b.members.length; });
  }


  // "ref" peger på navnelisten i perioden ("p3" = par nr. 3, "t1" = trio nr. 1). Borde, rækker og
  // grupper deler de samme lister, så et byt af to navne ses i alle visninger.
  function pairUnit(p, groups, idx){
    return { type:'pair', size:p.length, data:p, ref:'p' + idx, groupLabel: groups.labels.pairs[idx] || null };
  }

  function trioUnit(t, groups, idx){
    return { type:'three', size:t.length, data:t, ref:'t' + idx, groupLabel: groups.labels.trios[idx] || null };
  }

  // ---------- Sekskantede borde og rækker: fordel par og trioer på faste borde ----------
  // Alle fordelinger af trioerne på bordene afprøves (der er få), og parrene lægges på de
  // mindst besatte borde. Den bedste fordeling har færrest elever ud over pladserne, derefter
  // det mindst fyldte største bord og derefter de jævneste borde. Er der flere elever end
  // pladser, får nogle borde ekstra elever, men ingen falder fra.
  function compositions(total, parts){
    var out = [];
    (function rec(prefix, remaining, left){
      if(left === 1){ out.push(prefix.concat([remaining])); return; }
      for(var k=0; k<=remaining; k++) rec(prefix.concat([k]), remaining - k, left - 1);
    })([], total, parts);
    return out;
  }

  function packBalanced(groups, numTables, capacity){
    var trios = shuffle(groups.triplesGroups.map(function(t, idx){ return trioUnit(t, groups, idx); }));
    var pairs = shuffle(groups.pairsGroups.map(function(p, idx){ return pairUnit(p, groups, idx); }));

    var best = [], bestScore = Infinity;
    compositions(trios.length, numTables).forEach(function(trioCounts){
      var loads = trioCounts.map(function(k){ return 3*k; });
      var pairCounts = trioCounts.map(function(){ return 0; });
      pairs.forEach(function(unit){
        var min = Math.min.apply(null, loads);
        var lowest = [];
        loads.forEach(function(load, t){ if(load === min) lowest.push(t); });
        var t = lowest[Math.floor(Math.random()*lowest.length)];
        loads[t] += unit.size;
        pairCounts[t] += 1;
      });
      var maxLoad = Math.max.apply(null, loads), minLoad = Math.min.apply(null, loads);
      var overflow = loads.reduce(function(sum, load){ return sum + Math.max(0, load - capacity); }, 0);
      var score = overflow*10000 + maxLoad*100 + (maxLoad - minLoad);
      if(score < bestScore){ bestScore = score; best = []; }
      if(score === bestScore) best.push({ trios:trioCounts, pairs:pairCounts });
    });

    var pick = best[Math.floor(Math.random()*best.length)];
    var tables = [];
    var ti = 0, pi = 0;
    for(var t=0; t<numTables; t++){
      var units = trios.slice(ti, ti + pick.trios[t]).concat(pairs.slice(pi, pi + pick.pairs[t]));
      ti += pick.trios[t];
      pi += pick.pairs[t];
      var size = units.reduce(function(sum, u){ return sum + u.size; }, 0);
      tables.push({ units:shuffle(units), size:size });
    }
    return tables;
  }

  // " Der er 32 elever og 30 pladser, så 2 borde har 7 elever."
  function capacityNote(n, tables, capacity, singular, plural){
    var seats = tables.length * capacity;
    if(n <= seats) return '';
    var bySize = {};
    tables.forEach(function(t){ if(t.size > capacity) bySize[t.size] = (bySize[t.size] || 0) + 1; });
    var parts = Object.keys(bySize).map(Number).sort(function(a,b){ return b - a; }).map(function(size){
      var k = bySize[size];
      return k + ' ' + (k === 1 ? singular : plural) + ' har ' + size + ' elever';
    });
    return 'Der er ' + n + ' elever og ' + seats + ' pladser, så ' + joinDa(parts) + '.';
  }

  function rowLabel(ti){
    var names = ['Bagrække', 'Midterrække', 'Forrække'];
    return names[ti] || ('Ekstra række ' + (ti-2));
  }

  // Sæderne i en række i rækkefølge, hver med sit makkerpars eller sin trios farve.
  function rowSeats(table){
    var seats = [], tints = unitTints(table.units);
    table.units.forEach(function(unit, k){
      unit.data.forEach(function(nm, i){ seats.push({ name:nm, tint:tints[k], ref:unit.ref, i:i }); });
    });
    return seats;
  }

  // Gitteret har mindst 10 kolonner, og flere hvis en række har fået ekstra elever,
  // så samme sædeplads altid står lige over hinanden i alle rækker.
  function rowColumns(tables){
    return Math.max(ROW_CAPACITY, Math.max.apply(null, tables.map(function(t){ return t.size; })));
  }

  // ---------- Lokalerne ----------
  // Tavlen er forneden i alle tre planer. Firemandsbordene følger tegningen på væggen i lokalet:
  // 7 borde af to borde skubbet sammen med pladserne a-d, og bord 7 har en plads mere (e).
  // De sekskantede borde står i to forskudte rækker, tre forrest og to bagved, set fra tavlen.
  var ROOMS = {
    fire: { navn:'Firemandsborde', kort:'7 borde' },
    hex: { navn:'Sekskantede borde', kort:'5 borde med 6 pladser' },
    rows: { navn:'Rækker', kort:'3 rækker med 10 pladser' }
  };
  var ROOM_KEYS = ['fire', 'hex', 'rows'];
  var DEFAULT_ROOM = 'fire';

  function roomKey(room){ return ROOMS[room] ? room : DEFAULT_ROOM; }

  var FIRE_TABLES = [
    { x:-350, y:430, rot:-16 },          // bord 1
    { x:-350, y:125, rot:-16 },          // bord 2
    { x:0, y:580, rot:0 },               // bord 3
    { x:0, y:290, rot:0 },               // bord 4
    { x:0, y:0, rot:0 },                 // bord 5
    { x:350, y:455, rot:20 },            // bord 6
    { x:350, y:165, rot:20, seats:5 }    // bord 7
  ];
  var HEX_TABLES = [
    { x:0, y:280, extra:1 },             // forreste række, nærmest tavlen
    { x:200, y:0, extra:-1 },
    { x:400, y:280, extra:1 },
    { x:600, y:0, extra:-1 },
    { x:800, y:280, extra:1 }
  ];
  // Tavlen: hvor langt den går til siderne, og hvor højt den mindst ligger.
  var BOARD = {
    fire: { x0:-440, x1:440, y:770 },
    hex: { x0:-150, x1:950, y:470 }
  };

  var SEAT_LETTERS = 'abcdefgh'.split('');

  // Et firemandsbord er to borde på 128 x 176 med 6 imellem. a og b sidder ved det venstre,
  // c og d ved det højre. Ekstra elever (e-h) sidder for enden af bordene.
  var FD = { w:128, h:176, gap:6, endH:48, endGap:8 };
  var FIRE_SEATS = (function(){
    var xl = -(FD.gap/2 + FD.w), xr = FD.gap/2, hh = FD.h/2, top = -hh - FD.endGap - FD.endH, bottom = hh + FD.endGap;
    return {
      a: { x:xl, y:0, w:FD.w, h:hh, letter:[xl - 15, hh/2] },
      b: { x:xl, y:-hh, w:FD.w, h:hh, letter:[xl - 15, -hh/2] },
      c: { x:xr, y:-hh, w:FD.w, h:hh, letter:[xr + FD.w + 15, -hh/2] },
      d: { x:xr, y:0, w:FD.w, h:hh, letter:[xr + FD.w + 15, hh/2] },
      e: { x:xr, y:top, w:FD.w, h:FD.endH, end:true, letter:[xr + FD.w + 15, top + FD.endH/2] },
      f: { x:xl, y:top, w:FD.w, h:FD.endH, end:true, letter:[xl - 15, top + FD.endH/2] },
      g: { x:xr, y:bottom, w:FD.w, h:FD.endH, end:true, letter:[xr + FD.w + 15, bottom + FD.endH/2] },
      h: { x:xl, y:bottom, w:FD.w, h:FD.endH, end:true, letter:[xl - 15, bottom + FD.endH/2] }
    };
  })();

  // Sekskanten har spidsen opad. Pladserne a-f går med uret fra kanten øverst til venstre, og
  // navnene står i tre rækker med to i hver, ud for elevens kant.
  var HEX_POINTS = [[0,-150],[130,-75],[130,75],[0,150],[-130,75],[-130,-75]];
  var HEX_SEATS = {
    a: { sector:[[-130,-75],[0,-150]], text:[-58,-68], maxW:100, letter:[-75,-129] },
    b: { sector:[[0,-150],[130,-75]], text:[58,-68], maxW:100, letter:[75,-129] },
    c: { sector:[[130,-75],[130,75]], text:[64,0], maxW:112, letter:[149,0] },
    d: { sector:[[130,75],[0,150]], text:[58,68], maxW:100, letter:[75,129] },
    e: { sector:[[0,150],[-130,75]], text:[-58,68], maxW:100, letter:[-75,129] },
    f: { sector:[[-130,75],[-130,-75]], text:[-64,0], maxW:112, letter:[-149,0] }
  };

  var FONT = "'Segoe UI', Calibri, Arial, sans-serif";
  var INK = '#1f2933', LINE = '#334155', MUTED = '#64748b', BADGE = '#1d4ed8';
  var EMPTY_FILL = '#eef1f5', ROLE_FILL = '#b45309';

  function r1(v){ return Math.round(v*10)/10; }

  // Tekstbredde målt med samme skrift som tegningen, så navnene kan gøres mindre eller deles i to linjer.
  var measureCtx = null;
  function textWidth(text, size, weight){
    if(measureCtx === null){
      try { measureCtx = document.createElement('canvas').getContext('2d') || false; } catch(e){ measureCtx = false; }
    }
    if(!measureCtx) return text.length * size * 0.56;
    measureCtx.font = (weight || 400) + ' ' + size + 'px ' + FONT;
    return measureCtx.measureText(text).width;
  }

  // Navnet på én linje, eventuelt lidt mindre, ellers på to linjer (fornavn og resten), ellers
  // med mindre skrift. "Muhammad A." skal hellere være lidt mindre end deles i to.
  function fitName(name, maxW, fs){
    var whole = textWidth(name, fs, 600);
    if(whole <= maxW) return { lines:[name], fs:fs };
    if(whole * 0.8 <= maxW) return { lines:[name], fs:r1(fs * maxW / whole) };
    var words = name.split(/\s+/);
    if(words.length > 1){
      var fs2 = r1(fs * 0.92), best = null;
      for(var k=1; k<words.length; k++){
        var lines = [words.slice(0, k).join(' '), words.slice(k).join(' ')];
        var widest = Math.max(textWidth(lines[0], fs2, 600), textWidth(lines[1], fs2, 600));
        if(!best || widest < best.widest) best = { lines:lines, widest:widest };
      }
      if(best.widest <= maxW) return { lines:best.lines, fs:fs2 };
      return { lines:best.lines, fs:Math.max(10, r1(fs2 * maxW / best.widest)) };
    }
    return { lines:[name], fs:Math.max(10, r1(fs * maxW / textWidth(name, fs, 600))) };
  }

  // Navn, eventuel rolle over navnet og eventuel gruppe under navnet, samlet om (cx, cy).
  // "k" gør rolle og gruppe større på de små tegninger i filen, ligesom navnet.
  function seatLabelSvg(seat, cx, cy, maxW, fs, showGroup, k){
    k = k || 1;
    var fit = fitName(seat.name, maxW, fs);
    var lh = fit.fs * 1.12;
    var roleFs = r1(10.5 * k), groupFs = r1(11.5 * k);
    var roleH = seat.role ? r1(17 * k) : 0;
    var groupH = (showGroup && seat.group) ? r1(14 * k) : 0;
    var y = cy - (roleH + fit.lines.length * lh + groupH) / 2;
    var out = '';
    if(seat.role){
      var rw = Math.min(maxW, textWidth(seat.role, roleFs, 700) + 10 * k);
      out += '<rect x="' + r1(cx - rw/2) + '" y="' + r1(y) + '" width="' + r1(rw) + '" height="' + r1(14 * k) + '" rx="3" fill="' + ROLE_FILL + '"/>' +
        '<text x="' + cx + '" y="' + r1(y + 10.6 * k) + '" font-size="' + roleFs + '" font-weight="700" fill="#fff" text-anchor="middle">' + escapeHtml(seat.role) + '</text>';
      y += roleH;
    }
    fit.lines.forEach(function(line){
      var squeeze = textWidth(line, fit.fs, 600) > maxW ? ' textLength="' + maxW + '" lengthAdjust="spacingAndGlyphs"' : '';
      out += '<text x="' + cx + '" y="' + r1(y + fit.fs * 0.86) + '" font-size="' + fit.fs + '" font-weight="600" fill="' + INK + '" text-anchor="middle"' + squeeze + '>' + escapeHtml(line) + '</text>';
      y += lh;
    });
    if(groupH){
      out += '<text x="' + cx + '" y="' + r1(y + 11 * k) + '" font-size="' + groupFs + '" fill="' + MUTED + '" text-anchor="middle">' + escapeHtml(seat.group) + '</text>';
    }
    return out;
  }

  // En plads på tegningen: feltet og navnet hver for sig, så alle navne kan tegnes oven på alle
  // felter (et langt navn må gerne gå lidt ind over nabopladsen). På skærmen får begge en
  // henvisning til navnet, så det kan byttes. opts.k er tekstens forstørrelse.
  function seatSvg(shape, seat, cx, cy, maxW, fs, showGroup, opts){
    var k = opts.k || 1;
    var attrs = (seat && opts.swappable) ? ' class="pseat" data-u="' + seat.ref + '" data-i="' + seat.i + '"' : '';
    return {
      bg: '<g' + attrs + '>' + shape + '</g>',
      label: seat ? '<g' + attrs + '>' + seatLabelSvg(seat, cx, cy, maxW, r1(fs * k), showGroup, k) + '</g>' : ''
    };
  }

  function letterSvg(letter, x, y, rot){
    var turn = rot ? ' rotate(' + (-rot) + ')' : '';
    return '<text transform="translate(' + r1(x) + ' ' + r1(y) + ')' + turn + '" y="5" font-size="14" font-weight="700" fill="' + MUTED + '" text-anchor="middle" pointer-events="none">' + letter + '</text>';
  }

  function badgeSvg(no, x, y, rot){
    var turn = rot ? ' rotate(' + (-rot) + ')' : '';
    return '<g transform="translate(' + x + ' ' + y + ')' + turn + '" pointer-events="none"><circle r="17" fill="' + BADGE + '"/>' +
      '<text y="6" font-size="17" font-weight="700" fill="#fff" text-anchor="middle">' + no + '</text></g>';
  }

  function newBox(){ return { x0:Infinity, y0:Infinity, x1:-Infinity, y1:-Infinity }; }
  function addPt(box, x, y){
    if(x < box.x0) box.x0 = x;
    if(x > box.x1) box.x1 = x;
    if(y < box.y0) box.y0 = y;
    if(y > box.y1) box.y1 = y;
  }

  function seatMap(seats){
    var map = {};
    seats.forEach(function(s){ map[s.letter] = s; });
    return map;
  }

  function fireTableSvg(t, opts, box){
    var d = t.def, rad = d.rot * Math.PI / 180, cs = Math.cos(rad), sn = Math.sin(rad);
    function mark(x, y){ addPt(box, d.x + x*cs - y*sn, d.y + x*sn + y*cs); }
    function markRect(r){ mark(r.x, r.y); mark(r.x + r.w, r.y); mark(r.x, r.y + r.h); mark(r.x + r.w, r.y + r.h); }
    var bySeat = seatMap(t.seats);
    var out = '<g transform="translate(' + d.x + ' ' + d.y + ')' + (d.rot ? ' rotate(' + d.rot + ')' : '') + '">';
    var labels = '';

    ['a', 'b', 'c', 'd'].forEach(function(L){
      var r = FIRE_SEATS[L], s = bySeat[L];
      var shape = '<rect class="seat-bg" x="' + r.x + '" y="' + r.y + '" width="' + r.w + '" height="' + r.h + '" fill="' + (s ? s.tint : EMPTY_FILL) + '"/>';
      var part = seatSvg(shape, s, r.x + r.w/2, r.y + r.h/2, r.w - 12, 17, false, opts);
      out += part.bg;
      labels += part.label;
    });
    [FIRE_SEATS.b, FIRE_SEATS.c].forEach(function(r){
      out += '<rect x="' + r.x + '" y="' + r.y + '" width="' + r.w + '" height="' + FD.h + '" rx="3" fill="none" stroke="' + LINE + '" stroke-width="2" pointer-events="none"/>' +
        '<line x1="' + r.x + '" y1="0" x2="' + (r.x + r.w) + '" y2="0" stroke="#b6c0cc" stroke-width="1.5" stroke-dasharray="5 4" pointer-events="none"/>';
      markRect({ x:r.x, y:r.y, w:r.w, h:FD.h });
    });

    var letters = ['a', 'b', 'c', 'd'];
    ['e', 'f', 'g', 'h'].forEach(function(L){
      var r = FIRE_SEATS[L], s = bySeat[L];
      if(!s) return;
      var shape = '<rect class="seat-bg" x="' + r.x + '" y="' + r.y + '" width="' + r.w + '" height="' + r.h + '" rx="3" fill="' + s.tint + '" stroke="' + LINE + '" stroke-width="2"/>';
      var part = seatSvg(shape, s, r.x + r.w/2, r.y + r.h/2, r.w - 12, 16, false, opts);
      out += part.bg;
      labels += part.label;
      markRect(r);
      letters.push(L);
    });
    out += labels;
    letters.forEach(function(L){
      var p = FIRE_SEATS[L].letter;
      out += letterSvg(L, p[0], p[1], d.rot);
      mark(p[0] - 7, p[1] - 8); mark(p[0] + 7, p[1] + 8);
    });

    // Gruppens eget navn står over bordet, hvis det ikke bare er "Gruppe" og bordets nummer.
    if(t.label && t.label !== 'Gruppe ' + t.no){
      var top = (bySeat.e || bySeat.f) ? FIRE_SEATS.e.y : -FD.h/2;
      out += '<text x="0" y="' + (top - 10) + '" font-size="14" font-weight="700" fill="' + MUTED + '" text-anchor="middle" pointer-events="none">' + escapeHtml(t.label) + '</text>';
      mark(-60, top - 26); mark(60, top - 26);
    }
    out += badgeSvg(t.no, 0, 0, d.rot);
    return out + '</g>';
  }

  function hexTableSvg(t, opts, box){
    var d = t.def;
    function mark(x, y){ addPt(box, d.x + x, d.y + y); }
    var bySeat = seatMap(t.seats);
    var out = '<g transform="translate(' + d.x + ' ' + d.y + ')">';
    var labels = '';
    ['a', 'b', 'c', 'd', 'e', 'f'].forEach(function(L){
      var p = HEX_SEATS[L], s = bySeat[L];
      var shape = '<polygon class="seat-bg" points="0,0 ' + p.sector[0].join(',') + ' ' + p.sector[1].join(',') + '" fill="' + (s ? s.tint : EMPTY_FILL) + '"/>';
      var part = seatSvg(shape, s, p.text[0], p.text[1], p.maxW, 16, true, opts);
      out += part.bg;
      labels += part.label;
    });
    out += '<polygon points="' + HEX_POINTS.map(function(q){ return q.join(','); }).join(' ') + '" fill="none" stroke="' + LINE + '" stroke-width="2" stroke-linejoin="round" pointer-events="none"/>';
    HEX_POINTS.forEach(function(q){ mark(q[0], q[1]); });

    var letters = ['a', 'b', 'c', 'd', 'e', 'f'].map(function(L){ return { L:L, p:HEX_SEATS[L].letter }; });
    // Elev 7 og 8 ved et bord får en ekstra stol på den side, der vender væk fra de andre borde.
    ['g', 'h'].forEach(function(L, k){
      var s = bySeat[L];
      if(!s) return;
      var cx = k === 0 ? -60 : 60, cy = d.extra * 200;
      var r = { x:cx - 56, y:cy - 20, w:112, h:40 };
      var shape = '<rect class="seat-bg" x="' + r.x + '" y="' + r.y + '" width="' + r.w + '" height="' + r.h + '" rx="3" fill="' + s.tint + '" stroke="' + LINE + '" stroke-width="2"/>';
      var part = seatSvg(shape, s, cx, cy, r.w - 10, 15, false, opts);
      out += part.bg;
      labels += part.label;
      mark(r.x, r.y); mark(r.x + r.w, r.y + r.h);
      letters.push({ L:L, p:[k === 0 ? r.x - 13 : r.x + r.w + 13, cy] });
    });
    out += labels;
    letters.forEach(function(item){
      out += letterSvg(item.L, item.p[0], item.p[1], 0);
      mark(item.p[0] - 7, item.p[1] - 8); mark(item.p[0] + 7, item.p[1] + 8);
    });
    out += badgeSvg(t.no, 0, -150, 0);
    mark(0, -168);
    return out + '</g>';
  }

  // Hvem der sidder hvor. Firemandsborde: gruppe nr. k ved bord k, makkerparrene først og en
  // eventuel trio sidst (a-b, c-d og så e). Sekskantede borde: parrene og trioerne fra
  // fordelingen på bordene, i rækkefølge rundt om bordet. "unseated" er elever uden plads på tegningen.
  function roomSeating(room, g, l, roleNames){
    room = roomKey(room);
    var roles = {};
    if(roleNames && roleNames.length){
      g.bundles.forEach(function(b){
        var map = bundleRoleMap(b, roleNames);
        Object.keys(map).forEach(function(nm){ roles[nm] = map[nm]; });
      });
    }
    var unseated = [];
    function fill(units){
      var seats = [], tints = unitTints(units);
      units.forEach(function(u, k){
        u.data.forEach(function(nm, i){
          if(seats.length >= SEAT_LETTERS.length){ unseated.push(nm); return; }
          seats.push({ letter:SEAT_LETTERS[seats.length], name:nm, ref:u.ref, i:i, tint:tints[k], role:roles[nm] || null, group:u.groupLabel || null });
        });
      });
      return seats;
    }
    if(room === 'hex'){
      return {
        room:room,
        tables: HEX_TABLES.map(function(def, k){
          var table = l.hex[k];
          return { no:k + 1, def:def, seats: fill(table ? table.units : []) };
        }),
        unseated:unseated
      };
    }
    var tables = FIRE_TABLES.map(function(def, k){
      var b = g.bundles[k];
      if(!b) return { no:k + 1, def:def, label:null, seats:[] };
      var units = b.pairs.map(function(p){ return { data:p, ref:'p' + g.pairsGroups.indexOf(p) }; });
      if(b.trio) units.push({ data:b.trio, ref:'t' + g.triplesGroups.indexOf(b.trio) });
      return { no:k + 1, def:def, label:b.label, seats: fill(units) };
    });
    var withoutTable = g.bundles.slice(FIRE_TABLES.length);
    withoutTable.forEach(function(b){ unseated = unseated.concat(b.members); });
    return { room:room, tables:tables, unseated:unseated, groupsWithoutTable: withoutTable.map(function(b){ return b.label; }) };
  }

  // Lokaleplanen som SVG. opts.maxW og opts.maxH er den største bredde og højde i px.
  function planSvg(room, seating, opts){
    room = roomKey(room);
    opts = opts || {};
    var box = newBox();
    var body = seating.tables.map(function(t){
      return room === 'hex' ? hexTableSvg(t, opts, box) : fireTableSvg(t, opts, box);
    }).join('');
    var bar = BOARD[room];
    // På skærmen står tavlen samme sted, uanset ekstra stole. I filen (opts.tight) rykker den
    // op under de forreste borde, så der ikke er tom plads på siden.
    var barY = Math.round(box.y1 + 36);
    if(!opts.tight) barY = Math.max(bar.y, barY);
    addPt(box, bar.x0, barY);
    addPt(box, bar.x1, barY + 42);
    body += '<rect x="' + bar.x0 + '" y="' + barY + '" width="' + (bar.x1 - bar.x0) + '" height="42" rx="4" fill="#f1f5f9" stroke="' + LINE + '" stroke-width="2"/>' +
      '<text x="' + ((bar.x0 + bar.x1) / 2) + '" y="' + (barY + 27) + '" font-size="17" font-weight="600" fill="' + LINE + '" text-anchor="middle" letter-spacing="1">lærer / tavle / projektor</text>';
    var m = 12;
    var vx = Math.floor(box.x0 - m), vy = Math.floor(box.y0 - m);
    var vw = Math.ceil(box.x1 + m) - vx, vh = Math.ceil(box.y1 + m) - vy;
    var scale = Math.min((opts.maxW || vw) / vw, (opts.maxH || vh) / vh);
    var w = Math.round(vw * scale), h = Math.round(vh * scale);
    return '<svg xmlns="http://www.w3.org/2000/svg" class="plan" width="' + w + '" height="' + h + '" viewBox="' + [vx, vy, vw, vh].join(' ') +
      '" font-family="' + FONT + '" role="img" aria-label="Pladser i lokalet">' + body + '</svg>';
  }

  // Kort besked under planen, når nogen skal have en ekstra stol eller ikke er med på tegningen.
  function seatingNote(room, g, l){
    room = roomKey(room);
    if(room === 'rows') return capacityNote(g.n, l.row, ROW_CAPACITY, 'række', 'rækker');
    if(room === 'hex') return capacityNote(g.n, l.hex, HEX_CAPACITY, 'bord', 'borde');
    var s = roomSeating('fire', g, l);
    var one = [], parts = [];
    s.tables.forEach(function(t){
      var extra = t.seats.length - (t.def.seats || 4);
      if(extra === 1) one.push(String(t.no));
      else if(extra > 1) parts.push('Bord ' + t.no + ' skal have ' + extra + ' ekstra stole.');
    });
    if(one.length) parts.unshift('Bord ' + joinDa(one) + ' skal have en ekstra stol' + (one.length > 1 ? ' hver.' : '.'));
    if(s.groupsWithoutTable.length){
      parts.push('Lokalet har ' + FIRE_TABLES.length + ' borde, så ' + joinDa(s.groupsWithoutTable) + ' står kun i gruppekortene.');
    } else if(s.unseated.length){
      parts.push(joinDa(s.unseated) + ' står kun i gruppekortene.');
    }
    return parts.join(' ');
  }

  // ---------- Eksport: én side pr. periode ----------
  // Fylder sidste (ujævne) række op med tomme, usynlige celler op til "cols" celler i alt.
  // Word's HTML->docx-konverter er upålidelig med tabelrækker der har færre celler end de
  // foregående rækker - uden denne padding kan en ujævn sidste række (fx 1 kort ud af 6 kolonner)
  // risikere slet ikke at blive vist i den eksporterede Word-fil, selvom browseren/PDF'en viser den fint.
  function padRaggedRow(html, itemCount, cols, widthPct){
    var remainder = itemCount % cols;
    if(remainder === 0) return html;
    var filler = '';
    for(var f=0; f<cols-remainder; f++){ filler += '<td style="width:' + widthPct + '%; border:none;"></td>'; }
    return html + filler;
  }

  // Lille tabel pr. gruppe: øverste række = gruppenummer, derunder makkerparrene side om side (1 navn pr. celle pr. par/trio-kolonne)
  function bundleColumns(b, g){
    var palette = ['pa', 'pb', 'pc'];
    var cols = b.pairs.map(function(p, i){
      return { names:p, colorClass: palette[i % palette.length], ref:'p' + g.pairsGroups.indexOf(p) };
    });
    if(b.trio) cols.push({ names:b.trio, colorClass:'pt', ref:'t' + g.triplesGroups.indexOf(b.trio) });
    return cols;
  }

  // Rolle N tildeles automatisk den N'te elev i gruppens medlemsliste (samme rækkefølge som
  // b.members) - kun de først "activeRoleNames.length" elever i gruppen får en rolle.
  function bundleRoleMap(b, activeRoleNames){
    var map = {};
    if(!activeRoleNames || !activeRoleNames.length) return map;
    b.members.slice(0, activeRoleNames.length).forEach(function(nm, i){ map[nm] = activeRoleNames[i]; });
    return map;
  }

  // "swappable" giver cellerne på skærmen en henvisning til navnet, så det kan byttes. Filen får den ikke.
  function groupCardTable(label, columns, roleMap, swappable){
    var rows = Math.max.apply(null, columns.map(function(c){ return c.names.length; }));
    var html = '<table class="gcard"><tr><th colspan="' + columns.length + '">' + escapeHtml(label) + '</th></tr>';
    for(var r=0; r<rows; r++){
      html += '<tr>';
      columns.forEach(function(c){
        var nm = c.names[r];
        var cellHtml = '';
        if(nm !== undefined){
          var role = roleMap && roleMap[nm];
          cellHtml = (role ? '<span class="role-tag">' + escapeHtml(role) + '</span><br>' : '') + escapeHtml(nm);
        }
        var attrs = (swappable && nm !== undefined) ? ' draggable="true" data-u="' + c.ref + '" data-i="' + r + '"' : '';
        html += '<td class="' + c.colorClass + '"' + attrs + '>' + cellHtml + '</td>';
      });
      html += '</tr>';
    }
    html += '</table>';
    return html;
  }

  function rowGridWordTable(tables){
    var cols = rowColumns(tables);
    var width = (92 / cols).toFixed(2);
    var html = '<table class="rowgrid">';
    tables.forEach(function(table, ti){
      html += '<tr><th>' + rowLabel(ti) + '</th>';
      var seats = rowSeats(table);
      for(var c=0; c<cols; c++){
        var s = seats[c];
        if(!s){ html += '<td style="width:' + width + '%;"></td>'; continue; }
        html += '<td style="width:' + width + '%; background:' + s.tint + ';">' + escapeHtml(s.name) + '</td>';
      }
      html += '</tr>';
    });
    html += '</table>';
    return html;
  }

  function boardTableHtml(){
    return '<table class="boardbar"><tr><td>lærer / tavle / projektor</td></tr></table>';
  }

  function cardsGridHtml(cards, maxCols){
    var cols = Math.max(1, Math.min(cards.length, maxCols));
    var widthPct = (100/cols).toFixed(2);
    var html = '<table class="layout"><tr>';
    cards.forEach(function(card, i){
      html += '<td style="width:' + widthPct + '%;">' + card + '</td>';
      if((i+1) % cols === 0 && i+1 < cards.length){ html += '</tr><tr>'; }
    });
    html = padRaggedRow(html, cards.length, cols, widthPct);
    html += '</tr></table>';
    return html;
  }

  // Siden er A4 på højkant med 0,8 cm margen: 733 x 1062 px. Overskriften tager ca. 40 px.
  var PAGE_W = 733;

  // Alle tre lokaler står under hinanden på samme side, så papiret passer, hvor klassen end
  // har time. Tegningerne er så høje, de kan blive, og lige brede (ca. 540 px), og teksten på
  // dem er 1,25 gange større end på skærmen, så navnene kan læses i den lille størrelse.
  // Højderne er faste, så siden fylder næsten det samme, uanset klassen: højst ca. 970 af
  // 1062 px (33 elever med ekstra stole). Resten er luft til Word, der sætter lidt større op.
  var MINI_FIRE = { maxW:PAGE_W, maxH:460, k:1.25, tight:true };
  var MINI_HEX = { maxW:PAGE_W, maxH:330, k:1.25, tight:true };

  // Fælles indhold for én side - genbruges af både Word- og PDF-eksport og af visningen
  // på siden med færdige grupper. "opts": overskrift og eventuelle rollenavne.
  // Firemandsbordene viser grupperne (gruppe 1 ved bord 1 osv.), så gruppekort står der kun
  // for grupper, der ikke har plads ved et firemandsbord (flere end 7 grupper eller 9+ elever).
  function roundBodyHtml(g, l, opts){
    opts = opts || {};
    var roleNames = opts.roleNames || [];
    var html = '<h1>' + escapeHtml(opts.title || 'Bordgrupper') + '</h1>';
    html += '<p class="dato">' + g.n + ' elever, ' + describeSizes(bundleSizes(g)) + '.</p>';
    var fire = planSvg('fire', roomSeating('fire', g, l, roleNames), MINI_FIRE);
    var hex = planSvg('hex', roomSeating('hex', g, l, roleNames), MINI_HEX);

    html += '<div class="sectitle">' + ROOMS.fire.navn + '</div><div class="plancenter">' + fire + '</div>';
    html += '<div class="sectitle">' + ROOMS.hex.navn + '</div><div class="plancenter">' + hex + '</div>';
    html += '<div class="sectitle">' + ROOMS.rows.navn + '</div>' + rowGridWordTable(l.row) + boardTableHtml();

    var outside = g.bundles.filter(function(b, k){ return k >= FIRE_TABLES.length || b.members.length > SEAT_LETTERS.length; });
    if(outside.length){
      var cards = outside.map(function(b){ return groupCardTable(b.label, bundleColumns(b, g), bundleRoleMap(b, roleNames)); });
      html += '<div class="section"><div class="sectitle">Grupper uden plads ved et firemandsbord</div>' + cardsGridHtml(cards, 5) + '</div>';
    }
    return html;
  }

  function sharedExportStyles(word){
    var page = word
      ? '@page WordSection1{size:595.3pt 841.9pt; margin:0.8cm;} div.WordSection1{page:WordSection1;}'
      : '@page{size:A4 portrait; margin:0.8cm;} @media screen{body{max-width:' + PAGE_W + 'px; margin:16px auto; padding:0 12px;}}';
    return page +
      'body{font-family:Calibri, Arial, sans-serif; font-size:8pt; line-height:1.15; -webkit-print-color-adjust:exact; print-color-adjust:exact;}' +
      'h1{font-size:12pt; margin:0 0 2pt;}' +
      '.dato{color:#555; margin:0 0 6pt; font-size:7.5pt;}' +
      '.section{margin:6pt 0 0;}' +
      '.sectitle{font-size:8.5pt; font-weight:bold; background:#dfe7f0; padding:1.5pt 5pt; margin-bottom:2pt;}' +
      'table.layout{width:100%; border-collapse:collapse; margin-bottom:2pt;}' +
      'table.layout td{vertical-align:top; padding:2pt 4pt; border:1px solid #ccc;}' +
      '.plancenter{text-align:center; margin-bottom:4pt;}' +
      'svg.plan{display:inline-block;}' +
      'table.gcard{border-collapse:collapse; width:100%;}' +
      'table.gcard th{font-size:7.5pt; background:#dfe7f0; padding:1.5pt 3pt; border:1px solid #aaa;}' +
      'table.gcard td{font-size:7.5pt; padding:1.5pt 3pt; border:1px solid #ccc; text-align:center;}' +
      'table.gcard td.pa{color:#1d63c9; font-weight:bold; background:#eaf3fd;}' +
      'table.gcard td.pb{color:#c9720f; font-weight:bold; background:#fdf1e3;}' +
      'table.gcard td.pc{color:#7c3aed; font-weight:bold; background:#f1eafe;}' +
      'table.gcard td.pt{color:#159957; font-weight:bold; background:#e8f9ef;}' +
      '.role-tag{display:block; font-size:5.5pt; font-weight:bold; color:#fff; background:#b45309; border-radius:3px; padding:0.5pt 3pt; margin-bottom:1pt; line-height:1.3;}' +
      'table.rowgrid{width:100%; border-collapse:collapse;}' +
      'table.rowgrid th{width:8%; font-size:7pt; background:#dfe7f0; padding:2pt 3pt; border:1px solid #aaa; text-align:left;}' +
      'table.rowgrid td{font-size:7pt; font-weight:bold; padding:2.5pt 1.5pt; border:1px solid #ccc; text-align:center;}' +
      'table.boardbar{width:74%; margin:5pt auto 0; border-collapse:collapse;}' +
      'table.boardbar td{border:1.5px solid #334155; background:#f1f5f9; text-align:center; font-weight:bold; font-size:7.5pt; color:#334155; padding:2.5pt;}' +
      '.pagebreak{page-break-before:always;}';
  }



  // ---------- Filer: én side pr. periode ----------
  function documentHtml(pages, title, wordNamespaces){
    var html = wordNamespaces
      ? '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">'
      : '<!DOCTYPE html><html>';
    html += '<head><meta charset="utf-8"><title>' + escapeHtml(title) + '</title>';
    html += '<style>' + sharedExportStyles(wordNamespaces) + '</style></head><body>';
    if(wordNamespaces) html += '<div class="WordSection1">';
    pages.forEach(function(body, idx){
      if(wordNamespaces){
        // Word ignorerer ofte page-break-before på en almindelig <div> - dette br-tricket
        // er den robuste metode MSO's egen HTML-eksport selv bruger til at tvinge sideskift.
        html += idx>0 ? '<br clear=all style="mso-special-character:line-break;page-break-before:always">' : '';
        html += '<div>' + body + '</div>';
      } else {
        html += '<div' + (idx>0 ? ' class="pagebreak"' : '') + '>' + body + '</div>';
      }
    });
    if(wordNamespaces) html += '</div>';
    return html + '</body></html>';
  }

  // Tegner en lokaleplan som PNG (base64) i flere gange opløsningen, så den står skarpt på papir.
  function svgToPngBase64(svg, w, h, scale){
    var W = Math.round(w * scale), H = Math.round(h * scale);
    var big = svg.replace(/width="[\d.]+" height="[\d.]+"/, 'width="' + W + '" height="' + H + '"');
    return new Promise(function(resolve, reject){
      var img = new Image();
      img.onload = function(){
        try {
          var canvas = document.createElement('canvas');
          canvas.width = W;
          canvas.height = H;
          var ctx = canvas.getContext('2d');
          ctx.fillStyle = '#fff';
          ctx.fillRect(0, 0, W, H);
          ctx.drawImage(img, 0, 0, W, H);
          resolve(canvas.toDataURL('image/png').split(',')[1]);
        } catch(e){ reject(e); }
      };
      img.onerror = function(){ reject(new Error('Tegningen kunne ikke laves om til et billede.')); };
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(big);
    });
  }

  function base64Utf8(text){
    var bytes = new TextEncoder().encode(text), bin = '';
    for(var i=0; i<bytes.length; i+=0x8000){ bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000)); }
    return btoa(bin);
  }

  function mimeLines(b64){
    return b64.replace(/.{1,76}/g, '$&\r\n');
  }

  // Word kan ikke vise SVG fra en HTML-fil, så tegningerne bliver til billeder, og filen gemmes
  // som webarkiv (MHTML) med billederne indeni. Uden tegninger er filen almindelig HTML som før.
  // Giver et løfte om filens tekst.
  function wordDocument(pages, title){
    var dir = 'bordgrupper_filer/';
    var images = [];
    var bodies = pages.map(function(body){
      return body.replace(/<svg\b[\s\S]*?<\/svg>/g, function(svg){
        var m = /width="([\d.]+)" height="([\d.]+)"/.exec(svg);
        var im = { name:'plan' + (images.length + 1) + '.png', svg:svg, w:+m[1], h:+m[2] };
        images.push(im);
        return '<img src="' + dir + im.name + '" width="' + im.w + '" height="' + im.h + '" alt="Pladser i lokalet">';
      });
    });
    var html = documentHtml(bodies, title, true);
    if(!images.length) return Promise.resolve('\ufeff' + html);
    // Tegningerne er små på siden, så de laves i tredobbelt opløsning, ellers bliver navnene uskarpe.
    return Promise.all(images.map(function(im){ return svgToPngBase64(im.svg, im.w, im.h, 3); })).then(function(pngs){
      var boundary = '----=_NextPart_Bordgrupper_' + Date.now().toString(36);
      var out = 'MIME-Version: 1.0\r\nContent-Type: multipart/related; boundary="' + boundary + '"; type="text/html"\r\n\r\n' +
        '--' + boundary + '\r\nContent-Type: text/html; charset="utf-8"\r\nContent-Transfer-Encoding: base64\r\n' +
        'Content-Location: file:///C:/bordgrupper.htm\r\n\r\n' + mimeLines(base64Utf8(html)) + '\r\n';
      images.forEach(function(im, k){
        out += '--' + boundary + '\r\nContent-Type: image/png\r\nContent-Transfer-Encoding: base64\r\n' +
          'Content-Location: file:///C:/' + dir + im.name + '\r\n\r\n' + mimeLines(pngs[k]) + '\r\n';
      });
      return out + '--' + boundary + '--\r\n';
    });
  }

  // Giver et løfte, der er opfyldt, når filen er hentet.
  function downloadWord(pages, filenameBase){
    return wordDocument(pages, 'Gruppeoversigt').then(function(text){
      var blob = new Blob([text], { type: 'application/msword' });
      var link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filenameBase + '.doc';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(function(){ URL.revokeObjectURL(link.href); }, 10000);
    });
  }

  // Åbner siderne i et nyt vindue og kalder udskriftsdialogen (Gem som PDF).
  // Returnerer false, hvis pop-up blev blokeret.
  function printPages(pages, title){
    var win = window.open('', '_blank');
    if(!win) return false;
    win.document.open();
    win.document.write(documentHtml(pages, title, false));
    win.document.close();
    win.focus();
    // Vent til layoutet er sat, før udskriftsdialogen åbnes.
    setTimeout(function(){ win.print(); }, 300);
    return true;
  }

  global.Bordgrupper = {
    MAX_HEX_TABLES: MAX_HEX_TABLES, HEX_CAPACITY: HEX_CAPACITY,
    MAX_ROWS: MAX_ROWS, ROW_CAPACITY: ROW_CAPACITY,
    PAIR_TINTS: PAIR_TINTS, TRIO_TINTS: TRIO_TINTS, MAX_NAME_LENGTH: MAX_NAME_LENGTH,
    ROOMS: ROOMS, ROOM_KEYS: ROOM_KEYS, DEFAULT_ROOM: DEFAULT_ROOM, FIRE_TABLE_COUNT: FIRE_TABLES.length,
    escapeHtml: escapeHtml, joinDa: joinDa, describeSizes: describeSizes,
    capName: capName, shuffle: shuffle,
    bundleMembers: bundleMembers, unitLabels: unitLabels, bundleSizes: bundleSizes,
    pairUnit: pairUnit, trioUnit: trioUnit,
    compositions: compositions, packBalanced: packBalanced, capacityNote: capacityNote,
    rowLabel: rowLabel, rowSeats: rowSeats, rowColumns: rowColumns,
    roomSeating: roomSeating, planSvg: planSvg, seatingNote: seatingNote,
    padRaggedRow: padRaggedRow,
    bundleColumns: bundleColumns, bundleRoleMap: bundleRoleMap, groupCardTable: groupCardTable,
    rowGridWordTable: rowGridWordTable, boardTableHtml: boardTableHtml, cardsGridHtml: cardsGridHtml,
    roundBodyHtml: roundBodyHtml, sharedExportStyles: sharedExportStyles,
    documentHtml: documentHtml, wordDocument: wordDocument, downloadWord: downloadWord, printPages: printPages
  };
})(window);
