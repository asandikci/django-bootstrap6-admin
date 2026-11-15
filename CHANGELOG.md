# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.2] - 2026-11-15

### Changed

- Dashboard application categories are now stacked vertically in a single
  column, like Django's original dashboard, instead of forming a left/right
  grid. Recent actions sit below the categories and share their left edge.

### Removed

- The duplicate "View site" button on the dashboard heading. The top-bar link
  remains available on every admin page.

## [0.2.1] - 2026-11-15

### Added

- The "View site" link is now always visible in the admin top bar instead of
  being hidden in the user menu.

### Changed

- Refreshed the palette and surface treatment to match the warm near-black and
  yellow visual language of the Pardus Teknofest project.
- Updated the login screen brand mark and browser theme colour to the new
  palette.
- Documented that the admin follows Django's active language instead of being
  hard-coded to English.

## [0.2.0] - 2026-11-15

### Added

- The desktop filter panel can now be collapsed and expanded, and the
  collapsed state is remembered between changelist pages.
- The "Show counts" / "Hide counts" choice is remembered across changelist
  pages instead of resetting on navigation.
- Subtle vertical rules separate columns in changelists, inline tables and the
  object history table.

### Fixed

- Removed the duplicate native dropdown arrow on the bulk-action select.
- Improved dark-theme text contrast for secondary labels, table headers,
  filter links, help text and links.

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
