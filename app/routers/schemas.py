from pydantic import BaseModel, Field
from typing import Optional, Literal

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