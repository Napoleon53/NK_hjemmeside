# Taleboblen

Boblen er det sted, hvor flere personer først kommer i karambolage, og den
er samtidig det, eleven kigger mest på. Derfor har den sit eget dokument.

## Status 18. september 2026

Bygget som `laboratoriet/js/taleboble.js` (`NK.Taleboble`) — ikke `boble.js`,
fordi »boble« i motoren allerede er zoomboblen i panelet. Punkt 3, 4 og 5
nedenfor er gjort: ankring i `laererMund()` med hovedets mål, vending til
højre/venstre/under når der ikke er plads over, inden for scenen, uden om
det glas replikken peger på (`L.undgaa`), halen ender ved issen, og al stil
står i `STIL`. Dertil én ting, der ikke stod på listen: skriften holder en
mindste størrelse på skærmen (14 px), så hele boblen vokser, når bordet er
zoomet ud — det afgør DOM-spørgsmålet nedenfor til fordel for canvas.
Punkt 1 og 2 (kanal og kø i laget) venter på taler nummer to; det, der
havde en kunde nu — at et uheld ikke må sluge en forløbsreplik — er løst i
`laerer.js` (`laererAfbryd`: resten af replikken lægges forrest i køen).
De gamle animationer indlæser ikke laget og tegner boblen som før.
`_taleboble.html` viser laget arbejde; sb2.4's selvtest afsnit 14 og 15
holder øje med det.

## Som den er i dag

Tegnet i canvas i `kemichael.js` (`tegnTaleboble`, `bobleLinjer`,
`bobleHoejde`). Afrundet rektangel med hale ned mod et punkt, hvid-gullig
bund `#fffdf6`, mørk streg `#2a2f36`, fed 17 px Segoe UI, højst 360
tegneenheder bred, linjeafstand 21, linjebrydning på hele ord.

Tre ting er allerede rigtige og skal ikke laves om:

**Visetiden.** Boblen står 10 % længere end det, scenen beder om, og aldrig
kortere end det tager at læse linjen (`K.taleTid`). Det er nøjagtig den
rigtige regel, og den var på ønskesedlen, før koden var læst.

**Ingen afbrydelse.** Klik preller af, mens boblen står. En ny scene venter.
`{ taleFaerdig: true }` venter på det samme.

**Linjebrydning.** Lange replikker brydes over flere linjer i stedet for at
løbe ud af scenen.

## Fem ting, der skal ændres

**1. Boblen skal være en kanal, ikke en egenskab ved figuren.**
I dag hører boblen til Michael og tegnes som en del af ham. Med to personer
giver det to bobler, der kan lægge sig oven på hinanden, og to figurer, der
taler i munden på hinanden. Boblen skal flyttes ud som ét lag, der ved,
hvem der taler, og som kun viser én ad gangen.

**2. Kø og prioritet.** Når kanalen er optaget, skal en ny replik enten
stille sig i kø, erstatte den siddende eller kasseres. Foreslået rangorden,
højest først: svar på elevens direkte handling; besked fra forløbet, som
eleven skal have; kommentar til bordets tilstand; baggrundsliv og småsnak.
En lavere replik venter aldrig i kø bag flere end én — den kasseres i
stedet. Det er den regel, der forhindrer, at flere personer bliver til støj:
**en person, der ikke har noget nyt at sige, tier.**

Reglen om ikke at blive afbrudt gælder fortsat inden for samme rang. Kun en
højere rang må overtage en boble, der står.

**3. Ankring i figurens eget mundpunkt.** I dag klemmes boblen ind mellem
scenens kanter (`NK.Scene.BREDDE`), og halen klemmes ind i boblen. Det
virker, fordi der kun er én figur, og fordi hun står, hvor hun står. Med
stationer, zoom og personer i forskellige planer skal figuren selv oplyse
et `mundPunkt` i verdenskoordinater, og boblen skal placeres derefter.
Boblen skal kunne vende: over hovedet som nu, men under eller til siden, når
der ikke er plads over.

**4. Boblen må ikke dække det, replikken handler om.** Den eneste regel i
hele dokumentet, som er didaktisk og ikke kosmetisk. Peger en replik på et
bestemt glas, skal boblen lægge sig et sted, hvor glasset stadig kan ses.
Samme henvisning kan bruges til at få figuren til at dreje hovedet eller
pege — det er den billigste bevægelse i projektet med den største virkning.

**5. Udseendet skal være tokens, ikke tal i tegnefunktionen.**
Farve, streg, skrift, radius og linjeafstand skal ligge ét sted. Forskellen
mellem to personers bobler skal være én farve, aldrig et nyt layout. Ellers
holder paletten ikke visuelt sammen, og det er hele pointen.

## Canvas eller DOM

Den oprindelige anbefaling var et DOM-lag oven på lærredet: rigtig
linjeombrydning, skarp skrift ved enhver zoom, CSS-overgange og skærmlæser
gratis.

Efter at have set koden er den anbefaling svagere, end den var. Boblen i
canvas er allerede skrevet, den virker, den har linjebrydning, og den skal
kunne tegnes i en tegneserierude, hvor der ikke er noget DOM at hænge den
op i. Et skifte til DOM er derfor ikke en lille forbedring, men en
omskrivning med et halerør af følgefejl.

Forslaget er i stedet at tage de fem punkter ovenfor i canvas, hvor boblen
allerede bor, og lade spørgsmålet om DOM vente til zoomarbejdet. Er skriften
stadig utydelig ved den zoom, der ender med at blive valgt, er DOM svaret —
og til den tid er boblen samlet ét sted, så flytningen er overkommelig. Er
skriften tydelig nok, er der ingen grund.

## Reglen, der ikke må glemmes

**Intet, der betyder noget, må kun findes i en boble.** Replikker skal også
lande i logbogen. Så kan boblen være kort og flygtig, uden at eleven mister
information ved at kigge væk et øjeblik — og så er det heller ikke et
problem, at en lavprioritetsreplik bliver kasseret.
