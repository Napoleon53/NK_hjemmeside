# sc4.11 Kalk i muslingeskaller

Superanimation om vejeanalysen fra NF-forløbet Havhaven: saltsyre opløser
kalken i knuste muslingeskaller, CO₂ forlader kolben, og den masse, kolben
taber, fortæller, hvor meget kalk der var. Åbn `index.html`. Mappen henter
kun filer inde fra sig selv.
Ingen `fetch` og ingen moduler, så den virker fra harddisken.

## Bestillingen

1. **Pointen:** den masse, kolben taber, er CO₂, og fra den regnes kalken
   i skallerne: m(CO₂) = m(før) − m(efter), så kalk og kalkindhold.
2. **Bygget fra bunden** ud fra "Øvelsesvejledning til Muslingeskaller
   2025" (NF-Kemi, 1 Havhaven). Med fra vejledningen: 20 mL 4 M saltsyre i
   en 100 mL konisk kolbe på en nulstillet vægt, pulveret lidt ad gangen,
   vent til vægten står stille, to målinger, skemaet med m(før) og m(efter),
   de tre regnetrin (m(CO₂), m(CaCO₃) = m(CO₂) · 2,27, kalkindhold i %),
   opsummeringen og diskussionen af 95-99 % (fane 3). Ud: knusningen i
   morteren (morteren står som pynt) og konklusionen.
3. **Placering:** emne 4 (mængdeberegning), fordi det er en vejeanalyse som
   c4.7 Natron: massen, der forsvinder, fører til stoffet. Syre-base er
   grunden til, at CO₂ dannes (luppen og én linje i teorien), og salte er
   kun stoffet. Omskifteren Uden mol / Med mol afgør, hvor meget
   mængdeberegning der er med (brugerens idé), så den også kan bruges i NF.
   **Naboerne:** `sc4.5` ejer mængdeberegningsskemaet og begrænsende
   mængde, `sc4.1` molarmassen, `sc7.1` syre-base-reaktionerne. Her bruges
   kun forholdet 1 : 1 og de to molarmasser, der står på tavlen.
4. **Loftet:** 3 faner. Fane 1: 2 målinger, 2 vægte, 1 kolbe, 1 vejebåd,
   1 lup. Fane 2: 3 opgaver (to målinger og én baglæns med 4 skaller) i
   to veje. Fane 3: 6 fejlkilder, 2 grupper.
5. **Layoutet:** scene plus panel som `sc5.1`.

Claude valgte selv faner, tal og placering (25. sept. 2026). Ingen knapper
til præsentationen.

9. okt. 2026 (brugerens valg): Kemichael ved katederet er taget helt ud
(han hører til i laboratoriet). Hjælpen er den gule hintknap.

### Lettere og mere brugervenlig (9. oktober 2026)

Brugeren: "Prøv at kigge den igennem, og gør den mere elevvenlig. Jeg tror
jeg synes den var for svær til et HF-niveau. Animationen må gerne være
meget brugervenlig, og sæt den så ind til temaet." Og om placeringen: den
hører ikke til i animationspanelet, men kan linkes fra bogen. Mappen har
derfor ikke længere `_inaktiv` i navnet, den står ikke i menuen, og
Kemibogens temaside om klima linker til den.

Det, der blev lavet om (Claudes udformning; brugeren har ikke set den endnu):

* **Kortet står midt i scenen** på fane 1 og 3, ikke i panelet (eleverne
  klikker, før de læser; samme mønster som `sc7.5`). Gættet er et stort gult
  kort med tre store svarknapper, og det blinker, hvis eleven klikker på
  forsøget først. Bagefter viser det samme kort det næste skridt med stor
  skrift, hint og fejl i linjen under, og til sidst forklaringen og knappen
  videre. Der er ingen tekstlinje nederst i scenen.
* **Vægten aflæses med et klik** på vægten, på det gule skilt ved den eller
  på knappen Aflæs vægten i panelet (brugerens ønske fra `sc4.9`: at taste et
  tal af fra et display lærer ikke noget). Felterne i skemaet er stadig åbne.
