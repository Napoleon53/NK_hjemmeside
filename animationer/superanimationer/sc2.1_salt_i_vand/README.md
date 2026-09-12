# sc2.1 — Salt i vand

En superanimation: i modsætning til de øvrige animationer, som er én enkelt
HTML-fil, ligger denne i sin egen mappe med adskilt CSS og JavaScript.

Åbn **`index.html`**. Mappen er selvstændig — den henter kun filer inde fra sig
selv og bruger hverken `fetch` eller moduler, så den virker også, når den åbnes
direkte fra harddisken, og kan flyttes hvorhen som helst.

Den afløser `animationer/kemi-c-filer/c2.1_salte_vand_oploest.html`. Det, der var
værd at tage med derfra, er taget med: vandmolekylerne, der vender den rigtige
ende ind mod ionerne og fire og fire river dem løs, de tre temperaturknapper og
en kort selvtest. Resten er bygget om.

## Hvad viser den

To faner om det samme spørgsmål: *hvad sker der, når et salt kommer i vand?*

| # | Fane | Hvad man gør | Pointe |
|---|------|--------------|--------|
| 1 | Opløsningen | vælger et salt og en temperatur og ser efter | vandet river ionerne løs **udefra og ind** — og for nogle salte stopper det næsten med det samme |
| 2 | Hvor meget kan der være? | hælder salt i 100 mL vand, ske for ske | der er en **grænse**. Alt over grænsen bliver liggende som bundfald |

Saltet følger med fra fane til fane. Vælger man kridt på fane 1, er det stadig
kridt på fane 2.

### De seks salte

Den grønne streg over knappen betyder letopløseligt, den orange tungtopløseligt.
Grænsen er sat ved **1 g pr. 100 mL vand ved 20 °C**. Listen er holdt kort med
vilje — det er de salte, man rent faktisk møder på Kemi C.

| Salt | | Hvorfor netop det |
|------|---|-------------------|
| NaCl | let | køkkensalt — og kurven er næsten flad. Varmt vand hjælper ikke |
| KNO₃ | let | det modsatte: fra 13 g til 246 g mellem 0 og 100 °C |
| CaCl₂ | let | 1:2, så gitteret og ligningen viser to Cl⁻ for hver Ca²⁺ |
| CuSO₄ | let | farver opløsningen blå, så man kan *se* koncentrationen stige |
| CaCO₃ | tung | kridt og kalk — 0,0014 g pr. 100 mL |
| AgCl | tung | 0,00015 g pr. 100 mL. Bundfaldet fra fældningsforsøgene |

De to tungtopløselige er det, fanerne står og falder med: uden dem er
"opløselighed" bare et ord.

### Fane 1 — opløsningen

Et lille udsnit af en krystal ligger i bunden af glasset, bygget med saltets
rigtige forhold. Otte vandmolekyler arbejder — to fulde hold på fire, så to
ioner kan blive angrebet på samme tid:

* de finder en ion **i overfladen** — en ion inde midt i krystallen er dækket på
  alle fire sider, og der er ikke plads til vand omkring den. Derfor forsvinder
  krystallen udefra og ind, ikke i tilfældig orden
* undervejs vender de den rigtige ende ind mod ionen: oxygen (δ−) ligger
  nærmest en positiv ion, hydrogen (δ+) ligger nærmest en negativ — vandmolekylet
  vendes bogstaveligt om, alt efter hvilken ion det arbejder på
* når fire har fat, river de ionen løs og bærer den ud i vandet
* den frie ion beholder et lag vand omkring sig og bliver samtidig lidt mindre
  at se på — det er dét, `(aq)` betyder

Ligningen står i panelet og skrives om, så snart man skifter salt:
CaCl₂(s) → Ca²⁺(aq) + 2 Cl⁻(aq).

**Temperaturen** bestemmer tempoet. Ved *koldt* tager det et par minutter at
opløse krystallen, ved *varmt* under et minut.

**Vandmolekylerne genbruges ikke.** Når de fire bærere har afleveret deres ion
ude i vandet, forsvinder de, og friske toner op på tilfældige pladser i
opløsningen. Ellers ville de samme fire blive ved med at dukke op lige dér, hvor
saltet sidst gik i opløsning — og det er hverken kønt eller rigtigt: der er vand
overalt i glasset.

