# sc6.3 Salt i havvand (Mohr-titrering)

Superanimation om Mohrs titrering af havvand: buretten tæller chloridet. Åbn
`index.html`. Indikatoren vælges i toplinjen: dichlorfluorescein (fra start) eller
kaliumchromat (se "Indikatoren" nedenfor). Mappen henter kun filer inde fra sig selv, bortset fra Kemichael
(`../../v2/kemichael/kemichael.js` og `../kemichael/superanimation.js`). Ingen
`fetch` og ingen moduler, så den virker fra harddisken.

Det er en superanimation, ikke en superlab-animation, og den er bygget som
`sc7.4_titrering_eddike` (brugerens ønske 26. sept. 2026: "den må gerne minde om
de andre titreringsøvelser"). Samme ramme, samme tre faner, samme opstilling,
skyder, dråbeknap, luppe, aflæsning, tavle og to kolber på fane 3. Kolben står klar, der
er ingen flasker at hælde fra, ingen uheld og intet forløb trin for trin.

## Bestillingen

1. **Pointen:** ved omslaget har buretten tilsat lige så mange mol Ag⁺, som der
   var Cl⁻ i prøven, og omslagsfarven (lyserød eller rødbrun) kommer først, når
   der ikke er mere Cl⁻ at fælde. Masseprocenten følger af n = c · V, 1 : 1, m = n · M og
   m% = m / m(prøve) · 100 %.
2. **Afløser** `kemi-c-filer/c6.5_eksperiment_mohrtitrering.html` (menuens c6.3, nu
   i `arkiv/` som `c6.5_eksperiment_mohrtitrering_oldversion.html`).
   Med fra den gamle: 1,00 g havvand, 0,050 M sølvnitrat, M(NaCl) = 58,44 g/mol,
   en masseprocent mellem ca. 1,5 og 4 %, buretten med en hane i trin, den gule
   chromatindikator, der bliver rødbrun, mikroniveauet med Cl⁻, Ag⁺, AgCl, CrO₄²⁻
   og Ag₂CrO₄, kurven over ionfordelingen, beregningen i trin og den sarkastiske
   besked ved overtitrering (hindbærsmoothie er blevet til tomatsuppe). Ud:
   beregningen i en pop-up, knappen "Afslut titrering", toast-beskederne, konfetti
   og genstart ved at genindlæse siden.
3. **Naboerne:** `sc6.1` ejer koncentration og fortynding, `sc6.2` formel og aktuel
   koncentration, `sc2.4` fældningsreaktioner, `c5.x` stofmængde og molarmasse, og
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
| 3 | Fejlkilder | vælger, hvordan forbruget af sølvnitrat eller masseprocenten bliver, når én ting er ændret ved kolbe B | kun chloridet i kolben og koncentrationen af sølvnitrat ændrer forbruget; postevand og spild er fejlkilder, mere vand og en mindre prøve er ikke |

**Titreringen.** Kolben står klar på magnetomrøreren med 1,00 g havvand, 20 mL
demineraliseret vand og lidt indikator (her beskrevet med kaliumchromat, der
farver den gul; den nye indikator står under Indikatoren nedenfor), og buretten er
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

**Indikatoren** (18. okt. 2026, brugerens ønske: "Kan du ikke lave animationen
sc6.3, således, at den også kan vise forsøget med den nye indikator? Måske bare med
en toggle"; chromat må ikke længere bruges i skolen, og Kemibogens afsnit 6.3 og
øvelse 6.3a og 6.3b bruger dichlorfluorescein). To knapper i toplinjen, Dichlorfluorescein
og Kaliumchromat, eller tasten <kbd>I</kbd>. Dichlorfluorescein er valgt fra start
(Claudes valg, så animationen passer med bogen, der linker til den), og valget
huskes i browseren. `?indikator=chromat` eller `?indikator=dcf` i adressen vælger
uden at huske. Et skift starter prøven på fane 1 forfra med det samme havvand og
samme prøvenummer og regner kolberne på fane 3 om; fane 2 er den samme.
Med dichlorfluorescein er kolben gulgrøn, skyerne, hvor dråben rammer, og omslaget
er lyserøde (farverne fra Kemibogens figurer), og luppen har to gulgrønne piller
med ordet "indikator" i stedet for CrO₄²⁻. Ved omslaget kommer én Ag⁺ i overskud,
og pillerne sætter sig på bundfaldet (de næste pladser i bunken) og bliver
lyserøde, som i bogens figur `mohr-trin`. Hvorfor indikatoren binder, er ikke vist
(bogen går heller ikke i dybden). Kurvens tredje linje er fri Ag⁺ i stedet for
Ag₂CrO₄. Teorien viser kun delen om den valgte indikator; delen om
dichlorfluorescein nævner, at metoden er opkaldt efter Mohr, som brugte
kaliumchromat, og at chromat ikke bruges i skolen, fordi det er kræftfremkaldende.
Kemichael siger "lyserød", og langt forbi omslaget laver man hindbærsmoothie i
stedet for tomatsuppe. På smalle skærme forsvinder ordet Indikator (under 1250
px), den fravalgte knap viser kun sin farveprik (under 1060 px), og fanerne får
deres egen linje (under 960 px).

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

**Fejlkilder** (hed To kolber til 28. sept. 2026). Seks situationer: 60 mL demineraliseret vand (samme
forbrug), 0,50 g havvand (mindre forbrug) og masseprocenten for den (den samme),
0,100 M sølvnitrat (mindre forbrug), postevand i stedet for demineraliseret vand
(masseprocenten for høj, fordi postevand indeholder chlorid) og spildt havvand
(for lav). Hver situation har en titel i opgavekortet. Spørgsmålene bruger
fagordene forbrug, stofmængde og rumfang, ikke "hvor mange mL der skal til"
(brugerens ønske 28. sept. 2026). Eleven vælger et svar, og så titrerer Kemichael
begge kolber til omslaget.
Tabellen i panelet viser forbrug og masseprocent for A og B, og et forkert
svar får en forklaring, der passer til netop det svar.

**Kemichael** præsenterer hver fane, når eleven trykker Start præsentation, tre
replikker pr. fane. Han roser første gang en titrering er præcis, første gang en
beregning er færdig og efter den sjette situation. Han bemærker det, når kolben
er langt forbi omslaget ("Stop nu, medmindre du vil lave tomatsuppe."), og når
buretten er løbet tom. Påskeæg: et resultat, der rammer havvandets masseprocent
på hundrededelen, og glimtet om hans første titrering, når resultatet er langt
for højt. Kaffekoppen er det fælles påskeæg. Han er den samme som i sc7.4, ikke
den rolige Kemichael fra sc6.1 og sc6.2.

Direkte links: `index.html#beregning` og `index.html#fejlkilder` (også `#kolber`
og `#forbrug`). Fanens id er stadig `fane-forbrug`.

Genveje: <kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> faner · <kbd>T</kbd> teori ·
<kbd>H</kbd> rundvisning · <kbd>K</kbd> Kemichaels præsentation ·
<kbd>R</kbd> ny prøve eller forfra · <kbd>I</kbd> skift indikator · <kbd>Enter</kbd> videre ·
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
* **Fane 3, Fejlkilder, er ny**, med postevand som den fejl, der hører til netop denne
  titrering.
* **Hjælpen er én knap:** Giv hint, så Vis svaret.

## Filer

```
index.html          markup for de tre faner, teorien og rundvisningen
css/stil.css        alt udseende (kopieret fra sc7.4). NB: decimaltal med PUNKTUM i CSS
sprites/            buretten, kolben og magnetomrøreren (fra sc7.4) og flasken med havvand
js/kerne.js         NK-navnerum, hævet og sænket skrift, hukommelse, lærred, tal (som sc7.4)
js/kemi.js          modellen: chlorid, AgCl og Ag₂CrO₄ af opløselighedsprodukterne, farven og stederne;
                    K.indikator, K.FARVER og K.ORD for de to indikatorer
js/data.js          grænserne, hintene, de fire regnetrin, de seks situationer og replikkerne;
                    D.ORD og D.saetOrd skriver teksterne om til den valgte indikator
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
js/app.js           faneskift, teorien, genveje, valget af indikator (NK.saetIndikator), tegneløkke
_selvtest.html      udviklerværktøj, indgår ikke i animationen
_sprites.html       udviklerværktøj: viser tegningerne alene
```

## At rette i den

**Tallene** står øverst i `js/kemi.js` (molarmasse, opløselighedsprodukter,
koncentration, prøvens masse, vand, chromat, chlorid i postevand, dråbestørrelse,
antallet af figurer i luppen og de seks steder) og grænserne for en præcis
titrering og aflæsningen øverst i `js/data.js`. **Situationerne på fane 3** står i
`D.SITUATIONER`: hvad der er ændret ved B (`m`, `vand`, `c`, `post`, `spild`),
titlen i opgavekortet, spørgsmålet, de tre svar, forklaringen til hvert forkert svar, hintet og
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
Kemichael kan vises og sendes ud på alle faner, og at layoutet (også fanerne i
toplinjen) holder fra 520 × 380 til 1500 × 900. Afsnit 1 til 10 kører med
kaliumchromat. Afsnit 11 kører dichlorfluorescein: knapperne og teorien, modellen
(samme ækvivalenspunkt, omslag inden for 0,01 mL, farveordene og sølvet regnet
med), fane 1 med luppen og kurven, overtitrering, et skift midt i en titrering,
tasten I, replikkerne, rundvisningen og fane 3. Den kræver en lokal server eller
Chrome med `--allow-file-access-from-files`, og den lægger elevens valg tilbage
bagefter. Sidst kørt 18. oktober 2026: ALT OK (130 påstande).

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
* Dichlorfluorescein: farven regnes af overskuddet af Ag⁺, [Ag⁺] − [Cl⁻], med
  styrken 1 − exp(−√(x / 2,5 · 10⁻⁴ M)). Den første dråbe efter
  ækvivalenspunktet giver svagt lyserød, og 1 mL for meget giver kraftigt
  lyserød. I virkeligheden er farveskiftet skarpere og bliver ikke meget
  kraftigere; den gradvise farve er valgt, så overtitrering kan ses som med
  chromat. Indikatoren er ikke regnet med i stofmængderne.
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

Ja, fra 28. sept. 2026 (brugerens ønske). Knappen med `data-emne="c6.3"` i
`animationer/kemi-c-filer/samling_c6.html` peger på
`../superanimationer/sc6.3_mohrtitrering/index.html`, og den gamle ligger i
`kemi-c-filer/arkiv/c6.5_eksperiment_mohrtitrering_oldversion.html`. Gamle links
med `?emne=c6.5` finder knappen via `gamleNumre` i `samling_c6.html`. Navnet i
`FEEDBACK_EMNER` i `animationer/samling_alt.html` er stadig "Forsøg: Mohrtitrering".
