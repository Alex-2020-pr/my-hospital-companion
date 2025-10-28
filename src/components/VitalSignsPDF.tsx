import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface VitalSign {
  id: string;
  measurement_date: string;
  blood_pressure_systolic: number | null;
  blood_pressure_diastolic: number | null;
  heart_rate: number | null;
  glucose: number | null;
  weight: number | null;
}

interface VitalSignsPDFProps {
  vitalSigns: VitalSign[];
  patientName: string;
  patientEmail: string;
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottom: '2 solid #0EA5E9',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0EA5E9',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 10,
    color: '#64748B',
  },
  patientInfo: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
  },
  patientText: {
    fontSize: 10,
    marginBottom: 3,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
    color: '#1E293B',
  },
  latestGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  card: {
    width: '48%',
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 6,
    border: '1 solid #E2E8F0',
  },
  cardLabel: {
    fontSize: 9,
    color: '#64748B',
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  cardUnit: {
    fontSize: 9,
    color: '#64748B',
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#0EA5E9',
    padding: 8,
    borderRadius: 4,
  },
  tableHeaderText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: 'bold',
    flex: 1,
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottom: '1 solid #E2E8F0',
  },
  tableCell: {
    fontSize: 9,
    flex: 1,
    color: '#1E293B',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: '#94A3B8',
    borderTop: '1 solid #E2E8F0',
    paddingTop: 10,
  },
});

export const VitalSignsPDF = ({ vitalSigns, patientName, patientEmail }: VitalSignsPDFProps) => {
  const latestVitalSign = vitalSigns[0];
  const historyData = vitalSigns.slice(0, 15); // Últimas 15 medições

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Relatório de Sinais Vitais</Text>
          <Text style={styles.subtitle}>
            Gerado em {format(new Date(), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
          </Text>
        </View>

        {/* Patient Info */}
        <View style={styles.patientInfo}>
          <Text style={styles.patientText}>Paciente: {patientName}</Text>
          <Text style={styles.patientText}>E-mail: {patientEmail}</Text>
        </View>

        {/* Latest Measurements */}
        <Text style={styles.sectionTitle}>Últimas Aferições</Text>
        <View style={styles.latestGrid}>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Pressão Arterial</Text>
            <Text style={styles.cardValue}>
              {latestVitalSign?.blood_pressure_systolic || '--'}/
              {latestVitalSign?.blood_pressure_diastolic || '--'}
            </Text>
            <Text style={styles.cardUnit}>mmHg</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardLabel}>Frequência Cardíaca</Text>
            <Text style={styles.cardValue}>
              {latestVitalSign?.heart_rate || '--'}
            </Text>
            <Text style={styles.cardUnit}>bpm</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardLabel}>Glicemia</Text>
            <Text style={styles.cardValue}>
              {latestVitalSign?.glucose || '--'}
            </Text>
            <Text style={styles.cardUnit}>mg/dL</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardLabel}>Peso</Text>
            <Text style={styles.cardValue}>
              {latestVitalSign?.weight || '--'}
            </Text>
            <Text style={styles.cardUnit}>kg</Text>
          </View>
        </View>

        {/* History Table */}
        <Text style={styles.sectionTitle}>Histórico de Medições</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderText}>Data</Text>
            <Text style={styles.tableHeaderText}>PA</Text>
            <Text style={styles.tableHeaderText}>FC</Text>
            <Text style={styles.tableHeaderText}>Glicemia</Text>
            <Text style={styles.tableHeaderText}>Peso</Text>
          </View>
          {historyData.map((vs) => (
            <View key={vs.id} style={styles.tableRow}>
              <Text style={styles.tableCell}>
                {format(new Date(vs.measurement_date), 'dd/MM/yyyy', { locale: ptBR })}
              </Text>
              <Text style={styles.tableCell}>
                {vs.blood_pressure_systolic && vs.blood_pressure_diastolic
                  ? `${vs.blood_pressure_systolic}/${vs.blood_pressure_diastolic}`
                  : '--'}
              </Text>
              <Text style={styles.tableCell}>
                {vs.heart_rate || '--'}
              </Text>
              <Text style={styles.tableCell}>
                {vs.glucose || '--'}
              </Text>
              <Text style={styles.tableCell}>
                {vs.weight || '--'}
              </Text>
            </View>
          ))}
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Este documento foi gerado automaticamente. Em caso de dúvidas, consulte seu médico.
        </Text>
      </Page>
    </Document>
  );
};
