# Usa a imagem oficial do Node.js
FROM node:18

# Instala o Git
RUN apt-get update && apt-get install -y git && apt-get clean && rm -rf /var/lib/apt/lists/*

# Define o diretório de trabalho no container
WORKDIR /usr/src/app

# Exponha a porta 3000 (caso necessário no futuro)
EXPOSE 3000

# Mantém o container rodando
CMD ["bash"]

# docker exec -it api-dev_node-api_1 sh