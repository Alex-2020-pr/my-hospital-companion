export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      admin_setup_attempts: {
        Row: {
          attempted_at: string
          attempted_email: string
          id: string
          ip_address: string | null
          success: boolean
          user_agent: string | null
        }
        Insert: {
          attempted_at?: string
          attempted_email: string
          id?: string
          ip_address?: string | null
          success?: boolean
          user_agent?: string | null
        }
        Update: {
          attempted_at?: string
          attempted_email?: string
          id?: string
          ip_address?: string | null
          success?: boolean
          user_agent?: string | null
        }
        Relationships: []
      }
      api_rate_limits: {
        Row: {
          created_at: string
          id: string
          partner_id: string
          request_count: number
          updated_at: string
          window_start: string
        }
        Insert: {
          created_at?: string
          id?: string
          partner_id: string
          request_count?: number
          updated_at?: string
          window_start?: string
        }
        Update: {
          created_at?: string
          id?: string
          partner_id?: string
          request_count?: number
          updated_at?: string
          window_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_rate_limits_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "integration_partners"
            referencedColumns: ["id"]
          },
        ]
      }
      app_versions: {
        Row: {
          category: string
          created_at: string
          description: string
          id: string
          is_published: boolean
          release_date: string
          title: string
          updated_at: string
          version: string
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          id?: string
          is_published?: boolean
          release_date: string
          title: string
          updated_at?: string
          version: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          id?: string
          is_published?: boolean
          release_date?: string
          title?: string
          updated_at?: string
          version?: string
        }
        Relationships: []
      }
      appointments: {
        Row: {
          appointment_date: string
          appointment_time: string
          created_at: string
          doctor_name: string
          hospital_contact: Json | null
          id: string
          location: string | null
          mode: string
          notes: string | null
          specialty: string | null
          status: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          appointment_date: string
          appointment_time: string
          created_at?: string
          doctor_name: string
          hospital_contact?: Json | null
          id?: string
          location?: string | null
          mode?: string
          notes?: string | null
          specialty?: string | null
          status?: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          appointment_date?: string
          appointment_time?: string
          created_at?: string
          doctor_name?: string
          hospital_contact?: Json | null
          id?: string
          location?: string | null
          mode?: string
          notes?: string | null
          specialty?: string | null
          status?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      doctors: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          crm: string
          crm_state: string
          email: string | null
          full_name: string
          id: string
          is_active: boolean | null
          on_duty: boolean | null
          organization_id: string | null
          phone: string | null
          specialty: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          crm: string
          crm_state: string
          email?: string | null
          full_name: string
          id?: string
          is_active?: boolean | null
          on_duty?: boolean | null
          organization_id?: string | null
          phone?: string | null
          specialty: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          crm?: string
          crm_state?: string
          email?: string | null
          full_name?: string
          id?: string
          is_active?: boolean | null
          on_duty?: boolean | null
          organization_id?: string | null
          phone?: string | null
          specialty?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "doctors_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          created_at: string
          description: string | null
          document_date: string
          file_size: number | null
          file_url: string | null
          id: string
          status: string
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          document_date: string
          file_size?: number | null
          file_url?: string | null
          id?: string
          status?: string
          title: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          document_date?: string
          file_size?: number | null
          file_url?: string | null
          id?: string
          status?: string
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      exams: {
        Row: {
          created_at: string
          doctor_name: string | null
          exam_date: string
          file_url: string | null
          has_images: boolean | null
          id: string
          name: string
          preparation_instructions: string | null
          result_summary: string | null
          status: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          doctor_name?: string | null
          exam_date: string
          file_url?: string | null
          has_images?: boolean | null
          id?: string
          name: string
          preparation_instructions?: string | null
          result_summary?: string | null
          status?: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          doctor_name?: string | null
          exam_date?: string
          file_url?: string | null
          has_images?: boolean | null
          id?: string
          name?: string
          preparation_instructions?: string | null
          result_summary?: string | null
          status?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exams_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_partners: {
        Row: {
          api_key: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          api_key: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          api_key?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      medication_schedules: {
        Row: {
          created_at: string
          id: string
          medication_id: string
          taken: boolean
          taken_at: string | null
          time: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          medication_id: string
          taken?: boolean
          taken_at?: string | null
          time: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          medication_id?: string
          taken?: boolean
          taken_at?: string | null
          time?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "medication_schedules_medication_id_fkey"
            columns: ["medication_id"]
            isOneToOne: false
            referencedRelation: "medications"
            referencedColumns: ["id"]
          },
        ]
      }
      medications: {
        Row: {
          created_at: string
          dosage: string
          end_date: string | null
          frequency: string
          id: string
          instructions: string | null
          is_active: boolean
          name: string
          start_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dosage: string
          end_date?: string | null
          frequency: string
          id?: string
          instructions?: string | null
          is_active?: boolean
          name: string
          start_date?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          dosage?: string
          end_date?: string | null
          frequency?: string
          id?: string
          instructions?: string | null
          is_active?: boolean
          name?: string
          start_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      message_reads: {
        Row: {
          id: string
          message_id: string
          read_at: string
          user_id: string
        }
        Insert: {
          id?: string
          message_id: string
          read_at?: string
          user_id: string
        }
        Update: {
          id?: string
          message_id?: string
          read_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_reads_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "organization_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          created_at: string
          id: string
          message: string
          sender_name: string | null
          sender_type: string | null
          status: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          sender_name?: string | null
          sender_type?: string | null
          status?: string
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          sender_name?: string | null
          sender_type?: string | null
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_responses: {
        Row: {
          created_at: string
          id: string
          notification_id: string
          response_text: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notification_id: string
          response_text: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notification_id?: string
          response_text?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_responses_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "push_notifications"
            referencedColumns: ["id"]
          },
        ]
      }
      operational_costs: {
        Row: {
          created_at: string | null
          firebase_cost: number
          id: string
          lovable_hosting_cost: number
          month_year: string
          supabase_bandwidth_gb: number
          supabase_db_size_gb: number
          supabase_storage_gb: number
          supabase_total_cost: number
          total_cost: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          firebase_cost?: number
          id?: string
          lovable_hosting_cost?: number
          month_year: string
          supabase_bandwidth_gb?: number
          supabase_db_size_gb?: number
          supabase_storage_gb?: number
          supabase_total_cost?: number
          total_cost?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          firebase_cost?: number
          id?: string
          lovable_hosting_cost?: number
          month_year?: string
          supabase_bandwidth_gb?: number
          supabase_db_size_gb?: number
          supabase_storage_gb?: number
          supabase_total_cost?: number
          total_cost?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      organization_api_tokens: {
        Row: {
          created_at: string
          created_by: string
          expires_at: string | null
          id: string
          is_active: boolean
          last_used_at: string | null
          name: string
          organization_id: string
          revoke_reason: string | null
          revoked_at: string | null
          revoked_by: string | null
          token: string
        }
        Insert: {
          created_at?: string
          created_by: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          last_used_at?: string | null
          name: string
          organization_id: string
          revoke_reason?: string | null
          revoked_at?: string | null
          revoked_by?: string | null
          token: string
        }
        Update: {
          created_at?: string
          created_by?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          last_used_at?: string | null
          name?: string
          organization_id?: string
          revoke_reason?: string | null
          revoked_at?: string | null
          revoked_by?: string | null
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_api_tokens_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_messages: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          message: string
          organization_id: string
          priority: string
          sender_id: string
          target_type: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          message: string
          organization_id: string
          priority?: string
          sender_id: string
          target_type?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          message?: string
          organization_id?: string
          priority?: string
          sender_id?: string
          target_type?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_messages_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          address: string | null
          cnpj: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          default_patient_storage_limit: number | null
          id: string
          is_active: boolean
          logo_icon_url: string | null
          logo_url: string | null
          name: string
          primary_color: string | null
          secondary_color: string | null
          slug: string | null
          storage_limit_bytes: number | null
          storage_plan: string | null
          storage_used_bytes: number | null
          theme_config: Json | null
          type: string
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          cnpj?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          default_patient_storage_limit?: number | null
          id?: string
          is_active?: boolean
          logo_icon_url?: string | null
          logo_url?: string | null
          name: string
          primary_color?: string | null
          secondary_color?: string | null
          slug?: string | null
          storage_limit_bytes?: number | null
          storage_plan?: string | null
          storage_used_bytes?: number | null
          theme_config?: Json | null
          type: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          cnpj?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          default_patient_storage_limit?: number | null
          id?: string
          is_active?: boolean
          logo_icon_url?: string | null
          logo_url?: string | null
          name?: string
          primary_color?: string | null
          secondary_color?: string | null
          slug?: string | null
          storage_limit_bytes?: number | null
          storage_plan?: string | null
          storage_used_bytes?: number | null
          theme_config?: Json | null
          type?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      patient_consents: {
        Row: {
          consent_date: string | null
          consent_given: boolean
          consent_text: string
          created_at: string
          id: string
          partner_id: string
          revoked_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          consent_date?: string | null
          consent_given?: boolean
          consent_text: string
          created_at?: string
          id?: string
          partner_id: string
          revoked_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          consent_date?: string | null
          consent_given?: boolean
          consent_text?: string
          created_at?: string
          id?: string
          partner_id?: string
          revoked_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_consents_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "integration_partners"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_diagnoses: {
        Row: {
          created_at: string | null
          diagnosis: string
          diagnosis_date: string
          doctor_id: string | null
          id: string
          notes: string | null
          patient_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          diagnosis: string
          diagnosis_date?: string
          doctor_id?: string | null
          id?: string
          notes?: string | null
          patient_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          diagnosis?: string
          diagnosis_date?: string
          doctor_id?: string | null
          id?: string
          notes?: string | null
          patient_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_diagnoses_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_diagnoses_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_events: {
        Row: {
          created_at: string | null
          description: string
          event_date: string | null
          event_type: string
          id: string
          patient_id: string
          recorded_by: string | null
          severity: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          event_date?: string | null
          event_type: string
          id?: string
          patient_id: string
          recorded_by?: string | null
          severity?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          event_date?: string | null
          event_type?: string
          id?: string
          patient_id?: string
          recorded_by?: string | null
          severity?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_events_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_events_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_vital_signs: {
        Row: {
          blood_pressure_diastolic: number | null
          blood_pressure_systolic: number | null
          created_at: string | null
          heart_rate: number | null
          id: string
          measured_by: string | null
          measurement_date: string | null
          notes: string | null
          oxygen_saturation: number | null
          patient_id: string
          respiratory_rate: number | null
          temperature: number | null
        }
        Insert: {
          blood_pressure_diastolic?: number | null
          blood_pressure_systolic?: number | null
          created_at?: string | null
          heart_rate?: number | null
          id?: string
          measured_by?: string | null
          measurement_date?: string | null
          notes?: string | null
          oxygen_saturation?: number | null
          patient_id: string
          respiratory_rate?: number | null
          temperature?: number | null
        }
        Update: {
          blood_pressure_diastolic?: number | null
          blood_pressure_systolic?: number | null
          created_at?: string | null
          heart_rate?: number | null
          id?: string
          measured_by?: string | null
          measurement_date?: string | null
          notes?: string | null
          oxygen_saturation?: number | null
          patient_id?: string
          respiratory_rate?: number | null
          temperature?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_vital_signs_measured_by_fkey"
            columns: ["measured_by"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_vital_signs_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          allergies: string[] | null
          avatar_url: string | null
          bed_number: string | null
          birth_date: string | null
          cpf: string | null
          created_at: string | null
          email: string | null
          full_name: string
          id: string
          is_active: boolean | null
          organization_id: string | null
          phone: string | null
          registry_number: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          allergies?: string[] | null
          avatar_url?: string | null
          bed_number?: string | null
          birth_date?: string | null
          cpf?: string | null
          created_at?: string | null
          email?: string | null
          full_name: string
          id?: string
          is_active?: boolean | null
          organization_id?: string | null
          phone?: string | null
          registry_number?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          allergies?: string[] | null
          avatar_url?: string | null
          bed_number?: string | null
          birth_date?: string | null
          cpf?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string
          id?: string
          is_active?: boolean | null
          organization_id?: string | null
          phone?: string | null
          registry_number?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "patients_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      prescriptions: {
        Row: {
          created_at: string | null
          doctor_id: string
          dosage: string
          end_date: string | null
          frequency: string
          id: string
          instructions: string | null
          is_active: boolean | null
          medication_name: string
          patient_id: string
          start_date: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          doctor_id: string
          dosage: string
          end_date?: string | null
          frequency: string
          id?: string
          instructions?: string | null
          is_active?: boolean | null
          medication_name: string
          patient_id: string
          start_date?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          doctor_id?: string
          dosage?: string
          end_date?: string | null
          frequency?: string
          id?: string
          instructions?: string | null
          is_active?: boolean | null
          medication_name?: string
          patient_id?: string
          start_date?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prescriptions_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          birth_date: string | null
          cpf: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          notification_preferences: Json | null
          organization_id: string | null
          phone: string | null
          storage_limit_bytes: number
          storage_used_bytes: number
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          birth_date?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          notification_preferences?: Json | null
          organization_id?: string | null
          phone?: string | null
          storage_limit_bytes?: number
          storage_used_bytes?: number
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          birth_date?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          notification_preferences?: Json | null
          organization_id?: string | null
          phone?: string | null
          storage_limit_bytes?: number
          storage_used_bytes?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      push_notifications: {
        Row: {
          badge: string | null
          body: string
          created_at: string
          data: Json | null
          icon: string | null
          id: string
          is_read: boolean | null
          recipient_id: string | null
          sender_id: string
          sent_at: string
          status: string
          title: string
        }
        Insert: {
          badge?: string | null
          body: string
          created_at?: string
          data?: Json | null
          icon?: string | null
          id?: string
          is_read?: boolean | null
          recipient_id?: string | null
          sender_id: string
          sent_at?: string
          status?: string
          title: string
        }
        Update: {
          badge?: string | null
          body?: string
          created_at?: string
          data?: Json | null
          icon?: string | null
          id?: string
          is_read?: boolean | null
          recipient_id?: string | null
          sender_id?: string
          sent_at?: string
          status?: string
          title?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      storage_requests: {
        Row: {
          amount_paid: number | null
          created_at: string | null
          id: string
          notes: string | null
          organization_id: string | null
          request_type: string
          requested_bytes: number
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount_paid?: number | null
          created_at?: string | null
          id?: string
          notes?: string | null
          organization_id?: string | null
          request_type?: string
          requested_bytes: number
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount_paid?: number | null
          created_at?: string | null
          id?: string
          notes?: string | null
          organization_id?: string | null
          request_type?: string
          requested_bytes?: number
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "storage_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      system_config: {
        Row: {
          created_at: string | null
          first_admin_created: boolean | null
          id: number
        }
        Insert: {
          created_at?: string | null
          first_admin_created?: boolean | null
          id?: number
        }
        Update: {
          created_at?: string | null
          first_admin_created?: boolean | null
          id?: number
        }
        Relationships: []
      }
      telemedicine_appointments: {
        Row: {
          appointment_date: string
          appointment_time: string
          created_at: string
          doctor_name: string
          id: string
          instructions: string | null
          meeting_url: string | null
          specialty: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          appointment_date: string
          appointment_time: string
          created_at?: string
          doctor_name: string
          id?: string
          instructions?: string | null
          meeting_url?: string | null
          specialty: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          appointment_date?: string
          appointment_time?: string
          created_at?: string
          doctor_name?: string
          id?: string
          instructions?: string | null
          meeting_url?: string | null
          specialty?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_analytics: {
        Row: {
          created_at: string
          event_data: Json | null
          event_type: string
          id: string
          organization_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          event_data?: Json | null
          event_type: string
          id?: string
          organization_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          organization_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_analytics_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          organization_id: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id?: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_version_views: {
        Row: {
          id: string
          user_id: string
          version_id: string
          viewed_at: string
        }
        Insert: {
          id?: string
          user_id: string
          version_id: string
          viewed_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          version_id?: string
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_version_views_version_id_fkey"
            columns: ["version_id"]
            isOneToOne: false
            referencedRelation: "app_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      vital_signs: {
        Row: {
          blood_pressure_diastolic: number | null
          blood_pressure_systolic: number | null
          created_at: string
          glucose: number | null
          heart_rate: number | null
          id: string
          measurement_date: string
          updated_at: string
          user_id: string
          weight: number | null
        }
        Insert: {
          blood_pressure_diastolic?: number | null
          blood_pressure_systolic?: number | null
          created_at?: string
          glucose?: number | null
          heart_rate?: number | null
          id?: string
          measurement_date?: string
          updated_at?: string
          user_id: string
          weight?: number | null
        }
        Update: {
          blood_pressure_diastolic?: number | null
          blood_pressure_systolic?: number | null
          created_at?: string
          glucose?: number | null
          heart_rate?: number | null
          id?: string
          measurement_date?: string
          updated_at?: string
          user_id?: string
          weight?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_org_storage_usage: { Args: { org_id: string }; Returns: number }
      can_create_first_admin: { Args: never; Returns: boolean }
      generate_api_token: { Args: never; Returns: string }
      get_active_partners: {
        Args: never
        Returns: {
          created_at: string
          description: string
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }[]
      }
      get_patient_profiles_masked: {
        Args: { _org_id: string }
        Returns: {
          cpf_masked: string
          created_at: string
          email_masked: string
          full_name: string
          id: string
          organization_id: string
          updated_at: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_doctor: { Args: { _user_id: string }; Returns: boolean }
      is_org_admin: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
      validate_org_api_token: {
        Args: { _token: string }
        Returns: {
          is_valid: boolean
          organization_id: string
          organization_name: string
          token_id: string
        }[]
      }
    }
    Enums: {
      app_role: "super_admin" | "hospital_admin" | "patient" | "doctor"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["super_admin", "hospital_admin", "patient", "doctor"],
    },
  },
} as const
