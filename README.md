# Markdown → Jake's Resume

A free tool for writing your resume in plain text and seeing it laid out live, in the style of the famous **Jake's Resume** template from Overleaf.

No account, no sign-up: you write on the left, your resume appears on the right.

## What it does

- **Live preview**: every edit shows up instantly in the resume.
- **The Jake's Resume look**: same font, same underlined headings, same right-aligned dates as the original LaTeX template.
- **One-click PDF export**, with text readable by applicant tracking systems (ATS).
- **Auto-save**: your resume stays saved in your browser, so you'll find it again when you come back.
- **Free-form**: add your own sections, in whatever language you like.

## How to write your resume

At the very top, your contact details:

```
---
name: Ryan Lake
phone: 123-456-7890
email: ryan@su.edu
linkedin: linkedin.com/in/ryanlake
github: github.com/ryanlake
---
```

Then each section starts with `##`, and each entry starts with `###`. The `|` symbol separates what goes on the left from what goes on the right:

```
## Experience

### Web Developer | Jan. 2023 -- Present
Company | Paris, France
- One achievement
- Another achievement
```

For skills, put the category in bold:

```
## Technical Skills

**Languages**: Python, JavaScript, SQL
```

The sample resume loaded on startup demonstrates all these cases. The **Reset** button lets you go back to it at any time.

## Privacy

Your resume is saved only in your browser. When exporting to PDF, it's sent to the server just long enough to generate the file, then forgotten: nothing is stored.
