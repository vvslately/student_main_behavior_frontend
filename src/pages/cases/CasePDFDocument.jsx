import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import SarabunThin from '../../assets/fonts/Sarabun-Thin.ttf';

// Register font
Font.register({
  family: 'Sarabun',
  src: SarabunThin,
  fontWeight: 'thin'
});

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 14, fontFamily: 'Sarabun' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 12, color: '#2563eb' },
  label: { fontWeight: 'bold', marginRight: 8, color: '#334155' },
  row: { flexDirection: 'row', marginBottom: 8 },
  value: { color: '#22223b' },
  section: { marginBottom: 16 },
});

export default function CasePDFDocument({ rows }) {
  return (
    <Document>
      {rows.map((c, i) => (
        <Page size="A4" style={styles.page} key={i}>
          <Text style={styles.title}>{c.case_title || '-'}</Text>
          <View style={styles.section}>
            <View style={styles.row}>
              <Text style={styles.label}>รายละเอียด:</Text>
              <Text style={styles.value}>{c.case_description || '-'}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>นักเรียน:</Text>
              <Text style={styles.value}>{c.first_name ? `${c.first_name} ${c.last_name}` : '-'}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>ชั้น:</Text>
              <Text style={styles.value}>{c.class_level || '-'}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>ห้อง:</Text>
              <Text style={styles.value}>{c.class_room || '-'}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>พฤติกรรม:</Text>
              <Text style={styles.value}>{c.behavior_name || '-'}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>ผู้รายงาน:</Text>
              <Text style={styles.value}>{c.reporter_name || '-'}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>สถานะ:</Text>
              <Text style={styles.value}>{c.status || '-'}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>วันที่รายงาน:</Text>
              <Text style={styles.value}>{c.reported_at ? c.reported_at.split('T')[0] : '-'}</Text>
            </View>
          </View>
        </Page>
      ))}
    </Document>
  );
} 