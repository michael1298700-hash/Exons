# API Documentation — Task Management System

**Versi:** 1.0.0  
**Arsitektur:** Microservices  
**Penyimpanan:** JSON File Storage

## 1. Gambaran Umum

Aplikasi ini menggunakan dua microservice:

| Service | Port | Tanggung Jawab |
|---|---:|---|
| Task Service | 3001 | Mengelola data tugas |
| Activity Service | 3002 | Menyimpan riwayat aktivitas |

Task Service berkomunikasi dengan Activity Service untuk mencatat aktivitas ketika tugas dibuat, diperbarui, atau dihapus.

## 2. Base URL

Selama pengembangan lokal:

- Task Service: `http://localhost:3001`
- Activity Service: `http://localhost:3002`

Semua request yang mengirim data harus menggunakan header:

`Content-Type: application/json`

## 3. Task Service API

### 3.1 Health Check

**GET** `/health`

Memeriksa kondisi Task Service.

Contoh response:

```json
{
  "status": "healthy"
}
```

### 3.2 Mendapatkan Semua Tugas

**GET** `/tasks`

Mengambil seluruh data tugas.

### 3.3 Membuat Tugas

**POST** `/tasks`

Request body:

```json
{
  "title": "Belajar Microservices",
  "description": "Mengerjakan proyek UTS"
}
```

Response berhasil: `201 Created`

Contoh response:

```json
{
  "id": "UUID",
  "title": "Belajar Microservices",
  "description": "Mengerjakan proyek UTS",
  "completed": false,
  "createdAt": "2026-11-05T14:33:13.468Z"
}
```

Catatan:
- `title` wajib diisi dan tidak boleh kosong.
- `description` bersifat opsional.
- `completed` secara otomatis bernilai `false` ketika tugas dibuat.
- Setiap tugas memiliki ID unik.

### 3.4 Mendapatkan Detail Tugas

**GET** `/tasks/:id`

Contoh:

`GET /tasks/e4cc6678-cb77-4a71-b05f-a0c6853a8701`

Mengambil detail tugas berdasarkan ID.

Jika tugas tidak ditemukan, server mengembalikan `404 Not Found`.

### 3.5 Mengubah Status Tugas

**PATCH** `/tasks/:id`

Request body:

```json
{
  "completed": true
}
```

Catatan:
- `completed` harus berupa boolean (`true` atau `false`).
- Jika berhasil, status tugas dan `updatedAt` diperbarui.
- Perubahan akan dicatat oleh Activity Service.

### 3.6 Menghapus Tugas

**DELETE** `/tasks/:id`

Menghapus tugas berdasarkan ID.

Jika berhasil, server mengembalikan pesan:

```json
{
  "message": "Tugas berhasil dihapus",
  "task": {}
}
```

Penghapusan tugas juga dicatat oleh Activity Service.

## 4. Activity Service API

### 4.1 Health Check

**GET** `/health`

Memeriksa kondisi Activity Service.

Contoh response:

```json
{
  "status": "healthy"
}
```

### 4.2 Mendapatkan Semua Aktivitas

**GET** `/activities`

Mengambil seluruh riwayat aktivitas yang tersimpan.

### 4.3 Menambahkan Aktivitas

**POST** `/activities`

Endpoint ini digunakan Task Service untuk mengirim catatan aktivitas.

Request body:

```json
{
  "taskId": "UUID",
  "action": "created",
  "description": "Tugas berhasil dibuat"
}
```

Keterangan:
- `taskId`: ID tugas yang berkaitan.
- `action`: jenis aktivitas.
- `description`: keterangan aktivitas.

Jenis aktivitas yang digunakan:
- `created`
- `updated`
- `deleted`

Activity Service menghasilkan ID aktivitas dan timestamp secara otomatis.

### 4.4 Mendapatkan Aktivitas Berdasarkan Tugas

**GET** `/activities/task/:taskId`

Contoh:

`GET /activities/task/e4cc6678-cb77-4a71-b05f-a0c6853a8701`

Mengambil riwayat aktivitas berdasarkan ID tugas tertentu.

## 5. HTTP Status Code

| Status | Keterangan |
|---|---|
| 200 OK | Request berhasil |
| 201 Created | Data berhasil dibuat |
| 400 Bad Request | Input tidak valid |
| 404 Not Found | Data tidak ditemukan |
| 500 Internal Server Error | Terjadi kesalahan server |

## 6. Environment Variables

### Task Service

| Variabel | Default | Fungsi |
|---|---|---|
| `PORT` | `3001` | Port server |
| `DATA_FILE` | `data/tasks.json` | Lokasi penyimpanan tugas |
| `ACTIVITY_SERVICE_URL` | `http://localhost:3002` | Alamat Activity Service |

### Activity Service

| Variabel | Default | Fungsi |
|---|---|---|
| `PORT` | `3002` | Port server |
| `DATA_FILE` | `data/activities.json` | Lokasi penyimpanan aktivitas |

## 7. Komunikasi Antarservice

Alur komunikasi:

1. Pengguna membuat, memperbarui, atau menghapus tugas melalui Task Service.
2. Task Service memproses perubahan dan menyimpan data tugas.
3. Task Service mengirim request `POST /activities` ke Activity Service.
4. Activity Service menyimpan catatan aktivitas.
5. Riwayat dapat diakses melalui endpoint Activity Service.

Jika Activity Service tidak dapat dihubungi, Task Service mencatat kegagalan komunikasi melalui console dan tetap melanjutkan respons tugas.

## 8. Penyimpanan Data

Aplikasi menggunakan JSON File Storage:

- `tasks.json` menyimpan data tugas.
- `activities.json` menyimpan riwayat aktivitas.

Pemisahan file mengikuti tanggung jawab masing-masing microservice. Database eksternal tidak digunakan karena tidak diwajibkan dalam spesifikasi UTS.

## 9. Request Logging

Kedua service memiliki middleware request logging yang mencatat:

- Timestamp request.
- HTTP method.
- URL endpoint.

Contoh:

```text
[2026-11-05T14:33:13.468Z] POST /tasks
[2026-11-05T14:33:13.640Z] POST /activities
```

## 10. Catatan Integrasi Frontend

Frontend dapat menggunakan endpoint Task Service untuk operasi tugas dan endpoint Activity Service untuk menampilkan riwayat.

Jika frontend berjalan pada origin atau port berbeda, konfigurasi CORS perlu diperiksa. Konfigurasi CORS belum dikonfirmasi dalam dokumentasi ini.

Untuk deployment menggunakan container, alamat `ACTIVITY_SERVICE_URL` harus disesuaikan dengan alamat service yang dapat dijangkau dari container Task Service.
