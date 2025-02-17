# Usar a versão mais recente estável do Node.js
FROM node:alpine

# Definir diretório de trabalho dentro do container
WORKDIR /app

# Instalar pacotes necessários (Git e CLI do Nest.js)
RUN apk add --no-cache git && \
    npm install -g @nestjs/cli

EXPOSE 3000

# Manter o container ativo
CMD ["tail", "-f", "/dev/null"]
