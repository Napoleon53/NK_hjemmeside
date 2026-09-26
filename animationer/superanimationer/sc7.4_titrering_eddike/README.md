# sc7.4 Titrering af eddike

Superanimation om titreringen af eddike: buretten tæller eddikesyren. Åbn
`index.html`. Mappen henter kun filer inde fra sig selv, bortset fra Kemichael
(`../../v2/kemichael/kemichael.js`). Ingen `fetch` og ingen moduler, så den
virker fra harddisken.

Det er en superanimation, ikke en superlab-animation. Opstillingen er en model,
eleven betjener hanen på, og faner, opgaver og beregninger belyser den samme
idé. Kolben står klar, der er ingen flasker at hælde fra, ingen uheld og
oprydning og intet forløb trin for trin. Brugerens ønske (25. sept. 2026): 7.4
skal stå skarpere, og formatet fra superlab-animationerne skal undgås, fordi det
rigtige virtuelle laboratorium bygges for sig.

## Bestillingen

1. **Pointen:** ved omslaget har buretten tilsat lige så mange mol NaOH, som der
   var eddikesyre i prøven, så forbruget tæller syren, og masseprocenten følger
   af n = c · V, 1 : 1, m = n · M og m% = m / m(prøve) · 100 %.
2. **Afløser** `kemi-c-filer/c7.4_eksperiment_titrering_eddikesyre.html`. Med fra
   den gamle: 2,00 g eddike, 0,100 M NaOH, M = 60,05 g/mol, en eddike med en
   tilfældig masseprocent mellem 4,0 og 5,5 %, buretten med hane, luppen på
   menisken (aflæs bunden), phenolphthaleins omslag, titreringskurven, der
   tegnes undervejs, med datatabellen til Excel, beregningen i trin med hints og
   teorien om vandet og indikatoren (nu bag knappen Teori). Ud: knapperne i fast
   rækkefølge (afvej, vand, indikator, fyld buretten), beregningen i en pop-up
   og genstart ved at genindlæse siden.
3. **Naboerne:** `c7.1` ejer syre-base-reaktionerne, `c7.2` pH-skalaen, `c7.3`
   pH-beregningerne med log, og `sb3.2_titreringssimulator` (B-niveau) ejer
   titrerkurverne i dybden (halvtitrerpunkt, pKs, indikatorvalg). Her er kurven
   et billede af springet ved omslaget og analyseres ikke. `c4.x` ejer
   stofmængde og molarmasse; de bruges her uden at blive forklaret igen.
4. **Loftet:** 3 faner. Fane 1: 1 burette, 1 kolbe, 1 lup med 8 figurer
   (1 figur = 1/8 af syren), 1 kurve. Fane 2: 4 regnetrin og 1 tavle. Fane 3:
   2 opstillinger (A og B) og 6 situationer.
5. **Layoutet:** scene plus panel, som `sc7.2`. Panelet har opgavekortet med én
   knap (Giv hint, Vis svaret, videre).

## Hvad den viser

| # | Fane | Hvad man gør | Pointe |
|---|------|--------------|--------|
| 1 | Titreringen | åbner hanen, drypper til sidst, lukker ved omslaget og aflæser buretten | omslaget kommer, når den sidste eddikesyre har fået sin OH⁻ |
| 2 | Beregningen | skriver formlen og regner tallet i fire trin fra forbruget til masseprocenten | n(NaOH) = n(CH₃COOH), og resten er regning |
| 3 | To kolber | gætter, hvad der sker med antallet af mL NaOH eller masseprocenten, når én ting er ændret | kun stofmængden af syre og koncentrationen af NaOH ændrer forbruget |

**Titreringen.** Kolben står klar på magnetomrøreren med 2,00 g eddike, 20 mL
vand og phenolphthalein, og buretten er fyldt med 0,100 M NaOH til 0,00 mL.
Eleven åbner hanen med skyderen ved siden af den (lukket, dryp, løb); et klik på
hanen åbner og lukker, og knappen 1 dråbe giver én dråbe. NaOH løber i
dråber på 0,05 mL. Hvor dråben rammer, kommer en lyserød sky, og tæt på omslaget
bliver skyerne længere. Luppen viser syren som 8 figurer: hver gang 1/8 af
ækvivalensrumfanget er løbet ned, kommer en OH⁻ og en Na⁺ ind, og OH⁻ tager en
H⁺ fra en CH₃COOH. Når den sidste figur er brugt, bliver kolben lyserød. Så
kommer feltet til aflæsningen, og eleven aflæser buretten i luppen i panelet
(bunden af menisken, 0,1 mL mellem stregerne). Kurven over pH tegnes undervejs,
og knappen Tabel viser målingerne hver 0,25, 0,5 eller 1 mL til Excel. Går
eleven for langt, bliver kolben mørk lyserød, og beskeden siger, at forbruget er
for stort; det er ikke en blokering, og resultatet på fane 2 viser følgen.

