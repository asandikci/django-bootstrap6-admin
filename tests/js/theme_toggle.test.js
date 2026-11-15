const fs = require("fs");
const vm = require("vm");

const source = fs.readFileSync(
    "src/django_bootstrap6_admin/static/django_bootstrap6_admin/js/theme.js",
    "utf8",
);

class ClassList {
    constructor() {
        this.values = new Set();
    }
    add(value) {
        this.values.add(value);
    }
    remove(value) {
        this.values.delete(value);
    }
    contains(value) {
        return this.values.has(value);
    }
}

function makeElement() {
    return {
        style: {},
        classList: new ClassList(),
        dataset: {},
        attrs: {},
        offsetWidth: 0,
        setAttribute(name, value) {
            this.attrs[name] = value;
        },
        appendChild() {},
    };
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function effective(mode, prefersDark) {
    return mode === "auto" ? (prefersDark ? "dark" : "light") : mode;
}

async function run({ prefersDark, stored, reducedMotion = false }) {
    const root = makeElement();
    const body = makeElement();
    const localStorage = {
        value: stored,
        getItem() {
            return this.value;
        },
        setItem(_key, value) {
            this.value = value;
        },
    };
    const sandbox = {
        console,
        setTimeout,
        clearTimeout,
        localStorage,
        getComputedStyle() {
            return { backgroundColor: "rgb(13, 20, 28)" };
        },
        document: {
            documentElement: root,
            body,
            readyState: "complete",
            createElement: makeElement,
            querySelectorAll() {
                return [];
            },
            addEventListener() {},
        },
    };
    sandbox.window = sandbox;
    sandbox.window.matchMedia = (query) => ({
        matches: query.includes("prefers-reduced-motion")
            ? reducedMotion
            : query.includes("prefers-color-scheme") && prefersDark,
        addEventListener() {},
    });
    sandbox.window.setTimeout = setTimeout;

    vm.runInNewContext(source, sandbox, { filename: "theme.js" });

    const api = sandbox.window.Bootstrap6AdminTheme;
    const before = root.dataset.theme;
    const beforeEffective = root.dataset.effectiveTheme;
    api.cycle();
    await sleep(reducedMotion ? 10 : 600);
    const after = root.dataset.theme;
    const afterEffective = root.dataset.effectiveTheme;

    return { before, beforeEffective, after, afterEffective };
}

(async () => {
    const cases = [
        { label: "dark system, no stored theme", prefersDark: true, stored: null },
        { label: "dark system, stored auto", prefersDark: true, stored: "auto" },
        { label: "dark system, stored dark", prefersDark: true, stored: "dark" },
        { label: "dark system, stored light", prefersDark: true, stored: "light" },
        { label: "light system, no stored theme", prefersDark: false, stored: null },
        { label: "light system, stored auto", prefersDark: false, stored: "auto" },
        { label: "light system, stored light", prefersDark: false, stored: "light" },
        { label: "light system, stored dark", prefersDark: false, stored: "dark" },
    ];

    let failed = false;
    for (const testCase of cases) {
        const result = await run(testCase);
        const changed = result.beforeEffective !== result.afterEffective;
        if (!changed) {
            failed = true;
        }
        console.log(
            `${changed ? "PASS" : "FAIL"} ${testCase.label}: ` +
                `${result.before}/${result.beforeEffective} -> ` +
                `${result.after}/${result.afterEffective}`,
        );
    }

    const reduced = await run({
        prefersDark: true,
        stored: "dark",
        reducedMotion: true,
    });
    const reducedChanged = reduced.beforeEffective !== reduced.afterEffective;
    if (!reducedChanged) {
        failed = true;
    }
    console.log(
        `${reducedChanged ? "PASS" : "FAIL"} reduced motion: ` +
            `${reduced.before}/${reduced.beforeEffective} -> ` +
            `${reduced.after}/${reduced.afterEffective}`,
    );

    process.exit(failed ? 1 : 0);
})();
