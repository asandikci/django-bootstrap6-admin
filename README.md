# django-bootstrap6-admin

[![CI](https://github.com/asandikci/django-bootstrap6-admin/actions/workflows/ci.yml/badge.svg)](https://github.com/asandikci/django-bootstrap6-admin/actions/workflows/ci.yml)
[![PyPI](https://img.shields.io/pypi/v/django-bootstrap6-admin.svg)](https://pypi.org/project/django-bootstrap6-admin/)
[![Python](https://img.shields.io/pypi/pyversions/django-bootstrap6-admin.svg)](https://pypi.org/project/django-bootstrap6-admin/)
[![Django](https://img.shields.io/badge/django-6.1-0C4B33.svg)](https://www.djangoproject.com/)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

A modern, responsive Bootstrap 6 skin for the Django admin. It replaces the
default admin templates and static assets without monkey-patching Django,
changing admin classes, adding database queries, or requiring migrations.

The package is a thin presentation layer: Django's admin views, forms,
permissions and JavaScript remain in charge.

## Features

- Bootstrap 6 markup and design tokens throughout the admin.
- "View site" is always available in the top bar, not buried in the user menu.
- Sticky top bar and body-level breadcrumbs on every page. The left navigation
  sidebar and hamburger drawer are intentionally removed.
- Dashboard with a global application/model filter, collapsible category cards,
  application cards in a vertical list and recent actions in the adjacent
  right-hand column.
- Category collapse state is remembered between pages.
- Recent actions shows up to 10 entries and stretches to the dashboard height.
- Subtle alternating row colours in dashboard category lists, changelist,
  inline and history tables.
- Changelist with search, date hierarchy, collapsible filters, sortable
  headers, bulk actions and Bootstrap pagination. The desktop filter panel can
  be collapsed, and both its state and the "Show counts" choice are remembered
  between pages.
- Subtle vertical rules separate columns in changelists, inline tables and the
  object history.
- Change form with card-based fieldsets, collapsible sections, a clear save
  bar, tabular/stacked inlines and related-object popups.
- Theme-aware date and time fields with compact Today/Now actions, calendar
  and clock dialogs, and proper dark-mode contrast.
- Modern login, logout and password change pages.
- Light, dark and system themes. The existing Django `theme` localStorage
  preference is synchronised with Bootstrap's `data-bs-theme` attribute.
- Dark-theme secondary text, table headers, filter links and help text use
  higher-contrast tokens for better readability.
- Soft fade-in/fade-out transition when switching themes, skipped
  automatically for users who prefer reduced motion.
- Every click changes the visible theme: if `auto` would resolve to the theme
  already on screen, the toggle skips that step instead of appearing to do
  nothing.
- Accessible focus states, labels, table headers and ARIA attributes.
- All Django admin JavaScript hooks are preserved: `actions.js`,
  `filters.js`, inlines, Select2/autocomplete, calendar widgets and
  related-object lookups.
- CSP-aware: bundled scripts and styles use Django 6.1's
  `{% csp_nonce_attr %}` tag, so nonce-based policies work out of the box.
- Generic by design: no models, no migrations, no project-specific imports and
  no assumptions about the host project's branding. The default warm
  near-black/yellow palette is only a set of overridable CSS variables.

## Requirements

| Component | Supported versions |
| --- | --- |
| Python | 3.12, 3.13, 3.14 |
| Django | 6.1.x |
| Bootstrap | 6.0.0-alpha.1 (bundled) |

Django 6.1 is required because the templates use the
`{% csp_nonce_attr %}` template tag and the change-form admin actions added in
that release. Django 5.2 LTS and 6.0 are not supported by this version.

## Installation

```bash
pip install django-bootstrap6-admin
```

Add the app **before** `django.contrib.admin` so its `admin/` templates take
precedence:

```python
INSTALLED_APPS = [
    "django_bootstrap6_admin",
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # ...
]
```

That's it. There are no settings to add, no migrations and no URL changes.

For a local checkout:

```bash
git clone https://github.com/asandikci/django-bootstrap6-admin.git
cd django-bootstrap6-admin
python -m pip install -e .
```

## What gets overridden

The app provides templates for the standard Django admin pages, including:

- `admin/base.html`, `base_site.html`, `index.html`, `app_index.html`
- `admin/change_list.html`, `change_form.html`, `delete_confirmation.html`
- `admin/edit_inline/stacked.html`, `edit_inline/tabular.html`
- `admin/login.html`, `admin/object_history.html`
- `admin/auth/user/add_form.html`, `admin/auth/user/change_password.html`
- `registration/logged_out.html`, `registration/password_change_form.html`
  and `registration/password_change_done.html`

Only the three auth templates used directly by the admin site are shipped.
They still live in Django's global `registration/` namespace, so they also
apply to those views if a project uses them outside the admin; override them
if you need separate public-site auth screens. Password reset templates are
intentionally left to the host project, because reset URLs and their branding
usually belong to the public site rather than to the admin package.

The theme intentionally omits Django's left navigation sidebar and its
hamburger toggle. Use the body-level breadcrumbs, the dashboard search and the
application cards for navigation.

## Customisation

### Long change forms

The action bar sits at the end of the form by default. For long forms, enable
Django's standard top action bar on a `ModelAdmin`:

```python
class BookAdmin(admin.ModelAdmin):
    save_on_top = True
```

### Branding

Use Django's existing admin site settings:

```python
from django.contrib import admin

admin.site.site_header = "Acme administration"
admin.site.site_title = "Acme"
admin.site.index_title = "Operations"
```

### Templates

Every block from Django's admin base templates is preserved. Override any
template normally, for example `templates/admin/base_site.html`, or extend the
provided template:

```django
{% extends "admin/base_site.html" %}

{% block branding %}
  {{ block.super }}
  <span class="badge badge-subtle theme-info">Internal</span>
{% endblock %}
```

### Colours

The skin uses Bootstrap 6 design tokens (`--bs-*`) and a small set of
`--ba-*` variables. Override them after the admin stylesheet, for example in a
custom admin CSS file:

```css
:root {
    --ba-topbar-bg: #231f20;
    --ba-gold: #ffcb08;
    --ba-canvas: #f6f6f4;
    --ba-icon-rail: 3.2rem;
}
```

The default primary is the warm yellow accent with dark text, and the danger
colour remains a deep red for readable white labels.

The select controls use small `data:` SVG arrows. If you enable a strict CSP,
allow `img-src 'self' data:` (or replace the arrows in your own CSS).

### Turning it off

Remove `django_bootstrap6_admin` from `INSTALLED_APPS` (or move it after
`django.contrib.admin`) and the default Django admin returns immediately.
There is no runtime state to clean up.

## How it works

- The app only contributes templates and static files.
- Django's admin views and forms are untouched.
- Django's own JavaScript remains the source of truth for filters, bulk
  actions, inlines and form widgets.
- The left navigation sidebar is not rendered; the top bar and body
  breadcrumbs provide the navigation context.
- The bundled `theme.js` reads and writes Django's `theme` localStorage key and
  mirrors it to `data-bs-theme`; it does not replace Django's admin behaviour.
- Bootstrap 6 is pinned as `6.0.0-alpha.1` in
  `static/django_bootstrap6_admin/vendor/bootstrap/` to keep the visual result
  stable. Its MIT licence is included next to the assets. SHA-256 of the
  bundled files:
  - `bootstrap.min.css`:
    `678508b198d9b1b8877e338f419fdada00024be2bcc638a539dd724856095112`
  - `bootstrap.bundle.min.js`:
    `47ea447f46e288dd9d3e83147b7ba539c6df5192c047b8f91739cd56a5721148`

### Language

Django's admin is translated using the active language; it is not fixed to
English. With `LANGUAGE_CODE = "tr"`, Django's own admin labels are Turkish,
and this theme follows the same project language. The package's source strings
are English and are translated when a matching locale is installed. To keep
the admin in English while the public site uses another language, activate
English for `/admin/` in your project (for example with a small middleware),
or set `LANGUAGE_CODE = "en-us"` if the whole site should be English.

## Development

The test suite uses an isolated settings module and a small demo app. Create a
virtual environment and install the package in editable mode:

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -e ".[dev]"
```

Run the tests and the linter:

```bash
python -m django test --settings=tests.settings
node tests/js/theme_toggle.test.js
ruff check .
ruff format --check .
```

Build and validate the distribution:

```bash
python -m build
python -m twine check --strict dist/*
```

The same checks run in GitHub Actions on Python 3.12, 3.13 and 3.14.

## Releasing

Releases are published from a `v*` tag with PyPI Trusted Publishing. See
[CONTRIBUTING.md](CONTRIBUTING.md) for the complete release checklist and the
one-time PyPI publisher setup.

## Licence

MIT. The admin templates are derived from Django's BSD-licensed admin
templates, and Bootstrap is distributed under the MIT licence. See
[NOTICE](NOTICE) and
`static/django_bootstrap6_admin/vendor/bootstrap/LICENSE` for the full
attribution and licence texts.
