# Kan du løse opgaven? (flowchart)

Brugerens flowchart "Kan du løse en opgave" fra Word (KE-teamet, 1.1 Grundstoffer og
reaktionsskemaer) som interaktiv side. Eleven svarer Ja eller Nej i hver kasse, og hvert
svar bliver tjekket med en kort, sarkastisk udfordring. Kan eleven ikke stå inde for sit
svar, bliver brikken sendt tilbage ad pilen.

Det er ikke en superanimation om et kemisk begreb, men et studieværktøj, der deler
rammen (toplinje, scene, panel). Generel udgave: ingen fagligt indhold og ingen Kemichael
(brugerens ønske, 26. sept. 2026). Ikke i menuen og skal ikke i samlingerne.

## Bestillingen

1. **Pointen i én sætning:** Når du sidder fast, prøver du selv, sidemanden, bogen og
   klassen, før du rækker hånden op, og du skal kunne stå inde for hvert ja og nej.
2. **Hvad den afløser, og hvad der skal med:** Word-flowchartet. Alle 16 kasser, alle
   pile og formuleringerne kommer med, og layoutet er det samme, så eleverne kan
   genkende det. Tonen bevares. Nyt: udfordringen efter hvert svar og vejen tilbage.
3. **Naboerne:** ingen. Intet fagligt indhold, ingen Kemichael. En faglig udgave kan
   senere komme som en variant af den her.
4. **Loftet:** én side uden faner, 16 kasser, 24 pile, én brik. Hver udfordring har
   3 eller 4 svar. Højst to varianter af hver udfordring.
5. **Layoutet:** flowchartet på papir er scenen og følger brikken. Panelet til højre
   viser kassen, man står i, udfordringen og flowchartets kommentar til det sidste svar.

## Sådan virker den

* Brikken starter i "Kan du løse opgaven?". Ja og Nej kan vælges i panelet eller på
  pilene i flowchartet.
* Et **Ja** skal bevises. Et **Nej** skal uddybes. Et ærligt Nej, der fører til en
  "Gør det!"-kasse, giver i stedet valget mellem nogle undskyldninger, som alle bliver
  afvist, og brikken går videre til kassen.
* Et forkert svar giver en kommentar, og brikken slås tilbage ad pilen som i ludo, til
  den kasse, der passer: typisk "Gør dig umage!" eller "Gør det!". Pilen bliver rød.
* "Gør det!"-kasserne siger konkret, hvad man skal gøre. Den fælles "Gør det!" efter
  sidemanden og bogen skifter tekst efter, hvor man kom fra.
* Ved "Ræk hånden i vejret" får brikken en hånd og et nummer i køen.
* "Kig på de næste opgaver" kræver et konkret spørgsmål. "Jeg kan ikke finde ud af
  det" er stadig ikke et spørgsmål.
* Ved GODT ARBEJDE står antallet af gange, man blev sendt tilbage, og en bemærkning, der
  afhænger af vejen. Konfettien er tre stykker.
* Påskeæg: klik på GODT ARBEJDE, før man er der.

Genveje: <kbd>J</kbd> ja, <kbd>N</kbd> nej, <kbd>1</kbd> til <kbd>4</kbd> svar,
<kbd>Enter</kbd> knappen i "Gør det!", <kbd>V</kbd> vis hele, <kbd>R</kbd> forfra,
<kbd>H</kbd> hjælp, <kbd>Esc</kbd> luk.

## Rettelser i forhold til Word-filen

* "mens du veter" er rettet til "mens du venter".
* Parentesen i "Kig på de næste opgaver" har fået punktum i stedet for tankestreg.

## Filer

| Fil | Indhold |
|-----|---------|
| `index.html` | siden |
| `css/stil.css` | stilarket (samme mørke ramme som superanimationerne, flowchartet på hvidt papir) |
| `js/data.js` | **alt indhold**: kasser og pile med koordinater, udfordringer, "Gør det!"-tekster, sluttekster |
| `js/kerne.js` | tilstanden: hvor brikken er, hvilken udfordring der er fremme, hvor et svar fører hen |
| `js/tegning.js` | flowchartet som SVG, brikken, stemplet og konfettien |
| `js/app.js` | panelet, knapperne, genvejene og kameraet, der følger brikken |
| `_selvtest.html` | tjekker data, sproget, at alle veje ender i GODT ARBEJDE, og at teksten kan være i kasserne |

## Hvad man kan rette i

Alt tekstindhold står i `js/data.js`. En udfordring har et spørgsmål og 3 til 4 svar.
`ok: true` betyder, at svaret holder. Et svar uden `ok` sender eleven til `fejlTil`
(eller svarets eget `til`). Undskyldninger (`undskyldning: true`) fører altid videre.
Kør `_selvtest.html` bagefter (kræver en lokal server, som de andre selvtests).

Kassernes koordinater følger billedet i Word-filen (957 × 1231 px), let rettet op.
