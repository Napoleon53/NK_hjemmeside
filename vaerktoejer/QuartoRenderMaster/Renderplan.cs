using System;
using System.Collections.Generic;
using System.IO;
using System.Text;

namespace QuartoRenderMaster
{
    internal class Renderformat
    {
        public string Navn;
        public string Til;       // vaerdien til --to
        public string Endelse;

        public Renderformat(string navn, string til, string endelse)
        {
            Navn = navn;
            Til = til;
            Endelse = endelse;
        }
    }

    // En enkelt koersel af quarto render.
    internal class Renderjob
    {
        public string Tekst;
        public string Arbejdsmappe;
        public List<string> Argumenter = new List<string>();
        public string Kildebase;   // det navn quarto giver resultatet
        public string Maalbase;    // det navn resultatet skal have bagefter
        public string Udmappe;
        public string Endelse;
    }

    // Det brugeren har valgt i vinduet.
    internal class Renderoensker
    {
        public string Projektmappe;
        public string Profil = "";
        public bool Bogtilstand;
        public string Bogudmappe = "";
        public List<string> Filer = new List<string>();
        public bool Html, Word, Pdf;
        public bool IndlejrHtml = true;
        public bool Samlet;
        public string Samletnavn = "samlet";
        public string Outputmappe = "";
        public string Wordskabelon = "";
        public bool Kopi;
    }

    internal class Renderplan
    {
        public List<Renderjob> Job = new List<Renderjob>();
        public List<string> Midlertidige = new List<string>();
        public List<string[]> Efterkopi = new List<string[]>();
        public string Aabnmappe;
        public List<string> Fejl = new List<string>();

        private static readonly UTF8Encoding UdenBom = new UTF8Encoding(false);

        public static Renderplan Byg(Renderoensker oe, Action<string> log)
        {
            Renderplan plan = new Renderplan();

            List<Renderformat> formater = new List<Renderformat>();
            if (oe.Html) formater.Add(new Renderformat("HTML", "html", ".html"));
            if (oe.Word) formater.Add(new Renderformat("Word", "docx", ".docx"));
            // Quartos egen Typst-motor laver PDF. --pdf-engine typst kraever
            // en typst-installation ved siden af og bruges derfor ikke.
            if (oe.Pdf) formater.Add(new Renderformat("PDF", "typst", ".pdf"));
            if (formater.Count == 0)
            {
                plan.Fejl.Add("Vaelg mindst et format.");
                return plan;
            }
            if (!oe.Bogtilstand && oe.Filer.Count == 0)
            {
                plan.Fejl.Add("Vaelg mindst en fil.");
                return plan;
            }

            // En bog bliver altid til ét samlet Word- eller PDF-dokument, ogsaa
            // naar man beder om en enkelt fil i den. Skal der kun renderes nogle
            // faa filer, bygges de derfor i en kopi af projektet, hvor
            // bogopsaetningen er taget ud.
            string kilderod = oe.Projektmappe;
            string bogrod = oe.Bogtilstand ? null : Bogprojektrod(oe.Projektmappe);
            if (bogrod != null) kilderod = bogrod;

            string arbejdsrod = kilderod;
            if (oe.Kopi || bogrod != null)
            {
                string navn = Filhjaelp.SikkertFilnavn(Path.GetFileName(kilderod.TrimEnd('\\', '/')));
                arbejdsrod = Path.Combine(Path.GetTempPath(), "QuartoRenderMaster", navn);
                log("Kopierer projektet til " + arbejdsrod);
                try
                {
                    Filhjaelp.RydMappe(arbejdsrod);
                    Filhjaelp.KopierMappe(kilderod, arbejdsrod, true);
                }
                catch (Exception f)
                {
                    plan.Fejl.Add("Kunne ikke kopiere projektet: " + f.Message);
                    return plan;
                }
                if (bogrod != null)
                {
                    FjernBogopsaetning(arbejdsrod);
                    log("Filerne renderes hver for sig, ikke som en del af bogen.");
                }
            }

            if (oe.Bogtilstand) ByggBog(plan, oe, formater, arbejdsrod, log);
            else ByggFiler(plan, oe, formater, kilderod, arbejdsrod, log);
            return plan;
        }

