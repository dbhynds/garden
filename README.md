# Garden Planner

A full-stack application for managing garden plants and plantings with a FastAPI backend and React frontend.

## Features

### Backend
- CRUD operations for garden plants and plantings
- Track plant details including name, category, type, and growth timeline
- Record plantings with year, planting dates, and location
- FastAPI with automatic OpenAPI documentation

### Frontend
- Modern React application with Material UI
- Responsive design for desktop and mobile
- Interactive forms for adding and editing plants and plantings
- Year-based filtering for plantings

## Getting Started

### Prerequisites

- Python 3.8+
- pip
- Node.js 14+ and npm

### Installation

1. Clone the repository
2. Install backend dependencies:
   ```
   pip install -r requirements.txt
   ```
3. Create a `.env` file (you can copy `.env.example`):
   ```
   cp .env.example .env
   ```
4. Install frontend dependencies:
   ```
   cd frontend
   npm install
   ```

### Running the Application

#### Start the backend server:
```
python -m app.main
```

The API will be available at http://localhost:8000 with interactive documentation at http://localhost:8000/docs

#### Start the frontend development server:
```
cd frontend
npm start
```

The frontend will open automatically in your browser at http://localhost:3000

### Database

The application uses SQLite by default. The database will be automatically created at `garden.db` in the root directory when the application starts.

## API Endpoints

### Plants Endpoints

- `GET /api/plants` - List all plants
- `GET /api/plants/{plant_id}` - Get a specific plant
- `POST /api/plants` - Create a new plant
- `PUT /api/plants/{plant_id}` - Update a plant
- `DELETE /api/plants/{plant_id}` - Delete a plant

### Plantings Endpoints

- `GET /api/plantings` - List all plantings (can filter by year or plant_id)
- `GET /api/plantings/{planting_id}` - Get a specific planting
- `POST /api/plantings` - Create a new planting
- `PUT /api/plantings/{planting_id}` - Update a planting
- `DELETE /api/plantings/{planting_id}` - Delete a planting

## Data Models

### Plant Model

Plants have the following properties:
- `name` (string, required): Plant name
- `category` (string, required): Plant category (one of: "green", "tomato", "pepper", "vegetable", "herb", "flower")
- `type` (string, optional): Plant type
- `seedlings` (integer, optional): Days seedlings should be started relative to last frost
- `transplant` (integer, optional): Days that seedlings or seeds should be planted outside relative to the last frost
- `harvest` (integer, optional): Days to maturity

### Planting Model

Plantings have the following properties:
- `year` (integer, required): Planting year
- `plant_id` (integer, required): Reference to an existing plant
- `seedlings` (datetime, optional): Date when seedlings were started
- `planted` (datetime, optional): Date when plants were planted outside
- `location` (string, optional): Where the plant was planted