# Places each narration clip at its scene start, mixes to one 60 s track and muxes it into the MP4.
import json, subprocess, sys, os
vdir, video = sys.argv[1], sys.argv[2]
starts = json.load(open('voice_timing.json'))['audio_starts']
inputs, filt = [], []
for i, st in enumerate(starts):
    inputs += ['-i', os.path.join(vdir, f'line{i:02d}.wav')]
    ms = int(st * 1000); filt.append(f'[{i}:a]adelay={ms}|{ms}[a{i}]')
filt.append(''.join(f'[a{i}]' for i in range(len(starts))) + f'amix=inputs={len(starts)}:normalize=0,apad,atrim=0:60,loudnorm=I=-16:TP=-1.5:LRA=11,aresample=48000[out]')
wav = os.path.join(vdir, 'narration.wav')
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', *inputs, '-filter_complex', ';'.join(filt), '-map', '[out]', '-ac', '2', wav], check=True)
tmp = video + '.tmp.mp4'
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', video, '-i', wav, '-map', '0:v', '-map', '1:a', '-c:v', 'copy',
                '-c:a', 'aac', '-b:a', '160k', '-t', '60', '-movflags', '+faststart', tmp], check=True)
os.replace(tmp, video); print('muxed', video)
