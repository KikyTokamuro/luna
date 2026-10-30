# Luna - Menstrual Cycle Calendar

A PWA for tracking menstrual cycles: log period days, predict upcoming periods, ovulation, and the fertile window, and keep a diary of symptoms and notes. It works offline, and data is stored locally in the browser.

## Development and Build

Stack: Vite + vite-plugin-pwa, Preact + htm, Tailwind CSS, Font Awesome. All dependencies are local; no CDN is used.

```bash
npm install     # install dependencies
npm run dev     # development server (http://localhost:5173)
npm run build   # production build in dist/
npm run preview # preview the built version locally
```

The build adds all assets (JS, CSS, fonts, icons, and manifest) to the service worker precache, so the app works fully offline after the first load.

## Features

- **Calendar** - mark period days with one tap; highlight recorded periods, predicted periods, ovulation days, and fertile days, including **past cycles** reconstructed from history.
- **Day panel** - cycle phase (menstrual, follicular, ovulation, fertile window, luteal, transitional), cycle day, symptoms, intercourse log, and note.
- **Statistics** - current cycle day, average cycle and period lengths, next period date, a “Forecast” card, intercourse statistics (total, this month, most recent, average frequency), and cycle history shown as bars with ovulation markers.
- **Settings** - default cycle and period lengths (when there is little history), JSON backup export/import, and complete data deletion.

## Data Storage

Everything is stored locally in IndexedDB (`luna-db`):

- `periodDays` - period days;
- `logs` - symptoms, notes, and intercourse logs by date;
- `kv` - settings.

## Calculation and Prediction Methods

### 1. Grouping Marked Days into Periods (Runs)

Marked days are grouped into continuous intervals. Days with a gap of no more than one day are treated as one run. This accounts for crossing midnight and an accidentally missed day within a period.

### 2. Cycle and Period Lengths

- **Period length** for a run = end date − start date + 1 day.
- **Cycle length** = time from the start of run (i−1) to the start of run i. The first run does not yield a cycle length because there is no previous start date.

### 3. Averaging (Resistant to Outliers)

- Calculations use the **six most recent** cycles/periods.
- Average cycle length is the **median** of the last six cycles when at least three are available. This prevents a single unusual cycle (due to stress or a delayed period, for example) from shifting the prediction by several days. With one or two cycles, the arithmetic mean is used.
- Average period length is the arithmetic mean of the last six runs.
- If there is no history, the app uses the settings (28 / 5 days by default).

### 4. Ovulation and the Fertile Window

The calendar method assumes a **relatively stable luteal phase** (~14 days), as supported by research: the follicular phase varies, while the time from ovulation to the next period averages 12–14 days.

- **Ovulation** = start of the next period − 14 days.
- **Fertile window** = from five days before ovulation through one day after it: sperm can remain viable for up to five days, and an egg for about one day.

When reconstructing **completed** cycles, the app uses the **actual recorded** start of the next period, which is more accurate than using the average cycle length. For the **current** cycle (when the next period has not yet been recorded), the predicted start is the last recorded start plus the average cycle length; ovulation is calculated from that date.

The ovulation date is constrained to reasonable bounds (no earlier than cycle day 5 and no later than the day before the next period starts) in case the recorded data contains an unusually short cycle.

### 5. Period Prediction

The next period is predicted to start on the last recorded start date plus the average cycle length and to last for the average period length. The app predicts one cycle ahead. Predicted days are highlighted in the calendar only for the current cycle, since actual data is available for past cycles.

### 6. Cycle Phases (for the Day Panel)

Each day is assigned to the cycle it belongs to (the most recently started cycle). The cycle day is counted from the start of that cycle. Phases are:

- **Menstrual** - a marked period day;
- **Follicular** - before the fertile window;
- **Fertile window** and **Ovulation** - based on the formulas above;
- **Luteal** - after the fertile window;
- **Transitional** - all other days (including days before the first recorded period, when no data is available).

## Accuracy and Limitations

The calendar method provides estimates. It relies on the regularity of past cycles and does not account for individual variation, stress, illness, medication, and other factors. Actual ovulation may shift by one or two days or more; predictions are less accurate for irregular cycles. The app **is not a contraceptive method** and does not replace medical advice. Contraception and pregnancy planning require more accurate methods (ovulation tests, basal body temperature measurement, ultrasound).
