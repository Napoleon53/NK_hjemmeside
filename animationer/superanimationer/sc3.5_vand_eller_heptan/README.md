# sc3.5: Vand eller heptan

Superanimation, der afløser `animationer/kemi-c-filer/c3.5_eksperiment_blandbarhed.html`
("Gæt polaritet"). I menuen fra 26. sept. 2026.

## Bestillingen

Skrevet, før der blev skrevet kode (se "Bestillingen, før der skrives kode" i
`../README.md`). Brugerens ønske (25. september 2026): c3.5 skal være en
superanimation, ikke rigtig en superlab-animation, men det må gerne være lidt
tydeligt, at det er et forsøg.

1. **Pointen:** polære grupper (OH, COOH, C=O, NH₂) trækker et stof mod vand, og
   carbonkæden trækker det mod heptan; forholdet mellem dem afgør, hvad stoffet
   blandes med. Forsøget i reagensglasset viser det: ét lag eller to.
2. **Afløser c3.5, og det her kommer med:** molekylerne (vand, heptan, urinstof,
   hexan-1-ol, glucose, glycerol, citronsyre), klikket på de polære grupper med
   den blå boble, søjlen med C-atomer mod de fundne polære grupper, at man
   trækker stoffet ned i vand eller heptan (den gamle sagde rensebenzin), og
   point. Det, den gamle gjorde godt visuelt: stort molekyle, tydelig boble om
   grupperne, to væsker side om side.
   **Det, der rettes:** der skete intet i væsken (kun en besked om rigtigt eller
   forkert); man måtte ikke prøve, før alle grupper var fundet; atomerne var grå
   kugler uden H, ikke strukturformler som i bogen; sorbinsyre er taget ud (den
   opløses kun lidt i begge, så forsøget kan ikke vise pointen).
3. **Naboerne, der ejer resten:** `sc3.3` ejer elektronegativitet og polære
   bindinger. `sc3.4` ejer bassinet med molekylerne som kugler (partikelniveauet,
   tætheden og rækkefølgen af lagene med vand, ethanol og olie). `sc6.2` fane 5
   (den gamle 6.5) ejer reglen "C-atomer pr. polær gruppe mod 4", de store
   molekyler og svaret "begge". Her er derfor kun små stoffer med et entydigt
   svar; ethanol, propanol og butanol er med vilje ikke med.
4. **Loftet:** 14 stoffer (8 i forsøget, 6 nye i gættelegen). 2 faner. På scenen
   1 stativ med 2 reagensglas, 1 prøveglas med pipette eller spatel og 1 kort
   med formlen. Stativet og glassene er med efter brugerens ønske om, at det må
   ligne et forsøg; resten af stoplisten er holdt ude: ingen flasker, man
   hælder med, intet affaldsglas, ingen uheld, intet forløb trin for trin.
5. **Layoutet:** toplinje, scene og panel. Scenen er bordet med hvide fliser bag
   glassene (så lagene kan ses) og kortet med formlen på væggen. Panelet har
   skemaet (fane 1) eller svaret, runden og de sorterede stoffer (fane 2).

## Hvad viser den

Åbn **`index.html`**. Mappen er selvstændig bortset fra `../../v2/kemichael/`, som
Kemichael hentes fra. Ingen `fetch` og ingen moduler, så den virker fra harddisken.

**Fane 1, Forsøget** (`#forsoeg`). Et glas vand og et glas heptan i et stativ.
Eleven vælger et stof i skemaet, trækker pipetten (væsker) eller spatlen (faste
stoffer) ned i et glas og klikker på glasset for at ryste det. Et klik på et tomt
glas er det samme som at trække pipetten derhen. Når glasset har lagt sig, står
iagttagelsen ved glasset og i skemaet: ét lag, to lag (med navnene på lagene),
opløst eller opløses ikke. Otte stoffer, 16 felter. Et nyt stof får nye glas.
Kortet på væggen viser strukturformlen.

