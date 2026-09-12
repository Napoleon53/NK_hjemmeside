# sc2.2 — Saltbyggeren

En superanimation: i modsætning til de øvrige animationer, som er én enkelt
HTML-fil, ligger denne i sin egen mappe med adskilt CSS og JavaScript.

Åbn **`index.html`**. Mappen er selvstændig — den henter kun filer inde fra sig
selv og bruger hverken `fetch` eller moduler, så den virker også, når den åbnes
direkte fra harddisken, og kan flyttes hvorhen som helst.

Den afløser `animationer/kemi-c-filer/c2.2_salte_sammensatte_ioner.html`. Det,
der var værd at tage med derfra, er taget med: at bygge en neutral forbindelse
af en positiv og en negativ ion, skiftet mellem frit byggeri og opgaver, og
muligheden for at skjule ionernes navne. Resten er bygget om.

## Hvad viser den

To faner om den samme regel: *et salt er neutralt, så plus og minus skal gå
lige op.*

| # | Fane | Hvad man gør | Pointe |
|---|------|--------------|--------|
| 1 | Byg salte | trækker ioner ned på bordet, til lynlåsen lukker | formlen er **det mindste antal**, hvor ladningerne går op |
| 2 | Opløs i vand | forudsiger, hvad der kommer ud i vandet | den sammensatte ion **går ikke i stykker** |

Fane 1 har to tilstande, som deler det samme bord:

* **Byg frit** — sandkassen. Formlen, navnet, atomtallene og ladningsregnskabet
  står ved siden af, mens man bygger.
* **Opgaver** — to slags på skift, så begge veje bliver trænet:
  * *navn → formel:* byg fx aluminiumsulfat, og vælg til sidst den rigtige
    skrivemåde. **Parentesen**: (SO₄)₃ er tre sulfationer — SO₄₃ er ingenting.
  * *formel → navn:* find ionerne i fx Fe₂(SO₄)₃, og navngiv stoffet. Formlen
    **afslører ladningen**: med tre sulfationer må jernet være Fe³⁺.

### Lynlåsen

Hele animationen hviler på ét billede. Hvert kort på bordet er lige så bredt,
som ionen har ladning: Al³⁺ fylder tre felter, NO₃⁻ ét. Hvert felt har et plus
eller et minus på kanten ind mod midten, og dér skal de mødes to og to.

* Ionerne **trækkes** ned fra hylden — eller klikkes, hvis man hellere vil.
  Undervejs lyser den række op, ionen lander i. Et kort fjernes igen ved at
  klikke på det eller trække det væk fra bordet.
* Lukker lynlåsen hele vejen, er saltet neutralt — det kan ses uden at regne.
* Mangler der en partner, står der en stiplet cirkel dér, hvor ionen mangler.
* Strategien er hele fremgangsmåden: **giv den korteste række én ion mere**.
  Det er præcis dét, "Afstem for mig" gør, ét trin ad gangen, og det rammer
  altid det mindste forhold.
* Lægger man 2 Mg²⁺ og 2 SO₄²⁻, lukker lynlåsen også — men de gule streger
  viser, at der ligger *to ens enheder*. Derfor hedder stoffet MgSO₄.

Når ladningen går op, skrives formlen frem under bordet. Under en opgave er den
slået fra, indtil opgaven er løst — ellers ville den røbe svaret.

### Det nye i forhold til den gamle animation

* **Ionerne er tegnet.** En sammensat ion vises som sine atomer, holdt sammen
  af bindinger, så SO₄²⁻ ses som én pakke med ét svovl og fire oxygen. Den
  gamle animation viste kun teksten "SO₄²⁻" på en klods.
* **Ladningen er blevet til bredde.** Den gamle stablede klodser i to tårne,
  der skulle være lige høje. Nu ligger felterne over for hinanden, så hvert
  plus kan ses parret med sit minus — og det tomme felt er lige så tydeligt.
* **Begge veje trænes.** Den gamle havde én opgavetype: byg det navngivne stof.
  Nu trænes også vejen fra formel til navn (med romertal for jern og kobber) og
  selve skrivemåden med parentes.
* **De forkerte svar er ikke fyld.** Hver forkert formel og hvert forkert navn
  er en typisk fejl og har sin egen forklaring: sulfid mod sulfat, nitrit mod
  nitrat, ammoniak mod ammonium, "dialuminiumtrisulfat", Al₂SO₄₃ uden parentes,
  Al₂S₃O₁₂ hvor ionerne er talt væk.
* **Vandfanen er helt ny.** Den viser det, sammensatte ioner handler om: i vand
  skilles saltet ad ved ionerne — ikke ved atomerne. Tungtopløselige salte
  bliver liggende som bundfald, så fanen peger direkte videre til fældning
  (c2.4). Et salt, man selv har bygget, kan tages med derover med én knap.
* **Stofferne findes.** Alle opgaver bruger rigtige stoffer, og i sandkassen
  siger animationen til, hvis man bygger noget, der ikke findes (Al₂(CO₃)₃) —
  formlen er stadig rigtigt skrevet.

Direkte link: `index.html#vand` giver vandfanen, `index.html#opgaver` åbner
byggefanen med opgaverne i gang.

Genveje: <kbd>1</kbd> <kbd>2</kbd> faner · <kbd>R</kbd> start forfra ·
<kbd>H</kbd> hjælp · <kbd>Esc</kbd> luk.