**Tungtopløselige salte stopper.** Der slipper nogle få ioner ud, og så sker der
ikke mere: vandet er mættet, og resten bliver liggende. Antallet kommer fra
`D.frieIoner` og følger saltets rigtige opløselighed — AgCl slipper to ioner i
koldt vand og fire i varmt.

### Fane 2 — hvor meget kan der være?

Venstre side er glasset med 100 mL vand og mL-streger i siden, som på et rigtigt
måleglas. Knapperne til at hælde salt i ligger ovenpå selve glasset. Højre side
er saltets **opløselighedskurve**. De to ting hænger sammen:

* den blå kurve er grænsen, og den gule stiplede linje er det, man har hældt i
* ligger den gule linje **under** kurven, er alt opløst
* ligger den **over**, er forskellen bundfald — og præcis så meget ligger der i
  bunden af glasset ved siden af
* skyderen flytter temperaturen, og det gør kurvens punkt også. Man kan også
  klikke eller trække direkte i grafen

Aksen står som udgangspunkt fast på **0–100 g**, så de forskellige salte kan
sammenlignes direkte. Knappen "Skaler til stoffet" zoomer i stedet ind på netop
det valgte salt — nødvendigt for AgCl, hvor kurven ellers ville ligge usynligt
langs bunden.

Det er hele grunden til, at glasset og grafen står i det samme billede: man kan
se den samme mængde salt to steder på én gang.

De opløste ioner tegnes som prikker i vandet, så mange som der er gram af dem.
Ved AgCl bliver vandet derfor helt klart, mens hele skefulden ligger i bunden.

### Den valgfrie teoriboks

Knappen **Teori** i toplinjen åbner otte korte afsnit: det skæve vandmolekyle,
hvorfor det kan trække i ioner, (s) og (aq), at ionerne ikke bliver til noget
nyt, mættet, let og tungt, hvad temperaturen gør — og et afsnit om, hvor
forenklet tegningen er. Ingen af dem er nødvendige for at bruge animationen.

Ordene *kinetisk energi* og *hydratisering* er med vilje ikke brugt noget sted.
Selvtesten holder øje med det.

Knappen **Quiz** åbner otte spørgsmål med forklaring på svaret. Svarmulighederne
blandes hver gang, og alle fire knapper er lige høje, uanset hvor langt svarene er.

### Det nye i forhold til den gamle animation

* **Der er flere salte end ét.** Den gamle kunne kun NaCl. Nu er der seks, og
  gitteret bygges med saltets eget forhold, så CaCl₂ rent faktisk har dobbelt så
  mange Cl⁻ som Ca²⁺.
* **Tungtopløselige salte er kommet med.** Det var slet ikke muligt at vise før,
  og det er den halvdel af emnet, der peger videre mod fældning (c2.4).
* **Krystallen opløses udefra.** Den gamle kunne rive en ion ud af midten af
  gitteret og efterlade et hul.
* **Mætning findes.** Den gamle havde ingen grænse: alting opløstes altid.
* **Opløselighedskurven er ny** — og den er ikke pynt, men det sted, hvor man
  aflæser, hvor meget der bliver til bundfald. Den står som udgangspunkt fast på
  0–100 g, med en knap til at zoome ind på det enkelte salt.
* **Vandmolekylet vendes rigtigt.** Oxygen ligger nærmest en positiv ion,
  hydrogen nærmest en negativ — ikke bare den samme tegning hver gang.
* **Teksten er flyttet ud af billedet.** Den gamle havde en fast tekstspalte med
  teori, som man ikke kunne slippe for. Nu står der én linje under billedet, og
  resten ligger i en boks, man selv åbner.

Direkte link: `index.html#maetning` åbner fane 2 med det samme.

Genveje: <kbd>1</kbd> <kbd>2</kbd> faner · <kbd>T</kbd> teori · <kbd>Q</kbd> quiz ·
<kbd>R</kbd> start fanen forfra · <kbd>H</kbd> hjælp · <kbd>Esc</kbd> luk.

## Filer

```
index.html            markup for begge faner + de tre overlays
css/stil.css          alt udseende. NB: decimaltal med PUNKTUM i CSS
js/kerne.js           NK-navnerum, dansk talformat, hævet/sænket skrift,
                      DPR-skarpt canvas, tegnehjælpere
js/data.js            ionerne, de seks salte, opløselighedstallene,
                      teksterne til teoriboksen og quizzen
js/valg.js            det valgte salt — deles af begge faner
js/tegning.js         en ion, et vandmolekyle og et bægerglas
js/sim_oploes.js      fane 1 — krystallen og vandmolekylerne
js/sim_maetning.js    fane 2 — glasset og opløselighedskurven
js/quiz.js            selvtesten i sit overlay
js/app.js             faneskift, overlays, tastatur, tegneløkke
_selvtest.html        udviklerværktøj, indgår ikke i animationen (se nedenfor)
```

