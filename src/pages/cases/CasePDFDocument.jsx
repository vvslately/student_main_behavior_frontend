import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import SarabunThin from '../../assets/fonts/Sarabun-Thin.ttf';

// Register font
Font.register({
  family: 'Sarabun',
  src: SarabunThin,
  fontWeight: 'thin'
});

const styles = StyleSheet.create({
  page: { 
    padding: 40, 
    fontSize: 16, 
    fontFamily: 'Sarabun',
    backgroundColor: '#ffffff'
  },
  header: {
    alignItems: 'center',
    marginBottom: 30
  },
  governmentSeal: {
    fontSize: 24,
    marginBottom: 10,
    textAlign: 'center'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30
  },
  formSection: {
    marginBottom: 15
  },
  formRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8
  },
  label: {
    fontSize: 16,
    marginRight: 10,
    minWidth: 90
  },
  underline: {
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    paddingBottom: 2,
    minHeight: 20,
    flex: 1,
    marginRight: 10
  },
  underlineText: {
    fontSize: 16
  },
  contentArea: {
    marginTop: 20,
    marginBottom: 20,
    minHeight: 60
  },
  contentText: {
    fontSize: 16,
    lineHeight: 1.5,
    textAlign: 'justify'
  },
  signatureArea: {
    marginTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  signatureBox: {
    alignItems: 'center',
    width: '40%'
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    width: '100%',
    marginBottom: 5,
    paddingBottom: 30
  },
  signatureLabel: {
    fontSize: 14,
    textAlign: 'center'
  },
  bottomSection: {
    marginTop: 30,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  bottomBox: {
    alignItems: 'center',
    width: '45%'
  },
  bottomLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    width: '100%',
    marginBottom: 5,
    paddingBottom: 20
  },
  smallText: {
    fontSize: 12,
    textAlign: 'center'
  }
});

export default function CasePDFDocument({ rows = [] }) {
  if (!rows.length) {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <Text>ไม่มีข้อมูล</Text>
        </Page>
      </Document>
    );
  }

  return (
    <Document>
      {rows.map((data, idx) => (
        <Page key={data.id || idx} size="A4" style={styles.page}>
          {/* Header with Government Seal */}
          <View style={styles.header}>
            <Text style={styles.governmentSeal}>🏛️</Text>
            <Text style={styles.title}>บันทึกข้อความ</Text>
          </View>
          {/* Form Fields */}
          <View style={styles.formSection}>
            <View style={styles.formRow}>
              <Text style={styles.label}>ส่วนราชการ</Text>
              <View style={styles.underline}>
                <Text style={styles.underlineText}>โรงเรียนชัยธวัชราลาภ</Text>
              </View>
            </View>
            <View style={styles.formRow}>
              <Text style={styles.label}>ที่</Text>
              <View style={styles.underline}>
                <Text style={styles.underlineText}>{data.id || '-'}</Text>
              </View>
              <Text style={styles.label}>วันที่</Text>
              <View style={styles.underline}>
                <Text style={styles.underlineText}>{data.reported_at ? data.reported_at.split('T')[0] : '-'}</Text>
              </View>
            </View>
            <View style={styles.formRow}>
              <Text style={styles.label}>เรื่อง</Text>
              <View style={styles.underline}>
                <Text style={styles.underlineText}>{data.behavior_type || '-'}</Text>
              </View>
            </View>
            <View style={styles.formRow}>
              <Text style={styles.label}>เรียน</Text>
              <View style={styles.underline}>
                <Text style={styles.underlineText}>ผู้บริหารโรงเรียนชัยธวัชราลาภ</Text>
              </View>
            </View>
          </View>
          {/* ข้อมูลนักเรียน */}
          <View style={styles.formRow}>
            <Text style={styles.label}>เนื่องจาก</Text>
            <View style={styles.underline}>
              <Text style={styles.underlineText}>
                {(data.gender === 'male' ? 'ด.ช.' : data.gender === 'female' ? 'ด.ญ.' : '') + ' ' + (data.first_name || '-') + ' ' + (data.last_name || '-')}
              </Text>
            </View>
          </View>
          <View style={styles.formRow}>
            <Text style={styles.label}>ชั้น</Text>
            <View style={styles.underline}>
              <Text style={styles.underlineText}>{data.class_level ? `ม.${data.class_level}` : '-'}</Text>
            </View>
            <Text style={styles.label}>ห้อง</Text>
            <View style={styles.underline}>
              <Text style={styles.underlineText}>{data.class_room || '-'}</Text>
            </View>
            <Text style={styles.label}>เลขประจำตัว</Text>
            <View style={styles.underline}>
              <Text style={styles.underlineText}>{data.student_code || '-'}</Text>
            </View>
          </View>
          <View style={styles.formRow}>
            <Text style={styles.label}>ได้ประพฤติผิดระเบียบ ดังนี้</Text>
          </View>
          <View style={styles.contentArea}>
            <Text style={styles.contentText}>{data.case_description || '-'}</Text>
          </View>
          {/* Main content paragraph */}
          <Text style={styles.contentText}>
            ข้าพเจ้าได้ให้นับคะแนนปฏิบัติในการควบคุมความประพฤตินักเรียน และทำการชี้แนะแนะ
            ความประพฤติเรียบร้อยแล้ว แต่เพื่อให้การควบคุมความประพฤติของนักเรียนได้รับผลสำเร็จตามความมุ่งหมาย
            จึงขอรายงานการประพฤติผิดวินัยของนักเรียนเพื่อทราบ คิดตามผล และดำเนินการเป็นหลักฐานต่อไป
          </Text>
          <Text style={[styles.contentText, { marginTop: 20, textAlign: 'center' }]}>จึงเรียนมาเพื่อโปรดทราบ</Text>
          {/* Signature Areas */}
          <View style={styles.signatureArea}>
            <View style={styles.signatureBox}>
              <View style={styles.signatureLine}></View>
              <Text style={styles.signatureLabel}>{data.reporter_name || '(ครูผู้รายงาน)'}</Text>
            </View>
            <View style={styles.signatureBox}>
              <View style={styles.signatureLine}></View>
              <Text style={styles.signatureLabel}>(ครูที่ปรึกษา)</Text>
            </View>
          </View>
          {/* Bottom Section */}
          <View style={styles.bottomSection}>
            <View style={styles.bottomBox}>
              <View style={styles.bottomLine}></View>
              <Text style={styles.smallText}>(หัวหน้าระดับชั้น)</Text>
              <Text style={styles.smallText}>หัวหน้า...</Text>
            </View>
            <View style={styles.bottomBox}>
              <View style={styles.bottomLine}></View>
              <Text style={styles.smallText}>(รองผู้อำนวยการ)</Text>
              <Text style={styles.smallText}>รองผู้อำนวยการกลุ่มบริหารงานบุคคล</Text>
            </View>
          </View>
        </Page>
      ))}
    </Document>
  );
}