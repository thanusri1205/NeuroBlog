from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    ForeignKey,
    Text,
    Boolean,
    UniqueConstraint
)
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base


# ================= USER MODEL =================
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)

    # 🔥 PROFILE FIELDS
    bio = Column(Text, nullable=True)
    profile_picture = Column(Text, nullable=True)

    # 🔥 RELATIONSHIP TO POSTS
    posts = relationship("Post", back_populates="user", cascade="all, delete")

    # 🔥 RELATIONSHIP TO LIKES
    likes = relationship("Like", back_populates="user", cascade="all, delete")

    # ✅ NEW: RELATIONSHIP TO COMMENTS
    comments = relationship("Comment", back_populates="user", cascade="all, delete")


# ================= POST MODEL =================
class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)

    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)

    # 🔥 RELATIONSHIP TO USER
    user = relationship("User", back_populates="posts")

    # ✅ RELATIONSHIP TO LIKES
    likes = relationship("Like", back_populates="post", cascade="all, delete")

    # ✅ NEW: RELATIONSHIP TO COMMENTS
    comments = relationship("Comment", back_populates="post", cascade="all, delete")


# ================= BLOG MODEL =================
class Blog(Base):
    __tablename__ = "blogs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    content = Column(Text)
    tags = Column(String)

    # (Left untouched as instructed)


# ================= LIKE MODEL =================
class Like(Base):
    __tablename__ = "likes"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"))
    post_id = Column(Integer, ForeignKey("posts.id"))

    is_like = Column(Boolean)

    # 🔒 PREVENT DUPLICATE REACTIONS
    __table_args__ = (
        UniqueConstraint("user_id", "post_id", name="unique_user_post"),
    )

    # 🔥 RELATIONSHIPS
    user = relationship("User", back_populates="likes")
    post = relationship("Post", back_populates="likes")


# ================= COMMENT MODEL =================
class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)

    content = Column(Text, nullable=False)

    user_id = Column(Integer, ForeignKey("users.id"))
    post_id = Column(Integer, ForeignKey("posts.id"))

    created_at = Column(DateTime, default=datetime.utcnow)

    # 🔥 RELATIONSHIPS
    user = relationship("User", back_populates="comments")
    post = relationship("Post", back_populates="comments")