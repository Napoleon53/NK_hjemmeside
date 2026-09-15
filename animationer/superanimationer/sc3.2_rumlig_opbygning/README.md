# sc3.2: Molekylers rumlige opbygning

En superanimation: i modsætning til de gamle animationer, som er én HTML-fil,
ligger den i sin egen mappe med adskilt CSS, JavaScript og sprites.

Åbn **`index.html`**. Mappen er selvstændig. Den bruger hverken `fetch` eller
moduler og virker derfor også, når den åbnes direkte fra harddisken.

Den afløser `animationer/kemi-c-filer/c3.2_rumlig_opbygning.html`, som nu
ligger i `animationer/kemi-c-filer/arkiv/c3.2_rumlig_opbygning_oldversion.html`.
Knapperne i `samling_c3.html` og `samling_NV.html` peger direkte på denne
mappes `index.html`.

## Hvad viser den

| # | Fane | Hvad eleven gør | Pointe |
|---|------|-----------------|--------|
| 1 | Byg molekylet | vælger C, N, O og Cl, sætter dem sammen og vælger bindingerne | formen omkring hvert atom følger af bindinger og frie elektronpar |
| 2 | Molekylerne | drejer 11 rigtige molekyler, sammenligner med prikformlen og måler vinkler | samme regel forklarer CH₄, NH₃, H₂O, CO₂ og resten |
| 3 | Polær eller upolær? | ser trækket i hver polær binding og det samlede træk | et molekyle med polære bindinger kan være upolært, hvis det er symmetrisk |
| 4 | Forsøg: vandstrålen | lader en stav og holder den ved en stråle af vand, ethanol og heptan | polære væsker bøjer mod staven, uanset om den er positiv eller negativ |

Fane 1-3 har et opgavekort med én knap: Start opgave → Giv hint → Vis svaret →
Ny opgave. På fane 4 er opgaverne låst, til forsøget er slut. Teorien ligger bag
knappen **Teori**, og **?** starter en rundvisning for den aktive fane.

### Fane 1: byg molekylet

* Eleven vælger et atom i panelet, og det sættes på det valgte atom (blå ring).
  Hydrogen og frie elektronpar kommer selv: et atom får så mange H, at det har
  sit normale antal bindinger (C 4, N 3, O 2, Cl 1).
* Højst to carbonatomer og fem atomer ud over hydrogen. Et atom sættes altid på
  et andet, så molekylet er et træ uden ringe.
* Bindingen mellem to atomer vælges i panelet eller ved at klikke på den i
  modellen. Dobbelt- og tripelbinding kan kun vælges, hvis begge atomer har plads.
* Kendte molekyler får navn (28 stk. i `B.KENDTE` i `js/bygning.js`), andre
  vises med bruttoformel. Genkendelsen er uafhængig af rækkefølgen, atomerne er
  sat på i.
* Panelet viser formen omkring det valgte atom. Vinkelmåleren (V) måler vinklen
  mellem to atomer, der sidder på samme atom.

**Geometrien** (`js/bygning.js`) bygges atom for atom fra det første. Omkring
hvert atom finder bindinger og frie par deres plads med frastødningen i
`js/frastoedning.js`. Om en enkeltbinding vælges drejningen, så atomerne står
forskudt; ved en dobbeltbinding ligger begge ender i samme plan. Når molekylet
ændres, drejes den nye form, så den passer bedst med den gamle (Horns metode), og
atomerne glider på plads. Et nyt atom overtager pladsen fra det H, det erstatter,
fordi grupperne omkring et atom altid står i rækkefølgen: atomet, det sidder på,
H'erne, de tunge naboer med de nyeste først og til sidst de frie par.

**Frastødningen**: hver gruppe er en retning på en kugle om atomet, og alle
skubber til alle med en kraft ∝ styrke/afstand². Styrkerne står i `D.FRASTOED` i
`js/data.js`: binding-binding 1, frit par-binding 1,221 og frit par-frit par 1,401.
Tallene er fundet ved at søge, til ligevægten gav NH₃ = 107,00° og H₂O = 104,50°;
CH₄ bliver så 109,47°. En dobbelt- eller tripelbinding skubber som en
enkeltbinding, så CO₂ er lineær og CH₂O plan med 120°.

### Fane 2: molekylerne

H₂O, NH₃, CH₄, CO₂, HCN, CH₂O, C₂H₄, C₂H₂, CCl₄, CH₃Cl og HCl som kugle-stang
eller kalotte, med eller uden frie elektronpar. Prikformlen i hjørnet tegnes som i
sc3.1. Opgaverne spørger om form, bindingsvinkel og antal frie elektronpar på
centralatomet; svaret står som "?" i panelet, mens opgaven er i gang.

### Fane 3: polær eller upolær?

En binding er polær fra en forskel i elektronegativitet på 0,5 (samme grænse og
EN-tal som c3.3). Pilen går fra δ+ mod δ− og er længere, jo større forskellen er.
Om molekylet er polært, regnes ud af de samme pile i `klargoer()` i `js/data.js`,
så tegningen og facit ikke kan være uenige.

### Fane 4: forsøg med vandstrålen

Laboratoriebordet har en burette i et stativ, et bægerglas, flasker med vand,
ethanol og heptan, en plastikstav, en glasstav og en uldklud.

* Klik på en flaske for at fylde 30 mL i buretten (den skal være tom, og hanen
  lukket). Klik på hanegrebet for at åbne og lukke.