* **De fire skridt** i en måling står øverst på kortet (Aflæs m(før), Pulver
  i kolben, Vent, Aflæs m(efter)), og det, der skal klikkes på, har en gul
  ring og et skilt. Under kolben står, om vægten falder eller står stille.
* **Et klik i den forkerte rækkefølge** udføres ikke, men får én linje med
  forklaringen (`D.FOERST`). Før gik pulveret i kolben, og eleven måtte
  starte forfra, fordi m(før) var væk.
* **Luppen** kommer først frem, når det første pulver er i kolben, og Start
  forfra først, når der er noget at starte forfra på.
* **Uden mol er standard.** Her vælger eleven formlen blandt tre i stedet
  for at skrive den, tallene bliver sat ind, og der skal kun regnes. Brøker
  står med rigtig brøkstreg. Den opgave, der går baglæns, er kun med i Med
  mol. Med mol er som før: eleven skriver selv formlen.
* **Fejlkilderne** kommer i rækkefølge fra den letteste til den sværeste, og
  kalkindholdet står under hver kolbe, når de to forsøg er færdige.
* **Omskifteren** Uden mol / Med mol vises kun på fanen Beregningen.

**Hint og svar.** Den gule knap på kortet er hjælpen: Giv hint skriver
hintet i linjen ved siden af knappen, og knappen bliver til Vis svaret (kun
et omrids, så den ikke frister), der skriver svaret i samme linje. Efter et
forkert svar lyser den gule knap stille op. Under et gæt er knappen kun et
lille omrids i kortets hjørne, så det gule kort er det eneste fyldte gule.

Det er en superanimation, ikke en superlab-animation: kolben står klar,
der er ingen flasker, uheld eller oprydning. Eleven gør det, der skal
læres: aflæser vægtene, venter, til vægten står stille, og regner.

## Hvad den viser

| # | Fane | Hvad man gør | Pointe |
|---|------|--------------|--------|
| 1 | Forsøget | gætter, aflæser m(før) med et klik, klikker pulveret over i kolben, venter og aflæser m(efter) | vægten falder, fordi CO₂ forlader kolben |
| 2 | Beregningen | vælger formlen blandt tre og regner tallet ud (uden mol), eller skriver formlen og tallet (med mol) | fra massen af CO₂ til kalkindholdet |
| 3 | Fejlkilder | gætter, om gruppe B får et højere, lavere eller det samme kalkindhold, og ser begge forsøg | vægten ser kun det, der forlader kolben |

**Forsøget.** To vægte på bordet. På den ene står vejebåden med knust
hjertemusling (0,97-1,07 g), på den anden kolben med 20 mL 4 M saltsyre, og
den vægt er sat til 0,00 g. Første måling starter med gættet på det gule
kort: hvad viser vægten under kolben, når det er holdt op med at bruse? Så
følger de fire skridt. Eleven klikker på vægten under vejebåden, og m(før)
skrives i skemaet. Et klik på pulveret sender en spatelfuld (0,26 g) over i
kolben; spatlen kan også trækkes. Det bruser, pulveret gør syren uklar, pust
af CO₂ stiger op af halsen, og luppen viser bunden af kolben: to H₃O⁺
svømmer hen til en CO₃²⁻ i kornet, den bliver til CO₂, der stiger op og ud,
og Ca²⁺ slipper fri. Mens det bruser, beder kortet eleven vente lidt; når
der er ro (`D.ROLIG`), kommer skiltet "Klik: en spatelfuld mere". m(efter)
aflæses med et klik på vægten under kolben, når den står stille; et klik,
mens det bruser, giver forklaringen om, at kalkindholdet så bliver for
lavt. Kommer tre spatelfulde eller flere i på én gang, bruser det så
voldsomt, at det sprøjter. Kortet siger det med det samme, og resultatet
kan ende over 100 %. Målingerne huskes i browseren og bruges på fane 2. En
målt og gemt måling vises færdig; Start forfra måler igen.

