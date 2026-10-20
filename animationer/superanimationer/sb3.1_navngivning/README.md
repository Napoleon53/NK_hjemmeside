# sb3.1 Navngivning

En superanimation i sin egen mappe. Åbn **`index.html`**. Den henter
molekylemotoren fra `../../molekylemotor/` og virker også, når den åbnes direkte
fra harddisken. Der er ingen Kemichael: al tekst står på ét kort øverst i
scenen, og hjælpen er den gule knap på kortet.

Den er ny og afløser ingen gammel animation. Den hører til afsnit B3.1 i
Kemibogen B (Alkoholer og carboxylsyrer), som gentager navngivningen fra kemi C,
og kan bruges i kemi C kapitel 4. Nummeret er efter den nye B-menu (B3
Bindinger og isomeri), ikke den gamle B3 (Syre/Base), som `sb3.2` hører til.

**Pointen i én sætning:** Et systematisk navn er en opskrift på molekylet, og
tegnebrættet kan læse opskriften begge veje: fra navn til tegning og fra tegning
til navn.

## Bestillingen (20. oktober 2026)

Brugerens ord: "Jeg har brug for en animation med tegnebrættet, som kan træne
navngivning bredt med hele kemi C pensum inklusiv alkoholer og carboxylsyrer.
Den skal være bundet lidt op til kemibogen Bs kapitel 3.1".

1. **Pointen:** som ovenfor.
2. **Afløser intet.** Opbygningen (scenekortet, kontakterne, listen, tegnefanen)
   er kopieret fra `sb4.8_organiske_navne`. Navnets tre dele (forled, stamme,
   endelse), deres farver og de fire trin er bogens, afsnit B3.1.
3. **Naboerne:** `sc4.2_zigzagformler` har quizzer om alkaner og alkener uden
   tavle. `sb4.8_organiske_navne` ejer aldehyder, ketoner, estere og aminer og
   har ingen carbonhydrider; her er det kemi C's stofklasser. `tegnebraet` er
   værktøjet til rapporter; her har tavlen en opgave og et facit. Knappen
   Tegnebræt ↗ i toppen åbner det i en ny fane.
4. **Loftet:** to faner, seks stofklasser, 89 stoffer (46 på fane 1 og 43 på
   fane 2), højst otte carbonatomer i kæden, én ring.
5. **Layoutet:** scene plus panel. Scenen er scenekortet øverst og et whiteboard
   under det. Panelet har kontakterne og opgavelisten.

## Det, der var mine valg (ikke brugerens)

* To faner, ikke tre, og rækkefølgen: Tegn molekylet først (navn til tegning er
  det letteste, og det er tegnebrættets egen fane), så Skriv navnet.
* At eleven skriver navnet i et felt i stedet for at vælge brikker som i sb4.8,
  og at tavlen tegner det, eleven skrev, ved siden af formlen.
* Stofferne, niveauerne og at halogenalkaner og cycloalkaner er med (2-bromhexan
  og 1,2-dibromethan står i bogens 4.3 og 4.4, cyclohexan i 4.4).
* At alle seks stofklasser er slået til fra start (brugeren skrev "hele kemi C").
  Til B3.1 alene: `index.html?med=alkohol,syre`.
* At den gamle skrivemåde (2-propanol) og et tal, der kan udelades (ethan-1-ol),
  godkendes med en note, men trivialnavne (eddikesyre) og engelske navne ikke.

## Stofklasserne (kontakterne i panelet)

Alkan, alken, alkyn, halogenalkan, alkohol og carboxylsyre. Kun de stofklasser,
der er slået til, kommer med i opgaverne på begge faner, og mindst én er altid
slået til. Valget huskes i browseren (`nk-sb3.1-klasser`). Et link kan vælge
dem: `index.html?med=alkohol,syre` (ordene `alkan`, `alken`, `alkyn`, `halogen`,
`alkohol`, `syre` og `alle`). En fane vælges med `#`: `index.html?med=alkohol,syre#skriv`.

## Fane 1: Tegn molekylet (`#tegn`)

