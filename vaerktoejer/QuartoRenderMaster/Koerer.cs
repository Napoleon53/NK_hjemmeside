using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Text;

namespace QuartoRenderMaster
{
    // Koerer quarto render for hvert job i planen og skriver alt til loggen.
    internal class Koerer
    {
        private readonly string _quarto;
        private readonly Action<string> _log;
        private Process _proces;
        private volatile bool _afbrudt;

        public Koerer(string quarto, Action<string> log)
        {
            _quarto = quarto;
            _log = log;
        }

        public bool Afbrudt { get { return _afbrudt; } }

        public void Afbryd()
        {
            _afbrudt = true;
            try
            {
                Process p = _proces;
                if (p != null && !p.HasExited) p.Kill();
            }
            catch (Exception)
            {
            }
        }

        public bool Koer(Renderplan plan)
        {
            bool altGik = true;
            try
            {
                int nr = 0;
                foreach (Renderjob job in plan.Job)
                {
                    if (_afbrudt) break;
                    nr++;
                    _log("");
                    _log("[" + nr + "/" + plan.Job.Count + "] " + job.Tekst);
                    _log("    quarto " + Kommandolinje(job.Argumenter));
                    int kode = KoerEt(job);
                    if (_afbrudt) break;
                    if (kode != 0)
                    {
                        altGik = false;
                        _log("    Quarto stoppede med fejlkode " + kode + ".");
                    }
                    else
                    {
                        Flyt(job);
                    }
                }

                if (!_afbrudt && plan.Efterkopi.Count > 0)
                {
                    foreach (string[] par in plan.Efterkopi)
                    {
                        if (!Directory.Exists(par[0])) continue;
                        _log("");
                        _log("Kopierer resultatet tilbage til " + par[1]);
                        try
                        {
                            Filhjaelp.KopierMappe(par[0], par[1], false);
                        }
                        catch (Exception f)
                        {
                            altGik = false;
                            _log("    Kunne ikke kopiere tilbage: " + f.Message);
                        }
                    }
                }
            }
            finally
            {
                foreach (string temp in plan.Midlertidige) Filhjaelp.SletStille(temp);
            }
            return altGik && !_afbrudt;
        }

        private int KoerEt(Renderjob job)
        {
            ProcessStartInfo start = new ProcessStartInfo();
            start.FileName = _quarto;
            start.Arguments = Kommandolinje(job.Argumenter);
            start.WorkingDirectory = job.Arbejdsmappe;
            start.UseShellExecute = false;
            start.CreateNoWindow = true;
            start.RedirectStandardOutput = true;
            start.RedirectStandardError = true;
            start.StandardOutputEncoding = Encoding.UTF8;
            start.StandardErrorEncoding = Encoding.UTF8;

            try
            {
                using (Process p = new Process())
                {
                    p.StartInfo = start;
                    p.OutputDataReceived += Modtag;
                    p.ErrorDataReceived += Modtag;
                    _proces = p;
                    p.Start();
                    p.BeginOutputReadLine();
                    p.BeginErrorReadLine();
                    p.WaitForExit();
                    return p.ExitCode;
                }
            }
            catch (Exception f)
            {
                _log("    Kunne ikke starte quarto: " + f.Message);
                return -1;
            }
            finally
            {
                _proces = null;
            }
        }

        private void Modtag(object afsender, DataReceivedEventArgs e)
        {
            if (e.Data == null) return;
            string linje = e.Data.TrimEnd();
            if (linje.Length == 0) return;
            _log("    " + linje);
        }

        // Giver resultatet det navn brugeren kender filen under. Quarto opkalder
        // resultatet efter den midlertidige fil, naar der er lavet et hoved til den.
        private void Flyt(Renderjob job)
        {
            if (job.Udmappe == null || job.Kildebase == null || job.Maalbase == null) return;
            string fra = Path.Combine(job.Udmappe, job.Kildebase + job.Endelse);
            string til = Path.Combine(job.Udmappe, job.Maalbase + job.Endelse);
            try
            {
                if (job.Kildebase != job.Maalbase && File.Exists(fra))
                {
                    if (File.Exists(til)) File.Delete(til);
                    File.Move(fra, til);
                    FlytRessourcer(job);
                }
                if (File.Exists(til)) _log("    Færdig: " + til);
                else if (File.Exists(fra)) _log("    Færdig: " + fra);
            }
            catch (Exception f)
            {
                _log("    Kunne ikke omdoebe resultatet: " + f.Message);
            }
        }

        // HTML uden indlejrede ressourcer faar en _files-mappe ved siden af sig.
        private void FlytRessourcer(Renderjob job)
        {
            if (job.Endelse != ".html") return;
            string fraMappe = Path.Combine(job.Udmappe, job.Kildebase + "_files");
            string tilMappe = Path.Combine(job.Udmappe, job.Maalbase + "_files");
            if (!Directory.Exists(fraMappe)) return;
            try
            {
                if (Directory.Exists(tilMappe)) Directory.Delete(tilMappe, true);
                Directory.Move(fraMappe, tilMappe);
                string htmlsti = Path.Combine(job.Udmappe, job.Maalbase + job.Endelse);
                string tekst = File.ReadAllText(htmlsti, Encoding.UTF8);
                tekst = tekst.Replace(job.Kildebase + "_files/", job.Maalbase + "_files/");
                File.WriteAllText(htmlsti, tekst, new UTF8Encoding(false));
            }
            catch (Exception f)
            {
                _log("    Kunne ikke flytte billedmappen: " + f.Message);
            }
        }

        public static string Kommandolinje(List<string> argumenter)
        {
            StringBuilder sb = new StringBuilder();
            foreach (string a in argumenter)
            {
                if (sb.Length > 0) sb.Append(' ');
                sb.Append(Citer(a));
            }
            return sb.ToString();
        }

        private static string Citer(string argument)
        {
            if (argument == null) return "\"\"";
            if (argument.Length > 0 && argument.IndexOf(' ') < 0 && argument.IndexOf('"') < 0)
                return argument;
            return "\"" + argument.Replace("\"", "\\\"") + "\"";
        }
    }
}
