from fastapi import FastAPI, Depends, HTTPException, status, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, desc
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import requests

from database import engine, Base, get_db
from models import Post, Blog, User, Like, Comment
from schemas import UserCreate, BlogOut
from security import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user
)

app = FastAPI()

# ================== CORS ==================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ================== BASIC ROUTE ==================
@app.get("/")
def home():
    return {"message": "NeuroBlog Backend Running Successfully 🚀"}


# ================== SCHEMAS ==================

class PostCreate(BaseModel):
    title: str
    content: str


class ProfileUpdate(BaseModel):
    username: Optional[str] = None
    bio: Optional[str] = None
    profile_picture: Optional[str] = None


class GenerateRequest(BaseModel):
    prompt: str


# ================== AI BLOG GENERATION ==================

@app.post("/generate-blog")
def generate_blog(data: GenerateRequest):
    try:
        response = requests.post(
            "http://localhost:9000/generate",
            json={"prompt": data.prompt}
        )
        return response.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Service Error: {str(e)}")


# ================== USER ROUTES ==================

@app.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "bio": current_user.bio,
        "profile_picture": current_user.profile_picture
    }


@app.put("/profile")
def update_profile(
    profile: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if profile.username is not None:
        current_user.username = profile.username

    if profile.bio is not None:
        current_user.bio = profile.bio

    if profile.profile_picture is not None:
        current_user.profile_picture = profile.profile_picture

    db.commit()
    db.refresh(current_user)

    return {
        "message": "Profile updated successfully",
        "username": current_user.username,
        "bio": current_user.bio,
        "profile_picture": current_user.profile_picture
    }


@app.get("/posts/count/{user_id}")
def get_post_count(user_id: int, db: Session = Depends(get_db)):
    count = db.query(Post).filter(Post.user_id == user_id).count()
    return {"count": count}


# ================== POSTS ROUTES ==================

@app.get("/posts")
def read_posts(
    search: str = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Post).options(joinedload(Post.user))

    if search:
        query = query.filter(
            or_(
                Post.title.ilike(f"%{search}%"),
                Post.content.ilike(f"%{search}%")
            )
        )

    posts = query.order_by(desc(Post.timestamp)).all()

    return [
        {
            "id": post.id,
            "title": post.title,
            "content": post.content,
            "timestamp": post.timestamp,
            "user_id": post.user_id,
            "username": post.user.username
        }
        for post in posts
    ]


@app.get("/posts/recent")
def get_recent_posts(db: Session = Depends(get_db)):
    posts = (
        db.query(Post)
        .options(joinedload(Post.user))
        .order_by(desc(Post.timestamp))
        .limit(10)
        .all()
    )

    return [
        {
            "id": post.id,
            "title": post.title,
            "content": post.content,
            "timestamp": post.timestamp,
            "username": post.user.username
        }
        for post in posts
    ]


@app.get("/posts/ids")
def get_post_ids(db: Session = Depends(get_db)):
    posts = db.query(Post).order_by(Post.timestamp.asc()).all()
    return [post.id for post in posts]


@app.get("/my-posts")
def get_my_posts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    posts = (
        db.query(Post)
        .options(joinedload(Post.user))
        .filter(Post.user_id == current_user.id)
        .order_by(desc(Post.timestamp))
        .all()
    )

    return [
        {
            "id": post.id,
            "title": post.title,
            "content": post.content,
            "timestamp": post.timestamp,
            "user_id": post.user_id,
            "username": post.user.username
        }
        for post in posts
    ]


@app.get("/posts/{post_id}")
def get_single_post(post_id: int, db: Session = Depends(get_db)):
    post = (
        db.query(Post)
        .options(joinedload(Post.user))
        .filter(Post.id == post_id)
        .first()
    )

    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    return {
        "id": post.id,
        "title": post.title,
        "content": post.content,
        "timestamp": post.timestamp,
        "username": post.user.username
    }


@app.post("/posts", status_code=status.HTTP_201_CREATED)
def create_post(
    post: PostCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    new_post = Post(
        user_id=current_user.id,
        title=post.title,
        content=post.content,
        timestamp=datetime.utcnow()
    )

    db.add(new_post)
    db.commit()
    db.refresh(new_post)

    return {
        "id": new_post.id,
        "title": new_post.title,
        "content": new_post.content,
        "timestamp": new_post.timestamp,
        "username": current_user.username
    }


@app.put("/posts/{post_id}")
def update_post(
    post_id: int,
    updated_post: PostCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    post = db.query(Post).filter(Post.id == post_id).first()

    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    if post.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized")

    post.title = updated_post.title
    post.content = updated_post.content

    db.commit()
    db.refresh(post)

    return {
        "id": post.id,
        "title": post.title,
        "content": post.content,
        "timestamp": post.timestamp,
        "username": current_user.username
    }


@app.delete("/posts/{post_id}")
def delete_post(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    post = db.query(Post).filter(Post.id == post_id).first()

    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    if post.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized")

    db.delete(post)
    db.commit()

    return {"message": "Post deleted successfully"}


# ================== COMMENT APIs ==================

@app.post("/posts/{post_id}/comments")
def add_comment(
    post_id: int,
    content: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    new_comment = Comment(
        content=content,
        user_id=current_user.id,
        post_id=post_id
    )

    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)

    return {
        "id": new_comment.id,
        "content": new_comment.content,
        "username": current_user.username,
        "created_at": new_comment.created_at
    }


@app.get("/posts/{post_id}/comments")
def get_comments(post_id: int, db: Session = Depends(get_db)):

    comments = (
        db.query(Comment)
        .options(joinedload(Comment.user))
        .filter(Comment.post_id == post_id)
        .order_by(desc(Comment.created_at))
        .all()
    )

    return [
        {
            "id": c.id,
            "content": c.content,
            "username": c.user.username,
            "created_at": c.created_at
        }
        for c in comments
    ]


@app.delete("/comments/{comment_id}")
def delete_comment(
    comment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    comment = db.query(Comment).filter(Comment.id == comment_id).first()

    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    if comment.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    db.delete(comment)
    db.commit()

    return {"message": "Comment deleted"}


# ✅ NEW EDIT COMMENT ROUTE
@app.put("/comments/{comment_id}")
def update_comment(
    comment_id: int,
    content: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    comment = db.query(Comment).filter(Comment.id == comment_id).first()

    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    if comment.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    comment.content = content
    db.commit()
    db.refresh(comment)

    return {"message": "Comment updated"}


# ================== REACTION APIs ==================

@app.post("/posts/{post_id}/react")
def react_post(
    post_id: int,
    is_like: bool,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    existing = db.query(Like).filter(
        Like.post_id == post_id,
        Like.user_id == current_user.id
    ).first()

    if existing:
        existing.is_like = is_like
    else:
        new_reaction = Like(
            post_id=post_id,
            user_id=current_user.id,
            is_like=is_like
        )
        db.add(new_reaction)

    db.commit()
    return {"message": "Reaction updated"}


@app.get("/posts/{post_id}/reactions")
def get_reactions(post_id: int, db: Session = Depends(get_db)):

    likes = db.query(Like).filter(
        Like.post_id == post_id,
        Like.is_like == True
    ).count()

    dislikes = db.query(Like).filter(
        Like.post_id == post_id,
        Like.is_like == False
    ).count()

    return {"likes": likes, "dislikes": dislikes}

# ==================notification==============

@app.get("/notifications/recent-posts")
def get_recent_posts(db: Session = Depends(get_db)):

    posts = (
        db.query(Post)
        .order_by(Post.id.desc())  # ✅ ORDER BY ID
        .limit(3)
        .all()
    )

    return [
        {
            "id": post.id,
            "title": post.title
        }
        for post in posts
    ]
    
# ===============USER REACTION SUMMERY====================


from sqlalchemy import func

@app.get("/users/{username}/reaction-summary")
def get_user_reaction_summary(username: str, db: Session = Depends(get_db)):

    # 1️⃣ Get user
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # 2️⃣ Get all posts created by this user
    user_posts = db.query(Post.id).filter(Post.user_id == user.id).all()

    post_ids = [p.id for p in user_posts]

    if not post_ids:
        return {"likes": 0, "dislikes": 0}

    # 3️⃣ Count likes
    total_likes = db.query(func.count(Like.id)).filter(
        Like.post_id.in_(post_ids),
        Like.is_like == True
    ).scalar()

    # 4️⃣ Count dislikes
    total_dislikes = db.query(func.count(Like.id)).filter(
        Like.post_id.in_(post_ids),
        Like.is_like == False
    ).scalar()

    return {
        "likes": total_likes,
        "dislikes": total_dislikes
    }
    

# ================== AUTH ROUTES ==================

@app.post("/signup")
def signup(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user.email).first()

    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    username = user.email.split("@")[0]

    new_user = User(
        email=user.email,
        username=username,
        hashed_password=hash_password(user.password)
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    access_token = create_access_token(data={"sub": str(new_user.id)})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": new_user.id,
        "username": new_user.username,
        "email": new_user.email
    }


@app.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == form_data.username).first()

    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    access_token = create_access_token(data={"sub": str(user.id)})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user.id,
        "username": user.username,
        "email": user.email
    }


@app.get("/api/search", response_model=List[BlogOut])
def search_blogs(q: str, db: Session = Depends(get_db)):
    results = db.query(Blog).filter(
        or_(
            Blog.title.ilike(f"%{q}%"),
            Blog.content.ilike(f"%{q}%"),
            Blog.tags.ilike(f"%{q}%")
        )
    ).all()

    return results

@app.get("/posts/{post_id}/comments/count")
def get_comment_count(post_id: int, db: Session = Depends(get_db)):

    count = db.query(Comment).filter(Comment.post_id == post_id).count()

    return {"count": count}

# ================== CREATE TABLES ==================
Base.metadata.create_all(bind=engine)