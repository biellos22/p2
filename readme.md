# Atividade de Frontend e Integração com Backend

**Autor:** Gabriel Victor

Este projeto é uma aplicação desenvolvida com React no frontend e duas APIs no backend, todas integradas em containers Docker usando Docker Compose.

- **Frontend (React)**: Desenvolvido com React + Tailwind CSS v4, servido pelo Nginx na porta `8080`.
- **Backend Node.js (Express)**: Responsável pela autenticação (JWT) e gerenciamento (CRUD) de usuários, usando MongoDB.
- **Backend Flask (Python)**: Responsável pelo CRUD de itens de estoque, usando banco de dados SQLite.
- **MongoDB**: Banco de dados NoSQL rodando em container para salvar os usuários.

---

## Como Rodar o Projeto

1. Certifique-se de que o Docker e o Docker Compose estão instalados.
2. Clone o repositório:
   ```bash
   git clone <url-do-seu-repositorio>
   cd <pasta-do-projeto>
   ```
3. Crie e configure o arquivo `.env` a partir do exemplo (obrigatório para rodar):
   ```bash
   cp .env.example .env
   ```
   Abra o arquivo `.env` e defina um segredo forte em `JWT_SECRET` e as credenciais desejadas para o banco de dados.

4. Inicie os containers com o Docker Compose:
   ```bash
   docker-compose up --build
   ```

5. Acesse no navegador:
   - Frontend: [http://localhost:8080](http://localhost:8080)
   - O Nginx redireciona as requisições `/api/*` e `/api-flask/*` internamente para os backends corretos, evitando problemas com CORS.

---

## Estrutura do Projeto

- `/meu-app`: Frontend React + Vite + Tailwind v4.
- `/backend`: API Express Node.js.
- `/backend/FlaskCrud`: API Python Flask com SQLite.
- `docker-compose.yml`: Orquestração de todos os serviços.

---

## Configuração do .env

O arquivo `.env` define as credenciais e segredos da aplicação:
```env
JWT_SECRET=sua_chave_secreta
MONGO_INITDB_ROOT_USERNAME=admin
MONGO_INITDB_ROOT_PASSWORD=senha_do_banco
MONGODB_URI=mongodb://admin:senha_do_banco@mongodb:27017/estoque_central?authSource=admin
```

---

## Usuário Padrão (Seed)

Ao subir os containers pela primeira vez, o MongoDB é populado automaticamente com o administrador padrão para acesso:
- **Usuário**: `admin`
- **Senha**: `admin`
- **Função**: `admin`

---

## Endpoints das APIs

### Autenticação e Usuários (Express - Porta Interna 3000)
- `POST /api/login`: Autentica e gera o token JWT.
- `POST /api/logout`: Efetua o logout e insere o token na blacklist.
- `POST /api/user`: Cadastro de novo usuário (Apenas administradores).
- `GET /api/user`: Lista usuários cadastrados (Apenas administradores).
- `PUT /api/user/:id`: Atualização de usuário (Apenas administradores).
- `DELETE /api/user/:id`: Remoção de usuário (Apenas administradores).

### Gerenciamento de Itens (Flask - Porta Interna 5000)
- `GET /api-flask/api/itens`: Retorna todos os itens (Requer autenticação JWT).
- `GET /api-flask/api/itens/<id>`: Detalhes de um item (Requer autenticação).
- `POST /api-flask/api/itens`: Cadastra um item (Requer autenticação).
- `PUT /api-flask/api/itens/<id>`: Atualiza um item (Requer autenticação).
- `DELETE /api-flask/api/itens/<id>`: Remove um item (Requer autenticação).

---

## Testes Automatizados

### Backend Node.js
Para rodar os testes de hash de senha localmente:
```bash
cd backend
npm install
npm run test
```

### Backend Flask
Para rodar os testes de rotas/CRUD localmente:
```bash
cd backend/FlaskCrud
pip install -r requirements.txt
python -m unittest discover -s tests
```
Ou rodando pelo container do Docker Compose ativo:
```bash
docker-compose exec backend-flask python -m unittest discover -s tests
```

---

## Configuração de HTTPS em Produção

Caso necessite habilitar HTTPS (SSL/TLS):
1. Crie uma pasta `certs` na raiz do projeto e adicione os arquivos `server.key` e `server.crt`. Para testes locais:
   ```bash
   mkdir certs
   openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout certs/server.key -out certs/server.crt
   ```
2. No arquivo `meu-app/nginx.conf`, descomente o bloco final contendo as configurações de HTTPS/SSL.
3. No arquivo `docker-compose.yml`, no serviço `frontend`, descomente as linhas referentes à porta `8443` e ao volume do diretório `./certs`.
4. Reinicie os containers com `docker-compose up --build`. A aplicação estará disponível em `https://localhost:8443`.
