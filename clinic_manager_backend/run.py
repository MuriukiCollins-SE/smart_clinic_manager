# run.py

from flask import Flask
from config import Config
from extensions import db, jwt, cors
from models import *
from flask_migrate import Migrate
from routes import register_routes

migrate = Migrate()  # <-- Add this globally

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    jwt.init_app(app)
    cors.init_app(app)
    migrate.init_app(app, db)  # <-- Important for migrations

    register_routes(app)
    return app

# Only needed if running this file directly (e.g., python run.py)
if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)
