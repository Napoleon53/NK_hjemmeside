# Tegnebræt

Et værktøj til rapporter, ikke en superanimation om ét begreb. Åbn
**`index.html`**. Siden henter sine egne filer, motoren fra `../../molekylemotor/`
og Kemichael fra `../../v2/kemichael/`.

Tegnebrættet var fane 1 i `sc6.2_zigzagformler` (24.-25. sept. 2026). Den 25.
september fik det sin egen side efter brugerens ønske: det bruges i rapporter på
både C og B, og med de funktionelle grupper passer det ikke længere ind under
zigzagformler for alkaner. Quizzerne blev i sc6.2, og motoren blev fælles.

**Pointen:** tegn molekylet, som bogen tegner det, og få navn, stofklasse,
molekylformel og molarmasse med, klar til at kopiere ind i rapporten.

## Hvad man kan

* **Tegne:** C, H, O, N, Cl, Br og I (S og F er taget af paletten efter brugerens
  ønske; de bruges næsten ikke i gymnasiet), ringe (5, 6, benzen), dobbelt- og
  tripelbindinger, flere molekyler på én gang. Kæder tegnes ved at trække fra et
  atom eller ved at klikke på enden: hvert klik gør kæden ét C længere og
  fortsætter zigzaggen. Et grundstof valgt og et klik på et atom gør det til det
  grundstof. Højreklik sletter, Shift og træk flytter ét atom.
* **Grupper med ét klik** (brugerens ønske 25. sept. 2026): –OH, =O, –CHO, –COOH,
  –COO⁻ og –NH₂ under grundstofferne. Vælg gruppen, og klik på et atom: gruppen
  sættes i det største frie hul, og en syregruppe for enden af en kæde fortsætter
  zigzaggen (OH videre, =O til siden). **± Ladning**: et klik på et atom giver −,
  det næste +, det tredje ingen ladning; en ladning, der ikke passer til
  bindingerne, springes over. Et højreklik går tilbage til at tegne med C, som
  i Markér.
* **Markér** (i stedet for den gamle Flyt, brugerens ønske 25. sept. 2026, som i
  MarvinSketch og Ketcher): et klik på et molekyle markerer hele molekylet,
  Shift+klik markerer flere, og en ramme trukket i den tomme tavle markerer alt
  inde i den. Træk i det markerede flytter det; Delete sletter det; Ctrl+A
  markerer alt; Esc fjerner markeringen. Højreklik i Markér går tilbage til at
  tegne med C (brugerens ønske), ligesom et højreklik i tom tavle med ring, pil,
  plus eller klistermærke; Esc gør det samme.
* **Det markerede** (kortet kommer med Markér, eller når noget er markeret):
  Pæn tegning tegner de markerede molekyler (eller alt, hvis intet er markeret)
  forfra som i bogen, med midten samme sted, cis og trans som tegnet og
  syregruppen i samme side. Spejlvend spejler vandret om midten. Kopiér og
  Indsæt (Ctrl+C, Ctrl+V; Ctrl+X klipper) laver en kopi lidt forskudt, markeret,
  så den kan trækkes på plads. Kopien huskes kun på siden.
* **Zoom og udsnit** (samme dag): tavlen er større end skærmen. Træk i den tomme
  tavle (eller med den midterste museknap, eller piletasterne) flytter
  udsnittet; knapperne − og + i tavlens hjørne, musehjulet og tasterne + og −
  zoomer; Vis alt (tasten 0) viser hele tegningen. Prikkerne følger med.
* **Pile og plus:** reaktionspil, ligevægtspil og plus sættes på med et klik og
  flyttes ved at trække; den valgte pil får tekst over og under (H2SO4 bliver
  H₂SO₄).
* **Skriv et navn:** tegner et molekyle eller et helt skema ud fra navnene, fx
  `ethanol + ethansyre -> ethylethanoat + vand`. Systematiske navne på alle
  stofklasserne, gamle og engelske skrivemåder og de fleste trivialnavne
  (eddikesyre, acetone, aspirin). Et nyt navn kommer under det, der står, og er
  det hele ikke på skærmen, zoomer tavlen selv ud, så alt kan ses.
  Carboxylat-ionerne og små ioner kan også skrives: ethanoat, acetat,
  ethanoat-ion, OH-, H3O+, NH4+, chlorid, fx `ethansyre + OH- -> ethanoat + vand`.
