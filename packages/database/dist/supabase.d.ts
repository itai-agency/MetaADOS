/**
 * Tipos generados por Supabase.
 * Regenerar con: npm run types (desde packages/database)
 * o: npx supabase gen types typescript --project-id <PROJECT_ID> > src/supabase.ts
 */
export type Json = string | number | boolean | null | {
    [key: string]: Json | undefined;
} | Json[];
export interface Database {
    public: {
        Tables: Record<string, never>;
        Views: Record<string, never>;
        Functions: Record<string, never>;
        Enums: Record<string, never>;
    };
}
//# sourceMappingURL=supabase.d.ts.map