* Tag fat i en stav og træk den frem og tilbage over kluden. Plastik bliver
  negativ, glas positiv. Ladningen ses som − eller + langs staven og aftager
  langsomt.
* Hold staven tæt på strålen. Strålen er partikler, der falder med tyngdekraften
  og trækkes mod staven med en kraft ∝ ladning · polaritet / afstand². Polariteten
  står i `D.VAESKER`: vand 1, ethanol 0,55, heptan 0,02. Rører staven strålen,
  bliver den våd og mister ladningen.
* Når en ladet stav er tæt på strålen, viser en lup molekylerne: vand og ethanol
  vender den modsat ladede ende mod staven, heptan gør ikke.
* Et test registreres, når en ladet stav har været tæt på strålen i 1,2 s.
  Forsøget er slut, når alle tre væsker er testet, og vand er testet med begge
  stave. Så låses tegneserien og opgaverne op.
* Bægerglasset samler væskerne: heptan lægger sig oven på vand og ethanol. Klik på
  det for at tømme det. Rammer strålen ved siden af, dannes en pyt.

Tegneserien (`js/tegneserie.js`) bruger elevens resultater: hvilken stav der blev
brugt til hver væske, og om heptan ligger oven på vandet. Resultatskemaet står i
sidste rude.

Direkte link til en fane: `index.html#molekyler`, `#polaritet` eller `#vand`.

Genveje: <kbd>1</kbd>-<kbd>4</kbd> faner · <kbd>V</kbd> vinkelmåler ·
<kbd>I</kbd> hint (fane 4) · <kbd>S</kbd> tegneserie (fane 4) · <kbd>T</kbd> teori ·
<kbd>R</kbd> start fanen forfra · <kbd>H</kbd> rundvisning · <kbd>Esc</kbd> luk.

## Filer

```
index.html            markup for de fire faner, teori, tegneserie og rundvisning
css/stil.css          alt udseende. NB: decimaltal med PUNKTUM i CSS
js/kerne.js           NK-navnerum, dansk talformat, vektorer og drejninger,
                      DPR-skarpt canvas
js/data.js            grundstoffer, molekyler, væsker, frastødningens styrker, teori
js/sprites.js         indlæser sprites/*.svg
js/frastoedning.js    elektronparrene, der skubber til hinanden
js/bygning.js         fane 1: regler, automatisk H, geometri, genkendelse
js/model3d.js         kameraet og tegningen af atomer, pinde og elektronpar;
                      vinkelbuen og pilene
js/prikformel.js      prikformlen i hjørnet
js/opgave.js          opgavekortet med én knap (samme som sc2.1)
js/valg.js            det valgte molekyle, delt af fane 2 og 3
js/sim_byg.js         fane 1
js/sim_molekyler.js   NK.MolSim (det fane 2 og 3 har til fælles) og fane 2
js/sim_polaritet.js   fane 3
js/vand_tegning.js    fane 4: alt, der tegnes, og scenens mål
js/sim_vandstraale.js fane 4: burette, stråle, stave, forløb og opgaver
js/tegneserie.js      fane 4: forsøget som tegneserie
js/rundvisning.js     spotlight-rundvisningen
js/app.js             faneskift, overlays, tastatur, tegneløkke
sprites/              atomkugler (C, H, O, N, Cl), elektronpar, vinkelmåler,
                      stativ, burette, bægerglas, flaske, plastikstav, glasstav
                      og uldklud
_selvtest.html        udviklerværktøj, indgår ikke i animationen
```

## At rette i den

**Et nyt kendt molekyle på fane 1** er én linje i `B.KENDTE` i `js/bygning.js`:
atomerne (uden H) og bindingerne `[atom, atom, orden]`. Navnet findes af sig selv.

**Et nyt molekyle på fane 2 og 3** er ét objekt i `D.MOLEKYLER`: atomer med plads
i rummet (`p`) og i prikformlen (`prik`), bindinger, `centrum`, `vinkel`, formen
og fire tekster. Frie elektronpar, δ+ og δ−, træk og polaritet regnes ud af sig
selv. Et atom med frie elektronpar skal have sine bindinger vandret eller lodret
i `prik`.

**Forsøgets tal** står øverst i `js/sim_vandstraale.js` (mængde, flow, stavens
træk, hvor tæt og hvor længe et test kræver). Scenens mål (hanen, spidsen,
bægerglasset, kluden) står i `MAAL` i `js/vand_tegning.js` og skal passe med
sprites; hver sprite skriver i en kommentar, hvor den tegnes.

**Opgaverne** står øverst i hver `sim_*.js` som funktioner, der returnerer et
opgaveobjekt (formatet står i `js/opgave.js`).

**`_selvtest.html`** åbner `index.html` i en iframe og kontrollerer: molekylerne
på fane 2 og 3 (oktet, form, vinkel, polaritet); byggeren på fane 1 (vinkler for
alle kendte molekyler, plan og lineær form, reglerne for C, antal atomer og
bindinger, genkendelse, drejningen mellem gammel og ny form); vandstrålen (vand
bøjer mest, ethanol mindre, heptan ikke; våd stav; gnidning; volumen; hele
forløbet til tegneserien); at alle opgaver kan løses; og at ingen tekst bruger
tankestreger eller er under 12 px. Chrome kræver `--allow-file-access-from-files`.
