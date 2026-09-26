# sc6.6 Byg et fedtstof

Superanimation om fedtstoffer: dobbeltbindinger giver knæk i fedtsyrerne, så
molekylerne ikke kan pakke tæt, og derfor er umættet fedt flydende og mættet
fedt fast. Åbn `index.html`. Mappen henter kun filer inde fra sig selv,
bortset fra Kemichael (`../../v2/kemichael/kemichael.js`). Ingen `fetch` og
ingen moduler, så den virker fra harddisken.

## Bestillingen

1. **Pointen:** dobbeltbindinger giver knæk i fedtsyrerne. Så kan
   fedtmolekylerne ikke pakke tæt, og derfor er umættet fedt flydende og
   mættet fedt fast.
2. **Afløser** `kemi-c-filer/c6.6_typer_fedtstof.html` (Fedt-Fabrikken). Med
   fra den gamle: at man trækker fedtsyrer hen på glycerols OH-grupper, at
   der dannes vand ved hver binding, de fire fedtsyrer (stearin-, olie-,
   linol- og linolensyre) med hver sin farve og sine knæk, kunderne med
   ordrer og fri leg bagefter, esterbindingen med eksemplet ethansyre +
   methanol (nu i teorien).
3. **Naboerne:** `c6.7` ejer bromvand og additionsreaktioner (også
   hærdning), `c6.9` fedt i chips, `sc6.1` kogepunkt og berøring for
   alkaner, `sc6.2` zigzagformler og `c6.5` polaritet. Her bruges
   zigzagformlen kun til at vise fedtsyrerne.
4. **Loftet:** 2 faner, 4 fedtsyrer, 20 mulige fedtstoffer, 5 fedtstoffer fra
   køkkenet plus det, eleven har bygget, 4 steder i køkkenet og 10 molekyler
   i zoomvinduet.
5. **Layoutet:** scene plus panel, som i de andre superanimationer.

Brugeren valgte to faner (Fabrikken og Køleskabet, ikke en tredje med
varedeklarationer) og det harske smør som påskeæg (24. sept. 2026).

## Hvad den viser

| # | Fane | Hvad man gør | Pointe |
|---|------|--------------|--------|
| 1 | Fabrikken | trækker tre fedtsyrer hen på glycerol og leverer fem ordrer (fast i solen, flydende i køleskabet osv.) | rette kæder giver et højt smeltepunkt, knæk et lavt |
| 2 | Køleskabet | sætter fedtstoffer i fryseren, køleskabet, på bordet og i solen, gætter først og ser molekylerne | rette kæder ligger stille i rækker, kæder med knæk kan ikke |

**Fabrikken.** Glycerol står på arbejdsbordet med tre OH-grupper (CH₂, CH,
CH₂ skrevet ud, fedtsyrerne som zigzagformler med 18 C-atomer). Nederst
ligger fire fliser med fedtsyrerne. En flise trækkes hen på en OH-gruppe (et
klik sætter den på den første ledige), og fedtsyrens OH og glycerolens H
bliver til et vandmolekyle, der svæver væk. Et klik på en kæde tager den af
igen (vand spalter bindingen), og en fedtsyre, der slippes på en optaget
plads, bytter den ud. Panelet viser kunden og kortet "Dit fedtstof":
smeltepunktet og om fedtet er fast, delvist fast eller flydende i fryseren
(−18 °C), køleskabet (5 °C), på køkkenbordet (20 °C) og i solen (35 °C).
Rækkerne, kunden stiller krav til, bliver grønne eller røde. Ordren tjekkes,
så snart der sidder tre fedtsyrer; et forkert fedt giver et råd, der passer
til fejlen ("Brug flere rette kæder"). Knappen: Giv hint, Vis svaret (bygger
løsningen), Næste ordre. Under kortene står knappen Start forfra (samme som
<kbd>R</kbd>): ordre 1 igen og en tom glycerol. De fem kunder: Fuglehuset (fast i solen),
Salatbaren (flydende i køleskabet), Restauranten (flydende på bordet, stivner
i køleskabet), Chokoladefabrikken (fast på bordet, smelter i solen) og
Apoteket (omega-3, flydende i fryseren). Derefter fri leg, og knappen går
videre til køkkenet. Det byggede fedt
står i glasset til højre og følger med til fane 2.

