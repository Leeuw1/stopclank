# StopClank — Full-Stack Interactive Coding Game

StopClank is a rogue-lite coding game. Solve algorithm challenges to progress through a story, earn augments, and advance through increasing difficulty.

## Architecture

- Nginx: Serves the frontend (vanilla JS/HTML/CSS) and proxies API calls.
- PostgreSQL + PostgREST: Stores users, scores, lives; exposes REST and RPC (e.g., complete_level).
- Python Test Server: Dynamically executes user-submitted code against per-challenge tests.
- Frontend (Vanilla JS): Game loop, UI, challenge runner (Pyodide in-browser), and story presentation.

## Key Features

- Randomized challenge selection by difficulty; unique challenge number sent for testing.
- Progression system: lives, scores, high score, and augments (rarity-styled).
- Story setting with highlighted animated location title and separate lore panel.
- Clean two-column dashboard (task + sidebar stats/augments).
- Cookie-based login check; redirects unauthenticated users to login.

## Getting Started

Go to _____________.com


## Frontend (nginx/content)

- index/home/run/challenge pages and assets.
- challenges.json defines each challenge:
  - number (unique id used by backend tests)
  - difficulty (grouping for random selection)
  - lore, descriptionHtml, codeTemplate, tests
- run.js
  - onWindowLoad: loads user, challenges, augments; redirects if no cookie.
  - Random challenge selection by difficulty.
  - populateStorySetting: types only the location name; lore shown below without typing.
  - Typewriter effect that supports styled HTML.
- style.css
  - Dashboard layout, story panels, rarity styles:
    - rarity-common, rarity-uncommon, rarity-rare
- augments.js
  - Displays acquired augments and selectable options with rarity coloring.

## Backend Test Server (test_server)

- main.py: Receives submissions, runs challenge tests, updates progress via PostgREST RPC.
- challenges/challengeN.py: One test script per challenge (loads user code via importlib).
  - Common patterns:
    - Deterministic tests + randomized stress tests
    - For linked list problems: ListNode helpers (list_to_ll, ll_to_list)
- You can run a test locally (example):
  - python test_server/challenges/challenge5.py path\to\user_code.py

## Database (via PostgREST)

- Users table includes: id, current_level (used as difficulty), current_score, high_score, current_lives, augments.
- RPC complete_level increments current_level and updates score/high_score.

## Adding a New Challenge

1) Update nginx/content/challenges.json
- Add a new object with fields: number, difficulty, lore, descriptionHtml, codeTemplate, tests

2) Add a test file
- Create test_server/challenges/challenge<number>.py
- Follow existing examples: deterministic + random tests; exit(0) on success, exit(1) on failure

3) (Optional) Update storySetting in run.js if the new difficulty corresponds to a new location.


## Project Structure

- nginx/
  - content/
    - index.html, run.html, challenge.html
    - run.js, challenge.js, augments.js, api.js
    - style.css, challenges.json, augments.json (if present)
- test_server/
  - main.py
  - challenges/
    - challenge0.py … challengeN.py
- docker-compose.yml (and service configs)
- README.md

## License

This project is licensed under the GNU General Public License v3.0 (GPL-3.0).
See the LICENSE file for details.