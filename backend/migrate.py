import sqlite3
import bcrypt

def run_migration():
    conn = sqlite3.connect('portfolio.db')
    c = conn.cursor()

    # 1. Migrar tabla profile si no existen columnas
    c.execute('PRAGMA table_info(profile)')
    cols = [col[1] for col in c.fetchall()]
    if 'career_start_year' not in cols:
        c.execute('ALTER TABLE profile ADD COLUMN career_start_year INTEGER DEFAULT 2021')
    if 'experience_years' not in cols:
        c.execute('ALTER TABLE profile ADD COLUMN experience_years INTEGER DEFAULT 5')
    if 'skills' not in cols:
        c.execute("ALTER TABLE profile ADD COLUMN skills TEXT DEFAULT 'Python, FastAPI, Django, APIs REST, PostgreSQL, SQLite, Docker, Git, Automatización IA, React Native, JavaScript'")

    # 2. Migrar tabla projects para soportar is_idea
    c.execute('PRAGMA table_info(projects)')
    p_cols = [col[1] for col in c.fetchall()]
    if 'is_idea' not in p_cols:
        c.execute('ALTER TABLE projects ADD COLUMN is_idea BOOLEAN DEFAULT 0')

    # 3. Registrar o actualizar usuario Berbeny
    pwd_bytes = 'Solo12!!'.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pwd_bytes, salt).decode('utf-8')

    c.execute('SELECT id FROM users WHERE username = ?', ('Berbeny',))
    existing_user = c.fetchone()
    if existing_user:
        c.execute('UPDATE users SET hashed_password = ? WHERE username = ?', (hashed, 'Berbeny'))
    else:
        c.execute('INSERT INTO users (username, hashed_password) VALUES (?, ?)', ('Berbeny', hashed))

    # 4. Actualizar perfil existente con datos reales de Carlos y foto real
    c.execute('''
        UPDATE profile SET
            full_name = ?,
            headline = ?,
            bio = ?,
            avatar_url = ?,
            email = ?,
            phone = ?,
            linkedin_url = ?,
            github_url = ?,
            location = ?,
            career_start_year = ?,
            experience_years = ?,
            skills = ?
        WHERE id = 1
    ''', (
        'Carlos Andres Corrales Diaz',
        'Ingeniería de sistemas | Desarrollador Python & Backend | APIs REST ꞏ Automatización IA',
        'Especialista en desarrollo backend con Python, diseño y construcción de APIs RESTful de alto rendimiento, arquitecturas escalables, gestión de bases de datos relacionales y automatización inteligente con Inteligencia Artificial.',
        'https://github.com/CorralesCarlosA.png',
        'carlosandrescorralesdiaz@gmail.com',
        '+57 3107155767',
        'https://linkedin.com/',
        'https://github.com/CorralesCarlosA?tab=repositories',
        'Quibdó - Chocó - Colombia',
        2021,
        5,
        'Python, FastAPI, Django, APIs REST, PostgreSQL, SQLite, Docker, Git, Automatización IA, React Native, JavaScript'
    ))

    # 5. Si no hay una idea de ejemplo en projects con is_idea = 1, crear una idea semilla
    c.execute('SELECT id FROM projects WHERE is_idea = 1')
    idea_exists = c.fetchone()
    if not idea_exists:
        c.execute('''
            INSERT INTO projects (title, description, problem_document, repository_url, category_id, votes_count, is_active, is_idea)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            'Plataforma de Agentes de IA para Auditoría Automatizada de Código',
            'Sistema distribuido que analiza repositorios en tiempo real usando LLMs para detectar vulnerabilidades de seguridad y proponer correcciones automáticas.',
            'Problema: Las revisiones manuales de seguridad toman horas y dejan pasar vectores críticos. Solución: Un pipeline backend en FastAPI con modelos locales que auditan commits y pull requests en milisegundos.',
            'https://github.com/CorralesCarlosA?tab=repositories',
            1,
            12,
            1,
            1
        ))

    conn.commit()

    c.execute('SELECT id, username FROM users')
    print('Usuarios registrados en BD:', c.fetchall())
    c.execute('SELECT id, full_name, avatar_url, career_start_year, experience_years, skills FROM profile')
    print('Perfil actualizado en BD:', c.fetchall())
    conn.close()
    print('Migración completada con éxito!')

if __name__ == '__main__':
    run_migration()
