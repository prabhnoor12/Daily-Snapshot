# Alembic setup steps

1. Edit `alembic.ini` and set your database URL:
   sqlalchemy.url = driver://user:pass@localhost/dbname

2. Ensure your models' Base is imported in `alembic/env.py`.

3. To create a migration:
   C:/my-saas-app/.venv/Scripts/python.exe -m alembic revision --autogenerate -m "Initial migration"

4. To apply migrations:
   C:/my-saas-app/.venv/Scripts/python.exe -m alembic upgrade head

Migration scripts will be stored in `backend/alembic/versions/`.
