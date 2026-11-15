"""Verify that the git tag matches the package version."""

import ast
import os
from pathlib import Path

INIT_FILE = Path("src/django_bootstrap6_admin/__init__.py")


def read_version() -> str:
    tree = ast.parse(INIT_FILE.read_text(encoding="utf-8"))
    for node in tree.body:
        if not isinstance(node, ast.Assign):
            continue
        if any(
            isinstance(target, ast.Name) and target.id == "__version__" for target in node.targets
        ):
            return ast.literal_eval(node.value)
    raise SystemExit(f"__version__ not found in {INIT_FILE}")


def main() -> None:
    version = read_version()
    tag = os.environ.get("GITHUB_REF_NAME", "").removeprefix("v")
    if not tag:
        raise SystemExit("GITHUB_REF_NAME is not set")
    if tag != version:
        raise SystemExit(f"tag {tag!r} does not match __version__ {version!r}")
    print(f"tag {tag} matches __version__")


if __name__ == "__main__":
    main()
