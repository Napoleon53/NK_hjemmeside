# sc8.0 Redoxreaktioner

En superanimation i sin egen mappe. Åbn **`index.html`**. Mappen henter kun
filer inde fra sig selv (og papirkortet i `../faelles/`) og virker også, når den
åbnes direkte fra harddisken. Der er ingen Kemichael. Al tekst står på
papirkortet øverst midt i scenen, og den gule hintknap sidder på kortet.

Den hører til Kemibogens afsnit 8.1 Redoxreaktioner, som ikke havde en
animation. Den er knap 1 i C8 fra 13. nov. 2026 (koden `c8.redox`). Mappen hedder
8.0, fordi `sc8.1` er Spændingsrækken; de andre mapper i kapitel 8 er ikke omdøbt,
fordi bogen linker direkte til dem (se "I menuen").

## Bestillingen (12. november 2026)

Brugeren: "Lav følgende superanimation: Afsnit 8.1 Redoxreaktioner. Det er
kapitlets grundbegreber: oxidation, reduktion, delreaktioner og oxidations- og
reduktionsmiddel. Resten af kapitlets animationer bygger videre på dem, men ingen
af dem viser selve begreberne. Idé: Magnesium brænder, og luppen viser
elektronerne gå fra magnesium til oxygen. Eleven skriver de to delreaktioner ved
at trække e⁻ på plads og sætter mærkaterne på. Til sidst sammenlignes det med
syre-base-reaktioner, hvor det er hydronen, der flytter sig."

1. **Pointen:** I en redoxreaktion overføres elektroner fra reduktionsmidlet,
   som oxideres, til oxidationsmidlet, som reduceres, og der afgives lige så
   mange elektroner, som der optages.
2. **Hvad den afløser:** intet. Den er bygget fra bunden. Figurerne er bogens:
   `mg-trin-1` til `-3` (tangen, båndet, skålen og luppen med Mg og O), og
   `delreaktioner` og `hcl-vand` (figur 7.2: den orange hydron, hvis elektron
   bliver hos chlor). Knapperne Før, Brænder og Efter under luppen er bogens
   trinvise figur i 8.1.
3. **Naboerne:** `sc8.1_spaendingsraekken` ejer, hvilke metaller der reagerer med
   hvilke ioner; `sc8.2_oxidationstal` ejer oxidationstal, og
   `sc8.3_redoxafstemning` afstemning med H⁺ og vand. Her er der ingen
   oxidationstal, ingen spændingsrække og ingen afstemning ud over at gange
   delreaktionerne, så der afgives lige så mange elektroner, som der optages.
   `sc7.1_syrebasereaktioner` ejer syre/base-reaktioner; her er kun én
   (HCl + H₂O) som sammenligning. `sc8.7_byg_figuren` sætter fagordene på bogens
   figur; her skriver eleven selv delreaktionerne, før mærkaterne sættes på.
4. **Loftet:** tre faner, 13 opgaver (4 + 6 + 3) og tre ekstraopgaver på fane 2
   med fire reaktioner hver. Fane 1: ét bånd, én skål og én
   lup med 2 Mg og 1 O₂. Fane 2: ét ark med to reaktioner (magnesium og
   dioxygen, jern og dioxygen fra bogens håndvarmer), elektroner og fire
   mærkater. Fane 3: to kort med en lup hver og fire reaktioner at sortere.
5. **Layoutet:** scene plus panel. Øverst et lavt papirkort. Fane 1:
   makroniveauet til venstre og luppen til højre (som bogens figur). Fane 2:
   arket under kortet og bakken med brikkerne under arket. Fane 3: de to kort
   side om side og bakken under dem.

Stop-listen er overholdt: der hældes ikke, og der er intet affaldsglas, intet
uheld og intet forløb trin for trin. Båndet antændes med ét klik.

## Fanerne

