export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string
          birth_date: string
          nickname: string
          avatar_path: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          birth_date: string
          nickname?: string
          avatar_path?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          birth_date?: string
          nickname?: string
          avatar_path?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
