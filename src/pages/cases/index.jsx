import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
// เพิ่ม import สำหรับ font Sarabun
import sarabunThin from '../../assets/fonts/Sarabun-Thin.ttf';


const EditIcon = ({size=20}) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14.85 2.85a2.121 2.121 0 0 1 3 3l-9.1 9.1a2 2 0 0 1-.71.44l-3.13 1.04a.5.5 0 0 1-.63-.63l1.04-3.13a2 2 0 0 1 .44-.71l9.1-9.1Zm2.12.88a1.121 1.121 0 0 0-1.59 0l-9.1 9.1a1 1 0 0 0-.22.36l-.9 2.7 2.7-.9a1 1 0 0 0 .36-.22l9.1-9.1a1.121 1.121 0 0 0 0-1.59Z" fill="var(--color-warning, #f59e42)"/>
  </svg>
);

const DeleteIcon = ({size=20}) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="5" y="8" width="2" height="7" rx="1" fill="var(--color-status-error, #ef4444)"/>
    <rect x="9" y="8" width="2" height="7" rx="1" fill="var(--color-status-error, #ef4444)"/>
    <rect x="13" y="8" width="2" height="7" rx="1" fill="var(--color-status-error, #ef4444)"/>
    <rect x="3" y="4" width="14" height="2" rx="1" fill="var(--color-status-error, #ef4444)"/>
    <rect x="7" y="2" width="6" height="2" rx="1" fill="var(--color-status-error, #ef4444)"/>
    <rect x="4" y="6" width="12" height="2" rx="1" fill="var(--color-status-error, #ef4444)"/>
  </svg>
);

