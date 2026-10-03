# AHK Tahta: live whiteboard for lessons

A shared online whiteboard for AHK Akademi teachers and students, like webwhiteboard.com but your own.

- **Teachers** log in, create a board per lesson or student, and share its link.
- **Students** open the link, type their name and join. No account needed.
- Everyone sees drawing, writing, cursors and the laser pointer live, on computer, tablet or phone.
- Boards save automatically and stay in the teacher's list.

Built on [Excalidraw](https://github.com/excalidraw/excalidraw) (MIT licence, free for commercial use). The interface is in Turkish, and Arabic text works.

## What teachers can do

| Feature | Where |
|---|---|
| Pen, highlighter, shapes, arrows, text, eraser, laser pointer, images | Toolbar at the top |
| Add a PDF worksheet or images as pages on the board | Teacher bar: **📄 PDF / resim** (or the ☰ menu) |
| Lock the board so students can only watch | Teacher bar: **🔓 Herkes çizebilir / 🔒 Öğrenciler izliyor** |
| Make every student's screen follow yours (presentation mode) | Teacher bar: **📡 Beni takip etsinler** |
| See who is on the board | Avatars top right, **👥** count in the teacher bar |
| Copy the student link | **Bağlantıyı paylaş** (top right, or ☰ menu on phones) |
| Download the board as an image | ☰ menu: **PNG olarak indir** |
| Rename or delete boards | Dashboard at the site's home page |

The admin (you) sees every teacher's boards; other teachers see only their own.

## Deploy on Railway

1. Put the contents of this `whiteboard/` folder in its own GitHub repo (or point Railway at this folder as the root directory).
2. In Railway: **New Project → Deploy from GitHub repo**. `railway.json` tells it how to build and start, so there's nothing else to set.
3. **Add a volume** (Railway → your service → Settings → Volumes) mounted at `/data`. Without it, boards are wiped on every deploy.
4. Set these **variables** (Railway → Variables):

   | Variable | Example | What it does |
   |---|---|---|
   | `TEACHERS` | `ahsan:a-long-password:admin,brishna:another-password` | Teacher logins, as `name:password`, with `:admin` for anyone who should see all boards. Separate teachers with commas. |
   | `SESSION_SECRET` | any long random text | Keeps teachers logged in across restarts. |
   | `DATA_DIR` | `/data` | Where boards are saved (the volume). |

5. Open the Railway URL, log in, create a board and share the link. Add your own domain (e.g. `tahta.ahkademy.com`) under Settings → Networking.

To add or remove a teacher, edit `TEACHERS` and Railway restarts the app. Use strong passwords: anyone with a teacher password can see and delete that teacher's boards.

## Run it on your laptop

```
npm install
npm run build
TEACHERS="ahsan:test:admin" SESSION_SECRET=dev npm start
```

Open http://localhost:3000. (On Windows PowerShell set the variables with `$env:TEACHERS="ahsan:test:admin"` first.)

## Good to know

- **Anyone with a board link can draw on it** unless you lock it. Links are long and random, so they can't be guessed, but don't post them publicly.
- **Students' drawing isn't lost if the internet drops**: it's sent when they reconnect.
- **PDFs**: up to 40 pages per file are added, each as a page image you can write on. Very large images (over ~10 MB) are refused.
- **Storage**: boards are plain JSON files in `DATA_DIR`. Back up the volume if lessons matter long-term.
- The old boards list shows the most recently used first.
