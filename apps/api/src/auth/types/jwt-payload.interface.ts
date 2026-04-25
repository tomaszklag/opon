import { ProviderStatus, UserRole } from '@prisma/client';

export interface JwtPayload {
  sub: string; // userId
  phone: string;
  role: UserRole;
  providerId?: string;
  status?: ProviderStatus; // tylko dla providerów — do routingu w panelu
  jti?: string; // Session ID — obecne w obu tokenach; używane przy logout i rotation
}
