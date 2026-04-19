import type { SectionKey } from './lib/meetingTemplate';

// ─── Database row types ───────────────────────────────────────────────────────

export interface Period {
  id: string;
  name: string;
  start_date?: string;
  end_date?: string;
  created_at?: string;
}

export interface Week {
  id: string;
  period_id?: string;
  label: string;
  date_range: string;
  theme: string;
  status?: string;
  created_at?: string;
}

export interface Meeting {
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

export interface AgendaItem {
  id: string;
  meeting_id?: string;
  title: string;
  estimated_minutes: number;
  actual_seconds: number;
  position: number;
  status: 'completed' | 'active' | 'upcoming';
  section: SectionKey;
  allows_comments?: boolean;
  requires_post_comment?: boolean;
  assigned_names?: string;
  skip_timing?: boolean;
  created_at?: string;
}

export interface Attendance {
  id: string;
  meeting_id: string;
  count: number;
  presencial: number;
  zoom: number;
  created_at?: string;
}

export interface Comment {
  id: string;
  meeting_id: string;
  agenda_item_id?: string | null;
  duration_seconds: number;
  comment_type?: 'manual' | 'post_student';
  created_at?: string;
}

// ─── Composite / view types ───────────────────────────────────────────────────

export interface MeetingWithWeek extends Meeting {
  week?: Pick<Week, 'label' | 'date_range' | 'theme'> & {
    period?: Pick<Period, 'name'>;
  };
}
