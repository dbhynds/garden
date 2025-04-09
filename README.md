# Garden API

A RESTful API for managing garden plant information.

## Features

- CRUD operations for garden plants
- Track plant details including name, category, type, and growth timeline
- FastAPI with automatic OpenAPI documentation

## Getting Started

### Prerequisites

- Python 3.8+
- pip

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```
3. Create a `.env` file (you can copy `.env.example`):
   ```
   cp .env.example .env
   ```

### Running the API

Start the development server:
```
python -m app.main
```

The API will be available at http://localhost:8000 with interactive documentation at http://localhost:8000/docs

### Database

The application uses SQLite by default. The database will be automatically created at `garden.db` in the root directory when the application starts.

## API Endpoints

The API provides the following endpoints for plants:

- `GET /api/plants` - List all plants
- `GET /api/plants/{plant_id}` - Get a specific plant
- `POST /api/plants` - Create a new plant
- `PUT /api/plants/{plant_id}` - Update a plant
- `DELETE /api/plants/{plant_id}` - Delete a plant

## Plant Model

Plants have the following properties:
- `name` (string, required): Plant name
- `category` (string, required): Plant category
- `type` (string, optional): Plant type
- `seedlings` (integer, optional): Days seedlings should be started relative to last frost
- `transplant` (integer, optional): Days that seedlings or seeds should be planted outside relative to the last frost
- `harvest` (integer, optional): Days to maturity