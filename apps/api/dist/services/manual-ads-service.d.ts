export interface InsertManualAdParams {
    adId: string;
    adName: string;
    audience: string;
    ctr: number;
    cpm: number;
    totalLeads: number;
    costPerLead: number;
    totalInvestment: number;
}
export interface ManualAdRow {
    ad_id: string;
    ad_name: string;
    audience: string;
    ctr: number;
    cpm: number;
    total_leads: number;
    cost_per_lead: number;
    total_investment: number;
    qualified_leads?: number | null;
    sdr_notes?: string | null;
    updated_at?: string | null;
}
export declare function insertManualAd(params: InsertManualAdParams): Promise<void>;
export declare function getManualAd(adId: string): Promise<ManualAdRow | null>;
export declare function listManualAds(): Promise<ManualAdRow[]>;
export interface UpdateManualAdFullParams {
    adName: string;
    audience: string;
    ctr: number;
    cpm: number;
    totalLeads: number;
    costPerLead: number;
    totalInvestment: number;
    qualifiedLeads: number;
    sdrNotes: string;
}
export declare function updateManualAdSdr(adId: string, params: {
    qualifiedLeads: number;
    sdrNotes: string;
}): Promise<void>;
export declare function updateManualAdFull(adId: string, params: UpdateManualAdFullParams): Promise<void>;
//# sourceMappingURL=manual-ads-service.d.ts.map