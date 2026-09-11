# sb3.2 — Titreringssimulator

Den anden "superanimation": ligesom `sb2.0_ligevaegt_intro` ligger den i sin
egen mappe med adskilt CSS, JavaScript og en beregningskerne, i stedet for at
være én enkelt HTML-fil.

Åbn **`index.html`**. Mappen er selvstændig — den henter kun filer inde fra sig
selv og bruger hverken `fetch` eller moduler, så den virker også, når den
åbnes direkte fra harddisken, og kan flyttes hvorhen som helst.

Inspirationen er regnearket **CurTiPot** (Ivano Gutz, Universidade de São
Paulo), som regner titrerkurver ud af ladningsbalancen i stedet for af de
sædvanlige tilnærmede formler. Opbygningen er en anden: her er det en
animeret opstilling, man selv betjener.

## Hvad den kan

Man vælger selv, hvad der står i bægerglasset, hvad der er i buretten, og
hvilken indikator der skal i. Alle fire faner arbejder på **den samme**
opstilling, som står i venstre spalte.

| # | Fane | Hvad man laver | Pointen |
|---|------|----------------|---------|
| 1 | Laboratoriet | Åbner hanen og følger pH-metret, mens ens egen kurve tegnes | At se sammenhængen mellem dråber, farve og kurve |
| 2 | Kurven | Aflæser den beregnede kurve med ækvivalens- og halvtitrerpunkter, den afledte og indikatorens omslag | At kunne læse en titrerkurve — og gemme flere og lægge dem oven i hinanden |
| 3 | Fordelingen | Ser hvor meget af stoffet der findes på hver form ved hver pH | At kurverne krydser ved pKs, og at det er samme tal som i halvtitrerpunktet |
| 4 | Ukendt prøve | Får en prøve uden mærkat, titrerer den og bestemmer koncentration og pKs | Den rigtige laboratorieøvelse, uden at bruge kemikalier |

Der er 63 stoffer at vælge mellem — stærke og svage syrer, flerprotonede
syrer, aminosyrer, stærke og svage baser og salte — samt 11 indikatorer og en
universalindikator. Vil man have et stof, der ikke står på listen, vælger man
**"Egen syre"** eller **"Egen base"** og skriver op til tre pKs-værdier ind.

Genveje: <kbd>1</kbd>–<kbd>4</kbd> faner · <kbd>mellemrum</kbd> åbn og luk
hanen · <kbd>D</kbd> én dråbe · <kbd>R</kbd> tøm glasset · <kbd>H</kbd> hjælp.
Direkte link til en fane: `index.html#kurve`, `#fordeling`, `#ukendt`
(`#lab` eller ingenting giver fane 1).

## Kemien bag

`js/kemi.js` indeholder ingen DOM og ingen tegning og kan køres for sig selv.
pH findes ved at løse **ladningsbalancen**

```
[H⁺] − Kw/[H⁺] + Σ c(i) · ( q(i, pH) + modion(i) ) = 0
```

hvor `q(i, pH)` er stoffets gennemsnitlige ladning ved den pH, regnet ud af
pKs-værdierne. Venstresiden falder monotont med pH, så bisektion rammer
altid. Der er ingen antagelser om, at "syren er svag" eller "vandets
autoprotolyse kan ses bort fra" — derfor holder kurverne også for 10⁻⁸ M
saltsyre og for amfolytter som hydrogencarbonat.

Der regnes **uden aktivitetskoefficienter** (I = 0, 25 °C), præcis som i
gymnasiets pensum. I virkeligheden forskydes pH nogle tiendedele ved høj
ionstyrke; CurTiPot kan regne det med, det kan denne ikke.

pKs-værdierne er hentet i CurTiPots database og Databogen.

### Hvornår er et ækvivalenspunkt et ækvivalenspunkt?

Et stof, der hældes i som H(k)B, kan afgive k protoner og modtage resten.
Hvert af de trin er en kandidat til et ækvivalenspunkt, og de sorteres efter,
hvor let de titreres. For hver kandidat regnes volumenet af
stofmængderegnskabet, og så stilles spørgsmålet: **er trinnet faktisk omsat
ved sit eget ækvivalenspunkt?** Er under 60 % af det omsat, stopper listen
der.

Det er den regel, der gør, at phosphorsyre giver to spring med NaOH og ikke
tre: ved det tredje trins volumen ville kun 22 % af HPO₄²⁻ være omsat, fordi
pKs 12,35 er for højt til at kunne titreres i vand.

Fane 2 dømmer desuden hvert punkt efter, hvor stort springet er — målt som
pH-ændringen over 0,1 mL til hver side, altså et par dråber:

| ΔpH over ±0,1 mL | Dom | Eksempel |
|---|---|---|
| ≥ 2,0 | tydeligt spring | eddikesyre/NaOH: 3,3 |
| 0,4 – 2,0 | svagt spring | phosphorsyre, begge trin: ca. 1,0 |
| < 0,4 | intet brugbart spring | eddikesyre/ammoniak: 0,4 |