* **Molekyler på tavlen:** for hvert molekyle navnet (med de mest almindelige
  trivialnavne i parentes: ethansyre (eddikesyre)), stofklassen, molekylformlen
  og molarmassen. Uden navn står grunden (fx "Ringe med O eller N i ringen kan
  tegnebrættet ikke give navn."). Et klik på overskriften folder kortet ind og ud
  (huskes under `nk-tegnebraet-foldet`). En carboxylat-ion (den
  korresponderende base til en carboxylsyre) hedder som i bogen: ethanoat
  (acetat), med formlen CH₃COO⁻ (brugerens ønske 25. sept. 2026). Andre ioner end
  dem og de små (OH⁻, H₃O⁺, NH₄⁺, halogenid) får intet navn.
* **Indstillinger:** zigzag eller alle atomer, numre på kæden og navnet under
  molekylerne (midt under det tegnede, også under H₂O og H-atomerne). Kopiér
  billede (PNG i 3 gange opløsning) til Word eller OneNote, eller Gem som SVG, på
  samme linje: sort streg på hvid baggrund, som i bogen. Gem PNG er fjernet
  (brugerens ønske). SVG-filen har også selve tegningen (`<metadata
  id="nk-tegnebraet">`), så **Åbn tegning** (eller en SVG, der trækkes ind på
  tavlen) giver den tilbage til videre redigering; Fortryd henter den gamle.
* **Navne** (knappen i toppen, T): endelserne for de otte stofklasser og
  reglerne for navngivning på én side.
* **Kemichaels skuffe:** klistermærkerne fra quizzerne i sc6.2 (nk-skuffe).
  Kortet er usynligt, til eleven har låst mindst ét op. Et klik på et
  klistermærke og så på tavlen sætter det på; det kommer med i billedet.
  `index.html#klister=kaffekop` åbner siden med klistermærket klar (knappen i
  vinduet med et nyt klistermærke i sc6.2 bruger det).

Tegningen huskes i browseren (`nk-tegnebraet`; en tegning fra sc6.2 under
`nk-sc6.2-tegnebraet` hentes, hvis der ikke er en ny). Kemichael tilbyder at
præsentere (`nk-tegnebraet-intro`), og kaffekoppen i hjørnet er påskeægget.

## Filer

```
index.html          markup: scenen, panelet, navnene på stofklasserne, rundvisningen
css/stil.css        udseendet (samme som sc6.2, plus nederst det, der er særligt her)
js/kerne.js         NK-navnerum, tekst, tal, laerred (samme som sc6.2)
js/data.js          Kemichaels præsentation og linjen under scenen
js/fane.js          rammen: lærredet, tavlen, musen, beskeder, kaffekoppen
js/sim_tegn.js      tegnebrættet: panelet, navn til tegning, billedet, skuffen
js/laerer.js        Kemichael (samme som i sc6.2)
js/praesentation.js tilbuddet om præsentationen (ens i alle mapper)
js/rundvisning.js   rundvisningen bag ?
js/sprites.js       lageret til Kemichaels sprites
js/app.js           opstart, tastatur, tegneløkken, #klister=
_selvtest.html      udviklerværktøj, se nedenfor
```

Tastatur (brugerens ønske 25. sept. 2026): C, H, O, N, I, L (Cl, også Shift+C) og B
(Br) vælger grundstoffet, M Markér. Rundvisningen er derfor på ?, ikke på H som i
de andre animationer. T navnene, K Kemichael, R ryd tavlen, Ctrl+Z og Ctrl+Y fortryd
og gentag, Ctrl+A markér alt, Ctrl+C, Ctrl+X og Ctrl+V kopierer, klipper og indsætter
det markerede, Delete sletter det markerede eller det, musen er over,
piletasterne flytter udsnittet, + og − zoomer, 0 viser alt. Esc lukker det, der er
åbent, så markeringen, og går ellers tilbage til at tegne med C.

## At rette i det

* **Navngivningen, tegningen og trivialnavnene** står i motoren; se
  `../../molekylemotor/README.md`.
* **Grundene til, at et molekyle ikke får navn,** står i `GRUND` øverst i
  `js/sim_tegn.js`.
* **Kemichaels replikker** står i `js/data.js`.

## Selvtest

`_selvtest.html` kræver en lokal server med `animationer/` som rod. Den
kontrollerer navngivningen (bogens navne på carbonhydrider, alle isomerer af C₄
til C₉, 83 navne og stofklasser med funktionelle grupper), molekylformel og
molarmasse, tavlens regler, navn til tegning (gamle og engelske skrivemåder,
trivialnavne, beskederne ved navne, der ikke kan tegnes), at alle trivialnavne
tegnes med luft mellem atomerne, tusind tilfældige molekyler med funktionelle
grupper (hvert navn skal give det samme molekyle tilbage), panelet og billedet,
skuffen, linket `#klister=`, en gammel tegning fra sc6.2, carboxylat-ionerne og de
små ioner, grupperne med ét klik og ladningen, Pæn tegning, Spejlvend, Kopiér og
Indsæt, at en gemt SVG kan åbnes igen, sproget og layoutet fra 520 × 380 til
1500 × 900. Slutlinjen skal være ALT OK (25. september 2026: 133 påstande).

## I menuen

Ja, fra 25. september 2026: knappen `data-emne="c6.3"` (nr. 3, Tegnebræt) i
`animationer/kemi-c-filer/samling_c6.html` og nr. 3 i `FEEDBACK_EMNER` i
`animationer/samling_alt.html`. Pladsen var ledig, efter at c6.3 og c6.4 blev
til sc6.2. Og i B-menuen (brugerens ønske samme dag): knap 8 (`data-emne="tegnebraet"`)
i `animationer/kemi-b-filer/samling_b4,5,6.html` og nr. 8 i `FEEDBACK_EMNER` i
`animationer/samling_alt_b.html`.
