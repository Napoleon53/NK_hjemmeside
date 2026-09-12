# sc1.1 — Atomets opbygning

En superanimation: i modsætning til de øvrige animationer, som er én enkelt
HTML-fil, ligger denne i sin egen mappe med adskilt CSS og JavaScript.

Åbn **`index.html`**. Mappen er selvstændig — den henter kun filer inde fra sig
selv, så den kan flyttes hvorhen som helst uden at der knækker noget.

Den afløser `animationer/kemi-c-filer/c1.1_atommodel_ioner.html`. Det, der var
værd at tage med derfra, er taget med: skyderen gennem de første 20 grundstoffer,
gæt-ladningen-øvelsen og elektronoverførslen til et salt. Resten er bygget om.

## Hvad viser den

Fem faner om det samme spørgsmål: *hvad er et atom lavet af, og hvad sker der,
når man ændrer på delene?*

| # | Fane | Hvad man gør | Pointe |
|---|------|--------------|--------|
| 1 | Atommodellen | lægger protoner, neutroner og elektroner i én ad gangen | **protoner** = grundstoffet, **neutroner** = isotopen, **elektroner** = ladningen |
| 2 | Isotoper | skruer på, hvor meget der er af hver isotop | atommassen i det periodiske system er et **vejet gennemsnit** — derfor 35,45 for chlor |
| 3 | Skaller og ioner | vælger grundstof, gætter ionens ladning | den yderste skal afgør det hele, og **kernen ændrer sig ikke**, når ionen dannes |
| 4 | Salte | kombinerer et metal og et ikke-metal frit | formlen følger af, at **elektronregnskabet skal gå op**: Mg²⁺ + 2 Cl⁻ → MgCl₂ |
| 5 | Spil | tager en bane på fem spørgsmål | det hele én gang til, men som spørgsmål — og med begrundelsen med, også når man rammer rigtigt |

Hverken værktøjet eller fane 1 hedder "Byg et atom": PhET har en sim med det
navn, og selv om koden her er skrevet fra bunden, er der ingen grund til at
lægge sig så tæt op ad den.

Fane 1 har det periodiske system i lommeformat nederst i panelet. Det viser,
hvor det byggede atom hører hjemme, og man kan trykke sig direkte til et
grundstof. Fane 5 kan slå den samme tabel op i stort format midt i et
spørgsmål — dér med atomnummeret i felterne.

### Det nye i forhold til den gamle animation

* **Fane 1 findes ikke i den gamle.** Det er den, isotopbegrebet kommer ud af:
  man kan bygge to kerner af samme grundstof, som ikke vejer det samme, og
  animationen siger hver gang, hvad der lige skete og hvorfor det betyder noget.
  Den har også en opgavegenerator med fem slags opgaver — fra "byg ¹⁴C" til
  "byg en ion med ladningen 2+, som har samme elektronstruktur som neon".
* **Neutronerne er kommet med.** Den gamle animation havde kun protoner og
  elektroner, så massetal og isotoper kunne slet ikke vises.
* **Kernen tegnes som partikler**, ikke som én lilla kugle. Man kan tælle
  protonerne, og kernen vokser synligt, når man lægger mere i.
* **Reaktivitetsmåleren er erstattet.** Den gamle gav en procentskala, eleven
  ikke kunne efterprøve. Nu tælles der noget konkret: *hvor mange elektroner
  skal flyttes, før elektronskyen ligner en ædelgas.*
* **Saltfanen tvinger ikke længere metal og ikke-metal til at passe én til én.**
  Vælger man magnesium og chlor, regner modellen selv ud, at der skal to
  chloratomer til — og skriver forklaringen ud.
* **Bor og silicium danner ikke ioner** i modellen. Den gamle lod Bor afgive tre
  elektroner og blive B³⁺, hvilket ikke er rigtigt.

Direkte link til en bestemt fane: `index.html#isotop`, `#ion`, `#salt`, `#spil`
(`#byg` eller ingenting giver fane 1).

Genveje: <kbd>1</kbd>–<kbd>5</kbd> faner · <kbd>p</kbd> <kbd>n</kbd> <kbd>e</kbd>
læg en partikel i · <kbd>P</kbd> <kbd>N</kbd> <kbd>E</kbd> tag en ud ·
<kbd>R</kbd> nulstil fanen · <kbd>H</kbd> hjælp.

## Filer

```
index.html          markup for alle fem faner + hjælpe-overlay
css/stil.css        alt udseende. NB: decimaltal med PUNKTUM i CSS
js/kerne.js         NK-navnerum, dansk talformat, hævet/sænket skrift,
                    DPR-skarpt canvas, tegnehjælpere
js/data.js          grundstofferne 1–20: isotoper med rigtige kernemasser og
                    andele, ionladninger, saltformler og -navne, plads i det
                    periodiske system
js/atom.js          ÉT atom: tre tal (p, n, e), partikler der flyver ind og ud,
                    kernepakning og hele tegningen. Bruges af alle faner
js/pertabel.js      det periodiske system i lommeformat, 18 søjler
js/sim_byg.js       fane 1     js/sim_isotop.js  fane 2
js/sim_ion.js       fane 3     js/sim_salt.js    fane 4
js/sim_spil.js      fane 5
js/app.js           faneskift, tastatur, tegneløkke
_selvtest.html      udviklerværktøj, indgår ikke i animationen (se nedenfor)
```

