# Portfolio API

## Run with XAMPP

1. Start **MySQL** in the XAMPP Control Panel. The API creates the configured
   database and its `projects`, `messages`, and `emails` tables on the first
   database request.
2. In PowerShell, from `BackEnd`, set the MySQL settings if they differ from the
   XAMPP defaults:

   ```powershell
   $env:MYSQL_HOST = "127.0.0.1"
   $env:MYSQL_PORT = "3306"
   $env:MYSQL_USER = "root"
   $env:MYSQL_PASSWORD = ""
   $env:MYSQL_DATABASE = "portfolio_db"
   $env:PROJECTS_ADMIN_TOKEN = "replace-with-a-long-random-secret"
   ```

3. Install dependencies and run the API:

   ```powershell
   py -m pip install -r requirements.txt
   py Api.py
   ```

The public portfolio can read projects without a token. Create, update, and
delete requests require `Authorization: Bearer <PROJECTS_ADMIN_TOKEN>`.
Keep the admin token on a trusted server or administrator tool; never put it in
the public frontend bundle. Write operations return `503` until a token is
configured. Do not expose this development API publicly without HTTPS and a
properly managed admin credential.

## Backend modules

`Api.py` imports `Modules.database`, which owns MySQL configuration,
initialization, and project, message, and email queries. The module creates the
configured database and tables lazily when the first database operation is
requested; all data remains in the XAMPP-managed MySQL server.

The module is imported with `from Modules import database`. Its public
functions include `initialize_database()` and `get_connection()`, plus
`list_projects()`, `get_project()`, `create_project()`, `update_project()`,
`delete_project()`, and the corresponding message/email create, list, and
delete functions.

## Project API

Projects use these JSON properties: `projectName`, `category`, `link`, `logo`,
and `ratings`. `projectName`, `category`, and `link` are required for creates
and full updates; `logo` and `ratings` default to empty strings.

| Method | Route | Description |
| --- | --- | --- |
| GET | `/api/products` | List all projects |
| GET | `/api/products/<id>` | Read one project |
| POST | `/api/products` | Create a project |
| PUT | `/api/products/<id>` | Replace a project |
| PATCH | `/api/products/<id>` | Update selected project fields |
| DELETE | `/api/products/<id>` | Delete a project |

Category listing routes remain available at `/api/products/portfolio`,
`/api/products/entertainment`, `/api/products/community`, and
`/api/products/productivity`.

The developer CRUD page is available at `/Gui`. It lists projects from the
database and requires the configured admin token for project create, update,
and delete actions. The same page displays incoming messages and emails and
allows the owner to delete them. Inbox reads and deletions require the admin
token; public contact submissions do not.

## Portfolio contact API

The portfolio stores contact submissions in separate tables within the
configured database:

| Method | Route | Description |
| --- | --- | --- |
| POST | `/message-user-data` | Save a visitor message |
| POST | `/mail-user-data` | Save a visitor email/contact form |
| GET | `/api/messages` | List messages (admin token required) |
| DELETE | `/api/messages/<id>` | Delete a message (admin token required) |
| GET | `/api/emails` | List emails (admin token required) |
| DELETE | `/api/emails/<id>` | Delete an email (admin token required) |

Messages accept the existing `userMassege` string or object payload. Email
submissions accept an `email` object with `Sender`, `Subject`, `Message`, and
`DateSent` fields.
