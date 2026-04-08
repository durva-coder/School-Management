# School Management API

Node.js REST API for managing school data using Express.js and MySQL.

## Features

- Add new schools with location data
- Retrieve schools sorted by proximity to user's location
- Input validation and error handling
- Haversine formula for accurate distance calculation

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MySQL
- **Validation:** express-validator

## Prerequisites

- Node.js (v14 or higher)
- MySQL Server (v5.7 or higher)
- npm or yarn

## Installation

1. Clone or navigate to the project directory:
```bash
cd "G:\projects\School Management"
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
copy .env.example .env
```

Edit `.env` file with your MySQL credentials:
```env
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=school_management
DB_PORT=3306
```

4. Setup database (creates database and tables):
```bash
npm run setup-db
```

## Running the Server

Development mode (with nodemon):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on `http://localhost:3000`

## API Endpoints

### 1. Add School

**Endpoint:** `POST /api/addSchool`

**Description:** Adds a new school to the database with validation.

**Request Body:**
```json
{
  "name": "Greenwood High School",
  "address": "123 Main Street, Springfield",
  "latitude": 40.7128,
  "longitude": -74.0060
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "School added successfully",
  "data": {
    "id": 1,
    "name": "Greenwood High School",
    "address": "123 Main Street, Springfield",
    "latitude": 40.7128,
    "longitude": -74.0060
  }
}
```

**Validation Error Response (400):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "msg": "School name is required",
      "param": "name",
      "location": "body"
    }
  ]
}
```

---

### 2. List Schools by Proximity

**Endpoint:** `GET /api/listSchools`

**Description:** Retrieves all schools sorted by distance from user's location.

**Query Parameters:**
- `latitude` (required): User's latitude (-90 to 90)
- `longitude` (required): User's longitude (-180 to 180)

**Example Request:**
```
GET /api/listSchools?latitude=40.7128&longitude=-74.0060
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Schools retrieved successfully",
  "count": 3,
  "data": [
    {
      "id": 1,
      "name": "Greenwood High School",
      "address": "123 Main Street, Springfield",
      "latitude": 40.7128,
      "longitude": -74.0060,
      "distance_km": 0.00
    },
    {
      "id": 2,
      "name": "Sunrise Academy",
      "address": "456 Oak Avenue, Springfield",
      "latitude": 40.7580,
      "longitude": -73.9855,
      "distance_km": 5.23
    }
  ]
}
```

**Validation Error Response (400):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "msg": "Latitude must be a float between -90 and 90",
      "param": "latitude",
      "location": "query"
    }
  ]
}
```

---

### 3. Health Check

**Endpoint:** `GET /`

**Description:** Returns API status and available endpoints.

**Response (200):**
```json
{
  "success": true,
  "message": "School Management API is running",
  "endpoints": {
    "addSchool": "POST /api/addSchool",
    "listSchools": "GET /api/listSchools?latitude={lat}&longitude={lon}"
  }
}
```

## Database Schema

### schools table

| Column    | Type         | Constraints              |
|-----------|--------------|--------------------------|
| id        | INT          | PRIMARY KEY, AUTO_INCREMENT |
| name      | VARCHAR(255) | NOT NULL                 |
| address   | VARCHAR(500) | NOT NULL                 |
| latitude  | FLOAT        | NOT NULL                 |
| longitude | FLOAT        | NOT NULL                 |
| created_at| TIMESTAMP    | DEFAULT CURRENT_TIMESTAMP  |
| updated_at| TIMESTAMP    | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP |

## Distance Calculation

The API uses the **Haversine formula** to calculate the great-circle distance between two points on a sphere (Earth). The formula provides distance in kilometers, accounting for Earth's curvature.

**Formula:**
```
a = sin²(Δφ/2) + cos φ1 ⋅ cos φ2 ⋅ sin²(Δλ/2)
c = 2 ⋅ atan2(√a, √(1−a))
d = R ⋅ c
```

Where:
- φ is latitude, λ is longitude
- R is Earth's radius (6371 km)
- Δφ is the difference in latitude
- Δλ is the difference in longitude

## Project Structure

```
School Management/
├── controllers/
│   └── schoolController.js    # Business logic for school APIs
├── database/
│   ├── config.js              # Database connection pool
│   └── setup.js               # Database initialization script
├── routes/
│   └── schoolRoutes.js        # API route definitions
├── .env.example               # Environment variables template
├── .gitignore                 # Git ignore rules
├── package.json               # Project dependencies
└── server.js                  # Application entry point
```

## Testing with Postman

A Postman collection is included for testing both APIs. Import the collection and configure the environment variables before testing.

### Example Test Cases

**Add School:**
- Valid payload → 201 Created
- Missing name → 400 Validation Error
- Invalid latitude → 400 Validation Error

**List Schools:**
- Valid coordinates → 200 OK with sorted schools
- Missing latitude → 400 Validation Error
- Invalid coordinates → 400 Validation Error

## Error Handling

The API handles errors gracefully with consistent JSON responses:

- **400 Bad Request:** Validation errors
- **404 Not Found:** Unknown endpoints
- **500 Internal Server Error:** Server/database errors

## License

ISC
