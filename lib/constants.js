/** 
 * Application name.
 * @type {string} 
 */
export const APP_NAME = "app.name";

/**
 * Application version, injected at build time.
 * @type {string} 
 */
export const APP_VERSION = import.meta.env.VITE_APP_VERSION;

/** 
 * Author website. 
 * @type {string} 
 */
export const AUTHOR_URL = 'https://kikytokamuro.space/about/';

/** 
 * Symptoms available in the diary (calendar chips). 
 * @type {string[]} 
 */
export const SYMPTOMS = [
    {
        "value": "Спазмы",
        "labelId": "symptoms.cramps"
    },
    {
        "value": "Головная боль",
        "labelId": "symptoms.headache"
    },
    {
        "value": "Усталость",
        "labelId": "symptoms.fatigue"
    },
    {
        "value": "Болезненность груди",
        "labelId": "symptoms.breastTenderness"
    },
    {
        "value": "Перепады настроения",
        "labelId": "symptoms.moodSwings"
    },
    {
        "value": "Тошнота",
        "labelId": "symptoms.nausea"
    },
    {
        "value": "Выделения",
        "labelId": "symptoms.discharge"
    },
    {
        "value": "Бессонница",
        "labelId": "symptoms.insomnia"
    }
];

/** 
 * Phase translation IDs.
 * @type {{
 *   period: string,
 *   periodPredicted: string,
 *   ovulation: string,
 *   fertile: string,
 *   follicular: string,
 *   luteal: string,
 *   transitional: string
 * }}
 */
export const PHASES = {
    period: "phases.period",
    periodPredicted: "phases.periodPredicted",
    ovulation: "phases.ovulation",
    fertile: "phases.fertile",
    follicular: "phases.follicular",
    luteal: "phases.luteal",
    transitional: "phases.transitional"
};

/**
 * Default cycle settings until history is available.
 * @type {{
 *   cycle: number,   // Cycle length in days
 *   period: number   // Period length in days
 * }}
 */
export const DEFAULT_SETTINGS = {
    language: "ru",
    cycle: 28,
    period: 5
};
