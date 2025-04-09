from fastapi.testclient import TestClient
import pytest

# Test data
test_plant = {
    "name": "Tomato",
    "category": "tomato",
    "type": "Cherry",
    "seedlings": 10,
    "transplant": 30,
    "harvest": 90
}

updated_plant = {
    "name": "Roma Tomato",
    "category": "tomato",
    "type": "Roma",
    "seedlings": 15,
    "transplant": 35,
    "harvest": 95
}

# Test routes
API_PREFIX = "/api/plants"

def test_create_plant(client):
    """Test creating a new plant."""
    response = client.post(API_PREFIX + "/", json=test_plant)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == test_plant["name"]
    assert data["category"] == test_plant["category"]
    assert data["type"] == test_plant["type"]
    assert data["seedlings"] == test_plant["seedlings"]
    assert data["transplant"] == test_plant["transplant"]
    assert data["harvest"] == test_plant["harvest"]
    assert "id" in data
    return data["id"]

def test_create_duplicate_plant(client):
    """Test creating a plant with duplicate name and category."""
    # First create a plant
    plant_id = test_create_plant(client)
    
    # Try to create the same plant again
    response = client.post(API_PREFIX + "/", json=test_plant)
    assert response.status_code == 409
    assert "already exists" in response.json()["detail"]

def test_get_plants(client):
    """Test retrieving all plants."""
    # First create a plant
    plant_id = test_create_plant(client)
    
    # Then get all plants
    response = client.get(API_PREFIX + "/")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0

def test_get_plant(client):
    """Test retrieving a specific plant."""
    # First create a plant
    plant_id = test_create_plant(client)
    
    # Then get the plant
    response = client.get(f"{API_PREFIX}/{plant_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == plant_id
    assert data["name"] == test_plant["name"]

def test_get_nonexistent_plant(client):
    """Test retrieving a plant that doesn't exist."""
    response = client.get(f"{API_PREFIX}/9999")
    assert response.status_code == 404
    assert "detail" in response.json()

def test_update_plant(client):
    """Test updating a plant."""
    # First create a plant
    plant_id = test_create_plant(client)
    
    # Then update the plant
    response = client.put(f"{API_PREFIX}/{plant_id}", json=updated_plant)
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == plant_id
    assert data["name"] == updated_plant["name"]
    assert data["category"] == updated_plant["category"]
    assert data["type"] == updated_plant["type"]
    assert data["seedlings"] == updated_plant["seedlings"]
    assert data["transplant"] == updated_plant["transplant"]
    assert data["harvest"] == updated_plant["harvest"]

def test_update_nonexistent_plant(client):
    """Test updating a plant that doesn't exist."""
    response = client.put(f"{API_PREFIX}/9999", json=updated_plant)
    assert response.status_code == 404
    assert "detail" in response.json()
    
def test_update_to_duplicate_plant(client):
    """Test updating a plant to have the same name and category as another plant."""
    # Create first plant (the one we'll update later)
    plant1_id = test_create_plant(client)
    
    # Create a second plant with different name/category
    second_plant = {
        "name": "Cucumber",
        "category": "vegetable",
        "type": "Slicing"
    }
    response = client.post(API_PREFIX + "/", json=second_plant)
    assert response.status_code == 201
    plant2_id = response.json()["id"]
    
    # Try to update the second plant to have the same name/category as the first
    response = client.put(f"{API_PREFIX}/{plant2_id}", json={"name": test_plant["name"], "category": test_plant["category"]})
    assert response.status_code == 409
    assert "another plant with the same name and category already exists" in response.json()["detail"]

def test_partial_update_plant(client):
    """Test partially updating a plant."""
    # First create a plant
    plant_id = test_create_plant(client)
    
    # Then partially update the plant
    partial_update = {"name": "Better Tomato", "category": "tomato"}
    response = client.put(f"{API_PREFIX}/{plant_id}", json=partial_update)
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == plant_id
    assert data["name"] == "Better Tomato"
    assert data["category"] == test_plant["category"]  # Should remain unchanged

def test_delete_plant(client):
    """Test deleting a plant."""
    # First create a plant
    plant_id = test_create_plant(client)
    
    # Then delete the plant
    response = client.delete(f"{API_PREFIX}/{plant_id}")
    assert response.status_code == 204
    
    # Verify it's gone
    response = client.get(f"{API_PREFIX}/{plant_id}")
    assert response.status_code == 404

def test_delete_nonexistent_plant(client):
    """Test deleting a plant that doesn't exist."""
    response = client.delete(f"{API_PREFIX}/9999")
    assert response.status_code == 404
    assert "detail" in response.json()