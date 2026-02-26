from pydantic import BaseModel, EmailStr
from typing import Optional 

class UserCreate(BaseModel):
    email: EmailStr
    password: str

class BlogOut(BaseModel):
    id: int
    title: Optional[str]
    content: Optional[str]

    class Config:
        orm_mode = True
