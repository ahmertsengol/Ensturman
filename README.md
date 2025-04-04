# Voice Recorder Application

Kapsamlı bir ses kayıt uygulaması - hem web hem de mobil istemciler için gerçek zamanlı nota algılama, kullanıcı kimlik doğrulama ve kayıt yönetimi özellikleriyle.

## Proje Özellikleri

- **Ses Kaydetme:** Yüksek kaliteli ses kaydı (web ve mobil)
- **Gerçek Zamanlı Nota Algılama:** Web Audio API kullanarak müzikal notaları tespit etme
- **Kullanıcı Yönetimi:** Güvenli kayıt ve oturum açma sistemi
- **Kişisel Gösterge Paneli:** Kullanıcıların kayıtlarını yönetebilmesi
- **Çoklu Platform:** Web ve mobil uygulamaları ortak bir API'yi kullanır
- **Modern Arayüz:** Duyarlı ve kullanıcı dostu tasarım

## Proje Yapısı

Proje iki ana bileşenden oluşmaktadır:

### Web Uygulaması (`/Web`)

Node.js ve Express.js kullanılarak geliştirilmiş sunucu taraflı uygulama.

```
Web/
├── app.js                # Ana giriş noktası
├── config/               # Yapılandırma dosyaları (DB, Passport, Logger)
├── controllers/          # İş mantığı kontrolörleri
│   ├── authController.js # Kimlik doğrulama işlemleri
│   └── recordingController.js # Kayıt yönetimi işlemleri
├── middlewares/          # Middleware fonksiyonları
├── models/               # Veri modelleri (User, Recording)
├── public/               # Statik dosyalar (CSS, JS, görüntüler)
│   ├── css/              # Stil dosyaları
│   └── js/               # İstemci tarafı JavaScript
├── routes/               # Express rotaları
│   ├── index.js          # Ana rotalar
│   ├── auth.js           # Kimlik doğrulama rotaları
│   ├── recordings.js     # Kayıt yönetimi rotaları
│   └── api.js            # Mobil uygulama için API
├── uploads/              # Kullanıcı kayıtlarının depolandığı dizin
├── views/                # HTML şablonları
│   ├── index.html        # Ana sayfa
│   ├── dashboard.html    # Kullanıcı gösterge paneli
│   └── pitch-detection.html # Nota algılama sayfası
└── package.json          # Bağımlılıklar ve betikler
```

### Mobil Uygulama (`/Mobile`)

React Native ve Expo kullanılarak geliştirilen çapraz platform mobil uygulama.

```
Mobile/
├── app/                  # Ana uygulama dizini
│   ├── (tabs)/           # Ana sekme ekranları
│   │   ├── index.tsx     # Ana sayfa
│   │   ├── record.tsx    # Kayıt arayüzü
│   │   ├── explore.tsx   # Kayıtları keşfetme
│   │   └── profile.tsx   # Profil yönetimi
│   ├── (auth)/           # Kimlik doğrulama ekranları
│   ├── context/          # React Context sağlayıcıları
│   ├── services/         # API servisleri
│   └── models/           # Veri modelleri
├── components/           # Yeniden kullanılabilir bileşenler
├── assets/               # Görüntüler, fontlar ve diğer varlıklar
├── app.json              # Expo yapılandırması
└── package.json          # Bağımlılıklar ve betikler
```

## Kullanılan Teknolojiler

### Web Uygulaması
- **Node.js & Express:** Sunucu tarafı uygulama çerçevesi
- **Sequelize:** Veritabanı ORM aracı
- **PostgreSQL:** İlişkisel veritabanı
- **Passport.js:** Kimlik doğrulama middleware
- **Web Audio API:** Gerçek zamanlı ses işleme ve nota algılama
- **Winston & Morgan:** Loglama
- **Express Session:** Oturum yönetimi
- **bcrypt.js:** Şifre hashleme

### Mobil Uygulama
- **React Native:** Çapraz platform mobil geliştirme
- **Expo:** Geliştirme platformu
- **TypeScript:** Tip güvenli JavaScript
- **React Navigation:** Gezinme sistemi
- **Expo Audio:** Ses kayıt ve oynatma
- **React Context:** Durum yönetimi

## Kurulum

### Web Uygulaması
1. Web dizinine gidin:
```bash
cd Web
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

3. .env dosyası oluşturun:
```
PORT=3000
DB_HOST=localhost
DB_USER=postgres
DB_PASS=yourpassword
DB_NAME=voicerecorder
SESSION_SECRET=yoursecretkey
NODE_ENV=development
```

4. Uygulamayı başlatın:
```bash
npm run dev  # geliştirme modu
# VEYA
npm start    # üretim modu
```

5. Tarayıcınızda `http://localhost:3000` adresini açın

### Mobil Uygulama
1. Mobile dizinine gidin:
```bash
cd Mobile
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

3. Uygulamayı başlatın:
```bash
npm start
```

4. Expo Go uygulamasını kullanarak QR kodu tarayın veya bir emülatör kullanın

## API Endpoints

### Kimlik Doğrulama
- `POST /auth/register` - Yeni kullanıcı oluştur
- `POST /auth/login` - Kullanıcı girişi
- `GET /auth/logout` - Kullanıcı çıkışı

### Kayıtlar
- `GET /recordings` - Giriş yapan kullanıcının tüm kayıtlarını listele
- `GET /recordings/:id` - Belirli bir kaydı getir
- `POST /recordings` - Yeni kayıt oluştur
- `PUT /recordings/:id` - Kaydı güncelle
- `DELETE /recordings/:id` - Kaydı sil

### API (Mobil Erişim)
- `POST /api/auth/login` - Kullanıcı girişi (token döndürür)
- `GET /api/auth/check` - Kimlik doğrulama durumunu kontrol et
- `GET /api/recordings` - Kullanıcının kayıtlarını getir
- `POST /api/recordings` - Mobil uygulamadan yeni kayıt yükle

## Veritabanı Şeması

### Users Tablosu
- id (PK)
- username
- email
- password (hashlenmiş)
- createdAt
- updatedAt

### Recordings Tablosu
- id (PK)
- title
- description
- audioFile (dosya yolu)
- duration
- userId (FK to Users)
- createdAt
- updatedAt

## Katkıda Bulunma

1. Bu repository'yi fork edin
2. Kendi branch'inizi oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some amazing feature'`)
4. Branch'inize push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## Lisans

Bu proje MIT Lisansı altında lisanslanmıştır. Detaylar için LICENSE dosyasına bakın. 