**Beregningen.** Tavlen viser data, reaktionen og de fire linjer. Eleven skriver
selv formlen i hvert trin og derefter tallet: n(NaOH), n(CH₃COOH), m(CH₃COOH) og
m% (brugerens ønske, 25. sept. 2026). Formlen kan skrives på mange måder
(`c · V`, `n = c*V`, `n(NaOH) = c(NaOH) · V(NaOH)`, `m(syre)/m(prøve)*100`), og
en omskrevet formel som `n = m / M` godkendes med den isolerede ved siden af.
Hintet til formlen giver ikke formlen, men siger, hvad man kender. Tavlen viser
først kun venstresiden, så formlen, når eleven har skrevet den, og til sidst den
pæne beregning (fx `m(CH₃COOH) = n · M = 1,415 ·
10⁻³ mol · 60,05 g/mol = 0,08497 g`), og til sidst viser en bjælke, hvor lidt af
de 2,00 g der er eddikesyre. Er målingen elevens egen fra fane 1, sammenlignes
resultatet med eddikens rigtige masseprocent, og en overtitrering forklares.
Ny opgave giver en klassekammerats måling med en anden prøvemasse og en anden
koncentration.

**To kolber.** To opstillinger, A som på fane 1 og B med én ting ændret. Seks
situationer: 60 mL vand (lige så mange mL NaOH), 1,00 g eddike (færre mL), og
masseprocenten for den (den samme), 0,200 M NaOH (færre mL), en burette, der var
våd indvendig (masseprocenten for høj), og spildt eddike (for lav). Spørgsmålene
spørger om mL NaOH, fordi det er det, buretten viser, og teksterne er skrevet
konkret efter brugerens ønske om mindre indforstået sprog. Eleven gætter, og så
titreres begge kolber til omslaget. Tabellen i panelet viser mL NaOH og
masseprocent for A og B, og et forkert gæt får en forklaring, der passer til
netop det svar. Til sidst står antallet af rigtige gæt i første forsøg.

