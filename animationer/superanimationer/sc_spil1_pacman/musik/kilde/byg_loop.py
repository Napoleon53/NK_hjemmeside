# Klipper et loop ud af en sang til Pacman Quiz.
#
#   python byg_loop.py <sang.mp3> <ud.mp3> <start> <slut> <slag> [titel]
#
#   start  tiden (s) for det slag 1, loopet begynder paa
#   slut   tiden (s) for det slag 1, hvor sangen skal springe tilbage til start
#   slag   antal slag mellem de to (kun til kontrol af tempoet)
#
# Filen bygges periodisk: [de sidste FOER s af loopet][loopet][de foerste EFTER s af loopet],
# saa afspilleren kan springe loopets laengde tilbage hvor som helst i halen, uden at det
# kan hoeres, ogsaa naar browserens mp3-afkoder forskyder lyden nogle millisekunder.
# Den sidste linje, scriptet skriver, er tallene til D.MUSIK i js/data.js.
#
# De to sange (kraever ffmpeg og numpy):
#   Mellem  Retro_Maze_Chase_96bpm.mp3          19.4473   92.5600  120
#           Fra temaets start til det sted, hvor sangen selv begynder forfra paa temaet.
#   Svaer   Matrix_Clubbed_to_Death_144bpm.mp3  33.4155  176.7289  344
#           Fra rytmens indsats til lige foer afslutningens enkelte slag. De sidste to
#           takter staar paa D (dominanten), og loopet begynder paa G (tonika).
import subprocess, sys, json
import numpy as np

if len(sys.argv) < 6:
    sys.exit(__doc__ or "python byg_loop.py <sang.mp3> <ud.mp3> <start> <slut> <slag> [titel]")
FIL, UD = sys.argv[1], sys.argv[2]
S_ANSLAG, E_ANSLAG, SLAG = float(sys.argv[3]), float(sys.argv[4]), int(sys.argv[5])
TITEL = sys.argv[6] if len(sys.argv) > 6 else "Pacman Quiz (loop)"
SR = 48000
FOER, EFTER = 0.5, 2.0
FADE = 0.040
FORAN = 0.010                         # soemmen ligger saa lang tid foer anslaget

p = subprocess.run(["ffmpeg", "-v", "error", "-i", FIL, "-f", "f32le", "-ac", "2", "-ar", str(SR), "-"], capture_output=True)
y = np.frombuffer(p.stdout, dtype=np.float32).reshape(-1, 2).astype(np.float64)

s = int(round((S_ANSLAG - FORAN) * SR))
L = int(round((E_ANSLAG - S_ANSLAG) * SR))
slag = L / SR / SLAG
print("soem: start %.4f s, slut %.4f s, laengde %.4f s (%d samples)" % (s / SR, (s + L) / SR, L / SR, L))
print("  %d slag -> %.3f BPM i gennemsnit, ottendedel %.2f ms" % (SLAG, 60 / slag, slag * 500))

# Loopet. De sidste FADE s glider over i det, der i sangen ligger lige foer loopets start,
# saa loopets sidste sample er sangens egen sample foer starten: ingen knaek, og det foerste
# anslag staar uroert.
B = y[s:s + L].copy()
nf = int(FADE * SR)
w = np.sin(0.5 * np.pi * (np.arange(nf) + 1) / nf)[:, None]
B[L - nf:] = y[s + L - nf:s + L] * np.sqrt(1 - w ** 2) + y[s - nf:s] * w
nfo, nef = int(FOER * SR), int(EFTER * SR)
ud = np.concatenate([B[L - nfo:], B, B[:nef]])
top = np.abs(ud).max()
print("top i loopet: %.2f dBFS; niveau: %.1f dB RMS" % (20 * np.log10(top), 20 * np.log10(np.sqrt((B ** 2).mean()))))


def db(sig):
    return 20 * np.log10(np.sqrt((sig ** 2).mean()) + 1e-9)


print("niveau de sidste 4 x 50 ms foer soemmen: %s; de foerste 4 x 50 ms efter: %s" % (
    " ".join("%.0f" % db(B[L - (k + 1) * 2400:L - k * 2400]) for k in range(3, -1, -1)),
    " ".join("%.0f" % db(B[k * 2400:(k + 1) * 2400]) for k in range(4))))


# Er soemmen usaedvanlig? Sammenlign springet i spektret med de andre slag 1
def spring(sig, midt):
    n = 2048
    a = np.abs(np.fft.rfft(sig[midt - n:midt].mean(axis=1) * np.hanning(n)))
    b = np.abs(np.fft.rfft(sig[midt:midt + n].mean(axis=1) * np.hanning(n)))
    return float(np.maximum(np.log1p(100 * b) - np.log1p(100 * a), 0).sum())


takt = L / (SLAG / 4)
andre = [spring(B, int(k * takt) + int(FORAN * SR)) for k in range(1, SLAG // 4)]
rundt = np.concatenate([B[-4096:], B[:4096]])
print("spektralt spring ved soemmen: %.0f; ved de andre slag 1: median %.0f, mindst %.0f, stoerst %.0f" % (
    spring(rundt, 4096 + int(FORAN * SR)), np.median(andre), min(andre), max(andre)))
print("samplespring over soemmen: %.4f (typisk mellem nabosamples: %.4f)" % (np.abs(B[0] - B[-1]).max(), np.abs(np.diff(B[:, 0])).mean()))

# Skriv som mp3
enc = subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ac", "2", "-ar", str(SR), "-i", "-",
                      "-codec:a", "libmp3lame", "-b:a", "192k", "-id3v2_version", "3",
                      "-metadata", "title=" + TITEL, "-metadata", "comment=Loop klippet med byg_loop.py, %.2f-%.2f s" % (s / SR, (s + L) / SR), UD],
                     input=ud.astype(np.float32).tobytes(), capture_output=True)
print(enc.stderr.decode(errors="replace")[:400])

# Kontrol: afkod mp3-filen og se, at den er periodisk med loopets laengde
q = subprocess.run(["ffmpeg", "-v", "error", "-i", UD, "-f", "f32le", "-ac", "2", "-ar", str(SR), "-"], capture_output=True)
z = np.frombuffer(q.stdout, dtype=np.float32).reshape(-1, 2).astype(np.float64)
print("mp3: %.3f s (ventet %.3f s)" % (len(z) / SR, len(ud) / SR))
a0 = nfo + int(0.2 * SR)
seg = z[a0:a0 + int(1.0 * SR), 0]
bedst = max(range(-3000, 3001), key=lambda d: float((seg * z[a0 + L + d:a0 + L + d + len(seg), 0]).sum()))
c = float(np.corrcoef(seg, z[a0 + L + bedst:a0 + L + bedst + len(seg), 0])[0, 1])
print("halen gentager starten med forskydning %d samples, korrelation %.4f" % (bedst, c))
ebu = subprocess.run(["ffmpeg", "-nostats", "-i", UD, "-filter_complex", "ebur128", "-f", "null", "-"], capture_output=True, text=True, errors="replace").stderr
print("lydstyrke: " + " ".join(ebu[ebu.rfind("Integrated loudness:"):].split()[:5]))
print(json.dumps({"start": FOER, "laengde": round(L / SR, 4), "hale": EFTER, "bpm": round(60 / slag, 3)}))
