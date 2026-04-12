# Stage build
FROM node:20 AS build
WORKDIR /app


COPY my-lib ./my-lib
COPY angular_fe ./angular_fe

# Crea i file environment
RUN mkdir -p /app/angular_fe/src/app/environments
RUN printf 'export const environment = {\n  production: false,\n  backendPort: 8080,\n  ssrBackendHost: "localhost",\n  hostMapping: {} as Record<string, string>,\n  forceBackendHost: null as string | null,\n};\n' > /app/angular_fe/src/app/environments/environment.ts
RUN printf 'export const environment = {\n  production: true,\n  backendPort: 8080,\n  ssrBackendHost: "localhost",\n  hostMapping: {} as Record<string, string>,\n  forceBackendHost: null as string | null,\n};\n' > /app/angular_fe/src/app/environments/environment.prod.ts





#RUN apt-get update && apt-get install -y build-essential python3 make g++
#RUN cd my-lib && rm -rf node_modules package-lock.json && npm install && npm run build

#RUN cd angular_fe && rm -rf node_modules package-lock.json && npm install
#RUN cd angular_fe && sed -i 's|C:/Users/popam/Desktop/FastBuyWaveDocker/my-lib/dist/my-lib-inside|../my-lib/dist/my-lib-inside|g' tsconfig.json
#RUN cd angular_fe && npm install @angular/localize@18
#RUN cd angular_fe && npx ng build --configuration=production

#RUN cd angular_fe && npm install http-server
WORKDIR /app/angular_fe/dist/angular_fe/server
ENTRYPOINT ["node", "server.mjs"]