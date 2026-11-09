# sb7.2 Ringslutning

En superanimation i sin egen mappe. Åbn **`index.html`**. Den henter kun
filer fra sin egen mappe og `../faelles/` og virker også, når den åbnes
direkte fra harddisken. Der er ingen Kemichael: al tekst står på det lyse
papirkort øverst i scenen, hjælpen er den gule knap på kortet, og intet
løses uden **Indsend svar**.

Den afløser `animationer/kemi-b-filer/b7.10_ringslutning_kulhydrater.html`
(B7 knap 1, koden `b7.10`). Afsnittet i Kemibogen B er B7.2 Ringslutning,
derfor nummer 7.2.

**Pointen i én sætning:** Glucose lukker sig til en ring, når oxygenatomet
på carbonatom 5 binder sig til aldehydgruppens carbonatom 1. Afhængigt af
siden, angrebet kommer fra, peger den nye OH-gruppe ned (α) eller op (β),
og i vand er de to ringe og den åbne kæde i en dynamisk ligevægt.

## Bestillingen (9. november 2026)

Brugeren bad om idéer til B7-animationer og valgte samme dag: "Start med at
lave en afløsning til b7.10". Planen med tre faner blev skrevet til
brugeren, før koden blev skrevet. Valgene er Claudes, og brugeren har ikke
set animationen endnu.

1. **Pointen:** som ovenfor.
2. **Afløser b7.10.** Med fra den gamle: glucose og fructose, at eleven
   nummererer carbonatomerne ved at klikke, at kæden drejer og bøjer, at
   ringen lukker sig, og α og β. Den gamle tegnede kæden som kugler og
   pinde med knapperne Roter og Luk ringen. Den nye tegner molekylet som
   bogens fischerprojektion og haworthformel, eleven forudsiger hvert
   trin, og ringen lukker sig først, når eleven har fundet oxygenatomet.
   Nyt: reglen fra fischerprojektion til haworthformel (fane 2) og
   ligevægten mellem de tre former (fane 3). Det dækker alle fem punkter i
   *Det skal du kunne* i B7.2.
3. **Naboerne:** B7.1 ejer monosacchariderne, asymmetriske carbonatomer og
   D og L. B7.3 ejer glykosidbindingen. B7.4 ejer Fehlings test; her er
   Fehlings væske kun det, der bruger de åbne kæder op (bogen nævner
   forskydningen i B7.2 og peger videre til B7.4), og der er intet
   bundfald og ingen farver.
4. **Loftet:** tre faner. Fane 1: to opgaver med tre trin hver. Fane 2: fem opgaver. Fane 3: ét forløb med syv trin og 100
   molekyler i et fast gitter.
5. **Layoutet:** scene plus panel som sb4.11. Scenen er
   papirkortet øverst og et whiteboard under det.

Stop-listen er overholdt: intet glasudstyr, ingen flasker, intet stativ,
ingen uheld og ingen oprydning.

**Brugerens rettelser samme dag** (efter at have prøvet den): mindre
konfetti; færre spørgsmål i fane 1 (ingen nummerering af carbonatomerne,
intet spørgsmål om OH-gruppen på carbonatom 2, når kæden er lagt på siden,
og intet trin 6 med den anden ring); til gengæld lukker eleven selv ringen
ved at trække. Opløsningen af druesukker i fane 3 tog for lang tid, og
punkt 7 skulle ikke nævne Le Chatelier, men blot sige, at ringene i vand
hele tiden kortvarigt åbner sig.

## Fanerne

**1 Ringen lukker sig** (`js/sim_ring.js`). Numrene på carbonatomerne står
på fra start. Glucose: (1) klik på det oxygenatom, der binder sig til
carbonatom 1 (kortet siger, at ringen har seks atomer, og et forkert
oxygenatom får at vide, hvor mange atomer ringen så ville få); (2) tryk Læg
kæden på siden (kæden drejer en kvart omgang, og kortet siger bagefter, at
det, der pegede til højre, nu peger ned), træk så selv det orange
oxygenatom hen til carbonatom 1, og svar på, hvor hydrogenatomet fra
carbonatom 5 blev af (der fraspaltes ikke vand); (3) α eller β (forklaringen
nævner, at glucose også kan lukke sig til β-glucose). Fructose: find
oxygenatomet til carbonatom 2 (ring med fem atomer), læg kæden på siden,
træk oxygenatomet hen til carbonatom 2, hvilke carbonatomer er uden for
ringen, og α eller β. Når oxygenatomet er fundet, er det orange, og
aldehydgruppens (carbonylgruppens) oxygenatom er grønt som i bogens figur
`b7-ringslutning`. Det, kortet spørger om, har en gul ramme. Panelet har
opgaverne og trinnene i den aktuelle opgave.

