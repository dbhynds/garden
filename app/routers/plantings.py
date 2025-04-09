from fastapi import APIRouter, HTTPException, status, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import crud, db
from app.routers.schemas import Planting, PlantingCreate, PlantingUpdate, PlantingWithPlant

router = APIRouter(
    prefix="/plantings",
    tags=["plantings"],
)

@router.get("/", response_model=List[PlantingWithPlant])
def get_plantings(
    skip: int = 0, 
    limit: int = 100, 
    year: Optional[int] = None,
    plant_id: Optional[int] = None,
    db: Session = Depends(db.get_db)
):
    """
    Get plantings with optional filtering by year or plant_id.
    """
    if year is not None:
        return crud.get_plantings_by_year(db, year=year, skip=skip, limit=limit)
    elif plant_id is not None:
        return crud.get_plantings_by_plant(db, plant_id=plant_id, skip=skip, limit=limit)
    return crud.get_plantings(db, skip=skip, limit=limit)

@router.get("/{planting_id}", response_model=PlantingWithPlant)
def get_planting(planting_id: int, db: Session = Depends(db.get_db)):
    """
    Get a specific planting by ID.
    """
    db_planting = crud.get_planting(db, planting_id=planting_id)
    if db_planting is None:
        raise HTTPException(status_code=404, detail="Planting not found")
    return db_planting

@router.post("/", response_model=PlantingWithPlant, status_code=status.HTTP_201_CREATED)
def create_planting(planting: PlantingCreate, db: Session = Depends(db.get_db)):
    """
    Create a new planting record.
    """
    # First check if the plant exists
    db_plant = crud.get_plant(db, plant_id=planting.plant_id)
    if db_plant is None:
        raise HTTPException(status_code=404, detail="Plant not found")
    
    # Try to create the planting
    db_planting = crud.create_planting(db=db, planting=planting)
    if db_planting is None:
        # If None is returned after confirming the plant exists, it's due to a duplicate
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"A planting for plant '{db_plant.name}' in year {planting.year} already exists"
        )
    return db_planting

@router.put("/{planting_id}", response_model=PlantingWithPlant)
def update_planting(planting_id: int, planting: PlantingUpdate, db: Session = Depends(db.get_db)):
    """
    Update a planting record.
    """
    # First check if the planting exists
    existing_planting = crud.get_planting(db, planting_id=planting_id)
    if existing_planting is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Planting not found")
    
    # If plant_id is being updated, verify the new plant exists
    if planting.plant_id is not None and planting.plant_id != existing_planting.plant_id:
        db_plant = crud.get_plant(db, plant_id=planting.plant_id)
        if db_plant is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Referenced plant does not exist")
    
    # Try to update the planting
    db_planting = crud.update_planting(db, planting_id=planting_id, planting=planting)
    if db_planting is None:
        # If None is returned after confirming the planting exists, it's due to a conflict
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cannot update: a planting for this plant and year combination already exists"
        )
    return db_planting

@router.delete("/{planting_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_planting(planting_id: int, db: Session = Depends(db.get_db)):
    """
    Delete a planting record.
    """
    success = crud.delete_planting(db, planting_id=planting_id)
    if not success:
        raise HTTPException(status_code=404, detail="Planting not found")
    return None