import express from 'express';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cors from 'cors';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// ตั้งค่าการเชื่อมต่อฐานข้อมูล
const db = await mysql.createConnection({
  host: 'caboose.proxy.rlwy.net',
  user: 'root',
  password: 'ovuOjeEMJLJVCMsPYQlUipmDODmKcGPR',
  database: 'railway',
  port: 20077
});

console.log('✅ Connected to MySQL database.');

// Middleware
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173', // ปรับตาม port ของ frontend
  
  credentials: true
}));

// API: Login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }
  try {
    const [rows] = await db.execute('SELECT * FROM admins WHERE username = ?', [username]);
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }
    const user = rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }
    // สร้าง JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || '5e2fba39e34b7d28d5a8e68d50e8e93b4b2c9c5e2d26ccdc38b43cbdf9d1d976',
      { expiresIn: '1d' }
    );
    res.json({ token, user: { id: user.id, username: user.username, role: user.role, full_name: user.full_name, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// API: Register admin user (เพิ่มผู้ใช้ใหม่)
app.post('/api/register', async (req, res) => {
  const { username, password, full_name, email, role } = req.body;
  if (!username || !password || !role) {
    return res.status(400).json({ message: 'Username, password, and role are required.' });
  }
  try {
    // ตรวจสอบ username ซ้ำ
    const [rows] = await db.execute('SELECT * FROM admins WHERE username = ?', [username]);
    if (rows.length > 0) {
      return res.status(409).json({ message: 'Username already exists.' });
    }
    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.execute(
      'INSERT INTO admins (username, password, full_name, email, role) VALUES (?, ?, ?, ?, ?)',
      [username, hashedPassword, full_name || null, email || null, role]
    );
    res.json({ message: 'User registered successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// API: Statistics summary
app.get('/api/statistics', async (req, res) => {
  try {
    const [[{ students }]] = await db.execute('SELECT COUNT(*) as students FROM students');
    const [[{ admins }]] = await db.execute('SELECT COUNT(*) as admins FROM admins');
    const [[{ behaviors }]] = await db.execute('SELECT COUNT(*) as behaviors FROM behaviors');
    const [[{ cases }]] = await db.execute('SELECT COUNT(*) as cases FROM cases');
    res.json({ students, admins, behaviors, cases });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// API: Get all behaviors
app.get('/api/behaviors', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM behaviors ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// API: Add new behavior
app.post('/api/behaviors', async (req, res) => {
  const { behavior_name, description, severity_level } = req.body;
  if (!behavior_name) {
    return res.status(400).json({ message: 'behavior_name is required.' });
  }
  try {
    const [result] = await db.execute(
      'INSERT INTO behaviors (behavior_name, description, severity_level) VALUES (?, ?, ?)',
      [behavior_name, description || null, severity_level || 'low']
    );
    // ดึงข้อมูลที่เพิ่มใหม่เพื่อส่งกลับ
    const [newBehavior] = await db.execute('SELECT * FROM behaviors WHERE id = ?', [result.insertId]);
    res.json(newBehavior[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// API: Update behavior
app.patch('/api/behaviors/:id', async (req, res) => {
  const { id } = req.params;
  const { behavior_name, description, severity_level } = req.body;
  if (!behavior_name) {
    return res.status(400).json({ message: 'behavior_name is required.' });
  }
  try {
    // ตรวจสอบว่ามี behavior นี้จริง
    const [rows] = await db.execute('SELECT * FROM behaviors WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Behavior not found.' });
    }
    await db.execute(
      'UPDATE behaviors SET behavior_name=?, description=?, severity_level=? WHERE id=?',
      [behavior_name, description || null, severity_level || 'low', id]
    );
    res.json({ message: 'Behavior updated successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// API: Delete behavior
app.delete('/api/behaviors/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // ตรวจสอบว่ามี behavior นี้จริง
    const [rows] = await db.execute('SELECT * FROM behaviors WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Behavior not found.' });
    }
    // ตรวจสอบว่ามี cases ที่ใช้ behavior นี้อยู่หรือไม่
    const [cases] = await db.execute('SELECT COUNT(*) as count FROM cases WHERE behavior_id = ?', [id]);
    if (cases[0].count > 0) {
      return res.status(400).json({ message: 'Cannot delete behavior that is being used in cases.' });
    }
    await db.execute('DELETE FROM behaviors WHERE id = ?', [id]);
    res.json({ message: 'Behavior deleted successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// API: Get all students
app.get('/api/students', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM students ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// API: Add new student
app.post('/api/students', async (req, res) => {
  const { student_code, first_name, last_name, gender, class_level, birthdate, guardian_name, contact_info, class_room } = req.body;
  if (!student_code || !first_name || !last_name) {
    return res.status(400).json({ message: 'student_code, first_name, and last_name are required.' });
  }
  try {
    await db.execute(
      'INSERT INTO students (student_code, first_name, last_name, gender, class_level, birthdate, guardian_name, contact_info, class_room) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [student_code, first_name, last_name, gender || 'male', class_level || null, birthdate || null, guardian_name || null, contact_info || null, class_room || null]
    );
    res.json({ message: 'Student added successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// API: Get all cases (with optional search)
app.get('/api/cases', async (req, res) => {
  try {
    const q = req.query.q ? `%${req.query.q}%` : null;
    let sql = `SELECT cases.*, s.first_name, s.last_name, s.class_level, s.class_room, b.behavior_name, a.full_name as reporter_name FROM cases 
      LEFT JOIN students s ON cases.student_id = s.id
      LEFT JOIN behaviors b ON cases.behavior_id = b.id
      LEFT JOIN admins a ON cases.reported_by = a.id`;
    let params = [];
    if (q) {
      sql += ' WHERE case_title LIKE ? OR case_description LIKE ? OR status LIKE ?';
      params = [q, q, q];
    }
    sql += ' ORDER BY cases.id DESC';
    const [rows] = await db.execute(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// API: Add new case
app.post('/api/cases', async (req, res) => {
  const { student_id, behavior_id, reported_by, case_title, case_description, status } = req.body;
  if (!student_id || !behavior_id || !reported_by) {
    return res.status(400).json({ message: 'student_id, behavior_id, and reported_by are required.' });
  }
  try {
    const [result] = await db.execute(
      'INSERT INTO cases (student_id, behavior_id, reported_by, case_title, case_description, status) VALUES (?, ?, ?, ?, ?, ?)',
      [student_id, behavior_id, reported_by, case_title || null, case_description || null, status || 'open']
    );
    // ดึงข้อมูลที่เพิ่มใหม่เพื่อส่งกลับ
    const [newCase] = await db.execute(`
      SELECT cases.*, s.first_name, s.last_name, s.class_level, s.class_room, b.behavior_name, a.full_name as reporter_name 
      FROM cases 
      LEFT JOIN students s ON cases.student_id = s.id
      LEFT JOIN behaviors b ON cases.behavior_id = b.id
      LEFT JOIN admins a ON cases.reported_by = a.id
      WHERE cases.id = ?
    `, [result.insertId]);
    res.json(newCase[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// API: Update case
app.patch('/api/cases/:id', async (req, res) => {
  const { id } = req.params;
  const { case_title, case_description, status } = req.body;
  try {
    // ตรวจสอบว่ามี case นี้จริง
    const [rows] = await db.execute('SELECT * FROM cases WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Case not found.' });
    }
    await db.execute(
      'UPDATE cases SET case_title=?, case_description=?, status=? WHERE id=?',
      [case_title || null, case_description || null, status || 'open', id]
    );
    res.json({ message: 'Case updated successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// API: Delete case
app.delete('/api/cases/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // ตรวจสอบว่ามี case นี้จริง
    const [rows] = await db.execute('SELECT * FROM cases WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Case not found.' });
    }
    // ลบ case และ attachments ที่เกี่ยวข้อง (CASCADE จะจัดการให้)
    await db.execute('DELETE FROM cases WHERE id = ?', [id]);
    res.json({ message: 'Case deleted successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// API: Get all admins (for admin management page)
app.get('/api/admins', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT id, username, full_name, email, role, created_at FROM admins ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// API: Add new admin
app.post('/api/admins', async (req, res) => {
  const { username, password, full_name, email, role } = req.body;
  if (!username || !password || !role) {
    return res.status(400).json({ message: 'username, password, and role are required.' });
  }
  try {
    // ตรวจสอบ username ซ้ำ
    const [rows] = await db.execute('SELECT * FROM admins WHERE username = ?', [username]);
    if (rows.length > 0) {
      return res.status(409).json({ message: 'Username already exists.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.execute(
      'INSERT INTO admins (username, password, full_name, email, role) VALUES (?, ?, ?, ?, ?)',
      [username, hashedPassword, full_name || null, email || null, role]
    );
    res.json({ message: 'Admin added successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// API: Update admin
app.patch('/api/admins/:id', async (req, res) => {
  const { id } = req.params;
  const { username, password, full_name, email, role } = req.body;
  try {
    // ตรวจสอบว่ามี user นี้จริง
    const [rows] = await db.execute('SELECT * FROM admins WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Admin not found.' });
    }
    // อัปเดต password เฉพาะกรณีที่ส่งมาใหม่
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await db.execute('UPDATE admins SET username=?, password=?, full_name=?, email=?, role=? WHERE id=?', [username, hashedPassword, full_name || null, email || null, role, id]);
    } else {
      await db.execute('UPDATE admins SET username=?, full_name=?, email=?, role=? WHERE id=?', [username, full_name || null, email || null, role, id]);
    }
    res.json({ message: 'Admin updated successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// API: Delete admin
app.delete('/api/admins/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.execute('DELETE FROM admins WHERE id = ?', [id]);
    res.json({ message: 'Admin deleted successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
