from flask import request, jsonify, Blueprint
from controllers.item_controller import ItemController
import jwt
from functools import wraps
import os
import pymongo
from pymongo.errors import PyMongoError
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

itens = Blueprint('itens', __name__)

# OBS: O Limiter usa memoria local. Como o Gunicorn roda com 4 workers,
# cada worker conta separado e o limite real pode ficar ate 4x maior.
limiter = Limiter(key_func=get_remote_address, default_limits=["100 per minute"])

JWT_SECRET = os.environ.get("JWT_SECRET")
if not JWT_SECRET:
    raise RuntimeError("A variável de ambiente JWT_SECRET é obrigatória e não foi definida no Flask backend.")

# Conecta no Mongo pra consultar a blacklist
MONGODB_URI = os.environ.get("MONGODB_URI")
mongo_client = None
if MONGODB_URI:
    try:
        mongo_client = pymongo.MongoClient(MONGODB_URI, serverSelectionTimeoutMS=2000)
    except Exception as e:
        print(f"Aviso: Não foi possível conectar ao MongoDB para checagem de blacklist: {e}")

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]
            except IndexError:
                return jsonify({"erro": "Token malformatado"}), 401
        if not token:
            return jsonify({"erro": "Token ausente"}), 401

        # Checa se o token foi deslogado
        if mongo_client:
            try:
                db_mongo = mongo_client.get_default_database()
                blacklist_col = db_mongo["blacklists"]
                blacklisted = blacklist_col.find_one({"token": token})
                if blacklisted:
                    return jsonify({"erro": "Token revogado (sessão encerrada)"}), 401
            except PyMongoError as e:
                print(f"Erro ao verificar blacklist no MongoDB: {e}")
                return jsonify({"erro": "Erro interno do servidor ao verificar token."}), 500

        try:
            jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        except jwt.ExpiredSignatureError:
            return jsonify({"erro": "Token expirado"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"erro": "Token inválido"}), 401
        return f(*args, **kwargs)
    return decorated

# --- ENDPOINTS API JSON PARA O REACT ---

@itens.route("/api/itens", methods=["GET"])
@token_required
def api_listar_itens():
    items = ItemController.read()
    return jsonify([
        {
            "id": item.id,
            "nome": item.nome,
            "descricao": item.descricao,
            "categoria": item.categoria
        } for item in items
    ])

@itens.route("/api/itens/<int:id>", methods=["GET"])
@token_required
def api_obter_item(id):
    item = ItemController.read_id(id)
    if not item:
        return jsonify({"erro": "Item não localizado"}), 404
    return jsonify({
        "id": item.id,
        "nome": item.nome,
        "descricao": item.descricao,
        "categoria": item.categoria
    })

@itens.route("/api/itens", methods=["POST"])
@token_required
@limiter.limit("30 per minute")
def api_criar_item():
    data = request.json or {}
    nome = data.get('nome')
    descricao = data.get('descricao')
    categoria = data.get('categoria')
    
    if not nome or not descricao or not categoria:
        return jsonify({"erro": "Todos os campos (nome, descricao, categoria) são obrigatórios"}), 400
        
    nome_str = str(nome).strip()
    descricao_str = str(descricao).strip()
    categoria_str = str(categoria).strip()
        
    item = ItemController.create(nome_str, descricao_str, categoria_str)
    return jsonify({
        "id": item.id,
        "nome": item.nome,
        "descricao": item.descricao,
        "categoria": item.categoria
    }), 201

@itens.route("/api/itens/<int:id>", methods=["PUT"])
@token_required
@limiter.limit("30 per minute")
def api_atualizar_item(id):
    item = ItemController.read_id(id)
    if not item:
        return jsonify({"erro": "Item não localizado"}), 404
        
    data = request.json or {}
    nome = data.get('nome', item.nome)
    descricao = data.get('descricao', item.descricao)
    categoria = data.get('categoria', item.categoria)
    
    nome_str = str(nome).strip()
    descricao_str = str(descricao).strip()
    categoria_str = str(categoria).strip()
    
    updated_item = ItemController.update(id, nome_str, descricao_str, categoria_str)
    return jsonify({
        "id": updated_item.id,
        "nome": updated_item.nome,
        "descricao": updated_item.descricao,
        "categoria": updated_item.categoria
    })

@itens.route("/api/itens/<int:id>", methods=["DELETE"])
@token_required
@limiter.limit("20 per minute")
def api_deletar_item(id):
    item = ItemController.read_id(id)
    if not item:
        return jsonify({"erro": "Item não localizado"}), 404
        
    ItemController.delete(id)
    return jsonify({"msg": "Item deletado com sucesso"})
