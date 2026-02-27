import type { AdRowResponse } from '../types/rpc.js';
export interface AdsQueryParams {
    fechaInicio: string;
    fechaFin: string;
    accountId: string;
}
export declare function getAdsReport(params: AdsQueryParams): Promise<AdRowResponse[]>;
//# sourceMappingURL=ads-service.d.ts.map