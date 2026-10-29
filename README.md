# Jessy El Khoury — website

Website for Jessy El Khoury, Pediatric Speech & Language Therapist, built from the
approved content and developer handoff.

- **Static site** built with [Eleventy](https://www.11ty.dev/): plain HTML, inlined
  CSS, a few lines of JavaScript for the mobile menu. Fast, accessible, cheap to host.
- **Editable by Jessy** through [Decap CMS](https://decapcms.org/) at `/admin/`.
  Copy, contact details and her portrait can all be changed without touching code.
- **Approved copy is checked automatically**: `npm run check` confirms every
  paragraph from the handoff appears verbatim on the right page.

## Quick start

Requires Node.js 20 or newer.

```bash
npm install
npm start          # http://localhost:8080, reloads on changes
npm run build      # production build into _site/
npm run check      # build + verify the approved copy
```

To try the CMS locally, run `npm run cms` in a second terminal next to `npm start`,
then open <http://localhost:8080/admin/> and click **Login**. Changes are written
straight to the files in `src/_data/`.

## Where things live

| What | File |
| --- | --- |
| Contact details, name, search description | `src/_data/settings.yml` |
| Homepage hero | `src/_data/home.yml` |
| About Me (intro, sections, closing statement, portrait) | `src/_data/about.yml` |
| Areas of Expertise | `src/_data/areas.yml` |
| How I Work | `src/_data/howIWork.yml` |
| For Parents | `src/_data/parents.yml` |
| Contact page copy | `src/_data/contact.yml` |
| Navigation (fixed order from the handoff) | `src/_data/navigation.yml` |
| Page templates | `src/*.njk`, `src/_includes/` |
| Styles | `src/_includes/css/main.css` |
| CMS configuration | `src/admin/config.yml` |
| Approved copy used by the checker | `tests/approved-copy.json` |

The homepage reuses copy from the other pages (the About Me introduction, the five
Areas of Expertise titles, the five How I Work titles, the For Parents questions and
the Contact section), so each text exists in one place only. The Areas, How I Work,
For Parents and Contact sections are teasers: their titles link to the full text on
each page, and the Contact teaser shows one short sentence (editable in the CMS under
Pages, Home) and the email address.

Moving between pages slides sideways (CSS view transitions) in the order of the main
menu: going to a page further right (Home, About Me, Areas of Expertise, How I Work,
For Parents, Contact) slides right, going to one further left slides left, including
with the browser's back and forward buttons. Pages open directly at the linked
section, and the header stays in place. Once a page has loaded, the other pages and
their drawings are quietly loaded in the background (skipped in data-saver mode), so
every move starts straight away with the drawings already there. The homepage's
fade-up only plays when the site is first opened, not when sliding in from another
page. The lists at the top of the
Areas of Expertise and For Parents pages scroll smoothly down the same page instead,
so they have no arrows; these jumps don't add a back-button step, so going back always
returns to the previous page. On the longer pages (Home, About Me, Areas of Expertise,
How I Work, For Parents) a small round "back to top" button with an up arrow appears at
the bottom right once you scroll past the top of the page; set `toTop: true` in a page's
front matter to add it to another page. Browsers without view transitions simply jump, and the
motion is off for anyone who has reduced motion switched on. Hover effects only show
with a mouse or trackpad, so on phones a tapped card doesn't stay highlighted.

## Preview on GitHub Pages

A preview of the site is published at
<https://charbels07.github.io/website-jessy/> by the workflow in
`.github/workflows/pages.yml`, on every push. The preview is marked `noindex`, so
it stays out of search engines until the real domain is live. The CMS at `/admin/`
can't sign in on the preview because it needs Netlify (below).

One-time setup: in the repository, go to **Settings → Pages** and set **Source** to
**GitHub Actions**. Then re-run the workflow from the **Actions** tab, or push any
commit.

## Deploying (Netlify)

`netlify.toml` already holds the build settings.

1. Push this repository to GitHub, with the site on the `main` branch.
2. In Netlify: **Add new site → Import an existing project → GitHub**, pick the
   repository. The build command (`npm run build`) and publish folder (`_site`) are
   detected from `netlify.toml`.
3. Add Jessy's domain under **Domain management**. HTTPS is set up automatically.
   Netlify passes the address to the build, so canonical links, the sitemap and
   social previews use it without further setup.

Any other static host works too (Cloudflare Pages, Vercel, GitHub Pages): build with
`npm run build` and serve `_site/`. In that case, enter the address under **Website
address** in the CMS settings, and set up CMS sign-in separately (see the Decap
docs on external OAuth clients).

### Content editing (CMS sign-in)

The CMS saves each change as a commit to the repository, and Netlify rebuilds the
site in about a minute. It is configured for the **GitHub** backend with
`repo: charbels07/website-jessy` and `branch: main`. Update both in
`src/admin/config.yml` if the repository moves (for example, when it is
transferred to Jessy).

1. On GitHub, go to **Settings → Developer settings → OAuth Apps → New OAuth App**.
   Use the site's address as the homepage URL and
   `https://api.netlify.com/auth/done` as the authorization callback URL.
2. In Netlify, go to **Site configuration → Access & security → OAuth → Install
   provider → GitHub** and paste the client ID and secret.
3. Give Jessy a GitHub account with write access to the repository. She then edits
   the site at `https://<her-domain>/admin/`.

If Jessy would rather sign in with just an email and password, Decap also supports
Netlify Identity with Git Gateway. Check that Netlify Identity is available on the
account first, since Netlify changed its status in 2025–26. To use it, change the
backend in `src/admin/config.yml` to `name: git-gateway` (the file has the snippet),
enable Identity and Git Gateway in Netlify, and invite Jessy by email.

## Before launch

The handoff's pre-launch checklist, and where each item stands:

- [x] **All Part 1 text copied verbatim.** The content files were generated directly
  from the handoff document, not retyped, and `npm run check` verifies every
  paragraph and heading on the built pages. Changes made at the client's request on
  2026-10-28/29: the four em dashes in the copy were replaced with commas (the check
  now fails if one reappears); the "Phone / WhatsApp" line was removed because Jessy
  prefers to be contacted by email only; the hero tagline ("Supporting communication,
  learning, and development, together with families.") was removed; and the homepage
  How I Work and Contact sections were shortened to teasers, with the full text kept
  on those pages.
- [x] **Navigation labels and order match the handoff.** Also verified by
  `npm run check`.
- [x] **Email and phone/WhatsApp placeholders replaced once Jessy supplies them.**
  The email is set to jessyelkhoury0@gmail.com and links to a new message. At
  Jessy's request no phone number is shown: the phone field in the CMS (*Contact
  details & settings*) is empty, which hides the "Phone / WhatsApp" line on every
  page. Entering a number brings it back, with working call and WhatsApp links.
  `npm run check:launch` fails if a placeholder ever reappears.
- [x] **No credentials, claims, services, testimonials or copy added.** See the
  note on interface text below.
- [x] **Checked on mobile and desktop.** Layouts are tested from 320 to 1920 px wide,
  with no horizontal scrolling.
- [x] **Accessibility, images, contact links, forms and navigation tested.** No axe
  WCAG 2.1 AA violations on any page. The site works by keyboard, including the
  mobile menu with Escape to close, and without JavaScript. Every internal link and
  anchor resolves. There is no contact form, so no personal or medical information
  is collected.
- [x] **Part 2 implementation notes not visible on the site.** `npm run check` also
  scans every page for developer-only text and the excluded term "Verbal Behavior".

### To confirm with Jessy

- **Portrait (optional):** upload it under *Pages → About Me → Portrait*, with a
  short description. It replaces the painted scene on the About Me page, and is
  converted to responsive AVIF/WebP/JPEG automatically.
- **Domain name.**

### Interface text not taken from the handoff

All website copy comes from the handoff. The only other words on the site are
standard interface and accessibility text:

- "Skip to content" (keyboard users) and "Menu" (screen-reader label on the menu
  button);
- the word "WhatsApp" on the WhatsApp link, if a phone number is ever entered;
- the footer line "© {year} Jessy El Khoury";
- the 404 page heading, "Page not found";
- page titles in browser tabs, built from the approved page names, for example
  "About Me | Jessy El Khoury".

The search and link-preview description is the approved hero sentence.

## Content rules (from the handoff)

For anyone editing the site later:

- Keep the approved copy exactly as written. The only changes so far, all at the
  client's request, are the contact details, the em dashes (replaced with commas), the
  removal of the phone line and the hero tagline, and the shorter homepage teasers.
- Do not add testimonials, credentials, services, claims or calls to action without
  Jessy's approval.
- Do not describe Jessy as an IBA or BCBA. Her behavior-analysis training is ongoing
  and behavior-analytic work is under BCBA supervision.
- Keep "specialized training" wording for ADOS-2 and ADI-R.
- Use "parent-mediated interventions (PMIs)" only at its first mention.
- Do not add the term or service "Verbal Behavior".
- No numbering before the Areas of Expertise titles.

## Design notes

- **Palette:** from the handoff (dusty blue `#5B7C99`, warm cream `#F0E4D8`, clay
  `#C97B5A`, off-white `#FBF9F6`, near-black `#33322E`, ink navy `#2B3946`, moss
  `#8A9878`). These colours are used for the illustrations and backgrounds. Text uses
  slightly deeper tones of the same colours so that all text meets WCAG AA contrast.
- **Type:** Fraunces for headings, Figtree for body text. At the client's request the
  headings' capital J and lowercase f come from Newsreader (plainer forms: Fraunces's J
  dips below the line and its f curls), merged into the same font family by
  `unicode-range`. All are self-hosted and subset (about 100 KB in total) under the SIL
  Open Font License; licences are in `src/assets/fonts/`.
- **Illustrations:** hand-drawn storybook style (ink lines with soft palette fills),
  drawn as SVG for this site, so they stay sharp and light. Scenes show parent and
  child play, picture cards, blocks, books, a kite and rolling hills. Large scenes
  are in `src/assets/illustrations/`; icons are in `src/_includes/partials/sprite.njk`.
  The homepage and About Me show soft painted pictures of Jessy supplied by the client
  (`src/assets/art/`): on the homepage with a child on the rug beside her, on About Me
  on her own. Their pale background was matched to the page colour, the build makes
  sized WebP copies, and their edges fade into the page.
  Each Area of Expertise (and its subsections), How I Work principle and For Parents
  question picks its icon in the CMS, and each About Me section can show a small
  illustration beside its text. Longer passages have a faint layer of hand-drawn
  doodles behind them (`doodles.svg`: speech bubbles, letters, a kite, music notes and
  so on), kept pale enough that the text stays fully readable. No stock photos or
  puzzle pieces.