## Filer

```
index.html          markup for begge faner + hjælpe-overlay
css/stil.css        alt udseende. NB: decimaltal med PUNKTUM i CSS
js/kerne.js         NK-navnerum, dansk talformat, hævet/sænket skrift,
                    DPR-skarpt canvas, tegnehjælpere
js/data.js          ionerne og alt, der kan regnes ud af dem: formler, navne,
                    atomtal, opløselighed, opgavelister og svarmuligheder
js/tegning.js       én ion tegnet i lærredet: atomer, bindinger, ladning
js/opgave.js        svarknapper, trinliste og valget af næste opgave
js/bord.js          arbejdsbordet: hylder, kort, lynlås, træk og slip
js/sim_bord.js      fane 1 — sandkassen og de to opgavetyper
js/sim_vand.js      fane 2 — bægerglasset
js/app.js           faneskift, tastatur, tegneløkke
_selvtest.html      udviklerværktøj, indgår ikke i animationen (se nedenfor)
```

Der er ingen billedfiler — ioner, kort, lynlås og bægerglas er tegnet i kode.
Hver fane er et objekt med `tilpas()`, `opdater(dt)`, `tegn()` og `nulstil()`.
`app.js` kalder kun den aktive fane, så den anden koster ingenting.

## At rette i den

**Nye ioner** tilføjes i `D.IONER` øverst i `js/data.js`. En ion har `id`,
`formel` (med sænkede tal), ladningen `q` og `navn`. Er den sammensat, skal den
også have en lille tegning: hvert atom med symbol, x, y og hvilket atom det er
bundet til, målt i bindingslængder. Formlen og tegningen skal passe sammen —
det tjekker selvtesten.

**Navnene** følger reglen fra bogen: en positiv ion får "-ion" bagpå, når den
står alene (natriumion), men ikke inde i saltets navn (natriumsulfat). Metaller
med flere mulige ladninger har `variabel: true` og et `grund`-navn uden
romertal, så animationen både kan skrive "jern(III)" og forklare, hvorfor tallet
skal med.

**Opgavelisterne** står samlet i data.js. Listen til navn → formel har et
trin-tal (1-3): eleven får kun de svære opgaver, når de lette er løst.

**De forkerte svarmuligheder** laves af `formelValg`, `navneValg`, `oploesValg`
og `saltValg`. Rækkefølgen i hver funktion er vigtig: den første fejltype, der
passer på opgaven, kommer med først, og der er kun plads til tre. Skal en ny
fejltype med, sættes den ind dér, hvor den er mest værd at møde.

**Opløseligheden** i `D.oploeselighed` er de huskeregler, der også bruges i
fældningsopgaverne: nitrater og alt med natrium, kalium og ammonium er
letopløseligt, resten står som undtagelser.

**Bordets mål** regnes ud i `layout()` i `js/bord.js`. `U` er bredden af ét
ladningsfelt, og alt andet — kortenes bredde, mærkernes størrelse, hvor
knapperne står — følger af den. Bordet har altid plads til mindst seks felter,
så billedet ikke hopper, når der lægges en ion til.

**Træk og slip** ligger i `startTraek` (fra hylden) og `koblMus` (kortene på
bordet) i bord.js. Begge bruger pointer-hændelser, så det virker med både mus,
finger og pen; `touch-action: none` i stilarket er dét, der gør, at en finger på
en tablet trækker ionen i stedet for at rulle siden.

**`_selvtest.html`** åbner index.html i en iframe og kontrollerer det, man ikke
kan se på et skærmbillede: at formler, navne og atomtal er rigtige, at ingen
opgave kan stilles med et stof, der ikke findes, at hvert sæt svarmuligheder har
præcis ét rigtigt svar og en forklaring på alle fire, at opløselighederne
stemmer, at tegningerne passer med formlerne — og at fanernes og tilstandenes
egen logik reagerer rigtigt. Kør den efter ændringer i data.js.

Den skal åbnes gennem en lokal server (eller i Firefox): Chrome nægter en side
på `file://` at kigge ind i sin egen iframe. Filen bruges ikke af animationen og
kan slettes.

## Hvis den skal ind i menuen

Den er med vilje ikke linket ind endnu. `animationer/kemi-c-filer/samling_c2.html`
har allerede en knap med `data-emne="c2.2"`, som peger på den gamle animation.
Skal den nye afløse den, er det den ene linje, der skal skiftes ud — bemærk
`../`, fordi superanimationerne ligger uden for kapitlets egen mappe:

```html
<button class="tab-btn" data-emne="c2.2"
    data-beskrivelse="Byg salte af sammensatte ioner, så ladningerne går op, skriv formlen rigtigt, og se hvad der sker, når saltet opløses i vand."
    onclick="visAnimation(this, '../superanimationer/sc2.2_saltbygger/index.html')"
    title="Saltbyggeren"><span class="btn-num">2</span><span class="btn-text">Saltbyggeren</span></button>
```

Feedback-boksen i `animationer/samling_alt.html` har allerede pladsen: i
`FEEDBACK_EMNER` står `C2: Ionforbindelser` med `{ nr: 2, navn: 'Neutrale
forbindelser' }`. Skal navnet følge med, rettes det ene `navn` til
`'Saltbyggeren'`.
