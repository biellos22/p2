import unittest
import json
import os
import sys

# Adiciona o diretório raiz do FlaskCrud ao sys.path para importações funcionarem corretamente
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import jwt
from app import app, db
from model.models import Item

class ItemApiTestCase(unittest.TestCase):
    def setUp(self):
        app.config['TESTING'] = True
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        self.client = app.test_client()
        self.app_context = app.app_context()
        self.app_context.push()
        db.create_all()
        
        # Define segredo JWT de teste
        self.jwt_secret = "test_jwt_secret"
        
        # Patch JWT_SECRET nas rotas
        import routes.item_routes
        routes.item_routes.JWT_SECRET = self.jwt_secret

    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.app_context.pop()

    def get_auth_headers(self, role="admin"):
        token = jwt.encode({"id": 1, "funcao": role}, self.jwt_secret, algorithm="HS256")
        # Dependendo da versão do PyJWT, o retorno pode ser string ou bytes
        token_str = token if isinstance(token, str) else token.decode('utf-8')
        return {
            "Authorization": f"Bearer {token_str}",
            "Content-Type": "application/json"
        }

    def test_create_item_success(self):
        headers = self.get_auth_headers()
        payload = {
            "nome": "Computador Dell",
            "descricao": "Core i7 16GB RAM SSD",
            "categoria": "Hardware"
        }
        response = self.client.post("/api/itens", headers=headers, data=json.dumps(payload))
        self.assertEqual(response.status_code, 201)
        data = json.loads(response.data)
        self.assertEqual(data["nome"], "Computador Dell")
        self.assertEqual(data["descricao"], "Core i7 16GB RAM SSD")
        self.assertEqual(data["categoria"], "Hardware")
        self.assertIn("id", data)

    def test_create_item_missing_fields(self):
        headers = self.get_auth_headers()
        payload = {
            "nome": "Teclado Mecânico"
            # descricao e categoria faltando
        }
        response = self.client.post("/api/itens", headers=headers, data=json.dumps(payload))
        self.assertEqual(response.status_code, 400)
        data = json.loads(response.data)
        self.assertIn("erro", data)

    def test_list_items(self):
        # Cadastra dois itens no banco direto
        item1 = Item(nome="Item A", descricao="Desc A", categoria="Cat A")
        item2 = Item(nome="Item B", descricao="Desc B", categoria="Cat B")
        db.session.add(item1)
        db.session.add(item2)
        db.session.commit()

        headers = self.get_auth_headers()
        response = self.client.get("/api/itens", headers=headers)
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(len(data), 2)
        self.assertEqual(data[0]["nome"], "Item A")
        self.assertEqual(data[1]["nome"], "Item B")

    def test_get_item_by_id(self):
        item = Item(nome="Item Unico", descricao="Descricao Unica", categoria="Categoria Unica")
        db.session.add(item)
        db.session.commit()

        headers = self.get_auth_headers()
        response = self.client.get(f"/api/itens/{item.id}", headers=headers)
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data["nome"], "Item Unico")

        # Testa ID inexistente
        response_missing = self.client.get("/api/itens/999", headers=headers)
        self.assertEqual(response_missing.status_code, 404)

    def test_update_item(self):
        item = Item(nome="Item Antigo", descricao="Desc Antiga", categoria="Cat Antiga")
        db.session.add(item)
        db.session.commit()

        headers = self.get_auth_headers()
        payload = {
            "nome": "Item Atualizado",
            "descricao": "Desc Atualizada",
            "categoria": "Cat Atualizada"
        }
        response = self.client.put(f"/api/itens/{item.id}", headers=headers, data=json.dumps(payload))
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data["nome"], "Item Atualizado")

    def test_delete_item(self):
        item = Item(nome="Deletar", descricao="Para Deletar", categoria="Lixo")
        db.session.add(item)
        db.session.commit()

        headers = self.get_auth_headers()
        response = self.client.delete(f"/api/itens/{item.id}", headers=headers)
        self.assertEqual(response.status_code, 200)
        
        # Tenta buscar deletado
        response_get = self.client.get(f"/api/itens/{item.id}", headers=headers)
        self.assertEqual(response_get.status_code, 404)

    def test_unauthorized_access(self):
        # Requisição sem token JWT no header Authorization
        response = self.client.get("/api/itens")
        self.assertEqual(response.status_code, 401)

if __name__ == '__main__':
    unittest.main()
