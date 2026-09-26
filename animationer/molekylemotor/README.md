# Molekylemotoren

Fælles kode til at tegne og navngive molekyler. Den bruges af tre sider:

* `../superanimationer/tegnebraet/`: tegnebrættet til rapporter
* `../superanimationer/sc6.2_zigzagformler/`: quizzerne om zigzagformler, navne
  og isomerer og opløselighedsspillet
* `../superanimationer/sc_spil_organiske_grupper/`: spillet, hvor molekylerne
  sorteres efter stofklasse (tegningen, navnet og stofklassen; ikke tavlen)

Koden lå i sc6.2 indtil 25. september 2026. Da fik tegnebrættet sin egen side, og
motoren blev flyttet hertil, så den ikke skal kopieres fra mappe til mappe. Den
ligger ved siden af `v2/` og ikke i den, fordi `v2/` er frosset.

## Sådan bruges den

Mappen har ingen egen side. En animation henter filerne med to niveauer op, i
denne rækkefølge, efter sin egen `js/kerne.js` (motoren bruger `NK.saenket`,
`NK.klamp`, `NK.komma`, `NK.hent` og `NK.gem` derfra):

```html
<script src="js/kerne.js"></script>
<script src="../../molekylemotor/js/klistermaerker.js"></script>
<script src="../../molekylemotor/js/molekyle.js"></script>
<script src="../../molekylemotor/js/navngivning.js"></script>
<script src="../../molekylemotor/js/smiles.js"></script>        (kun tegnebrættet)
<script src="../../molekylemotor/js/trivialnavne.js"></script>  (kun tegnebrættet)
<script src="../../molekylemotor/js/layout.js"></script>
<script src="../../molekylemotor/js/struktur.js"></script>
<script src="../../molekylemotor/js/navnlaeser.js"></script>    (kun tegnebrættet)
<script src="../../molekylemotor/js/tavle.js"></script>
<script src="../../molekylemotor/js/tegnebraet.js"></script>
```

Ingen `fetch` og ingen moduler, så det virker også fra harddisken.

## Filerne

```
js/molekyle.js       molekylet som graf: atomer, bindinger, valens, H der ikke er
                     tegnet, ladning (a.q), molekylformel (Hill, med ladning:
                     CH₃COO⁻), molarmasse, fragmenter, ringe
js/navngivning.js    IUPAC-navne, stofklassen og det, navnet bygger på: hovedkæden,
                     sidegrupperne, dobbeltbindinger, cis/trans
js/navnlaeser.js     fra navn til molekyle (og reaktionsskemaer); bygger molekylet
                     og lader navngivningen bekræfte navnet
js/trivialnavne.js   trivialnavne: dem, der kan skrives, og dem, der vises i parentes
js/smiles.js         et molekyle ud fra en lille SMILES-streng (trivialnavnene og
                     selvtestene)
js/layout.js         zigzag som i bogen (prøver alle måder at vende sidegrupperne
                     på og tager den med mest luft), ringe, strukturformlen på
                     90°-gitter, H-atomernes retninger
js/struktur.js       tegningen: stregerne og bogstaverne i pixels, til canvas, SVG og
                     PNG. Skærm og gemt billede er altid ens
js/tegnebraet.js     tavlen: træk bygger kæden (120° i hvert knæk), klik, højreklik,
                     langt tryk, flyt, ringe, grundstoffer, pile og plus, fortryd;
                     på tegnebrættet også zoom, udsnit (regler.udsnit), Markér,
                     grupper med ét klik, ladning, Pæn tegning, Spejlvend, Kopiér
                     og Indsæt
js/tavle.js          scenen: væggen, whiteboardet, bakken, papiret (prikkerne kan
                     følge tegnebrættets udsnit)
js/klistermaerker.js Kemichaels skuffe: de ti klistermærker, hvad der låser dem op
                     (quizzerne i sc6.2), og hvad der er låst op (nk-skuffe)
```

## Navngivningens regler

Gymnasiebøgernes regler (IUPAC 1979/1993), dansk stavning:

* Den vigtigste gruppe giver endelsen, i denne rækkefølge: carboxylsyre (-syre),
  ester (-oat), amid (-amid), aldehyd (-al), keton (-on), alkohol (-ol) og amin
  (-amin). De andre står foran: hydroxy, oxo, amino, methoxy, carboxy, formyl,
  acetyl, (acetyloxy), (methoxycarbonyl), carbamoyl, halogen og alkyl.
* Hovedkæden har flest af den vigtigste gruppe, så flest dobbelt- og
  tripelbindinger, så flest C, så flest dobbeltbindinger. Ved lige lange kæder
  vinder den med flest sidegrupper (3-ethyl-2-methylhexan, ikke
  3-(1-methylethyl)hexan).
* Laveste numre til den vigtigste gruppe, så til dobbelt- og tripelbindinger, så
  til sidegrupperne. Ved lige numre får den sidegruppe, der står først i
  alfabetet, det laveste (3-ethyl-4-methylhexan).