export default function Cases() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchName, setSearchName] = useState('');
  const [searchRoom, setSearchRoom] = useState('');
  const [selected, setSelected] = useState([]);
  const [editCase, setEditCase] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const casesPerPage = 5;
  const [user, setUser] = useState({});
  // เพิ่ม state สำหรับประเภทที่เลือก
  const [selectedType, setSelectedType] = useState('');

  // สร้างรายการประเภททั้งหมดจากข้อมูล cases
  const allTypes = Array.from(new Set(cases.map(c => c.behavior_type).filter(Boolean)));

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(storedUser);
  }, []);

  useEffect(() => {
    setLoading(true);
    fetch('https://student-main-behavior-backend.onrender.com/api/cases' + (searchName ? `?q=${encodeURIComponent(searchName)}` : ''))
      .then(res => res.json())
      .then(data => {
        setCases(data);
        setLoading(false);
      })
      .catch(() => {
        setError('เกิดข้อผิดพลาด');
        setLoading(false);
      });
  }, [searchName]);

  // Filter by name, room, และประเภท (frontend)
  const filteredCases = cases.filter(c => {
    const nameMatch = `${c.first_name || ''} ${c.last_name || ''}`.toLowerCase().includes(searchName.toLowerCase());
    // Normalize class_level and class_room for search
    const classLevelStr = String(c.class_level);
    const classLevelLabel = c.class_level ? `ม.${c.class_level}` : '';
    const classRoomStr = String(c.class_room || '');
    const searchRoomTrim = searchRoom.trim();

    // Support search like '6/4' or 'ม.6/4'
    let roomMatch = false;
    if (searchRoomTrim.includes('/')) {
      // Split by /
      const [searchLevel, searchRoomNum] = searchRoomTrim.replace('ม.', '').split('/');
      roomMatch = (
        (classLevelStr === searchLevel.trim() || classLevelLabel === `ม.${searchLevel.trim()}`)
        && classRoomStr === searchRoomNum.trim()
      );
    } else {
      roomMatch =
        searchRoomTrim === '' ||
        classLevelStr.includes(searchRoomTrim) ||
        classLevelLabel.includes(searchRoomTrim) ||
        classRoomStr.includes(searchRoomTrim);
    }
    // filter ประเภท
    const typeMatch = !selectedType || c.behavior_type === selectedType;
    return nameMatch && roomMatch && typeMatch;
  });
  // Pagination logic
  const totalPages = Math.ceil(filteredCases.length / casesPerPage) || 1;
  const paginatedCases = filteredCases.slice((currentPage - 1) * casesPerPage, currentPage * casesPerPage);
  useEffect(() => {
    setCurrentPage(1);
  }, [searchName, searchRoom]);

  // SWEETALERT2 DELETE
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'ยืนยันการลบเคสนี้?',
      text: 'หากลบแล้วจะไม่สามารถกู้คืนได้',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'ลบ',
      cancelButtonText: 'ยกเลิก',
    });
    if (result.isConfirmed) {
      try {
        const res = await fetch(`https://student-main-behavior-backend.onrender.com/api/cases/${id}`, { 
          method: 'DELETE' 
        });
        
        if (!res.ok) {
          const data = await res.json();
          Swal.fire('เกิดข้อผิดพลาด', data.message || 'ไม่สามารถลบเคสได้', 'error');
        } else {
          setCases(cases => cases.filter(c => c.id !== id));
          Swal.fire('ลบสำเร็จ!', 'เคสถูกลบแล้ว', 'success');
        }
      } catch (err) {
        Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์', 'error');
      }
    }
  };

  // MODAL EDIT
  const handleEdit = (id) => {
    setAddModalOpen(false); // Always close Add modal before opening Edit
    const found = cases.find(c => c.id === id);
    setEditCase(found);
  };
  const handleEditModalClose = () => setEditCase(null);
  const handleEditModalSave = async (updated) => {
    try {
      const res = await fetch(`https://student-main-behavior-backend.onrender.com/api/cases/${updated.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      if (!res.ok) {
        const data = await res.json();
        Swal.fire('เกิดข้อผิดพลาด', data.message || 'ไม่สามารถบันทึกข้อมูลได้', 'error');
      } else {
        setCases(cases => cases.map(c => c.id === updated.id ? { ...c, ...updated } : c));
        setEditCase(null);
        Swal.fire('บันทึกสำเร็จ', '', 'success');
      }
    } catch (err) {
      Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์', 'error');
    }
  };

  // MODAL ADD
  const handleAddClick = () => {
    setEditCase(null); // Always close Edit modal before opening Add
    setAddModalOpen(true);
  };

  // ADD CASE MODAL
  const handleAddModalSave = async (newCase) => {
    try {
      const res = await fetch('https://student-main-behavior-backend.onrender.com/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCase),
      });
      if (!res.ok) {
        const data = await res.json();
        Swal.fire('เกิดข้อผิดพลาด', data.message || 'ไม่สามารถเพิ่มเคสได้', 'error');
      } else {
        const created = await res.json();
        setCases(cases => [created, ...cases]);
        setAddModalOpen(false);
        Swal.fire('เพิ่มเคสสำเร็จ', '', 'success');
      }
    } catch (err) {
      Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์', 'error');
    }
  };

  // เพิ่มฟังก์ชัน export CSV
  function generateCSV(selectedCases) {
    if (!selectedCases || selectedCases.length === 0) return;
    // กำหนดหัวตาราง CSV
    const headers = [
      'ชื่อ', 'นามสกุล', 'เลขประจำตัว', 'ชั้น', 'ห้อง', 'ประเภท', 'พฤติกรรม', 'รายละเอียด', 'รอบ', 'แผนการดำเนินการ', 'ผู้รายงาน', 'วันที่รายงาน', 'สถานะ'
    ];
    // สร้างข้อมูลแต่ละแถว
    const rows = selectedCases.map(c => [
      c.first_name || '',
      c.last_name || '',
      c.student_code || '',
      c.class_level || '',
      c.class_room || '',
      c.behavior_type || '',
      c.behavior_name || '',
      c.case_description || '',
      c.round || '',
      c.action_plan || '',
      c.reporter_name || '',
      c.reported_at ? c.reported_at.split('T')[0] : '',
      c.status || ''
    ]);
    // รวมเป็น string CSV (รองรับภาษาไทย)
    const csvContent = [headers, ...rows]
      .map(row => row.map(field => '"' + String(field).replace(/"/g, '""') + '"').join(','))
      .join('\r\n');
    // สร้าง blob และ trigger download
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cases.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // ฟังก์ชัน export PDF (1 เคส 1 หน้า, รูปแบบฟอร์มราชการ)
  async function generatePDF(selectedCases) {
    if (!selectedCases || selectedCases.length === 0) return;
    // โหลดฟอนต์ Sarabun-Thin
    const fontUrl = sarabunThin;
    const fontName = 'SarabunThin';
    // Fetch font as ArrayBuffer
    const fontBuffer = await fetch(fontUrl).then(res => res.arrayBuffer());
    function arrayBufferToBase64(buffer) {
      let binary = '';
      const bytes = new Uint8Array(buffer);
      const len = bytes.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return window.btoa(binary);
    }
    const fontBase64 = arrayBufferToBase64(fontBuffer);

    // โหลดโลโก้ครุฑ (image.png)
    async function getLogoBase64() {
      const response = await fetch('/image.png');
      const blob = await response.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
    }
    const logoBase64 = await getLogoBase64();

    // ฟังก์ชันแปลงวันที่เป็นไทย
    function formatDateThai(dateStr) {
      if (!dateStr) return '';
      const d = new Date(dateStr);
      const day = d.getDate();
      const month = d.getMonth() + 1;
      const year = d.getFullYear() + 543;
      return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
    }
    // ถ้าไม่มีวันที่ในข้อมูล ให้ใช้วันที่ปัจจุบัน
    function getTodayThai() {
      const d = new Date();
      const day = d.getDate();
      const month = d.getMonth() + 1;
      const year = d.getFullYear() + 543;
      return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
    }

    // สร้าง PDF
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    doc.addFileToVFS('Sarabun-Thin.ttf', fontBase64);
    doc.addFont('Sarabun-Thin.ttf', fontName, 'normal');
    doc.setFont(fontName);

    selectedCases.forEach((c, idx) => {
      if (idx > 0) doc.addPage();
      let y = 40;
      // โลโก้ครุฑ
      if (logoBase64) {
        doc.addImage(logoBase64, 'PNG', 260, y, 60, 60);
      }
      y += 90; // ขยับลงมาอีก (จาก 70 เป็น 90)
      doc.setFontSize(18);
      doc.text('บันทึกข้อความ', 230, y);
      y += 40; // ขยับลงอีก
      doc.setFontSize(13);
      doc.text('ส่วนราชการ  โรงเรียนวชิรธรรมสาธิต', 60, y);
      y += 20;
      doc.text('ที่ ........................................................................................................................', 60, y);
      // วันที่
      const dateText = c.reported_at ? formatDateThai(c.reported_at) : getTodayThai();
      doc.text(`วันที่ ${dateText}`, 420, y);
      y += 24;
      doc.text('เรื่อง  รายงานการประพฤติผิดวินัยของโรงเรียน', 60, y);
      y += 24;
      doc.text('เรียน  ผู้อำนวยการโรงเรียนวชิรธรรมสาธิต', 60, y);
      y += 24;
      // ข้อมูลนักเรียน
      const fullName = `${c.first_name || ''} ${c.last_name || ''}`;
      // ชื่อ
      doc.text(`เนื่องจาก (ด.ช./ด.ญ./นาย/นางสาว) ${fullName}`, 100, y);
      // เส้นใต้ชื่อ
      const nameWidth = doc.getTextWidth(`เนื่องจาก (ด.ช./ด.ญ./นาย/นางสาว) ${fullName}`);
      doc.setLineDashPattern([2, 2], 0);
      doc.line(100 + 170, y + 2, 100 + 170 + doc.getTextWidth(fullName), y + 2);
      doc.setLineDashPattern([], 0);
      y += 24;
      // ชั้น ห้อง เลขประจำตัว
      const classText = `ชั้น ${c.class_level || ''}`;
      const roomText = `ห้อง ${c.class_room || ''}`;
      const codeText = `เลขประจำตัว ${c.student_code || ''}`;
      doc.text(`${classText} ${roomText} ${codeText} ได้ประพฤติผิดระเบียบวินัยของโรงเรียนวชิรธรรมสาธิต`, 60, y);
      // เส้นใต้ชั้น ห้อง เลขประจำตัว
      let xClass = 60 + doc.getTextWidth('ชั้น ');
      doc.setLineDashPattern([2, 2], 0);
      doc.line(xClass, y + 2, xClass + doc.getTextWidth(c.class_level || ''), y + 2);
      doc.setLineDashPattern([], 0);
      let xRoom = xClass + doc.getTextWidth((c.class_level || '') + ' ห้อง ');
      doc.setLineDashPattern([2, 2], 0);
      doc.line(xRoom, y + 2, xRoom + doc.getTextWidth(c.class_room || ''), y + 2);
      doc.setLineDashPattern([], 0);
      let xCode = xRoom + doc.getTextWidth((c.class_room || '') + ' เลขประจำตัว ');
      doc.setLineDashPattern([2, 2], 0);
      doc.line(xCode, y + 2, xCode + doc.getTextWidth(c.student_code || ''), y + 2);
      doc.setLineDashPattern([], 0);
      y += 24;
      doc.text('มีพฤติกรรมไม่เหมาะสมแก่สภาพนักเรียน ตามระเบียบโรงเรียนวชิรธรรมสาธิต ดังนี้', 60, y);
      y += 20;
      doc.setFontSize(12);
      // ประเภท
      doc.text(`ประเภท: ${c.behavior_type || '-'}`, 80, y);
      if (c.behavior_type) {
        let xType = 80 + doc.getTextWidth('ประเภท: ');
        doc.setLineDashPattern([2, 2], 0);
        doc.line(xType, y + 2, xType + doc.getTextWidth(c.behavior_type), y + 2);
        doc.setLineDashPattern([], 0);
      }
      y += 18;
      // พฤติกรรม
      doc.text(`พฤติกรรม: ${c.behavior_name || '-'}`, 80, y);
      if (c.behavior_name) {
        let xBeh = 80 + doc.getTextWidth('พฤติกรรม: ');
        doc.setLineDashPattern([2, 2], 0);
        doc.line(xBeh, y + 2, xBeh + doc.getTextWidth(c.behavior_name), y + 2);
        doc.setLineDashPattern([], 0);
      }
      y += 18;
      // รายละเอียด
      doc.text(`รายละเอียด: ${c.case_description || '-'}`, 80, y, { maxWidth: 420 });
      if (c.case_description) {
        let xDesc = 80 + doc.getTextWidth('รายละเอียด: ');
        let descWidth = doc.getTextWidth(c.case_description);
        doc.setLineDashPattern([2, 2], 0);
        doc.line(xDesc, y + 2, xDesc + Math.min(descWidth, 420), y + 2);
        doc.setLineDashPattern([], 0);
      }
      y += 36;
      // รอบ
      doc.text(`รอบการทำทัณฑ์บน : ${c.round || '-'}`, 80, y);
      if (c.round) {
        let xRound = 80 + doc.getTextWidth('รอบการทำทัณฑ์บน : ');
        doc.setLineDashPattern([2, 2], 0);
        doc.line(xRound, y + 2, xRound + doc.getTextWidth(c.round), y + 2);
        doc.setLineDashPattern([], 0);
      }
      y += 18;
      // แผนการดำเนินการ
      doc.text(`แผนการดำเนินการ: ${c.action_plan || '-'}`, 80, y, { maxWidth: 420 });
      if (c.action_plan) {
        let xPlan = 80 + doc.getTextWidth('แผนการดำเนินการ: ');
        let planWidth = doc.getTextWidth(c.action_plan);
        doc.setLineDashPattern([2, 2], 0);
        doc.line(xPlan, y + 2, xPlan + Math.min(planWidth, 420), y + 2);
        doc.setLineDashPattern([], 0);
      }
      y += 36;
      doc.setFontSize(13);
      doc.text('ข้าพเจ้าได้ดำเนินการตามแนวปฏิบัติในการควบคุมความประพฤตินักเรียน และทำการติดต่อแนะนำ', 60, y); y += 18;
      doc.text('ความประพฤตินักเรียนและแจ้งผู้ปกครองรับทราบแล้ว จึงเรียนมาเพื่อโปรดทราบ', 60, y); y += 36;
      // ช่องลายเซ็น
      doc.text('(.............................................)', 80, y);
      doc.text('(.............................................)', 320, y);
      y += 18;
      doc.text('ครูที่ปรึกษาคนที่ 1', 100, y);
      doc.text('ครูที่ปรึกษาคนที่ 2', 340, y);
      y += 36;
      doc.text('(.............................................)', 80, y);
      doc.text('(.............................................)', 320, y);
      y += 18;
      doc.text('หัวหน้าระดับ ชั้น ม. ....', 90, y);
      doc.text('หัวหน้างาน................', 340, y);
      y += 36;
      // เส้นปะยาวๆ ก่อนชื่อ (นางอรอนงค์ ชาญชอบ) และ (นางสาวมณี ทองทวี)
      doc.setLineDashPattern([2, 2], 0);
      doc.line(80, y, 200, y); // ฝั่งซ้าย
      doc.line(320, y, 440, y); // ฝั่งขวา
      doc.setLineDashPattern([], 0);
      y += 18;
      doc.text('(นางอรอนงค์ ชาญชอบ)', 80, y);
      doc.text('(นางสาวมณี ทองทวี)', 320, y);
      y += 18;
      doc.text('หัวหน้ากลุ่มบริหารงานบุคคล', 80, y);
      doc.text('รองผู้อำนวยการกลุ่มบริหารงานบุคคล', 320, y);

      // --- หน้าสอง: ฟอร์มสอบสวน (ปรับปรุงใหม่) ---
      doc.addPage();
      y = 60;
      doc.setFontSize(18);
      doc.text('แบบบันทึกการสอบสวน', 297.5, y, { align: 'center' }); // กึ่งกลาง A4
      y += 30;
      doc.setFontSize(12);
      doc.text('โรงเรียนวชิรธรรมสาธิต', 400, y);
      doc.text(`วันที่ ${c.reported_at ? formatDateThai(c.reported_at) : getTodayThai()}`, 60, y);
      y += 24;
      doc.text('เรื่อง', 60, y);
      doc.text('เรียน ผู้อำนวยการโรงเรียนวชิรธรรมสาธิต', 120, y);
      y += 24;
      doc.text(`ชั้น ${c.class_level || ''}`, 60, y);
      doc.text(`เลขประจำตัว ${c.student_code || ''}`, 150, y);
      doc.text(`ครั้งที่สอบสวนชื่อ ${c.first_name || ''} ${c.last_name || ''}`, 300, y);
      y += 24;
      doc.text(`ชื่อผู้ปกครอง: ${c.guardian_name || '-'}`, 60, y);
      doc.text(`ความสัมพันธ์: ${c.guardian_relation || '-'}`, 300, y);
      doc.text(`โทรศัพท์: ${c.contact_info || '-'}`, 450, y);
      y += 28;
      // กล่องบันทึกเหตุการณ์
      doc.text('บันทึกเหตุการณ์', 60, y);
      y += 8;
      doc.rect(60, y, 480, 50);
      y += 60;
      // กล่องความเห็น (แบ่ง 2 คอลัมน์)
      const col1X = 60, col2X = 320, boxW = 220, boxH = 40;
      doc.text('ความเห็นของหัวหน้าระดับ/ผู้รับมอบอำนาจ', col1X, y);
      doc.text('ความเห็นของหัวหน้างาน', col2X, y);
      y += 6;
      doc.rect(col1X, y, boxW, boxH);
      doc.rect(col2X, y, boxW, boxH);
      y += boxH + 10;
      doc.text('ลงชื่อ.........................................................', col1X, y);
      doc.text('ชั้น ม. ....', col1X + 140, y);
      doc.text('ลงชื่อ.........................................................', col2X, y);
      doc.text('ชั้น ม. ....', col2X + 140, y);
      y += 30;
      // กล่องความเห็น (แบ่ง 2 คอลัมน์ ล่าง)
      doc.text('ความเห็นของหัวหน้ากลุ่มบริหารงานบุคคล', col1X, y);
      doc.text('ความเห็นของรองผู้อำนวยการกลุ่มบริหารงานบุคคล', col2X, y);
      y += 6;
      doc.rect(col1X, y, boxW, boxH);
      doc.rect(col2X, y, boxW, boxH);
      y += boxH + 10;
      doc.text('ลงชื่อ.........................................................', col1X, y);
      doc.text('(นางอรอนงค์ ชาญชอบ)', col1X, y + 16);
      doc.text('ลงชื่อ.........................................................', col2X, y);
      doc.text('(นางสาวมณี ทองทวี)', col2X, y + 16);
      // กล่องลายเซ็นนักเรียน/ครูที่ปรึกษา
      y += 36;
      doc.text('ลงชื่อ.........................................................', col1X, y);
      doc.text('นักเรียนผู้บันทึก', col1X + 140, y);
      doc.text('ลงชื่อ.........................................................', col2X, y);
      doc.text('ครูที่ปรึกษา', col2X + 100, y);

      // --- หน้า 3: หลักฐานการพบผู้ปกครอง (ปรับช่องไฟ) ---
      doc.addPage();
      y = 60;
      doc.setFontSize(18);
      doc.text('หลักฐานการพบผู้ปกครอง', 297.5, y, { align: 'center' });
      y += 28;
      doc.setFontSize(12);
      doc.text('โรงเรียนวชิรธรรมสาธิต', 400, y);
      doc.text('1253 สุขุมวิท 101/1', 400, y + 16);
      doc.text('เขตพระโขนง กทม. 10260', 400, y + 32);
      doc.text(`วันที่ ${c.reported_at ? formatDateThai(c.reported_at) : getTodayThai()}`, 60, y);
      y += 48;

      doc.text('เรียน  ผู้อำนวยการโรงเรียนวชิรธรรมสาธิต', 60, y);
      y += 24;

      doc.text(`นักเรียนชั้น ม.${c.class_level || ''} เลขประจำตัว ${c.student_code || ''} ชื่อ ${c.first_name || ''} ${c.last_name || ''}`, 60, y);
      doc.text(`ผู้ปกครอง: ${c.guardian_name || '-'}`, 380, y);
      y += 22;

      doc.text('ได้พบกับ:', 60, y);
      doc.text('ครูที่ปรึกษา ...........................................', 120, y);
      doc.text('หัวหน้าระดับ ...........................................', 320, y);
      y += 20;
      doc.text('ผู้ช่วยผู้อำนวยการฯ ...........................................', 60, y);
      doc.text('รองผู้อำนวยการกลุ่มบริหารงานบุคคล ...........................................', 320, y);
      y += 22;

      doc.text('ในวันที่ .......... เดือน .......... พ.ศ. ..........  ณ ห้อง ..........', 60, y);
      y += 22;

      doc.text('และได้รับทราบปัญหาพฤติกรรมที่ลูก ๆ ของตนได้มีปัญหาตามที่โรงเรียนแจ้งให้ทราบดังนี้', 60, y);
      y += 18;
      doc.text('................................................................................................................................................................................', 60, y);
      y += 16;
      doc.text('................................................................................................................................................................................', 60, y);
      y += 16;
      doc.text('................................................................................................................................................................................', 60, y);
      y += 24;

      doc.text('ข้าพเจ้ายินยอมร่วมมือกับทางโรงเรียนเพื่อการแก้ปัญหาดังกล่าว โดยการลงชื่อยินยอมตามข้างต้น', 60, y);
      y += 24;

      doc.text('ลงชื่อ......................................................... ผู้ปกครอง', 60, y);
      doc.text('(.........................................................)', 60, y + 16);
      doc.text('ลงชื่อ.........................................................', 320, y);
      doc.text('(.........................................................)', 320, y + 16);
      y += 40;

      doc.text('ครูที่ปรึกษา ชั้น ม. .........', 60, y);
      doc.text('หัวหน้าระดับชั้น ม. .........', 320, y);
      y += 20;
      doc.text('ลงชื่อ.........................................................', 60, y);
      doc.text('หัวหน้างาน.........................................................', 320, y);
      y += 20;
      doc.text('(นางอรอนงค์ ชาญชอบ)', 60, y);
      doc.text('(นางสาวมณี ทองทวี)', 320, y);

      // --- หน้า 4: บันทึกทัณฑ์บน (ตามฟอร์มภาพ) ---
      doc.addPage();
      y = 60;
      doc.setFontSize(18);
      doc.text('บันทึกทัณฑ์บน', 297.5, y, { align: 'center' });
      y += 24;
      doc.setFontSize(12);
      doc.text('โรงเรียนวชิรธรรมสาธิต', 400, y);
      doc.text(`วันที่ ${c.reported_at ? formatDateThai(c.reported_at) : getTodayThai()}`, 60, y);
      y += 24;

      doc.text(`ชั้น ม.${c.class_level || ''} เลขประจำตัว ${c.student_code || ''} ชื่อ ${c.first_name || ''} ${c.last_name || ''}`, 60, y);
      y += 20;
      doc.text(`กับโรงเรียนต่อหน้าผู้ปกครองชื่อ ${c.guardian_name || '............................................................'}`, 60, y);
      y += 20;
      doc.text('ส่งให้ครูที่ปรึกษาเพื่อดำเนินการดังนี้', 60, y);
      y += 20;

      doc.text('ข้อที่ 1. ข้าพเจ้าได้ประพฤติตนไม่เหมาะสมกับสถานะนักเรียน ดังระเบียบฯ คือ', 60, y);
      y += 20;
      doc.text('................................................................................................................................................................................', 60, y);
      y += 16;
      doc.text('................................................................................................................................................................................', 60, y);
      y += 16;
      doc.text('................................................................................................................................................................................', 60, y);
      y += 20;

      doc.text('ข้อที่ 2. ข้าพเจ้าขอยอมรับว่า ความผิดดังกล่าวข้างต้น เป็นความจริงทุกประการ', 60, y);
      y += 20;

      doc.text('ข้อที่ 3. ข้าพเจ้าจะปฏิบัติตามข้อตกลงที่กำหนดในมาตรการควบคุมความประพฤตินักเรียน ดังนี้', 60, y);
      y += 20;

      // ช่องติ๊กแบบ box
      const boxX4 = 80, boxW4 = 10, boxH4 = 10, textOffset4 = 16;
      doc.rect(boxX4, y - boxH4 + 2, boxW4, boxH4); // box 1
      doc.text('ทำทัณฑ์บนครั้งที่ 1', boxX4 + textOffset4, y + 2);
      y += 18;
      doc.rect(boxX4, y - boxH4 + 2, boxW4, boxH4); // box 2
      doc.text('ทำทัณฑ์บนครั้งที่ 2', boxX4 + textOffset4, y + 2);
      y += 18;
      doc.rect(boxX4, y - boxH4 + 2, boxW4, boxH4); // box 3
      doc.text('ควบคุมความประพฤติ โดยรายงานตัวกับหัวหน้าระดับ/หัวหน้างาน/รองผู้อำนวยการฯ', boxX4 + textOffset4, y + 2);
      y += 18;
      doc.rect(boxX4, y - boxH4 + 2, boxW4, boxH4); // box 4
      doc.text('นักเรียนเรียนซ้ำผ่านช่องทาง W.T.S Platform เป็นระยะเวลา .......... วัน .......... ชั่วโมง', boxX4 + textOffset4, y + 2);
      y += 18;
      doc.rect(boxX4, y - boxH4 + 2, boxW4, boxH4); // box 5
      doc.text('อื่น ๆ ....................................................................................................................', boxX4 + textOffset4, y + 2);
      y += 24;

      doc.text('ข้อที่ 4. ข้าพเจ้าได้ทราบถึงความผิดดังกล่าวแล้ว ขอให้ผ่านบันทึกทัณฑ์บนนี้', 60, y);
      y += 20;
      doc.text('ข้อที่ 5. ข้าพเจ้าขอรับรองว่าจะไม่กระทำผิดซ้ำอีก หากข้าพเจ้าประพฤติผิดซ้ำจะยอมรับโทษตามระเบียบของโรงเรียนวชิรธรรมสาธิต', 60, y, { maxWidth: 420 });
      // เว้นบรรทัดหลังข้อความ wrap
      const text5 = 'ข้อที่ 5. ข้าพเจ้าขอรับรองว่าจะไม่กระทำผิดซ้ำอีก หากข้าพเจ้าประพฤติผิดซ้ำจะยอมรับโทษตามระเบียบของโรงเรียนวชิรธรรมสาธิต';
      const lines5 = doc.splitTextToSize(text5, 420);
      doc.text(lines5, 60, y);
      y += lines5.length * 18 + 6; // 18px ต่อบรรทัด + เว้นท้าย

      // ลายเซ็น
      doc.text('ลงชื่อ......................................................... ผู้ทัณฑ์บน', 60, y);
      doc.text('ลงชื่อ......................................................... ผู้ปกครอง', 320, y);
      y += 16;
      doc.text(`ลงชื่อ......................................................... ${c.advisor_name ? 'ครูที่ปรึกษา' : 'ครูที่ปรึกษาคนที่ 1'}`, 60, y);
      doc.text('ลงชื่อ......................................................... ครูที่ปรึกษาคนที่ 2', 320, y);
      y += 16;
      doc.text('ลงชื่อ......................................................... หัวหน้ากลุ่มบริหารงานบุคคล', 60, y);
      doc.text('ลงชื่อ......................................................... รองผู้อำนวยการกลุ่มบริหารงานบุคคล', 320, y);
      y += 24;
      doc.text('(นายรามณรงค์ โลแสน)', 60, y);
      doc.text('ผู้อำนวยการโรงเรียนวชิรธรรมสาธิต', 60, y + 16);
    });
    doc.save('cases.pdf');
  }














  return (
    <div style={{
      width: '100%',
      margin: '80px 0 0 0',
      padding: '0 16px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start',
      minHeight: 'calc(100vh - 80px)',
      background: 'transparent',
    }}>
      <div style={{
        width: '100%',
        background: 'var(--card-bg, #fff)',
        borderRadius: 18,
        boxShadow: '0 4px 32px 0 #2563eb18',
        padding: 32,
        margin: '0',
        border: '1px solid #e5e7eb',
        position: 'relative',
        transition: 'box-shadow 0.3s',
      }}>
        {/* ปุ่ม Export CSV ด้านบนตาราง */}
        {/* <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <button
            style={{
              background: '#2563eb',
              color: '#fff',
              padding: '8px 18px',
              borderRadius: 8,
              fontWeight: 700,
              fontSize: 16,
              border: 'none',
              cursor: selected.length === 0 ? 'not-allowed' : 'pointer',
              opacity: selected.length === 0 ? 0.5 : 1
            }}
            disabled={selected.length === 0}
            onClick={() => generateCSV(cases.filter(c => selected.includes(c.id)))}
          >
            Export CSV
          </button>
        </div> */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontWeight: 800, fontSize: 32, color: 'var(--primary, #222)', letterSpacing: 1, margin: 0 , color: '#222'}}>จัดการเคส/เหตุการณ์</h2>
          <button
            onClick={handleAddClick}
            style={{ background: 'var(--color-primary)', color: 'var(--color-primary-contrast)', padding: '8px 16px', borderRadius: 10, fontWeight: 700, fontSize: 15, boxShadow: '0 2px 8px var(--color-primary, #2563eb22)', transition: 'background 0.2s', border: 'none', cursor: 'pointer', width: '100%', maxWidth: 200 }}
          >
            + เพิ่มเคส
          </button>
        </div>
        <div style={{ display: 'flex', gap: 14, marginBottom: 18, flexWrap: 'nowrap', alignItems: 'center', overflowX: 'auto' }}>
          {/* ปุ่มค้นหาประเภท */}
          <select
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
            style={{ padding: 10, borderRadius: 8, border: '1px solid #cbd5e1', minWidth: 160, fontSize: 16 }}
          >
            <option value="">-- ค้นหาประเภท --</option>
            {allTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="ค้นหาชื่อ-นามสกุลนักเรียน"
            value={searchName}
            onChange={e => setSearchName(e.target.value)}
            style={{ padding: 10, borderRadius: 8, border: '1px solid #cbd5e1', minWidth: 180, fontSize: 16 }}
          />
          <input
            type="text"
            placeholder="ค้นหา ชั้น / ห้อง"
            value={searchRoom}
            onChange={e => setSearchRoom(e.target.value)}
            style={{ padding: 10, borderRadius: 8, border: '1px solid #cbd5e1', minWidth: 120, fontSize: 16 }}
          />
          {/* Export CSV button moved here */}
          <button
            style={{
              background: '#2563eb',
              color: '#fff',
              padding: '8px 18px',
              borderRadius: 8,
              fontWeight: 700,
              fontSize: 16,
              border: 'none',
              cursor: selected.length === 0 ? 'not-allowed' : 'pointer',
              opacity: selected.length === 0 ? 0.5 : 1,
              marginLeft: 8
            }}
            disabled={selected.length === 0}
            onClick={() => generateCSV(cases.filter(c => selected.includes(c.id)))}
          >
            Export CSV
          </button>
          {/* Export PDF button */}
          <button
            style={{
              background: '#10b981',
              color: '#fff',
              padding: '8px 18px',
              borderRadius: 8,
              fontWeight: 700,
              fontSize: 16,
              border: 'none',
              cursor: selected.length === 0 ? 'not-allowed' : 'pointer',
              opacity: selected.length === 0 ? 0.5 : 1,
              marginLeft: 4
            }}
            disabled={selected.length === 0}
            onClick={() => generatePDF(cases.filter(c => selected.includes(c.id)))}
          >
            Export PDF
          </button>
          <div style={{ display: 'flex', gap: 8 }}>
          </div>
        </div>
        {/* Pagination controls moved here */}
        {filteredCases.length > casesPerPage && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, marginBottom: 18 }}>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{ padding: '6px 18px', borderRadius: 8, border: '1px solid #cbd5e1', background: currentPage === 1 ? '#f1f5f9' : '#fff', color: '#222', fontWeight: 600, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
            >
              ก่อนหน้า
            </button>
            <span style={{ fontWeight: 600, color: '#2563eb' }}>หน้า {currentPage} / {totalPages}</span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              style={{ padding: '6px 18px', borderRadius: 8, border: '1px solid #cbd5e1', background: currentPage === totalPages ? '#f1f5f9' : '#fff', color: '#222', fontWeight: 600, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
            >
              ถัดไป
            </button>
          </div>
        )}
        {loading ? (
          <SkeletonTable />
        ) : error ? (
          <div style={{ color: 'red', padding: 24, textAlign: 'center' }}>{error}</div>
        ) : (
          <div style={{ overflowX: 'auto', transition: 'box-shadow 0.3s' }} className="cases-table-scroll">
            <table style={{ width: '100%', minWidth: '100%', borderCollapse: 'collapse', fontSize: 15, background: 'transparent', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 8px #2563eb11', transition: 'box-shadow 0.3s' }} className="cases-table-responsive">
              <thead>
                <tr style={{ background: 'var(--table-head, #f1f5f9)', transition: 'background 0.3s' }}>
                  {/* เพิ่ม checkbox ที่หัวตาราง */}
                  <th style={{ padding: 10, border: '1px solid #e5e7eb', textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={selected.length === paginatedCases.length && paginatedCases.length > 0}
                      onChange={e => {
                        if (e.target.checked) {
                          setSelected(paginatedCases.map(c => c.id));
                        } else {
                          setSelected([]);
                        }
                      }}
                    />
                  </th>
                  <th style={{ padding: 10, border: '1px solid #e5e7eb', textAlign: 'center' }}>#</th>
                  <th style={{ padding: 10, border: '1px solid #e5e7eb' }}>ประเภท</th>
                  <th style={{ padding: 10, border: '1px solid #e5e7eb' }}>รายละเอียด</th>
                  <th style={{ padding: 10, border: '1px solid #e5e7eb' }}>นักเรียน</th>
                  <th style={{ padding: 10, border: '1px solid #e5e7eb', textAlign: 'center' }}>ชั้น</th>
                  <th style={{ padding: 10, border: '1px solid #e5e7eb', textAlign: 'center' }}>ห้อง</th>
                  <th style={{ padding: 10, border: '1px solid #e5e7eb' }}>พฤติกรรม</th>
                  <th style={{ padding: 10, border: '1px solid #e5e7eb' }}>รอบ</th>
                  <th style={{ padding: 10, border: '1px solid #e5e7eb' }}>แผนการดำเนินการ</th>
                  <th style={{ padding: 10, border: '1px solid #e5e7eb' }}>ผู้รายงาน</th>
                  <th style={{ padding: 10, border: '1px solid #e5e7eb', textAlign: 'center' }}>สถานะ</th>
                  <th style={{ padding: 10, border: '1px solid #e5e7eb', textAlign: 'center' }}>วันที่รายงาน</th>
                  <th style={{ padding: 10, border: '1px solid #e5e7eb', textAlign: 'center', minWidth: 80 }}>การจัดการ</th>
                </tr>
              </thead>
              <tbody>
                {filteredCases.length === 0 ? (
                  <tr><td colSpan={14} style={{ textAlign: 'center', padding: 24 }}>ไม่มีข้อมูล</td></tr>
                ) : paginatedCases.map((c, idx) => (
                  <tr key={c.id} style={{ transition: 'background 0.22s', background: selected.includes(c.id) ? '#e0f2fe' : 'transparent' }}>
                    {/* เพิ่ม checkbox ในแต่ละแถว */}
                    <td style={{ padding: 10, border: '1px solid #e5e7eb', textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={selected.includes(c.id)}
                        onChange={e => {
                          if (e.target.checked) {
                            setSelected(sel => [...sel, c.id]);
                          } else {
                            setSelected(sel => sel.filter(id => id !== c.id));
                          }
                        }}
                      />
                    </td>
                    <td style={{ padding: 10, border: '1px solid #e5e7eb', textAlign: 'center' }}>{(currentPage - 1) * casesPerPage + idx + 1}</td>
                    <td style={{ padding: 10, border: '1px solid #e5e7eb' }}>{c.behavior_type || '-'}</td>
                    <td style={{ padding: 10, border: '1px solid #e5e7eb' }}>{c.case_description || '-'}</td>
                    <td style={{ padding: 10, border: '1px solid #e5e7eb' }}>{c.first_name ? `${c.first_name} ${c.last_name}` : '-'}</td>
                    <td style={{ padding: 10, border: '1px solid #e5e7eb', textAlign: 'center' }}>{c.class_level || '-'}</td>
                    <td style={{ padding: 10, border: '1px solid #e5e7eb', textAlign: 'center' }}>{c.class_room || '-'}</td>
                    <td style={{ padding: 10, border: '1px solid #e5e7eb' }}>{c.behavior_name || '-'}</td>
                    <td style={{ padding: 10, border: '1px solid #e5e7eb' }}>{c.round || '-'}</td>
                    <td style={{ padding: 10, border: '1px solid #e5e7eb' }}>{c.action_plan || '-'}</td>
                    <td style={{ padding: 10, border: '1px solid #e5e7eb' }}>{c.reporter_name || '-'}</td>
                    <td style={{ padding: 10, border: '1px solid #e5e7eb', textAlign: 'center' }}>
                      {c.status === 'open' ? (
                        <span style={{ color: '#10b981', fontWeight: 700 }}>ดำเนินการแล้ว</span>
                      ) : c.status === 'in_progress' ? (
                        <span style={{ color: '#f59e42', fontWeight: 700 }}>กำลังดำเนินการ</span>
                      ) : c.status === 'closed' ? (
                        <span style={{ color: '#ef4444', fontWeight: 700 }}>ละทิ้ง</span>
                      ) : c.status}
                    </td>
                    <td style={{ padding: 10, border: '1px solid #e5e7eb', textAlign: 'center' }}>{c.reported_at ? c.reported_at.split('T')[0] : '-'}</td>
                    <td style={{ padding: 10, border: '1px solid #e5e7eb', textAlign: 'center', minWidth: 80 }}>
                      <button
                        onClick={() => handleEdit(c.id)}
                        title={user.role === 'teacher' ? "ไม่มีสิทธิ์แก้ไข" : "แก้ไข"}
                        disabled={user.role === 'teacher'}
                        style={{
                          marginRight: 8,
                          background: 'none',
                          border: 'none',
                          padding: 6,
                          borderRadius: 8,
                          cursor: user.role === 'teacher' ? 'not-allowed' : 'pointer',
                          width: 36,
                          height: 36,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          opacity: user.role === 'teacher' ? 0.5 : 1
                        }}
                      >
                        <EditIcon size={28} />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        title={user.role === 'teacher' ? "ไม่มีสิทธิ์ลบ" : "ลบ"}
                        disabled={user.role === 'teacher'}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: 6,
                          borderRadius: 8,
                          cursor: user.role === 'teacher' ? 'not-allowed' : 'pointer',
                          width: 36,
                          height: 36,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          opacity: user.role === 'teacher' ? 0.5 : 1
                        }}
                      >
                        <DeleteIcon size={28} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Pagination controls removed from here */}
          </div>
        )}
      </div>
      {editCase && <EditCaseModal caseData={editCase} onClose={handleEditModalClose} onSave={handleEditModalSave} />}
      {addModalOpen && <AddCaseModal onClose={() => setAddModalOpen(false)} onSave={handleAddModalSave} userRole={user.role} />}
      <style>{`
        :root {
          --primary: #2563eb;
          --card-bg: #fff;
          --table-head: #f1f5f9;
        }
        body[data-theme='dark'] {
          --primary: #60a5fa;
          --card-bg: #1e293b;
          --table-head: #334155;
        }
        @media (max-width: 700px) {
          .cases-table-responsive {
            font-size: 13px !important;
            min-width: 100% !important;
          }
          .cases-table-responsive th, .cases-table-responsive td {
            padding: 7px !important;
          }
          .cases-table-responsive button {
            width: 32px !important;
            height: 32px !important;
            padding: 4px !important;
          }
          .cases-table-responsive svg {
            width: 22px !important;
            height: 22px !important;
          }
          input, select, textarea {
            font-size: 15px !important;
            padding: 7px !important;
          }
          .cases-table-scroll {
            overflow-x: auto;
            width: 100%;
          }
          .cases-table-responsive +div>button.btn.btn-primary, .cases-table-responsive ~ button.btn.btn-primary, .cases-table-responsive ~ div>button.btn.btn-primary {
            width: 100% !important;
            max-width: none !important;
            display: block !important;
            margin-bottom: 12px !important;
          }
        }
      `}</style>
    </div>
  )
}

function SkeletonTable() {
  // 5 rows, 11 cols
  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <table style={{ width: '100%', minWidth: '100%', borderCollapse: 'collapse', fontSize: 15 }}>
        <thead>
          <tr style={{ background: 'var(--table-head, #f1f5f9)' }}>
            {/* 14 columns: checkbox, #, ประเภท, รายละเอียด, นักเรียน, ชั้น, ห้อง, พฤติกรรม, รอบ, แผนการดำเนินการ, ผู้รายงาน, สถานะ, วันที่รายงาน, การจัดการ */}
            <th style={{ padding: 10, border: '1px solid #e5e7eb' }}>&nbsp;</th>
            <th style={{ padding: 10, border: '1px solid #e5e7eb' }}>&nbsp;</th>
            <th style={{ padding: 10, border: '1px solid #e5e7eb' }}>&nbsp;</th> {/* ประเภท */}
            <th style={{ padding: 10, border: '1px solid #e5e7eb' }}>&nbsp;</th> {/* รายละเอียด */}
            <th style={{ padding: 10, border: '1px solid #e5e7eb' }}>&nbsp;</th>
            <th style={{ padding: 10, border: '1px solid #e5e7eb' }}>&nbsp;</th>
            <th style={{ padding: 10, border: '1px solid #e5e7eb' }}>&nbsp;</th>
            <th style={{ padding: 10, border: '1px solid #e5e7eb' }}>&nbsp;</th>
            <th style={{ padding: 10, border: '1px solid #e5e7eb' }}>&nbsp;</th>
            <th style={{ padding: 10, border: '1px solid #e5e7eb' }}>&nbsp;</th>
            <th style={{ padding: 10, border: '1px solid #e5e7eb' }}>&nbsp;</th>
          </tr>
        </thead>
        <tbody>
          {[...Array(5)].map((_, r) => (
            <tr key={r}>
              {/* 14 columns: checkbox, #, ประเภท, รายละเอียด, นักเรียน, ชั้น, ห้อง, พฤติกรรม, รอบ, แผนการดำเนินการ, ผู้รายงาน, สถานะ, วันที่รายงาน, การจัดการ */}
              {[...Array(13)].map((_, c) => (
                <td key={c} style={{ padding: 10, border: '1px solid #e5e7eb' }}>
                  <div style={{
                    height: 16,
                    width: '80%',
                    background: 'linear-gradient(90deg, #e0e7ff 25%, #f1f5f9 50%, #e0e7ff 75%)',
                    borderRadius: 6,
                    animation: 'skeleton-loading 1.2s infinite linear',
                    margin: '0 auto',
                  }} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <style>{`
        @keyframes skeleton-loading {
          0% { opacity: 0.7; }
          50% { opacity: 1; }
          100% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}

// MODAL COMPONENT
function EditCaseModal({ caseData, onClose, onSave }) {
  const [form, setForm] = useState({ ...caseData });
  const [saving, setSaving] = useState(false);
  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };
  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(30,41,59,0.18)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <form onSubmit={handleSubmit} style={{ background: '#fff', borderRadius: 14, boxShadow: '0 8px 32px #2563eb33', padding: 32, minWidth: 340, maxWidth: 420, width: '100%', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <h3 style={{ margin: 0, fontWeight: 700, fontSize: 22, color: '#2563eb' }}>แก้ไขเคส</h3>
        <label style={{ color: '#222' }}>รายละเอียด
          <textarea name="case_description" value={form.case_description || ''} onChange={handleChange} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #cbd5e1', marginTop: 4, minHeight: 60 }} />
        </label>
        <label style={{ color: '#222' }}>รอบ
          <select name="round" value={form.round} onChange={handleChange} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #cbd5e1', marginTop: 4 }}>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
          </select>
        </label>
        <label style={{ color: '#222' }}>แผนการดำเนินการ
          <select name="action_plan" value={form.action_plan || ''} onChange={handleChange} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #cbd5e1', marginTop: 4 }}>
            <option value="">-- ไม่เลือก --</option>
            <option value="ควบคุมพฤติกรรม">ควบคุมพฤติกรรม</option>
            <option value="เรียนผ่านช่องทาง W.T.S Platform">เรียนผ่านช่องทาง W.T.S Platform</option>
            <option value="เข้าคณะ School Credits">เข้าคณะ School Credits</option>
          </select>
        </label>
        <label style={{ color: '#222' }}>สถานะ
          <select name="status" value={form.status} onChange={handleChange} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #cbd5e1', marginTop: 4 }}>
            <option value="open">open</option>
            <option value="in_progress">in_progress</option>
            <option value="closed">closed</option>
          </select>
        </label>
        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <button type="button" onClick={onClose} style={{ flex: 1, background: '#cbd5e1', color: '#334155', border: 'none', borderRadius: 8, padding: '10px 0', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>ยกเลิก</button>
          <button type="submit" disabled={saving} style={{ flex: 1, background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 0', fontWeight: 700, fontSize: 16, cursor: saving ? 'not-allowed' : 'pointer' }}>{saving ? 'กำลังบันทึก...' : 'บันทึก'}</button>
        </div>
      </form>
    </div>
  );
}

// MODAL ADD COMPONENT (copy logic from add.jsx)
function AddCaseModal({ onClose, onSave, userRole }) {
  const [form, setForm] = useState({
    student_id: '',
    behavior_id: '',
    reported_by: '',
    case_description: '',
    status: userRole === 'teacher' ? 'in_progress' : 'open',
    round: userRole === 'teacher' ? '1' : '1',
    action_plan: '',
  });
  const [students, setStudents] = useState([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [behaviors, setBehaviors] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reporterName, setReporterName] = useState('');

  useEffect(() => {
    fetch('https://student-main-behavior-backend.onrender.com/api/students').then(res => res.json()).then(setStudents);
    fetch('https://student-main-behavior-backend.onrender.com/api/behaviors').then(res => res.json()).then(setBehaviors);
    fetch('https://student-main-behavior-backend.onrender.com/api/admins').then(res => res.json()).then(setAdmins);
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setForm(f => ({ ...f, reported_by: user.id || '' }));
    setReporterName(user.full_name || user.username || '');
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ฟิลเตอร์นักเรียนตามรหัส/ชื่อ
  const filteredStudents = students.filter(s =>
    (s.student_code + ' ' + s.first_name + ' ' + s.last_name)
      .toLowerCase()
      .includes(studentSearch.toLowerCase())
  );

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onSave(form);
    } catch (err) {
      setError('เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(30,41,59,0.18)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <form onSubmit={handleSubmit} style={{ background: '#fff', borderRadius: 14, boxShadow: '0 8px 32px #2563eb33', padding: 32, minWidth: 340, maxWidth: 420, width: '100%', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <h3 style={{ margin: 0, fontWeight: 700, fontSize: 22, color: '#2563eb' }}>เพิ่มเคส</h3>
        <div>
          <label style={{ color: '#222' }}>นักเรียน <span style={{ color: 'red' }}>*</span></label>
          <input
            type="text"
            placeholder="ค้นหาด้วยรหัสนักเรียนหรือชื่อ"
            value={studentSearch}
            onChange={e => setStudentSearch(e.target.value)}
            style={{ width: '100%', padding: 8, marginTop: 4, borderRadius: 6, border: '1px solid #ddd', marginBottom: 8 }}
          />
          <select
            name="student_id"
            value={form.student_id}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ddd' }}
          >
            <option value="">-- เลือกนักเรียน --</option>
            {filteredStudents.map(s => (
              <option key={s.id} value={s.id}>{s.student_code} - {s.first_name} {s.last_name}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ color: '#222' }}>พฤติกรรม <span style={{ color: 'red' }}>*</span></label>
          <select
            name="behavior_id"
            value={form.behavior_id}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: 8, marginTop: 4, borderRadius: 6, border: '1px solid #ddd' }}
          >
            <option value="">-- เลือกพฤติกรรม --</option>
            {behaviors.map(b => (
              <option key={b.id} value={b.id}>{b.behavior_name}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ color: '#222' }}>ผู้รายงาน <span style={{ color: 'red' }}>*</span></label>
          <input
            type="text"
            value={reporterName}
            readOnly
            style={{ width: '100%', padding: 8, marginTop: 4, borderRadius: 6, border: '1px solid #ddd', background: '#f1f5f9' }}
          />
        </div>
        <div>
          <label style={{ color: '#222' }}>รายละเอียด</label>
          <textarea
            name="case_description"
            value={form.case_description}
            onChange={handleChange}
            rows={3}
            style={{ width: '100%', padding: 8, marginTop: 4, borderRadius: 6, border: '1px solid #ddd' }}
          />
        </div>
        <div style={{display: 'flex', gap: 12}}>
          <div style={{flex: 1}}>
            <label style={{ color: '#222' }}>รอบ</label>
            <select
              name="round"
              value={form.round}
              onChange={handleChange}
              disabled={userRole === 'teacher'}
              style={{
                width: '100%',
                padding: 8,
                marginTop: 4,
                borderRadius: 6,
                border: '1px solid #ddd',
                background: userRole === 'teacher' ? '#f1f5f9' : '#fff',
                cursor: userRole === 'teacher' ? 'not-allowed' : 'pointer'
              }}
            >
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
            </select>
          </div>
          <div style={{flex: 1}}>
            <label style={{ color: '#222' }}>สถานะ</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              disabled={userRole === 'teacher'}
              style={{
                width: '100%',
                padding: 8,
                marginTop: 4,
                borderRadius: 6,
                border: '1px solid #ddd',
                background: userRole === 'teacher' ? '#f1f5f9' : '#fff',
                cursor: userRole === 'teacher' ? 'not-allowed' : 'pointer'
              }}
            >
              <option value="open">ดำเนินการแล้ว</option>
              <option value="in_progress">กำลังดำเนินการ</option>
              <option value="closed">ละทิ้ง</option>
            </select>
          </div>
        </div>
        <div>
          <label style={{ color: '#222' }}>แผนการดำเนินการ</label>
          <select
            name="action_plan"
            value={form.action_plan}
            onChange={handleChange}
            disabled={userRole === 'teacher'}
            style={{
              width: '100%',
              padding: 8,
              marginTop: 4,
              borderRadius: 6,
              border: '1px solid #ddd',
              background: userRole === 'teacher' ? '#f1f5f9' : '#fff',
              cursor: userRole === 'teacher' ? 'not-allowed' : 'pointer'
            }}
          >
            <option value="">-- ไม่เลือก --</option>
            <option value="ควบคุมพฤติกรรม">ควบคุมพฤติกรรม</option>
            <option value="เรียนผ่านช่องทาง W.T.S Platform">เรียนผ่านช่องทาง W.T.S Platform</option>
            <option value="เข้าคณะ School Credits">เข้าคณะ School Credits</option>
          </select>
        </div>
        {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <button type="button" onClick={onClose} style={{ flex: 1, background: '#cbd5e1', color: '#334155', border: 'none', borderRadius: 8, padding: '10px 0', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>ยกเลิก</button>
          <button type="submit" disabled={loading} style={{ flex: 1, background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 0', fontWeight: 700, fontSize: 16, cursor: loading ? 'not-allowed' : 'pointer' }}>{loading ? 'กำลังบันทึก...' : 'บันทึก'}</button>
        </div>
      </form>
    </div>
  );
} 