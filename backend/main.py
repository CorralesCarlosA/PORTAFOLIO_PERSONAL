from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy import (
    create_engine,
    Column,
    Integer,
    String,
    Text,
    ForeignKey,
    Table,
    Boolean,
)
from sqlalchemy.orm import declarative_base, sessionmaker, Session, relationship
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
import bcrypt
import os
import shutil

DATABASE_URL = "sqlite:///./portfolio.db"
SECRET_KEY = os.getenv("SECRET_KEY") or "development-only-secret-change-me"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 600

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# --- MODELOS ORM ---
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)


class Profile(Base):
    __tablename__ = "profile"
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, default="Carlos Andres Corrales Diaz")
    headline = Column(
        String,
        default="Ingeniería de sistemas | Desarrollador Python & Backend | APIs REST ꞏ Automatización IA",
    )
    bio = Column(
        Text,
        default="Especialista en desarrollo backend con Python, diseño y construcción de APIs RESTful de alto rendimiento, arquitecturas escalables, gestión de bases de datos relacionales y automatización inteligente con Inteligencia Artificial.",
    )
    avatar_url = Column(String, default="https://github.com/CorralesCarlosA.png")
    is_available = Column(Boolean, default=True)
    email = Column(String, default="carlosandrescorralesdiaz@gmail.com")
    phone = Column(String, default="+57 3107155767")
    linkedin_url = Column(
        String,
        default="https://www.linkedin.com/in/carlos-andres-corrales-diaz-0425aa3b0/",
    )
    github_url = Column(
        String, default="https://github.com/CorralesCarlosA?tab=repositories"
    )
    location = Column(String, default="Quibdó - Chocó - Colombia")
    career_start_year = Column(Integer, default=2021)
    experience_years = Column(Integer, default=5)
    skills = Column(
        Text,
        default="Python, FastAPI, Django, APIs REST, PostgreSQL, SQLite, Docker, Git, Automatización IA, React Native, JavaScript",
    )


class Category(Base):
    __tablename__ = "categories"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    projects = relationship("Project", back_populates="category")