Navnet står på kortet, delt i forled, stamme og endelse med bogens farver.
Eleven tegner på molekylemotorens tavle, den samme som på tegnebrættet. Øverst på
tavlen: Kæde, = Binding (et klik på en binding gør den dobbelt, tripel og enkelt
igen), −OH, =O, −COOH, −Cl, −Br og Ring, og til højre Fortryd og Ryd. Kun de
værktøjer, de valgte stofklasser bruger, er med, og altid dem, opgavens eget stof
har brug for (chlorethansyre får −Cl).

* **Test:** tegningen tjekkes kun, når eleven trykker Test (eller Enter) nederst
  til højre på tavlen. Brugeren 20. okt. 2026: "svær at tegne uden at man
  konstant får skæld ud". Mens eleven tegner, er der ingen fejl og intet ryst.
* **Vis navnet hele tiden:** kontakten nederst til venstre på tavlen. Slået til
  står det, tegningen hedder, ved Test-knappen, mens eleven tegner, som på
  tegnebrættet ("Tegningen hedder: butan"). Den er slået fra, hver gang siden
  åbnes. Eleven skal stadig trykke Test.
* **Facit:** hedder tegningen det samme som opgaven (cis og trans tæller ikke),
  er opgaven løst ved Test, navnet står grønt ved knappen, og tegningen får
  navnedelenes farver.
* **Fejl:** efter Test med et andet navn står navnet rødt ved knappen og
  ryster, og kortet siger, hvilken del af navnet der ikke passer, i navnets
  rækkefølge: grupperne (endelsen), kæden (stammen), numrene og sidegrupperne
  (forleddet). Fx "Du har tegnet butansyre. Carbonatomet i COOH tæller med i
  stammen. Propan er tre carbonatomer i alt." Det røde navn forsvinder, når
  tegningen ændres; forklaringen på kortet bliver til næste Test.
* Anderledes end på tegnebrættet (toppen af `js/sim_tegn.js`): −Cl og −Br
  sætter atomet på et carbonatom; grupperne kan kun sættes på carbonatomer;
  Kæde på O, Cl eller Br bygger ikke videre; et klik i den tomme tavle sætter
  ikke et nyt atom; Ring på en tom tavle lægger ringen i stedet for startatomet.
  Efter en gruppe, et halogenatom og en ring går værktøjet tilbage til Kæde.

## Fane 2: Skriv navnet (`#skriv`)

Molekylet står på whiteboardet som zigzagformel (nogle spejlvendt, så nummer 1
ikke altid er til venstre). Eleven skriver navnet i feltet på kortet og trykker
Tjek eller Enter. Feltet står fast i `index.html`, så det, eleven har skrevet,
bliver stående. Tavlen tegner det, eleven skrev, i kassen **Dit navn tegnet** til
højre, så formlen og navnet kan sammenlignes.

Kortet forklarer fejlen (`K.tjekNavn`, `K.regelFejl` og `K.forskelSkriv` i
`js/kemi.js`):

* **Det rigtige stof, forkert skrevet:** nummereret fra den anden ende, ikke den
  længste kæde (2-ethylbutan), sidegrupperne ikke i alfabetisk rækkefølge, ens
  sidegrupper uden di og tri, et tal, der ikke skal stå der (pentan-1-syre), og
  bindestreger (2-methyl-butan, 2methylbutan).
* **Et andet stof:** det, formlen har, som navnet ikke siger (en OH-gruppe, en
  dobbeltbinding, en ring, to bromatomer), kæden er længere eller kortere,
  carbonatomet i COOH, OH-gruppens eller dobbeltbindingens plads, sidegrupperne.
* **Godkendt med en note:** den gamle skrivemåde (2-pentanol, 1-propen) og et tal,
  der kan udelades (ethan-1-ol, prop-1-en).
* **Ikke godkendt:** trivialnavne (eddikesyre, glycerol) og engelske navne
  (2-methylbutane). Et tomt felt er intet svar.

Hintene er bogens fire trin: den længste kæde (gul i formlen), numrene (de bliver
stående på kæden), endelsen (gruppen gul) og forleddet (sidegrupperne gule).

## Hjælpen

Som `sb4.8`: al tekst står på kortet øverst i scenen, ingen tekstlinje nederst.
Den gule knap giver ét hint ad gangen og til sidst svaret. Et forkert svar giver
en forklaring, og knappen lyser stille. En opgave løst uden Vis svaret får en
stjerne. Når kortet er grønt, sker der intet i scenen; kortets knap blinker.
Teorien (navnets tre dele, de fire trin og stofklasserne fra kemi C) ligger bag
Teori, rundvisningen bag `?`.

