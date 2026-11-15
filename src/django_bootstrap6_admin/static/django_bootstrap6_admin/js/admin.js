"use strict";

/*
 * Small progressive enhancement layer for the Bootstrap 6 admin.
 *
 * Django's own admin JavaScript remains the source of truth for filters,
 * bulk actions and form widgets. This file adds dashboard search/collapse,
 * the right-hand filter disclosure and a few accessibility fixes.
 */
(() => {
    const DESKTOP = window.matchMedia("(min-width: 1200px)");
    const FILTERS_KEY = "django.admin.filtersCollapsed";
    const FACETS_KEY = "django.admin.showFacets";
    const COLLAPSED_APPS_KEY = "django.admin.collapsedApps";

    function readCollapsedApps() {
        try {
            const value = JSON.parse(
                localStorage.getItem(COLLAPSED_APPS_KEY) || "[]",
            );
            return new Set(Array.isArray(value) ? value : []);
        } catch (error) {
            return new Set();
        }
    }

    function writeCollapsedApps(labels) {
        try {
            localStorage.setItem(
                COLLAPSED_APPS_KEY,
                JSON.stringify(Array.from(labels)),
            );
        } catch (error) {
            // Storage can be unavailable in private or restricted contexts.
        }
    }

    function initAppCollapse() {
        const cards = document.querySelectorAll(".ba-app-card[data-app-label]");
        if (!cards.length) {
            return;
        }

        const collapsed = readCollapsedApps();

        cards.forEach((card) => {
            const label = card.dataset.appLabel;
            const button = card.querySelector(".ba-app-collapse");
            if (!button || !label) {
                return;
            }

            const setCollapsed = (isCollapsed, persist) => {
                card.classList.toggle("is-collapsed", isCollapsed);
                button.setAttribute(
                    "aria-expanded",
                    isCollapsed ? "false" : "true",
                );
                if (!persist) {
                    return;
                }
                if (isCollapsed) {
                    collapsed.add(label);
                } else {
                    collapsed.delete(label);
                }
                writeCollapsedApps(collapsed);
            };

            setCollapsed(collapsed.has(label), false);
            button.addEventListener("click", () => {
                setCollapsed(
                    !card.classList.contains("is-collapsed"),
                    true,
                );
            });
        });
    }

    function initDashboardSearch() {
        const form = document.getElementById("ba-dashboard-search");
        const input = document.getElementById("ba-dashboard-search-input");
        const clear = document.getElementById("ba-dashboard-search-clear");
        const empty = document.getElementById("ba-dashboard-search-empty");
        const cards = Array.from(
            document.querySelectorAll(".ba-app-card[data-app-label]"),
        );
        if (!form || !input || !cards.length) {
            return;
        }

        const normalize = (value) =>
            (value || "").trim().toLocaleLowerCase("tr");

        const apply = () => {
            const query = normalize(input.value);
            let visibleCards = 0;

            cards.forEach((card) => {
                const appName = normalize(card.dataset.appName);
                const appMatches = Boolean(query) && appName.includes(query);
                let visibleModels = 0;

                card.querySelectorAll(".ba-model-list > li").forEach((row) => {
                    const modelName = normalize(row.dataset.modelName);
                    const matches =
                        !query || appMatches || modelName.includes(query);
                    row.hidden = !matches;
                    if (matches) {
                        visibleModels += 1;
                    }
                });

                const show = !query || appMatches || visibleModels > 0;
                card.hidden = !show;
                card.classList.toggle("ba-search-match", Boolean(query) && show);
                const button = card.querySelector(".ba-app-collapse");
                if (button) {
                    button.setAttribute(
                        "aria-expanded",
                        query && show
                            ? "true"
                            : card.classList.contains("is-collapsed")
                              ? "false"
                              : "true",
                    );
                }
                if (show) {
                    visibleCards += 1;
                }
            });

            if (clear) {
                clear.hidden = !query;
            }
            if (empty) {
                empty.hidden = visibleCards > 0;
            }
        };

        form.addEventListener("submit", (event) => {
            event.preventDefault();
        });
        input.addEventListener("input", apply);
        input.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && input.value) {
                input.value = "";
                apply();
                event.preventDefault();
            }
        });
        if (clear) {
            clear.addEventListener("click", () => {
                input.value = "";
                apply();
                input.focus();
            });
        }

        apply();
    }

    function initAccessibility() {
        // SelectFilter2 generates a span with aria-label but no role.
        document
            .querySelectorAll(
                ".selector-filter .help-tooltip.search-label-icon[aria-label]",
            )
            .forEach((element) => {
                if (!element.hasAttribute("role")) {
                    element.setAttribute("role", "img");
                }
            });

        // Select2 replaces the labelled <select> with spans. Copy the label
        // onto the generated container and selection elements.
        document
            .querySelectorAll("select.admin-autocomplete")
            .forEach((select) => {
                if (!select.id) {
                    return;
                }
                const labelElement = document.querySelector(
                    `label[for="${CSS.escape(select.id)}"]`,
                );
                const label =
                    labelElement?.textContent.trim() ||
                    select.getAttribute("aria-label") ||
                    select.name ||
                    "Select";
                const container =
                    select.parentElement?.querySelector(".select2-container") ||
                    select.nextElementSibling;
                if (!container) {
                    return;
                }
                const selection = container.querySelector(
                    ".select2-selection",
                );
                if (selection && !selection.getAttribute("aria-label")) {
                    selection.setAttribute("aria-label", label);
                }
                if (!container.getAttribute("aria-label")) {
                    container.setAttribute("aria-label", label);
                }
                const rendered = container.querySelector(
                    ".select2-selection__rendered",
                );
                if (rendered && !rendered.getAttribute("aria-label")) {
                    rendered.setAttribute("aria-label", label);
                }
            });

        // Django renders list-editable widgets without labels. Give each
        // control an accessible name derived from its column and row.
        const table = document.getElementById("result_list");
        if (!table || !table.tHead || !table.tBodies.length) {
            return;
        }
        const headers = Array.from(table.tHead.rows[0]?.cells || []).map(
            (cell) => cell.textContent.trim(),
        );
        Array.from(table.tBodies[0].rows).forEach((row) => {
            const rowName =
                row.querySelector("th a, td a")?.textContent.trim() || "";
            Array.from(row.cells).forEach((cell, index) => {
                cell.querySelectorAll("input, select, textarea").forEach(
                    (control) => {
                        if (
                            control.type === "hidden" ||
                            control.getAttribute("aria-label") ||
                            (control.labels && control.labels.length)
                        ) {
                            return;
                        }
                        const column = headers[index] || "Field";
                        control.setAttribute(
                            "aria-label",
                            rowName ? `${column} for ${rowName}` : column,
                        );
                    },
                );
            });
        });
    }

    function initFilterDisclosure() {
        const toggle = document.getElementById("ba-filters-toggle");
        const changelist = document.getElementById("changelist");
        const panel = document.getElementById("changelist-filter");
        const close = document.getElementById("ba-filters-close");
        if (!toggle || !changelist) {
            return;
        }

        const isCollapsed = () =>
            changelist.classList.contains("ba-filters-collapsed");

        const sync = () => {
            const expanded = DESKTOP.matches
                ? !isCollapsed()
                : changelist.classList.contains("ba-filters-open");
            toggle.setAttribute("aria-expanded", expanded ? "true" : "false");
            if (panel) {
                panel.toggleAttribute(
                    "inert",
                    DESKTOP.matches && isCollapsed(),
                );
            }
        };

        const setCollapsed = (collapsed) => {
            changelist.classList.toggle("ba-filters-collapsed", collapsed);
            if (DESKTOP.matches) {
                localStorage.setItem(
                    FILTERS_KEY,
                    collapsed ? "true" : "false",
                );
            }
            sync();
        };

        // Restore the desktop preference. On mobile the panel is a drawer and
        // the collapsed class has no visual effect.
        if (DESKTOP.matches && localStorage.getItem(FILTERS_KEY) === "true") {
            changelist.classList.add("ba-filters-collapsed");
        }

        toggle.addEventListener("click", () => {
            if (DESKTOP.matches) {
                const collapsed = !isCollapsed();
                setCollapsed(collapsed);
                if (!collapsed) {
                    const target = panel?.querySelector("summary, a, button");
                    window.requestAnimationFrame(() => target?.focus());
                }
                return;
            }

            changelist.classList.toggle("ba-filters-open");
            sync();
            if (changelist.classList.contains("ba-filters-open")) {
                const target =
                    panel?.querySelector(".ba-filters-close, summary, a, button");
                window.requestAnimationFrame(() => target?.focus());
            }
        });

        if (close) {
            close.addEventListener("click", () => {
                setCollapsed(true);
                changelist.classList.remove("ba-filters-open");
                sync();
                toggle.focus();
            });
        }

        if (DESKTOP.addEventListener) {
            DESKTOP.addEventListener("change", () => {
                if (DESKTOP.matches) {
                    changelist.classList.toggle(
                        "ba-filters-collapsed",
                        localStorage.getItem(FILTERS_KEY) === "true",
                    );
                    changelist.classList.remove("ba-filters-open");
                }
                sync();
            });
        }

        sync();
    }

    function initFacetPreference() {
        const panel = document.getElementById("changelist-filter");
        if (!panel) {
            return;
        }

        const links = document.querySelectorAll(
            ".ba-filters-actions .hidelink, .ba-filters-actions .viewlink",
        );
        if (!links.length) {
            return;
        }

        links.forEach((link) => {
            link.addEventListener("click", () => {
                const show = link.classList.contains("viewlink");
                localStorage.setItem(FACETS_KEY, show ? "true" : "false");
            });
        });

        const stored = localStorage.getItem(FACETS_KEY);
        if (stored !== "true" && stored !== "false") {
            return;
        }

        const url = new URL(window.location.href);
        const hasFacets = url.searchParams.has("_facets");
        const showFacets = stored === "true";
        if (hasFacets === showFacets) {
            return;
        }

        if (showFacets) {
            url.searchParams.set("_facets", "1");
        } else {
            url.searchParams.delete("_facets");
        }
        window.location.replace(url.toString());
    }

    function initDirtyGuard() {
        const form =
            document.querySelector(".ba-change-form form") ||
            document.getElementById("changelist-form");
        if (!form) {
            return;
        }

        const isChangelist = form.id === "changelist-form";
        let dirty = false;

        const markDirty = (event) => {
            if (
                isChangelist &&
                (!event.target.closest("#result_list") ||
                    event.target.matches(".action-select, #action-toggle"))
            ) {
                return;
            }
            dirty = true;
        };

        form.addEventListener("input", markDirty);
        form.addEventListener("change", markDirty);
        form.addEventListener("submit", () => {
            dirty = false;
        });
        window.addEventListener("beforeunload", (event) => {
            if (!dirty) {
                return;
            }
            event.preventDefault();
            event.returnValue = "";
        });
    }

    function initErrorFocus() {
        const alert = document.querySelector(".ba-form-alert");
        if (!alert) {
            return;
        }

        document.querySelectorAll("details.ba-collapse").forEach((details) => {
            if (details.querySelector(".errors, .errorlist, .errornote")) {
                details.open = true;
            }
        });

        const errorList = document.querySelector(
            ".ba-change-form .errors, .ba-change-form .errorlist",
        );
        const container = errorList?.closest(
            ".form-row, .ba-field, .ba-inline-card, td",
        );
        const invalid = container?.querySelector(
            "input:not([type=hidden]), select, textarea",
        );

        if (invalid) {
            invalid.focus({ preventScroll: true });
            invalid.scrollIntoView({ block: "center" });
        } else {
            alert.focus();
        }
    }

    function initAll() {
        initAppCollapse();
        initDashboardSearch();
        initFilterDisclosure();
        initFacetPreference();
        initDirtyGuard();
        initErrorFocus();
        initAccessibility();
    }

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            initAll,
            { once: true },
        );
    } else {
        initAll();
    }

    // SelectFilter2 runs from jQuery's ready handler and may create its
    // labelled icon spans just after ours. Re-run once the window is loaded
    // and after each dynamically added inline formset.
    window.addEventListener(
        "load",
        () => {
            initAccessibility();
            // Select2 can finish its DOM replacement a little later.
            window.setTimeout(initAccessibility, 750);
        },
        { once: true },
    );
    document.addEventListener("formset:added", () => {
        window.setTimeout(initAccessibility, 100);
    });
})();
