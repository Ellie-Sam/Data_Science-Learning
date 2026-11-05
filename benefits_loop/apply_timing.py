# Sets each scene's duration from the narration clip lengths so the video is exactly 60 s,
# and writes the audio start time of every clip to voice_timing.json.
import json, re, sys
lens = json.load(open(sys.argv[1]))
TOTAL, LEAD = 60.0, 0.15
gaps = [0.42] * len(lens)
gaps[11] = 1.6                       # "And the loop starts again": let the dot travel around
gaps[12] = TOTAL - sum(lens) - sum(gaps[:12])
d = [round(l + g, 3) for l, g in zip(lens, gaps)]
d[-1] = round(TOTAL - sum(d[:-1]), 3)
p = 'src/video.html'; s = open(p).read()
it = iter(d)
s = re.sub(r"\{ d: [0-9.]+, cap:", lambda m: "{ d: %s, cap:" % next(it), s)
open(p, 'w').write(s)
starts, t = [], 0
for x in d: starts.append(round(t + LEAD, 3)); t += x
json.dump({'durations': d, 'audio_starts': starts}, open('voice_timing.json', 'w'), indent=1)
print(d, sum(d))
