// Fælles visning og eksport for bordgrupper.html (lodtrækning) og bordgrupper-faerdige.html
// (grupper, læreren selv har lavet). Filen kender hverken DOM'en eller lodtrækningen: den får
// par, trioer og grupper ind og giver borde, rækkeopstilling og Word-/PDF-sider ud.
(function(global){
  'use strict';

  // Faste opstillinger i lokalet: 5 sekskantede borde med 6 pladser og 3 rækker med 10 pladser.
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

  // Skiftende farver pr. makkerpar i rækkeopstillingen, så man nemt kan se hvem der er makker med hvem.
  var PAIR_PALETTE = ['#38bdf8', '#f59e0b', '#7c3aed', '#ec4899', '#14b8a6', '#ef4444'];

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

  // Sæderne i en række i rækkefølge. Hvert makkerpar får sin egen farve; trioer har ingen.
  function rowSeats(table){
    var seats = [], pairColorIdx = 0;
    table.units.forEach(function(unit){
      var color = unit.type === 'three' ? null : PAIR_PALETTE[pairColorIdx++ % PAIR_PALETTE.length];
      unit.data.forEach(function(nm, i){ seats.push({ name:nm, color:color, ref:unit.ref, i:i }); });
    });
    return seats;
  }

  // Gitteret har mindst 10 kolonner, og flere hvis en række har fået ekstra elever,
  // så samme sædeplads altid står lige over hinanden i alle rækker.
  function rowColumns(tables){
    return Math.max(ROW_CAPACITY, Math.max.apply(null, tables.map(function(t){ return t.size; })));
  }

  // ---------- Eksport: én side pr. periode ----------
  function unitToWordDiv(unit, plain){
    var names = escapeHtml(unit.data.join(', '));
    if(unit.type === 'three'){
      var tag3 = plain ? '' : '<span class="tag">Trio</span>';
      return '<div class="grp three">' + tag3 + names + '</div>';
    }
    var tag = plain ? '' : '<span class="tag">Par</span>';
    return '<div class="grp">' + tag + names + '</div>';
  }

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

  function sectionHtml(title, tables, labelFn, maxCols, showCount, plain){
    var cols = Math.max(1, Math.min(tables.length, maxCols));
    var widthPct = (100/cols).toFixed(2);
    var html = '<div class="section"><div class="sectitle">' + title + '</div>';
    html += '<table class="layout"><tr>';
    tables.forEach(function(table, ti){
      var headerText = labelFn(ti) + (showCount ? ' (' + table.size + ')' : '');
      html += '<td style="width:' + widthPct + '%;"><h2>' + headerText + '</h2>';
      table.units.forEach(function(unit){ html += unitToWordDiv(unit, plain); });
      html += '</td>';
      if((ti+1) % cols === 0 && ti+1 < tables.length){ html += '</tr><tr>'; }
    });
    html = padRaggedRow(html, tables.length, cols, widthPct);
    html += '</tr></table></div>';
    return html;
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
        html += s.color
          ? '<td style="width:' + width + '%; border-top:3px solid ' + s.color + ';">' + escapeHtml(s.name) + '</td>'
          : '<td class="st" style="width:' + width + '%;">' + escapeHtml(s.name) + '</td>';
      }
      html += '</tr>';
    });
    html += '</table>';
    return html;
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

  // Fælles indhold for én side - genbruges af både Word- og PDF-eksport og af visningen
  // på siden med færdige grupper. "opts": overskrift og eventuelle rollenavne.
  function roundBodyHtml(g, l, opts){
    opts = opts || {};
    var html = '<h1>' + escapeHtml(opts.title || 'Bordgrupper') + '</h1>';
    html += '<p class="dato">' + g.n + ' elever, ' + describeSizes(bundleSizes(g)) + '</p>';

    var activeRoleNames = opts.roleNames || [];
    var cards = g.bundles.map(function(b){ return groupCardTable(b.label, bundleColumns(b, g), bundleRoleMap(b, activeRoleNames)); });
    html += '<div class="section"><div class="sectitle">Grupper</div>' + cardsGridHtml(cards, 4) + '</div>';

    html += sectionHtml('Sekskantede borde', l.hex, function(ti){ return 'Bord ' + (ti+1); }, 5, false, true);
    html += '<div class="section"><div class="sectitle">Rækkeopstilling</div>' + rowGridWordTable(l.row) + '</div>';
    return html;
  }

  function sharedExportStyles(){
    return '@page{size:A4 landscape; margin:0.8cm;}' +
      'body{font-family:Calibri, Arial, sans-serif; font-size:8pt; line-height:1.15;}' +
      'h1{font-size:12pt; margin:0 0 2pt;}' +
      '.dato{color:#555; margin:0 0 6pt; font-size:7.5pt;}' +
      '.section{margin-bottom:5pt;}' +
      '.sectitle{font-size:9pt; font-weight:bold; background:#dfe7f0; padding:2pt 5pt; margin-bottom:3pt;}' +
      'table.layout{width:100%; border-collapse:collapse; margin-bottom:2pt;}' +
      'table.layout td{vertical-align:top; padding:2pt 4pt; border:1px solid #ccc;}' +
      'h2{font-size:7.5pt; margin:0 0 2pt; background:#eef1f4; padding:1pt 3pt;}' +
      '.grp{margin-bottom:1.5pt; padding:1pt 3pt; border:1px solid #999; border-radius:2px; font-size:6.8pt; line-height:1.1;}' +
      '.grp.three{background:#eafaf0;}' +
      '.grp .tag{font-weight:bold; color:#666; margin-right:3pt;}' +
      'table.gcard{border-collapse:collapse; width:100%;}' +
      'table.gcard th{font-size:6.8pt; background:#dfe7f0; padding:1.5pt 3pt; border:1px solid #aaa;}' +
      'table.gcard td{font-size:6.8pt; padding:1.5pt 4pt; border:1px solid #ccc; text-align:center;}' +
      'table.gcard td.pa{color:#1d63c9; font-weight:bold; background:#eaf3fd;}' +
      'table.gcard td.pb{color:#c9720f; font-weight:bold; background:#fdf1e3;}' +
      'table.gcard td.pc{color:#7c3aed; font-weight:bold; background:#f1eafe;}' +
      'table.gcard td.pt{color:#159957; font-weight:bold; background:#e8f9ef;}' +
      '.role-tag{display:block; font-size:5.5pt; font-weight:bold; color:#fff; background:#b45309; border-radius:3px; padding:0.5pt 3pt; margin-bottom:1pt; line-height:1.3;}' +
      'table.rowgrid{width:100%; border-collapse:collapse;}' +
      'table.rowgrid th{width:8%; font-size:6.8pt; background:#dfe7f0; padding:2pt 3pt; border:1px solid #aaa; text-align:left;}' +
      'table.rowgrid td{font-size:6.5pt; padding:2pt 3pt; border:1px solid #ccc; text-align:center;}' +
      'table.rowgrid td.st{border-top:3px solid #22c55e; background:#eafaf0;}' +
      '.pagebreak{page-break-before:always;}';
  }



  // ---------- Filer: én side pr. periode ----------
  function documentHtml(pages, title, wordNamespaces){
    var html = wordNamespaces
      ? '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">'
      : '<!DOCTYPE html><html>';
    html += '<head><meta charset="utf-8"><title>' + escapeHtml(title) + '</title>';
    html += '<style>' + sharedExportStyles() + '</style></head><body>';
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
    return html + '</body></html>';
  }

  function downloadWord(pages, filenameBase){
    var blob = new Blob(['﻿', documentHtml(pages, 'Gruppeoversigt', true)], { type: 'application/msword' });
    var link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filenameBase + '.doc';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
    PAIR_PALETTE: PAIR_PALETTE, MAX_NAME_LENGTH: MAX_NAME_LENGTH,
    escapeHtml: escapeHtml, joinDa: joinDa, describeSizes: describeSizes,
    capName: capName, shuffle: shuffle,
    bundleMembers: bundleMembers, unitLabels: unitLabels, bundleSizes: bundleSizes,
    pairUnit: pairUnit, trioUnit: trioUnit,
    compositions: compositions, packBalanced: packBalanced, capacityNote: capacityNote,
    rowLabel: rowLabel, rowSeats: rowSeats, rowColumns: rowColumns,
    unitToWordDiv: unitToWordDiv, padRaggedRow: padRaggedRow, sectionHtml: sectionHtml,
    bundleColumns: bundleColumns, bundleRoleMap: bundleRoleMap, groupCardTable: groupCardTable,
    rowGridWordTable: rowGridWordTable, cardsGridHtml: cardsGridHtml,
    roundBodyHtml: roundBodyHtml, sharedExportStyles: sharedExportStyles,
    documentHtml: documentHtml, downloadWord: downloadWord, printPages: printPages
  };
})(window);
