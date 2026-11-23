# MCQ Studio

Browser-based 16:9 MCQ presentation workspace designed for OBS capture.

## Run
Open `index.html` or use any static server. No build/backend required.

## Plain-text question format
Each question is represented by three # blocks:
```
# भारत का संविधान कब लागू हुआ?
A. 15 अगस्त 1947
B. 26 जनवरी 1950
C. 26 नवंबर 1949
D. 2 अक्टूबर 1950

# B

# भारतीय संविधान 26 नवंबर 1949 को अंगीकृत किया गया था,
लेकिन इसे 26 जनवरी 1950 को लागू किया गया।
```
Repeat for each question. 100 questions = 300 presentation stages.

## Presentation stages
1. Question + options
2. Same question/options with correct answer highlighted
3. Explanation

## Continuous audio
Upload ONE long audio track for the entire question set. The audio is not restarted, paused or changed when navigating presentation stages/questions. You can manually play/pause and seek from the transport controls.

## Controls
- Right Arrow or right-side click: next stage
- Left Arrow or left-side click: previous stage
- Space: play/pause continuous audio
- F: fullscreen
- Open Presentation: fullscreen canvas mode

## Audio synchronization
This version supports uninterrupted audio playback but does not yet include AI forced-alignment timestamps or automatic stage-by-time synchronization. That is a planned next step.

All question text and audio remain in the browser; no API calls.
