import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppException, ErrorCode } from '../common/errors';

interface CeidgAdres {
  ulica?: string;
  budynek?: string;
  lokal?: string;
  miasto?: string;
  kod?: string;
}

interface CeidgPkd {
  kod?: string;
  nazwa?: string;
}

interface CeidgFirma {
  nazwa?: string;
  adresDzialalnosci?: CeidgAdres;
  pkdGlowny?: CeidgPkd;
  pkd?: CeidgPkd[];
  status?: string;
}

interface CeidgFirmaResponse {
  firma?: CeidgFirma[];
}

export interface GusResult {
  name: string;
  address: string;
  type: string;
  pkd: string;
  status: string;
}

const STATUS_MAP: Record<string, string> = {
  AKTYWNY: 'Aktywna',
  ZAWIESZONY: 'Zawieszona',
  WYKRESLONY: 'Wykreślona',
  OCZEKUJE_NA_ROZPOCZECIE_DZIALANOSCI: 'Oczekuje',
  WYLACZNIE_W_FORMIE_SPOLKI: 'Tylko spółka',
};

@Injectable()
export class GusService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://dane.biznes.gov.pl/api/ceidg/v3';

  constructor(config: ConfigService) {
    this.apiKey = config.getOrThrow<string>('GUS_API_KEY');
  }

  async lookupByNip(nip: string): Promise<GusResult> {
    const url = `${this.baseUrl}/firma?nip=${nip}`;

    let response: Response;
    try {
      response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          Accept: 'application/json',
        },
      });
    } catch (err) {
      if (err instanceof AppException) throw err;
      throw new AppException(ErrorCode.GUS_CONNECTION_ERROR, 'Błąd połączenia z CEIDG.', 502);
    }

    if (response.status === 204 || response.status === 404) {
      throw new AppException(ErrorCode.GUS_NIP_NOT_FOUND, 'NIP nie znaleziony w CEIDG.', 404);
    }

    if (response.status === 400) {
      const body = (await response.json().catch(() => ({}))) as { code?: string };
      if (body.code === 'NIEPOPRAWNY_NUMER_NIP') {
        throw new AppException(ErrorCode.GUS_INVALID_NIP, 'Nieprawidłowy numer NIP.', 422);
      }
      throw new AppException(ErrorCode.GUS_REQUEST_ERROR, 'Błąd zapytania do CEIDG.', 502);
    }

    if (!response.ok) {
      throw new AppException(ErrorCode.GUS_REQUEST_ERROR, `Błąd CEIDG: ${response.status}`, 502);
    }

    const data = (await response.json()) as CeidgFirmaResponse;
    const firma = data.firma?.[0];

    if (!firma) {
      throw new AppException(ErrorCode.GUS_NIP_NOT_FOUND, 'NIP nie znaleziony w CEIDG.', 404);
    }

    return this.mapFirma(firma);
  }

  private mapFirma(firma: CeidgFirma): GusResult {
    const addr = firma.adresDzialalnosci;
    const streetParts = [
      addr?.ulica,
      addr?.budynek,
      addr?.lokal ? `/${addr.lokal}` : undefined,
    ].filter(Boolean);
    const line1 = streetParts.join(' ');
    const line2 = [addr?.kod, addr?.miasto].filter(Boolean).join(' ');
    const address = [line1, line2].filter((s) => s.trim()).join(', ');

    const pkdCode = firma.pkdGlowny?.kod ?? firma.pkd?.[0]?.kod ?? '';

    return {
      name: firma.nazwa ?? '',
      address,
      type: 'JDG',
      pkd: pkdCode,
      status: STATUS_MAP[firma.status ?? ''] ?? firma.status ?? '',
    };
  }
}