## Forenklinger

* Navnene er molekylemotorens (IUPAC 1979/1993, dansk stavning): propan-2-ol,
  propen uden tal, chlorethansyre, dichlormethan.
* cis og trans tæller ikke: but-2-en er rigtigt, og en tegning af cis-but-2-en er
  også but-2-en. Skriver eleven cis- eller trans-, skal det passe med formlen.
* Stammen for alkener og alkyner er "but" og endelsen "-2-en" (kædens navn uden
  -an); for alkaner, alkoholer og syrer er stammen "butan" som i bogens figur.
* Halogenalkaner står i forleddet: 2-brom er en sidegruppe, som i afsnit B3.1.
* Ingen aldehyder, ketoner, estere eller aminer (de er i `sb4.8`).

## Hvad man kan rette i

Alt indhold står i `js/data.js`: stofklasserne (`KLASSER`), det, der er slået til
fra start (`STANDARD`), stofferne (`STOFFER`: navn, stofklasse, niveau, fane,
`vend`) og værktøjerne (`VAERKTOEJ`). Et nyt stof er én linje med navnet;
molekylet bygges af navnet, og navnets dele læses af navnet. Selvtesten siger
til, hvis motoren giver stoffet et andet navn, hvis navnet ikke kan deles, eller
hvis stoffet ikke passer til stofklassen. Hint og forklaringer laves i `js/kemi.js`.

## Filer

```
index.html           siden: to faner, teorien og rundvisningen
css/stil.css         stilarket (fra sb4.8; det nye står nederst under SB3.1)
js/kerne.js          fælles hjælpefunktioner (som sb4.8)
js/data.js           stofklasserne, stofferne og værktøjerne
js/kemi.js           navnet i dele, sammenligningen af to molekyler, hint og forklaringer
js/fane.js           det fælles (fra sb4.8): scenekortet, listen, hjælpeknappen, musen
js/sim_tegn.js       fane 1
js/sim_skriv.js      fane 2
js/rundvisning.js    rundvisningen (som sb4.8, kun teksterne er nye)
js/app.js            faner, kontakterne, tastatur og tegneløkken
_selvtest.html       udviklerværktøj
```

Fra `../../molekylemotor/js/` hentes molekyle, navngivning, smiles,
trivialnavne, layout, struktur, navnlaeser, tavle og tegnebraet. Motoren er
ikke ændret.

## Genveje

`1` `2` fane, `R` ryd tavlen (fane 1), `Ctrl+Z` og `Ctrl+Y` fortryd og gentag
(fane 1), `Enter` test (fane 1) og tjek (fane 2), `H` eller `?` rundvisning,
`T` teori, `Esc` luk.

## Selvtest

`_selvtest.html` åbnes gennem en lokal server med `animationer/` som rod. 172
påstande: motoren giver hvert stof navnet fra data, navnet kan deles, og stoffet
passer til stofklassen; typiske forkerte navne og tegninger får den rigtige
forklaring (også alle navne talt fra den forkerte ende); kontakterne vælger
opgaverne og værktøjerne; alle opgaver løses på begge faner; der tegnes med musen
(træk, klik på enden, højreklik, −Br, = Binding, −COOH, Ring); intet tjekkes,
før der trykkes Test eller Enter, og kontakten Vis navnet hele tiden virker; hint
gør det rigtige gult; låsen virker; kortet dækker aldrig whiteboardet, og Test
står under tegnefeltet fra 1100 × 620 til 1600 × 950; teksterne er korte og uden
tankestreger.

## I menuen

Ikke endnu. Når brugeren siger til: en ny knap i
`kemi-b-filer/samling_b_bindinger_isomeri.html` (B3 Bindinger og isomeri) med
`../superanimationer/sb3.1_navngivning/index.html`, en ny `data-emne` (fx
`b3.navngivning`), navnet i `FEEDBACK_EMNER` i `samling_alt_b.html` og kolonnen
"I menuen" i `../README.md`. Kemibogen B kan linke til den fra boksen Prøv selv i
afsnit B3.1 (med `?med=alkohol,syre`), og kemi C kapitel 4 kan linke uden `?med`.
