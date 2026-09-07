from main import SessionLocal, engine, Base, Profile, Category, Project, Media, Technology, User
from sqlalchemy import text
import bcrypt

def hash_password(password: str) -> str:
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    return hashed.decode('utf-8')

def setup_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # 1. Crear Administrador por defecto
    admin_user = "Berbeny"
    admin_pass = hash_password("Solo12!!")
    
    db.execute(
        text("INSERT OR IGNORE INTO users (username, hashed_password) VALUES (:user, :pass)"),
        {"user": admin_user, "pass": admin_pass}
    )

    # 2. Inicializar Perfil de Desarrollador
    existing_profile = db.query(Profile).first()
    if not existing_profile:
        profile = Profile(
            full_name="Carlos Andres Corrales Diaz",
            headline="Ingeniería de sistemas | Desarrollador Python & Backend | APIs REST ꞏ Automatización IA",
            bio="Especialista en desarrollo backend con Python, diseño y construcción de APIs RESTful de alto rendimiento, arquitecturas escalables, gestión de bases de datos relacionales y automatización inteligente con Inteligencia Artificial.",
            avatar_url="https://github.com/CorralesCarlosA.png",
            is_available=True,
            email="carlosandrescorralesdiaz@gmail.com",
            phone="+57 3107155767",
            linkedin_url="https://linkedin.com/",
            github_url="https://github.com/CorralesCarlosA?tab=repositories",
            location="Quibdó - Chocó - Colombia",
            career_start_year=2021,
            experience_years=5,
            skills="Python, FastAPI, Django, APIs REST, PostgreSQL, SQLite, Docker, Git, Automatización IA, React Native, JavaScript"
        )
        db.add(profile)

    # 3. Categorías iniciales
    cat_names = ['Páginas Web', 'Análisis de Datos', 'Aplicaciones Móviles', 'Ciencia de Datos']
    for cat_name in cat_names:
        db.execute(
            text("INSERT OR IGNORE INTO categories (name) VALUES (:name)"),
            {"name": cat_name}
        )
    db.commit()

    # 4. Proyectos Semilla (Seed) si la tabla está vacía
    if db.query(Project).count() == 0:
        cat_web = db.query(Category).filter(Category.name == 'Páginas Web').first()
        cat_analytics = db.query(Category).filter(Category.name == 'Análisis de Datos').first()
        cat_mobile = db.query(Category).filter(Category.name == 'Aplicaciones Móviles').first()

        p1 = Project(
            title="Sistema Inteligente de Cubicaje & Logística",
            description="Plataforma web integral para optimización de carga en vehículos de transporte, cálculo automático de peso neto, volumen ocupado y proyección de rentabilidad en tiempo real.",
            problem_document="Las empresas de transporte perdían hasta un 25% de capacidad de carga por mala distribución de peso. Desarrollé un algoritmo de cubicaje dinámico que maximiza la carga según volumen y límites legales de peso por eje.",
            repository_url="https://github.com/mi-usuario-dev/cubicaje-app",
            category_id=cat_web.id if cat_web else 1,
            votes_count=42,
            is_active=True
        )

        p2 = Project(
            title="Dashboard de Analítica Financiera en Tiempo Real",
            description="Plataforma de métricas avanzadas, gráficos de tendencia de ingresos, conversión automática de divisas y generación de reportes ejecutivos.",
            problem_document="Visibilidad deficiente de KPIs financieros en empresas de comercio electrónico. Implementé un pipeline de datos que centraliza las fuentes de pago y muestra gráficos analíticos interactivos.",
            repository_url="https://github.com/mi-usuario-dev/dashboard-financiero",
            category_id=cat_analytics.id if cat_analytics else 2,
            votes_count=35,
            is_active=True
        )

        p3 = Project(
            title="App Móvil de Gestión de Inventario & Pedidos",
            description="Aplicación móvil multiplataforma para clientes y vendedores con sincronización en tiempo real, chat integrado y catálogo digital.",
            problem_document="Pérdida de pedidos por falta de comunicación fluida con vendedores de campo. La solución incluye sincronización offline-first y notificaciones push inmediatas.",
            repository_url="https://github.com/mi-usuario-dev/app-inventario",
            category_id=cat_mobile.id if cat_mobile else 3,
            votes_count=58,
            is_active=True
        )

        db.add_all([p1, p2, p3])
        db.commit()

        # Imágenes asociadas
        m1 = Media(project_id=p1.id, file_path="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80", media_type="image")
        m2 = Media(project_id=p2.id, file_path="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80", media_type="image")
        m3 = Media(project_id=p3.id, file_path="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=800&q=80", media_type="image")
        db.add_all([m1, m2, m3])

    db.commit()
    db.close()
    print("Base de datos configurada e inicializada exitosamente.")

if __name__ == "__main__":
    setup_database()