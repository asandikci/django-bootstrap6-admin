from django.test import SimpleTestCase

from django_bootstrap6_admin.templatetags.bootstrap6_admin import (
    message_icon,
    message_theme,
)


class MessageFilterTests(SimpleTestCase):
    def test_message_theme(self):
        cases = {
            "debug": "secondary",
            "info": "info",
            "success": "success",
            "warning": "warning",
            "error": "danger",
            "warning extra": "warning",
            "": "info",
            None: "info",
        }
        for tags, expected in cases.items():
            with self.subTest(tags=tags):
                self.assertEqual(message_theme(tags), expected)

    def test_message_icon(self):
        cases = {
            "debug": "ba-info",
            "info": "ba-info",
            "success": "ba-check",
            "warning": "ba-alert",
            "error": "ba-alert",
            "": "ba-info",
            None: "ba-info",
        }
        for tags, expected in cases.items():
            with self.subTest(tags=tags):
                self.assertEqual(message_icon(tags), expected)
