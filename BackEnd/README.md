# Portfolio API

## Run with XAMPP

1. Start **MySQL** in the XAMPP Control Panel. The API creates the configured
   database and `projects` table automatically on its first project request.
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
database and requires the configured admin token for create, update, and delete
actions.
