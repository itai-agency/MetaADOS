import type { KommoLeadsAdosRow } from '../types/rpc.js';
export interface KommoLeadsParams {
    fechaInicio: string;
    fechaFin: string;
}
export declare function getKommoLeadsAdos(params: KommoLeadsParams): Promise<KommoLeadsAdosRow[]>;
//# sourceMappingURL=kommo-leads-service.d.ts.map