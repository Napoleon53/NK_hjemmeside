using System;
using System.Collections.Generic;
using System.IO;

namespace QuartoRenderMaster
{
    // En del eller et kapitel i bogens indholdsfortegnelse.
    internal class Bogpost
    {
        public string Titel;
        public string Sti;       // fuld sti, null for en del uden egen fil
        public string Relativ;   // sti i forhold til projektmappen
        public bool ErDel;
        public bool Findes = true;
        public List<Bogpost> Boern = new List<Bogpost>();
    }

    // Det Quarto-projekt brugeren har peget paa.
    internal class Kvartoprojekt
    {
        public string Mappe;
        public bool HarProjektfil;
        public bool ErBog;
        public string Titel;
        public string Outputmappe = "";
        public List<Bogpost> Poster = new List<Bogpost>();
        public List<string> Profiler = new List<string>();

        public static string Projektfil(string mappe)
        {
            string yml = Path.Combine(mappe, "_quarto.yml");
            if (File.Exists(yml)) return yml;
            string yaml = Path.Combine(mappe, "_quarto.yaml");
            if (File.Exists(yaml)) return yaml;
            return null;
        }

        // Navnene paa profilerne, fx "laerer" for _quarto-laerer.yml.
        public static List<string> FindProfiler(string mappe)
        {
            List<string> navne = new List<string>();
            try
            {
                foreach (string fil in Directory.GetFiles(mappe, "_quarto-*.y*ml"))
                {
                    string navn = Path.GetFileNameWithoutExtension(fil);
                    if (navn.Length <= "_quarto-".Length) continue;
                    string profil = navn.Substring("_quarto-".Length);
                    if (profil.Length > 0 && !navne.Contains(profil)) navne.Add(profil);
                }
            }
            catch (Exception)
            {
            }
            navne.Sort(StringComparer.OrdinalIgnoreCase);
            return navne;
        }

        public static Kvartoprojekt Laes(string mappe, string profil)
        {
            Kvartoprojekt p = new Kvartoprojekt();
            p.Mappe = mappe;
            p.Profiler = FindProfiler(mappe);

            string fil = Projektfil(mappe);
            if (fil == null) return p;
            p.HarProjektfil = true;

            Ynode rod = Yamllaeser.LaesFil(fil);
            if (rod == null) return p;

            Ynode profilrod = null;
            if (!string.IsNullOrEmpty(profil))
            {
                string pfil = Path.Combine(mappe, "_quarto-" + profil + ".yml");
                if (!File.Exists(pfil)) pfil = Path.Combine(mappe, "_quarto-" + profil + ".yaml");
                if (File.Exists(pfil)) profilrod = Yamllaeser.LaesFil(pfil);
            }

            string type = rod.Tekst("project", "type");
            Ynode bog = rod.Hent("book");
            Ynode profilbog = profilrod == null ? null : profilrod.Hent("book");
            p.ErBog = string.Equals(type, "book", StringComparison.OrdinalIgnoreCase)
                      || bog != null || profilbog != null;

            string ud = rod.Tekst("project", "output-dir");
            if (profilrod != null)
            {
                string pud = profilrod.Tekst("project", "output-dir");
                if (!string.IsNullOrEmpty(pud)) ud = pud;
            }
            if (string.IsNullOrEmpty(ud) && p.ErBog) ud = "_book";
            p.Outputmappe = ud == null ? "" : ud;

            if (bog != null) p.Titel = bog.Tekst("title");
            if (profilbog != null)
            {
                string ptitel = profilbog.Tekst("title");
                if (!string.IsNullOrEmpty(ptitel)) p.Titel = ptitel;
            }
            if (string.IsNullOrEmpty(p.Titel)) p.Titel = rod.Tekst("title");
            if (string.IsNullOrEmpty(p.Titel)) p.Titel = Path.GetFileName(mappe.TrimEnd('\\', '/'));

            if (bog != null)
            {
                Tilfoej(p, p.Poster, bog.Hent("chapters"));
                Ynode bilag = bog.Hent("appendices");
                if (bilag != null && bilag.ErListe && bilag.Liste.Count > 0)
                {
                    Bogpost del = new Bogpost();
                    del.Titel = "Bilag";
                    del.ErDel = true;
                    Tilfoej(p, del.Boern, bilag);
                    if (del.Boern.Count > 0) p.Poster.Add(del);
                }
            }
            // Quarto laegger profilens lister oven i projektets egne.
            if (profilbog != null) Tilfoej(p, p.Poster, profilbog.Hent("chapters"));

            return p;
        }

        private static void Tilfoej(Kvartoprojekt p, List<Bogpost> maal, Ynode kapitler)
        {
            if (kapitler == null || !kapitler.ErListe) return;
            foreach (Ynode punkt in kapitler.Liste)
            {
                if (punkt == null) continue;
                if (punkt.ErKort)
                {
                    Ynode del = punkt.Hent("part");
                    Ynode boern = punkt.Hent("chapters");
                    if (del != null || boern != null)
                    {
                        Bogpost post = new Bogpost();
                        post.ErDel = true;
                        string navn = del == null ? null : del.Vaerdi;
                        if (!string.IsNullOrEmpty(navn) && ErDokument(navn))
                        {
                            Udfyld(p, post, navn);
                        }
                        else
                        {
                            post.Titel = string.IsNullOrEmpty(navn) ? "Del" : navn;
                        }
                        Tilfoej(p, post.Boern, boern);
                        maal.Add(post);
                        continue;
                    }
                    Ynode href = punkt.Hent("href");
                    if (href != null && !string.IsNullOrEmpty(href.Vaerdi) && ErDokument(href.Vaerdi))
                    {
                        Bogpost post = new Bogpost();
                        Udfyld(p, post, href.Vaerdi);
                        string tekst = punkt.Tekst("text");
                        if (!string.IsNullOrEmpty(tekst)) post.Titel = tekst;
                        maal.Add(post);
                    }
                    continue;
                }
                if (!string.IsNullOrEmpty(punkt.Vaerdi) && ErDokument(punkt.Vaerdi))
                {
                    Bogpost post = new Bogpost();
                    Udfyld(p, post, punkt.Vaerdi);
                    maal.Add(post);
                }
            }
        }

        private static bool ErDokument(string sti)
        {
            string s = sti.ToLowerInvariant();
            return s.EndsWith(".qmd") || s.EndsWith(".md") || s.EndsWith(".ipynb") || s.EndsWith(".rmd");
        }

        private static void Udfyld(Kvartoprojekt p, Bogpost post, string relativ)
        {
            post.Relativ = relativ.Replace('/', '\\');
            post.Sti = Path.Combine(p.Mappe, post.Relativ);
            post.Findes = File.Exists(post.Sti);
            post.Titel = post.Findes
                ? Dokumenthoved.HentTitel(post.Sti)
                : Path.GetFileNameWithoutExtension(post.Relativ);
        }

        // Alle kapitelfiler i traeet, i den raekkefoelge de staar i bogen.
        public static void SamlFiler(List<Bogpost> poster, List<Bogpost> maal)
        {
            foreach (Bogpost post in poster)
            {
                if (post.Sti != null) maal.Add(post);
                SamlFiler(post.Boern, maal);
            }
        }
    }
}
