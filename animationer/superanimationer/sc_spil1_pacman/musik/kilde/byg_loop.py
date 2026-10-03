# Klipper et loop ud af sangen: fra temaets start til det sted, hvor temaet kommer igen.
# Filen bygges periodisk: [de sidste FOER s af loopet][loopet][de foerste EFTER s af loopet],
# saa afspilleren kan springe LAENGDE tilbage hvor som helst i halen uden at det kan hoeres,
# ogsaa naar browserens mp3-afkoder forskyder lyden nogle millisekunder.
#
# Maalt i sangen (anslag.py): temaets foerste slag falder ved 19,4473 s, og naar temaet
# kommer igen, falder slag 1 ved 92,560 s (gitteret gennem de foelgende anslag).
import subprocess, sys, json
import numpy as np

FIL, UD = sys.argv[1], sys.argv[2]
SR = 48000
S_ANSLAG, E_ANSLAG = 19.4473, 92.5600
SLAG = 120                            # 30 takter
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

# Loopet. De sidste FADE s glider over i det, der i sangen ligger lige foer temaets start,
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

# Rytmen over soemmen: anslagene i de sidste og de foerste 1,3 s (1 ms oploesning)
mono = np.concatenate([B[-int(1.3 * SR):], B[:int(1.3 * SR)]]).mean(axis=1)
N, HOP = 512, 48
antal = (len(mono) - N) // HOP
idx = np.arange(N)[None, :] + HOP * np.arange(antal)[:, None]
Sg = np.log1p(200 * np.abs(np.fft.rfft(mono[idx] * np.hanning(N), axis=1)))
fl = np.maximum(np.diff(Sg, axis=0), 0).sum(axis=1)
tt = (np.arange(len(fl)) + 1) * HOP / SR + N / 2 / SR - 1.3
toppe = []
for i in np.argsort(fl)[::-1]:
    if all(abs(tt[i] - u) > 0.06 for u in toppe):
        toppe.append(tt[i])
    if len(toppe) == 12:
        break
print("anslag omkring soemmen (ms, 0 = soemmen):", " ".join("%+.0f" % (1000 * u) for u in sorted(toppe)))

# Skriv som mp3
enc = subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ac", "2", "-ar", str(SR), "-i", "-",
                      "-codec:a", "libmp3lame", "-b:a", "192k", "-id3v2_version", "3",
                      "-metadata", "title=Retro Maze Chase (loop)", "-metadata", "comment=Loop klippet af Suno-sangen Retro Maze Chase, 19.44-92.55 s", UD],
                     input=ud.astype(np.float32).tobytes(), capture_output=True)
print(enc.stderr.decode(errors="replace")[:400])

# Kontrol: afkod mp3-filen og se, at den er periodisk med LAENGDE
q = subprocess.run(["ffmpeg", "-v", "error", "-i", UD, "-f", "f32le", "-ac", "2", "-ar", str(SR), "-"], capture_output=True)
z = np.frombuffer(q.stdout, dtype=np.float32).reshape(-1, 2).astype(np.float64)
print("mp3: %.3f s (ventet %.3f s)" % (len(z) / SR, len(ud) / SR))
a0 = nfo + int(0.2 * SR)
seg = z[a0:a0 + int(1.0 * SR), 0]
bedst = max(range(-3000, 3001), key=lambda d: float((seg * z[a0 + L + d:a0 + L + d + len(seg), 0]).sum()))
c = float(np.corrcoef(seg, z[a0 + L + bedst:a0 + L + bedst + len(seg), 0])[0, 1])
print("halen gentager starten med forskydning %d samples, korrelation %.4f" % (bedst, c))
print(json.dumps({"start": FOER, "laengde": round(L / SR, 4), "hale": EFTER, "bpm": round(60 / slag, 3)}))
