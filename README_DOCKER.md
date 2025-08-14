# Fake News Detection - Docker Deployment

Bu rehber, Fake News Detection uygulamasını (Backend + Frontend) Docker container'ları olarak nasıl çalıştıracağınızı gösterir.

## Gereksinimler

- Docker
- Docker Compose
- `.env` dosyası (GEMINI_API_KEY ile)

## Kurulum ve Çalıştırma

### 1. Environment Variables

`.env` dosyanızda gerekli değişkenlerin olduğundan emin olun:

```bash
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
AGENT_SYSTEM=
AGENT_STYLE=
```

### 2. Docker Compose ile Çalıştırma (Önerilen)

```bash
# Tüm servisleri build et ve başlat
docker-compose up --build -d

# Logları izle
docker-compose logs -f

# Sadece backend logları
docker-compose logs -f fake-news-api

# Sadece frontend logları
docker-compose logs -f fake-news-frontend

# Servisleri durdur
docker-compose down
```

### 3. Manuel Docker ile Çalıştırma

#### Backend (API):
```bash
# Backend image'ı build et
docker build -t fake-news-api .

# Backend container'ı çalıştır
docker run -d \
  --name fake-news-detection-api \
  -p 9999:9999 \
  --env-file .env \
  fake-news-api
```

#### Frontend:
```bash
# Frontend image'ı build et
docker build -t fake-news-frontend ./frontend

# Frontend container'ı çalıştır (backend'e bağlı network ile)
docker network create fake-news-network
docker network connect fake-news-network fake-news-detection-api

docker run -d \
  --name fake-news-detection-frontend \
  -p 3000:3000 \
  --network fake-news-network \
  fake-news-frontend
```

### 4. Erişim Adresleri

Container'lar çalıştıktan sonra:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:9999
- **API Docs**: http://localhost:9999/docs

### 5. Test Komutları

#### News Generation
```bash
curl -X POST "http://localhost:9999/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "context": "technology",
    "style": "neutral",
    "length": "medium",
    "additional_context": "artificial intelligence"
  }'
```

#### News Prediction
```bash
curl -X POST "http://localhost:9999/predict" \
  -H "Content-Type: application/json" \
  -d '{
    "news": "Your news article text here"
  }'
```

## Container Yönetimi

```bash
# Tüm container'ların durumunu kontrol et
docker-compose ps

# Belirli container'a bağlan (debug için)
docker-compose exec fake-news-api bash
docker-compose exec fake-news-frontend sh

# Container'ları yeniden başlat
docker-compose restart

# Sadece frontend'i yeniden başlat
docker-compose restart fake-news-frontend

# Container'ları tamamen sil
docker-compose down -v
docker rmi fake-news-detection_fake-news-api
docker rmi fake-news-detection_fake-news-frontend
```

## Servis Detayları

### Backend (API)
- **Port**: 9999
- **Container Name**: fake-news-detection-api
- **Health Check**: Otomatik health check yapılandırıldı
- **Dependencies**: PyTorch, Transformers, FastAPI

### Frontend
- **Port**: 3000
- **Container Name**: fake-news-detection-frontend
- **Framework**: React + Vite
- **Build**: Production build ile Vite preview server

## Network Yapısı

Container'lar `fake-news-network` bridge network'ü üzerinde haberleşir:
- Frontend → Backend: `http://fake-news-api:9999`
- Dış erişim: localhost:3000 (Frontend), localhost:9999 (Backend)

## Önemli Notlar

1. **Model Dosyası**: `classifier.pt` dosyasının ana dizinde olduğundan emin olun
2. **CORS**: Backend tüm origin'lere izin verir (production'da değiştirin)
3. **Environment Variables**: Sensitive bilgileri `.env` dosyasında saklayın
4. **Dependencies**: Frontend build sırasında tüm dependencies yüklenir
5. **Network**: Container'lar arası iletişim için custom network kullanılır

## Troubleshooting

### Container başlamıyor
- `.env` dosyasının varlığını kontrol edin
- `classifier.pt` dosyasının varlığını kontrol edin
- Docker logs'u inceleyin: `docker-compose logs [service-name]`

### Frontend backend'e bağlanamıyor
- Network konfigürasyonunu kontrol edin
- Backend container'ının çalıştığını doğrulayın: `docker-compose ps`
- Vite proxy ayarlarını kontrol edin

### Port çakışması
- 3000 veya 9999 portları kullanımda ise `docker-compose.yml`'de değiştirin
- Örnek: `ports: - "8080:3000"` (frontend için)

### Memory issues
- Transformer model'ler ve Node.js build fazla RAM kullanabilir
- Docker Desktop'ta memory limit'i artırın
- Sadece gerekli servisleri çalıştırın 