**Køleskabet.** Et køkken med køleskab og fryser til venstre, køkkenbordet
og et vindue med sol og vindueskarm. På bordet står glas med smør,
kakaosmør, olivenolie, solsikkeolie, hørfrøolie og elevens eget fedt.
Et glas trækkes hen et andet sted (to pladser i fryseren, køleskabet og
vindueskarmen; er der fuldt, bytter glassene). Fedtet stivner eller smelter
i løbet af et sekund: flydende fedt holder overfladen vandret, når glasset
vippes, fast fedt følger glasset, og delvist fast fedt er uklart med
krystaller i bunden. Zoomvinduet viser molekylerne i det valgte glas: hver
kæde i fedtsyrens farve, de faste i rækker nedefra (glycerol udad, kæderne
ind mod midten), de flydende i bevægelse over dem. Panelet har opgaven og
varedeklarationen (mættede, enkelt- og flerumættede fedtsyrer i procent).
Seks opgaver: gæt fast, delvist fast eller flydende, så flytter glasset
derhen, og svaret forklares. Sætter eleven selv glasset det rigtige sted,
tæller det også. Til sidst: hvorfor er smør fast i køleskabet, når
solsikkeolie er flydende? De forkerte svar er de typiske fejl (smør kommer
fra dyr, smørrets molekyler er tungere, bindingerne inde i olien er
svagere). Bagefter går knappen videre til fabrikken ("Byg dit eget fedt"),
så den samme runde ikke starter igen; <kbd>R</kbd> starter forfra.

**Det harske smør** (påskeæg, fane 2). Står smørret 12 sekunder i solen, går
der tre uger: vand spalter noget af fedtet, der dannes smørsyre (grønne
stanklinjer, frie fedtsyrer og smørsyre i zoomvinduet), og Kemichael kommer:
"Smørsyre. Nu lugter køkkenet af surströmming." Han sætter nyt smør på bordet
og går. Det tæller i hans regnskab over uheld. Kemichael antyder det i
præsentationen ("Lad ikke smørret stå i solen. Tro mig.").

