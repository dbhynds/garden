from fastapi.testclient import TestClient
import pytest
from datetime import datetime

# First create a plant for testing
from tests.test_plants import test_create_plant, test_plant  

# Test data for plantings
test_planting = {
    "year": 2025,
    "plant_id": None,  # Will be set dynamically
    "seedlings": "2025-02-15T00:00:00",
    "planted": "2025-03-30T00:00:00",
    "location": "Garden Bed 1"
}

updated_planting = {
    "year": 2025,
    "plant_id": None,  # Will be set dynamically
    "seedlings": "2025-02-20T00:00:00",
    "planted": "2025-04-05T00:00:00",
    "location": "Garden Bed 2"
}

# Test routes
API_PREFIX = "/api/plantings"

def test_create_planting(client):
    """Test creating a new planting."""
    # First create a plant
    plant_id = test_create_plant(client)
    
    # Update test data with the plant_id
    test_planting["plant_id"] = plant_id
    
    # Create the planting
    response = client.post(API_PREFIX + "/", json=test_planting)
    assert response.status_code == 201
    data = response.json()
    assert data["year"] == test_planting["year"]
    assert data["plant_id"] == plant_id
    assert data["seedlings"] == test_planting["seedlings"]
    assert data["planted"] == test_planting["planted"]
    assert data["location"] == test_planting["location"]
    assert "id" in data
    return data["id"]

def test_get_plantings(client):
    """Test retrieving all plantings."""
    # First create a planting
    planting_id = test_create_planting(client)
    
    # Then get all plantings
    response = client.get(API_PREFIX + "/")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0

def test_get_plantings_by_year(client):
    """Test retrieving plantings filtered by year."""
    # First create a planting
    planting_id = test_create_planting(client)
    
    # Then get plantings for the year
    response = client.get(f"{API_PREFIX}/?year={test_planting['year']}")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert all(p["year"] == test_planting["year"] for p in data)

def test_get_plantings_by_plant(client):
    """Test retrieving plantings filtered by plant_id."""
    # First create a planting
    planting_id = test_create_planting(client)
    
    # Then get plantings for the plant
    response = client.get(f"{API_PREFIX}/?plant_id={test_planting['plant_id']}")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert all(p["plant_id"] == test_planting["plant_id"] for p in data)

def test_get_planting(client):
    """Test retrieving a specific planting."""
    # First create a planting
    planting_id = test_create_planting(client)
    
    # Then get the planting
    response = client.get(f"{API_PREFIX}/{planting_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == planting_id
    assert data["year"] == test_planting["year"]
    assert data["plant_id"] == test_planting["plant_id"]
    
    # Check that the plant details are included
    assert "plant" in data
    assert data["plant"]["id"] == test_planting["plant_id"]
    assert data["plant"]["name"] == test_plant["name"]

def test_get_nonexistent_planting(client):
    """Test retrieving a planting that doesn't exist."""
    response = client.get(f"{API_PREFIX}/9999")
    assert response.status_code == 404
    assert "detail" in response.json()

def test_update_planting(client):
    """Test updating a planting."""
    # First create a planting
    planting_id = test_create_planting(client)
    
    # Update test data with the same plant_id
    updated_planting["plant_id"] = test_planting["plant_id"]
    
    # Then update the planting
    response = client.put(f"{API_PREFIX}/{planting_id}", json=updated_planting)
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == planting_id
    assert data["year"] == updated_planting["year"]
    assert data["plant_id"] == updated_planting["plant_id"]
    assert data["seedlings"] == updated_planting["seedlings"]
    assert data["planted"] == updated_planting["planted"]
    assert data["location"] == updated_planting["location"]

def test_update_nonexistent_planting(client):
    """Test updating a planting that doesn't exist."""
    updated_planting["plant_id"] = test_planting["plant_id"]
    response = client.put(f"{API_PREFIX}/9999", json=updated_planting)
    assert response.status_code == 404
    assert "detail" in response.json()

def test_delete_planting(client):
    """Test deleting a planting."""
    # First create a planting
    planting_id = test_create_planting(client)
    
    # Then delete the planting
    response = client.delete(f"{API_PREFIX}/{planting_id}")
    assert response.status_code == 204
    
    # Verify it's gone
    response = client.get(f"{API_PREFIX}/{planting_id}")
    assert response.status_code == 404

def test_delete_nonexistent_planting(client):
    """Test deleting a planting that doesn't exist."""
    response = client.delete(f"{API_PREFIX}/9999")
    assert response.status_code == 404
    assert "detail" in response.json()