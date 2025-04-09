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

### Running the API

Start the development server:
```
python -m app.main
```

The API will be available at http://localhost:8000 with interactive documentation at http://localhost:8000/docs

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
- `seedlines` (integer, optional): Number of seed lines
- `transplant` (integer, optional): Transplant time
- `harvest` (integer, optional): Harvest time