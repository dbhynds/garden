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
    db_planting = crud.create_planting(db=db, planting=planting)
    if db_planting is None:
        raise HTTPException(status_code=404, detail="Plant not found")
    return db_planting

@router.put("/{planting_id}", response_model=PlantingWithPlant)
def update_planting(planting_id: int, planting: PlantingUpdate, db: Session = Depends(db.get_db)):
    """
    Update a planting record.
    """
    db_planting = crud.update_planting(db, planting_id=planting_id, planting=planting)
    if db_planting is None:
        raise HTTPException(status_code=404, detail="Planting not found or referenced plant does not exist")
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