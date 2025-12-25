/**
 * @fileoverview Database types for The Bazaar api schema
 * @module @tbk/auth/types/database
 * 
 * These types are generated based on the enterprise migration schema.
 * Schema: api (not public)
 * 
 * @see supabase/migrations/ENTERPRISE_MIGRATION_V1.0.0.sql
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

/**
 * Database schema types for Supabase client
 * Using 'api' schema as defined in our enterprise migration
 */
export interface Database {
  api: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          phone: string | null;
          role: 'customer' | 'vendor' | 'admin' | 'super_admin' | 'manager' | 'staff' | 'viewer';
          is_active: boolean;
          email_verified_at: string | null;
          phone_verified_at: string | null;
          last_login_at: string | null;
          metadata: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          role?: 'customer' | 'vendor' | 'admin' | 'super_admin' | 'manager' | 'staff' | 'viewer';
          is_active?: boolean;
          email_verified_at?: string | null;
          phone_verified_at?: string | null;
          last_login_at?: string | null;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          role?: 'customer' | 'vendor' | 'admin' | 'super_admin' | 'manager' | 'staff' | 'viewer';
          is_active?: boolean;
          email_verified_at?: string | null;
          phone_verified_at?: string | null;
          last_login_at?: string | null;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      vendors: {
        Row: {
          id: string;
          profile_id: string;
          business_name: string;
          slug: string;
          description: string | null;
          logo_url: string | null;
          banner_url: string | null;
          business_type: string | null;
          business_registration_number: string | null;
          tax_id: string | null;
          phone: string | null;
          email: string | null;
          website: string | null;
          address_line1: string | null;
          address_line2: string | null;
          city: string | null;
          state_province: string | null;
          postal_code: string | null;
          country: string;
          latitude: number | null;
          longitude: number | null;
          rating_average: number;
          rating_count: number;
          is_verified: boolean;
          is_featured: boolean;
          kyc_status: 'pending' | 'submitted' | 'under_review' | 'approved' | 'rejected';
          kyc_submitted_at: string | null;
          kyc_reviewed_at: string | null;
          kyc_reviewed_by: string | null;
          kyc_rejection_reason: string | null;
          subscription_tier: 'free' | 'basic' | 'professional' | 'enterprise';
          subscription_expires_at: string | null;
          metadata: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          business_name: string;
          slug: string;
          description?: string | null;
          logo_url?: string | null;
          banner_url?: string | null;
          business_type?: string | null;
          business_registration_number?: string | null;
          tax_id?: string | null;
          phone?: string | null;
          email?: string | null;
          website?: string | null;
          address_line1?: string | null;
          address_line2?: string | null;
          city?: string | null;
          state_province?: string | null;
          postal_code?: string | null;
          country?: string;
          latitude?: number | null;
          longitude?: number | null;
          rating_average?: number;
          rating_count?: number;
          is_verified?: boolean;
          is_featured?: boolean;
          kyc_status?: 'pending' | 'submitted' | 'under_review' | 'approved' | 'rejected';
          kyc_submitted_at?: string | null;
          kyc_reviewed_at?: string | null;
          kyc_reviewed_by?: string | null;
          kyc_rejection_reason?: string | null;
          subscription_tier?: 'free' | 'basic' | 'professional' | 'enterprise';
          subscription_expires_at?: string | null;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          business_name?: string;
          slug?: string;
          description?: string | null;
          logo_url?: string | null;
          banner_url?: string | null;
          business_type?: string | null;
          business_registration_number?: string | null;
          tax_id?: string | null;
          phone?: string | null;
          email?: string | null;
          website?: string | null;
          address_line1?: string | null;
          address_line2?: string | null;
          city?: string | null;
          state_province?: string | null;
          postal_code?: string | null;
          country?: string;
          latitude?: number | null;
          longitude?: number | null;
          rating_average?: number;
          rating_count?: number;
          is_verified?: boolean;
          is_featured?: boolean;
          kyc_status?: 'pending' | 'submitted' | 'under_review' | 'approved' | 'rejected';
          kyc_submitted_at?: string | null;
          kyc_reviewed_at?: string | null;
          kyc_reviewed_by?: string | null;
          kyc_rejection_reason?: string | null;
          subscription_tier?: 'free' | 'basic' | 'professional' | 'enterprise';
          subscription_expires_at?: string | null;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'vendors_profile_id_fkey';
            columns: ['profile_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      admin_staff: {
        Row: {
          id: string;
          profile_id: string;
          role: 'admin' | 'manager' | 'staff' | 'viewer';
          permissions: string[];
          department: string | null;
          is_active: boolean;
          created_by: string | null;
          last_login_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          role: 'admin' | 'manager' | 'staff' | 'viewer';
          permissions?: string[];
          department?: string | null;
          is_active?: boolean;
          created_by?: string | null;
          last_login_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          role?: 'admin' | 'manager' | 'staff' | 'viewer';
          permissions?: string[];
          department?: string | null;
          is_active?: boolean;
          created_by?: string | null;
          last_login_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'admin_staff_profile_id_fkey';
            columns: ['profile_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'admin_staff_created_by_fkey';
            columns: ['created_by'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      vendor_staff: {
        Row: {
          id: string;
          vendor_id: string;
          profile_id: string;
          role: 'owner' | 'manager' | 'staff';
          permissions: string[];
          is_active: boolean;
          invited_by: string | null;
          invited_at: string | null;
          accepted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          vendor_id: string;
          profile_id: string;
          role?: 'owner' | 'manager' | 'staff';
          permissions?: string[];
          is_active?: boolean;
          invited_by?: string | null;
          invited_at?: string | null;
          accepted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          vendor_id?: string;
          profile_id?: string;
          role?: 'owner' | 'manager' | 'staff';
          permissions?: string[];
          is_active?: boolean;
          invited_by?: string | null;
          invited_at?: string | null;
          accepted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'vendor_staff_vendor_id_fkey';
            columns: ['vendor_id'];
            referencedRelation: 'vendors';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'vendor_staff_profile_id_fkey';
            columns: ['profile_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      // Additional tables can be added as needed
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: 'customer' | 'vendor' | 'admin' | 'super_admin' | 'manager' | 'staff' | 'viewer';
      kyc_status: 'pending' | 'submitted' | 'under_review' | 'approved' | 'rejected';
      subscription_tier: 'free' | 'basic' | 'professional' | 'enterprise';
      vendor_staff_role: 'owner' | 'manager' | 'staff';
      admin_staff_role: 'admin' | 'manager' | 'staff' | 'viewer';
      order_status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'returned' | 'refunded';
      payment_status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'partially_refunded';
      payment_method: 'mpesa' | 'card' | 'bank_transfer' | 'cash_on_delivery' | 'wallet';
      currency_code: 'KES' | 'USD' | 'EUR' | 'GBP';
    };
  };
}

/**
 * Helper type to extract table row types
 */
export type Tables<T extends keyof Database['api']['Tables']> =
  Database['api']['Tables'][T]['Row'];

/**
 * Helper type to extract table insert types
 */
export type TablesInsert<T extends keyof Database['api']['Tables']> =
  Database['api']['Tables'][T]['Insert'];

/**
 * Helper type to extract table update types
 */
export type TablesUpdate<T extends keyof Database['api']['Tables']> =
  Database['api']['Tables'][T]['Update'];

/**
 * Helper type to extract enum types
 */
export type Enums<T extends keyof Database['api']['Enums']> =
  Database['api']['Enums'][T];
