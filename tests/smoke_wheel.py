"""Smoke test for an installed wheel.

The script configures a minimal Django project, compiles every template shipped
by the package and verifies that the bundled static assets are discoverable.
It is run by the CI package job against a wheel installed in a clean virtual
environment.
"""

from pathlib import Path

import django
from django.conf import settings


def main():
    settings.configure(
        SECRET_KEY="django-bootstrap6-admin-smoke-test",
        INSTALLED_APPS=[
            "django_bootstrap6_admin",
            "django.contrib.admin",
            "django.contrib.auth",
            "django.contrib.contenttypes",
            "django.contrib.sessions",
            "django.contrib.messages",
            "django.contrib.staticfiles",
        ],
        DATABASES={
            "default": {
                "ENGINE": "django.db.backends.sqlite3",
                "NAME": ":memory:",
            }
        },
        TEMPLATES=[
            {
                "BACKEND": "django.template.backends.django.DjangoTemplates",
                "APP_DIRS": True,
                "OPTIONS": {
                    "context_processors": [
                        "django.template.context_processors.request",
                        "django.contrib.auth.context_processors.auth",
                        "django.contrib.messages.context_processors.messages",
                    ],
                },
            }
        ],
        STATIC_URL="static/",
        USE_TZ=True,
        DEFAULT_AUTO_FIELD="django.db.models.BigAutoField",
    )
    django.setup()

    from django.contrib.staticfiles import finders
    from django.template.loader import get_template

    import django_bootstrap6_admin

    package_dir = Path(django_bootstrap6_admin.__file__).parent
    templates_dir = package_dir / "templates"
    templates = sorted(templates_dir.rglob("*.html"))
    if not templates:
        raise SystemExit("no templates found in the installed package")

    for path in templates:
        template_name = path.relative_to(templates_dir).as_posix()
        get_template(template_name)

    base_template = get_template("admin/base.html")
    if "django_bootstrap6_admin" not in Path(base_template.origin.name).parts:
        raise SystemExit("admin/base.html did not resolve to the installed package")

    for asset in (
        "django_bootstrap6_admin/css/admin.css",
        "django_bootstrap6_admin/css/widgets-overrides.css",
        "django_bootstrap6_admin/js/admin.js",
        "django_bootstrap6_admin/js/theme.js",
        "django_bootstrap6_admin/vendor/bootstrap/css/bootstrap.min.css",
        "django_bootstrap6_admin/vendor/bootstrap/js/bootstrap.bundle.min.js",
    ):
        if not finders.find(asset):
            raise SystemExit(f"missing static asset: {asset}")

    print(f"wheel smoke test OK: {len(templates)} templates compiled, static assets discoverable")


if __name__ == "__main__":
    main()
