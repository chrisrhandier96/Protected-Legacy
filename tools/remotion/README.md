# Guide explainers (Remotion)

Short animated loops for the guides, rendered to MP4 and served from `/img/vid/`.
On screen: numbers only. Words live in the guide's caption (the `video` block in `content/guides/*.json`), so one file serves ES and EN.

Setup: `npm i`, then copy `fonts/marcellus-400.woff2` and `fonts/figtree-var.woff2` into `tools/remotion/public/`.

One MP4 (H.264, every browser) and one WebM fallback (VP9, for browsers without H.264) per clip.

Render (1280x720 composition at 0.75 scale, 10 s, 30 fps), then re-encode for every browser:

    npx remotion render FloodGap out/flood-gap.mp4 --codec=h264 --crf=26 --scale=0.75
    npx remotion ffmpeg -i out/flood-gap.mp4 -c:v libx264 -crf 26 -preset slow -pix_fmt yuv420p -movflags +faststart -an ../../img/vid/flood-gap.v1.mp4
    npx remotion still FloodGap out/flood-gap.png --frame=210 --scale=0.75   (poster, saved as .webp)

Compositions: FloodGap (flood guide), OneInFive (umbrella guide), CondoAssessment (condo guide).
Every number must match the guide text and its source. Change a file's version (`.v2`) when it changes: /img/ is cached for 7 days.

## Social cuts (9:16)

`Social-<flood|umbrella|condo>-<es|en>` (1080x1920, 13 s): the question, the explainer, one plain sentence with its source, then a card with the guide address. Rendered files are not kept in the repo.

    npx remotion render Social-flood-es out/pp-flood-es-9x16.mp4 --codec=h264 --crf=22