Hver simulation er et objekt med `tilpas()`, `opdater(dt)`, `tegn()` og
`nulstil()`. `app.js` kalder kun den aktive fane, så de tre andre koster
ingenting.

## At rette i den

**Grundstofdata** står samlet i `js/data.js`. Isotopmasserne er de rigtige
kernemasser i u — ikke massetallene — for ellers rammer det vejede gennemsnit
ikke den atommasse, der står i det periodiske system. Ændrer man en andel,
skal `_selvtest.html` stadig være grøn.

Listen stopper ved calcium (Z = 20), fordi skalmodellen `[2, 8, 8, 2]` ikke
holder længere. Kalium og calcium er i forvejen et særtilfælde i
`D.skalfordeling`: deres sidste elektroner lægges i skal 4, selvom skal 3 kun
er halvt fyldt — det er netop derfor, de opfører sig som metaller med 1 og 2
yderelektroner.

**Kernen** pakkes i `NK.Atom.prototype.pakKerne` ved at løse afstandene
positionsvis i stedet for med fjederkræfter: partiklerne trækkes mod midten og
skubbes fra hinanden, hvis de overlapper. Den metode kan ikke eksplodere,
uanset hvor mange partikler man propper i.

**Størrelsesforholdet er med vilje fast.** `MODEL_YDRE` i `js/atom.js` er den
radius, et atom med fire fyldte skaller ville have, og alt skaleres i forhold
til den. Derfor fylder hydrogen mindre i billedet end calcium — i stedet for at
hvert atom blæses op til at fylde hele scenen. Vil man have store atomer, skal
man hæve loftet i `plads`-beregningen i `sim_byg.js` og `sim_ion.js`, ikke
`MODEL_YDRE`.

**Opgaverne** på fane 1 er fem skabeloner øverst i `OPGAVETYPER` i
`js/sim_byg.js`. Hver skabelon returnerer `{tekst, p, n, e, svar}`, og resten
klarer sig selv — opgaven tjekkes efter hver eneste ændring, så eleven får
svaret i samme øjeblik, atomet er rigtigt.

**Spørgsmålene** på fane 5 er `sp_`-funktionerne i `js/sim_spil.js`, samlet i
tre baner i `BANER`. Hver funktion returnerer `{tekst, valg, rigtig,
forklaring}` plus det, der skal tegnes (`atom`, `nuklid` eller `stortekst`), og
bygger både spørgsmål, svarmuligheder og begrundelse ud af `data.js` — så et
spørgsmål aldrig kan komme til at sige noget andet end resten af animationen.
Distraktorerne er med vilje de fejl, eleven faktisk laver: protontallet i
stedet for neutrontallet, ombyttede indekstal i saltformlen.

Fordi spørgsmålene trækkes tilfældigt, tjekker `_selvtest.html` 300 runder af
hver bane for, at der altid er fire *forskellige* svarmuligheder med præcis ét
rigtigt iblandt. Det er ikke noget, man kan se på ét skærmbillede.

**`_selvtest.html`** åbner `index.html` i en iframe og kontrollerer det, man
ikke kan se på et skærmbillede: at faneskiftet rammer én fane ad gangen, at
panelerne er fyldt ud, at alle 20 isotopblandinger rammer tabellens atommasse,
at skalfordelingerne er rigtige, og at saltformlerne har ladningsbalance. Brug
den efter ændringer i `data.js`. Filen bruges ikke af animationen og kan
slettes.

## Hvis den skal ind i menuen

Den er med vilje ikke linket ind endnu. `animationer/kemi-c-filer/samling_c1.html`
har allerede en knap med `data-emne="c1.1"`, som peger på den gamle animation.
Skal den nye afløse den, er det den ene linje, der skal skiftes ud — bemærk
`../`, fordi superanimationerne ligger uden for kapitlets egen mappe:

```html
<button class="tab-btn" data-emne="c1.1"
    data-beskrivelse="Byg selv atomet af protoner, neutroner og elektroner, og se hvordan de tre tal bestemmer grundstof, isotop og ladning."
    onclick="visAnimation(this, '../superanimationer/sc1.1_atombygger/index.html')"
    title="Atomets opbygning"><span class="btn-num">1</span><span class="btn-text">Atomets opbygning</span></button>
```

Feedback-boksen i `animationer/samling_alt.html` har allerede pladsen: i
`FEEDBACK_EMNER` står `C1: Atomer` med `{ nr: 1, navn: 'Atommodel' }` — det navn
passer allerede.
