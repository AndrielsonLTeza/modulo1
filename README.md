# 🛠️ Módulo 1 - Sistema de Autenticação

Este repositório contém um sistema completo de autenticação com frontend, backend e banco de dados MySQL, totalmente conteinerizado usando Docker Compose.

---

## 📦 Tecnologias

- **Backend:** Java Spring Boot
- **Frontend:** React (build servido via NGINX)
- **Banco de Dados:** MySQL 8
- **Orquestração:** Docker Compose

---

## 📂 Estrutura do Projeto
```
/
├── backend/
│ ├── src/
│ ├── pom.xml
│ └── Dockerfile
├── frontend/
│ ├── src/
│ ├── package.json
│ └── Dockerfile
├── mysql-init/
│ └── init.sql
└── docker-compose.yml
```
---

## ⚙️ Como Executar

### 1️⃣ Pré-requisitos

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/)

### 2️⃣ Build dos containers

```
docker compose build
```
3️⃣ Subir os serviços
```
docker compose up
```
ou em segundo plano:
```
docker compose up -d
```
4️⃣ Parar os serviços
```
docker compose down
```
🌐 Serviços Disponíveis
Serviço	Descrição	URL Local
backend	API Spring Boot	http://localhost:8080
frontend	App React + NGINX	http://localhost:3000
db	MySQL 8	localhost:3306

🗄️ Banco de Dados
Imagem: mysql:8

Database criado: authdb

Usuário: root

Senha: root

📜 Script de Inicialização
O container do MySQL roda o script mysql-init/init.sql automaticamente para criar as tabelas:

user

refresh_token

📝 Variáveis de Ambiente Importantes
Backend:
```
SPRING_DATASOURCE_URL=jdbc:mysql://db:3306/authdb
SPRING_DATASOURCE_USERNAME=root
SPRING_DATASOURCE_PASSWORD=root
```
MySQL:
```
MYSQL_ROOT_PASSWORD=root
MYSQL_DATABASE=authdb
```
