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

def test_create_duplicate_planting(client):
    """Test creating a planting with duplicate year and plant_id."""
    # First create a plant and a planting
    test_create_planting(client)
    
    # Try to create the same planting again
    response = client.post(API_PREFIX + "/", json=test_planting)
    assert response.status_code == 409
    assert "already exists" in response.json()["detail"]

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
    
    # Check that plant details are included in each planting
    for planting in data:
        assert "plant" in planting
        assert planting["plant"]["id"] == planting["plant_id"]

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
    
    # Check that plant details are included in each planting
    for planting in data:
        assert "plant" in planting
        assert planting["plant"]["id"] == planting["plant_id"]

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
    
    # Check that plant details are included in each planting
    for planting in data:
        assert "plant" in planting
        assert planting["plant"]["id"] == planting["plant_id"]
        assert planting["plant"]["name"] == test_plant["name"]

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

def test_update_to_duplicate_planting(client):
    """Test updating a planting to have the same year and plant_id as another planting."""
    # Create a plant with a different name to avoid conflicts
    plant_response = client.post("/api/plants/", json={
        "name": "Tomato Test",
        "category": "tomato",
        "type": "Test",
        "seedlings": 10,
        "transplant": 30,
        "harvest": 90
    })
    assert plant_response.status_code == 201
    plant_id = plant_response.json()["id"]
    test_planting["plant_id"] = plant_id
    
    # Create another plant
    another_plant_response = client.post("/api/plants/", json={
        "name": "Cucumber",
        "category": "vegetable",
        "type": "Slicing"
    })
    assert another_plant_response.status_code == 201
    another_plant_id = another_plant_response.json()["id"]
    
    # Create first planting for the first plant
    response = client.post(API_PREFIX + "/", json=test_planting)
    assert response.status_code == 201
    planting1_id = response.json()["id"]
    
    # Create second planting for the second plant with a different year
    second_planting = {
        "year": 2026,  # Different year to avoid conflict
        "plant_id": another_plant_id,
        "seedlings": "2026-03-01T00:00:00",
        "planted": "2026-04-15T00:00:00",
        "location": "Garden Bed 3"
    }
    response = client.post(API_PREFIX + "/", json=second_planting)
    assert response.status_code == 201
    planting2_id = response.json()["id"]
    
    # Try to update the second planting to have the same year and plant_id as the first
    response = client.put(f"{API_PREFIX}/{planting2_id}", json={"year": 2025, "plant_id": plant_id})
    assert response.status_code == 409
    assert "already exists" in response.json()["detail"]

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