import unittest
from unittest.mock import patch

import Api


class ProjectApiTests(unittest.TestCase):
    def setUp(self):
        Api.app.config["TESTING"] = True
        self.client = Api.app.test_client()

    def test_project_writes_require_admin_token(self):
        payload = {
            "projectName": "Portfolio",
            "category": "portfolio",
            "link": "https://example.com",
        }
        with patch.object(Api, "PROJECTS_ADMIN_TOKEN", ""):
            response = self.client.post("/api/products", json=payload)
        self.assertEqual(response.status_code, 503)

        with patch.object(Api, "PROJECTS_ADMIN_TOKEN", "test-token"):
            response = self.client.post("/api/products", json=payload)
        self.assertEqual(response.status_code, 401)

    def test_create_and_list_projects(self):
        project = {
            "id": 7,
            "projectName": "Portfolio",
            "category": "portfolio",
            "link": "https://example.com",
            "logo": "",
            "ratings": "",
        }
        with (
            patch.object(Api, "PROJECTS_ADMIN_TOKEN", "test-token"),
            patch.object(Api.database, "create_project", return_value=project),
            patch.object(Api.database, "list_projects", return_value=[project]),
        ):
            created = self.client.post(
                "/api/products",
                json={
                    "projectName": "Portfolio",
                    "category": "portfolio",
                    "link": "https://example.com",
                },
                headers={"Authorization": "Bearer test-token"},
            )
            listed = self.client.get("/api/products")

        self.assertEqual(created.status_code, 201)
        self.assertEqual(created.get_json()["id"], 7)
        self.assertEqual(listed.status_code, 200)
        self.assertEqual(listed.get_json()[0]["projectName"], "Portfolio")
        self.assertEqual(listed.headers["Cache-Control"], "public, max-age=60")

    def test_update_and_delete_project(self):
        updated_project = {
            "id": 7,
            "projectName": "Replaced portfolio",
            "category": "portfolio",
            "link": "https://example.com",
            "logo": "",
            "ratings": "",
        }
        with (
            patch.object(Api, "PROJECTS_ADMIN_TOKEN", "test-token"),
            patch.object(
                Api.database,
                "update_project",
                side_effect=[
                    updated_project,
                    {**updated_project, "projectName": "Updated portfolio"},
                ],
            ),
            patch.object(Api.database, "delete_project", return_value=True),
        ):
            updated = self.client.put(
                "/api/products/7",
                json={
                    "projectName": "Replaced portfolio",
                    "category": "portfolio",
                    "link": "https://example.com",
                },
                headers={"Authorization": "Bearer test-token"},
            )
            patched = self.client.patch(
                "/api/products/7",
                json={"projectName": "Updated portfolio"},
                headers={"Authorization": "Bearer test-token"},
            )
            deleted = self.client.delete(
                "/api/products/7",
                headers={"Authorization": "Bearer test-token"},
            )

        self.assertEqual(updated.status_code, 200)
        self.assertEqual(updated.get_json()["projectName"], "Replaced portfolio")
        self.assertEqual(patched.status_code, 200)
        self.assertEqual(patched.get_json()["projectName"], "Updated portfolio")
        self.assertEqual(deleted.status_code, 204)

    def test_invalid_project_payload_is_rejected(self):
        with patch.object(Api, "PROJECTS_ADMIN_TOKEN", "test-token"):
            response = self.client.post(
                "/api/products",
                json={"projectName": "Missing required fields"},
                headers={"Authorization": "Bearer test-token"},
            )
        self.assertEqual(response.status_code, 400)
        self.assertIn("category", response.get_json()["error"])

    def test_database_errors_return_service_unavailable(self):
        with patch.object(
            Api.database,
            "list_projects",
            side_effect=Api.database.DatabaseError("database is offline"),
        ):
            response = self.client.get("/api/products")
        self.assertEqual(response.status_code, 503)
        self.assertEqual(
            response.get_json()["error"], "The project database is unavailable"
        )

    def test_gui_renders_without_message_file(self):
        response = self.client.get("/Gui")
        self.assertEqual(response.status_code, 200)
        self.assertIn(b"Manage the projects displayed", response.data)
        self.assertIn(b"projectId", response.data)

    def test_user_message_and_email_are_stored(self):
        with (
            patch.object(Api.database, "create_message", return_value=12) as message,
            patch.object(Api.database, "create_email", return_value=13) as email,
        ):
            message_response = self.client.post(
                "/message-user-data",
                json={
                    "userMassege": {
                        "massege": "Hello from the portfolio",
                        "dateSent": "11/15/2026",
                    }
                },
            )
            email_response = self.client.post(
                "/mail-user-data",
                json={
                    "email": {
                        "Sender": "visitor@example.com",
                        "Subject": "Project inquiry",
                        "Message": "Please contact me.",
                        "DateSent": "11/15/2026",
                    }
                },
            )

        self.assertEqual(message_response.status_code, 201)
        self.assertEqual(email_response.status_code, 201)
        message.assert_called_once_with("Hello from the portfolio", "11/15/2026")
        email.assert_called_once_with(
            "visitor@example.com",
            "Project inquiry",
            "Please contact me.",
            "11/15/2026",
        )

    def test_messages_and_emails_are_private_and_deletable(self):
        message_row = {
            "id": 3,
            "message_text": "Hello",
            "date_sent": "11/15/2026",
            "created_at": "2026-11-15T00:00:00",
        }
        email_row = {
            "id": 4,
            "sender": "visitor@example.com",
            "subject_line": "Question",
            "message_text": "Hello there",
            "date_sent": "11/15/2026",
            "created_at": "2026-11-15T00:00:00",
        }
        with (
            patch.object(Api, "PROJECTS_ADMIN_TOKEN", "test-token"),
            patch.object(
                Api.database,
                "list_messages",
                return_value=[
                    {
                        "id": message_row["id"],
                        "message": message_row["message_text"],
                        "dateSent": message_row["date_sent"],
                        "createdAt": message_row["created_at"],
                    }
                ],
            ),
            patch.object(
                Api.database,
                "list_emails",
                return_value=[
                    {
                        "id": email_row["id"],
                        "sender": email_row["sender"],
                        "subject": email_row["subject_line"],
                        "message": email_row["message_text"],
                        "dateSent": email_row["date_sent"],
                        "createdAt": email_row["created_at"],
                    }
                ],
            ),
            patch.object(Api.database, "delete_message", return_value=True),
            patch.object(Api.database, "delete_email", return_value=True),
        ):
            unauthorized = self.client.get("/api/messages")
            messages = self.client.get(
                "/api/messages",
                headers={"Authorization": "Bearer test-token"},
            )
            emails = self.client.get(
                "/api/emails",
                headers={"Authorization": "Bearer test-token"},
            )
            deleted_message = self.client.delete(
                "/api/messages/3",
                headers={"Authorization": "Bearer test-token"},
            )
            deleted_email = self.client.delete(
                "/api/emails/4",
                headers={"Authorization": "Bearer test-token"},
            )

        self.assertEqual(unauthorized.status_code, 401)
        self.assertEqual(messages.get_json()[0]["message"], "Hello")
        self.assertEqual(emails.get_json()[0]["sender"], "visitor@example.com")
        self.assertEqual(deleted_message.status_code, 204)
        self.assertEqual(deleted_email.status_code, 204)

    def test_invalid_contact_payloads_are_rejected(self):
        missing_message = self.client.post(
            "/message-user-data", json={"userMassege": {"massege": "  "}}
        )
        missing_email = self.client.post(
            "/mail-user-data", json={"email": {"Sender": "visitor@example.com"}}
        )
        self.assertEqual(missing_message.status_code, 400)
        self.assertEqual(missing_email.status_code, 400)


if __name__ == "__main__":
    unittest.main()
