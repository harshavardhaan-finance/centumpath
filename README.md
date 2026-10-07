# Centum Path

A free study website for Tamil Nadu State Board Class 12 Commerce students (Commerce, Economics, Accountancy, Business Maths). It helps students learn each chapter and practise until they can score a centum.

## What students get

- **Notes and key terms** for all 60 chapters/units across the four subjects
- **Flashcards** for every key term (tap to flip, "Got it" / "Still learning", shuffle)
- **1-mark quizzes** with instant feedback and teacher's notes where the book key is wrong
- **2/3/5-mark answers** with show/hide and an "I can write this" tracker
- **Solved examples and practice problems** with book answers (Accountancy, Business Maths)
- **Daily Challenge**: 10 mixed MCQs, the same set for everyone each day
- **60-day study plan** with a daily to-do list
- **Mock papers** in the public exam pattern (90 marks, 3-hour timer, self-marking)
- **XP, levels, study streaks and badges** to keep students motivated
- Search across everything, light/dark theme, works on phones

Progress is saved in the student's own browser (localStorage). There are no accounts and no server.

## Project layout

```
index.html                 page shell
assets/css/style.css       styles (light + dark theme)
assets/js/app.js           the app: routing, views, quizzes, flashcards, XP
assets/data/content.json   all study content (chapters, notes, MCQs, answers, problems)
.github/workflows/pages.yml  deploys the site to GitHub Pages
```

To edit or add content, change `assets/data/content.json`. Each subject (`com`, `eco`, `acc`, `bm`) is a list of chapters with `notes`, `terms`, `mcq`, `q2`, `q3`, `q5`, `examples`, `problems`, `formulas` and `tips`.

## Run it locally

The page loads its content with `fetch`, so open it through a local web server rather than double-clicking the file:

```
python3 -m http.server 8000
```

Then visit http://localhost:8000.

## Publish it

The included workflow publishes the site with GitHub Pages on every push to `main`. One-time setup: in the repository, go to **Settings → Pages** and set **Source** to **GitHub Actions**. The site will be at `https://<owner>.github.io/centumpath/`.
