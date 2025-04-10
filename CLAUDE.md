# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Test Commands

### Backend (FastAPI)
- Run the API server: `python -m app.main`
- Run all tests: `pytest`
- Run a specific test: `pytest tests/test_file.py::test_function`
- Run tests with verbose output: `pytest -v`
- Test coverage: `pytest --cov=app`

### Frontend (React)
- Install dependencies: `cd frontend && npm install`
- Start development server: `cd frontend && npm start`
- Build for production: `cd frontend && npm run build`
- Run tests: `cd frontend && npm test`
- Run tests in watch mode: `cd frontend && npm run test:watch`

## Project Structure

### Backend (FastAPI)
- FastAPI application with SQLAlchemy ORM for database access
- Two main resources: Plants and Plantings
- Plants have restricted categories: "green", "tomato", "pepper", "vegetable", "herb", "flower"
- Plantings track when and where plants were planted with year, timestamps, and location

### Frontend (React)
- React application with Material UI for components
- React Router for navigation
- Axios for API requests
- Pages: Home, Plants, PlantDetails, Plantings, Import
- Components organized in `/components` directory
- Tests using Jest and React Testing Library in `__tests__` directory
- Date calculations for planting schedules based on last frost date (April 18)
- Expandable rows in Plantings view to show recommended dates
- CSV import functionality for bulk adding plants with one-letter category codes (T=tomato, P=pepper, V=vegetable, G=green, H=herb, F=flower)

## Code Style Guidelines

- **Imports**: Group imports: standard lib, third-party, local app imports
- **Type Annotations**: Use typing module for all function signatures
- **Error Handling**: Use FastAPI's HTTPException for API errors
- **Naming**: snake_case for variables/functions, PascalCase for classes
- **File Organization**: Models in models.py, schemas in schemas.py, CRUD in crud.py
- **Documentation**: Docstrings for functions, especially in routers
- **Database**: Use SQLAlchemy ORM with dependency injection pattern
- **Validation**: Use Pydantic's Literal for enum-like fields (e.g., plant categories)
- **Testing**: Create test fixtures in conftest.py, use separate test files per resource

## Terminology Guidelines

- Use action-oriented terminology in the UI:
  - "Start Seedlings" instead of "Seedlings" (when referring to the action of starting seeds indoors)
  - "Plant Outdoors" instead of "Transplant" (when referring to moving plants outside)
- Be consistent with these terms across all pages: Plants, Plantings, and PlantDetails