**Beregningen.** Uden mol er der to opgaver: måling 1 (formlen vælges
blandt tre i hvert trin) og måling 2 (formlerne står der, som i
vejledningen; kun tallene). Hvert trin har et spørgsmål i almindelige ord
("Hvor meget CO₂ forsvandt fra kolben?"). Når formlen er valgt, står
tallene sat ind, og eleven regner resultatet ud og skriver det. Med mol
kommer en tredje opgave, "Hvor meget falder vægten?", der går baglæns fra
kalkindholdet (østers, blåmusling, æggeskal og sneglehus; Nye tal skifter
skal), og eleven skriver selv formlerne. Har eleven ikke målt selv, bruges
et eksempel (1,02 → 0,59 g og 0,98 → 0,57 g), og kortet siger det.
Omskifteren i toplinjen vælger vejen:

* **Uden mol:** m(CO₂) = m(før) − m(efter), m(CaCO₃) = m(CO₂) · 2,27 og
  kalkindhold = m(CaCO₃) / m(før) · 100 %.
* **Med mol:** m(CO₂), n(CO₂) = m / M, n(CaCO₃) = n(CO₂), m(CaCO₃) = n · M
  og kalkindholdet. Molarmasserne står på tavlen. Til sidst forklares
  genvejen: 100,09 / 44,01 = 2,27. Baglæns i fire trin.

Tavlen viser reaktionen, opgavens tal og beregningerne, og skriften passer
sig til pladsen. Under tavlen udfyldes kæden: CO₂-skyen, kalken i en
vejebåd og søjlen med prøven, hvor kalken er den hvide del. Opsummeringen i
panelet er vejledningens skema. Kalkindhold under 93 % og over 100 % får
en henvisning til fane 3.

**Fejlkilder.** Gruppe A følger vejledningen. Gruppe B gør én ting
anderledes, fra den letteste at gennemskue til den sværeste: aflæser, mens
det bruser (lavere), alt på én gang (højere, over 100 %), fugtigt pulver
(lavere), grove stykker, men venter (det samme, men længere tid), 40 mL syre
(det samme) og spilder 0,10 g på bordet, men skriver m(før) = 1,00 g
(højere). Eleven gætter først på det gule kort. Så kører begge forsøg i den
samme model som på fane 1, fire gange hurtigere, og uret viser minutter.
Kalkindholdet står under hver kolbe, og tabellen i panelet viser m(før),
m(efter), m(CO₂) og kalkindholdet for begge grupper, regnet med 2,27.
Forklaringen på kortet tager fat i det gæt, eleven valgte. Et forkert gæt
løser opgaven uden stjerne. Kør igen gentager.

**Omskifteren** huskes i browseren og vises kun på fanen Beregningen. Et
link kan vælge den og fanen: `index.html#mol` (med mol), `index.html#nf`,
`index.html#beregning-mol`, `index.html#fejl`. Uden link og hukommelse står
den på Uden mol.

**Påskeæg:** hjertemuslingen ved morteren. Et klik giver en tør
bemærkning på kortet om, hvor længe en hel skal er om at reagere.
Morteren svarer også.

Genveje: <kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> faner · <kbd>M</kbd> uden
eller med mol (på fanen Beregningen) · <kbd>T</kbd> teori · <kbd>H</kbd>
rundvisning · <kbd>R</kbd> start forfra, nye
tal eller kør igen · <kbd>Enter</kbd> tjek feltet eller næste opgave ·
<kbd>Esc</kbd> luk.

## Filer

