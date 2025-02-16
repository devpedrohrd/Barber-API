FROM node:23

WORKDIR /app

# Instale o Git
RUN apt-get update && apt-get install -y git

# Copie os arquivos do projeto para o contêiner
COPY . .

# Instale as dependências do projeto (se houver)
COPY package*.json ./
RUN npm install

# Exponha a porta da sua aplicação (se necessário)
EXPOSE 3000

# Comando para iniciar sua aplicação
CMD ["npm", "start"]