* Sammensatte sidegrupper i parentes, og parentes i parentes med kantet parentes:
  5-(1-methylethyl)nonan, 2-[4-(2-methylpropyl)phenyl]propansyre.
* Ingen tal, hvor der kun er én mulighed: propen, ethanol, propanon, butanon,
  methylbenzen, chlorethansyre, cyclohexanol.
* Én ring kan være stamme eller sidegruppe. Sidder den vigtigste gruppe på ringen
  (eller -COOH direkte på den), er ringen stammen: cyclohexanol, benzoesyre,
  2-hydroxybenzoesyre. Ellers er ringen en sidegruppe: phenylmethanol,
  1-phenylethanon. Uden funktionelle grupper er ringen stammen: methylbenzen.
  Benzen har de navne, bogen bruger: phenol, benzoesyre, benzaldehyd, benzamid,
  benzoat.
* Mere end to -COOH på en kæde: propan-1,2,3-tricarboxylsyre (citronsyre er
  2-hydroxypropan-1,2,3-tricarboxylsyre).
* cis/trans kun i den klassiske form: hvert C i dobbeltbindingen har ét H og én
  anden gruppe. Den afgøres af tegningens koordinater, så eleven kan tegne begge.
* **Carboxylat-ioner** (brugerens ønske 25. sept. 2026): er alle syregrupperne
  uden H (O⁻), og er der ingen andre ladninger, får ionen esterens endelser uden
  alkylgruppe: ethanoat (CH₃COO⁻), butandioat, benzoat, cyclohexancarboxylat,
  2-hydroxypropan-1,2,3-tricarboxylat. Ikke "ethanoat-ion". En -COO⁻, der ikke
  er i hovedkæden, hedder carboxylato. Stofklassen er carboxylat-ion.

Skrivemåderne følger brugerens eget materiale (sept. 2026):

* **Estre** i ét ord: ethylethanoat, methylbenzoat, 3-methylbutylethanoat,
  methyl-2-hydroxybenzoat. En sammensat alkylgruppe uden tal står i parentes, så
  navnet ikke kan læses på to måder: (phenylmethyl)ethanoat.
* **Aminer** med simple grupper: methylamin, dimethylamin, ethylmethylamin,
  phenylamin. Ellers systematisk: propan-2-amin, hexan-1,6-diamin.
* **Ethere** med to simple alkylgrupper: dimethylether, diethylether,
  ethylmethylether. Ellers systematisk: methoxybenzen, 2-methoxy-2-methylpropan.
* **Ketoner og alkoholer** uden tal, hvor der kun er én mulighed: propanon,
  butanon, ethanol; ellers med tal: pentan-2-on, propan-2-ol.

`res.alternativer` har de andre rigtige skrivemåder (ethanamin, butan-2-on,
methoxymethan, benzencarboxylsyre), så navnelæseren kan godkende dem.

Stofklassen står i `res.stofklasse`: alkan, alken, alkyn, aromatisk, cycloalkan,
halogenforbindelse, alkohol, phenol, aldehyd, keton, carboxylsyre, ester, amid,
amin, ether, aminosyre, eller flere: "carboxylsyre og ester".

Små ioner kendes på formlen som de uorganiske molekyler: hydroxid (OH⁻),
oxonium (H₃O⁺), ammonium (NH₄⁺), fluorid, chlorid, bromid og iodid.
`res.ladning` er den samlede ladning.

Intet navn (navnet er `null`, og `res.grund` siger hvorfor): andre ioner, fx
ethanolat, methylammonium og hydrogenbutandioat (`ion`), S (`hetero`), O eller
N i en ring (`heteroring`), flere ringe (`ringe`), grupper uden for gymnasiet som
nitril, anhydrid, syrechlorid, kulsyre og peroxid (`gruppe`), dobbeltbinding fra
kæden ud til et C i en sidegruppe og to N med hver sin gruppe (`kompleks`).

## Navn til tegning

`NK.NavnLaeser` læser det samme, som navngivningen kan give, og bygger molekylet.
Navngivningen giver bagefter det rigtige navn, så et forkert men tegnbart navn
(4-methylpentan, propan-3-ol) tegnes, og noten siger, hvad det hedder. Den læser
også:

* den gamle danske skrivemåde: 2-buten, 2-propanol, 1,2-ethandiol, 2-butanon,
  ethansyreethylester (noten: "Den nyere skrivemåde er …")
* engelske navne: 2-methylbutane, propan-2-one, ethanoic acid, ethyl ethanoate,
  ethanamine, (Z)- og (E)- (noten: "På dansk: …")
* de andre rigtige skrivemåder: ethanamin, butan-2-on, methoxymethan (noten:
  "Kaldes også …")
* gamle sidegruppenavne: isopropyl, isobutyl, sec-butyl, tert-butyl, vinyl,
  allyl, benzyl, acetoxy
