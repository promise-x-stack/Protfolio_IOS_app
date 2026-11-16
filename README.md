# Portfolio iOS App

A React portfolio experience styled as a desktop/mobile operating system, backed
by a Flask API and a MySQL database. The portfolio reads projects from MySQL;
the developer page at `/Gui` manages those records.

## Features

- Responsive React/Vite portfolio and project category views.
- Flask REST API with project create, read, update, and delete operations.
- XAMPP/MySQL database and project table created automatically on first API use.
- MySQL configuration, initialization, and query functions are organized in
  `BackEnd/Modules/database.py`.
- Browser project-list caching with offline fallback.
- Token-protected project administration page.
- Contact messages and emails saved in separate MySQL tables and managed from
  the owner inbox in `/Gui`.

## Requirements

- Python 3.10 or later.
- Node.js compatible with the Vite version in `FrontEnd/package.json`.
- XAMPP with MySQL started.

## Run locally

### Backend

In PowerShell from the project root:

```powershell
cd BackEnd
py -m venv .venv
.\.venv\Scripts\Activate.ps1
py -m pip install -r requirements.txt

$env:MYSQL_HOST = "127.0.0.1"
$env:MYSQL_PORT = "3306"
$env:MYSQL_USER = "root"
$env:MYSQL_PASSWORD = ""
$env:MYSQL_DATABASE = "portfolio_db"
$env:PROJECTS_ADMIN_TOKEN = "replace-with-a-long-random-secret"

py Api.py
```

The defaults match a typical local XAMPP installation with an empty root
password. Update the environment variables if your MySQL credentials differ.
On the first project API request, the backend creates the configured database
and its `projects` table. The database starts empty; add projects in the admin
page.

### Frontend

In a second PowerShell window:

```powershell
cd FrontEnd
npm install
$env:VITE_API_BASE_URL = "http://127.0.0.1:5000"
npm run dev
```

Open the Vite URL printed in the terminal. The API defaults to
`http://127.0.0.1:5000`; set `VITE_API_BASE_URL` when it is hosted elsewhere.

## Project administration

Open `http://127.0.0.1:5000/Gui`. Enter the backend's
`PROJECTS_ADMIN_TOKEN` to add, edit, or delete projects. The token is required
for project writes and for reading or deleting visitor messages and emails.
It is not saved by the page. Do not put this token in the public frontend or
expose the development API without HTTPS and appropriate access controls.

The portfolio's message and email forms submit to the Flask API. Submissions
are stored separately in the `messages` and `emails` tables and appear in the
admin page's inbox.

Project records use `projectName`, `category`, `link`, `logo`, and `ratings`.
The category endpoints recognize `portfolio`, `entertainment`, `community`,
and `productivity`.

| Method | Route | Description |
| --- | --- | --- |
| GET | `/api/products` | List all projects |
| GET | `/api/products/<id>` | Read one project |
| POST | `/api/products` | Create a project |
| PUT | `/api/products/<id>` | Replace a project |
| PATCH | `/api/products/<id>` | Update selected project fields |
| DELETE | `/api/products/<id>` | Delete a project |

Category lists are available at `/api/products/portfolio`,
`/api/products/entertainment`, `/api/products/community`, and
`/api/products/productivity`.

## Tests

```powershell
cd BackEnd
.\.venv\Scripts\python.exe -m unittest test_api.py -v
```

Build the frontend with `npm run build` from `FrontEnd`.