        // Er mappen en del af et Quarto-projekt af typen book, gives roden af det.
        private static string Bogprojektrod(string mappe)
        {
            string rod = Projektrod(mappe);
            if (rod == null) return null;
            string fil = Kvartoprojekt.Projektfil(rod);
            if (fil == null) return null;
            Ynode node = Yamllaeser.LaesFil(fil);
            if (node == null) return null;
            bool bog = string.Equals(node.Tekst("project", "type"), "book", StringComparison.OrdinalIgnoreCase)
                       || node.Hent("book") != null;
            return bog ? rod : null;
        }

        // Tager book-afsnittet ud af kopiens _quarto-filer, saa Quarto laver
        // selvstaendige dokumenter i stedet for en bog. Resten af opsaetningen
        // bliver staaende.
        private static void FjernBogopsaetning(string mappe)
        {
            string[] filer;
            try
            {
                filer = Directory.GetFiles(mappe, "_quarto*.y*ml");
            }
            catch (Exception)
            {
                return;
            }
            foreach (string fil in filer)
            {
                try
                {
                    string[] linjer = File.ReadAllLines(fil, Encoding.UTF8);
                    StringBuilder sb = new StringBuilder();
                    int spring = -1;        // indryk for den blok, der springes over
                    bool iProjekt = false;
                    foreach (string linje in linjer)
                    {
                        string trimmet = linje.TrimStart(' ');
                        if (trimmet.Length == 0)
                        {
                            if (spring < 0) sb.AppendLine(linje);
                            continue;
                        }
                        int indryk = linje.Length - trimmet.Length;
                        if (spring >= 0 && indryk > spring) continue;
                        spring = -1;

                        if (indryk == 0) iProjekt = trimmet.StartsWith("project:");

                        // Hele book-afsnittet ryger ud.
                        if (indryk == 0 && (trimmet.StartsWith("book:") || trimmet.StartsWith("appendices:")))
                        {
                            spring = 0;
                            continue;
                        }
                        // Projektets render-liste ryger ud, ellers hoerer de
                        // midlertidige filer ikke med til projektet.
                        if (iProjekt && indryk > 0 && trimmet.StartsWith("render:"))
                        {
                            spring = indryk;
                            continue;
                        }
                        if (trimmet.StartsWith("type:"))
                        {
                            string vaerdi = trimmet.Substring(5).Trim().Trim('"', '\'');
                            if (string.Equals(vaerdi, "book", StringComparison.OrdinalIgnoreCase))
                            {
                                sb.AppendLine(linje.Substring(0, indryk) + "type: default");
                                continue;
                            }
                        }
                        sb.AppendLine(linje);
                    }
                    File.WriteAllText(fil, sb.ToString(), UdenBom);
                }
                catch (Exception)
                {
                }
            }
        }

        private static void ByggBog(Renderplan plan, Renderoensker oe, List<Renderformat> formater,
                                    string arbejdsrod, Action<string> log)
        {
            string udnavn = string.IsNullOrEmpty(oe.Bogudmappe) ? "_book" : oe.Bogudmappe;
            udnavn = udnavn.Replace('/', '\\');
            plan.Aabnmappe = Path.Combine(oe.Projektmappe, udnavn);
            if (oe.Kopi)
                plan.Efterkopi.Add(new string[] { Path.Combine(arbejdsrod, udnavn), plan.Aabnmappe });

            log("Hele bogen bygges samlet. Resultatet lander i " + udnavn);

            foreach (Renderformat f in formater)
            {
                Renderjob job = new Renderjob();
                job.Tekst = "Hele bogen som " + f.Navn;
                job.Arbejdsmappe = arbejdsrod;
                job.Argumenter.Add("render");
                TilfoejFaelles(job, oe, f);
                // Bogen faar sit navn af Quarto, saa der omdoebes ikke bagefter.
                job.Udmappe = Path.Combine(arbejdsrod, udnavn);
                job.Endelse = f.Endelse;
                plan.Job.Add(job);
            }
        }