Grænserne står øverst i `js/sim_kurve.js`. Læg mærke til, at et punkt godt kan
være både rigtigt og usynligt: ascorbinsyrens andet trin (pKs 11,79) er omsat,
men springet er 0,01 pH-enhed, og så står der "intet brugbart spring".

## Det lokale farveglimt

Dér hvor dråben rammer, er pH et kort øjeblik næsten titratorens egen — ikke
blandingens. Derfor tegnes en lille sky med indikatorens farve ved **den**
pH, som så forsvinder i løbet af godt et sekund. Det er derfor, man ser
lyserøde glimt i kolben længe før omslaget, og det er derfor, der skal røres
rundt. Se `ramt()` i `js/bord.js`.

## Filer

```
index.html          markup for alle fire faner, opstillingsspalten og hjælpen
css/stil.css        alt udseende. NB: decimaltal med PUNKTUM i CSS
js/kemi.js          kemien: stofdatabase, pH-løser, kurver, ækvivalenspunkter,
                    indikatorfarver. Ingen DOM — kan køres i node
js/kerne.js         NK-navnerum, dansk talformat (læser både komma og punktum),
                    DPR-skarpt canvas, små tegnehjælpere
js/graf.js          NK.Kurve (pH mod volumen) og NK.Fordeling (brøkdel mod pH)
js/apparat.js       hele opstillingen tegnet i canvas: stativ, buret med hane
                    og inddeling, bægerglas, magnetomrører, elektrode, pH-meter
js/bord.js          selve titreringen: hane, dråber, ringe, farvesky, omrøring
js/opsaetning.js    den fælles opstilling og venstre spalte, 12 færdige forsøg
js/sim_lab.js       fane 1     js/sim_kurve.js      fane 2
js/sim_fordeling.js fane 3     js/sim_ukendt.js     fane 4
js/app.js           faneskift, tidsstyring, tastatur, tegneløkke
_selvtest.html      udviklerværktøj, indgår ikke i animationen (se nedenfor)
```

Der er **ingen billedfiler**. Alle figurer er tegnet i kode i `apparat.js` på
et fast "tegnebord" på 520 × 680 enheder, som skaleres og centreres i det
lærred, der nu er. Koordinaterne øverst i filen kan læses som en tegning:
flytter man `G_TOP`, flytter bægerglassets kant sig.

Hver fane er et objekt med `tilpas()`, `opdater(dt)`, `tegn()` og `nulstil()`.
`app.js` kalder kun den aktive fane, så de tre andre koster ingenting.

## At rette i den

**Nye stoffer** tilføjes i `Kemi.STOFFER` øverst i `js/kemi.js`. Felterne er:

* `pKa` — pKs-værdierne i stigende orden for den fuldt protonerede syre
* `z` — ladningen af den helt deprotonerede form (acetat: −1, ammoniak: 0)
* `k` — hvor mange protoner formen har, *når den hældes i glasset*
  (H₃PO₄: 3, NaH₂PO₄: 2, Na₃PO₄: 0)
* `former` — navnene på formerne, fra mest til mindst protoneret. Der skal
  være præcis én mere end der er pKs-værdier, ellers vises de ikke på fane 3
* `oh` — kun for stærke baser: antal OH⁻ pr. formelenhed

Modionens ladning regnes automatisk som −(z + k), så natriumacetat får sin
Na⁺ med af sig selv. Stoffet skal have en `gruppe`, der står i listen
`GRUPPER` i `js/opsaetning.js`, ellers dukker det ikke op i vælgeren.

**Nye færdige forsøg** tilføjes i `Ops.FORSOEG` i `js/opsaetning.js`.

**Nye indikatorer** tilføjes i `Kemi.INDIKATORER`. `farver` går fra syreform
til baseform, og fjerde tal er dækkraften — phenolphthaleins syreform er
farveløs og har derfor 0.

**`_selvtest.html`** regner ca. 40 pH-værdier ud og sammenligner med tal, der
er regnet i hånden eller slået op, og skriver resultatet på skærmen med en
begrundelse for hver linje. Kør den efter ændringer i `kemi.js`. Filen bruges
ikke af animationen og kan slettes.

## Hvis den skal ind i menuen

Den er med vilje ikke linket ind endnu. Én linje i
`animationer/kemi-b-filer/samling_b3.html` er nok — lige efter b3.1:

```html
<button class="tab-btn" data-emne="b3.2"
    data-beskrivelse="Byg din egen titrering: vælg syre, base, koncentrationer og indikator, åbn hanen og følg pH. Med ækvivalenspunkter, fordelingsdiagram og ukendte prøver."
    onclick="visAnimation(this, '../superanimationer/sb3.2_titreringssimulator/index.html')"
    title="Titreringssimulator"><span class="btn-num">2</span><span class="btn-text">Titreringssimulator</span></button>
```

Bemærk `../` — samlingen skal linke ud af sin egen mappe, ligesom ved sb2.0.
Skal kapitlet også kunne vælges i feedback-boksen, tilføjes en linje i
`FEEDBACK_EMNER` i `animationer/samling_alt_b.html`:

```js
{ navn: 'B3: Syre/Base', animationer: [
    { nr: 1, navn: 'Fra Ks til pKs' }, { nr: 2, navn: 'Titreringssimulator' }
]},
```