**Kemichael** præsenterer hver fane, når eleven trykker Start præsentation
(reglen i `../README.md`): fabrikken tre replikker (han peger på panelet og
glycerol), køkkenet tre (han peger på køleskabet og zoomvinduet). Han går
kun ved den store knap, to klik på ham eller Esc. <kbd>K</kbd> viser
præsentationen igen. Ellers roser han efter fem ordrer ("Fem ordrer
leveret. Det glider.") og efter hvorfor ("Du har styr på køkkenet. Mere end
jeg har."), men kun første gang i browseren. Kaffekoppen på fane 1 er det
fælles påskeæg.

Direkte link: `index.html#koele`.

Genveje: <kbd>1</kbd> <kbd>2</kbd> faner · <kbd>T</kbd> teori · <kbd>H</kbd>
rundvisning · <kbd>K</kbd> Kemichaels præsentation · <kbd>P</kbd> pause i
zoomvinduet · <kbd>R</kbd> forfra · <kbd>Enter</kbd> næste · <kbd>Esc</kbd>
luk eller send Kemichael ud.

### Det nye i forhold til den gamle animation

* **Rigtig kemi i smeltepunkterne.** Den gamle lod antallet af
  dobbeltbindinger (0-9) vælge et produkt og kaldte fx 4-5 dobbeltbindinger
  for olivenolie; olivenolie har ca. 3 pr. molekyle. Nu har hvert fedtstof et
  smeltepunkt (målt eller regnet, se forenklingerne), og det afgør, hvor det
  er fast.
* **Kunderne stiller krav om steder**, ikke om antal dobbeltbindinger:
  fast i solen, flydende i køleskabet. Så hænger fane 1 sammen med fane 2.
* **Rigtige zigzagformler.** Den gamle tegnede 12 led med knæk, der skiftede
  retning. Nu har kæderne 18 C-atomer, 120° mellem bindingerne og en cis-
  dobbeltbinding med begge naboer på samme side, så kæden bøjer 30° pr.
  dobbeltbinding.
* **Vandet kommer fra de rigtige atomer**: syrens OH og alkoholens H. Og
  bindingen kan spaltes igen.
* **Fane 2 er ny**: molekylerne i fast og flydende fedt, rigtige fedtstoffer
  fra køkkenet, varedeklarationen og gættene.
* Den gamle modal med lange forklaringer er væk; beskeden står i panelet.

## Filer

```
index.html          markup for de to faner, teorien og rundvisningen
css/stil.css        alt udseende (grundlaget er sc6.1's). NB: decimaltal med PUNKTUM i CSS
sprites/            køleskabet med fryseren, vinduet med solen og glasset
js/kerne.js         NK-navnerum, hævet og sænket skrift, hukommelse, lærred (som sc6.1)
js/data.js          fedtsyrerne, fedtstofferne, stederne, ordrerne, opgaverne og replikkerne
js/fedt.js          smeltepunkterne, kæderne og NK.Proeve (molekylerne i zoomvinduet)
js/sprites.js       indlæser SVG-filerne; MAAL har koordinaterne i dem
js/tegning.js       rummet, formlerne, fliserne, glasset, køleskabet, vinduet,
                    skiltene og zoomvinduet
js/praesentation.js tilbuddet om Kemichaels præsentation (samme fil som i sc1.2)
js/sim_fabrik.js    fane 1
js/sim_koele.js     fane 2
js/laerer.js        Kemichael på begge faner og det harske smør
js/rundvisning.js   rundvisningen bag ? (koden er sc1.1's)
js/app.js           faneskift, teorien, genveje, tegneløkke
_selvtest.html      udviklerværktøj, indgår ikke i animationen
```

## At rette i den

**Fedtsyrerne** står i `D.SYRER` øverst i `js/data.js`: navn, antal
dobbeltbindinger, hvor cis-dobbeltbindingerne sidder, smeltepunktet for det
rene fedtstof og farven. **Stederne** i `D.STEDER` (temperatur og antal
pladser). **Fedtstofferne fra køkkenet** i `D.FEDT`: fedtsyrerne i procent og
den faste andel ved forskellige temperaturer (punkter, der regnes lineært
imellem). **Ordrerne** i `D.ORDRER` (krav pr. sted: `fast`, `flydende`,
`ikkeFast`, `ikkeFlydende`), **opgaverne** i `D.KOELE_OPGAVER` og
`D.KOELE_HVORFOR`, **replikkerne** nederst. Grænserne mellem fast, delvist
fast og flydende er `D.FAST_GRAENSE` (35 %) og `D.DELVIST_GRAENSE` (5 %).
Tiden i solen før smørret bliver harskt er `D.HARSK_TID`.

**Modellen** står i `js/fedt.js`: `F.smp` (smeltepunktet), `F.kaede`
(zigzagformlen) og `NK.Proeve` (zoomvinduet, 36 × 34 enheder, én enhed er
en C-C-binding).

**`_selvtest.html`** åbner index.html i en iframe og tjekker de målte
smeltepunkter, at et knæk mere aldrig giver et højere smeltepunkt, kædernes
længder, vinkler og bøjning, at alle fem ordrer kan løses, at køkkenets
fedtstoffer er faste og flydende de rigtige steder og passer med opgavernes
svar, at zoomvinduet har det rigtige antal faste molekyler (dem med det
højeste smeltepunkt) og holder de flydende inde, at begge faner kan
gennemføres (med musen: klik og træk på fliser, byt, tag af, træk et glas i
køleskabet), at det harske smør og Kemichael virker, at sproget holder
reglerne, og at layoutet holder fra 520 × 380 til 1500 × 900. Den kræver en
lokal server eller Chrome med `--allow-file-access-from-files` og lægger
elevens gemte fremskridt tilbage bagefter. Sidst kørt 24. september 2026: ALT
OK (99 påstande).

## Forenklinger

* **Alle fedtsyrer har 18 C-atomer.** Stearinsyre står for alle de mættede
  (i smør og kakaosmør også palmitinsyre og kortere kæder), oliesyre for de
  enkeltumættede. Kædelængden er holdt ude, så det kun er knækkene, der
  varierer. Kokosfedt er udeladt af samme grund: det er mættet, men smelter
  ved ca. 24 °C, fordi kæderne er korte.
* **Smeltepunkterne.** Fem er målte (den mest stabile krystalform):
  tristearin 73 °C, triolein 5 °C, trilinolein −13 °C, trilinolenin −24 °C
  (oversigten "Triglycerides as Novel Phase-Change Materials", PMC7730147) og
  SOS 43 °C (PMC7698300). De 15 andre er regnet med en lille model og står
  med "ca.": de umættede kæder giver gennemsnittet af deres rene
  smeltepunkter (mU), og de rette kæder løfter mod 73 °C:
  smp = mU + (73 − mU) · (antal rette / 3)^p, hvor p = 1,44 er valgt, så SOS
  giver 43 °C. Én kæde med knæk sænker altså smeltepunktet meget, som
  målingerne viser. Rækkefølgen af fedtsyrerne på glycerol tæller ikke med.
* **Et rent fedtstof** er fast under smeltepunktet og flydende over; ved
  præcis smeltepunktet er det delvist fast (triolein i køleskabet ved 5 °C).
* **Køkkenets fedtstoffer** er blandinger. Fedtsyrerne i procent er typiske
  værdier som på en varedeklaration. Den faste andel ved en temperatur er
  typiske, afrundede værdier (smør ca. 55 % fast ved 5 °C og 18 % ved 20 °C,
  kakaosmør smelter ved ca. 35 °C, olivenolie bliver uklar i køleskabet,
  solsikkeolie i fryseren, hørfrøolie er flydende ved −18 °C). Over 35 % fast
  kaldes det fast, over 5 % delvist fast.
* **Zoomvinduet** er fladt (2D) med 10 molekyler. I en blanding er det de
  molekyler med det højeste smeltepunkt i modellen, der er faste. De faste
  ligger i to søjler som et lag i en krystal; kæderne bøjer alle samme vej,
  og de mest knækkede ligger nederst. Er der ikke plads, trykkes rækkerne lidt
  sammen. De flydende holdes nogenlunde vandrette, så de kan være der.
* **Knækket** er tegnet som 30° pr. cis-dobbeltbinding (135° ved de to
  C-atomer i dobbeltbindingen, ellers 120°), så kæder med flere
  dobbeltbindinger krummer. I lærebøger tegnes knækket ofte som 60°.
* **Glycerol** er skrevet ud (CH₂, CH, CH₂), fedtsyrerne som zigzagformler.
* **Det harske smør** er hydrolyse sat tre uger frem. Smørsyren kommer fra
  de korte kæder i rigtigt smør, som ellers ikke er med i modellen.

## I menuen

Ja, siden 24. september 2026. Fra 26. sept. 2026 er den c6.4 (knappen
`data-emne="c6.4"`, nr. 4 i `animationer/kemi-c-filer/samling_c6.html` og i
`FEEDBACK_EMNER`), fordi C6 blev omnummereret uden huller; mappen hedder stadig
sc6.6. Et gammelt link med `?emne=c6.6` åbner nu Substitution i benzin. Den
gamle ligger i `kemi-c-filer/arkiv/c6.6_typer_fedtstof_oldversion.html`.