        private static void ByggFiler(Renderplan plan, Renderoensker oe, List<Renderformat> formater,
                                      string kilderod, string arbejdsrod, Action<string> log)
        {
            if (string.IsNullOrEmpty(oe.Outputmappe))
            {
                plan.Fejl.Add("Vaelg en outputmappe til de enkelte filer.");
                return;
            }
            try
            {
                Directory.CreateDirectory(oe.Outputmappe);
            }
            catch (Exception f)
            {
                plan.Fejl.Add("Kunne ikke oprette outputmappen: " + f.Message);
                return;
            }
            plan.Aabnmappe = oe.Outputmappe;

            string udmappe = oe.Outputmappe;
            if (oe.Kopi)
            {
                udmappe = Path.Combine(arbejdsrod, "_ud");
                Directory.CreateDirectory(udmappe);
                plan.Efterkopi.Add(new string[] { udmappe, oe.Outputmappe });
            }

            if (oe.Samlet && oe.Filer.Count > 1)
            {
                ByggSamlet(plan, oe, formater, kilderod, arbejdsrod, udmappe, log);
                return;
            }

            foreach (string fil in oe.Filer)
            {
                string arbejdsfil = IArbejde(kilderod, arbejdsrod, fil);
                string mappe = Path.GetDirectoryName(arbejdsfil);
                string maalbase = Filhjaelp.SikkertFilnavn(Path.GetFileNameWithoutExtension(fil));
                string inputnavn = Path.GetFileName(arbejdsfil);
                string kildebase = Path.GetFileNameWithoutExtension(inputnavn);
                string filud = Udmappe(plan, arbejdsrod, mappe, udmappe, log);

                if (!Dokumenthoved.HarHoved(fil))
                {
                    string titel = Dokumenthoved.FoersteOverskrift(fil);
                    if (string.IsNullOrEmpty(titel)) titel = Path.GetFileNameWithoutExtension(fil);
                    string tempnavn = "~qrm-" + maalbase + ".qmd";
                    string tempsti = Path.Combine(mappe, tempnavn);
                    try
                    {
                        File.WriteAllText(tempsti,
                            Dokumenthoved.ByggHoved(titel) + Dokumenthoved.LaesTekst(fil), UdenBom);
                    }
                    catch (Exception f)
                    {
                        plan.Fejl.Add("Kunne ikke lave et midlertidigt hoved til " + inputnavn + ": " + f.Message);
                        return;
                    }
                    plan.Midlertidige.Add(tempsti);
                    inputnavn = tempnavn;
                    kildebase = Path.GetFileNameWithoutExtension(tempnavn);
                    log(Path.GetFileName(fil) + " har intet YAML-hoved. Titlen \"" + titel + "\" bruges.");
                }

                foreach (Renderformat f in formater)
                {
                    Renderjob job = new Renderjob();
                    job.Tekst = Path.GetFileName(fil) + " som " + f.Navn;
                    job.Arbejdsmappe = mappe;
                    job.Argumenter.Add("render");
                    job.Argumenter.Add(inputnavn);
                    TilfoejFaelles(job, oe, f);
                    job.Argumenter.Add("--output-dir");
                    job.Argumenter.Add(udmappe);
                    job.Argumenter.Add("--no-clean");
                    job.Kildebase = kildebase;
                    job.Maalbase = maalbase;
                    job.Udmappe = filud;
                    job.Endelse = f.Endelse;
                    plan.Job.Add(job);
                }
            }
        }

        private static void ByggSamlet(Renderplan plan, Renderoensker oe, List<Renderformat> formater,
                                       string kilderod, string arbejdsrod, string udmappe, Action<string> log)
        {
            string faelles = Filhjaelp.FaellesMappe(oe.Filer, kilderod);
            string arbejdsfaelles = IArbejde(kilderod, arbejdsrod, faelles);
            string maalbase = Filhjaelp.SikkertFilnavn(
                string.IsNullOrEmpty(oe.Samletnavn) ? "samlet" : oe.Samletnavn);
            string tempnavn = "~qrm-" + maalbase + ".qmd";
            string tempsti = Path.Combine(arbejdsfaelles, tempnavn);

            StringBuilder sb = new StringBuilder();
            sb.Append(Dokumenthoved.ByggHoved(maalbase));
            bool foerste = true;
            foreach (string fil in oe.Filer)
            {
                if (!foerste)
                {
                    sb.AppendLine();
                    sb.AppendLine("{{< pagebreak >}}");
                    sb.AppendLine();
                }
                foerste = false;
                string krop = Dokumenthoved.Krop(fil);
                krop = Dokumenthoved.OmskrivStier(krop, Path.GetDirectoryName(Path.GetFullPath(fil)), faelles);
                if (!Dokumenthoved.HarTopoverskrift(krop))
                {
                    string titel = Dokumenthoved.HentTitel(fil);
                    sb.AppendLine("# " + titel);
                    sb.AppendLine();
                }
                sb.AppendLine(krop.TrimEnd());
                sb.AppendLine();
            }
            try
            {
                File.WriteAllText(tempsti, sb.ToString(), UdenBom);
            }
            catch (Exception f)
            {
                plan.Fejl.Add("Kunne ikke samle filerne: " + f.Message);
                return;
            }
            plan.Midlertidige.Add(tempsti);
            log(oe.Filer.Count + " filer samles til en fil med sideskift imellem.");

            string filud = Udmappe(plan, arbejdsrod, arbejdsfaelles, udmappe, log);

            foreach (Renderformat f in formater)
            {
                Renderjob job = new Renderjob();
                job.Tekst = maalbase + " som " + f.Navn;
                job.Arbejdsmappe = arbejdsfaelles;
                job.Argumenter.Add("render");
                job.Argumenter.Add(tempnavn);
                TilfoejFaelles(job, oe, f);
                job.Argumenter.Add("--output-dir");
                job.Argumenter.Add(udmappe);
                job.Argumenter.Add("--no-clean");
                job.Kildebase = Path.GetFileNameWithoutExtension(tempnavn);
                job.Maalbase = maalbase;
                job.Udmappe = filud;
                job.Endelse = f.Endelse;
                plan.Job.Add(job);
            }
        }

