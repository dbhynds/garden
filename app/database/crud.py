from sqlalchemy.orm import Session
from . import models
from app.routers.schemas import PlantCreate, PlantUpdate

# Get all plants
def get_plants(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Plant).offset(skip).limit(limit).all()

# Get a specific plant by ID
def get_plant(db: Session, plant_id: int):
    return db.query(models.Plant).filter(models.Plant.id == plant_id).first()

# Create a new plant
def create_plant(db: Session, plant: PlantCreate):
    db_plant = models.Plant(**plant.model_dump())
    db.add(db_plant)
    db.commit()
    db.refresh(db_plant)
    return db_plant

# Update a plant
def update_plant(db: Session, plant_id: int, plant: PlantUpdate):
    db_plant = get_plant(db, plant_id)
    if db_plant:
        update_data = plant.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_plant, key, value)
        db.commit()
        db.refresh(db_plant)
    return db_plant

# Delete a plant
def delete_plant(db: Session, plant_id: int):
    db_plant = get_plant(db, plant_id)
    if db_plant:
        db.delete(db_plant)
        db.commit()
        return True
    return False