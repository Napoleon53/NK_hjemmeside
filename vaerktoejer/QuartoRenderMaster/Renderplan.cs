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
        public bool HeleBogen;
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

            string arbejdsrod = oe.Projektmappe;
            if (oe.Kopi)
            {
                string navn = Filhjaelp.SikkertFilnavn(Path.GetFileName(oe.Projektmappe.TrimEnd('\\', '/')));
                arbejdsrod = Path.Combine(Path.GetTempPath(), "QuartoRenderMaster", navn);
                log("Kopierer projektet til " + arbejdsrod);
                try
                {
                    Filhjaelp.RydMappe(arbejdsrod);
                    Filhjaelp.KopierMappe(oe.Projektmappe, arbejdsrod, true);
                }
                catch (Exception f)
                {
                    plan.Fejl.Add("Kunne ikke kopiere projektet: " + f.Message);
                    return plan;
                }
            }

            if (oe.Bogtilstand) ByggBog(plan, oe, formater, arbejdsrod, log);
            else ByggFiler(plan, oe, formater, arbejdsrod, log);
            return plan;
        }

        private static void ByggBog(Renderplan plan, Renderoensker oe, List<Renderformat> formater,
                                    string arbejdsrod, Action<string> log)
        {
            string udnavn = string.IsNullOrEmpty(oe.Bogudmappe) ? "_book" : oe.Bogudmappe;
            udnavn = udnavn.Replace('/', '\\');
            plan.Aabnmappe = Path.Combine(oe.Projektmappe, udnavn);
            if (oe.Kopi)
                plan.Efterkopi.Add(new string[] { Path.Combine(arbejdsrod, udnavn), plan.Aabnmappe });

            if (oe.HeleBogen) log("Hele bogen renderes. Resultatet lander i " + udnavn);
            else log("Kun de valgte kapitler renderes. Resultatet lander i " + udnavn);

            foreach (Renderformat f in formater)
            {
                if (oe.HeleBogen)
                {
                    Renderjob job = new Renderjob();
                    job.Tekst = "Hele bogen som " + f.Navn;
                    job.Arbejdsmappe = arbejdsrod;
                    job.Argumenter.Add("render");
                    TilfoejFaelles(job, oe, f);
                    plan.Job.Add(job);
                    continue;
                }
                foreach (string fil in oe.Filer)
                {
                    string rel = Filhjaelp.RelativSti(oe.Projektmappe, fil).Replace('/', '\\');
                    Renderjob job = new Renderjob();
                    job.Tekst = rel + " som " + f.Navn;
                    job.Arbejdsmappe = arbejdsrod;
                    job.Argumenter.Add("render");
                    job.Argumenter.Add(rel);
                    TilfoejFaelles(job, oe, f);
                    plan.Job.Add(job);
                }
            }
        }

        private static void ByggFiler(Renderplan plan, Renderoensker oe, List<Renderformat> formater,
                                      string arbejdsrod, Action<string> log)
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
                ByggSamlet(plan, oe, formater, arbejdsrod, udmappe, log);
                return;
            }

            foreach (string fil in oe.Filer)
            {
                string arbejdsfil = IArbejde(oe, arbejdsrod, fil);
                string mappe = Path.GetDirectoryName(arbejdsfil);
                string maalbase = Filhjaelp.SikkertFilnavn(Path.GetFileNameWithoutExtension(fil));
                string inputnavn = Path.GetFileName(arbejdsfil);
                string kildebase = Path.GetFileNameWithoutExtension(inputnavn);

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
                    job.Kildebase = kildebase;
                    job.Maalbase = maalbase;
                    job.Udmappe = udmappe;
                    job.Endelse = f.Endelse;
                    plan.Job.Add(job);
                }
            }
        }

        private static void ByggSamlet(Renderplan plan, Renderoensker oe, List<Renderformat> formater,
                                       string arbejdsrod, string udmappe, Action<string> log)
        {
            string faelles = Filhjaelp.FaellesMappe(oe.Filer, oe.Projektmappe);
            string arbejdsfaelles = IArbejde(oe, arbejdsrod, faelles);
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
                job.Kildebase = Path.GetFileNameWithoutExtension(tempnavn);
                job.Maalbase = maalbase;
                job.Udmappe = udmappe;
                job.Endelse = f.Endelse;
                plan.Job.Add(job);
            }
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
        private static string IArbejde(Renderoensker oe, string arbejdsrod, string sti)
        {
            if (string.Equals(Path.GetFullPath(arbejdsrod).TrimEnd('\\'),
                              Path.GetFullPath(oe.Projektmappe).TrimEnd('\\'),
                              StringComparison.OrdinalIgnoreCase)) return sti;
            if (!Filhjaelp.ErUnder(oe.Projektmappe, sti)) return sti;
            string rel = Filhjaelp.RelativSti(oe.Projektmappe, sti).Replace('/', '\\');
            if (rel.Length == 0) return arbejdsrod;
            return Path.Combine(arbejdsrod, rel);
        }
    }
}
