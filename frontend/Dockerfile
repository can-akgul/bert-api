# Node.js 18 Alpine image kullan
FROM node:18-alpine

# Çalışma dizinini ayarla
WORKDIR /app

# Package files kopyala
COPY package*.json ./

# Dependencies yükle (build için dev dependencies de gerekli)
RUN npm ci

# Uygulama dosyalarını kopyala
COPY . .

# Build et
RUN npm run build

# Port 3000'i expose et
EXPOSE 3000

# Preview server'ı başlat (production build'i serve eder)
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "3000"] 