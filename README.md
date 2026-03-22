# Task Management REST API

This project includes an in-memory task management API built with Node.js and Express.js.

The server is started directly from `app.js`.

## Task Schema

```json
{
  "id": 2,
  "title": "Create a new project",
  "description": "Create a new project using Magic",
  "completed": false,
  "priority": "medium",
  "createdAt": "2026-03-22"
}
```

## Setup

```bash
npm install
npm start
```

The server runs on `http://localhost:8000`.

## Task API Endpoints

### `GET /tasks`

Returns all tasks from in-memory storage.

Optional query parameters:

- `completed=true|false` filters by completion status.
- `sort=asc|desc` sorts by `createdAt`.

### `GET /tasks/:id`

Returns one task by numeric `id`.

### `GET /tasks/priority/:level`

Returns tasks that match a priority level of `low`, `medium`, or `high`.

### `POST /tasks`

Creates a task.

Example body:

```json
{
  "title": "Learn Express",
  "description": "Build CRUD endpoints",
  "completed": false,
  "priority": "high"
}
```

### `PUT /tasks/:id`

Updates a task by `id`. All fields are required in the request body.

### `DELETE /tasks/:id`

Deletes a task by `id`.

## Validation and Error Handling

- `title` must be a non-empty string.
- `description` must be a non-empty string.
- `completed` must be a boolean.
- `priority` must be one of `low`, `medium`, or `high`.
- Request body must be a JSON object.
- Malformed JSON returns `400`.
- Invalid IDs return `400`.
- Missing tasks return `404`.

## How to Test the API

You can test the API using Postman or `curl`.

Base URL:

```bash
http://localhost:8000
```

Examples:

- `GET /tasks`
- `GET /tasks?completed=true`
- `GET /tasks?sort=desc`
- `GET /tasks/1`
- `GET /tasks/priority/high`
- `POST /tasks`
- `PUT /tasks/1`
- `DELETE /tasks/1`

## Quick curl Examples

### `GET /tasks`

```bash
curl http://localhost:8000/tasks
```

### `GET /tasks?completed=true&sort=desc`

```bash
curl "http://localhost:8000/tasks?completed=true&sort=desc"
```

### `GET /tasks/:id`

```bash
curl http://localhost:8000/tasks/1
```

### `GET /tasks/priority/:level`

```bash
curl http://localhost:8000/tasks/priority/high
```

### `POST /tasks`

```bash
curl -X POST http://localhost:8000/tasks \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"Ship API\",\"description\":\"Finish the guided project\",\"completed\":false,\"priority\":\"high\"}"
```

### `PUT /tasks/:id`

```bash
curl -X PUT http://localhost:8000/tasks/1 \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"Ship API\",\"description\":\"Finish and verify the guided project\",\"completed\":true,\"priority\":\"medium\"}"
```

### `DELETE /tasks/:id`

```bash
curl -X DELETE http://localhost:8000/tasks/1
```

### Validation failure example

```bash
curl -X POST http://localhost:8000/tasks \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"\",\"description\":\"\",\"completed\":\"false\",\"priority\":\"urgent\"}"
```

### Missing task example

```bash
curl http://localhost:8000/tasks/999
```