* trivialnavne fra `trivialnavne.js` (eddikesyre, acetone, glycerol, aspirin,
  oliesyre, anilin, paracetamol …), uden note: linjen "Tegnet: ethansyre" siger
  det systematiske navn
* små uorganiske molekyler med navn eller formel (vand, brom, HBr, ammoniak,
  carbondioxid)
* carboxylat-ionerne og de små ioner: ethanoat, ethanoat-ion og ethanoation
  ("ion" skæres af), acetat, ethanoate, hydroxid, OH- og OH⁻, H3O+, NH4+,
  chlorid. "ethanoat" uden alkylgruppe foran er ionen, ikke en ufærdig ester

Et navn uden cis/trans tegnes som trans, og noten siger det. Et reaktionsskema
deles ved +, ->, → og <=>, ⇌: `ethanol + ethansyre -> ethylethanoat + vand`. Et +
lige efter H3O og NH4 er ladningen: `H3O+ + OH- -> vand + vand`.

## Trivialnavnene

To lister i `js/trivialnavne.js` (brugerens ønske 25. sept. 2026):

* **VIS**: de allermest almindelige. De står i parentes efter det systematiske
  navn på tegnebrættet, i panelet, under molekylet og i billedet til rapporten:
  ethansyre (eddikesyre). 42 navne, bl.a. formaldehyd, acetaldehyd, acetone,
  myresyre, eddikesyre, smørsyre, mælkesyre, citronsyre, oxalsyre, vinsyre,
  stearinsyre, palmitinsyre, oliesyre, salicylsyre, acetylsalicylsyre, glycerol,
  ethylacetat, acetamid, paracetamol, vanillin, anilin, toluen, chloroform og de
  aminosyrer, der kan tegnes (glycin, alanin, valin …), og ionerne acetat, formiat,
  oxalat, lactat, citrat, palmitat og stearat.
* **POSTER**: de fleste trivialnavne, der bruges i gymnasiet (139 stoffer, flere
  stavemåder og engelske navne pr. stof). De kan skrives i feltet Skriv et navn.
  Hvert peger på en SMILES-streng; `"cis"` tegner den første dobbeltbinding som
  cis (oliesyre), `"alleCis"` dem alle (linolsyre).

Et nyt trivialnavn skrives som en ny linje i POSTER. Skal det også stå i parentes,
kommer det i VIS med det systematiske navn som nøgle. Selvtesten tjekker begge
lister.

## Tegningen

`NK.Layout.zigzag(mol, res, stereo)` lægger molekylet ud som i bogen. Kæden er
`res.tegnekaede`: stamkæden forlænget ud gennem O og N, så ethanol tegnes C-C-O,
ethylethanoat C-C(=O)-O-C-C og diethylether C-C-O-C-C. En ring på en kæde
(phenyl) tegnes som en regulær ring. Stødte atomer sammen, prøves også krydset,
hvor den ene sidegruppe peger op og den anden ned mellem kædens bindinger
(citronsyre: COOH op, OH ned); det bruges kun, når det ellers støder sammen, så
tegninger, der allerede var gode, ikke ændres.

`stereo` kan også være en liste af par [a, b]: de dobbeltbindinger i kæden, der
skal være cis. Pæn tegning på tegnebrættet bruger det til at beholde tegningens
cis og trans. Ladningen tegnes hævet ved atomet (O⁻, NH₄⁺) i det skrå hjørne,
der er længst fra bindingerne. `NK.Struktur.svg` kan lægge tegnebrættets
tegning i filen (`ekstra.metadata`).

## Selvtest

Motoren testes i `../superanimationer/tegnebraet/_selvtest.html` (navngivning,
funktionelle grupper, trivialnavne, navn til tegning, tusind tilfældige molekyler,
tavlen og billedet) og i `../superanimationer/sc6.2_zigzagformler/_selvtest.html`
(carbonhydriderne i quizzerne), og navnene og stofklasserne på spillets 75
molekyler i `../superanimationer/sc_spil_organiske_grupper/_selvtest.html`. Kør
alle tre efter en ændring her.

## Forenklinger

* Navngivning efter 1979/1993-reglerne, ikke 2013. Det er gymnasiebøgernes regler.
* Kun den klassiske cis/trans. E/Z hører til b6.1. Flere dobbeltbindinger med
  cis/trans får navnet uden cis og trans (linolsyre: octadeca-9,12-diensyre).
* Kun én ring. Benzophenon, naphthalen og steroider får intet navn.
* Ioner: kun carboxylat-ionerne og de små ioner får navn. Der er ingen metaller på
  paletten, så et salt som natriumethanoat tegnes som ionen, ethanoat. Aminosyrer
  som zwitterion (NH₃⁺ og COO⁻) får intet navn.
* To N med hver sin gruppe (N,N'-dimethylethan-1,2-diamin) får intet navn.
* Atommasserne er IUPAC 2021 med to decimaler, H 1,01, som i sc4.1.
