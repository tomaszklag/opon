import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

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
    } catch {
      throw new InternalServerErrorException('Błąd połączenia z CEIDG.');
    }

    if (response.status === 204 || response.status === 404) {
      throw new NotFoundException('NIP nie znaleziony w CEIDG.');
    }

    if (response.status === 400) {
      const body = (await response.json().catch(() => ({}))) as { code?: string };
      if (body.code === 'NIEPOPRAWNY_NUMER_NIP') {
        throw new NotFoundException('Nieprawidłowy numer NIP.');
      }
      throw new InternalServerErrorException('Błąd zapytania do CEIDG.');
    }

    if (!response.ok) {
      throw new InternalServerErrorException(`Błąd CEIDG: ${response.status}`);
    }

    const data = (await response.json()) as CeidgFirmaResponse;
    const firma = data.firma?.[0];

    if (!firma) {
      throw new NotFoundException('NIP nie znaleziony w CEIDG.');
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
