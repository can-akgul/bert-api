# 🚀 Fake News Detection - Kurulum ve Konfigürasyon Rehberi

## 📋 İçindekiler
- [Sistem Gereksinimleri](#sistem-gereksinimleri)
- [Hızlı Başlangıç](#hızlı-başlangıç)
- [Tek Tek Container Kurulumu](#tek-tek-container-kurulumu)
- [Konfigürasyon Dosyaları](#konfigürasyon-dosyaları)
- [Şifre ve Kullanıcı Adı Değiştirme](#şifre-ve-kullanıcı-adı-değiştirme)
- [Container Yönetimi](#container-yönetimi)
- [Erişim Noktaları](#erişim-noktaları)
- [Sorun Giderme](#sorun-giderme)

---

## 🔧 Sistem Gereksinimleri

- **Docker**: 20.10 veya üzeri
- **Docker Compose**: 2.0 veya üzeri (opsiyonel)
- **RAM**: En az 4GB (önerilen 8GB)
- **Disk**: En az 10GB boş alan
- **Port'lar**: 80, 3000, 5432, 8000, 9999 portları açık olmalı

---

## ⚡ Hızlı Başlangıç

### 1. Environment Dosyası Oluşturma
```bash
# .env dosyası oluşturun (repo'da .env.example'dan kopyalayın)
cp .env.example .env

# .env dosyasını düzenleyin:
nano .env
```

### 2. Tüm Sistemi Başlatma
```bash
# 1. Database
docker run -d \
  --name postgresql-db \
  -p 5432:5432 \
  -e POSTGRES_DB=fake_news_db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres123 \
  -v postgres_data:/var/lib/postgresql/data \
  postgres:15

# 2. pgAdmin
docker run -d \
  --name pgadmin4 \
  -p 80:80 \
  -e PGADMIN_DEFAULT_EMAIL=admin@admin.com \
  -e PGADMIN_DEFAULT_PASSWORD=admin \
  dpage/pgadmin4

# 3. Portainer
docker run -d \
  --name portainer \
  -p 8000:8000 \
  -p 9443:9443 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v portainer_data:/data \
  portainer/portainer-ce:latest

# 4. Backend
docker build -t fake-news-backend-auth .
docker run -d \
  --name fake-news-backend-auth-app \
  -p 9999:9999 \
  --network host \
  -e DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/fake_news_db" \
  fake-news-backend-auth

# 5. Frontend
cd frontend
docker build -t fake-news-frontend .
docker run -d \
  --name fake-news-frontend-app \
  -p 3000:3000 \
  --network host \
  fake-news-frontend
cd ..
```

---

## 🐳 Tek Tek Container Kurulumu

### 1️⃣ PostgreSQL Database
```bash
docker run -d \
  --name postgresql-db \
  -p 5432:5432 \
  -e POSTGRES_DB=fake_news_db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres123 \
  -v postgres_data:/var/lib/postgresql/data \
  postgres:15
```

### 2️⃣ pgAdmin (Database Yönetimi)
```bash
docker run -d \
  --name pgadmin4 \
  -p 80:80 \
  -e PGADMIN_DEFAULT_EMAIL=admin@admin.com \
  -e PGADMIN_DEFAULT_PASSWORD=admin \
  dpage/pgadmin4
```

### 3️⃣ Portainer (Container Yönetimi)
```bash
docker run -d \
  --name portainer \
  -p 8000:8000 \
  -p 9443:9443 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v portainer_data:/data \
  portainer/portainer-ce:latest
```

### 4️⃣ Backend API
```bash
# Önce image'ı build edin
docker build -t fake-news-backend-auth .

# Container'ı başlatın
docker run -d \
  --name fake-news-backend-auth-app \
  -p 9999:9999 \
  --network host \
  -e DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/fake_news_db" \
  fake-news-backend-auth
```

### 5️⃣ Frontend UI
```bash
# Frontend dizinine geçin
cd frontend

# Image'ı build edin
docker build -t fake-news-frontend .

# Container'ı başlatın
docker run -d \
  --name fake-news-frontend-app \
  -p 3000:3000 \
  --network host \
  fake-news-frontend

# Ana dizine geri dönün
cd ..
```

---

## ⚙️ Konfigürasyon Dosyaları

### `.env` Dosyası (Ana Dizin)
```env
# AI Configuration
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
AGENT_SYSTEM=Rolün fake news detection. User sana bir metin girecek. Sen de bu metnin doğru olup olmadigini ölçeceksin.
AGENT_STYLE=Tek bir kelime yazacaksın: True veya False\n - Başa bir şey yazmayacaksın.

# Database Configuration
DATABASE_URL=postgresql://postgres:postgres123@localhost:5432/fake_news_db

# Security Configuration
JWT_SECRET_KEY=your_super_secret_jwt_key_here_change_in_production
```

### `vite.config.js` (Frontend Proxy Ayarları)
```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/predict': 'http://localhost:9999',
      '/generate': 'http://localhost:9999',
      '/auth': 'http://localhost:9999',
      '/history': 'http://localhost:9999'
    }
  },
  preview: {
    proxy: {
      '/predict': 'http://localhost:9999',
      '/generate': 'http://localhost:9999',
      '/auth': 'http://localhost:9999',
      '/history': 'http://localhost:9999'
    }
  }
})
```

---

## 🔐 Şifre ve Kullanıcı Adı Değiştirme

### PostgreSQL Database Değiştirme

#### Komut Satırında (Önerilen):
```bash
# Container çalıştırırken farklı şifreler kullanın
docker run -d \
  --name postgresql-db \
  -p 5432:5432 \
  -e POSTGRES_DB=your_database_name \
  -e POSTGRES_USER=your_username \
  -e POSTGRES_PASSWORD=your_secure_password \
  -v postgres_data:/var/lib/postgresql/data \
  postgres:15
```

#### .env Dosyasında:
```env
DATABASE_URL=postgresql://your_username:your_secure_password@localhost:5432/your_database_name
```

#### Backend'de (database.py):
Dosya: `database.py`
```python
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is required")
```

### pgAdmin Değiştirme

#### Komut Satırında:
```bash
docker run -d \
  --name pgadmin4 \
  -p 80:80 \
  -e PGADMIN_DEFAULT_EMAIL=your_email@domain.com \
  -e PGADMIN_DEFAULT_PASSWORD=your_secure_password \
  dpage/pgadmin4
```

### JWT Secret Key Değiştirme

#### .env Dosyasında:
```env
JWT_SECRET_KEY=your_very_long_and_secure_random_string_here_at_least_32_characters
```

#### Güvenli JWT Key Üretme:
```bash
# Python ile
python3 -c "import secrets; print(secrets.token_urlsafe(32))"

# OpenSSL ile
openssl rand -hex 32

# Node.js ile
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Gemini API Key Değiştirme

#### .env Dosyasında:
```env
GEMINI_API_KEY=your_gemini_api_key_from_google_ai_studio
```

#### API Key Alma:
1. [Google AI Studio](https://aistudio.google.com/) 'ya gidin
2. "Get API Key" butonuna tıklayın
3. Yeni key oluşturun
4. Key'i `.env` dosyasına ekleyin

---

## 🛠️ Container Yönetimi

### Durumu Kontrol Etme
```bash
# Tüm container'ları listele
docker ps

# Detaylı format
docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}"

# Sadece çalışan container'ların isimlerini listele
docker ps --format "{{.Names}}"
```

### Container'ları Durdurma
```bash
# Tek tek durdurma
docker stop postgresql-db
docker stop pgadmin4
docker stop portainer
docker stop fake-news-backend-auth-app
docker stop fake-news-frontend-app

# Tümünü durdurma
docker stop $(docker ps -q)
```

### Container'ları Silme
```bash
# Tek tek silme
docker rm postgresql-db
docker rm pgadmin4
docker rm portainer
docker rm fake-news-backend-auth-app
docker rm fake-news-frontend-app

# Tümünü silme
docker rm $(docker ps -aq)
```

### Container'ları Yeniden Başlatma
```bash
# Tek tek yeniden başlatma
docker restart postgresql-db
docker restart pgadmin4
docker restart portainer
docker restart fake-news-backend-auth-app
docker restart fake-news-frontend-app

# Tümünü yeniden başlatma
docker restart $(docker ps -q)
```

### Log'ları Görüntüleme
```bash
# Son 20 log kaydını göster
docker logs <container-name> --tail 20

# Real-time log takibi
docker logs <container-name> -f

# Örnekler
docker logs postgresql-db --tail 20
docker logs fake-news-backend-auth-app -f
```

### Container İçine Girme
```bash
# Bash shell ile
docker exec -it <container-name> /bin/bash

# PostgreSQL için
docker exec -it postgresql-db psql -U postgres -d fake_news_db

# Örnekler
docker exec -it fake-news-backend-auth-app /bin/bash
docker exec -it postgresql-db /bin/bash
```

### System Temizliği
```bash
# Kullanılmayan image'ları, container'ları ve network'leri temizle
docker system prune -f

# Volume'lar dahil her şeyi temizle (DİKKAT: Veriler silinir!)
docker system prune -a --volumes
```

---

## 🌐 Erişim Noktaları

| Servis | URL | Kullanıcı Adı | Şifre | Açıklama |
|--------|-----|---------------|-------|----------|
| **Frontend** | http://localhost:3000 | - | - | Ana web uygulaması |
| **Backend API** | http://localhost:9999 | - | - | REST API (JWT token gerekli) |
| **pgAdmin** | http://localhost:80 | admin@admin.com | admin | Database yönetimi |
| **Portainer** | http://localhost:8000 | - | - | Container yönetimi |
| **PostgreSQL** | localhost:5432 | postgres | postgres123 | Database (programatik erişim) |

### API Endpoint'leri
- `POST /auth/register` - Kullanıcı kaydı
- `POST /auth/login` - Kullanıcı girişi
- `GET /auth/me` - Profil bilgileri
- `POST /predict` - Haber doğruluk analizi
- `POST /generate` - Haber üretimi
- `GET /history/news` - Predict geçmişi
- `GET /history/generated` - Generate geçmişi

---

## 🔧 Sorun Giderme

### 1. Port Çakışması
```bash
# Port'u kullanan process'i bul
sudo lsof -i :3000
sudo lsof -i :9999
sudo lsof -i :5432

# Process'i sonlandır
sudo kill -9 <PID>
```

### 2. Container Başlatma Sorunları
```bash
# Container log'larını kontrol et
docker logs <container-name>

# Container'ı silip yeniden oluştur
docker stop <container-name>
docker rm <container-name>
# Yukarıdaki komutlarla yeniden başlat
```

### 3. Database Bağlantı Sorunları
```bash
# PostgreSQL container'ının çalıştığını kontrol et
docker ps | grep postgresql

# Database'e bağlantıyı test et
docker exec -it postgresql-db pg_isready -U postgres

# SQL shell'e gir
docker exec -it postgresql-db psql -U postgres -d fake_news_db
```

### 4. Backend Başlatma Sorunları
```bash
# Environment variable'ları kontrol et
docker exec -it fake-news-backend-auth-app env | grep -E "(GEMINI|JWT|DATABASE)"

# .env dosyasının doğru konumda olduğunu kontrol et
ls -la .env

# Backend log'larını kontrol et
docker logs fake-news-backend-auth-app --tail 50
```

### 5. Frontend Sorunları
```bash
# Frontend build log'larını kontrol et
docker logs fake-news-frontend-app --tail 50

# Proxy ayarlarını kontrol et
cat frontend/vite.config.js
```

### 6. pgAdmin Giriş Sorunları
```bash
# pgAdmin container'ını yeniden başlat
docker stop pgadmin4 && docker rm pgadmin4

docker run -d \
  --name pgadmin4 \
  -p 80:80 \
  -e PGADMIN_DEFAULT_EMAIL=admin@admin.com \
  -e PGADMIN_DEFAULT_PASSWORD=admin \
  dpage/pgadmin4

# 30 saniye bekleyip tekrar dene
```

### 7. Image Build Sorunları
```bash
# Docker cache'i temizle
docker system prune -f

# Image'ı cache olmadan build et
docker build --no-cache -t fake-news-backend-auth .
docker build --no-cache -t fake-news-frontend ./frontend
```

### 8. Network Sorunları
```bash
# Container'lar arası bağlantıyı test et
docker exec -it fake-news-backend-auth-app ping postgresql-db

# Host network modu kullanıyorsanız localhost'u test edin
docker exec -it fake-news-backend-auth-app curl http://localhost:5432
```

---

## 📝 Ek Notlar

### Güvenlik Uyarıları
1. **Production'da**:
   - Güçlü şifreler kullanın
   - CORS ayarlarını kısıtlayın
   - HTTPS kullanın
   - Database'i dış erişime kapatın

2. **API Key'ler**:
   - `.env` dosyasını Git'e eklemeyin
   - API key'leri düzenli olarak yenileyin
   - Rate limiting uygulayın

### Performance İpuçları
1. **Docker**:
   - Yeterli RAM ayırın (8GB+)
   - SSD kullanın
   - Docker Desktop'ta resource limit'lerini ayarlayın

2. **Database**:
   - Persistent volume kullanın
   - Düzenli backup alın
   - Index'leri optimize edin

### Backup ve Restore
```bash
# Database backup
docker exec postgresql-db pg_dump -U postgres fake_news_db > backup.sql

# Database restore
docker exec -i postgresql-db psql -U postgres fake_news_db < backup.sql

# Volume backup
docker run --rm -v postgres_data:/data -v $(pwd):/backup ubuntu cp -r /data /backup/postgres_backup
```

---

## 📞 Destek

Sorun yaşadığınızda:
1. Bu dokümandaki sorun giderme bölümünü kontrol edin
2. Container log'larını inceleyin
3. GitHub Issues'da benzer sorunları arayın
4. Yeni issue açın (log'larla birlikte)

---

**Son Güncelleme**: 2025-08-15 