**Trækket.** Oxygenatomet har en gul ramme, carbonatomet, det skal binde sig
til, en stiplet orange ring, og en stiplet linje viser den kommende binding.
Oxygenatomet følger musen langs sin vej, mens kæden bøjer. Når det når
carbonatomet, klikker ringen på plads; slippes det efter mindst 70 % af
vejen, lukker ringen sig også. Slippes det før, glider kæden tilbage, og
kortet beder eleven trække helt hen. Trækket er en handling, ikke et svar,
så det bedømmes ikke. Konfetti kommer kun, når en hel opgave er løst.

**2 Fra fischer til haworth** (`js/sim_haworth.js`). (1) Nummerér
carbonatomerne i α-glucose som haworthformel (små cirkler viser hjørnerne,
til de har et nummer). (2-4) Fischerprojektionen til venstre og en tom ring
til højre: eleven klikker på en grå cirkel over eller under carbonatom 1
til 4 for β-glucose, α-galactose og β-mannose (mannose står ikke i bogen,
så reglen bruges på et ukendt sukker). CH₂OH står op fra start (D-form).
(5) Den anden vej: ringen er β-allose, og eleven sætter OH-grupperne i
fischerprojektionen (carbonatom 2 til 5). Efter hint 1 får OH-grupperne
farve som i bogens figur `b7-fischer-til-haworth`: til højre (ned) blå, til
venstre (op) rød. En forkert gruppe bliver rød med en stiplet ramme.

**3 Ligevægten** (`js/sim_lige.js`). Et vindue med 100 glucosemolekyler i
et fast gitter, tegnet som små haworthringe (α blå med OH ned, β lilla med
OH op, den åbne kæde grøn), og tallene ved siden af. Trin: gæt (krystallerne
i druesukker er α-glucose), opløs druesukkeret (fordelingen går fra 100 α
til 36 α og 64 β), hvad sker der stadig (dynamisk ligevægt), hvorfor er den
sjældne kæde vigtig (kun den har en aldehydgruppe), gæt, tilsæt Fehlings
væske (hver kæde reagerer, så snart den dannes, og ringene bliver ved med
at åbne sig, til alle 100 har reageret), og hvorfor ringene også nåede at
reagere (ringene i vand åbner sig hele tiden kortvarigt). Gættene står ved
tallene og får ✓ eller ✗, når forsøget har vist svaret. Under gættene står
alt stille. Opløsningen tager omkring 6 sekunder.

## Filerne

```
index.html          siden, teorien og rundvisningen
css/stil.css        kopieret fra sb4.11; det nye står nederst under SB7.2
js/kerne.js         fælles hjælpere (som sb4.11)
js/data.js          sukkerstofferne, opgaverne, trinnene og teksterne
js/sukker.js        molekylemodellen: fischerprojektion, kæden på siden, den
                    bøjede kæde og ringen som rammer, glidningen mellem dem
                    og tegningen i bogens stil
js/tegning.js       tavlen, rammerne, skiltet og molekylerne i vinduet på fane 3
js/fane.js          scenekortet, hjælpeknappen, Indsend svar, musen og
                    konfettien (som sb4.11)
js/sim_ring.js      fane 1
js/sim_haworth.js   fane 2
js/sim_lige.js      fane 3
js/rundvisning.js   rundvisningen (kun TURE er ny)
js/app.js           faneskift, teorien med α- og β-glucose, tastatur og tegneløkken
_selvtest.html      selvtesten (kræver en lokal server)
_skud.html          skærmbilleder af bestemte trin (udviklerværktøj, kræver en lokal server)
```

## Det, man kan rette i

* **Et nyt sukker:** en linje i `D.SUKKER` i `js/data.js` med siderne for
  OH-grupperne i fischerprojektionen. Modellen tegner resten.
* **Opgaverne:** `D.RING`, `D.HAWORTH` og `D.LIGE` i `js/data.js`. `om` er de
  dele af molekylet, der får en gul ramme, mens spørgsmålet står.