```
index.html          markup for de tre faner, omskifteren, teorien og rundvisningen
css/stil.css        alt udseende (kopi af sc5.1; nyt nederst: omskifteren, skemaerne, kortet i scenen og formelknapperne). NB: decimaltal med PUNKTUM i CSS
sprites/            muslingeskal og morter (nye), kolben (som sc7.4), vægten og vejebåden
                    (som sc4.5), spatlen og luppen (som sc2.1)
js/kerne.js         NK-navnerum, hævet og sænket skrift, hukommelse, lærred, tal (som sc5.1)
js/data.js          atommasserne, skallen, syren, prøverne, kortets tekster, regnevejene, formelvalgene, fejlkilderne og replikkerne
js/kemi.js          kolben (reaktionen, sprøjt, hvad vægten viser), facit og de to gruppers forløb på fane 3
js/tjek.js          formlen og tallet i hvert regnetrin, de typiske fejl og de pæne beregninger
js/sprites.js       indlæser SVG-filerne; MAAL har koordinaterne i dem
js/tegning.js       rummet, bordet, tavlen, vægten, vejebåden, kolben med bobler, skum, pust og dråber,
                    morteren, muslingen, luppen med ionerne, CO₂-skyen, søjlen og pilene, den gule ring
                    og skiltet ved det, der skal klikkes på
js/fane.js          det, fanerne deler: opgavelisten, kortet (i scenen på fane 1 og 3, i panelet på fane 2),
                    gættet og blinket, den gule knap, linjen med hint, fejl og ros, og musen
js/regning.js       regnetrinene i kortet (formlen valgt eller skrevet, og tallet) og tavlen på fane 2
js/sim_forsoeg.js   fane 1 og målingerne, som fane 2 bruger
js/sim_beregning.js fane 2
js/sim_fejl.js      fane 3
js/rundvisning.js   rundvisningen bag ? (koden er sc1.1's)
js/app.js           faneskift, omskifteren, teorien, genveje, tegneløkke
_selvtest.html      udviklerværktøj, indgår ikke i animationen
_sprites.html       udviklerværktøj: viser tegningerne alene
```

## At rette i den

**Skallen** (`D.SKAL`: 96 % kalk), **syren** (`D.SYRE`) og **prøverne**
(`D.PROEVER`, valgt så vægten aldrig ender midt mellem to hundrededele;
selvtesten holder øje) står i `js/data.js`. **Hastigheden** er `D.K_PULVER`,
`D.K_GROV` og `D.K_MIN`, **sprøjtet** `D.SPROEJT`, og `D.ROLIG` er den
hastighed, kolben skal ned under, før kortet beder om mere pulver.
**Kortets tekster på fane 1** er `D.FORSOEG` (gættet og forklaringen),
`D.SKRIDT`, `D.LINJE` (det næste skridt), `D.SKILT`, `D.HINT`, `D.SVAR` og
`D.FOERST` (klik i den forkerte rækkefølge). Et spørgsmål må højst være 70
tegn, et svar 34 og et skridt 90, og hvert skridt skal selv nævne vejebåden
eller kolben; selvtesten tæller. **Regnevejene** er `D.VEJE`,
**regnetrinene** `D.TRIN` (navn, spørgsmål, venstreside, enhed, formel og
hintet til formlen), **de forkerte formler uden mol** `D.FORMELVALG`,
**opgaverne på fane 2** `D.BEREGNING` (`kunMol` skjuler en opgave uden mol)
og **fejlkilderne** `D.FEJL` (tekst, hvad B gør anderledes, det rigtige
svar, hint, forklaring og forklaringen til de to forkerte gæt).
**Replikkerne** står i `D.INTRO`, `D.FAERDIG`, `D.ROS`, `D.MUSLING` og
`D.MORTER`. Pladsen til kortet øverst i scenen er `kortZone()` i
`js/fane.js`; bliver kortet højere, skal den følge med.

**Formlernes regler** (hvad trinnet finder, hvad man kender, de typiske
fejl) står i `F` i `js/tjek.js`, **talfejlene** i `kandidater`. Formlen
tjekkes ved at regne den ud med prøvetal, hvor alle sammenhængene passer,
så m(før) − m(efter), mfør-mefter, m1 − m2 og m(musling, før) −
m(musling, efter) er det samme.

