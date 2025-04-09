from sqlalchemy.orm import Session, joinedload
from . import models
from app.routers.schemas import PlantCreate, PlantUpdate, PlantingCreate, PlantingUpdate

# Common constants and utility functions
from sqlalchemy import case, cast, String
from sqlalchemy.sql.expression import literal_column

# Define the custom category sort order
CATEGORY_ORDER = {
    'tomato': 1,
    'pepper': 2,
    'green': 3,
    'vegetable': 4,
    'herb': 5,
    'flower': 6
}

# Create a case expression for sorting by category
def get_category_sort_expression():
    from sqlalchemy.sql import expression
    
    # Create case expression for category sort order
    when_expressions = []
    for category, order in CATEGORY_ORDER.items():
        when_expressions.append(
            (models.Plant.category == category, literal_column(str(order)))
        )
    
    return expression.case(*when_expressions, else_=literal_column('100'))

# Plant CRUD operations

# Get all plants
def get_plants(db: Session, skip: int = 0, limit: int = 100):
    # Query plants sorted by category order, then by name
    return db.query(models.Plant)\
        .order_by(get_category_sort_expression(), models.Plant.name)\
        .offset(skip)\
        .limit(limit)\
        .all()

# Get a specific plant by ID
def get_plant(db: Session, plant_id: int):
    return db.query(models.Plant).filter(models.Plant.id == plant_id).first()

# Check if a plant with the same name and category exists
def get_plant_by_name_and_category(db: Session, name: str, category: str):
    return db.query(models.Plant).filter(
        models.Plant.name == name,
        models.Plant.category == category
    ).first()

# Create a new plant
def create_plant(db: Session, plant: PlantCreate):
    # Check if a plant with the same name and category already exists
    existing_plant = get_plant_by_name_and_category(db, name=plant.name, category=plant.category)
    if existing_plant:
        return None  # Return None to indicate duplicate
        
    db_plant = models.Plant(**plant.model_dump())
    db.add(db_plant)
    db.commit()
    db.refresh(db_plant)
    return db_plant

# Update a plant
def update_plant(db: Session, plant_id: int, plant: PlantUpdate):
    db_plant = get_plant(db, plant_id)
    if not db_plant:
        return None
        
    # Only check for duplicates if name or category is changing
    if (plant.name is not None and plant.name != db_plant.name) or (plant.category is not None and plant.category != db_plant.category):
        # Determine the new name and category after update
        new_name = plant.name if plant.name is not None else db_plant.name
        new_category = plant.category if plant.category is not None else db_plant.category
        
        # Check for existing plant with the same name and category
        existing_plant = get_plant_by_name_and_category(db, name=new_name, category=new_category)
        if existing_plant and existing_plant.id != plant_id:
            return None  # Return None to indicate conflict
    
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

# Check if a planting with the same year and plant_id exists
def get_planting_by_year_and_plant_id(db: Session, year: int, plant_id: int):
    return db.query(models.Planting).filter(
        models.Planting.year == year,
        models.Planting.plant_id == plant_id
    ).first()

# Get all plantings
def get_plantings(db: Session, skip: int = 0, limit: int = 100):
    # Query plantings joined with plants, sorted by plant category order, then by plant name
    return db.query(models.Planting)\
        .join(models.Plant)\
        .options(joinedload(models.Planting.plant))\
        .order_by(get_category_sort_expression(), models.Plant.name)\
        .offset(skip)\
        .limit(limit)\
        .all()

# Get plantings by year
def get_plantings_by_year(db: Session, year: int, skip: int = 0, limit: int = 100):
    # Query plantings filtered by year, joined with plants, sorted by plant category and name
    return db.query(models.Planting)\
        .join(models.Plant)\
        .options(joinedload(models.Planting.plant))\
        .filter(models.Planting.year == year)\
        .order_by(get_category_sort_expression(), models.Plant.name)\
        .offset(skip)\
        .limit(limit)\
        .all()

# Get plantings for a specific plant
def get_plantings_by_plant(db: Session, plant_id: int, skip: int = 0, limit: int = 100):
    # When filtering by plant_id, we don't need to sort by plant category/name
    return db.query(models.Planting)\
        .options(joinedload(models.Planting.plant))\
        .filter(models.Planting.plant_id == plant_id)\
        .offset(skip)\
        .limit(limit)\
        .all()

# Get a specific planting by ID
def get_planting(db: Session, planting_id: int):
    return db.query(models.Planting).options(joinedload(models.Planting.plant)).filter(models.Planting.id == planting_id).first()

# Create a new planting
def create_planting(db: Session, planting: PlantingCreate):
    # Verify plant exists
    db_plant = get_plant(db, planting.plant_id)
    if not db_plant:
        return None
    
    # Check if a planting with the same year and plant_id already exists
    existing_planting = get_planting_by_year_and_plant_id(db, year=planting.year, plant_id=planting.plant_id)
    if existing_planting:
        return None  # Return None to indicate duplicate
        
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
        
    # Determine if year or plant_id is changing
    year_changing = planting.year is not None and planting.year != db_planting.year
    plant_id_changing = planting.plant_id is not None and planting.plant_id != db_planting.plant_id
    
    # If plant_id is being updated, verify the new plant exists
    if plant_id_changing:
        db_plant = get_plant(db, planting.plant_id)
        if not db_plant:
            return None
    
    # If year or plant_id is changing, check for duplicates
    if year_changing or plant_id_changing:
        # Determine new values after update
        new_year = planting.year if planting.year is not None else db_planting.year
        new_plant_id = planting.plant_id if planting.plant_id is not None else db_planting.plant_id
        
        # Check for existing planting with same year and plant_id
        existing_planting = get_planting_by_year_and_plant_id(db, year=new_year, plant_id=new_plant_id)
        if existing_planting and existing_planting.id != planting_id:
            return None  # Return None to indicate conflict
    
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