import os
from flask import Flask
from routes.item_routes import itens, limiter
from model.models import db

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///db.sqlite'

limiter.init_app(app)
db.init_app(app)
app.register_blueprint(itens)
with app.app_context():
    db.create_all()

if __name__ == "__main__":
    # O modo debug agora é desativado por padrão (False), mas configurável via variável de ambiente
    debug_mode = os.environ.get("FLASK_DEBUG", "False").lower() in ("true", "1")
    app.run(host="0.0.0.0", port=5000, debug=debug_mode)