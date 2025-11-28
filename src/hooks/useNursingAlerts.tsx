import { useState, useEffect } from "react";
import { NursingAlert } from "@/components/NursingAlertCard";

interface VitalSigns {
  temperature?: number;
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  heart_rate?: number;
  spo2?: number;
  pain_scale?: number;
}

// Função para detectar alertas baseado em sinais vitais
export function detectVitalSignsAlerts(
  patientName: string,
  bedNumber: string,
  vitals: VitalSigns,
  previousVitals?: VitalSigns
): NursingAlert[] {
  const alerts: NursingAlert[] = [];
  const now = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  // Temperatura crítica
  if (vitals.temperature) {
    if (vitals.temperature >= 38.5) {
      alerts.push({
        id: `fever-${Date.now()}`,
        type: "critical_vitals",
        severity: vitals.temperature >= 39.5 ? "critical" : "warning",
        patient: patientName,
        bed: bedNumber,
        message: `Temperatura elevada: ${vitals.temperature}°C`,
        time: now,
        isActive: true
      });
    } else if (vitals.temperature <= 35.5) {
      alerts.push({
        id: `hypothermia-${Date.now()}`,
        type: "critical_vitals",
        severity: "critical",
        patient: patientName,
        bed: bedNumber,
        message: `Hipotermia: ${vitals.temperature}°C`,
        time: now,
        isActive: true
      });
    }
  }

  // Pressão arterial crítica
  if (vitals.blood_pressure_systolic && vitals.blood_pressure_diastolic) {
    if (vitals.blood_pressure_systolic >= 180 || vitals.blood_pressure_diastolic >= 110) {
      alerts.push({
        id: `hypertension-${Date.now()}`,
        type: "critical_vitals",
        severity: "critical",
        patient: patientName,
        bed: bedNumber,
        message: `PA crítica: ${vitals.blood_pressure_systolic}/${vitals.blood_pressure_diastolic} mmHg`,
        time: now,
        isActive: true
      });
    } else if (vitals.blood_pressure_systolic <= 90 || vitals.blood_pressure_diastolic <= 60) {
      alerts.push({
        id: `hypotension-${Date.now()}`,
        type: "critical_vitals",
        severity: "critical",
        patient: patientName,
        bed: bedNumber,
        message: `Hipotensão: ${vitals.blood_pressure_systolic}/${vitals.blood_pressure_diastolic} mmHg`,
        time: now,
        isActive: true
      });
    }
  }

  // Frequência cardíaca
  if (vitals.heart_rate) {
    if (vitals.heart_rate >= 120) {
      alerts.push({
        id: `tachycardia-${Date.now()}`,
        type: "critical_vitals",
        severity: vitals.heart_rate >= 140 ? "critical" : "warning",
        patient: patientName,
        bed: bedNumber,
        message: `Taquicardia: ${vitals.heart_rate} bpm`,
        time: now,
        isActive: true
      });
    } else if (vitals.heart_rate <= 50) {
      alerts.push({
        id: `bradycardia-${Date.now()}`,
        type: "critical_vitals",
        severity: "warning",
        patient: patientName,
        bed: bedNumber,
        message: `Bradicardia: ${vitals.heart_rate} bpm`,
        time: now,
        isActive: true
      });
    }
  }

  // Saturação de oxigênio
  if (vitals.spo2 && vitals.spo2 < 92) {
    alerts.push({
      id: `hypoxia-${Date.now()}`,
      type: "critical_vitals",
      severity: vitals.spo2 < 88 ? "critical" : "warning",
      patient: patientName,
      bed: bedNumber,
      message: `Dessaturação: SpO2 ${vitals.spo2}%`,
      time: now,
      isActive: true
    });
  }

  // Escala de dor alta
  if (vitals.pain_scale && vitals.pain_scale >= 7) {
    alerts.push({
      id: `pain-${Date.now()}`,
      type: "high_pain",
      severity: vitals.pain_scale >= 9 ? "critical" : "warning",
      patient: patientName,
      bed: bedNumber,
      message: `Dor intensa: ${vitals.pain_scale}/10`,
      time: now,
      isActive: true
    });
  }

  // Tendência de piora (comparação com valores anteriores)
  if (previousVitals) {
    const trends = [];
    
    if (vitals.temperature && previousVitals.temperature) {
      const diff = vitals.temperature - previousVitals.temperature;
      if (diff >= 1.5) trends.push(`Temp ↑${diff.toFixed(1)}°C`);
    }
    
    if (vitals.heart_rate && previousVitals.heart_rate) {
      const diff = vitals.heart_rate - previousVitals.heart_rate;
      if (Math.abs(diff) >= 20) trends.push(`FC ${diff > 0 ? '↑' : '↓'}${Math.abs(diff)} bpm`);
    }
    
    if (vitals.spo2 && previousVitals.spo2) {
      const diff = vitals.spo2 - previousVitals.spo2;
      if (diff <= -5) trends.push(`SpO2 ↓${Math.abs(diff)}%`);
    }

    if (trends.length > 0) {
      alerts.push({
        id: `deterioration-${Date.now()}`,
        type: "deterioration",
        severity: "warning",
        patient: patientName,
        bed: bedNumber,
        message: `Tendência de piora detectada: ${trends.join(', ')}`,
        time: now,
        isActive: true
      });
    }
  }

  return alerts;
}

export function useNursingAlerts() {
  const [alerts, setAlerts] = useState<NursingAlert[]>([
    {
      id: "1",
      type: "critical_vitals",
      severity: "critical",
      patient: "João da Silva",
      bed: "203",
      message: "Temperatura elevada: 38.5°C detectada",
      time: "14:30",
      isActive: true
    },
    {
      id: "2",
      type: "high_pain",
      severity: "warning",
      patient: "Maria Santos",
      bed: "205",
      message: "Paciente relata dor intensa (8/10)",
      time: "14:15",
      isActive: true
    },
    {
      id: "3",
      type: "fall_risk",
      severity: "warning",
      patient: "Pedro Costa",
      bed: "207",
      message: "Risco de queda elevado - Score Morse: 65",
      time: "13:45",
      isActive: true
    }
  ]);

  const resolveAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, isActive: false } : alert
    ));
  };

  const addAlert = (alert: NursingAlert) => {
    setAlerts(prev => [alert, ...prev]);
  };

  const activeAlerts = alerts.filter(a => a.isActive);
  const criticalAlerts = activeAlerts.filter(a => a.severity === "critical");

  return {
    alerts,
    activeAlerts,
    criticalAlerts,
    resolveAlert,
    addAlert,
    detectVitalSignsAlerts
  };
}
