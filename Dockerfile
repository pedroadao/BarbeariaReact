FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG VITE_API_BASE_URL=http://localhost:8081
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

# Provedor OIDC (projeto Authentication) usado pela tela de login. Ajuste conforme
# o client registrado em Authentication/src/API/Startup/DevelopmentSeed.cs.
ARG VITE_AUTH_BASE_URL=https://localhost:7179
ENV VITE_AUTH_BASE_URL=${VITE_AUTH_BASE_URL}
ARG VITE_OIDC_CLIENT_ID=barbearia-spa-client
ENV VITE_OIDC_CLIENT_ID=${VITE_OIDC_CLIENT_ID}
ARG VITE_OIDC_REDIRECT_URI=http://localhost:5174/callback
ENV VITE_OIDC_REDIRECT_URI=${VITE_OIDC_REDIRECT_URI}
ARG VITE_OIDC_SCOPE="openid email profile offline_access"
ENV VITE_OIDC_SCOPE=${VITE_OIDC_SCOPE}

RUN npm run build

FROM nginx:1.27-alpine AS runtime

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
