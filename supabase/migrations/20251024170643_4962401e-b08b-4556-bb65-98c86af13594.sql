-- Limpar duplicatas mantendo apenas o registro mais recente de cada consulta
DELETE FROM appointments 
WHERE id IN (
  SELECT a.id
  FROM appointments a
  INNER JOIN (
    SELECT 
      user_id, 
      doctor_name, 
      appointment_date, 
      appointment_time,
      MAX(created_at) as max_created_at
    FROM appointments
    GROUP BY user_id, doctor_name, appointment_date, appointment_time
    HAVING COUNT(*) > 1
  ) b ON 
    a.user_id = b.user_id AND
    a.doctor_name = b.doctor_name AND
    a.appointment_date = b.appointment_date AND
    a.appointment_time = b.appointment_time
  WHERE a.created_at < b.max_created_at
);