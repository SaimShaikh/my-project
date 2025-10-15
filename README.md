# 🧑‍🎓 Student App Project

A **Next.js + MySQL** full-stack app containerized using **Docker**.  
The app connects to a MySQL container to manage student records — including details like name, age, DOB, location, and contact info.

---

## 🚀 Features
- Frontend built with **Next.js 14**
- Backend APIs served from the same app
- **MySQL 8.0** database for persistent storage
- Containerized using **Docker**
- Easy setup with environment variables
- Simple local deployment (no external RDS required)

---

## 🛠️ Tech Stack
- **Frontend:** Next.js (TypeScript)
- **Backend:** Node.js
- **Database:** MySQL
- **Containerization:** Docker, Docker Network
- **Build Tool:** pnpm / npm (based on your setup)

---

## 📂 Project Structure


---


## ⚙️ Setup & Run Locally

### Step 1: Clone the Repository**
```bash
git clone
cd my-project/
```
---

### Step 2: Build the App
``docker build -t mystd:latest .``

---

### Step 3:Create Docker Network
``docker network create student-net``

---

### Step 4:Run MySQL
``docker run -d \
  --name mysql-container \
  --network student-net \
  -e MYSQL_ROOT_PASSWORD=rootpass \
  -e MYSQL_DATABASE=student_records \
  -e MYSQL_USER=admin \
  -e MYSQL_PASSWORD=adminpass \
  -p 3306:3306 \
  -v mysql_data:/var/lib/mysql \
  mysql:8.0
``

---

### Step 5:Import Schema
``docker cp scripts/001_create_students.sql mysql-container:/tmp/001_create_students.sql``

---

### Step 6:Run the App
``docker run --rm -d \
  --name student-app \
  --network student-net \
  -p 3000:3000 \
  -e DB_HOST=mysql-container \
  -e DB_USER=admin \
  -e DB_PASSWORD=adminpass \
  -e DB_PORT=3306 \
  -e DB_NAME=student_records \
  mystd:latest
``

---

### Step 7:Access the App http://<EC2_PUBLIC_IP>:3000
<img width="3296" height="2004" alt="image" src="https://github.com/user-attachments/assets/cef15998-a85e-47c5-a675-92bc6a46dd17" />

---

### Step 8:Access the Database 
```
docker exec -it mysql-container bash
mysql -uadmin -padminpass
SHOW DATABASES ;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| performance_schema |
| student_records    |
+--------------------+
3 rows in set (0.01 sec)

USE student_records;
SHOW TABLES;
+---------------------------+
| Tables_in_student_records |
+---------------------------+
| students                  |
+---------------------------+

DESCRIBE students;
SELECT * FROM students;
```
<img width="3321" height="616" alt="image" src="https://github.com/user-attachments/assets/ac366914-00a5-44f5-aa87-67936311c8bf" />

---