Der er ingen billedfiler — ioner, vandmolekyler, glas, bundfald og graf er
tegnet i kode. Hver fane er et objekt med `tilpas()`, `opdater(dt)`, `tegn()` og
`nulstil()`. `app.js` kalder kun den aktive fane, så den anden koster ingenting.

## At rette i den

**Et nyt salt** er én linje i `D.SALTE` øverst i `js/data.js`: de to ioner, hvor
mange der er af hver, formlen, navnet, en hverdagsting og seks opløselighedstal
(0, 20, 40, 60, 80 og 100 °C, i gram pr. 100 mL vand). Resten — gitteret,
ligningen, let/tung, kurven, farven på knappen — følger af sig selv. Skal saltet
farve vandet, tilføjes `vandfarve`.

**Ionerne** står i `D.IONER`. `r` er ionens størrelse i forhold til de andre;
tallene er ikke målfaste, men rækkefølgen er rigtig (Na⁺ er mindre end Cl⁻).
`sammensat: true` er dét, selvtesten bruger til at sætte parentes om en
sammensat ion, når den optræder mere end én gang i en formel.

**Opløselighedstallene** er omtrentlige tabelværdier. De er runde nok til et
C-niveau, men forholdet mellem saltene er rigtigt, og det er dét, fanerne viser.
Mellem to tabelpunkter regnes der med en ret linje.

**Hvor mange ioner der slipper fri på fane 1** afgøres af `D.frieIoner`. Et
letopløseligt salt forsvinder helt; et tungtopløseligt slipper 2–10 ioner og
står så stille. Tallene er valgt, så forskellen kan ses — i virkeligheden
slipper der endnu færre, og det står der i teoriboksen.

**Kurvens mål** ligger i `tilpas()` i `js/sim_maetning.js`. Er lærredet bredere
end 640 px, står glasset og grafen ved siden af hinanden; ellers over hinanden.
y-aksen er som udgangspunkt fast 0–100 g (`this.autoSkala = false`); knappen
"Skaler til stoffet" slår om til saltets egen største værdi i stedet — det er
den eneste måde, AgCl's kurve bliver til andet end en flad streg langs bunden.

**Teksterne til teoriboksen og quizzen** står samlet nederst i data.js, så de kan
rettes uden at åbne en eneste af simulationerne.

**`_selvtest.html`** åbner index.html i en iframe og kontrollerer det, man ikke
kan se på et skærmbillede: at formlerne kan regnes ud af ionerne, at ladningerne
går op, at opløselighedstallene passer med let/tung-inddelingen, at
opløst + bundfald altid giver det, man har hældt i, at krystallen faktisk går i
opløsning, når man lader tiden gå, at et tungtopløseligt salt ikke slipper flere
ioner end det må, at ligningen altid er på én linje, at grafens skala-knap og
klik virker, at knapperne ovenpå glasset er positioneret rigtigt — og at ingen
af teksterne bruger fagord over C-niveau. Kør den efter ændringer i data.js.

Den skal åbnes gennem en lokal server (eller i Firefox): Chrome nægter en side
på `file://` at kigge ind i sin egen iframe. Filen bruges ikke af animationen og
kan slettes.

## Hvis den skal ind i menuen

Den er med vilje ikke linket ind endnu. `animationer/kemi-c-filer/samling_c2.html`
har allerede en knap med `data-emne="c2.1"`, som peger på den gamle animation.
Skal den nye afløse den, er det den ene linje, der skal skiftes ud — bemærk
`../`, fordi superanimationerne ligger uden for kapitlets egen mappe:

```html
<button class="tab-btn" data-emne="c2.1"
    data-beskrivelse="Se vandet rive ionerne løs af en saltkrystal, og find ud af, hvor meget der overhovedet kan opløses, før resten bliver til bundfald."
    onclick="visAnimation(this, '../superanimationer/sc2.1_salt_i_vand/index.html')"
    title="Salt i vand"><span class="btn-num">1</span><span class="btn-text">Salt i vand</span></button>
```
