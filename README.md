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



### **Step 1: Clone the Repository**

```bash
git clone <REPO_URL>
cd my-project/
```

---

### **Step 2: Build the App**

```bash
sudo docker build -t mystd:latest .
```

---

### **Step 3: Create Data Location and also Create Docker Network**

```bash
mkdir -p /home/ubuntu/student-app/mysql-data

```

```bash
docker network create student-net
```

---

### **Step 4: You can Pull or Direct Run MySQL**

```bash
# Without Volume
docker run -d --name mysql-container --network student-net -e MYSQL_ROOT_PASSWORD=rootpass -e MYSQL_DATABASE=student_records -e MYSQL_USER=admin -e MYSQL_PASSWORD=adminpass -p 3306:3306 mysql

# With Volume
docker run -d --name mysql-container --network student-net -e MYSQL_ROOT_PASSWORD=rootpass -e MYSQL_DATABASE=student_records -e MYSQL_USER=admin -e MYSQL_PASSWORD=adminpass -p 3306:3306 -v /home/ubuntu/student-app/mysql-data:/var/lib/mysql -v /home/ubuntu/student-app/scripts:/docker-entrypoint-initdb.d:ro mysql


```

---

## -v /home/ubuntu/student-app/mysql-data:/var/lib/mysql \  First volume — MySQL Data Storage  

- “Hey, don’t keep MySQL data inside the container — store it in this folder on my host machine.”

- Left side (/home/ubuntu/student-app/mysql-data) → this is a folder on your EC2 or local host.

- Right side (/var/lib/mysql) → this is the folder inside the container where MySQL stores all its databases.
- So every time MySQL writes data (tables, rows, users, logs, etc.), it’s actually writing to your host directory.

     - ⚙️ Why it matters:
     - ✅ Your data survives even if you remove or rebuild the container.
     - ✅ You can back it up, inspect it, or move it easily.
     - 🔥 Real-world DevOps setups always persist DB data like this.

## -v /home/ubuntu/student-app/scripts:/docker-entrypoint-initdb.d:ro   Second volume — SQL Init Scripts
- “Hey MySQL, here’s a folder with SQL files you should run automatically when you start for the first time.”

- Left side (/home/ubuntu/student-app/scripts) → your host folder where you put the file 001_create_students.sql.

- Right side (/docker-entrypoint-initdb.d) → special folder inside the MySQL image.

    - ⚙️ How it works: When a MySQL container starts for the first time (with an empty data directory),it looks inside /docker-entrypoint-initdb.d and automatically executes:
    - .sql files
    - .sh scripts
    - .sql.gz files
    - So your table (students) gets created automatically from that SQL file — no need to manually import later.

## 🧩 Summary Table
| Mount Path                                                        | Purpose                              | Inside Container              | Type       | When Used                  |
| ----------------------------------------------------------------- | ------------------------------------ | ----------------------------- | ---------- | -------------------------- |
| `/home/ubuntu/student-app/mysql-data:/var/lib/mysql`              | Stores database data persistently    | `/var/lib/mysql`              | Read/Write | Always                     |
| `/home/ubuntu/student-app/scripts:/docker-entrypoint-initdb.d:ro` | Auto-runs SQL files to initialize DB | `/docker-entrypoint-initdb.d` | Read-only  | First container start only |


---

### **Step 5: Import Schema**

```bash
cd my-project/
docker cp scripts/001_create_students.sql mysql-container:/tmp/001_create_students.sql
docker exec -i mysql-container mysql -uroot -prootpass student_records < ./scripts/001_create_students.sql
```

---

### **Step 6: Verify Database**

```bash
docker exec -it mysql-container mysql -uroot -prootpass -e "SELECT User, Host FROM mysql.user;"
docker exec -it mysql-container mysql -uadmin -padminpass -e "USE student_records; SHOW TABLES;"
```
<img width="3318" height="747" alt="image" src="https://github.com/user-attachments/assets/b353ac3d-2f3b-40eb-8a29-a1dbe9376b00" />
<img width="3308" height="444" alt="image" src="https://github.com/user-attachments/assets/2dba6571-5a77-46ab-a848-8589b536c151" />


---

### **Step 7: Run the App**

```bash
docker run -d --name student-app --network student-net -p 3000:3000 -e DB_HOST=mysql-container -e DB_USER=admin -e DB_PASSWORD=adminpass -e DB_PORT=3306 -e DB_NAME=student_records mystd 

```

---

### **Step 8: Check Containers**

```bash
docker ps
```

---

### **Step 9: Access the App**

```
http://<EC2_PUBLIC_IP>:3000
```

---

### **Step 10: Verify Database Files (Host Path)**

```bash
cd /home/ubuntu/student-app/mysql-data
ls
```

---



# if you stop and remove mysql Container the data won’t be displaying but still in host machine 
<img width="3349" height="1789" alt="image" src="https://github.com/user-attachments/assets/6ff54ff2-4779-48bb-97e0-0a2e885f372d" />

<img width="3342" height="2027" alt="image" src="https://github.com/user-attachments/assets/3d15aef2-7f82-4ca5-b8df-2d80833b8f6b" />



# Start 
<img width="2773" height="1608" alt="image" src="https://github.com/user-attachments/assets/41c74b57-e8e5-407d-a3f1-d42594559efb" />

<img width="3330" height="2005" alt="Screenshot 2025-10-18 at 3 02 18 PM" src="https://github.com/user-attachments/assets/f81f7b2a-8140-4cae-97f7-23bf38b0039b" />


---


# Want to access database inside the container 
```bash
docker exec -it mysql-container bash
mysql -uadmin -padminpass
SHOW DATABASES;
USE student_records;
SHOW TABLES;
SELECT * FROM students;
or use Shortcut
docker exec -it mysql-container mysql -uadmin -padminpass -e "SELECT * FROM student_records.students;"


```
<img width="1680" height="1050" alt="Screenshot 2025-10-18 at 3 43 03 PM" src="https://github.com/user-attachments/assets/1265cb89-1903-431b-876f-35af54c84b3d" />

✅ **Note:**

* Removing the MySQL container will **not** delete your data since it’s stored in `/home/ubuntu/student-app/mysql-data` on your host.
* Only deleting that folder will remove the database permanently.

---
If you liked this project, don’t forget to ⭐ the repo  
and connect with me on LinkedIn 👇  

🔗 [Saime Shaikh]([https://www.linkedin.com/in/saimeshaikh/](https://www.linkedin.com/in/saim-shaikh-devops/))  
Let’s grow together in the DevOps community 🚀

