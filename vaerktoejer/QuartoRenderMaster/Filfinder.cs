using System;
using System.Collections.Generic;
using System.IO;

namespace QuartoRenderMaster
{
    internal class Fundetfil
    {
        public string Fuldsti;
        public string Relativsti;
        public string Mappe;     // undermappen filen ligger i, "" for projektmappen selv
        public string Titel;
    }

    // Leder efter dokumenter i hele mappetraeet. Byggemapper og skjulte
    // mapper springes over.
    internal static class Filfinder
    {
        private static readonly string[] Endelser = { ".qmd", ".md", ".rmd" };

        public static List<Fundetfil> Find(string rod)
        {
            List<Fundetfil> fundne = new List<Fundetfil>();
            Gennemgaa(rod, rod, fundne);
            fundne.Sort(delegate(Fundetfil a, Fundetfil b)
            {
                int m = string.Compare(a.Mappe, b.Mappe, StringComparison.OrdinalIgnoreCase);
                if (m != 0) return m;
                return string.Compare(a.Relativsti, b.Relativsti, StringComparison.OrdinalIgnoreCase);
            });
            return fundne;
        }

        private static void Gennemgaa(string rod, string mappe, List<Fundetfil> fundne)
        {
            string[] filer;
            try
            {
                filer = Directory.GetFiles(mappe);
            }
            catch (Exception)
            {
                return;
            }
            foreach (string fil in filer)
            {
                string navn = Path.GetFileName(fil);
                if (navn.StartsWith(".")) continue;
                if (navn.StartsWith("~qrm-")) continue;
                if (navn.StartsWith("_quarto")) continue;
                string endelse = Path.GetExtension(fil).ToLowerInvariant();
                bool passer = false;
                foreach (string e in Endelser)
                    if (endelse == e) { passer = true; break; }
                if (!passer) continue;

                Fundetfil f = new Fundetfil();
                f.Fuldsti = fil;
                f.Relativsti = Filhjaelp.RelativSti(rod, fil).Replace('/', '\\');
                string undermappe = Path.GetDirectoryName(f.Relativsti);
                f.Mappe = undermappe == null ? "" : undermappe;
                f.Titel = Dokumenthoved.HentTitel(fil);
                fundne.Add(f);
            }

            string[] mapper;
            try
            {
                mapper = Directory.GetDirectories(mappe);
            }
            catch (Exception)
            {
                return;
            }
            foreach (string under in mapper)
            {
                if (Filhjaelp.ErSkjultMappe(Path.GetFileName(under))) continue;
                Gennemgaa(rod, under, fundne);
            }
        }
    }
}