**Fane 2, Gæt polaritet** (`#gaet`). Den gamle c3.5 med forsøget som facit. Et
stof ad gangen: eleven klikker på de polære grupper (blå boble; et klik på C
eller H blinker gråt), og søjlen stiller C-atomerne op mod de fundne grupper.
Så gætter eleven ved at trække pipetten ned i det glas, stoffet blandes med
(eller med knapperne Vand og Heptan). Stoffet kommer i glasset, glasset rystes
af sig selv, og når det har lagt sig, er svaret klart. Derefter testes det andet
glas også, og formlen viser facit: polære grupper blå, carbonkæden gul. Et
forkert svar får en forklaring, der passer til fejlen. En runde er ti stoffer,
fem af hver slags; de seks nye er altid med. Knappen i opgavekortet: Giv hint
(markerer alle polære grupper), Vis svaret, Næste stof. Rekorden huskes.

**Kemichael** tilbyder at præsentere hver fane (Start præsentation / Nej tak).
Ellers kommer han kun, når skemaet er fuldt (én gang pr. browser), når en runde
er slut, og ved påskeægget: ryst et færdigt glas seks gange mere.

**Teori** og **?** (rundvisningen) ligger i toplinjen.

Genveje: <kbd>1</kbd> <kbd>2</kbd> faner · <kbd>↑</kbd> <kbd>↓</kbd> stof og
<kbd>mellemrum</kbd> ryst (fane 1) · <kbd>←</kbd> vand, <kbd>→</kbd> heptan og
<kbd>Enter</kbd> næste (fane 2) · <kbd>R</kbd> nye glas eller ny runde ·
<kbd>T</kbd> teori · <kbd>H</kbd> rundvisning · <kbd>K</kbd> præsentation ·
<kbd>Esc</kbd> luk.

### Taget med og nyt

Fra den gamle: de syv molekyler (sorbinsyre taget ud), klikket på de polære
grupper med den blå boble og det grå svar på C og H, søjlen med C-atomer og
polære grupper, at man trækker stoffet ned i vand eller heptan, og point.

Nyt: forsøget i reagensglas, der er facit; strukturformler med alle atomer som i
bogen; iod og seks nye stoffer; skemaet; runden med rekord og de sorterede
stoffer; Kemichael, rundvisningen og teorien.

## Modellen

`js/glas.js`. Et glas har 5 mL opløsningsmiddel; en portion er 1 mL (en pipette)
eller en spatelspids, højst tre. Hvem der blandes med hvad, står kun ét sted:
`blandes` i `js/data.js`. Resten følger af det og af massefylden:

* **Væske, der blandes:** ligger først for sig med schlieren (over eller under
  efter massefylden) og bliver til ét lag, når glasset rystes.
* **Væske, der ikke blandes:** to lag, det tungeste nederst. En rystning giver en
  emulsion, der skiller sig ad igen på 1 til 2 sekunder.
* **Fast stof, der opløses:** kornene forsvinder, mens glasset rystes; én rystning
  opløser ca. én spatelspids, så tre kræver flere rystninger.
* **Fast stof, der ikke opløses:** kornene hvirvler op og lægger sig igen.
* **Iod** farver heptan violet og vand kun svagt brunt.

Resultatet kommer først, når glasset er rystet og har lagt sig.

