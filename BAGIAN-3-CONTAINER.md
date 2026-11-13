# Panduan Bagian 3 — Build dan Menjalankan Container

Panduan ini menggunakan Podman dan dijalankan dari terminal pada folder `backend`.

## 1. Build image

```bash
podman build -t task-service:1.0.0 -f task-service/Containerfile task-service
podman build -t activity-service:1.0.0 -f activity-service/Containerfile activity-service
```

## 2. Buat network dan volume

```bash
podman network create task-network
podman volume create task-data
podman volume create activity-data
```

Volume menjaga file JSON tetap tersedia ketika container dihentikan atau dibuat ulang.

## 3. Jalankan Activity Service terlebih dahulu

```bash
podman run -d --name activity-service --network task-network -p 3002:3002 -e PORT=3002 -e DATA_FILE=/app/data/activities.json -v activity-data:/app/data activity-service:1.0.0
```

## 4. Jalankan Task Service

```bash
podman run -d --name task-service --network task-network -p 3001:3001 -e PORT=3001 -e DATA_FILE=/app/data/tasks.json -e ACTIVITY_SERVICE_URL=http://activity-service:3002 -v task-data:/app/data task-service:1.0.0
```

## 5. Uji endpoint

Buka browser:

- http://localhost:3001/
- http://localhost:3001/health
- http://localhost:3002/
- http://localhost:3002/health
- http://localhost:3001/tasks
- http://localhost:3002/activities

Contoh membuat tugas dengan curl:

```bash
curl -X POST http://localhost:3001/tasks -H "Content-Type: application/json" -d '{"title":"Uji container","description":"Tugas UTS bagian 3"}'
```

Lalu periksa aktivitas:

```bash
curl http://localhost:3002/activities
```

## 6. Demonstrasi perintah yang diminta

```bash
podman ps
podman logs task-service
podman logs activity-service
podman inspect task-service
podman exec task-service id
podman stop task-service
podman start task-service
podman rm -f task-service
```

Untuk menghapus Activity Service:

```bash
podman rm -f activity-service
```

Catatan: `podman rm` hanya menghapus container, bukan volume bernama. Data tetap ada di volume. Jangan gunakan `podman volume rm` jika data masih diperlukan.

## 7. Catatan penting untuk integrasi

- Kedua container harus berada pada network `task-network` agar Task Service dapat mengakses Activity Service melalui hostname `activity-service`.
- Jangan menggunakan `localhost:3002` sebagai alamat Activity Service dari dalam container Task Service. `localhost` di dalam container menunjuk ke container itu sendiri.
- `EXPOSE` mendokumentasikan port container; port agar dapat diakses dari host tetap dipublikasikan dengan `-p`.
- `DATA_FILE` diarahkan ke `/app/data` dan dipasang ke named volume agar data JSON tidak hilang saat container diganti.
- File `.env` dan data lokal tidak dimasukkan ke image melalui `.containerignore`.
- Image menggunakan `node:22-alpine` dan `USER node` agar proses aplikasi berjalan sebagai non-root.

## 8. Pemeriksaan sebelum demo

```bash
podman ps -a
podman images
podman volume ls
podman network ls
```

Jika nama container/volume/network sudah pernah dibuat, hapus atau gunakan nama baru sebelum mengulang langkah pembuatan.