**`_selvtest.html`** åbner index.html i en iframe og tjekker molarmasserne
og 2,27, at alle prøver ender på den rigtige visning uden sprøjt, at det
sprøjter, når det hele kommer i på én gang, at de seks fejlkilder går den
rigtige vej, over 30 formler og fejl, facit i alle opgaver, begge veje og alle
tal, de pæne beregninger, sproget og teksternes længde, fane 1 med musen
(gættet og blinket, klik i den forkerte rækkefølge, skiltet, spatlen, m(efter)
for tidligt, hint og svar hele vejen, sprøjt), fane 2 uden mol (formlen valgt
blandt tre) og med mol, fane 3 med alle seks, hjælpen fra den gule knap og
layoutet fra 520 × 380 til 1500 × 900, hvor kortet i scenen ikke må dække
forsøget fra 1100 × 700 og op. Den kræver en lokal server eller Chrome med
`--allow-file-access-from-files` og lægger elevens gemte fremskridt tilbage
bagefter. Sidst kørt 9. oktober 2026: ALT OK (155 påstande).

## Forenklinger

* Skallerne er 96 % CaCO₃ (hjertemusling; typisk 95-99 %). Resten er
  protein og vand, der hverken vejer mere eller mindre undervejs og ligger
  som brune flager på bunden til sidst. Skallerne på fane 2 er sat til
  ca.-værdier (østers 97 %, blåmusling 96 %, æggeskal 95 %, sneglehus 98 %).
* Alt CO₂ forlader kolben med det samme. I virkeligheden bliver lidt
  opløst i syren, så målte kalkindhold ofte ligger lidt lavt.
* Reaktionen er af første orden i den kalk, der ligger i kolben, med et
  lille fast bidrag, så de sidste korn bliver færdige. Tiden er trykket
  sammen: en spatelfuld er færdig på ca. 10 s. Uret på fane 3 viser
  minutter (1 s i modellen = 6 s).
* Det sprøjter, når der dannes mere end 0,07 g CO₂ pr. sekund; så
  forsvinder 0,75 g væske pr. gram CO₂ over grænsen.
* Syren er i overskud (0,080 mol HCl mod ca. 0,02 mol til 1 g skal) og
  slipper aldrig op. Antallet af H₃O⁺ i luppen følger syren, der er
  tilbage.
* Luppen er et billede, ikke et antal: én gitterplads er 0,028 g kalk, og
  CO₃²⁻ og CO₂ er hver én kugle.
* Atommasserne har to decimaler (som sc4.1): M(CaCO₃) = 100,09 g/mol og
  M(CO₂) = 44,01 g/mol. Vejledningens 2,27 er 100,09 / 44,01 afrundet.
* Masser, der er aflæst, har to decimaler; regnede masser, stofmængder og
  kalkindhold tre betydende cifre. Et tal er rigtigt, når det højst er
  1 % fra facit, så både 95,7 % (med 2,27) og 95,9 % (med mol) godkendes.

## I menuen

Ikke i menuen, og det er meningen (brugeren 9. oktober 2026: den hører
ikke helt til i animationspanelet, men kan linkes fra bogen). Kemibogens
temaside om klima (`NK_Undervisning/Kemibogen/temaer/klima.qmd`, afsnittet
"Havet bliver surere") linker til
`https://kemiformler.dk/animationer/superanimationer/sc4.11_kalk_i_muslingeskaller/index.html`.
Omdøbes mappen, skal linket i bogen rettes.

Skal den alligevel i menuen en dag:

* `animationer/kemi-c-filer/samling_c4.html`: en ny knap efter c4.10 med
  `data-emne="c4.11"`, der peger på
  `../superanimationer/sc4.11_kalk_i_muslingeskaller/index.html` (navn
  "Forsøg: Kalk i muslingeskaller").
* Navnet i `FEEDBACK_EMNER` i `animationer/samling_alt.html` og kolonnen
  "I menuen" i superanimationernes README.

Den afløser ingen gammel animation, så intet skal i `arkiv/`.
