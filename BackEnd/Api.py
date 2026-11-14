import hmac
import json
import os
import re
import threading

import mysql.connector
from flask import Flask, jsonify, render_template, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

MYSQL_HOST = os.getenv("MYSQL_HOST", "127.0.0.1")
MYSQL_PORT = int(os.getenv("MYSQL_PORT", "3306"))
MYSQL_USER = os.getenv("MYSQL_USER", "root")
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "")
MYSQL_DATABASE = os.getenv("MYSQL_DATABASE", "portfolio_db")
PROJECTS_ADMIN_TOKEN = os.getenv("PROJECTS_ADMIN_TOKEN", "")

_database_initialized = False
_database_initialization_lock = threading.Lock()

PROJECT_COLUMNS = {
    "projectName": "project_name",
    "category": "category",
    "link": "link",
    "logo": "logo",
    "ratings": "ratings",
}
REQUIRED_PROJECT_FIELDS = ("projectName", "category", "link")
CATEGORY_NAMES = {
    "entertainment": "entertainment",
    "community": "community",
    "portfolio": "portfolio",
    "productivity": "productivity",
}


def _mysql_connection(include_database=True):
    settings = {
        "host": MYSQL_HOST,
        "port": MYSQL_PORT,
        "user": MYSQL_USER,
        "password": MYSQL_PASSWORD,
        "charset": "utf8mb4",
    }
    if include_database:
        settings["database"] = MYSQL_DATABASE
    return mysql.connector.connect(**settings)


