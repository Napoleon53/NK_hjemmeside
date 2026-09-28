# sc5.3 Salt i havvand (Mohr-titrering)

Superanimation om Mohrs titrering af havvand: buretten tæller chloridet. Åbn
`index.html`. Mappen henter kun filer inde fra sig selv, bortset fra Kemichael
(`../../v2/kemichael/kemichael.js` og `../kemichael/superanimation.js`). Ingen
`fetch` og ingen moduler, så den virker fra harddisken.

Det er en superanimation, ikke en superlab-animation, og den er bygget som
`sc7.4_titrering_eddike` (brugerens ønske 26. sept. 2026: "den må gerne minde om
de andre titreringsøvelser"). Samme ramme, samme tre faner, samme opstilling,
skyder, dråbeknap, luppe, aflæsning, tavle og to kolber. Kolben står klar, der
er ingen flasker at hælde fra, ingen uheld og intet forløb trin for trin.

## Bestillingen

1. **Pointen:** ved omslaget har buretten tilsat lige så mange mol Ag⁺, som der
   var Cl⁻ i prøven, og den rødbrune farve kommer først, når der ikke er mere
   Cl⁻ at fælde. Masseprocenten følger af n = c · V, 1 : 1, m = n · M og
   m% = m / m(prøve) · 100 %.
2. **Afløser** `kemi-c-filer/c5.5_eksperiment_mohrtitrering.html` (menuens c5.3).
   Med fra den gamle: 1,00 g havvand, 0,050 M sølvnitrat, M(NaCl) = 58,44 g/mol,
   en masseprocent mellem ca. 1,5 og 4 %, buretten med en hane i trin, den gule
   chromatindikator, der bliver rødbrun, mikroniveauet med Cl⁻, Ag⁺, AgCl, CrO₄²⁻
   og Ag₂CrO₄, kurven over ionfordelingen, beregningen i trin og den sarkastiske
   besked ved overtitrering (hindbærsmoothie er blevet til tomatsuppe). Ud:
   beregningen i en pop-up, knappen "Afslut titrering", toast-beskederne, konfetti
   og genstart ved at genindlæse siden.
3. **Naboerne:** `sc5.1` ejer koncentration og fortynding, `sc5.2` formel og aktuel
   koncentration, `sc2.4` fældningsreaktioner, `c4.x` stofmængde og molarmasse, og
   `sc7.4` titreringen af eddike med pH-kurven. De bruges her uden at blive
   forklaret igen.
4. **Loftet:** 3 faner. Fane 1: 1 burette, 1 kolbe, 1 lup med 8 Cl⁻ og 2 CrO₄²⁻,
   1 kurve med 3 linjer. Fane 2: 4 regnetrin og 1 tavle. Fane 3: 2 opstillinger
   (A og B) og 6 situationer. Havvand fra 6 steder.
5. **Layoutet:** scene plus panel, som `sc7.4`. Panelet har opgavekortet med én
   knap (Giv hint, Vis svaret, videre).

## Hvad den viser

| # | Fane | Hvad man gør | Pointe |
|---|------|--------------|--------|
| 1 | Titreringen | åbner hanen, drypper til sidst, lukker ved omslaget og aflæser buretten | omslaget kommer, når det sidste Cl⁻ er fældet |
| 2 | Beregningen | skriver formlen og regner tallet i fire trin fra forbruget til masseprocenten | n(Ag⁺) = n(NaCl), og resten er regning |
| 3 | To kolber | gætter, hvad der sker med antallet af mL sølvnitrat eller masseprocenten, når én ting er ændret | kun chloridet i kolben og koncentrationen af sølvnitrat ændrer forbruget |

**Titreringen.** Kolben står klar på magnetomrøreren med 1,00 g havvand, 20 mL
demineraliseret vand og lidt kaliumchromat, der farver den gul, og buretten er
fyldt med 0,050 M sølvnitrat til 0,00 mL. Havvandet er hentet et af seks steder
(Vesterhavet, Skagerrak, Kattegat, Lillebælt, Middelhavet og Det Røde Hav), og
stedet står i opgavekortet. Eleven åbner hanen med skyderen (lukket, dryp, løb);
et klik på hanen åbner og lukker, og knappen 1 dråbe giver én dråbe. Sølvnitraten
løber i dråber på 0,05 mL. Hvidt AgCl gør kolben uklar, og hvide fnug hvirvler
rundt med loppen. Hvor dråben rammer, kommer en rødbrun sky, der forsvinder igen,
og tæt på omslaget bliver skyerne længere. Luppen viser chloridet som 8 figurer:
hver gang 1/8 af ækvivalensrumfanget er løbet ned, kommer en Ag⁺ ind, finder en
Cl⁻, og de bliver til AgCl, der synker til bunds. Ved omslaget kommer to Ag⁺ mere
og fælder en CrO₄²⁻ som rødbrunt Ag₂CrO₄. Så kommer feltet til aflæsningen, og
eleven aflæser buretten i luppen i panelet. Kurven i panelet viser stofmængden af
Cl⁻ i opløsning, AgCl og Ag₂CrO₄ undervejs. Går eleven for langt, bliver kolben
mørk rødbrun, og beskeden siger, at forbruget er for stort; det er ikke en
blokering, og resultatet på fane 2 viser følgen.

**Beregningen.** Som i sc7.4: tavlen viser data, reaktionen Ag⁺ + Cl⁻ → AgCl og
de fire linjer. Eleven skriver selv formlen i hvert trin og derefter tallet:
n(Ag⁺), n(NaCl), m(NaCl) og m%. Formlen kan skrives på mange måder (`c · V`,
`n(AgNO₃) = c(AgNO₃) · V(AgNO₃)`, `n(Cl⁻) = n(Ag⁺)`, `m(salt)/m(havvand)*100`),
og en omskrevet formel godkendes med den isolerede ved siden af. Forkerte tal får
en besked, der passer til fejlen, også når eleven har brugt molarmassen for
chlorid, sølvnitrat eller sølvchlorid. Er målingen elevens egen, sammenlignes
resultatet med havvandets rigtige masseprocent. Ny opgave giver en
klassekammerats måling med havvand fra et andet sted, en anden prøvemasse og en
anden koncentration.

**To kolber.** Seks situationer: 60 mL demineraliseret vand (lige så mange mL
sølvnitrat), 0,50 g havvand (færre mL) og masseprocenten for den (den samme),
0,100 M sølvnitrat (færre mL), postevand i stedet for demineraliseret vand
(masseprocenten for høj, fordi postevand indeholder chlorid) og spildt havvand
(for lav). Eleven gætter, og så titrerer Kemichael begge kolber til omslaget.
Tabellen i panelet viser mL sølvnitrat og masseprocent for A og B, og et forkert
gæt får en forklaring, der passer til netop det svar.

**Kemichael** præsenterer hver fane, når eleven trykker Start præsentation, tre
replikker pr. fane. Han roser første gang en titrering er præcis, første gang en
beregning er færdig og efter den sjette situation. Han bemærker det, når kolben
er langt forbi omslaget ("Stop nu, medmindre du vil lave tomatsuppe."), og når
buretten er løbet tom. Påskeæg: et resultat, der rammer havvandets masseprocent
på hundrededelen, og glimtet om hans første titrering, når resultatet er langt
for højt. Kaffekoppen er det fælles påskeæg. Han er den samme som i sc7.4, ikke
den rolige Kemichael fra sc5.1 og sc5.2.

Direkte links: `index.html#beregning` og `index.html#kolber` (også `#forbrug`).

Genveje: <kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> faner · <kbd>T</kbd> teori ·
<kbd>H</kbd> rundvisning · <kbd>K</kbd> Kemichaels præsentation ·
<kbd>R</kbd> ny prøve eller forfra · <kbd>Enter</kbd> videre ·
<kbd>mellemrum</kbd> åbn og luk hanen · <kbd>D</kbd> én dråbe ·
<kbd>←</kbd> <kbd>→</kbd> hanen mindre og mere åben · <kbd>Esc</kbd> luk eller
send Kemichael ud.

### Det nye i forhold til den gamle animation

* **Samme form som sc7.4**, så de to titreringer ligner hinanden.
* **Modellen regner farven:** mængden af AgCl og Ag₂CrO₄ findes af de to
  opløselighedsprodukter, så kolben bliver rødbrun lige efter
  ækvivalenspunktet og ikke før. Den gamle styrede farven af, hvor mange
  partikler der havde reageret i mikroskopet.
* **Rødbrune skyer**, der forsvinder, så længe der er Cl⁻ tilbage, som i et
  rigtigt forsøg, og som bliver længere tæt på omslaget.
* **Eleven aflæser selv** buretten og skriver selv formlerne.
* **Havvand fra seks steder** i stedet for et tilfældigt tal.
* **Fane 3 er ny**, med postevand som den fejl, der hører til netop denne
  titrering.
* **Hjælpen er én knap:** Giv hint, så Vis svaret.

## Filer

```
index.html          markup for de tre faner, teorien og rundvisningen
css/stil.css        alt udseende (kopieret fra sc7.4). NB: decimaltal med PUNKTUM i CSS
sprites/            buretten, kolben og magnetomrøreren (fra sc7.4) og flasken med havvand
js/kerne.js         NK-navnerum, hævet og sænket skrift, hukommelse, lærred, tal (som sc7.4)
js/kemi.js          modellen: chlorid, AgCl og Ag₂CrO₄ af opløselighedsprodukterne, farven og stederne
js/data.js          grænserne, hintene, de fire regnetrin, de seks situationer og replikkerne
js/tjek.js          tjekket af aflæsningen, formlerne og de fire regnetrin med beskeder til de typiske fejl
js/sprites.js       indlæser SVG-filerne; MAAL har koordinaterne i dem
js/tegning.js       rummet, opstillingen, dråberne, skyderen, flasken, keglen og skiltene
                    (sc7.4's med rødbrune skyer og fnug af AgCl)
js/lup.js           luppen med de 8 Cl⁻ og bundfaldet (fane 1)
js/graf.js          kurven over stofmængderne og luppen på menisken i panelet
js/praesentation.js tilbuddet om Kemichaels præsentation (samme fil som i sc1.2)
js/sim_titrering.js fane 1
js/sim_beregning.js fane 2
js/sim_forbrug.js   fane 3
js/laerer.js        Kemichael på alle tre faner og påskeæggene (som sc7.4)
js/rundvisning.js   rundvisningen bag ? (koden er sc1.1's)
js/app.js           faneskift, teorien, genveje, tegneløkke (som sc7.4)
_selvtest.html      udviklerværktøj, indgår ikke i animationen
_sprites.html       udviklerværktøj: viser tegningerne alene
```

## At rette i den

**Tallene** står øverst i `js/kemi.js` (molarmasse, opløselighedsprodukter,
koncentration, prøvens masse, vand, chromat, chlorid i postevand, dråbestørrelse,
antallet af figurer i luppen og de seks steder) og grænserne for en præcis
titrering og aflæsningen øverst i `js/data.js`. **Situationerne på fane 3** står i
`D.SITUATIONER`: hvad der er ændret ved B (`m`, `vand`, `c`, `post`, `spild`),
spørgsmålet, de tre svar, forklaringen til hvert forkert svar, hintet og
forklaringen bagefter. **Regnetrinene** står i `D.TRIN`, og de godkendte formler og
beskederne til de typiske fejl i `FORMLER` og resten af `js/tjek.js`.

**`_selvtest.html`** åbner index.html i en iframe og tjekker forbruget for en
kendt prøve, at [Ag⁺] = [Cl⁻] = √Ks ved ækvivalenspunktet, at sølvchromat først
fælder efter det, at omslaget kommer inden for 0,02 mL, at alt sølv er regnet
med, at 13 skrivemåder af et tal og 35 skrivemåder og fejl i formlerne behandles
rigtigt, at aflæsningen og de fire regnetrin giver den rigtige besked ved de
typiske fejl, at sproget holder reglerne, at fane 1 kan gennemføres med musen,
at luppen og kurven viser det samme som kolben, at Vis svaret rammer omslaget ved
seks prøver, at overtitrering og en tom burette opfører sig rigtigt, at fane 2
og 3 kan gennemføres, at alle kolber på fane 3 er rødbrune til sidst, at
Kemichael kan vises og sendes ud på alle faner, og at layoutet holder fra
520 × 380 til 1500 × 900. Den kræver en lokal server eller Chrome med
`--allow-file-access-from-files`, og den lægger elevens valg tilbage bagefter.
Sidst kørt 26. september 2026: ALT OK (98 påstande).

## Forenklinger

* Alt er ved 25 °C uden aktivitetskoefficienter. Ks(AgCl) = 1,8 · 10⁻¹⁰ M² og
  Ks(Ag₂CrO₄) = 1,1 · 10⁻¹² M³ (Databogen), M(NaCl) = 58,44 g/mol.
* Havvand indeholder også andre salte. Alt chlorid regnes som NaCl, og
  masseprocenten er regnet af saliniteten (promille) som 0,0912 · S. Stedernes
  værdier er afrundede overfladeværdier: Vesterhavet 3,10 %, Skagerrak 2,75 %,
  Kattegat 2,00 %, Lillebælt 1,50 %, Middelhavet 3,45 % og Det Røde Hav 3,65 %,
  og en ny prøve ligger højst 0,08 procentpoint fra stedets værdi.
* Havvandets eget rumfang regnes som 1 mL pr. gram, og indikatoren er 1 mL med
  1,0 · 10⁻⁴ mol chromat.
* Farven regnes af koncentrationen af Ag₂CrO₄ i kolben (en kvadratrod, så den
  første dråbe giver svagt rødbrun og en halv mL for meget mørk rødbrun). Den
  rødbrune sky, hvor dråben rammer, er et billede af, at [Ag⁺] lokalt er høj,
  indtil omrøreren har blandet.
* Postevand har 50 mg chlorid pr. liter.
* Kolben er tegnet større i forhold til buretten end i virkeligheden, og
  væskehøjden i den stiger med 1,4 enheder pr. mL, så den kan ses.
* Luppens figurer er hver 1/8 af chloridet i kolben, ikke enkelte ioner.
  Chromatet er ikke i samme skala: ved omslaget kommer to Ag⁺ ind og fælder
  én CrO₄²⁻, og når kolben er mørk rødbrun, fælder to mere den anden. Na⁺ og
  NO₃⁻ er ikke tegnet, fordi de ikke reagerer (med dem blev luppen for fuld).
* Buretten fyldes altid til 0,00 mL, så forbruget er det tal, man aflæser.
* På fane 3 har havvandet 3,10 % NaCl (Vesterhavet), og Kemichael titrerer til
  den første dråbe, hvor kolben er rødbrun.

## Tilbuddet om præsentationen

Som i sc7.4: første gang en fane åbnes, står der Start præsentation og Nej tak
midt foroven i scenen. Start sender ham ind, Nej tak og Esc husker valget, og K
viser præsentationen uden at spørge. Tilbuddet forsvinder også, når eleven har
gjort noget på fanen. Koden er `js/praesentation.js`, koblet med
`NK.Praesentation.kobl` i hver `sim_*.js`.

## I menuen

Nej, ikke endnu. Når brugeren siger til: knappen med `data-emne="c5.3"` i
`animationer/kemi-c-filer/samling_c5.html` skal pege på
`../superanimationer/sc5.3_mohrtitrering/index.html` i stedet for
`c5.5_eksperiment_mohrtitrering.html`, den gamle flyttes med `git mv` til
`kemi-c-filer/arkiv/c5.5_eksperiment_mohrtitrering_oldversion.html`, og kolonnen
"I menuen" i `../README.md` rettes. Navnet i `FEEDBACK_EMNER` i
`animationer/samling_alt.html` er "Forsøg: Mohrtitrering".
