export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      quests: {
        Row: {
          id: string
          name: string
          title: string
          mission: string
          achievements: string | null
          is_active: boolean
          order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          title: string
          mission: string
          achievements?: string | null
          is_active?: boolean
          order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          title?: string
          mission?: string
          achievements?: string | null
          is_active?: boolean
          order?: number
          created_at?: string
          updated_at?: string
        }
      }
      levels: {
        Row: {
          id: string
          quest_id: string
          level_number: number
          name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          quest_id: string
          level_number: number
          name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          quest_id?: string
          level_number?: number
          name?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      challenges: {
        Row: {
          id: string
          level_id: string
          question: string
          description: string | null
          solution: string
          order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          level_id: string
          question: string
          description?: string | null
          solution: string
          order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          level_id?: string
          question?: string
          description?: string | null
          solution?: string
          order?: number
          created_at?: string
          updated_at?: string
        }
      }
      challenge_fields: {
        Row: {
          id: string
          challenge_id: string
          field_type: 'text' | 'dropdown'
          label: string | null
          correct_answer: string
          dropdown_options: string[] | null
          order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          challenge_id: string
          field_type: 'text' | 'dropdown'
          label?: string | null
          correct_answer: string
          dropdown_options?: string[] | null
          order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          challenge_id?: string
          field_type?: 'text' | 'dropdown'
          label?: string | null
          correct_answer?: string
          dropdown_options?: string[] | null
          order?: number
          created_at?: string
          updated_at?: string
        }
      }
      challenge_hints: {
        Row: {
          id: string
          challenge_id: string
          hint_text: string
          order: number
          created_at: string
        }
        Insert: {
          id?: string
          challenge_id: string
          hint_text: string
          order: number
          created_at?: string
        }
        Update: {
          id?: string
          challenge_id?: string
          hint_text?: string
          order?: number
          created_at?: string
        }
      }
      results: {
        Row: {
          id: string
          email: string
          quest_id: string
          level_id: string
          initials: string
          time_seconds: number
          hints_used: number
          clicked_solution: boolean
          eligible_for_leaderboard: boolean
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          quest_id: string
          level_id: string
          initials: string
          time_seconds: number
          hints_used?: number
          clicked_solution?: boolean
          eligible_for_leaderboard?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          quest_id?: string
          level_id?: string
          initials?: string
          time_seconds?: number
          hints_used?: number
          clicked_solution?: boolean
          eligible_for_leaderboard?: boolean
          created_at?: string
        }
      }
      admins: {
        Row: {
          id: string
          email: string
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
        }
      }
      settings: {
        Row: {
          id: string
          key: string
          value: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          value: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          value?: string
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          user_type: 'employee' | 'community' | null
          first_login: string
          last_login: string
          login_count: number
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          user_type?: 'employee' | 'community' | null
          first_login?: string
          last_login?: string
          login_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          user_type?: 'employee' | 'community' | null
          first_login?: string
          last_login?: string
          login_count?: number
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Convenience types
export type Quest = Database['public']['Tables']['quests']['Row']
export type Level = Database['public']['Tables']['levels']['Row']
export type Challenge = Database['public']['Tables']['challenges']['Row']
export type ChallengeField = Database['public']['Tables']['challenge_fields']['Row']
export type ChallengeHint = Database['public']['Tables']['challenge_hints']['Row']
export type Result = Database['public']['Tables']['results']['Row']
export type Admin = Database['public']['Tables']['admins']['Row']
export type User = Database['public']['Tables']['users']['Row']

// Extended types with relations
export type ChallengeWithFields = Challenge & {
  fields: ChallengeField[]
  hints: ChallengeHint[]
}

export type LevelWithChallenges = Level & {
  challenges: ChallengeWithFields[]
}

export type QuestWithLevels = Quest & {
  levels: LevelWithChallenges[]
}
