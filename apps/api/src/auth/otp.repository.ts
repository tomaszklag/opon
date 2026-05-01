import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OtpRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createToken(phone: string, codeHash: string, expiresAt: Date): Promise<void> {
    await this.prisma.otpToken.create({ data: { phone, codeHash, expiresAt } });
  }

  countRecent(phone: string, since: Date): Promise<number> {
    return this.prisma.otpToken.count({
      where: { phone, createdAt: { gt: since } },
    });
  }

  async findActiveToken(phone: string): Promise<{ expiresAt: Date } | null> {
    const token = await this.prisma.otpToken.findFirst({
      where: {
        phone,
        usedAt: null,
        expiresAt: { gt: new Date() },
        attempts: { lt: 3 },
      },
      orderBy: { expiresAt: 'desc' },
    });
    return token ? { expiresAt: token.expiresAt } : null;
  }

  /**
   * Weryfikuje kod OTP w transakcji: odczytuje aktywny token, porównuje hash,
   * inkrementuje próby lub oznacza jako użyty. Transakcja w repozytorium bo
   * obejmuje atomowy odczyt + zapis jednej encji.
   * Zwraca true gdy kod jest poprawny, false w każdym innym przypadku.
   */
  async verifyAndConsume(phone: string, code: string): Promise<boolean> {
    return this.prisma.$transaction(async (tx) => {
      const token = await tx.otpToken.findFirst({
        where: { phone, usedAt: null, expiresAt: { gt: new Date() } },
        orderBy: { expiresAt: 'desc' },
      });

      if (!token) return false;
      if (token.attempts >= 3) return false;

      const isValid = await bcrypt.compare(code, token.codeHash);

      if (!isValid) {
        await tx.otpToken.update({
          where: { id: token.id },
          data: { attempts: { increment: 1 } },
        });
        return false;
      }

      await tx.otpToken.update({
        where: { id: token.id },
        data: { usedAt: new Date() },
      });

      return true;
    });
  }
}
