from model.models import Item, db

class ItemController:
    @staticmethod
    def create(nome, descricao, categoria):
        novo_item = Item(nome=nome, descricao=descricao, categoria=categoria)
        db.session.add(novo_item)
        db.session.commit()
        return novo_item
    
    @staticmethod
    def read():
        return Item.query.all()
    
    @staticmethod
    def read_id(id):
        return Item.query.get(id)
    
    @staticmethod
    def update(id, nome, descricao, categoria):
        item = Item.query.get(id)
        if not item:
            return None
        item.nome = nome
        item.descricao = descricao
        item.categoria = categoria
        db.session.commit()
        return item
    
    @staticmethod
    def delete(id):
        item = Item.query.get(id)
        if not item:
            return False
        db.session.delete(item)
        db.session.commit()
        return True
