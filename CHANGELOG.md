# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.2] - 2026-11-15

### Fixed

- Clicking the theme toggle in a dark system no longer moves to an `auto`
  state that resolves to dark and leaves the page unchanged. The toggle skips
  that no-op step, so a single click always changes the visible theme.

## [0.1.1] - 2026-11-15

### Added

- Soft fade-in/fade-out transition when switching between light, dark and auto
  themes. The animation is skipped when `prefers-reduced-motion: reduce` is
  set.

## [0.1.0] - 2026-11-15

### Added

- Initial release of the Bootstrap 6 skin for the Django admin.
- Bootstrap 6 based dashboard, changelist, change form, login, logout and
  password change pages.
- Collapsible desktop sidebar, mobile drawer navigation and keyboard support.
- Light, dark and system themes synchronised with Django's `theme`
  localStorage preference.
- Bundled Bootstrap 6.0.0-alpha.1 assets and licence.
- Support for Django 6.1 on Python 3.12, 3.13 and 3.14.
- Test suite with a demo Django app and GitHub Actions CI.