`js/molekyle.js` læser strukturformlerne, som står tegnet som tekst i
`js/data.js`, og finder de polære grupper: COOH (med C'et), OH, H₂O, C=O og NH₂.
Selvtesten kontrollerer sumformlen og valensen af hvert atom.

### Tallene og kilderne

Massefylde ved 20 °C (Databogen): vand 0,998; heptan 0,684; glycerol 1,261;
hexan-1-ol 0,814; methanol 0,792; methansyre 1,22; ethan-1,2-diol 1,113;
pentan-1-ol 0,815; octan-1-ol 0,826; hexansyre 0,929 g/mL.

Opløselighed i vand ved stuetemperatur (CRC Handbook): hexan-1-ol ca. 6 g/L,
pentan-1-ol ca. 22 g/L, octan-1-ol ca. 0,5 g/L, hexansyre ca. 10 g/L, iod ca.
0,3 g/L. Glucose, urinstof og citronsyre over 900 g/L. Methanol, methansyre,
ethan-1,2-diol og glycerol blandes med vand i alle forhold. I forsøget er der
1 mL i 5 mL, så de tungtopløselige giver to lag.

Heptan: methanol, methansyre, ethan-1,2-diol, glycerol og vand blandes ikke med
heptan ved stuetemperatur (methanol og heptan har to lag op til ca. 50 °C).
Hexan-1-ol, pentan-1-ol, octan-1-ol og hexansyre blandes med heptan. Iod
opløses i heptan med violet farve. Glucose, urinstof og citronsyre opløses ikke.

Svarene passer med reglen i `sc6.2` fane 5 (C-atomer pr. polær gruppe under 4
giver vand, over 4 heptan), og intet stof ligger på grænsen. Selvtesten
kontrollerer det.

### Forenklinger, valgt med vilje

* Tungtopløselige stoffer (hexan-1-ol, iod i vand) vises som ikke opløst. Den
  smule, der opløses, ses kun som iodens svage skær.
* Rumfanget trækker sig ikke sammen, når to væsker blandes.
* Glasset er tegnet bredere end et rigtigt reagensglas, så lagene kan ses.
* Glucose er tegnet i den åbne kæde, ikke som ring. C=O tæller som én polær gruppe.
* I søjlen tæller alle C-atomer, også C'et i COOH og C=O.
* Emulsionen skiller sig hurtigere ad end i et rigtigt glas, så man ikke skal vente.

## Filer

```
index.html             toplinje, to faner, teori og rundvisning
css/stil.css           alt udseende (fælles del som sc4.2). NB: decimaltal med PUNKTUM i CSS
sprites/reagensglas.svg    glasset; indholdet tegnes bag det
sprites/stativ.svg         stativet bag glassene
sprites/stativ_forkant.svg pladens forkant, tegnes oven på glassene
sprites/pipette.svg        pasteurpipette med gummisut
sprites/spatel.svg         spatel til de faste stoffer
sprites/proeveglas.svg     glasset med stoffet og etiketten
js/kerne.js            NK-navnerum, lærred, tekst (samme som sc4.2)
js/data.js             stofferne, deres formler som tekst, replikkerne
js/sprites.js          indlæser sprites; målene står i MAAL
js/molekyle.js         læser og tegner strukturformlerne, finder de polære grupper
js/glas.js             reagensglasset: modellen og tegningen af indholdet
js/tegning.js          rummet, bordet, kortet, søjlen, prøveglasset, mærkaterne
js/praesentation.js    tilbuddet om præsentationen (samme fil som i sc1.2)
js/bord.js             scenen, begge faner deler: layout, pipetten, musen
js/sim_forsoeg.js      fane 1: skemaet og linjen under scenen
js/sim_gaet.js         fane 2: runden, svaret og forsøget som facit
js/laerer.js           Kemichael
js/rundvisning.js      rundvisningen bag ?
js/app.js              faneskift, genveje og tegneløkken
_selvtest.html         udviklerværktøj, indgår ikke i animationen
```

## At rette i den

* **Et nyt stof** er ét objekt i `D.STOFFER` i `js/data.js`: navn, formel,
  sumformel, tilstand, massefylde, `blandes` og strukturformlen som tekst. Læg
  id'et i `D.FORSOEG` (fane 1) eller `D.GAET_NYE` (fane 2), og ret tallene i
  selvtesten. Vælg kun stoffer med et entydigt svar.
* **Replikkerne** står nederst i `js/data.js`.
* **Tempoet** i glassene (rystning, emulsion, opløsning) står i `js/glas.js`.

## Selvtesten

`_selvtest.html` åbner `index.html` i en iframe og kontrollerer strukturformlerne
(sumformel, valens, afstand), de polære grupper og C-atomerne, reglen fra
nabo-animationen, alle 28 forsøg (rigtigt glas, lagenes rækkefølge, tempo),
fane 1 med musen og skemaet fuldt, fane 2 med musen, knapperne, hintet og en hel
runde, Kemichael, sproget og layoutet fra 520 × 380 til 1500 × 900. Chrome kræver
`--allow-file-access-from-files` eller en lokal server.

## I menuen

I menuen fra 26. sept. 2026 som c3.5 i `kemi-c-filer/samling_c3.html` og i
`samling_NV.html`. Den gamle ligger i
`kemi-c-filer/arkiv/c3.5_eksperiment_blandbarhed_oldversion.html`.
