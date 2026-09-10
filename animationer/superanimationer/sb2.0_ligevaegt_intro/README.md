# sb2.0 — Dynamisk ligevægt: introduktion

Den første "superanimation": i modsætning til de øvrige animationer, som er én
enkelt HTML-fil, ligger denne i sin egen mappe med adskilt CSS, JavaScript og
sprites.

Åbn **`index.html`**. Mappen er selvstændig — den henter kun filer inde fra sig
selv, så den kan flyttes hvorhen som helst uden at der knækker noget.

## Hvad viser den

Fire faner om den samme idé: *når to modsatrettede processer kører lige hurtigt,
står tallene stille, selvom der stadig sker noget.*

| # | Fane | Model | Pointe |
|---|------|-------|--------|
| 1 | Lillebæltsbroerne | v(frem) = k(frem)·n(Fyn), v(tilbage) = k(tilbage)·n(Jylland) | Systemet vender tilbage til samme **forhold**, ikke samme tal. K = k(frem)/k(tilbage) |
| 2 | Rensdyr og føde | fødsler mod dødsfald, føde vokser logistisk | Samme slags balance, men **uden** ligevægtskonstant — den flytter sig med bæreevnen |
| 3 | Torvet | udbud S(p) mod efterspørgsel D(p) | Et indgreb giver en **ny** ligevægt, ikke den gamle |
| 4 | Kemien | N₂O₄ ⇌ 2 NO₂ med Arrhenius og van 't Hoff | Den rigtige vare, med koefficienten som eksponent i ligevægtsloven |

Fane 4 har en tabel, der oversætter fane 1 til kemi begreb for begreb.

Direkte link til en bestemt fane: `index.html#natur`, `#marked`, `#kemi`
(`#bro` eller ingenting giver fane 1).

Genveje: <kbd>1</kbd>–<kbd>4</kbd> faner · <kbd>mellemrum</kbd> pause ·
<kbd>R</kbd> nulstil fanen · <kbd>H</kbd> hjælp.

## Filer

```
index.html          markup for alle fire faner + hjælpe-overlay
css/stil.css        alt udseende. NB: decimaltal med PUNKTUM i CSS
js/kerne.js         NK-navnerum, tid, dansk talformat, DPR-skarpt canvas,
                    målere, Y-mod-K-bjælken, ligevægtsmærkaten
js/sprites.js       indlæser sprites/*.svg med <img> (ikke fetch — så det
                    også virker over file://) og tegner dem drejet/skaleret
js/graf.js          grafmotoren: flere serier, gruppeskift, auto-y-akse,
                    stiplet referencelinje
js/sim_bro.js       fane 1     js/sim_natur.js   fane 2
js/sim_marked.js    fane 3     js/sim_kemi.js    fane 4
js/app.js           faneskift, tidsstyring, tastatur, tegneløkke
sprites/*.svg       19 flade vektorfigurer — biler, huse, rensdyr, graner,
                    mos, snefnug, grøntsager, kunde, bod, højbed, molekyler
_selvtest.html      udviklerværktøj, indgår ikke i animationen (se nedenfor)
```

Hver simulation er et objekt med `tilpas()`, `opdater(dt)`, `tegn()` og
`nulstil()`. `app.js` kalder kun den aktive fane, så de tre andre koster
ingenting.

## At rette i den

**Sprites** kan skiftes ud ved bare at overskrive SVG-filen — samme filnavn,
og resten passer sig selv. Figurerne tegnes centreret om et punkt og skaleres
efter bredden, så billedforholdet er det eneste, der betyder noget.

**Modellernes konstanter** står øverst i hver `sim_*.js` med en kommentar om,
hvad de gør. Vær opmærksom på et par ting:

* `sim_natur.js`: føden skal i balancepunktet ligge **over** halvdelen af
  bæreevnen, ellers bliver systemet en ustabil spiral, der kredser i stedet for
  at falde til ro. Derfor er bæreevnen loftet ved 2200.
* `sim_kemi.js`: `HASTIGHED_CAP` begrænser hvor hurtigt reaktionen må køre ved
  høj temperatur. Den skalerer k(frem) og k(tilbage) med samme faktor, så K
  forbliver rigtig — det er kun ventetiden, der bliver kortere.

**`_selvtest.html`** åbner `index.html` i en iframe og kører hver model
adskillige minutter frem i tiden uden at tegne, og skriver så resultatet på
skærmen. Brug den efter ændringer i modellerne: den viser, om hver fane stadig
rammer sin beregnede ligevægt, og om Le Chatelier-indgrebene flytter systemet
den rigtige vej. Filen bruges ikke af animationen og kan slettes.

## Hvis den skal ind i menuen

Den er med vilje ikke linket ind endnu. Én linje i
`animationer/kemi-b-filer/samling_b2.html` er nok:

```html
<button class="tab-btn" data-emne="b2.0"
    data-beskrivelse="Fire modeller af dynamisk ligevægt: trafikken over Lillebælt, rensdyr og føde, torvets priser og til sidst N₂O₄ ⇌ 2 NO₂."
    onclick="visAnimation(this, '../superanimationer/sb2.0_ligevaegt_intro/index.html')"
    title="Dynamisk ligevægt: introduktion"><span class="btn-num">0</span><span class="btn-text">Dynamisk ligevægt</span></button>
```

Bemærk `../` — det er første gang en samling skal linke ud af sin egen mappe.
Kapitlet skal også have en linje i `FEEDBACK_EMNER` i
`animationer/samling_alt_b.html`, hvis den skal kunne vælges i feedback-boksen.
