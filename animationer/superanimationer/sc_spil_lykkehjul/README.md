# sc_spil_lykkehjul: Kemi-Lykkehjulet

Et lykkehjulsspil til tavlen. Klassen spiller i hold, læreren styrer, og spillet
holder styr på hjulet, gåderne og pointene. Hører til kategorien Spil
(`kemi-c-filer/samling_c_spil.html`), ligesom `sc_spil_jeopardy`.

## Bestillingen

1. **Pointen i én sætning.** Klassen repeterer fagbegreber som hold i et
   lykkehjulsspil på tavlen, og læreren skal kun læse op og trykke.
2. **Hvad den afløser.** PowerPoint-skabelonen (Rusnak Creative, "Wheel of
   Fortune") i seks filer i NK_Undervisning_tungt: lykkehjulquiz kemi A, B, B 2024,
   C (samme fil som B), NF og "WheelofFortune5.6 2z 2020 NK". Med er: tre hold i
   rød, gul og blå, gådetavlen med 12, 14, 14 og 12 felter, kategorien under
   tavlen, toss-up, runder med hjulet (konsonant, køb vokal for 250 kr., fallit,
   mist tur, løs), finalen med R S T L N E, 3 + 1 bogstaver, 10 sekunders ur og
   præmiehjulet, og de ti lyde. Makroerne, Edit mode og Puzzle Generator er ikke
   med: quizzen er tekst (se nedenfor).
3. **Naboerne.** Kemi-Jeopardy (`sc_spil_jeopardy`) ejer ledetråd og svar.
   Hangman (`c_spil_hangman.html`) ejer ét ord, som én elev gætter. Her gætter
   holdene på en hel løsning på en tavle med hjul og point.
4. **Loftet.** 2 til 4 hold, højst 20 gåder og én finale pr. quiz, ét hjul med 24
   felter, ét præmiehjul, 10 lyde. Ingen faner: én skærm, der skifter mellem
   titel, tavle, hjul og plakat.
5. **Layoutet.** Toplinje, scenen med tavlen under lysende buer, styringen med
   bogstaverne og knapperne, og podierne i holdfarver nederst. Hjulet dækker
   scenen og styringen, når det drejer.

## Filer

| Fil | Indhold |
|-----|---------|
| `index.html` | toplinje, scene, styring, podier, hjulscene, titel og vinduerne |
| `css/stil.css` | alt udseende |
| `js/kerne.js` | fælles hjælpere (som i `sc_spil_jeopardy`) |
| `js/data.js` | **de indbyggede quizzer** (som tekst), hjulene og Kemichaels replikker |
| `js/tavle.js` | sætter en løsning op på tavlens fire rækker |
| `js/tekstformat.js` | quizzen som tekst: læs, skriv, link og vejledning til AI |
| `js/spil.js` | reglerne og pointene, uden tegning, med Fortryd |
| `js/lyd.js` | de originale lyde, hvis de findes, ellers spillets egne |
| `js/hjul.js` | hjulet som SVG og drejet |
| `js/visning.js` | tavlen, bogstaverne, knapperne, podierne og plakaten |
| `js/editor.js` | biblioteket med quizzer og vinduet Quizzer som tekst |
| `js/sprites.js`, `js/laerer.js` | Kemichael (som i `sc_spil_jeopardy`) |
| `js/praesentation.js` | tilbuddet Start præsentation / Nej tak (fælles mønster) |
| `js/rundvisning.js` | rundvisningen bag ? |
| `js/app.js` | forløbet, knapperne og tastaturet |
| `sprites/` | titlen, tavlens ramme, flisernes emblem, buerne og stjernerne |

## Quizzerne

De indbyggede står i `js/data.js` i det samme tekstformat, som læreren skriver i.
Linket vælger: `index.html` er Kemi B, `#a` er Kemi A, `#nf` er NF.

* **Kemi B, grundbegreber** (standard) er fra "Afsluttende lykkehjulquiz kemi B
  2024.pptm". Redox (*Oxidation er afgivelse af elektroner*) og syre-base (*En
  buffer holder pH næsten konstant*) er tilføjet, så B-kernestoffet er dækket.
