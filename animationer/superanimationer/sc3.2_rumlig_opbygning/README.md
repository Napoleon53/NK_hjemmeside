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

Tre faner, der bygger oven på hinanden:

| # | Fane | Hvad eleven gør | Pointe |
|---|------|-----------------|--------|
| 1 | Byg formen | sætter bindinger og frie elektronpar på et centralatom og ser dem skubbe sig på plads | formen følger af, hvor mange elektronpar der er, og et frit par skubber mere end en binding |
| 2 | Molekylerne | drejer 11 rigtige molekyler, sammenligner med prikformlen og måler vinkler | samme regel forklarer CH₄, NH₃, H₂O, CO₂ og resten |
| 3 | Polær eller upolær? | ser trækket i hver polær binding og det samlede træk | et molekyle med polære bindinger kan være upolært, hvis det er symmetrisk |

Hver fane har et opgavekort med én knap: Start opgave → Giv hint → Vis svaret →
Ny opgave. Teorien ligger bag knappen **Teori** og er ikke nødvendig for at
bruge animationen. **?** starter en rundvisning for den aktive fane.

### Fane 1: byg formen

* Enkeltbindinger går til H, dobbeltbindinger til O og tripelbindinger til N.
  Centralatomet er det grundstof, der får oktet (C, N, O eller Cl), og formlen
  står i panelet. Uden oktet er centralatomet en grå kugle uden symbol.
* Man kan tage fat i et atom eller et elektronpar, trække det et andet sted hen
  og se det glide tilbage. Træk i baggrunden drejer.
* **Balloner** viser det samme som ballonmodellen: blå balloner er bindinger,
  gule er frie elektronpar. En dobbeltbinding er én ballon.
* **Vinkelmåleren** (knap eller V) måler vinklen mellem to atomer, der sidder på
  samme atom.
* Fanen starter med CH₄, så formen kan ses med det samme.

**Frastødningen** (`js/frastoedning.js`): hver gruppe er en retning på en kugle
om centralatomet, og alle skubber til alle med en kraft ∝ styrke/afstand².
Styrkerne står i `D.FRASTOED` i `js/data.js`: binding-binding 1, frit par-binding
1,221 og frit par-frit par 1,401. Tallene er fundet ved at søge, til ligevægten
gav NH₃ = 107,00° og H₂O = 104,50°; CH₄ bliver så 109,47°. Rækkefølgen passer med
lærebogen: to frie par skubber mest. En dobbelt- eller tripelbinding skubber som
en enkeltbinding, så CO₂ er lineær og CH₂O plan med 120°.

### Fane 2: molekylerne

H₂O, NH₃, CH₄, CO₂, HCN, CH₂O, C₂H₄, C₂H₂, CCl₄, CH₃Cl og HCl. Visningen kan være
kugle-stang eller kalotte, med eller uden frie elektronpar. Prikformlen i hjørnet
tegnes som i sc3.1: frie par på de sider af symbolet, der ikke har en binding, og
bindingernes elektronpar som prikker mellem symbolerne.

Opgaverne spørger om formen, bindingsvinklen og antallet af frie elektronpar på
centralatomet. Under en opgave står svaret som "?" i panelet, menuen er låst, og
den sidste opgavetype slår frie elektronpar og prikformel fra.

### Fane 3: polær eller upolær?

En binding er polær fra en forskel i elektronegativitet på 0,5 (samme grænse og
samme EN-tal som c3.3). Pilen går fra δ+ mod δ− og er længere, jo større
forskellen er. Det samlede træk er summen af pilene. Om molekylet er polært,
regnes ud af de samme pile i `klargoer()` i `js/data.js`, så tegningen og facit
ikke kan være uenige. C-H (0,4) regnes som upolær.

Opgaverne: polær eller upolær, klik på det atom, der bliver δ−, og hvorfor CO₂ og
CCl₄ er upolære, selvom bindingerne er polære.

Direkte link til en fane: `index.html#molekyler` eller `index.html#polaritet`.

Genveje: <kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> faner · <kbd>V</kbd> vinkelmåler ·
<kbd>T</kbd> teori · <kbd>R</kbd> start fanen forfra · <kbd>H</kbd> rundvisning ·
<kbd>Esc</kbd> luk.

## Filer

```
index.html            markup for de tre faner, teoriboksen og rundvisningen
css/stil.css          alt udseende. NB: decimaltal med PUNKTUM i CSS
js/kerne.js           NK-navnerum, dansk talformat, vektorer og drejninger,
                      DPR-skarpt canvas
js/data.js            grundstoffer, molekyler, frastødningens styrker, teori
js/sprites.js         indlæser sprites/*.svg
js/frastoedning.js    elektronparrene, der skubber til hinanden
js/model3d.js         kameraet og tegningen af atomer, pinde, elektronpar og
                      balloner; vinkelbuen og pilene
js/prikformel.js      prikformlen i hjørnet
js/opgave.js          opgavekortet med én knap (samme som sc2.1)
js/valg.js            det valgte molekyle, delt af fane 2 og 3
js/sim_byg.js         fane 1
js/sim_molekyler.js   NK.MolSim (det fane 2 og 3 har til fælles) og fane 2
js/sim_polaritet.js   fane 3
js/rundvisning.js     spotlight-rundvisningen
js/app.js             faneskift, teori, tastatur, tegneløkke
sprites/              atomkugler (C, H, O, N, Cl og en grå), elektronpar,
                      to balloner og vinkelmåleren
_selvtest.html        udviklerværktøj, indgår ikke i animationen
```

## At rette i den

**Et nyt molekyle** er ét objekt i `D.MOLEKYLER`: atomer med plads i rummet (`p`,
i ångstrøm) og i prikformlen (`prik`), bindinger `[atom, atom, orden]`, det atom
formen gælder for (`centrum`), de tre atomer i den vinkel, der vises
(`vinkel`), formen og fire tekster (hint og svar om form og polaritet). Frie
elektronpar, δ+ og δ−, træk og polaritet regnes ud af sig selv. Et atom med frie
elektronpar skal have sine bindinger vandret eller lodret i `prik`, så parrene
kan sidde på de fire sider. Kør selvtesten bagefter.

**Et nyt grundstof** kræver en linje i `D.GRUNDSTOFFER`, et sprite
`sprites/atom_<symbol>.svg` (kopiér et af de andre og skift de tre farver) og en
linje i `FILER` i `js/sprites.js`.

**Sprites.** Atomkuglerne har centrum i (64, 64) og radius 60. Elektronparret og
ballonerne peger opad med ankeret nederst (`NK.ANKER` i `js/sprites.js`);
`model3d.js` drejer dem ud i deres retning og forkorter dem, når de peger mod
beskueren. De to elektroner i et frit par tegnes i koden, så de altid er runde.

**Opgaverne** står øverst i hver `sim_*.js` som funktioner, der returnerer et
opgaveobjekt (formatet står i `js/opgave.js`).

**`_selvtest.html`** åbner `index.html` i en iframe og kontrollerer: at alle
molekyler har oktet, og at form, vinkel og polaritet passer med lærebogen; at
frastødningen på fane 1 giver 109,47°, 107°, 104,5°, 120° og 180°, også når to
grupper slippes oven i hinanden; at alle opgavetyper kan løses, og at facit
passer med molekylet; at ingen tekst bruger tankestreger; og at ingen synlig
tekst er under 12 px. Chrome kræver `--allow-file-access-from-files`.
