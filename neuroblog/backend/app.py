from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from database import SessionLocal,engine, Base, get_db
from models import Post
from models import User
from schemas import UserCreate
from security import hash_password


app = FastAPI()

# ================== CORS ==================
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ================== DB SESSION ==================
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ================== SCHEMAS ==================
class PostCreate(BaseModel):
    user_id: int
    title: str
    content: str

class PostSchema(BaseModel):
    id: int
    user_id: int
    title: Optional[str] = "Untitled"
    content: str
    timestamp: datetime

    class Config:
        orm_mode = True

# ================== ROUTES ==================

# GET ALL POSTS
@app.get("/posts", response_model=List[PostSchema])
def read_posts(db: Session = Depends(get_db)):
    return db.query(Post).order_by(Post.id.desc()).all()

# CREATE POST
@app.post("/posts", response_model=PostSchema, status_code=status.HTTP_201_CREATED)
def create_post(post: PostCreate, db: Session = Depends(get_db)):
    new_post = Post(
        user_id=post.user_id,
        title=post.title,
        content=post.content,
        timestamp=datetime.utcnow()
    )
    db.add(new_post)
    db.commit()
    db.refresh(new_post)
    return new_post

# UPDATE POST
@app.put("/posts/{post_id}", response_model=PostSchema)
def update_post(post_id: int, updated_post: PostCreate, db: Session = Depends(get_db)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    if post.user_id != updated_post.user_id:
        raise HTTPException(status_code=403, detail="Unauthorized")

    post.title = updated_post.title
    post.content = updated_post.content
    db.commit()
    db.refresh(post)
    return post

# DELETE POST
@app.delete("/posts/{post_id}")
def delete_post(post_id: int, user_id: int, db: Session = Depends(get_db)):
    post = db.query(Post).filter(Post.id == post_id).first()

    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    if post.user_id != user_id:
        raise HTTPException(status_code=403, detail="Unauthorized")

    db.delete(post)
    db.commit()
    return {"message": "Post deleted successfully"}

# POST COUNT (FOR PROFILE)
@app.get("/posts/count/{user_id}")
def get_post_count(user_id: int, db: Session = Depends(get_db)):
    count = db.query(Post).filter(Post.user_id == user_id).count()
    return {"count": count}


Base.metadata.create_all(bind=engine)

@app.post("/signup")
def signup(user: UserCreate, db: Session = Depends(get_db)):
    # Check if email already exists
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Auto username from email
    username = user.email.split("@")[0]

    new_user = User(
        email=user.email,
        username=username,
        hashed_password=hash_password(user.password)
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "User created successfully 🎉",
        "user_id": new_user.id,
        "username": new_user.username
    }
    
    
from fastapi.security import OAuth2PasswordRequestForm
from security import verify_password

@app.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == form_data.username).first()

    if not user:
        raise HTTPException(status_code=400, detail="Invalid credentials")

    if not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    return {
        "message": "Login successful ✅",
        "user_id": user.id,
        "username": user.username
    }