* **Kemi A** og **NF** er fra de to andre filer.
* Rettet fra skabelonen: *Chatelier* hedder nu *Le Chateliers princip*, og
  *Gibbsfri energi* er *Gibbs fri energi*. Lange ord er delt med bindestreg, som
  skabelonen gjorde (*Substitutions-reaktion*, *Elektro-negativitet*).
* Ikke med: den ældste B-fil (*Plastic*, *Anthocyaniner*) og 2z-filen fra 2020,
  som ikke havde en finale. De kan skrives ind som egne quizzer.

## Quizzer som tekst

Knappen på titelskærmen åbner teksten til venstre og tavlerne til højre, som de
kommer til at se ud. Fejl vises med linjenummer, mens man skriver, og et klik på
fejlen markerer linjen.

```
Titel: Kemi B, grundbegreber

Toss-up: Organisk kemi ; Substitutions-reaktion
Runde: Ligevægte ; Le Chateliers princip
Toss-up 2000: Begreb ved reaktionsskemaer ; Tilstandsform
Final: I naturen ; Koffein
```

* Én gåde pr. linje. En toss-up giver 1.000 kr., hvis der ikke står et beløb.
* Et ord over 14 tegn deles med bindestreg. `/` tvinger et linjeskift. `//` er en
  kommentar. `[ ]` fra skabelonen fjernes.
* **Upload fil** og træk-og-slip læser en .txt, **Eksportér fil** gemmer en.
* **Kopiér link** giver et link med quizzen i (`#quiz=...`). Den, der åbner det,
  får quizzen gemt blandt sine egne. Åbnes spillet fra harddisken, peger linket på
  kemiformler.dk, så det virker først, når mappen er sendt op.
* **Kopiér vejledning til AI** giver formatet og reglerne, så en AI kan skrive en
  quiz ud fra et emne.
* En egen quiz gemmes i browseren. En rettet indbygget quiz gemmes som en ny.

## Lydene

Lydene er tv-programmets og ligger derfor ikke her. De ligger som mp3 i
`C:\NK_Undervisning\Lykkehjul-lyde\` (det private repo) og hentes kun, når spillet
åbnes fra harddisken. På kemiformler.dk spiller spillet sine egne lyde, lavet i
`js/lyd.js` (`SYNTESE`); dér kommer hjulets klik fra pindene, der passerer viseren.
Titelskærmen viser, hvilke lyde der bruges.

## Forenklinger

* Dansk alfabet: Y er en vokal, og Æ, Ø og Å er med. Accenter fjernes (é bliver E),
  og tal og tegn står fremme fra starten.
* Hjulet har skabelonens beløb og én Fallit og én Mist tur. Wild card og Free spin
  er ikke med. Alle felter er lige sandsynlige.
* Den, der løser en runde, får mindst 1.000 kr., som i tv. De andre hold mister
  rundens point.
* Ingen summer. Holdene rækker hånden op, og læreren trykker Svarer på podiet
  (eller 1 til 4).
* Finalen spilles af holdet med flest point; læreren kan vælge et andet hold.
  Kuvertens beløb trækkes, når præmiehjulet stopper, og vises først til sidst.
* Kemichael præsenterer kun titelskærmen og har intet baggrundsliv, så han aldrig
  går hen over tavlen.

## Selvtesten

`_selvtest.html` skal køres gennem en lokal server og i rigtig tid (se noten om
headless Chrome). Spillet kører 25 gange hurtigere under testen (`NK.tempo`), og
hjulet kan tvinges til et felt (`NK.app.ui.tvungetFelt`).

## Menuen

Ikke i menuen endnu. Når brugeren siger til: en knap i
`kemi-c-filer/samling_c_spil.html` med `data-emne="spil.lykkehjul"`, der peger på
`../superanimationer/sc_spil_lykkehjul/index.html`, og en linje i
`FEEDBACK_EMNER`. Ret så kolonnen "I menuen" i `../README.md`.
