# ClassTrack SKCT 🎓

**ClassTrack** is a premium, full-stack React Native application designed specifically for Sri Krishna College of Technology (SKCT) faculty. It provides a sleek, intuitive, and highly functional interface for managing daily schedules, tracking student attendance, and automating SMS notifications to parents.

---

## 🚀 Features

- **Live Cloud Dashboard**: Instantly fetch daily class schedules straight from the AWS cloud.
- **Smart Attendance System**:
  - One-tap marking for Present, Absent, and On-Duty (OD).
  - Fast-marking input box to mark absentees by the last few digits of their roll number.
- **Automated SMS Alerts**: Directly integrates with the device's native SMS capabilities to instantly send personalized absentee alerts to parents.
- **Real-time History Tracking**: All attendance submissions are logged directly to the cloud and instantly viewable on the History tab.
- **Premium UI/UX**: Built with modern, glass-morphic elements, smooth micro-animations using `react-native-reanimated`, and a curated dark/light color palette.

---

## 🏗 Architecture

The project is built as a full-stack application.

### Frontend (React Native)
- **Framework**: React Native CLI
- **Language**: TypeScript
- **State & Data**: React Hooks + standard `fetch` API.
- **Animations**: `react-native-reanimated`

### Backend (Node.js & AWS)
The backend source code is located in the `/backend` folder.
- **Server**: Express.js REST API
- **Database**: AWS RDS MySQL
- **ORM**: Sequelize
- **Hosting**: AWS EC2 Instance running PM2

---

## 🛠 Setup & Installation

### 1. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure your environment:
   Create a `.env` file in the `backend` folder containing your AWS RDS credentials:
   ```env
   DB_HOST=your-rds-endpoint.amazonaws.com
   DB_USER=admin
   DB_PASS=yourpassword
   DB_NAME=classtrack
   PORT=3000
   ```
4. Run the seed script to initialize the database:
   ```bash
   node setup_db.js
   node seed.js
   ```
5. Start the server:
   ```bash
   npm start
   ```

### 2. Frontend Setup
1. Install dependencies in the root directory:
   ```bash
   npm install
   ```
2. Update the API URL:
   Open `src/constants/Config.ts` and set it to your backend's IP address.
   ```typescript
   export const API_BASE_URL = 'http://your-ec2-ip:3000/api';
   ```
3. Run the application:
   ```bash
   npx react-native run-android
   # or
   npx react-native run-ios
   ```

---

## 👥 Developers

Proudly developed by the students of SKCT:
- **Vividhan**
- **Darshini**
- **Sivakumar**
- **Sudhan**

---

*© 2026 ClassTrack. Designed for Sri Krishna College of Technology.*
