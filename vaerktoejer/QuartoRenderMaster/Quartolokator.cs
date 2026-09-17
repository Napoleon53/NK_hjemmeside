using System;
using System.IO;

namespace QuartoRenderMaster
{
    // Finder quarto.exe. Quarto ligger sjaeldent i PATH paa en Windows-maskine,
    // saa de to almindelige installationssteder proeves bagefter.
    internal static class Quartolokator
    {
        public const string Hjemmeside = "https://quarto.org/docs/get-started/";

        public static string Find()
        {
            string fundet = FraSti();
            if (fundet != null) return fundet;

            fundet = Proev(Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
                @"Programs\Quarto\bin\quarto.exe"));
            if (fundet != null) return fundet;

            fundet = Proev(Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles),
                @"Quarto\bin\quarto.exe"));
            if (fundet != null) return fundet;

            string prog64 = Environment.GetEnvironmentVariable("ProgramW6432");
            if (!string.IsNullOrEmpty(prog64))
            {
                fundet = Proev(Path.Combine(prog64, @"Quarto\bin\quarto.exe"));
                if (fundet != null) return fundet;
            }
            return null;
        }

        private static string FraSti()
        {
            string sti = Environment.GetEnvironmentVariable("PATH");
            if (string.IsNullOrEmpty(sti)) return null;
            foreach (string del in sti.Split(';'))
            {
                string mappe = del.Trim().Trim('"');
                if (mappe.Length == 0) continue;
                string fundet = Proev(Path.Combine(mappe, "quarto.exe"));
                if (fundet != null) return fundet;
            }
            return null;
        }

        private static string Proev(string sti)
        {
            try
            {
                if (sti != null && File.Exists(sti)) return sti;
            }
            catch (Exception)
            {
                // Ugyldige stier i PATH springes over.
            }
            return null;
        }
    }
}
