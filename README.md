# MCQ Studio

A browser-based 16:9 MCQ presentation workspace designed for teaching videos and OBS capture.

## Run

Open `index.html` in a modern browser, or serve this folder with any static web server. No build step or backend is required.

## Question format

The parser reads exactly three `#` sections per question:

```text
# भारत का संविधान कब लागू हुआ?
A. 15 अगस्त 1947
B. 26 जनवरी 1950
C. 26 नवंबर 1949
D. 2 अक्टूबर 1950

# B

# भारतीय संविधान 26 नवंबर 1949 को अंगीकृत किया गया था,
लेकिन इसे 26 जनवरी 1950 को लागू किया गया।
```

Repeat the same structure for each question. A set of 100 questions creates 300 presentation stages.

## Stages

1. Question and all options appear together.
2. The same question and options appear with the correct option highlighted.
3. Explanation appears.

## Controls

- Right half / Right Arrow: next stage
- Left half / Left Arrow: previous stage
- Space: play or pause attached stage audio
- F: browser fullscreen
- Open Presentation: clean full-screen presentation mode

## Audio in v1

Attach one audio file for the current Question, Answer and Explanation stage using the audio file selectors. Audio files are used locally in the current browser session; they are not uploaded to a server. The playback controls support play, pause and seek.

**Alignment status:** phrase/word-level AI audio-to-text alignment is not yet implemented. v1 does not generate timestamps. The intended next step is to add a forced-alignment adapter that produces reusable timestamp JSON for each audio asset.

## Privacy

Question text and audio remain in the browser. The app does not call an external API.
