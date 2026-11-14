import unittest
from unittest.mock import MagicMock, patch

import Api


class ProjectApiTests(unittest.TestCase):
    def setUp(self):
        Api.app.config["TESTING"] = True
        self.client = Api.app.test_client()
        self.connection = MagicMock()
        self.cursor = MagicMock()
        self.connection.cursor.return_value = self.cursor

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
        self.cursor.lastrowid = 7
        row = {
            "id": 7,
            "project_name": "Portfolio",
            "category": "portfolio",
            "link": "https://example.com",
            "logo": "",
            "ratings": "",
        }
        self.cursor.fetchall.return_value = [row]
        with (
            patch.object(Api, "PROJECTS_ADMIN_TOKEN", "test-token"),
            patch.object(Api, "get_database_connection", return_value=self.connection),
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
        row = {
            "id": 7,
            "project_name": "Portfolio",
            "category": "portfolio",
            "link": "https://example.com",
            "logo": "",
            "ratings": "",
        }
        self.cursor.fetchone.side_effect = [row, row]
        self.cursor.rowcount = 1
        with (
            patch.object(Api, "PROJECTS_ADMIN_TOKEN", "test-token"),
            patch.object(Api, "get_database_connection", return_value=self.connection),
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
            Api,
            "get_database_connection",
            side_effect=Api.mysql.connector.Error("database is offline"),
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


if __name__ == "__main__":
    unittest.main()