def _initialize_database():
    global _database_initialized

    if _database_initialized:
        return

    with _database_initialization_lock:
        if _database_initialized:
            return
        if not re.fullmatch(r"[A-Za-z0-9_]+", MYSQL_DATABASE):
            raise RuntimeError("MYSQL_DATABASE must contain only letters, numbers, and underscores")

        connection = _mysql_connection(include_database=False)
        try:
            cursor = connection.cursor()
            cursor.execute(
                f"CREATE DATABASE IF NOT EXISTS `{MYSQL_DATABASE}` "
                "CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
            )
            cursor.close()
        finally:
            connection.close()

        connection = _mysql_connection()
        try:
            cursor = connection.cursor()
            cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS projects (
                    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                    project_name VARCHAR(255) NOT NULL,
                    category VARCHAR(100) NOT NULL,
                    link TEXT NOT NULL,
                    logo TEXT NOT NULL,
                    ratings VARCHAR(100) NOT NULL DEFAULT '',
                    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                        ON UPDATE CURRENT_TIMESTAMP,
                    INDEX idx_projects_category (category)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
                """
            )
            connection.commit()
            cursor.close()
        finally:
            connection.close()
        _database_initialized = True


def get_database_connection():
    _initialize_database()
    return _mysql_connection()


def _project_from_row(row):
    if row is None:
        return None
    return {
        "id": row["id"],
        "projectName": row["project_name"],
        "category": row["category"],
        "link": row["link"],
        "logo": row["logo"],
        "ratings": row["ratings"],
    }


def _read_project_payload(payload, partial=False):
    if not isinstance(payload, dict):
        return None, "A JSON object is required"

    unknown_fields = set(payload) - set(PROJECT_COLUMNS)
    if unknown_fields:
        return None, "Unknown project field: " + ", ".join(sorted(unknown_fields))

    if not partial:
        missing_fields = [
            field for field in REQUIRED_PROJECT_FIELDS if field not in payload
        ]
        if missing_fields:
            return None, "Missing required field: " + ", ".join(missing_fields)
        payload = {
            "logo": "",
            "ratings": "",
            **payload,
        }
    elif not payload:
        return None, "At least one project field is required"

    clean_payload = {}
    for field, value in payload.items():
        if not isinstance(value, str):
            return None, f"{field} must be a string"
        value = value.strip()
        if field in REQUIRED_PROJECT_FIELDS and not value:
            return None, f"{field} cannot be empty"
        if field == "projectName" and len(value) > 255:
            return None, "projectName must be 255 characters or fewer"
        if field == "category" and len(value) > 100:
            return None, "category must be 100 characters or fewer"
        if field == "ratings" and len(value) > 100:
            return None, "ratings must be 100 characters or fewer"
        clean_payload[field] = value
    return clean_payload, None


def _admin_authorized():
    if not PROJECTS_ADMIN_TOKEN:
        return False, (
            jsonify({"error": "Project writes are disabled until PROJECTS_ADMIN_TOKEN is configured"}),
            503,
        )
    supplied_token = request.headers.get("Authorization", "")
    if supplied_token.startswith("Bearer "):
        supplied_token = supplied_token[7:]
    else:
        supplied_token = ""
    if not hmac.compare_digest(supplied_token, PROJECTS_ADMIN_TOKEN):
        return False, (jsonify({"error": "A valid admin bearer token is required"}), 401)
    return True, None


def _database_error(error):
    app.logger.error("Project database operation failed: %s", error, exc_info=True)
    return jsonify({"error": "The project database is unavailable"}), 503


@app.route("/", methods=["GET"])
def Home():
    return render_template("Landing_Page.html")


@app.route("/api/products", methods=["GET", "POST"])
def products():
    if request.method == "GET":
        try:
            connection = get_database_connection()
            try:
                cursor = connection.cursor(dictionary=True)
                cursor.execute(
                    """
                    SELECT id, project_name, category, link, logo, ratings
                    FROM projects ORDER BY id DESC
                    """
                )
                result = [_project_from_row(row) for row in cursor.fetchall()]
                cursor.close()
            finally:
                connection.close()
            response = jsonify(result)
            response.headers["Cache-Control"] = "public, max-age=60"
            return response, 200
        except mysql.connector.Error as error:
            return _database_error(error)

    authorized, response = _admin_authorized()
    if not authorized:
        return response
    payload, error = _read_project_payload(request.get_json(silent=True))
    if error:
        return jsonify({"error": error}), 400

    try:
        connection = get_database_connection()
        try:
            cursor = connection.cursor()
            cursor.execute(
                """
                INSERT INTO projects (project_name, category, link, logo, ratings)
                VALUES (%s, %s, %s, %s, %s)
                """,
                tuple(payload[field] for field in PROJECT_COLUMNS),
            )
            project_id = cursor.lastrowid
            connection.commit()
            cursor.close()
        finally:
            connection.close()
        return jsonify({"id": project_id, **payload}), 201
    except mysql.connector.Error as error:
        return _database_error(error)


@app.route("/api/products/<int:project_id>", methods=["GET", "PUT", "PATCH", "DELETE"])
def project(project_id):
    if request.method == "GET":
        try:
            connection = get_database_connection()
            try:
                cursor = connection.cursor(dictionary=True)
                cursor.execute(
                    """
                    SELECT id, project_name, category, link, logo, ratings
                    FROM projects WHERE id = %s
                    """,
                    (project_id,),
                )
                result = _project_from_row(cursor.fetchone())
                cursor.close()
            finally:
                connection.close()
            if result is None:
                return jsonify({"error": "Project not found"}), 404
            response = jsonify(result)
            response.headers["Cache-Control"] = "public, max-age=60"
            return response, 200
        except mysql.connector.Error as error:
            return _database_error(error)

    authorized, response = _admin_authorized()
    if not authorized:
        return response

    if request.method == "DELETE":
        try:
            connection = get_database_connection()
            try:
                cursor = connection.cursor()
                cursor.execute("DELETE FROM projects WHERE id = %s", (project_id,))
                deleted = cursor.rowcount
                connection.commit()
                cursor.close()
            finally:
                connection.close()
            if not deleted:
                return jsonify({"error": "Project not found"}), 404
            return "", 204
        except mysql.connector.Error as error:
            return _database_error(error)

    payload, error = _read_project_payload(
        request.get_json(silent=True), partial=request.method == "PATCH"
    )
    if error:
        return jsonify({"error": error}), 400

    try:
        connection = get_database_connection()
        try:
            cursor = connection.cursor(dictionary=True)
            cursor.execute(
                """
                SELECT id, project_name, category, link, logo, ratings
                FROM projects WHERE id = %s
                """,
                (project_id,),
            )
            current_project = cursor.fetchone()
            if current_project is None:
                cursor.close()
                return jsonify({"error": "Project not found"}), 404

            if request.method == "PUT":
                merged_payload = payload
            else:
                merged_payload = {
                    field: current_project[column]
                    for field, column in PROJECT_COLUMNS.items()
                }
                merged_payload.update(payload)

            cursor.execute(
                """
                UPDATE projects
                SET project_name = %s, category = %s, link = %s, logo = %s, ratings = %s
                WHERE id = %s
                """,
                (
                    merged_payload["projectName"],
                    merged_payload["category"],
                    merged_payload["link"],
                    merged_payload["logo"],
                    merged_payload["ratings"],
                    project_id,
                ),
            )
            connection.commit()
            cursor.close()
        finally:
            connection.close()
        return jsonify({"id": project_id, **merged_payload}), 200
    except mysql.connector.Error as error:
        return _database_error(error)


def _category_products(category):
    try:
        connection = get_database_connection()
        try:
            cursor = connection.cursor(dictionary=True)
            cursor.execute(
                """
                SELECT id, project_name, category, link, logo, ratings
                FROM projects WHERE LOWER(category) = %s ORDER BY id DESC
                """,
                (category,),
            )
            result = [_project_from_row(row) for row in cursor.fetchall()]
            cursor.close()
        finally:
            connection.close()
        response = jsonify(result)
        response.headers["Cache-Control"] = "public, max-age=60"
        return response, 200
    except mysql.connector.Error as error:
        return _database_error(error)


@app.route("/api/products/entertainment", methods=["GET"])
def entertainment_product():
    return _category_products(CATEGORY_NAMES["entertainment"])


@app.route("/api/products/community", methods=["GET"])
def community_product():
    return _category_products(CATEGORY_NAMES["community"])


@app.route("/api/products/portfolio", methods=["GET"])
def portfolio_product():
    return _category_products(CATEGORY_NAMES["portfolio"])


@app.route("/api/products/productivity", methods=["GET"])
def productivity_product():
    return _category_products(CATEGORY_NAMES["productivity"])


@app.route("/message-user-data", methods=["POST"])
def Message():
    data = request.get_json()
    user = data.get("userMassege") if isinstance(data, dict) else None
    if user is None:
        return jsonify({"error": "userMassege is required"}), 400
    try:
        with open(".json/masege.json", "w", encoding="utf-8") as file:
            json.dump(user, file, indent=3)
        return jsonify({"Responce": "Masege Data recived"}), 200
    except OSError as error:
        app.logger.error("Could not save message data: %s", error, exc_info=True)
        return jsonify({"Error": "Could not save message data"}), 500


@app.route("/mail-user-data", methods=["POST"])
def Mails():
    data = request.get_json()
    new_data = data.get("email") if isinstance(data, dict) else None
    if new_data is None:
        return jsonify({"error": "email is required"}), 400
    try:
        with open(".json/email.json", "w", encoding="utf-8") as file:
            json.dump(new_data, file, indent=3)
        return jsonify({"Response": "Email data recived"}), 200
    except OSError as error:
        app.logger.error("Could not save email data: %s", error, exc_info=True)
        return jsonify({"Error": "Could not save email data"}), 500


@app.route("/Gui", methods=["GET"])
def Gui():
    return render_template("Gui.html")


if __name__ == "__main__":
    app.run(debug=os.getenv("FLASK_DEBUG", "false").lower() == "true")