**Kemichael** præsenterer hver fane, når eleven trykker Start præsentation
(reglen i `../README.md`), tre replikker pr. fane. Han roser første gang en
titrering er præcis, første gang en beregning er færdig og efter den sjette
situation. Han bemærker det, når kolben er langt forbi omslaget ("Det er
pink."), og når buretten er løbet tom. Påskeæg: et resultat, der rammer eddikens
masseprocent på hundrededelen ("På hundrededelen. Det har jeg aldrig ramt."), og
glimtet om hans første titrering (140 %), når elevens resultat er langt for højt.
Kaffekoppen er det fælles påskeæg.

Direkte links: `index.html#beregning` og `index.html#kolber` (også `#forbrug`).

Genveje: <kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> faner · <kbd>T</kbd> teori ·
<kbd>H</kbd> rundvisning · <kbd>K</kbd> Kemichaels præsentation ·
<kbd>R</kbd> ny prøve eller forfra · <kbd>Enter</kbd> videre ·
<kbd>mellemrum</kbd> åbn og luk hanen · <kbd>D</kbd> én dråbe ·
<kbd>←</kbd> <kbd>→</kbd> hanen mindre og mere åben · <kbd>Esc</kbd> luk eller
send Kemichael ud.

### Det nye i forhold til den gamle animation

* **Kolben står klar.** Ingen knapper til afvejning, vand og indikator i fast
  rækkefølge; buretten er fyldt.
* **Luppen med figurerne** viser 1 : 1 på partikelniveau: den sidste CH₃COOH
  forsvinder præcis, når kolben bliver lyserød.
* **Dråber på 0,05 mL og lyserøde skyer**, der bliver længere tæt på omslaget,
  så eleven kan mærke, hvornår der skal dryppes.
* **Eleven aflæser selv**, og buretten tæller oppefra fra 0,00 mL (den gamle
  hint om at trække fra 25,00 mL passede ikke med luppen).
* **Beregningen er en fane**, hvor eleven selv skriver formlerne, med tavlen og pæne beregninger, og en ny opgave
  har andre tal. Forkerte svar får en besked, der passer til fejlen (mL i
  stedet for L, NaOH's molarmasse, brøken uden 100 % osv.).
* **Fane 3 er ny:** hvad ændrer antallet af mL NaOH, og hvad giver et forkert resultat.
* **Sproget:** NaOH hedder natriumhydroxid eller NaOH, aldrig natronlud.
* **Hjælpen er én knap:** Giv hint, så Vis svaret.

## Filer

```
index.html          markup for de tre faner, teorien, datatabellen og rundvisningen
css/stil.css        alt udseende (grundlaget er sc7.2's). NB: decimaltal med PUNKTUM i CSS
sprites/            buretten, kolben, magnetomrøreren og eddikeflasken (egne tegninger)
                    og sprøjteflasken (fra sc7.2)
js/kerne.js         NK-navnerum, hævet og sænket skrift, hukommelse, lærred, tal (som sc7.2)
js/kemi.js          modellen: stofmængde, forbrug, pH af ladningsbalancen og phenolphthaleins farve
js/data.js          grænserne, hintene, de fire regnetrin med formlerne, de seks situationer og replikkerne
js/tjek.js          tjekket af aflæsningen, formlerne og de fire regnetrin med beskeder til de typiske fejl
js/sprites.js       indlæser SVG-filerne; MAAL har koordinaterne i dem
js/tegning.js       rummet, opstillingen (stativ, burette, hane, kolbe, omrører),
                    dråberne, skyderen, eddikeflasken, keglen og skiltene
js/lup.js           luppen med de 8 figurer (fane 1)
js/graf.js          titreringskurven og luppen på menisken i panelet
js/praesentation.js tilbuddet om Kemichaels præsentation (samme fil som i sc1.2)
js/sim_titrering.js fane 1
js/sim_beregning.js fane 2
js/sim_forbrug.js   fane 3
js/laerer.js        Kemichael på alle tre faner og påskeæggene
js/rundvisning.js   rundvisningen bag ? (koden er sc1.1's)
js/app.js           faneskift, teorien, genveje, tegneløkke
_selvtest.html      udviklerværktøj, indgår ikke i animationen
_sprites.html       udviklerværktøj: viser tegningerne alene
```

## At rette i den

**Tallene** står øverst i `js/kemi.js` (molarmasse, pKs, koncentration, prøvens
masse, vand, dråbestørrelse, antallet af figurer i luppen) og grænserne for en
præcis titrering og aflæsningen øverst i `js/data.js`. **Situationerne på fane
3** står i `D.SITUATIONER`: hvad der er ændret ved B (`m`, `vand`, `c`, `cTror`,
`spild`), spørgsmålet, de tre svar, forklaringen til hvert forkert svar, hintet
og forklaringen bagefter. **Regnetrinene** står i `D.TRIN` (formlen, hintet til formlen og hintet til
tallet), og de godkendte formler og beskederne til de typiske fejl i `FORMLER`
og resten af `js/tjek.js`.

**`_selvtest.html`** åbner index.html i en iframe og tjekker pH ved start (2,96),
i halvtitrerpunktet (pKs) og ved ækvivalenspunktet (8,5 til 8,9), at kolben er
farveløs én dråbe før og lyserød én dråbe efter, at vandet ikke ændrer
forbruget, at 13 skrivemåder af et tal og 32 skrivemåder og fejl i formlerne
behandles rigtigt, at aflæsningen og de fire regnetrin giver den rigtige besked ved de typiske fejl, at sproget holder
reglerne, at fane 1 kan gennemføres med musen (skyderen, hanen, én dråbe), at
Vis svaret, overtitrering og en tom burette opfører sig rigtigt, at fane 2 og 3
kan gennemføres, at Kemichael kan vises og sendes ud på alle faner, og at
layoutet holder fra 520 × 380 til 1500 × 900. Den kræver en lokal server eller
Chrome med `--allow-file-access-from-files`, og den lægger elevens valg tilbage
bagefter. Sidst kørt 25. september 2026: ALT OK (88 påstande).

## Forenklinger

* Alt er ved 25 °C uden aktivitetskoefficienter. pKs = 4,76 for eddikesyre og
  M = 60,05 g/mol (Databogen).
* Eddikens eget rumfang regnes som 1 mL pr. gram, og eddiken indeholder kun
  eddikesyre og vand.
* Phenolphthalein regnes som en indikator med pKs 9,4, så omslaget ligger mellem
  8,2 og 10. Indikatorens egen syre er ikke med i regnestykket.
* Natronluden løber i dråber på præcis 0,05 mL. Den lyserøde sky, hvor dråben
  rammer, er et billede af, at pH lokalt er høj, indtil omrøreren har blandet.
* Kolben er tegnet større i forhold til buretten end i virkeligheden, og
  væskehøjden i den stiger med 1,4 enheder pr. mL, så den kan ses.
* Luppens figurer er hver 1/8 af syren i kolben, ikke enkelte molekyler. Vandet
  er ikke tegnet, og H₂O, der dannes, forsvinder i det.
* Buretten fyldes altid til 0,00 mL, så forbruget er det tal, man aflæser.
* På fane 3 er eddikens masseprocent 4,60 %, og Kemichael titrerer til den
  første dråbe efter ækvivalenspunktet.

## Tilbuddet om præsentationen

Kemichael kommer ikke af sig selv. Første gang en fane åbnes, står der Start
præsentation og Nej tak midt foroven i scenen. Start sender ham ind, Nej tak og
Esc husker valget, og K viser præsentationen uden at spørge. Tilbuddet
forsvinder også, når eleven har gjort noget på fanen. Koden er
`js/praesentation.js` (samme fil som i sc1.2), koblet med
`NK.Praesentation.kobl` i hver `sim_*.js`.

## I menuen

Ja, fra 25. sept. 2026 (brugerens ønske): knappen med `data-emne="c7.4"` i
`animationer/kemi-c-filer/samling_c7.html` peger på
`../superanimationer/sc7.4_titrering_eddike/index.html` og hedder "Titrering af
eddike". Den gamle ligger i
`kemi-c-filer/arkiv/c7.4_eksperiment_titrering_eddikesyre_oldversion.html`. Navnet
i `FEEDBACK_EMNER` i `animationer/samling_alt.html` er stadig "Eddikesyre-titrering".
