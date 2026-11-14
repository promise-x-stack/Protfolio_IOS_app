import os
import re
import threading

import mysql.connector


DatabaseError = mysql.connector.Error

MYSQL_HOST = os.getenv("MYSQL_HOST", "127.0.0.1")
MYSQL_PORT = int(os.getenv("MYSQL_PORT", "3306"))
MYSQL_USER = os.getenv("MYSQL_USER", "root")
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "")
MYSQL_DATABASE = os.getenv("MYSQL_DATABASE", "portfolio_db")

_database_initialized = False
_database_initialization_lock = threading.Lock()

PROJECT_COLUMNS = {
    "projectName": "project_name",
    "category": "category",
    "link": "link",
    "logo": "logo",
    "ratings": "ratings",
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


def initialize_database():
    global _database_initialized

    if _database_initialized:
        return

    with _database_initialization_lock:
        if _database_initialized:
            return
        if not re.fullmatch(r"[A-Za-z0-9_]+", MYSQL_DATABASE):
            raise RuntimeError(
                "MYSQL_DATABASE must contain only letters, numbers, and underscores"
            )

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
            cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS messages (
                    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                    message_text TEXT NOT NULL,
                    date_sent VARCHAR(100) NOT NULL,
                    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    INDEX idx_messages_created_at (created_at)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
                """
            )
            cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS emails (
                    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                    sender VARCHAR(320) NOT NULL,
                    subject_line VARCHAR(255) NOT NULL,
                    message_text TEXT NOT NULL,
                    date_sent VARCHAR(100) NOT NULL,
                    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    INDEX idx_emails_created_at (created_at)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
                """
            )
            connection.commit()
            cursor.close()
        finally:
            connection.close()
        _database_initialized = True


def get_connection():
    initialize_database()
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


def list_projects(category=None):
    connection = get_connection()
    try:
        cursor = connection.cursor(dictionary=True)
        if category is None:
            cursor.execute(
                """
                SELECT id, project_name, category, link, logo, ratings
                FROM projects ORDER BY id DESC
                """
            )
        else:
            cursor.execute(
                """
                SELECT id, project_name, category, link, logo, ratings
                FROM projects WHERE LOWER(category) = %s ORDER BY id DESC
                """,
                (category.lower(),),
            )
        result = [_project_from_row(row) for row in cursor.fetchall()]
        cursor.close()
        return result
    finally:
        connection.close()


def get_project(project_id):
    connection = get_connection()
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
        return result
    finally:
        connection.close()


def create_project(project_data):
    connection = get_connection()
    try:
        cursor = connection.cursor()
        cursor.execute(
            """
            INSERT INTO projects (project_name, category, link, logo, ratings)
            VALUES (%s, %s, %s, %s, %s)
            """,
            tuple(project_data[field] for field in PROJECT_COLUMNS),
        )
        project_id = cursor.lastrowid
        connection.commit()
        cursor.close()
        return {"id": project_id, **project_data}
    finally:
        connection.close()


def update_project(project_id, project_data, partial=False):
    connection = get_connection()
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
            return None

        if partial:
            merged_data = {
                field: current_project[column]
                for field, column in PROJECT_COLUMNS.items()
            }
            merged_data.update(project_data)
        else:
            merged_data = project_data

        cursor.execute(
            """
            UPDATE projects
            SET project_name = %s, category = %s, link = %s, logo = %s, ratings = %s
            WHERE id = %s
            """,
            (
                merged_data["projectName"],
                merged_data["category"],
                merged_data["link"],
                merged_data["logo"],
                merged_data["ratings"],
                project_id,
            ),
        )
        connection.commit()
        cursor.close()
        return {"id": project_id, **merged_data}
    finally:
        connection.close()


def delete_project(project_id):
    connection = get_connection()
    try:
        cursor = connection.cursor()
        cursor.execute("DELETE FROM projects WHERE id = %s", (project_id,))
        deleted = cursor.rowcount > 0
        connection.commit()
        cursor.close()
        return deleted
    finally:
        connection.close()


def create_message(body, date_sent):
    connection = get_connection()
    try:
        cursor = connection.cursor()
        cursor.execute(
            "INSERT INTO messages (message_text, date_sent) VALUES (%s, %s)",
            (body, date_sent),
        )
        message_id = cursor.lastrowid
        connection.commit()
        cursor.close()
        return message_id
    finally:
        connection.close()


def list_messages():
    connection = get_connection()
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute(
            """
            SELECT id, message_text, date_sent, created_at
            FROM messages ORDER BY id DESC
            """
        )
        result = [
            {
                "id": row["id"],
                "message": row["message_text"],
                "dateSent": row["date_sent"],
                "createdAt": row["created_at"],
            }
            for row in cursor.fetchall()
        ]
        cursor.close()
        return result
    finally:
        connection.close()


def delete_message(message_id):
    connection = get_connection()
    try:
        cursor = connection.cursor()
        cursor.execute("DELETE FROM messages WHERE id = %s", (message_id,))
        deleted = cursor.rowcount > 0
        connection.commit()
        cursor.close()
        return deleted
    finally:
        connection.close()


def create_email(sender, subject, body, date_sent):
    connection = get_connection()
    try:
        cursor = connection.cursor()
        cursor.execute(
            """
            INSERT INTO emails (sender, subject_line, message_text, date_sent)
            VALUES (%s, %s, %s, %s)
            """,
            (sender, subject, body, date_sent),
        )
        email_id = cursor.lastrowid
        connection.commit()
        cursor.close()
        return email_id
    finally:
        connection.close()


def list_emails():
    connection = get_connection()
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute(
            """
            SELECT id, sender, subject_line, message_text, date_sent, created_at
            FROM emails ORDER BY id DESC
            """
        )
        result = [
            {
                "id": row["id"],
                "sender": row["sender"],
                "subject": row["subject_line"],
                "message": row["message_text"],
                "dateSent": row["date_sent"],
                "createdAt": row["created_at"],
            }
            for row in cursor.fetchall()
        ]
        cursor.close()
        return result
    finally:
        connection.close()


def delete_email(email_id):
    connection = get_connection()
    try:
        cursor = connection.cursor()
        cursor.execute("DELETE FROM emails WHERE id = %s", (email_id,))
        deleted = cursor.rowcount > 0
        connection.commit()
        cursor.close()
        return deleted
    finally:
        connection.close()
