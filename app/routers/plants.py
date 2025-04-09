from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session
from typing import List

from app.database import crud, db
from app.routers.schemas import Plant, PlantCreate, PlantUpdate

router = APIRouter(
    prefix="/plants",
    tags=["plants"],
)

@router.get("/", response_model=List[Plant])
def get_plants(skip: int = 0, limit: int = 100, db: Session = Depends(db.get_db)):
    plants = crud.get_plants(db, skip=skip, limit=limit)
    return plants

@router.get("/{plant_id}", response_model=Plant)
def get_plant(plant_id: int, db: Session = Depends(db.get_db)):
    db_plant = crud.get_plant(db, plant_id=plant_id)
    if db_plant is None:
        raise HTTPException(status_code=404, detail="Plant not found")
    return db_plant

@router.post("/", response_model=Plant, status_code=status.HTTP_201_CREATED)
def create_plant(plant: PlantCreate, db: Session = Depends(db.get_db)):
    # Check for duplicate plants
    db_plant = crud.create_plant(db=db, plant=plant)
    if db_plant is None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"A plant with name '{plant.name}' and category '{plant.category}' already exists"
        )
    return db_plant

@router.put("/{plant_id}", response_model=Plant)
def update_plant(plant_id: int, plant: PlantUpdate, db: Session = Depends(db.get_db)):
    # First check if the plant exists
    existing_plant = crud.get_plant(db, plant_id=plant_id)
    if existing_plant is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plant not found")
    
    # Try to update the plant
    db_plant = crud.update_plant(db, plant_id=plant_id, plant=plant)
    if db_plant is None:
        # If None is returned after confirming the plant exists, it's due to a conflict
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cannot update: another plant with the same name and category already exists"
        )
    return db_plant

@router.delete("/{plant_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_plant(plant_id: int, db: Session = Depends(db.get_db)):
    success = crud.delete_plant(db, plant_id=plant_id)
    if not success:
        raise HTTPException(status_code=404, detail="Plant not found")
    return None