* **Vippet og trækket på fane 1:** `FORLOEB`, `BOEJ`, `SNAP` og `SLIP_OK`
  øverst i `js/sim_ring.js`; lukningen efter trækket står i `lukRing`.
* **Ligevægten:** `K_FART`, `BYT` og `FEHLING` øverst i `js/sim_lige.js`.
* **Pladserne i ringen og fischerprojektionen:** `R6`, `R5`, `ringSub` og
  `fischerSub` i `js/sukker.js`.

## Forenklinger

* Aldehydgruppen tegnes i fischerprojektionen som H, C og =O (ikke CHO), så
  oxygenatomet kan følges, når ringen lukker sig.
* Kæden lægges på siden ved at dreje den en kvart omgang med uret. Så kommer
  carbonatom 1 til højre, og det, der pegede til højre, peger ned. Det er
  reglen i bogen vist som en bevægelse. Drejningen om bindingen mellem
  carbonatom 4 og 5, der bringer oxygenatomet ind i ringen, sker samtidig
  med, at kæden krummer sig, og forklares ikke.
* Ringen lukker sig kun til α-glucose. β-glucose nævnes i forklaringen og
  bruges i fane 2 og 3. Modellen har stadig rammerne til β (K1m, K1b, K2b),
  og teorien tegner begge ringe.
* Fructose lukker sig kun til α-fructose med fem atomer. Bogens figur viser
  β-fructose; bogens tekst nævner begge. Ringen med seks atomer (med
  oxygenatomet på carbonatom 6) er ikke med; kortet siger, at ringen har fem
  atomer.
* På fane 3 følger antallet af α-glucose 100 · (0,36 + 0,64 · e^(−k·t)), og
  ved ligevægt bytter et α og et β plads hele tiden. En åben kæde lever kun
  et kort øjeblik, men tiden er trykket sammen, så der kan ses et par kæder,
  mens fordelingen ændrer sig. Der står ingen tid på skærmen.
* Med Fehlings væske holdes forholdet mellem α og β i ringene, mens de
  reagerer (ringene er stadig i ligevægt). Selve reaktionen er ikke vist.

## Tal skrevet efter hukommelsen

Bogens tal (36 %, 64 % og under 0,1 %) er brugt som de står i B7.2. At
krystallerne i almindeligt druesukker er α-glucose, er skrevet efter
hukommelsen (kortet i fane 3).

## Selvtest

`_selvtest.html` skal åbnes gennem en lokal server med mappen `animationer/`
som rod. Den tjekker modellen mod bogen (siderne i fischerprojektionen,
reglen til højre og ned for fire aldoser, haworthformlens retning, at
ingenting fraspaltes, α og β, fructose med fem atomer og C1 og C6 uden for
ringen), at alle tre faner kan gennemføres, at forkerte svar får den
rigtige forklaring og koster stjernen, at intet løses uden Indsend svar, at
ligevægten ender med 36 α og 64 β og er dynamisk, at Fehlings væske bruger
alle 100 op, at teksterne er korte og uden tankestreger og ASCII-dansk, og
at kortet aldrig dækker tavlen fra 1100 × 620 til 1600 × 950.
9. nov. 2026 efter rettelserne: ALT OK (73).

## I menuen

Ikke i menuen endnu. Når brugeren siger til: knap nr. 1 "Ringslutning" i
`kemi-b-filer/samling_b7.html` (koden `b7.10`) peger på denne mappe,
`FEEDBACK_EMNER` følger med, og kolonnen "I menuen" i `../README.md` rettes.
Kemibogen B (B7.2, Prøv selv) linker direkte til den gamle
`kemi-b-filer/b7.10_ringslutning_kulhydrater.html`, så den gamle flyttes
først til arkivet, når bogens link er rettet og bogen er bygget og lagt ud.

## Papirkortet

Kortet er det lyse papirkort fra start (se Fælles krav i `../README.md`):
`../faelles/papirkort.css` og `../faelles/papirkort.js` er indlæst, og
`<body class="papirkort">`. Efter et rigtigt svar bliver kortet på
spørgsmålet med forklaringen under svarene, og Næste står, hvor Indsend svar
stod. Kortets grønne knap går altid fremad; Begynd forfra står i panelet.