**1 Magnesium brænder** (`#brand`). En tang holder et magnesiumbånd over en
skål. Et klik på enden af båndet antænder det: et skarpt, hvidt lys løber ind
mod tangen, der stiger hvid røg op, og et hvidt pulver samler sig i skålen.
Luppen viser imens overfladen af båndet: de to oxygenatomer fra et
dioxygenmolekyle kommer ned over to magnesiumatomer, og hvert magnesiumatom
afgiver sine 2 yderste elektroner i en blå bue ("2 e⁻") til et oxygenatom.
Atomerne bliver til Mg²⁺ (rød, mindre) og O²⁻ (blå, større), og til sidst ligger
de i et iongitter som i bogens mg-trin-3. Når båndet har brændt, står Før,
Brænder og Efter under luppen; Brænder (eller et klik på luppen) viser hele
forløbet igen, også båndet. Fire opgaver: hvor elektronerne blev overført fra og
til, oxidation (hvilket stof, og at ladningen stiger fra 0 til +2), reduktion
(hvilket stof, og at et dioxygenmolekyle optager 4 elektroner) og at de to altid
sker samtidig (redoxreaktion). Fagordene indføres på kortet ("At afgive
elektroner kaldes en oxidation.") og bruges straks i spørgsmålet.

**2 Delreaktioner** (`#delreaktioner`). Et lyst ark med faste pladser fra start:
reaktionen øverst (først i ord) og de to delreaktioner under den med en stiplet
plads til e⁻ på hver side af pilen. Eleven trækker elektroner fra bakken hen på
en plads (eller klikker på pladsen) og får én mere dér; minus eller et træk væk
tager én af. Seks opgaver: delreaktionen for magnesium, delreaktionen for
dioxygen, hvor mange magnesiumatomer der går på ét O₂ (arket får 2 Mg, 4 e⁻ og
2 Mg + O₂ → 2 MgO i grønt), mærkaterne Oxidation og Reduktion foran
delreaktionerne (bagefter i bogens farver), Reduktionsmiddel og
Oxidationsmiddel under Mg og O₂ i reaktionen øverst, og håndvarmeren (jern og
dioxygen: begge delreaktioner, 4 jernatomer på 3 dioxygenmolekyler og hvilket
stof der er reduktionsmidlet). Forklaringen til en forkert delreaktion passer til
fejlen: forkert side, forkert antal (Mg²⁺ har ladningen +2), 2 i stedet for 4 til
O₂ og elektroner på begge sider (`D.eFejl` i `js/data.js`).

**Ekstraopgaverne på fane 2** (13. nov. 2026, brugeren: "nogle ekstraopgaver
(uden alt for mange animationer) ... med forskellige sværhedsgrader ... i fane 2,
så man også lige får det trænet uden mega-stilladsering"). Nederst i listen under
overskriften Ekstraopgaver: Let, Middel og Svær med fire reaktioner hver i
tilfældig rækkefølge. Let (magnesium og dichlor, natrium og dichlor, zink og
kobber(II)ioner, calcium og dioxygen): elektronerne i begge delreaktioner; tallene
foran og reaktionen øverst kommer af sig selv. Middel (lithium og dioxygen, kalium
og dibrom, kobber og sølv(I)ioner, zink og dioxygen): også tallene foran. Svær
(aluminium og dioxygen, aluminium og dichlor, jern og dichlor, aluminium og
kobber(II)ioner): begge delreaktioner skal ganges, og bagefter skal eleven finde
reduktions- eller oxidationsmidlet. Tallene foran sættes med et klik på den
stiplede plads foran delreaktionen (minus tager ét af; tom er 1), og elektronerne
på arket ganges med, så eleven kan se, om der afgives lige så mange, som der
optages. Forkerte tal giver "Der afgives 6 elektroner, men der optages 4" eller
"tallene kan være mindre" (`D.gangeFejl`). Hintene er de samme for alle
reaktioner, så der er mindre stilladsering end i opgave 1 til 6. Ekstraopgaverne
tæller ikke med i "løst", og Næste opgave efter opgave 6 går til fane 3, ikke til
ekstraopgaverne (`ekstra` i `js/fane.js`). En ekstraopgave er ét mål med en liste
af dele (`o.dele`, ny i `js/fane.js`), og `nyFase` lægger den næste reaktion på
arket.

**3 Syre/base og redox** (`#sammenlign`). To lyse kort side om side.
Syre/base-reaktionen HCl + H₂O med en lup, hvor det orange H bliver overført som
hydron, og dets elektron (en lille orange prik) bliver hos chlor, så chlor bliver
blå (Cl⁻) og vandet rødt (H₃O⁺). Det, der er på vej over, står med H⁺ og er
mindre end hydrogenatomet (brugeren 13. nov. 2026: "det bør være en h+, der
overføres på tegningen. Det er fint den er lidt mindre"). Redoxreaktionen 2 Mg + O₂ med samme lup som på
fane 1. Tre opgaver: klik på begge lupper og svar på, hvad der blev overført fra
HCl til H₂O (en hydron, ikke et hydrogenatom); sæt Syre, Base, Reduktionsmiddel
og Oxidationsmiddel under de fire stoffer (bagefter står "afgiver en hydron",
"optager elektroner" osv. under mærkaterne) og svar på, hvad de to har til fælles
("Et reduktionsmiddel er ikke en syre, men de to har én ting til fælles";
brugeren 13. nov. 2026 ville ikke have, at et reduktionsmiddel "svarer til" en
syre); og sortér fire reaktioner (NH₃ + HCl,
Zn + Cu²⁺, eddikesyre + OH⁻, 2 Na + Cl₂) i de to kort. Lupperne er skjult i den
sidste opgave, for den handler om formlerne.

Kontakten **Elektronprikker** i panelet (og tasten E) viser de yderste elektroner
som prikker i par inden i kuglerne i begge lupper (brugeren 13. nov. 2026: "en
toggle ... diskret kunne tegne 8 elektroner rundt om O²⁻ på redoxreaktionen, og
blot 0 elektroner rundt om Mg²⁺"). Oxygen har 6 (i dioxygen er 4 af dem fælles),
magnesium de 2, der overføres, og bagefter har O²⁻ 8 og Mg²⁺ ingen. Chlor og
oxygen i saltsyre-luppen har 8, og hydrogenatomets egen elektron er orange og
bliver hos chlor. Kontakten er slået fra, hver gang siden åbnes.

## Papirkortet og hjælpen

Papirkortet fra `../faelles/papirkort.css` og `papirkort.js` (`body
class="papirkort"`). Et svar på et spørgsmål vælger kun, og **Indsend svar**
bedømmer det. Et forsøg med brikker har også Indsend svar; at antænde båndet og
at klikke på lupperne har ikke (`indsend: false` i `js/data.js`, `medIndsend` i
`js/fane.js`). Efter et rigtigt svar bliver kortet på spørgsmålet med svaret
grønt og forklaringen under. Giv et hint er en stille knap med gul kant: tre
hint og så Vis svaret. Start forfra står i panelet, aldrig på kortet. Det, en del
handler om, får en rolig gul ring (`om` i `js/data.js`), og et klik i scenen,
mens kortet viser et spørgsmål, får kortet til at blinke (låsen i `js/fane.js`).
At se forløbet igen (Brænder, et klik på en lup) er altid tilladt.

## Filerne

| Fil | Hvad den gør |
|:--|:--|
| `index.html` | de tre faner, teorien og rundvisningen |
| `css/stil.css` | stilarket fra sc4.6 (uændret) |
| `js/kerne.js` | fælles hjælpefunktioner fra sc4.6 |
| `js/data.js` | opgaverne, teksterne, reaktionerne og forklaringerne til forkerte svar |
| `js/tegning.js` | kugler, elektroner, formler med hævet og sænket skrift, buede pile, lupperne, tangen, båndet, skålen, lyset, arket og brikkerne |
| `js/lup.js` | mikroniveauet: `NK.MgLup` (magnesium og dioxygen) og `NK.HclLup` (saltsyre og vand), tegnet ud fra tiden i forløbet |
| `js/fane.js` | scenekortet, hinttrappen og låsen fra sc4.6 (ny: `medIndsend`) |
| `js/sim_brand.js` | fane 1 |
| `js/sim_del.js` | fane 2 |
| `js/sim_sammen.js` | fane 3 |
| `js/rundvisning.js` | rundvisningen bag ? |
| `js/app.js` | faneskift, teorien, tastaturet og tegneløkken |
| `_selvtest.html` | selvtesten (udviklerværktøj) |

Teksterne rettes i `js/data.js`. Formler skrives med markup: `O_2`, `Mg^{2+}`,
`e^−`; `D.uni` laver dem om til tekst, og `Tg.formel` tegner dem.

## Forenklinger

* Kun de elektroner, der bliver overført, er tegnet: de 2 yderste elektroner på
  hvert magnesiumatom. Oxygens egne elektroner er ikke tegnet, og når atomerne er
  blevet til ioner, er elektronerne en del af oxidionen.
* Luppen viser to magnesiumatomer og ét dioxygenmolekyle, som i bogen
  (2 Mg + O₂ → 2 MgO). Iongitteret bagefter er et skakbræt af Mg²⁺ og O²⁻ med
  ionernes rigtige størrelsesforhold (O²⁻ er større end Mg²⁺).
* Neutrale atomer er grå, positive ioner røde og negative ioner blå, som i bogens
  figurer; i saltsyre-luppen er det hydrogenatom, der overføres, orange.
* Båndet brænder på 6 sekunder, så forløbet i luppen kan følges.

## I menuen

Ja, fra 13. nov. 2026 (brugeren: "Når du er færdig med denne session, må du gerne
lægge denne animation i menuen"): knap 1 "Redoxreaktioner" i
`kemi-c-filer/samling_c8.html` med koden `c8.redox`, nr. 1 i C8 i `FEEDBACK_EMNER`
i `samling_alt.html` og linjen til `til_panelet.js` øverst i `<head>`. De andre
knapper i C8 er rykket et nummer ned på skærmen, men deres mapper og koder er de
samme (`c8.1` er stadig Spændingsrækken), for Kemibogens afsnit 8.2 til 8.4 linker
direkte til mapperne `sc8.1` til `sc8.4`. Skal mapperne følge knapperne, bliver
de `sc8.2` til `sc8.5` og korrosion `sc8.7`, som støder sammen med
`sc8.7_byg_figuren`; det er brugerens valg. Kemibogens afsnit 8.1 kan få en Prøv
selv-linje, når brugeren beder om det.

## Selvtest

`_selvtest.html` (gennem en lokal server): teksternes længde og sprog,
forklaringerne til forkerte delreaktioner, alle 13 opgaver løst med musen (også
med forkerte svar først og med Vis svaret), låsen og kortets og tegningernes
plads fra 1100 × 620 til 1600 × 950, ekstraopgaverne (alle tre løst med musen, ladningen
på begge sider af hver delreaktion, de mindste tal foran) og kontakten med
elektronprikker. 13. nov. 2026: ALT OK (272 påstande).