project_technologies = Table(
    "project_technologies",
    Base.metadata,
    Column(
        "project_id",
        Integer,
        ForeignKey("projects.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "technology_id",
        Integer,
        ForeignKey("technologies.id", ondelete="CASCADE"),
        primary_key=True,
    ),
)


class Technology(Base):
    __tablename__ = "technologies"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    icon_url = Column(String, nullable=False)


class Project(Base):
    __tablename__ = "projects"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    problem_document = Column(Text)
    repository_url = Column(String, nullable=False)
    image_url = Column(String, default="")
    category_id = Column(Integer, ForeignKey("categories.id"))
    votes_count = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    is_idea = Column(Boolean, default=False)

    category = relationship("Category", back_populates="projects")
    media = relationship("Media", back_populates="project", cascade="all, delete")
    comments = relationship("Comment", back_populates="project", cascade="all, delete")
    technologies = relationship("Technology", secondary=project_technologies)


class Media(Base):
    __tablename__ = "media"
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    file_path = Column(String, nullable=False)
    media_type = Column(String, nullable=False)
    project = relationship("Project", back_populates="media")


class Comment(Base):
    __tablename__ = "comments"
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    author = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    project = relationship("Project", back_populates="comments")


class PrivateMessage(Base):
    __tablename__ = "private_messages"
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    sender_email = Column(String, nullable=False)
    message = Column(Text, nullable=False)


Base.metadata.create_all(bind=engine)


def auto_migrate():
    try:
        import sqlite3

        conn = sqlite3.connect("portfolio.db")
        c = conn.cursor()
        c.execute("PRAGMA table_info(profile)")
        p_cols = [col[1] for col in c.fetchall()]
        if "career_start_year" not in p_cols:
            c.execute(
                "ALTER TABLE profile ADD COLUMN career_start_year INTEGER DEFAULT 2021"
            )
        if "experience_years" not in p_cols:
            c.execute(
                "ALTER TABLE profile ADD COLUMN experience_years INTEGER DEFAULT 5"
            )
        if "skills" not in p_cols:
            c.execute(
                "ALTER TABLE profile ADD COLUMN skills TEXT DEFAULT 'Python, FastAPI, Django, APIs REST, PostgreSQL, SQLite, Docker, Git, Automatización IA, React Native, JavaScript'"
            )

        c.execute("PRAGMA table_info(projects)")
        proj_cols = [col[1] for col in c.fetchall()]
        if "is_idea" not in proj_cols:
            c.execute("ALTER TABLE projects ADD COLUMN is_idea BOOLEAN DEFAULT 0")
        if "image_url" not in proj_cols:
            c.execute("ALTER TABLE projects ADD COLUMN image_url TEXT DEFAULT ''")
        conn.commit()
        conn.close()
    except Exception as e:
        print("Auto-migrate note:", e)


auto_migrate()

app = FastAPI(title="Portfolio API", docs_url=None, redoc_url=None)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# --- AUTENTICACIÓN ---
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


def verify_password(plain_password, hashed_password):
    return bcrypt.checkpw(
        plain_password.encode("utf-8"), hashed_password.encode("utf-8")
    )


def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Token inválido")
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido")
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise HTTPException(status_code=401, detail="Usuario no encontrado")
    return user


@app.post("/token")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Usuario o contraseña incorrectos")
    token = create_access_token(data={"sub": user.username})
    return {"access_token": token, "token_type": "bearer"}


# --- ENDPOINTS PÚBLICOS DE PERFIL Y CONTACTO ---
@app.get("/profile")
def get_profile(db: Session = Depends(get_db)):
    profile = db.query(Profile).first()
    if not profile:
        profile = Profile()
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile


@app.get("/categories")
def get_categories(db: Session = Depends(get_db)):
    return db.query(Category).all()


@app.get("/projects")
def get_projects(db: Session = Depends(get_db)):
    # Solo proyectos activos terminados para clientes
    projects = (
        db.query(Project)
        .filter(Project.is_active.is_(True), Project.is_idea.is_(False))
        .all()
    )
    result = []
    for p in projects:
        result.append(
            {
                "id": p.id,
                "title": p.title,
                "description": p.description,
                "problem_document": p.problem_document,
                "repository_url": p.repository_url,
                "image_url": p.image_url or "",
                "category_id": p.category_id,
                "category_name": p.category.name if p.category else "",
                "votes_count": p.votes_count,
                "is_active": p.is_active,
                "is_idea": False,
                "media": [
                    {"id": m.id, "file_path": m.file_path, "media_type": m.media_type}
                    for m in p.media
                ],
                "technologies": [
                    {"id": t.id, "name": t.name, "icon_url": t.icon_url}
                    for t in p.technologies
                ],
                "comments": [
                    {"id": c.id, "author": c.author, "content": c.content}
                    for c in p.comments
                ],
            }
        )
    return result


@app.get("/ideas")
def get_ideas(db: Session = Depends(get_db)):
    # Solo ideas de desarrollo activas
    ideas = (
        db.query(Project)
        .filter(Project.is_active.is_(True), Project.is_idea.is_(True))
        .all()
    )
    result = []
    for p in ideas:
        result.append(
            {
                "id": p.id,
                "title": p.title,
                "description": p.description,
                "problem_document": p.problem_document,
                "repository_url": p.repository_url,
                "image_url": p.image_url or "",
                "category_id": p.category_id,
                "category_name": p.category.name if p.category else "Innovación",
                "votes_count": p.votes_count,
                "is_active": p.is_active,
                "is_idea": True,
                "media": [
                    {"id": m.id, "file_path": m.file_path, "media_type": m.media_type}
                    for m in p.media
                ],
                "technologies": [
                    {"id": t.id, "name": t.name, "icon_url": t.icon_url}
                    for t in p.technologies
                ],
                "comments": [
                    {"id": c.id, "author": c.author, "content": c.content}
                    for c in p.comments
                ],
            }
        )
    return result


@app.post("/projects/{project_id}/vote")
def vote_project(project_id: int, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    project.votes_count += 1
    db.commit()
    return {"votes": project.votes_count}


@app.post("/projects/{project_id}/comment")
def add_comment(
    project_id: int,
    author: str = Form(...),
    content: str = Form(...),
    db: Session = Depends(get_db),
):
    comment = Comment(project_id=project_id, author=author, content=content)
    db.add(comment)
    db.commit()
    return {"status": "Comentario agregado"}


@app.post("/projects/{project_id}/message")
def send_private_message(
    project_id: int,
    sender_email: str = Form(...),
    message: str = Form(...),
    db: Session = Depends(get_db),
):
    pm = PrivateMessage(
        project_id=project_id, sender_email=sender_email, message=message
    )
    db.add(pm)
    db.commit()
    return {"status": "Mensaje enviado"}


@app.post("/contact")
def send_general_contact(
    sender_email: str = Form(...),
    message: str = Form(...),
    db: Session = Depends(get_db),
):
    pm = PrivateMessage(project_id=None, sender_email=sender_email, message=message)
    db.add(pm)
    db.commit()
    return {"status": "Mensaje de contacto enviado"}


# --- ENDPOINTS PANEL ADMIN (RUTAS PROTEGIDAS) ---


@app.post("/admin/profile")
def update_profile(
    full_name: str = Form(...),
    headline: str = Form(...),
    bio: str = Form(...),
    is_available: bool = Form(True),
    email: str = Form(...),
    phone: str = Form(...),
    linkedin_url: str = Form(...),
    github_url: str = Form(...),
    location: str = Form(""),
    career_start_year: Optional[int] = Form(None),
    experience_years: Optional[int] = Form(None),
    skills: Optional[str] = Form(None),
    avatar_url: Optional[str] = Form(None),
    avatar: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = db.query(Profile).first()
    if not profile:
        profile = Profile()
        db.add(profile)

    profile.full_name = full_name
    profile.headline = headline
    profile.bio = bio
    profile.is_available = is_available
    profile.email = email
    profile.phone = phone
    profile.linkedin_url = linkedin_url
    profile.github_url = github_url
    profile.location = location

    if career_start_year is not None:
        profile.career_start_year = career_start_year
    if experience_years is not None:
        profile.experience_years = experience_years
    if skills is not None:
        profile.skills = skills
    if avatar_url and avatar_url.strip():
        profile.avatar_url = avatar_url.strip()

    if avatar and avatar.filename:
        filename = f"profile_{datetime.now().timestamp()}_{avatar.filename}"
        filepath = os.path.join("uploads", filename)
        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(avatar.file, buffer)
        profile.avatar_url = f"/uploads/{filename}"

    db.commit()
    db.refresh(profile)
    return profile


@app.get("/admin/projects")
def admin_get_all_projects(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    projects = db.query(Project).all()
    result = []
    for p in projects:
        result.append(
            {
                "id": p.id,
                "title": p.title,
                "description": p.description,
                "problem_document": p.problem_document,
                "repository_url": p.repository_url,
                "image_url": p.image_url or "",
                "category_id": p.category_id,
                "category_name": p.category.name if p.category else "",
                "votes_count": p.votes_count,
                "is_active": p.is_active,
                "is_idea": p.is_idea,
                "media": [
                    {"id": m.id, "file_path": m.file_path, "media_type": m.media_type}
                    for m in p.media
                ],
                "technologies": [
                    {"id": t.id, "name": t.name, "icon_url": t.icon_url}
                    for t in p.technologies
                ],
                "comments": [
                    {"id": c.id, "author": c.author, "content": c.content}
                    for c in p.comments
                ],
            }
        )
    return result


@app.post("/admin/projects")
def create_project(
    title: str = Form(...),
    description: str = Form(...),
    repository_url: str = Form(...),
    category_id: int = Form(...),
    problem_document: str = Form(""),
    image_url: Optional[str] = Form(None),
    is_active: bool = Form(True),
    is_idea: bool = Form(False),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    project = Project(
        title=title,
        description=description,
        repository_url=repository_url,
        image_url=image_url.strip() if image_url and image_url.strip() else "",
        category_id=category_id,
        problem_document=problem_document,
        is_active=is_active,
        is_idea=is_idea,
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


@app.put("/admin/projects/{project_id}")
def update_project(
    project_id: int,
    title: str = Form(...),
    description: str = Form(...),
    repository_url: str = Form(...),
    category_id: int = Form(...),
    problem_document: str = Form(""),
    image_url: Optional[str] = Form(None),
    is_active: bool = Form(True),
    is_idea: bool = Form(False),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Proyecto o idea no encontrada")
    project.title = title
    project.description = description
    project.repository_url = repository_url
    project.category_id = category_id
    project.problem_document = problem_document
    project.is_active = is_active
    project.is_idea = is_idea
    if image_url is not None:
        project.image_url = image_url.strip() if image_url.strip() else ""
    db.commit()
    db.refresh(project)
    return project


@app.put("/admin/projects/{project_id}/status")
def toggle_project_status(
    project_id: int,
    is_active: bool = Form(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    project.is_active = is_active
    db.commit()
    return {"status": "Estado actualizado", "is_active": project.is_active}


@app.delete("/admin/projects/{project_id}")
def delete_project(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    db.delete(project)
    db.commit()
    return {"status": "Proyecto eliminado"}


@app.post("/admin/categories")
def create_category(
    name: str = Form(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    category = Category(name=name)
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


@app.delete("/admin/categories/{category_id}")
def delete_category(
    category_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cat = db.query(Category).filter(Category.id == category_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    db.delete(cat)
    db.commit()
    return {"status": "Categoría eliminada"}


@app.get("/admin/messages")
def get_private_messages(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    return db.query(PrivateMessage).all()


@app.post("/admin/projects/{project_id}/media")
def upload_media(
    project_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    file_ext = file.filename.split(".")[-1].lower()
    media_type = "video" if file_ext in ["mp4", "webm", "mov"] else "image"
    filename = f"{project_id}_{datetime.now().timestamp()}_{file.filename}"
    filepath = os.path.join("uploads", filename)

    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    media = Media(
        project_id=project_id, file_path=f"/uploads/{filename}", media_type=media_type
    )
    db.add(media)
    db.commit()
    return {"status": "Media subida con éxito", "path": media.file_path}
