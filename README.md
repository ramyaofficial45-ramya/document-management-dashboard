# DocVault — Document Management Dashboard

A full-stack Document Management Dashboard with real-time upload progress, bulk processing notifications, and a persistent notification center.

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, Axios, Socket.io-client |
| Backend | Node.js, Express, Socket.io, Multer |
| Database | MongoDB (Mongoose) |
| Font | Livvic (Google Fonts) |

---

## 📁 Folder Structure

```
docvault/
├── backend/
│   ├── middleware/
│   │   └── upload.js          # Multer config (PDF-only, 50MB limit)
│   ├── models/
│   │   ├── Document.js        # Document schema
│   │   └── Notification.js    # Notification schema
│   ├── routes/
│   │   ├── documents.js       # Upload, list, download, delete
│   │   └── notifications.js   # CRUD + mark-read
│   ├── uploads/               # Stored PDF files (auto-created)
│   ├── .env
│   ├── package.json
│   └── server.js              # Express + Socket.io entry
│
└── frontend/
    ├── public/
    │   └── favicon.svg
    ├── src/
    │   ├── components/
    │   │   ├── DocumentsTable.jsx
    │   │   ├── FileUpload.jsx
    │   │   ├── Header.jsx
    │   │   ├── NotificationPanel.jsx
    │   │   └── StatsCards.jsx
    │   ├── hooks/
    │   │   ├── useDocuments.js
    │   │   └── useNotifications.js
    │   ├── pages/
    │   │   ├── Dashboard.jsx
    │   │   ├── DocumentsPage.jsx
    │   │   ├── NotificationsPage.jsx
    │   │   └── UploadPage.jsx
    │   ├── utils/
    │   │   ├── api.js          # Axios instance
    │   │   ├── format.js       # Byte/date formatters
    │   │   └── socket.js       # Socket.io singleton
    │   ├── App.jsx
    │   ├── index.css
    │   └── main.jsx
    ├── index.html
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.js
```

---

## 🗄️ MongoDB Schemas

### Document
```js
{
  name: String,           // stored filename
  originalName: String,   // original file name
  size: Number,           // bytes
  mimeType: String,       // application/pdf
  path: String,           // disk path
  status: String,         // uploading | processing | complete | failed
  uploadBatchId: String,  // UUID linking batch uploads
  createdAt: Date,
  updatedAt: Date
}
```

### Notification
```js
{
  message: String,        // display text
  type: String,           // success | error | info | warning
  read: Boolean,          // default false
  batchId: String,        // links to upload batch
  metadata: Mixed,        // { fileCount, files[], timestamp }
  createdAt: Date,
  updatedAt: Date
}
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js ≥ 18
- MongoDB running locally (`mongod`) OR a MongoDB Atlas URI

### 1. Clone & Install

```bash
# Backend
cd docvault/backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Backend Environment

Edit `backend/.env`:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/docvault
CLIENT_URL=http://localhost:5173
```

For MongoDB Atlas:
```
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/docvault
```

### 3. Run the Application

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
# Server starts at http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
# App opens at http://localhost:5173
```

---

## 📡 API Reference

### Documents
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/documents` | List all documents |
| POST | `/api/documents/upload` | Upload files (multipart/form-data, field: `files`) |
| GET | `/api/documents/download/:id` | Download a file |
| DELETE | `/api/documents/:id` | Delete a document |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | List all + unread count |
| GET | `/api/notifications/unread-count` | Unread count only |
| PATCH | `/api/notifications/:id/read` | Mark one as read |
| PATCH | `/api/notifications/mark-all-read` | Mark all as read |
| DELETE | `/api/notifications/:id` | Delete one |
| DELETE | `/api/notifications` | Delete all |

### Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server health check |

---

## 🔌 Socket.io Events

| Event | Direction | Payload |
|-------|-----------|---------|
| `upload:complete` | Server → Client | `{ batchId, files[] }` |
| `upload:bulk-complete` | Server → Client | `{ batchId, fileCount, files[], timestamp }` |
| `notification:new` | Server → Client | Full notification object |

---

## ✨ Features

- **Single & Bulk Upload** — drag-and-drop or file picker, PDF only
- **Individual Progress Bars** — each file has its own real-time progress indicator
- **Smart Bulk Detection** — >3 files triggers background processing mode
- **Toast Notifications** — instant feedback for uploads
- **Real-time Socket Notifications** — server pushes completion events to all connected clients
- **Persistent Notification Center** — stored in MongoDB, survives page refresh
- **Unread Badge** — bell icon in header shows live unread count
- **Mark as Read / Mark All / Clear All** — full notification management
- **Document Table** — searchable, sortable, with download and delete
- **Stats Dashboard** — total docs, storage used, today's uploads, unread notifications
- **Responsive Design** — works on mobile, tablet, desktop
- **Livvic Font + White/Blue Theme** — matches design brief

---

## 🚢 Deployment

### Backend (Railway / Render / Fly.io)
1. Set `MONGO_URI` and `CLIENT_URL` env vars
2. Set `PORT` (most platforms inject this automatically)
3. Deploy `backend/` folder

### Frontend (Vercel / Netlify)
1. Set `VITE_SOCKET_URL=https://your-backend-url.com`
2. Update `vite.config.js` proxy or set API base URL via env
3. Deploy `frontend/` folder

---

## 🧪 Running Tests (Optional)

If you add tests with Vitest:
```bash
cd frontend
npm run test
```

For backend tests with Jest:
```bash
cd backend
npm test
```

---

## 💡 Development Timeline (4 Hours)

| Time | Task |
|------|------|
| 0:00–0:30 | Backend setup: Express, MongoDB, models |
| 0:30–1:00 | Upload route + Multer middleware |
| 1:00–1:30 | Notification routes + Socket.io integration |
| 1:30–2:15 | Frontend: Vite setup, routing, Header |
| 2:15–3:00 | FileUpload component with progress bars |
| 3:00–3:30 | DocumentsTable + Notification components |
| 3:30–4:00 | Pages, polish, testing |
