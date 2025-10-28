import { Document, Page, Text, View, StyleSheet, Svg, Path, Line } from '@react-pdf/renderer';
import { format, subDays } from 'date-fns';
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

// Helper para calcular linha de tendência (linear regression)
const calculateTrendLine = (data: number[]): number[] => {
  const n = data.length;
  if (n === 0) return [];
  
  const sumX = data.reduce((acc, _, i) => acc + i, 0);
  const sumY = data.reduce((acc, val) => acc + val, 0);
  const sumXY = data.reduce((acc, val, i) => acc + i * val, 0);
  const sumX2 = data.reduce((acc, _, i) => acc + i * i, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  return data.map((_, i) => slope * i + intercept);
};

// Helper para criar path do gráfico
const createLinePath = (data: number[], width: number, height: number, min: number, max: number): string => {
  if (data.length === 0) return '';
  
  const xStep = width / (data.length - 1);
  const range = max - min || 1;
  
  return data
    .map((value, i) => {
      const x = i * xStep;
      const y = height - ((value - min) / range) * height;
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');
};

interface VitalSignsPDFProps {
  vitalSigns: VitalSign[];
  patientName: string;
  patientEmail: string;
}

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 12,
    borderBottom: '2 solid #0EA5E9',
    paddingBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0EA5E9',
    marginBottom: 3,
  },
  subtitle: {
    fontSize: 8,
    color: '#64748B',
  },
  patientInfo: {
    marginBottom: 12,
    padding: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
  },
  patientText: {
    fontSize: 10,
    marginBottom: 3,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 6,
    color: '#1E293B',
  },
  latestGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  card: {
    width: '48%',
    padding: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: 4,
    border: '1 solid #E2E8F0',
  },
  cardLabel: {
    fontSize: 9,
    color: '#64748B',
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  cardUnit: {
    fontSize: 9,
    color: '#64748B',
  },
  chartsContainer: {
    marginBottom: 10,
  },
  chartBox: {
    marginBottom: 8,
    padding: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: 4,
    border: '1 solid #E2E8F0',
  },
  chartTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#1E293B',
  },
  table: {
    marginTop: 6,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#0EA5E9',
    padding: 5,
    borderRadius: 3,
  },
  tableHeaderText: {
    color: '#FFFFFF',
    fontSize: 7,
    fontWeight: 'bold',
    flex: 1,
  },
  tableRow: {
    flexDirection: 'row',
    padding: 5,
    borderBottom: '1 solid #E2E8F0',
  },
  tableCell: {
    fontSize: 7,
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
  
  // Filtrar últimos 7 dias
  const sevenDaysAgo = subDays(new Date(), 7);
  const last7DaysData = vitalSigns.filter(vs => 
    new Date(vs.measurement_date) >= sevenDaysAgo
  ).reverse(); // Mais antigo primeiro para o gráfico

  // Preparar dados dos gráficos
  const chartWidth = 450;
  const chartHeight = 80;
  
  const systolicData = last7DaysData.map(vs => vs.blood_pressure_systolic).filter((v): v is number => v !== null);
  const heartRateData = last7DaysData.map(vs => vs.heart_rate).filter((v): v is number => v !== null);
  const glucoseData = last7DaysData.map(vs => vs.glucose).filter((v): v is number => v !== null);
  const weightData = last7DaysData.map(vs => vs.weight).filter((v): v is number => v !== null);

  // Calcular linhas de tendência
  const systolicTrend = calculateTrendLine(systolicData);
  const heartRateTrend = calculateTrendLine(heartRateData);
  const glucoseTrend = calculateTrendLine(glucoseData);
  const weightTrend = calculateTrendLine(weightData);

  // Helper para renderizar gráfico
  const renderChart = (data: number[], trend: number[], color: string, trendColor: string) => {
    if (data.length === 0) return null;
    
    const min = Math.min(...data) * 0.9;
    const max = Math.max(...data) * 1.1;
    
    const dataPath = createLinePath(data, chartWidth, chartHeight, min, max);
    const trendPath = createLinePath(trend, chartWidth, chartHeight, min, max);
    
    return (
      <Svg width={chartWidth} height={chartHeight} style={{ marginTop: 4 }}>
        {/* Grid lines */}
        <Line x1={0} y1={0} x2={chartWidth} y2={0} stroke="#E2E8F0" strokeWidth={1} />
        <Line x1={0} y1={chartHeight/2} x2={chartWidth} y2={chartHeight/2} stroke="#E2E8F0" strokeWidth={1} />
        <Line x1={0} y1={chartHeight} x2={chartWidth} y2={chartHeight} stroke="#E2E8F0" strokeWidth={1} />
        
        {/* Trend line (dashed) */}
        <Path d={trendPath} stroke={trendColor} strokeWidth={1.5} strokeDasharray="4 2" fill="none" />
        
        {/* Data line */}
        <Path d={dataPath} stroke={color} strokeWidth={2} fill="none" />
        
        {/* Data points */}
        {data.map((value, i) => {
          const x = (i / (data.length - 1)) * chartWidth;
          const y = chartHeight - ((value - min) / (max - min)) * chartHeight;
          return (
            <View key={i} style={{ position: 'absolute', left: x - 2, top: y - 2 }}>
              <Svg width={4} height={4}>
                <Path d="M 2 2 m -2 0 a 2 2 0 1 0 4 0 a 2 2 0 1 0 -4 0" fill={color} />
              </Svg>
            </View>
          );
        })}
      </Svg>
    );
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Relatório de Sinais Vitais - Últimos 7 Dias</Text>
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

        {/* Charts */}
        <Text style={styles.sectionTitle}>Gráficos de Evolução (7 dias)</Text>
        <View style={styles.chartsContainer}>
          {systolicData.length > 0 && (
            <View style={styles.chartBox}>
              <Text style={styles.chartTitle}>Pressão Arterial Sistólica (mmHg)</Text>
              {renderChart(systolicData, systolicTrend, '#0EA5E9', '#06B6D4')}
            </View>
          )}
          
          {heartRateData.length > 0 && (
            <View style={styles.chartBox}>
              <Text style={styles.chartTitle}>Frequência Cardíaca (bpm)</Text>
              {renderChart(heartRateData, heartRateTrend, '#F97316', '#FB923C')}
            </View>
          )}
          
          {glucoseData.length > 0 && (
            <View style={styles.chartBox}>
              <Text style={styles.chartTitle}>Glicemia (mg/dL)</Text>
              {renderChart(glucoseData, glucoseTrend, '#8B5CF6', '#A78BFA')}
            </View>
          )}
          
          {weightData.length > 0 && (
            <View style={styles.chartBox}>
              <Text style={styles.chartTitle}>Peso (kg)</Text>
              {renderChart(weightData, weightTrend, '#10B981', '#34D399')}
            </View>
          )}
        </View>

        {/* History Table */}
        <Text style={styles.sectionTitle}>Histórico de Medições (7 dias)</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderText}>Data</Text>
            <Text style={styles.tableHeaderText}>PA</Text>
            <Text style={styles.tableHeaderText}>FC</Text>
            <Text style={styles.tableHeaderText}>Glicemia</Text>
            <Text style={styles.tableHeaderText}>Peso</Text>
          </View>
          {last7DaysData.reverse().map((vs) => (
            <View key={vs.id} style={styles.tableRow}>
              <Text style={styles.tableCell}>
                {format(new Date(vs.measurement_date), 'dd/MM', { locale: ptBR })}
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
