from pathlib import Path

from django.contrib.staticfiles import finders
from django.template.loader import get_template
from django.test import SimpleTestCase

import django_bootstrap6_admin

STATIC_ASSETS = (
    "django_bootstrap6_admin/css/admin.css",
    "django_bootstrap6_admin/css/widgets-overrides.css",
    "django_bootstrap6_admin/js/admin.js",
    "django_bootstrap6_admin/js/theme.js",
    "django_bootstrap6_admin/vendor/bootstrap/css/bootstrap.min.css",
    "django_bootstrap6_admin/vendor/bootstrap/js/bootstrap.bundle.min.js",
    "django_bootstrap6_admin/vendor/bootstrap/LICENSE",
)


class PackageAssetsTests(SimpleTestCase):
    def test_all_templates_compile(self):
        templates_dir = Path(django_bootstrap6_admin.__file__).parent / "templates"
        templates = sorted(templates_dir.rglob("*.html"))

        self.assertTrue(templates)
        for path in templates:
            with self.subTest(template=path.name):
                get_template(path.relative_to(templates_dir).as_posix())

    def test_static_assets_are_discoverable(self):
        for asset in STATIC_ASSETS:
            with self.subTest(asset=asset):
                self.assertIsNotNone(finders.find(asset))

    def test_theme_transition_assets(self):
        static_dir = Path(django_bootstrap6_admin.__file__).parent / "static"
        theme_js = (static_dir / "django_bootstrap6_admin" / "js" / "theme.js").read_text(
            encoding="utf-8"
        )
        admin_css = (static_dir / "django_bootstrap6_admin" / "css" / "admin.css").read_text(
            encoding="utf-8"
        )

        self.assertIn("ba-theme-fade", theme_js)
        self.assertIn("prefers-reduced-motion", theme_js)
        self.assertIn(".ba-theme-fade", admin_css)
        self.assertIn(".ba-theme-fade.is-active", admin_css)
        self.assertIn("transition: opacity 200ms ease", admin_css)

    def test_changelist_ux_assets(self):
        static_dir = Path(django_bootstrap6_admin.__file__).parent / "static"
        admin_js = (static_dir / "django_bootstrap6_admin" / "js" / "admin.js").read_text(
            encoding="utf-8"
        )
        admin_css = (static_dir / "django_bootstrap6_admin" / "css" / "admin.css").read_text(
            encoding="utf-8"
        )

        self.assertIn("django.admin.showFacets", admin_js)
        self.assertIn("django.admin.filtersCollapsed", admin_js)
        self.assertIn("ba-filters-collapsed", admin_css)
        self.assertIn("border-inline-end: 1px solid var(--bs-border-muted)", admin_css)
        self.assertIn("appearance: none", admin_css)
        self.assertIn("--bs-fg-4: #9fb1c4", admin_css)