        // Quarto lægger resultatet af en enkelt fil i outputmappen under den sti,
        // filen har inde i sit projekt. Uden en _quarto.yml er der intet projekt,
        // og saa naegter Typst at hente billeder uden for filens egen mappe.
        // Derfor faar mappen en midlertidig _quarto.yml, mens der renderes.
        private static string Udmappe(Renderplan plan, string arbejdsrod, string filmappe,
                                      string udmappe, Action<string> log)
        {
            string rod = Projektrod(filmappe);
            if (rod == null)
            {
                rod = arbejdsrod;
                string sti = Path.Combine(arbejdsrod, "_quarto.yml");
                if (!File.Exists(sti) && !plan.Midlertidige.Contains(sti))
                {
                    try
                    {
                        File.WriteAllText(sti,
                            "# Midlertidig fil fra Quarto Render Master. Den slettes automatisk igen.\r\n"
                            + "project:\r\n  type: default\r\n", UdenBom);
                        plan.Midlertidige.Add(sti);
                        log("Mappen er ikke et Quarto-projekt. Der bruges en midlertidig _quarto.yml under renderingen.");
                    }
                    catch (Exception)
                    {
                        return udmappe;
                    }
                }
            }
            string rel = Filhjaelp.RelativSti(rod, filmappe).Replace('/', '\\').Trim('\\');
            if (rel.Length == 0 || rel.StartsWith("..")) return udmappe;
            return Path.Combine(udmappe, rel);
        }

        private static string Projektrod(string mappe)
        {
            try
            {
                DirectoryInfo m = new DirectoryInfo(mappe);
                while (m != null)
                {
                    if (File.Exists(Path.Combine(m.FullName, "_quarto.yml"))
                        || File.Exists(Path.Combine(m.FullName, "_quarto.yaml"))) return m.FullName;
                    m = m.Parent;
                }
            }
            catch (Exception)
            {
            }
            return null;
        }

        private static void TilfoejFaelles(Renderjob job, Renderoensker oe, Renderformat f)
        {
            if (!string.IsNullOrEmpty(oe.Profil))
            {
                job.Argumenter.Add("--profile");
                job.Argumenter.Add(oe.Profil);
            }
            job.Argumenter.Add("--to");
            job.Argumenter.Add(f.Til);
            if (f.Til == "docx" && !string.IsNullOrEmpty(oe.Wordskabelon) && File.Exists(oe.Wordskabelon))
            {
                job.Argumenter.Add("--reference-doc");
                job.Argumenter.Add(oe.Wordskabelon);
            }
            if (f.Til == "html" && oe.IndlejrHtml && !oe.Bogtilstand)
            {
                job.Argumenter.Add("-M");
                job.Argumenter.Add("embed-resources:true");
            }
        }

        // Den samme fil inde i den midlertidige kopi af projektet.
        private static string IArbejde(string kilderod, string arbejdsrod, string sti)
        {
            if (string.Equals(Path.GetFullPath(arbejdsrod).TrimEnd('\\'),
                              Path.GetFullPath(kilderod).TrimEnd('\\'),
                              StringComparison.OrdinalIgnoreCase)) return sti;
            if (!Filhjaelp.ErUnder(kilderod, sti)) return sti;
            string rel = Filhjaelp.RelativSti(kilderod, sti).Replace('/', '\\');
            if (rel.Length == 0) return arbejdsrod;
            return Path.Combine(arbejdsrod, rel);
        }
    }
}
