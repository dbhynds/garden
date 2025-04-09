from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional
from uuid import uuid4, UUID

router = APIRouter(
    prefix="/plants",
    tags=["plants"],
)

class Plant(BaseModel):
    id: Optional[UUID] = None
    name: str
    category: str
    type: Optional[str] = None
    seedlines: Optional[int] = None
    transplant: Optional[int] = None
    harvest: Optional[int] = None

# In-memory database
plants_db = []

@router.get("/", response_model=List[Plant])
async def get_plants():
    return plants_db

@router.get("/{plant_id}", response_model=Plant)
async def get_plant(plant_id: UUID):
    for plant in plants_db:
        if plant.id == plant_id:
            return plant
    raise HTTPException(status_code=404, detail="Plant not found")

@router.post("/", response_model=Plant, status_code=status.HTTP_201_CREATED)
async def create_plant(plant: Plant):
    new_plant = plant.model_copy()
    new_plant.id = uuid4()
    plants_db.append(new_plant)
    return new_plant

@router.put("/{plant_id}", response_model=Plant)
async def update_plant(plant_id: UUID, updated_plant: Plant):
    for i, plant in enumerate(plants_db):
        if plant.id == plant_id:
            updated_with_id = updated_plant.model_copy(update={"id": plant_id})
            plants_db[i] = updated_with_id
            return updated_with_id
    raise HTTPException(status_code=404, detail="Plant not found")

@router.delete("/{plant_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_plant(plant_id: UUID):
    for i, plant in enumerate(plants_db):
        if plant.id == plant_id:
            plants_db.pop(i)
            return
    raise HTTPException(status_code=404, detail="Plant not found")