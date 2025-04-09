# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Test Commands

- Run the API server: `python -m app.main`
- Run all tests: `pytest`
- Run a specific test: `pytest tests/test_file.py::test_function`
- Run tests with verbose output: `pytest -v`
- Test coverage: `pytest --cov=app`

## Project Structure

- FastAPI application with SQLAlchemy ORM for database access
- Two main resources: Plants and Plantings
- Plants have restricted categories: "green", "tomato", "pepper", "vegetable", "herb", "flower"
- Plantings track when and where plants were planted with year, timestamps, and location

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