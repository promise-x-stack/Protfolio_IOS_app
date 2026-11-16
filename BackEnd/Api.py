import hmac
import os
from datetime import datetime, timezone

from flask import Flask, jsonify, render_template, request
from flask_cors import CORS

from Modules import database

app = Flask(__name__)
CORS(app)

PROJECTS_ADMIN_TOKEN = os.getenv("PROJECTS_ADMIN_TOKEN", "")
REQUIRED_PROJECT_FIELDS = ("projectName", "category", "link")
CATEGORY_NAMES = {
    "entertainment": "entertainment",
    "community": "community",
    "portfolio": "portfolio",
    "productivity": "productivity",
}


def _read_project_payload(payload, partial=False):
    if not isinstance(payload, dict):
        return None, "A JSON object is required"

    unknown_fields = set(payload) - set(database.PROJECT_COLUMNS)
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
    app.logger.error("Database operation failed: %s", error, exc_info=True)
    return jsonify({"error": "The project database is unavailable"}), 503


@app.route("/", methods=["GET"])
def Home():
    return render_template("Landing_Page.html")


@app.route("/api/products", methods=["GET", "POST"])
def products():
    if request.method == "GET":
        try:
            response = jsonify(database.list_projects())
            response.headers["Cache-Control"] = "public, max-age=60"
            return response, 200
        except database.DatabaseError as error:
            return _database_error(error)

    authorized, response = _admin_authorized()
    if not authorized:
        return response
    payload, error = _read_project_payload(request.get_json(silent=True))
    if error:
        return jsonify({"error": error}), 400

    try:
        return jsonify(database.create_project(payload)), 201
    except database.DatabaseError as error:
        return _database_error(error)


@app.route("/api/products/<int:project_id>", methods=["GET", "PUT", "PATCH", "DELETE"])
def project(project_id):
    if request.method == "GET":
        try:
            result = database.get_project(project_id)
            if result is None:
                return jsonify({"error": "Project not found"}), 404
            response = jsonify(result)
            response.headers["Cache-Control"] = "public, max-age=60"
            return response, 200
        except database.DatabaseError as error:
            return _database_error(error)

    authorized, response = _admin_authorized()
    if not authorized:
        return response

    if request.method == "DELETE":
        try:
            if not database.delete_project(project_id):
                return jsonify({"error": "Project not found"}), 404
            return "", 204
        except database.DatabaseError as error:
            return _database_error(error)

    payload, error = _read_project_payload(
        request.get_json(silent=True), partial=request.method == "PATCH"
    )
    if error:
        return jsonify({"error": error}), 400

    try:
        result = database.update_project(
            project_id,
            payload,
            partial=request.method == "PATCH",
        )
        if result is None:
            return jsonify({"error": "Project not found"}), 404
        return jsonify(result), 200
    except database.DatabaseError as error:
        return _database_error(error)


def _category_products(category):
    try:
        response = jsonify(database.list_projects(category))
        response.headers["Cache-Control"] = "public, max-age=60"
        return response, 200
    except database.DatabaseError as error:
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
    data = request.get_json(silent=True)
    user_message = data.get("userMassege") if isinstance(data, dict) else None
    if isinstance(user_message, str):
        body = user_message.strip()
        date_sent = datetime.now(timezone.utc).isoformat()
    elif isinstance(user_message, dict):
        body = user_message.get("massege", user_message.get("message"))
        date_sent = user_message.get("dateSent", datetime.now(timezone.utc).isoformat())
    else:
        return jsonify({"error": "userMassege must be a message string or object"}), 400
    if not isinstance(body, str) or not body.strip():
        return jsonify({"error": "A non-empty message is required"}), 400
    if not isinstance(date_sent, str) or len(date_sent) > 100:
        return jsonify({"error": "dateSent must be 100 characters or fewer"}), 400
    body = body.strip()
    if len(body) > 10000:
        return jsonify({"error": "Message must be 10000 characters or fewer"}), 400

    try:
        message_id = database.create_message(body, date_sent)
        return jsonify({"id": message_id, "response": "Message received"}), 201
    except database.DatabaseError as error:
        return _database_error(error)


@app.route("/mail-user-data", methods=["POST"])
def Mails():
    data = request.get_json(silent=True)
    email_data = data.get("email") if isinstance(data, dict) else None
    if not isinstance(email_data, dict):
        return jsonify({"error": "email must be an object"}), 400

    sender = email_data.get("Sender", email_data.get("sender"))
    subject = email_data.get("Subject", email_data.get("subject"))
    body = email_data.get("Message", email_data.get("message"))
    date_sent = email_data.get(
        "DateSent",
        email_data.get("dateSent", datetime.now(timezone.utc).isoformat()),
    )
    fields = {
        "Sender": (sender, 320),
        "Subject": (subject, 255),
        "Message": (body, 20000),
        "DateSent": (date_sent, 100),
    }
    for field, (value, limit) in fields.items():
        if not isinstance(value, str) or not value.strip():
            return jsonify({"error": f"{field} is required"}), 400
        if len(value.strip()) > limit:
            return jsonify({"error": f"{field} must be {limit} characters or fewer"}), 400

    try:
        email_id = database.create_email(
            sender.strip(),
            subject.strip(),
            body.strip(),
            date_sent.strip(),
        )
        return jsonify({"id": email_id, "response": "Email received"}), 201
    except database.DatabaseError as error:
        return _database_error(error)


@app.route("/api/messages", methods=["GET"])
def list_messages():
    authorized, response = _admin_authorized()
    if not authorized:
        return response
    try:
        return jsonify(database.list_messages()), 200
    except database.DatabaseError as error:
        return _database_error(error)


@app.route("/api/messages/<int:message_id>", methods=["DELETE"])
def delete_message(message_id):
    authorized, response = _admin_authorized()
    if not authorized:
        return response
    try:
        if not database.delete_message(message_id):
            return jsonify({"error": "Message not found"}), 404
        return "", 204
    except database.DatabaseError as error:
        return _database_error(error)


@app.route("/api/emails", methods=["GET"])
def list_emails():
    authorized, response = _admin_authorized()
    if not authorized:
        return response
    try:
        return jsonify(database.list_emails()), 200
    except database.DatabaseError as error:
        return _database_error(error)


@app.route("/api/emails/<int:email_id>", methods=["DELETE"])
def delete_email(email_id):
    authorized, response = _admin_authorized()
    if not authorized:
        return response
    try:
        if not database.delete_email(email_id):
            return jsonify({"error": "Email not found"}), 404
        return "", 204
    except database.DatabaseError as error:
        return _database_error(error)


@app.route("/Gui", methods=["GET"])
def Gui():
    return render_template("Gui.html")


if __name__ == "__main__":
    app.run(debug=os.getenv("FLASK_DEBUG", "false").lower() == "true")
