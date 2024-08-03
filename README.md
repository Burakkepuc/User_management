# WebSocket Destekli Kullanıcı Yönetim Sistemi

## Genel Bakış

Bu proje, kullanıcı kaydı, giriş, profil yönetimi ve kullanıcı beğenme sistemi içeren bir web uygulamasıdır. JWT kimlik doğrulaması kullanır ve gerçek zamanlı bildirimler için WebSocket kullanır. Kullanıcılar diğer kullanıcıları beğenebilir veya beğenmeyebilir, konumlarına göre yakın kullanıcıları görüntüleyebilir ve profillerine yapılan beğeniler hakkında bildirim alabilirler.

## Özellikler

- **Kullanıcı Kaydı ve Girişi**: Kullanıcılar e-posta ve şifre kullanarak kayıt olabilir ve giriş yapabilir.
- **Profil Yönetimi**: Kullanıcılar profil bilgilerini güncelleyebilir, birden fazla avatar resmi yükleyebilir ve biyografilerini güncelleyebilir.
- **Konum Bazlı Filtreleme**: Kullanıcılar konumlarına göre yakın kullanıcıları görebilir.
- **Beğenme ve Beğenmeme Sistemi**: Kullanıcılar diğer kullanıcıları beğenebilir veya beğenmeyebilir.
- **Gerçek Zamanlı Bildirimler**: WebSocket bağlantısı ile başka bir kullanıcı profilinizi beğendiğinde gerçek zamanlı bildirimler alabilirsiniz.

## Dizin Yapısı

```
|—— .env
|—— .gitignore
|—— app.js
|—— package-lock.json
|—— package.json
|—— prisma
|    |—— migrations
|        |—— 20240729214600_init
|            |—— migration.sql
|        |—— migration_lock.toml
|    |—— schema.prisma
|    |—— seed.js
|—— socket-control
|    |—— index.html
|—— src
|    |—— controllers
|        |—— auth.js
|        |—— users.js
|    |—— middlewares
|        |—— token.js
|    |—— routes
|        |—— auth.js
|        |—— index.js
|        |—— users.js
|    |—— uploads
|    |—— utils
|        |—— enum.js
|        |—— error.js
|        |—— handleError.js
|        |—— multerUpload.js
|        |—— response.js
|        |—— webSocket.js
|    |—— validations
|        |—— auth.js
```

## Kurulum

### Gereksinimler

- Node.js (>= 14.x)
- npm (>= 6.x)
- PostgreSQL (veya `schema.prisma` dosyasında belirtilen başka bir veritabanı)

### Kurulum

1. Depoyu klonlayın:

   ```bash
   git clone <repository-url>
   cd <project-directory>
   ```

2. Bağımlılıkları yükleyin:

   ```bash
   npm install
   ```

3. Kök dizinde bir `.env` dosyası oluşturun ve gerekli ortam değişkenlerini ekleyin. Örnek:

   ```env
   PORT=3000
   DATABASE_URL=postgresql://username:password@localhost:5432/mydatabase
   JWT_SECRET=mysecretkey
   ```

4. Veritabanını ayarlayın:

   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

5. Sunucuyu başlatın:

   ```bash
   npm start
   ```

## API Route'ları

- **POST /api/register**: Yeni bir kullanıcı kaydı oluşturur.

  - Gövde: `{ "name": "Kullanıcı Adı", "email": "kullanici@example.com", "password": "şifre" }`

- **POST /api/login**: Kullanıcıyı giriş yapar ve JWT tokeni alırsınız.

  - Gövde: `{ "email": "kullanici@example.com", "password": "şifre" }`

- **POST /api/add_profile_picture**: Profil resimlerini yükler.

  - Form-verisi: `photos[]` (birden fazla dosya)

- **PUT /api/update_profile**: Kullanıcı profil bilgilerini günceller.

  - Gövde: `{ "bio": "Güncellenmiş biyografi", "location": { "latitude": 12.34, "longitude": 56.78 } }`

- **GET /api/nearby_users/:km**: Belirtilen bir yarıçap (km) içindeki kullanıcıların listesini alır.

  - Sorgu Parametresi: `km`

- **POST /api/like/:toUserId**: Bir kullanıcıyı beğenir.

  - URL Parametresi: `toUserId`

- **POST /api/dislike/:toUserId**: Bir kullanıcıyı beğenmez.

  - URL Parametresi: `toUserId`

- **GET /api/get_liked_users**: Kullanıcının beğendiği diğer kullanıcıların listesini alır.

- **GET /api/get_who_liked_me**: Kullanıcıyı beğenen diğer kullanıcıların listesini alır.

## WebSocket Entegrasyonu

WebSocket sunucusu `app.js` içinde başlatılır. Kullanıcıların beğenme veya beğenmeme işlemleri için bildirimler gönderir ve bağlı istemcilere gerçek zamanlı güncellemeler sağlar.

### İstemci Tarafı Entegrasyonu

1. HTML dosyanıza (ör. `socket-control/index.html`) aşağıdaki script'i ekleyin:

   ```html
   <!DOCTYPE html>
   <html lang="en">
     <head>
       <meta charset="UTF-8" />
       <meta name="viewport" content="width=device-width, initial-scale=1.0" />
       <title>Socket Kontrol</title>
     </head>
     <body></body>

     <script>
       // İstemci tarafı WebSocket bağlantısı
       const ws = new WebSocket('ws://localhost:3000');

       ws.onopen = () => {
         ws.send(JSON.stringify({type: 'register', userId: USER_ID})); // USER_ID ile giriş yapmış kullanıcının ID'si
       };

       ws.onmessage = message => {
         const parsedMessage = JSON.parse(message.data);
         if (parsedMessage.type === 'like') {
           console.log(`Kullanıcı ${parsedMessage.userId} profilinizi beğendi`);
         } else if (parsedMessage.type === 'dislike') {
           console.log(`Kullanıcı ${parsedMessage.fromUserId} sizi beğenmedi`);
         }
       };
     </script>
   </html>
   ```

2. `USER_ID`'yi giriş yapmış kullanıcının ID'si ile değiştirin.

## Hata Yönetimi

Özel hata yönetimi, uygulama genelindeki çeşitli hataları ele almak için uygulanmıştır. `utils/error.js` ve `utils/handleError.js` dosyaları hata yönetimi araçlarını içerir.

## Katkıda Bulunma

Bu projeye katkıda bulunmak için çekme isteği (pull request) gönderebilir veya sorunlar açabilirsiniz. Lütfen katkılarınızın projenin kodlama standartlarına uygun olduğundan ve uygun testleri içerdiğinden emin olun.

## Lisans

Bu proje MIT Lisansı altında lisanslanmıştır - detaylar için [LICENSE](LICENSE) dosyasına bakabilirsiniz.
