from sqlalchemy.orm import Session, joinedload
from . import models
from app.routers.schemas import PlantCreate, PlantUpdate, PlantingCreate, PlantingUpdate

# Plant CRUD operations

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

# Planting CRUD operations

# Get all plantings
def get_plantings(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Planting).options(joinedload(models.Planting.plant)).offset(skip).limit(limit).all()

# Get plantings by year
def get_plantings_by_year(db: Session, year: int, skip: int = 0, limit: int = 100):
    return db.query(models.Planting).options(joinedload(models.Planting.plant)).filter(models.Planting.year == year).offset(skip).limit(limit).all()

# Get plantings for a specific plant
def get_plantings_by_plant(db: Session, plant_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.Planting).options(joinedload(models.Planting.plant)).filter(models.Planting.plant_id == plant_id).offset(skip).limit(limit).all()

# Get a specific planting by ID
def get_planting(db: Session, planting_id: int):
    return db.query(models.Planting).options(joinedload(models.Planting.plant)).filter(models.Planting.id == planting_id).first()

# Create a new planting
def create_planting(db: Session, planting: PlantingCreate):
    # Verify plant exists
    db_plant = get_plant(db, planting.plant_id)
    if not db_plant:
        return None
        
    db_planting = models.Planting(**planting.model_dump())
    db.add(db_planting)
    db.commit()
    db.refresh(db_planting)
    
    # Reload the planting with the plant relationship
    return get_planting(db, db_planting.id)

# Update a planting
def update_planting(db: Session, planting_id: int, planting: PlantingUpdate):
    db_planting = get_planting(db, planting_id)
    if not db_planting:
        return None
        
    # If plant_id is being updated, verify the new plant exists
    if planting.plant_id is not None and planting.plant_id != db_planting.plant_id:
        db_plant = get_plant(db, planting.plant_id)
        if not db_plant:
            return None
    
    update_data = planting.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_planting, key, value)
    db.commit()
    db.refresh(db_planting)
    
    # Reload the planting with the plant relationship
    return get_planting(db, planting_id)

# Delete a planting
def delete_planting(db: Session, planting_id: int):
    db_planting = get_planting(db, planting_id)
    if db_planting:
        db.delete(db_planting)
        db.commit()
        return True
    return False