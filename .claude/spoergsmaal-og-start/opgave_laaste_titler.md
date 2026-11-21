# Låste opgavetitler i alle superanimationer

Du er én af seks hjælpere. Du sætter én ny regel ind i nogle superanimationer (listen står i din besked). Svar og skriv på dansk.

## Reglen (Niels 21. nov. 2026, "husk dette" og "Den regel skal bare ind med det samme")

Fra `~/NK_hjemmeside/CLAUDE.md`, afsnittet "Opgaver og hints i animationerne":

> Opgavelisten viser kun titlerne på de løste opgaver og den, eleven er ved. De kommende står som et nummer uden titel og låses op i takt med, at eleven kommer videre. Eleven må gerne kunne se, hvor mange opgaver der kommer, men ser ikke alle overskrifter på én gang.

Hans egne ord: "Måske skal overskrifterne også unlockes i takt med at man kommer videre.. Man må gerne have fornemmelsen af at der kommer 6 opgaver, men man behøver ikke se alle overskrifter på en gang."

## Mønsteret

`sc6.2_formel_og_aktuel` har det: `bygListe` og `visListe` i `js/fane.js` (omkring linje 170-220) og `.hl-streg` i `css/stil.css`. De kommende opgaver står som et nummer med en kort grå streg i stedet for titlen og kan ikke klikkes. En opgave er "nået", når alle før den er løst (Vis svaret tæller som løst), eller når eleven allerede har været der. Er en opgave løst før (gemt i browseren), står dens titel. Se også README-afsnittet "En let start, krukken og opgavelisten" i sc6.2.

## Sådan gør du, animation for animation

1. Find opgavelisten. Den står mest i panelet (fx "OPGAVERNE" med titlerne), men nogle har den i en række eller i en menu. Find koden, der tegner den (`visListe`, `liste`, `opgaveListe` el.lign. i `js/fane.js` eller `js/app.js`).
2. Hvad skal ændres:
   - **Liste med titler** (fx "1 Kalk i syre", "2 Saltsyren i luppen"): De kommende opgaver får nummer og en grå streg i stedet for titlen og kan ikke klikkes, før de er nået. Løste og den aktuelle viser titlen (og en evt. undertekst).
   - **Liste med kun numre** (fx 24 reaktioner som knapper 1-24): Der er ingen titler at skjule. Lad den være. Skriv "kun numre" i rapporten.
   - **Niveauer** (Let, Middel, Svær), **faner** og **valg af stof** (fx "Vælg et salt") er ikke opgavetitler. De bliver synlige og kan vælges som før.
   - Overskriften over listen og tælleren ("løst 0/5") bliver.
3. Opførslen: Klik på en låst opgave gør intet (ingen fejlbesked). Start forfra / Nye tal virker som før. Er en animation bygget, så eleven frit kan vælge opgaverne i vilkårlig rækkefølge, gælder reglen stadig: De kommende låses op i rækkefølge.
4. Selvtesten (`_selvtest.html`): Ret påstande, der læser titlerne i listen eller klikker på en senere opgave direkte (lad testen løse opgaverne i rækkefølge, eller lås op med den samme funktion, som koden bruger, når en opgave er løst). Tilføj en påstand: Ved start viser listen kun titlen på første opgave, de andre har ingen titel og kan ikke klikkes, og titlen på opgave 2 kommer frem, når opgave 1 er løst. Lemp ingen andre grænser.
5. Kør selvtesten: `node ~/NK_hjemmeside/.claude/spoergsmaal-og-start/selvtest.mjs <mappe1> <mappe2> ...`. Fejl, der stod der før i dag, står i `~/NK_hjemmeside/.claude/spoergsmaal-og-start/basis.txt`.
6. Skriv to linjer i animationens README om, at opgavelisten låser titlerne op i takt (21. nov. 2026).

## Det må du ikke

- Rette i `faelles/`, `kemichael/`, `animationer/v2/` eller i animationer, der ikke står i din besked. Andre hjælpere arbejder samtidig i de andre mapper. `sc5.7_idealgasligningen` og `sc6.2_formel_og_aktuel` har reglen i forvejen.
- Ændre andet end opgavelisten (ikke titlernes tekst, ikke layoutet, ikke opgaverne).
- Committe i git.

## Rapport

Højst 150 ord: for hver animation "låst" (med antal opgaver), "kun numre", "ingen opgaveliste" eller et problem, og selvtestens resultat (ALT OK, eller fejlene og om de stod der før).
