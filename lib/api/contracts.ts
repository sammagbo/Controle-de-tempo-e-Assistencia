/**
 * lib/api/contracts.ts
 * Este arquivo define os DTOs (Data Transfer Objects) exatos que a nova API Spring Boot
 * retornará/receberá. Estes tipos substituem as interfaces nativas do SDK do Supabase
 * e refletem os schemas definidos em docs/API_CONTRACTS.md.
 */

// ─── API Error ─────────────────────────────────────────────────────────────────
export interface ApiErrorDetail {
  field?: string;
  message: string;
}

export interface ApiProblemDetail {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  errors?: ApiErrorDetail[];
}

// ─── Auth ──────────────────────────────────────────────────────────────────────
export interface AuthUser {
  id: string;
  email: string;
  created_at?: string;
}

export interface LoginResponse {
  user: AuthUser;
}

// ─── Dashboard & Semanas ───────────────────────────────────────────────────────
export interface WeekDto {
  id: string;
  period_id?: string;
  label: string;
  date_range: string;
  theme: string;
  status?: string;
}

export interface PeriodDto {
  id: string;
  name: string;
  start_date?: string;
  end_date?: string;
  weeks?: WeekDto[];
}

// ─── Reunião & Agenda ──────────────────────────────────────────────────────────
export interface MeetingDto {
  id: string;
  week_id: string;
  user_id?: string;
  meeting_day: string;
  started_at?: string;
  finished_at?: string;
  total_duration_seconds?: number;
  president?: string;
  created_at?: string;
}

export interface AgendaItemDto {
  id: string;
  meeting_id?: string;
  title: string;
  estimated_minutes: number;
  actual_seconds: number;
  position: number;
  status: 'completed' | 'active' | 'upcoming';
  section: string;
  allows_comments?: boolean;
  requires_post_comment?: boolean;
  assigned_names?: string;
  skip_timing?: boolean;
}

export interface CommentDto {
  id: string;
  meeting_id: string;
  agenda_item_id?: string | null;
  duration_seconds: number;
  comment_type?: 'manual' | 'post_student';
}

export interface AttendanceDto {
  id: string;
  meeting_id: string;
  count: number;
  presencial: number;
  zoom: number;
}

// ─── Agregações (Full Meeting) ─────────────────────────────────────────────────
export interface FullMeetingDto extends MeetingDto {
  week?: WeekDto & { period?: PeriodDto };
  agenda_items: AgendaItemDto[];
  attendance?: AttendanceDto;
  comments: CommentDto[];
}

// ─── Requests ──────────────────────────────────────────────────────────────────
export interface CreateMeetingRequest {
  week_id: string;
}

export interface UpdateMeetingRequest {
  started_at?: string | null;
  finished_at?: string | null;
  total_duration_seconds?: number;
  president?: string;
}

export interface UpdateAgendaItemRequest {
  actual_seconds?: number;
  status?: 'completed' | 'active' | 'upcoming';
  assigned_names?: string;
}

export interface CreateCommentRequest {
  meeting_id: string;
  agenda_item_id?: string | null;
  duration_seconds: number;
  comment_type?: 'manual' | 'post_student';
}

export interface UpdateAttendanceRequest {
  presencial: number;
  zoom: number;
}
