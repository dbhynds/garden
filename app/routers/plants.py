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
    return crud.create_plant(db=db, plant=plant)

@router.put("/{plant_id}", response_model=Plant)
def update_plant(plant_id: int, plant: PlantUpdate, db: Session = Depends(db.get_db)):
    db_plant = crud.update_plant(db, plant_id=plant_id, plant=plant)
    if db_plant is None:
        raise HTTPException(status_code=404, detail="Plant not found")
    return db_plant

@router.delete("/{plant_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_plant(plant_id: int, db: Session = Depends(db.get_db)):
    success = crud.delete_plant(db, plant_id=plant_id)
    if not success:
        raise HTTPException(status_code=404, detail="Plant not found")
    return None