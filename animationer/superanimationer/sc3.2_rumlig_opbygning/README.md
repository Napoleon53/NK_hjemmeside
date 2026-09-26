# sc3.2: Molekylers rumlige opbygning

**Status: i menuen** fra 26. sept. 2026 som c3.2 i `samling_c3.html` og
`samling_NV.html`. Den gamle ligger i
`kemi-c-filer/arkiv/c3.2_rumlig_opbygning_oldversion2.html` (en ældre udgave
lå der allerede som `c3.2_rumlig_opbygning_oldversion.html`).

24. september 2026 blev den delt i to efter brugerens ønske. sc3.2 handler nu
kun om formen. Fanerne om polaritet og vandstrålen er flyttet til
`sc3.3_polaere_molekyler`, der også har elektronegativiteten fra den gamle c3.3.
Formen bruger ikke elektronegativitet til noget, så det hører til der.

En superanimation: i modsætning til de gamle animationer, som er én HTML-fil,
ligger den i sin egen mappe med adskilt CSS, JavaScript og sprites.

Åbn **`index.html`**. Mappen er selvstændig. Den bruger hverken `fetch` eller
moduler og virker derfor også, når den åbnes direkte fra harddisken.

Den skulle afløse `animationer/kemi-c-filer/c3.2_rumlig_opbygning.html`, som
ligger arkiveret i
`animationer/kemi-c-filer/arkiv/c3.2_rumlig_opbygning_oldversion.html` og nu
også er kopieret tilbage som den aktive fil.

## Hvad viser den

| # | Fane | Hvad eleven gør | Pointe |
|---|------|-----------------|--------|
| 1 | Byg molekylet | vælger C, N, O og Cl, sætter dem sammen og vælger bindingerne | formen omkring hvert atom følger af bindinger og frie elektronpar |
| 2 | Molekylerne | drejer 11 rigtige molekyler, sammenligner med prikformlen og måler vinkler | samme regel forklarer CH₄, NH₃, H₂O, CO₂ og resten |

Begge faner har et opgavekort med én knap: Start opgave → Giv hint → Vis svaret →
Ny opgave. Teorien ligger bag knappen **Teori**, og **?** starter en rundvisning
for den aktive fane.

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
centralatomet; svaret står som "?" i panelet, mens opgaven er i gang. De samme
elleve molekyler står på fane 2 i sc3.3, hvor de er polære eller upolære.

Direkte link til en fane: `index.html#byg` eller `#molekyler`.

Genveje: <kbd>1</kbd>-<kbd>2</kbd> faner · <kbd>V</kbd> vinkelmåler ·
<kbd>T</kbd> teori · <kbd>R</kbd> start fanen forfra · <kbd>H</kbd> rundvisning ·
<kbd>Esc</kbd> luk.

## Filer

```
index.html            markup for de to faner, teori og rundvisning
css/stil.css          alt udseende. NB: decimaltal med PUNKTUM i CSS
js/kerne.js           NK-navnerum, dansk talformat, vektorer og drejninger,
                      DPR-skarpt canvas
js/data.js            grundstoffer, molekyler, frastødningens styrker, teori
js/sprites.js         indlæser sprites/*.svg
js/frastoedning.js    elektronparrene, der skubber til hinanden
js/bygning.js         fane 1: regler, automatisk H, geometri, genkendelse
js/model3d.js         kameraet og tegningen af atomer, pinde og elektronpar;
                      vinkelbuen og pilene
js/prikformel.js      prikformlen i hjørnet
js/opgave.js          opgavekortet med én knap (samme som sc2.1)
js/valg.js            det valgte molekyle på fane 2
js/sim_byg.js         fane 1
js/sim_molekyler.js   NK.MolSim (grundlaget) og fane 2
js/rundvisning.js     spotlight-rundvisningen
js/app.js             faneskift, teori, tastatur, tegneløkke
sprites/              atomkugler (C, H, O, N, Cl), elektronpar og vinkelmåler
_selvtest.html        udviklerværktøj, indgår ikke i animationen
```

Filerne til polaritet og vandstrålen (`js/sim_polaritet.js`, `js/vand_tegning.js`,
`js/sim_vandstraale.js`, `js/tegneserie.js` og sprites til haner, vask, stave og
uldklud) bruges ikke længere her. De ligger i sc3.3.

## At rette i den

**Et nyt kendt molekyle på fane 1** er én linje i `B.KENDTE` i `js/bygning.js`:
atomerne (uden H) og bindingerne `[atom, atom, orden]`. Navnet findes af sig selv.

**Et nyt molekyle på fane 2** er ét objekt i `D.MOLEKYLER`: atomer med plads i
rummet (`p`) og i prikformlen (`prik`), bindinger, `centrum`, `vinkel`, formen og
to tekster. Frie elektronpar regnes ud af sig selv. Et atom med frie elektronpar
skal have sine bindinger vandret eller lodret i `prik`. Skal molekylet også være
med i sc3.3, lægges det ind der med.

**Opgaverne** står øverst i hver `sim_*.js` som funktioner, der returnerer et
opgaveobjekt (formatet står i `js/opgave.js`).

**`_selvtest.html`** åbner `index.html` i en iframe og kontrollerer: molekylerne
på fane 2 (oktet, form, vinkel); byggeren på fane 1 (vinkler for alle kendte
molekyler, plan og lineær form, reglerne for C, antal atomer og bindinger,
genkendelse, drejningen mellem gammel og ny form); at alle opgaver kan løses; og
at ingen tekst bruger tankestreger eller er under 12 px. Chrome kræver
`--allow-file-access-from-files`.
