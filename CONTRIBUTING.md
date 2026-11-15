# Contributing

Thanks for taking the time to improve `django-bootstrap6-admin`.

## Development setup

```bash
git clone https://github.com/asandikci/django-bootstrap6-admin.git
cd django-bootstrap6-admin
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -e ".[dev]"
```

The test suite uses `tests/settings.py` and a small demo app in
`tests/testapp/`:

```bash
python -m django test --settings=tests.settings
```

Run the linter and formatter check before opening a pull request:

```bash
python -m django test --settings=tests.settings
node tests/js/theme_toggle.test.js
ruff check .
ruff format --check .
```

## Manual checks

The package only ships templates and static files, so visual changes should be
checked in a browser as well as in the test suite. A quick way to start a demo
server is to add a `urls.py` to the test settings and run:

```bash
python -m django runserver --settings=tests.settings
```

The demo app is registered at `/admin/` by `tests/urls.py`. Create the
database and a superuser first:

```bash
python -m django migrate --settings=tests.settings
python -m django createsuperuser --settings=tests.settings
python -m django runserver --settings=tests.settings
```

## Packaging

Build and validate the distributions locally:

```bash
python -m build
python -m twine check --strict dist/*
```

The wheel must contain the admin templates, the bundled Bootstrap assets and
the licence files. The CI package job installs the wheel into a clean virtual
environment and compiles every bundled template as a smoke test.

## Release checklist

1. Update `__version__` in `src/django_bootstrap6_admin/__init__.py`.
2. Move the `Unreleased` entries in `CHANGELOG.md` into a new version section
   with today's date.
3. Run the tests, lint and build checks locally.
4. Commit the release changes and push them to `main`.
5. Create and push an annotated tag:

   ```bash
   git tag -a v0.2.2 -m "django-bootstrap6-admin 0.2.2"
   git push origin v0.2.2
   ```

6. The `Release` workflow builds the distributions, verifies that the tag
   matches `__version__`, and publishes to PyPI.

### One-time PyPI Trusted Publishing setup

The workflow uses OpenID Connect, so no PyPI token is stored in GitHub.

1. Sign in to PyPI and open **Publishing** for the project.
2. Add a pending publisher with:
   - **Owner:** `asandikci`
   - **Repository:** `django-bootstrap6-admin`
   - **Workflow:** `release.yml`
   - **Environment:** `pypi`
3. In the GitHub repository, create an environment named `pypi` under
   **Settings → Environments**. Add required reviewers or a deployment branch
   rule if you want a manual approval before publishing.

If Trusted Publishing is not available yet, create a PyPI API token and add it
as the `PYPI_API_TOKEN` repository secret, then change the publish step to use
`password: ${{ secrets.PYPI_API_TOKEN }}`. Do not commit tokens to the
repository.

## Licence

By contributing, you agree that your contributions are licensed under the MIT
licence used by this project. The admin templates are derived from Django's
BSD-licensed templates; keep the attribution in `NOTICE` intact.
