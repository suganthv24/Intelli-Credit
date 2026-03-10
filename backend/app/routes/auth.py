from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database.db import get_db
from app.database.models import User
import bcrypt
import jwt
from datetime import datetime, timedelta
import os

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.get("/health")
def auth_health():
    return {"status": "ok", "message": "Auth router is live"}

SECRET_KEY = os.getenv("JWT_SECRET", "super-secret-key-intelli-credit")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7 # 7 days

def get_password_hash(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

class SignupRequest(BaseModel):
    name: str
    email: str
    organization: str
    role: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/signup")
def signup(request: SignupRequest, db: Session = Depends(get_db)):
    try:
        # Check if user exists
        existing_user = db.query(User).filter(User.email == request.email).first()
        if existing_user:
            return {"status": "error", "detail": "Email already registered"}
            
        # Create new user
        hashed_password = get_password_hash(request.password)
        new_user = User(
            name=request.name,
            email=request.email,
            organization=request.organization,
            role=request.role,
            hashed_password=hashed_password
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        # Generate token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": str(new_user.id), "email": new_user.email}, expires_delta=access_token_expires
        )
        
        return {
            "status": "success",
            "user": {
                "id": new_user.id,
                "name": new_user.name,
                "email": new_user.email,
                "role": new_user.role
            },
            "access_token": access_token,
            "token_type": "bearer"
        }
    except Exception as e:
        import traceback
        error_msg = f"ERROR: {str(e)}\n{traceback.format_exc()}"
        with open("auth_error.log", "w") as f:
            f.write(error_msg)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/login")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    print(f"DEBUG LOGIN ATTEMPT: {request.email}")
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        print(f"DEBUG LOGIN FAIL: User {request.email} not found in database.")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
        
    # verify password
    print(f"DEBUG LOGIN FOUND USER: {user.email}, checking password...")
    if not user.hashed_password or not verify_password(request.password, user.hashed_password):
        print("DEBUG LOGIN FAIL: Password mismatch.")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
        
    print("DEBUG LOGIN SUCCESS")
        
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email}, expires_delta=access_token_expires
    )
    
    return {
        "status": "success",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role
        },
        "access_token": access_token,
        "token_type": "bearer"
    }
