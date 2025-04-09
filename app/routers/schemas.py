from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime

# Base Plant model
class PlantBase(BaseModel):
    name: str
    category: Literal["green", "tomato", "pepper", "vegetable", "herb", "flower"]
    type: Optional[str] = None
    seedlings: Optional[int] = None
    transplant: Optional[int] = None
    harvest: Optional[int] = None

# Create Plant request
class PlantCreate(PlantBase):
    pass

# Update Plant request
class PlantUpdate(PlantBase):
    name: Optional[str] = None
    category: Optional[Literal["green", "tomato", "pepper", "vegetable", "herb", "flower"]] = None

# Plant response
class Plant(PlantBase):
    id: int

    class Config:
        orm_mode = True
        from_attributes = True
        
# Base Planting model
class PlantingBase(BaseModel):
    year: int
    plant_id: int
    seedlings: Optional[datetime] = None
    planted: Optional[datetime] = None
    location: Optional[str] = None

# Create Planting request
class PlantingCreate(PlantingBase):
    pass

# Update Planting request
class PlantingUpdate(PlantingBase):
    year: Optional[int] = None
    plant_id: Optional[int] = None
    seedlings: Optional[datetime] = None
    planted: Optional[datetime] = None
    location: Optional[str] = None

# Planting response
class Planting(PlantingBase):
    id: int

    class Config:
        orm_mode = True
        from_attributes = True
        
# Planting response with Plant details
class PlantingWithPlant(BaseModel):
    id: int
    year: int
    plant_id: int
    seedlings: Optional[datetime] = None
    planted: Optional[datetime] = None
    location: Optional[str] = None
    plant: Plant
    
    class Config:
        orm_mode = True
        from_attributes = True