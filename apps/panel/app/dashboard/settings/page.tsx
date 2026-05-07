'use client';

import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { Button, Heading, Input, Modal, OTPInput, Text, Toggle } from '@opony/design-system-web';
import {
  IconAlertTriangle,
  IconBell,
  IconCheck,
  IconDownload,
  IconEyeOff,
  IconHours,
  IconInfo,
  IconLogOut,
  IconMail,
  IconMobilePhone,
  IconPause,
  IconPencil,
  IconSMS,
  IconStations,
  IconTrash,
} from '../../../components/icons';
import { useAuth } from '../../../lib/auth';
import { ApiError } from '../../../lib/api';
import { usePause, isIndefinitePause } from '../../../lib/hooks/use-pause';
import { ScrolledLayout, type ScrollSection } from '../../../components/ScrolledLayout';
import {
  getProvider,
  selfSuspendProvider,
  requestEmailChangeOtp,
  confirmEmailChange,
} from '../../../api-data-access/providers';
import {
  requestOtp,
  verifyOtp,
  changePhone,
  listSessions,
  revokeSession,
  revokeOtherSessions,
  type SessionDto,
} from '../../../api-data-access/auth';
import { requestAccountDeletion } from '../../../api-data-access/admin';
import {
  getNotificationPreferences,
  updateNotificationPreferences,
  type NotificationPreferencesDto,
} from '../../../api-data-access/notification-preferences';
import { requestDataExport } from '../../../api-data-access/data-exports';
import { usePushSubscription } from '../../../lib/hooks/use-push-subscription';
import styles from './settings.module.css';

// ── Types ────────────────────────────────────────────────────────────────────

type NotifKey =
  | 'newBooking'
  | 'cancelation'
  | 'reminder30'
  | 'newReview'
  | 'weeklyReport'
  | 'platformNews';
type Channel = 'sms' | 'email' | 'push';
type NotifState = Record<NotifKey, Record<Channel, boolean>>;

const NOTIF_INITIAL: NotifState = {
  newBooking: { sms: true, email: false, push: true },
  cancelation: { sms: true, email: false, push: true },
  reminder30: { sms: true, email: false, push: true },
  newReview: { sms: false, email: true, push: true },
  weeklyReport: { sms: false, email: true, push: false },
  platformNews: { sms: false, email: false, push: false },
};

const PUSH_DISABLED = new Set<NotifKey>(['weeklyReport', 'platformNews']);
const CRITICAL = new Set<NotifKey>(['newBooking', 'cancelation']);

const NOTIF_ROWS: { key: NotifKey; title: string; desc: string }[] = [
  {
    key: 'newBooking',
    title: 'Nowa rezerwacja',
    desc: 'Klient umawia wizytę · status PENDING, wymaga potwierdzenia w 15 min.',
  },
  {
    key: 'cancelation',
    title: 'Anulowanie rezerwacji',
    desc: 'Klient anuluje — potrzebujesz wiedzieć, żeby slot wrócił do puli.',
  },
  {
    key: 'reminder30',
    title: 'Przypomnienie 30 min przed wizytą',
    desc: 'Pomoc w planowaniu dnia — wysyłane tylko w godzinach pracy.',
  },
  {
    key: 'newReview',
    title: 'Nowa opinia od klienta',
    desc: 'Szybka odpowiedź do 48h zwiększa ranking warsztatu.',
  },
  {
    key: 'weeklyReport',
    title: 'Raport tygodniowy',
    desc: 'Podsumowanie rezerwacji, przychodu i opinii · poniedziałek rano.',
  },
  {
    key: 'platformNews',
    title: 'Nowości w platformie',
    desc: 'Zmiany w panelu, nowe funkcje, zaproszenia na webinary.',
  },
];

// ── Helpers — DTO ↔ state ────────────────────────────────────────────────────

function prefsToState(p: NotificationPreferencesDto): NotifState {
  return {
    newBooking: { sms: p.newBookingSms, email: p.newBookingEmail, push: p.newBookingPush },
    cancelation: { sms: p.cancelationSms, email: p.cancelationEmail, push: p.cancelationPush },
    reminder30: { sms: p.reminder30Sms, email: p.reminder30Email, push: p.reminder30Push },
    newReview: { sms: p.newReviewSms, email: p.newReviewEmail, push: p.newReviewPush },
    weeklyReport: { sms: p.weeklyReportSms, email: p.weeklyReportEmail, push: p.weeklyReportPush },
    platformNews: { sms: p.platformNewsSms, email: p.platformNewsEmail, push: p.platformNewsPush },
  };
}

function stateToPrefs(s: NotifState): NotificationPreferencesDto {
  return {
    newBookingSms: s.newBooking.sms,
    newBookingEmail: s.newBooking.email,
    newBookingPush: s.newBooking.push,
    cancelationSms: s.cancelation.sms,
    cancelationEmail: s.cancelation.email,
    cancelationPush: s.cancelation.push,
    reminder30Sms: s.reminder30.sms,
    reminder30Email: s.reminder30.email,
    reminder30Push: s.reminder30.push,
    newReviewSms: s.newReview.sms,
    newReviewEmail: s.newReview.email,
    newReviewPush: s.newReview.push,
    weeklyReportSms: s.weeklyReport.sms,
    weeklyReportEmail: s.weeklyReport.email,
    weeklyReportPush: s.weeklyReport.push,
    platformNewsSms: s.platformNews.sms,
    platformNewsEmail: s.platformNews.email,
    platformNewsPush: s.platformNews.push,
  };
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { data: notifPrefs, mutate: mutateNotifPrefs } = useSWR<NotificationPreferencesDto>(
    '/v1/providers/me/notification-preferences',
    getNotificationPreferences,
  );
  const notifs: NotifState = notifPrefs ? prefsToState(notifPrefs) : NOTIF_INITIAL;
  const {
    permission: pushPermission,
    subscribe: subscribePush,
    unsubscribe: unsubscribePush,
  } = usePushSubscription();
  const {
    isPaused,
    pausedUntil,
    applying,
    error: pauseError,
    pauseIndefinitely,
    pauseToday,
    pauseWeekend,
    pauseWeek,
    unpause,
  } = usePause();
  const auth = useAuth();
  const user = auth.status === 'authenticated' ? auth.user : null;
  const { data: provider, mutate: mutateProvider } = useSWR('/v1/providers/me', getProvider);

  type ConfirmAction = 'delete' | 'suspend';

  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const [confirmStep, setConfirmStep] = useState<1 | 2>(1);
  const [confirmNameDraft, setConfirmNameDraft] = useState('');
  const [confirmSmsCode, setConfirmSmsCode] = useState('');
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [confirmError, setConfirmError] = useState('');
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [deletionRequested, setDeletionRequested] = useState(false);
  const [suspensionApplied, setSuspensionApplied] = useState(false);
  const [dataExportOrdered, setDataExportOrdered] = useState(false);
  const [dataExportLoading, setDataExportLoading] = useState(false);
  const [dataExportError, setDataExportError] = useState('');
  const { data: sessions, mutate: mutateSessions } = useSWR<SessionDto[]>(
    '/v1/auth/sessions',
    listSessions,
  );
  const [busySessionIds, setBusySessionIds] = useState<Set<string>>(new Set());
  const [revokeAllLoading, setRevokeAllLoading] = useState(false);
  const [sessionError, setSessionError] = useState('');

  // ── Phone change modal ────────────────────────────────────────────────────
  const [phoneModalOpen, setPhoneModalOpen] = useState(false);
  const [phoneStep, setPhoneStep] = useState<1 | 2 | 3>(1);
  const [phoneCurrCode, setPhoneCurrCode] = useState('');
  const [phoneCurrCountdown, setPhoneCurrCountdown] = useState(0);
  const [phoneNewNumber, setPhoneNewNumber] = useState('');
  const [phoneNewOtpSent, setPhoneNewOtpSent] = useState(false);
  const [phoneNewCode, setPhoneNewCode] = useState('');
  const [phoneNewCountdown, setPhoneNewCountdown] = useState(0);
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [phoneError, setPhoneError] = useState('');

  // ── Email change modal ────────────────────────────────────────────────────
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailStep, setEmailStep] = useState<1 | 2>(1);
  const [emailNewAddress, setEmailNewAddress] = useState('');
  const [emailCode, setEmailCode] = useState('');
  const [emailCountdown, setEmailCountdown] = useState(0);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState('');

  useEffect(() => {
    if (otpCountdown <= 0) return;
    const t = setTimeout(() => setOtpCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [otpCountdown]);

  useEffect(() => {
    if (phoneCurrCountdown <= 0) return;
    const t = setTimeout(() => setPhoneCurrCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phoneCurrCountdown]);

  useEffect(() => {
    if (phoneNewCountdown <= 0) return;
    const t = setTimeout(() => setPhoneNewCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phoneNewCountdown]);

  useEffect(() => {
    if (emailCountdown <= 0) return;
    const t = setTimeout(() => setEmailCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [emailCountdown]);

  function formatCountdown(secs: number): string {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  function openPhoneModal() {
    setPhoneModalOpen(true);
    setPhoneStep(1);
    setPhoneCurrCode('');
    setPhoneCurrCountdown(0);
    setPhoneNewNumber('');
    setPhoneNewOtpSent(false);
    setPhoneNewCode('');
    setPhoneNewCountdown(0);
    setPhoneError('');
  }

  function closePhoneModal() {
    setPhoneModalOpen(false);
    setPhoneError('');
  }

  function openEmailModal() {
    setEmailModalOpen(true);
    setEmailStep(1);
    setEmailNewAddress('');
    setEmailCode('');
    setEmailCountdown(0);
    setEmailError('');
  }

  function closeEmailModal() {
    setEmailModalOpen(false);
    setEmailError('');
  }

  async function emailSendOtp() {
    const addr = emailNewAddress.trim();
    setEmailLoading(true);
    setEmailError('');
    try {
      const res = await requestEmailChangeOtp({ newEmail: addr });
      setEmailCountdown(res.expiresIn);
      setEmailCode('');
      setEmailStep(2);
    } catch (err) {
      setEmailError(
        err instanceof ApiError ? err.message : 'Nie udało się wysłać kodu. Spróbuj ponownie.',
      );
    } finally {
      setEmailLoading(false);
    }
  }

  async function emailResendOtp() {
    const addr = emailNewAddress.trim();
    setEmailLoading(true);
    setEmailError('');
    try {
      const res = await requestEmailChangeOtp({ newEmail: addr });
      setEmailCountdown(res.expiresIn);
      setEmailCode('');
    } catch (err) {
      setEmailError(
        err instanceof ApiError ? err.message : 'Nie udało się wysłać kodu. Spróbuj ponownie.',
      );
    } finally {
      setEmailLoading(false);
    }
  }

  async function emailConfirm() {
    setEmailLoading(true);
    setEmailError('');
    try {
      await confirmEmailChange({ newEmail: emailNewAddress.trim(), code: emailCode });
      await mutateProvider();
      setEmailModalOpen(false);
    } catch (err) {
      setEmailCode('');
      if (err instanceof ApiError) {
        if (err.code === 'EMAIL_CHANGE_OTP_INVALID') {
          setEmailError('Kod jest nieprawidłowy lub wygasł.');
        } else {
          setEmailError(err.message);
        }
      } else {
        setEmailError('Błąd sieci. Spróbuj ponownie.');
      }
    } finally {
      setEmailLoading(false);
    }
  }

  async function phoneStep1SendOtp() {
    if (!user) return;
    setPhoneLoading(true);
    setPhoneError('');
    try {
      const res = await requestOtp({ phone: user.phone });
      setPhoneCurrCountdown(res.expiresIn);
      setPhoneStep(2);
    } catch (err) {
      setPhoneError(
        err instanceof ApiError ? err.message : 'Nie udało się wysłać kodu SMS. Spróbuj ponownie.',
      );
    } finally {
      setPhoneLoading(false);
    }
  }

  async function phoneStep1Resend() {
    if (!user) return;
    setPhoneLoading(true);
    setPhoneError('');
    try {
      const res = await requestOtp({ phone: user.phone });
      setPhoneCurrCode('');
      setPhoneCurrCountdown(res.expiresIn);
    } catch (err) {
      setPhoneError(
        err instanceof ApiError ? err.message : 'Nie udało się wysłać kodu SMS. Spróbuj ponownie.',
      );
    } finally {
      setPhoneLoading(false);
    }
  }

  async function phoneStep2SendOtp() {
    const phone = phoneNewNumber.trim();
    setPhoneLoading(true);
    setPhoneError('');
    try {
      const res = await requestOtp({ phone });
      setPhoneNewCountdown(res.expiresIn);
      setPhoneNewOtpSent(true);
    } catch (err) {
      setPhoneError(
        err instanceof ApiError ? err.message : 'Nie udało się wysłać kodu SMS. Spróbuj ponownie.',
      );
    } finally {
      setPhoneLoading(false);
    }
  }

  async function phoneStep2Resend() {
    const phone = phoneNewNumber.trim();
    setPhoneLoading(true);
    setPhoneError('');
    try {
      const res = await requestOtp({ phone });
      setPhoneNewCode('');
      setPhoneNewCountdown(res.expiresIn);
    } catch (err) {
      setPhoneError(
        err instanceof ApiError ? err.message : 'Nie udało się wysłać kodu SMS. Spróbuj ponownie.',
      );
    } finally {
      setPhoneLoading(false);
    }
  }

  async function phoneConfirm() {
    setPhoneLoading(true);
    setPhoneError('');
    try {
      await changePhone({
        currentCode: phoneCurrCode,
        newPhone: phoneNewNumber.trim(),
        newCode: phoneNewCode,
      });
      await auth.refresh();
      setPhoneModalOpen(false);
    } catch (err) {
      setPhoneNewCode('');
      if (err instanceof ApiError) {
        if (err.code === 'PHONE_OTP_CURRENT_INVALID') {
          setPhoneError('Kod starego numeru jest nieprawidłowy lub wygasł. Zacznij od nowa.');
        } else if (err.code === 'PHONE_OTP_NEW_INVALID') {
          setPhoneError('Kod nowego numeru jest nieprawidłowy lub wygasł.');
        } else if (err.code === 'PHONE_ALREADY_IN_USE') {
          setPhoneError('Ten numer jest już przypisany do innego konta.');
        } else {
          setPhoneError(err.message);
        }
      } else {
        setPhoneError('Błąd sieci. Spróbuj ponownie.');
      }
    } finally {
      setPhoneLoading(false);
    }
  }

  function openConfirmModal(action: ConfirmAction) {
    setConfirmAction(action);
    setConfirmStep(1);
    setConfirmNameDraft('');
    setConfirmSmsCode('');
    setConfirmError('');
    setOtpCountdown(0);
  }

  function closeConfirmModal() {
    setConfirmAction(null);
    setConfirmError('');
  }

  async function goToStep2() {
    if (!user) return;
    setConfirmLoading(true);
    setConfirmError('');
    try {
      const res = await requestOtp({ phone: user.phone });
      setConfirmSmsCode('');
      setOtpCountdown(res.expiresIn);
      setConfirmStep(2);
    } catch (err) {
      setConfirmError(
        err instanceof ApiError ? err.message : 'Nie udało się wysłać kodu SMS. Spróbuj ponownie.',
      );
    } finally {
      setConfirmLoading(false);
    }
  }

  async function handleResendOtp() {
    if (!user) return;
    setConfirmLoading(true);
    setConfirmError('');
    try {
      const res = await requestOtp({ phone: user.phone });
      setConfirmSmsCode('');
      setOtpCountdown(res.expiresIn);
    } catch (err) {
      setConfirmError(
        err instanceof ApiError ? err.message : 'Nie udało się wysłać kodu SMS. Spróbuj ponownie.',
      );
    } finally {
      setConfirmLoading(false);
    }
  }

  async function handleConfirmSubmit() {
    if (!user) return;
    setConfirmLoading(true);
    setConfirmError('');
    try {
      await verifyOtp({ phone: user.phone, code: confirmSmsCode });
      if (confirmAction === 'delete') {
        await requestAccountDeletion();
        setDeletionRequested(true);
      } else {
        await selfSuspendProvider();
        setSuspensionApplied(true);
      }
      setConfirmAction(null);
    } catch (err) {
      setConfirmSmsCode('');
      if (err instanceof ApiError && err.code === 'OTP_INVALID_OR_EXPIRED') {
        setOtpCountdown(0);
        setConfirmError(
          'Kod jest nieprawidłowy lub wygasł. Wyślij nowy kod SMS, aby ponowić operację.',
        );
      } else {
        setConfirmError(err instanceof ApiError ? err.message : 'Błąd sieci. Spróbuj ponownie.');
      }
    } finally {
      setConfirmLoading(false);
    }
  }

  async function handleDataExportRequest() {
    setDataExportLoading(true);
    setDataExportError('');
    try {
      await requestDataExport();
      setDataExportOrdered(true);
    } catch (err) {
      if (err instanceof ApiError && err.code === 'DATA_EXPORT_ALREADY_PENDING') {
        setDataExportOrdered(true);
      } else {
        setDataExportError(
          err instanceof ApiError ? err.message : 'Nie udało się złożyć wniosku. Spróbuj ponownie.',
        );
      }
    } finally {
      setDataExportLoading(false);
    }
  }

  async function handleRevokeSession(id: string) {
    setBusySessionIds((prev) => new Set(prev).add(id));
    setSessionError('');
    try {
      await revokeSession(id);
      await mutateSessions();
    } catch (err) {
      setSessionError(
        err instanceof ApiError ? err.message : 'Nie udało się wylogować sesji. Spróbuj ponownie.',
      );
    } finally {
      setBusySessionIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }

  async function handleRevokeOtherSessions() {
    setRevokeAllLoading(true);
    setSessionError('');
    try {
      await revokeOtherSessions();
      await mutateSessions();
    } catch (err) {
      setSessionError(
        err instanceof ApiError ? err.message : 'Nie udało się wylogować sesji. Spróbuj ponownie.',
      );
    } finally {
      setRevokeAllLoading(false);
    }
  }

  function parseUserAgent(ua: string | null): { browser: string; os: string } {
    if (!ua) return { browser: 'Nieznana przeglądarka', os: 'Nieznany system' };
    let browser = 'Nieznana przeglądarka';
    let os = 'Nieznany system';
    if (/Edg\//.test(ua)) browser = 'Edge';
    else if (/OPR\//.test(ua)) browser = 'Opera';
    else if (/Chrome\//.test(ua)) browser = 'Chrome';
    else if (/Firefox\//.test(ua)) browser = 'Firefox';
    else if (/Safari\//.test(ua)) browser = 'Safari';
    if (/iPhone/.test(ua)) os = 'iPhone';
    else if (/iPad/.test(ua)) os = 'iPad';
    else if (/Android/.test(ua)) os = 'Android';
    else if (/Windows NT 10/.test(ua)) os = 'Windows 11/10';
    else if (/Windows NT/.test(ua)) os = 'Windows';
    else if (/Mac OS X/.test(ua)) os = 'macOS';
    else if (/Linux/.test(ua)) os = 'Linux';
    return { browser, os };
  }

  function maskIp(ip: string | null): string {
    if (!ip) return '';
    const parts = ip.split('.');
    if (parts.length === 4) return `${parts[0]}.${parts[1]}.${parts[2]}.xxx`;
    return ip;
  }

  function formatLoginDate(iso: string): string {
    const d = new Date(iso);
    const isToday = d.toDateString() === new Date().toDateString();
    const time = d.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
    if (isToday) return `Zalogowano dziś · ${time}`;
    return `Zalogowano ${d.toLocaleDateString('pl-PL', { day: '2-digit', month: 'short' })} · ${time}`;
  }

  function formatLastActive(iso: string): string {
    const diffMs = Date.now() - new Date(iso).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 2) return 'Aktywna teraz';
    if (diffMins < 60) return `Aktywna · ${diffMins} min temu`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Aktywna · ${diffHours} godz. temu`;
    const diffDays = Math.floor(diffHours / 24);
    return `Nieaktywna · ${diffDays} dni`;
  }

  const nameMatch = confirmNameDraft.trim() === (provider?.name ?? '').trim() && !!provider?.name;

  async function toggleNotif(key: NotifKey, channel: Channel) {
    const curr = notifs[key];
    const newVal = !curr[channel];
    if (CRITICAL.has(key) && !newVal) {
      const otherOn = (Object.keys(curr) as Channel[])
        .filter((c) => c !== channel)
        .some((c) => curr[c]);
      if (!otherOn) return;
    }
    // Przy włączaniu push — poproś o pozwolenie i zarejestruj subskrypcję
    if (channel === 'push' && newVal) {
      if (pushPermission === 'unsupported' || pushPermission === 'denied') return;
      if (pushPermission !== 'granted') {
        const ok = await subscribePush();
        if (!ok) return; // użytkownik odmówił lub błąd — nie zmieniaj togglea
      }
    }
    // Przy wyłączaniu push — wyrejestruj subskrypcję gdy wszystkie kanały push są wyłączone
    if (channel === 'push' && !newVal) {
      const allPushOff = (Object.keys(notifs) as NotifKey[]).every(
        (k) => k === key || !notifs[k].push,
      );
      if (allPushOff) await unsubscribePush();
    }
    const newState: NotifState = { ...notifs, [key]: { ...curr, [channel]: newVal } };
    const newPrefs = stateToPrefs(newState);
    await mutateNotifPrefs(updateNotificationPreferences(newPrefs), {
      optimisticData: newPrefs,
      rollbackOnError: true,
      revalidate: false,
    });
  }

  const sections: ScrollSection[] = [
    {
      id: 'contact',
      num: '01',
      label: 'Kontakt administracyjny',
      content: (
        <>
          <header className={styles.secHead}>
            <Text variant="nano" as="span" weight="extrabold" mono className={styles.secNum}>
              01
            </Text>
            <div className={styles.secTitleCol}>
              <Heading variant="subsection" as="h2" id="t-contact">
                Kontakt administracyjny
              </Heading>
              <Text variant="caption" color="muted" as="p" className={styles.secDesc}>
                Numer telefonu służy do logowania (SMS OTP). Email otrzymuje paragony i
                powiadomienia administracyjne — nie jest widoczny publicznie.
              </Text>
            </div>
          </header>

          <div className={styles.contactRow}>
            <div className={styles.contactCard}>
              <div className={styles.contactLbl}>
                <Text variant="nano" as="span" color="muted" weight="bold" mono>
                  Telefon · login
                </Text>
                <span className={styles.verified}>
                  <IconCheck width="9" height="9" />
                  <Text variant="nano" as="span">
                    Zweryfikowany
                  </Text>
                </span>
              </div>
              <div className={styles.contactValRow}>
                <Text variant="body" as="span" weight="bold" mono className={styles.contactVal}>
                  {user?.phone ?? '—'}
                </Text>
                <Button variant="neutral" size="sm" onClick={openPhoneModal}>
                  <IconPencil width="11" height="11" />
                  Zmień
                </Button>
              </div>
              <Text variant="caption" color="muted" as="p">
                Zmiana wymaga OTP na stary numer, a następnie OTP na nowy. Sesja pozostanie aktywna.
              </Text>
            </div>

            <div className={styles.contactCard}>
              <div className={styles.contactLbl}>
                <Text variant="nano" as="span" color="muted" weight="bold" mono>
                  Email · administracyjny
                </Text>
                {provider?.emailVerifiedAt ? (
                  <span className={styles.verified}>
                    <IconCheck width="9" height="9" />
                    <Text variant="nano" as="span">
                      Zweryfikowany
                    </Text>
                  </span>
                ) : provider?.email ? (
                  <span className={styles.unverified}>
                    <IconAlertTriangle width="9" height="9" />
                    <Text variant="nano" as="span">
                      Niezweryfikowany
                    </Text>
                  </span>
                ) : null}
              </div>
              <div className={styles.contactValRow}>
                <Text variant="body-sm" as="span" weight="bold" mono className={styles.contactVal}>
                  {provider?.email ?? '—'}
                </Text>
                <Button variant="neutral" size="sm" onClick={openEmailModal}>
                  <IconPencil width="11" height="11" />
                  Zmień
                </Button>
              </div>
              <Text variant="caption" color="muted" as="p">
                Zmiana wymaga potwierdzenia 6-cyfrowym kodem wysłanym na nowy adres email.
              </Text>
            </div>
          </div>
        </>
      ),
    },
    {
      id: 'pause',
      num: '02',
      label: 'Pauza warsztatu',
      sectionClassName: styles.sectionAccent,
      content: (
        <>
          <header className={styles.secHead}>
            <Text
              variant="nano"
              as="span"
              weight="extrabold"
              mono
              className={`${styles.secNum} ${styles.secNumAccent}`}
            >
              02
            </Text>
            <div className={styles.secTitleCol}>
              <Heading variant="subsection" as="h2" id="t-pause">
                Pauza warsztatu
              </Heading>
              <Text variant="caption" color="muted" as="p" className={styles.secDesc}>
                Włącz, gdy jedziesz na urlop albo przyjmujesz awarie &quot;off-book&quot;. Warsztat
                znika z wyszukiwarki klientów, ale istniejące rezerwacje są zachowane.
              </Text>
            </div>
          </header>

          <div className={styles.pauseHero}>
            <span
              className={`${styles.pauseIco} ${isPaused ? styles.pauseIcoPaused : styles.pauseIcoActive}`}
              aria-hidden="true"
            >
              <IconHours width="24" height="24" />
            </span>
            <div className={styles.pauseStatusCol}>
              <Heading variant="subsection" as="span">
                {isPaused ? 'WARSZTAT ZAPAUZOWANY' : 'WARSZTAT AKTYWNY'}
              </Heading>
              {isPaused && pausedUntil ? (
                <Text variant="body-sm" color="secondary" as="span">
                  Niewidoczny w wyszukiwarce. Pauza{' '}
                  {isIndefinitePause(pausedUntil) ? (
                    <Text variant="body-sm" as="span" weight="bold">
                      bezterminowa
                    </Text>
                  ) : (
                    <>
                      do:{' '}
                      <Text variant="body-sm" as="span" weight="bold">
                        {new Date(pausedUntil).toLocaleDateString('pl-PL', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </Text>
                    </>
                  )}
                  .
                </Text>
              ) : (
                <Text variant="body-sm" color="secondary" as="span">
                  Widoczny w wyszukiwarce. Klienci mogą składać rezerwacje.
                </Text>
              )}
            </div>
            {isPaused ? (
              <Button variant="primary" size="sm" onClick={unpause} loading={applying}>
                Odblokuj warsztat
              </Button>
            ) : (
              <Button variant="neutral" size="sm" onClick={pauseIndefinitely} loading={applying}>
                <IconPause width="13" height="13" />
                Zapauzuj teraz
              </Button>
            )}
          </div>

          {pauseError && (
            <Text variant="body-sm" as="p" color="danger">
              {pauseError}
            </Text>
          )}

          {!isPaused && (
            <div className={styles.pausePresets}>
              <button
                type="button"
                className={styles.pausePreset}
                onClick={pauseToday}
                disabled={applying}
              >
                <Text variant="nano" as="span" color="muted" weight="bold" mono>
                  Preset
                </Text>
                <Heading variant="subsection" as="span">
                  Dziś
                </Heading>
                <Text variant="nano" as="span" color="muted">
                  Do końca dnia · 23:59
                </Text>
              </button>
              <button
                type="button"
                className={styles.pausePreset}
                onClick={pauseWeekend}
                disabled={applying}
              >
                <Text variant="nano" as="span" color="muted" weight="bold" mono>
                  Preset
                </Text>
                <Heading variant="subsection" as="span">
                  Weekend
                </Heading>
                <Text variant="nano" as="span" color="muted">
                  Do najbliższego poniedziałku
                </Text>
              </button>
              <button
                type="button"
                className={styles.pausePreset}
                onClick={pauseWeek}
                disabled={applying}
              >
                <Text variant="nano" as="span" color="muted" weight="bold" mono>
                  Preset
                </Text>
                <Heading variant="subsection" as="span">
                  Tydzień
                </Heading>
                <Text variant="nano" as="span" color="muted">
                  7 dni od teraz
                </Text>
              </button>
            </div>
          )}
        </>
      ),
    },
    {
      id: 'notifs',
      num: '03',
      label: 'Powiadomienia',
      content: (
        <>
          <header className={styles.secHead}>
            <Text variant="nano" as="span" weight="extrabold" mono className={styles.secNum}>
              03
            </Text>
            <div className={styles.secTitleCol}>
              <Heading variant="subsection" as="h2" id="t-notifs">
                Powiadomienia
              </Heading>
              <Text variant="caption" color="muted" as="p" className={styles.secDesc}>
                Wybierz kanały per typ zdarzenia. Krytyczne powiadomienia (✦) wymagają co najmniej
                jednego aktywnego kanału — tego nie wyłączysz całkowicie.
              </Text>
            </div>
          </header>

          <table className={styles.notifTable} aria-label="Kanały powiadomień">
            <thead>
              <tr>
                <th className={styles.notifTh}>
                  <Text variant="nano" as="span" weight="bold" mono color="muted">
                    Zdarzenie
                  </Text>
                </th>
                <th className={`${styles.notifTh} ${styles.notifThChannel}`}>
                  <span className={styles.channelIco}>
                    <IconSMS width="11" height="11" />
                  </span>
                  <Text variant="nano" as="span" weight="bold" mono color="muted">
                    SMS
                  </Text>
                </th>
                <th className={`${styles.notifTh} ${styles.notifThChannel}`}>
                  <span className={styles.channelIco}>
                    <IconMail width="11" height="11" />
                  </span>
                  <Text variant="nano" as="span" weight="bold" mono color="muted">
                    Email
                  </Text>
                </th>
                <th className={`${styles.notifTh} ${styles.notifThChannel}`}>
                  <span className={styles.channelIco}>
                    <IconBell width="11" height="11" />
                  </span>
                  <Text variant="nano" as="span" weight="bold" mono color="muted">
                    Push
                  </Text>
                </th>
              </tr>
            </thead>
            <tbody>
              {NOTIF_ROWS.map(({ key, title, desc }) => (
                <tr key={key} className={styles.notifTr}>
                  <td className={styles.notifTd}>
                    <div className={styles.notifEvent}>
                      <Text variant="body-sm" as="span" weight="bold">
                        {CRITICAL.has(key) && (
                          <span className={styles.criticalBadge}>
                            <Text variant="nano" as="span" weight="bold" mono color="accent">
                              ✦ KRYT.
                            </Text>
                          </span>
                        )}
                        {title}
                      </Text>
                      <Text variant="caption" color="muted" as="span">
                        {desc}
                      </Text>
                    </div>
                  </td>
                  {(['sms', 'email', 'push'] as Channel[]).map((ch) => {
                    const isDisabled =
                      ch === 'push' && (PUSH_DISABLED.has(key) || pushPermission === 'unsupported');
                    return (
                      <td key={ch} className={styles.switchCell}>
                        <div className={styles.switchWrap}>
                          <Toggle
                            size="sm"
                            checked={notifs[key][ch]}
                            onChange={() => !isDisabled && toggleNotif(key, ch)}
                            disabled={isDisabled}
                            aria-label={`${ch} ${title}`}
                          />
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ),
    },
    {
      id: 'sessions',
      num: '04',
      label: 'Aktywne sesje',
      content: (
        <>
          <header className={styles.secHead}>
            <Text variant="nano" as="span" weight="extrabold" mono className={styles.secNum}>
              04
            </Text>
            <div className={styles.secTitleCol}>
              <Heading variant="subsection" as="h2" id="t-sessions">
                Aktywne sesje
              </Heading>
              <Text variant="caption" color="muted" as="p" className={styles.secDesc}>
                Urządzenia zalogowane do panelu. Nie widzisz czegoś swojego? Wyloguj wszystkie i
                zmień numer telefonu.
              </Text>
            </div>
          </header>

          <div className={styles.sessionList}>
            {sessions
              ?.filter((s) => !s.revokedAt && new Date(s.expiresAt) >= new Date())
              .map((session) => {
                const { browser, os } = parseUserAgent(session.userAgent ?? null);
                const maskedIp = maskIp(session.ipAddress ?? null);
                const isMobile = /iPhone|iPad|Android/.test(session.userAgent ?? '');
                const isIdle =
                  Date.now() - new Date(session.lastUsedAt).getTime() > 24 * 60 * 60 * 1000;
                return (
                  <div
                    key={session.id}
                    className={`${styles.sessionItem} ${session.isCurrent ? styles.sessionCurrent : ''}`}
                  >
                    <span
                      className={`${styles.sessionIco} ${session.isCurrent ? styles.sessionIcoCurrent : ''}`}
                    >
                      {isMobile ? (
                        <IconMobilePhone width="16" height="16" />
                      ) : (
                        <IconStations width="16" height="16" />
                      )}
                    </span>
                    <div className={styles.sessionInfo}>
                      <div className={styles.sessionMain}>
                        <Text variant="body-sm" as="span" weight="bold">
                          {browser} · {os}
                        </Text>
                        {session.isCurrent && (
                          <span className={styles.sessionCurrentBadge}>
                            <Text variant="nano" as="span" weight="bold" mono>
                              TA SESJA
                            </Text>
                          </span>
                        )}
                      </div>
                      <div className={styles.sessionMeta}>
                        {maskedIp && (
                          <>
                            <Text variant="nano" as="span" color="muted" mono>
                              {maskedIp}
                            </Text>
                            <span className={styles.dotSep} aria-hidden="true" />
                          </>
                        )}
                        <Text variant="nano" as="span" color="muted" mono>
                          {formatLoginDate(session.createdAt)}
                        </Text>
                        <span className={styles.dotSep} aria-hidden="true" />
                        <Text variant="nano" as="span" color={isIdle ? 'warning' : 'muted'} mono>
                          {formatLastActive(session.lastUsedAt)}
                        </Text>
                      </div>
                    </div>
                    {!session.isCurrent && (
                      <Button
                        variant="neutral-danger"
                        size="sm"
                        loading={busySessionIds.has(session.id)}
                        disabled={busySessionIds.has(session.id)}
                        onClick={() => handleRevokeSession(session.id)}
                      >
                        <IconLogOut width="12" height="12" />
                        Wyloguj
                      </Button>
                    )}
                  </div>
                );
              })}

            {sessionError && (
              <Text variant="caption" color="danger" as="p">
                {sessionError}
              </Text>
            )}

            {sessions &&
              sessions.filter(
                (s) => !s.isCurrent && !s.revokedAt && new Date(s.expiresAt) >= new Date(),
              ).length > 0 && (
                <div className={styles.sessionLogoutAll}>
                  <Button
                    variant="neutral-danger"
                    size="sm"
                    loading={revokeAllLoading}
                    disabled={revokeAllLoading}
                    onClick={handleRevokeOtherSessions}
                  >
                    <IconLogOut width="12" height="12" />
                    Wyloguj wszystkie inne urządzenia (
                    {
                      sessions.filter(
                        (s) => !s.isCurrent && !s.revokedAt && new Date(s.expiresAt) >= new Date(),
                      ).length
                    }
                    )
                  </Button>
                </div>
              )}
          </div>
        </>
      ),
    },
    {
      id: 'rodo',
      num: '05',
      label: 'Dane (RODO)',
      content: (
        <>
          <header className={styles.secHead}>
            <Text variant="nano" as="span" weight="extrabold" mono className={styles.secNum}>
              05
            </Text>
            <div className={styles.secTitleCol}>
              <Heading variant="subsection" as="h2" id="t-rodo">
                Twoje dane (RODO)
              </Heading>
              <Text variant="caption" color="muted" as="p" className={styles.secDesc}>
                Masz prawo otrzymać kopię swoich danych i wiedzieć, co o Tobie wiemy.
              </Text>
            </div>
          </header>

          <div className={styles.rodoRow}>
            <div className={styles.rodoCard}>
              <span className={styles.rodoIco}>
                <IconDownload width="15" height="15" />
              </span>
              <div className={styles.rodoCol}>
                <Text variant="body-sm" as="span" weight="bold">
                  Pobierz moje dane
                </Text>
                {dataExportOrdered ? (
                  <Text variant="caption" color="accent" as="p">
                    Wniosek złożony. Prześlemy dane na email w ciągu 14 dni.
                  </Text>
                ) : (
                  <>
                    <Text variant="caption" color="muted" as="p">
                      Wyślemy paczkę ZIP (JSON + PDF) na email administracyjny w ciągu 14 dni.
                      Zawiera: profil firmy, rezerwacje, opinie, logi logowania.
                    </Text>
                    {dataExportError && (
                      <Text variant="caption" color="danger" as="p">
                        {dataExportError}
                      </Text>
                    )}
                  </>
                )}
              </div>
              <Button
                variant="neutral"
                size="sm"
                loading={dataExportLoading}
                disabled={dataExportOrdered || dataExportLoading}
                onClick={handleDataExportRequest}
              >
                {dataExportOrdered ? <IconCheck width="13" height="13" /> : 'Zamów'}
              </Button>
            </div>

            <div className={styles.rodoCard}>
              <span className={styles.rodoIco}>
                <IconInfo width="15" height="15" />
              </span>
              <div className={styles.rodoCol}>
                <Text variant="body-sm" as="span" weight="bold">
                  Zgłoś nieprawidłowość
                </Text>
                <Text variant="caption" color="muted" as="p">
                  Jeśli widzisz dane, których nie powinno być — napisz do{' '}
                  <Text variant="caption" as="span" weight="bold">
                    rodo@opony.app
                  </Text>
                  . Odpowiadamy do 72h zgodnie z art. 12 RODO.
                </Text>
              </div>
              <Button variant="neutral" size="sm">
                Napisz
              </Button>
            </div>
          </div>
        </>
      ),
    },
    {
      id: 'danger',
      num: '06',
      label: 'Strefa niebezpieczna',
      danger: true,
      sectionClassName: `${styles.sectionDanger} ${styles.sectionDangerOffset}`,
      content: (
        <>
          <header className={styles.secHead}>
            <Text
              variant="nano"
              as="span"
              weight="extrabold"
              mono
              className={`${styles.secNum} ${styles.secNumDanger}`}
            >
              06
            </Text>
            <div className={styles.secTitleCol}>
              <Heading variant="subsection" as="h2" id="t-danger" color="danger">
                Strefa niebezpieczna
              </Heading>
              <Text variant="caption" color="muted" as="p" className={styles.secDesc}>
                Akcje nieodwracalne. Dobrze pomyśl i — jeśli możesz — wyeksportuj dane przed
                kliknięciem.
              </Text>
            </div>
          </header>

          {suspensionApplied ? (
            <div className={styles.deletionRequestedCard}>
              <span className={styles.deletionRequestedIco}>
                <IconCheck width="14" height="14" />
              </span>
              <div className={styles.deletionRequestedCol}>
                <Text variant="body-sm" as="span" weight="bold">
                  Warsztat zawieszony
                </Text>
                <Text variant="caption" color="muted" as="p">
                  Warsztat jest ukryty w wyszukiwarce. Aby go przywrócić, skontaktuj się z
                  administratorem lub zaloguj się ponownie.
                </Text>
              </div>
            </div>
          ) : (
            <div className={styles.dangerItem}>
              <div className={styles.dangerInfo}>
                <div className={styles.dangerTitle}>
                  <IconAlertTriangle width="13" height="13" className={styles.dangerTitleIco} />
                  <Text variant="body-sm" as="span" weight="bold" color="danger">
                    Zawieś widoczność warsztatu
                  </Text>
                </div>
                <Text variant="caption" color="secondary" as="p">
                  Ukryj warsztat z wyszukiwarki na czas nieokreślony — bez usuwania konta.
                  Istniejące rezerwacje pozostają, ale nowe nie mogą być składane. Wymaga
                  potwierdzenia nazwy warsztatu i weryfikacji SMS.
                </Text>
              </div>
              <Button variant="danger" size="sm" onClick={() => openConfirmModal('suspend')}>
                <IconEyeOff width="12" height="12" />
                Ukryj warsztat
              </Button>
            </div>
          )}

          {deletionRequested ? (
            <div className={styles.deletionRequestedCard}>
              <span className={styles.deletionRequestedIco}>
                <IconCheck width="14" height="14" />
              </span>
              <div className={styles.deletionRequestedCol}>
                <Text variant="body-sm" as="span" weight="bold">
                  Wniosek o usunięcie konta złożony
                </Text>
                <Text variant="caption" color="muted" as="p">
                  Administrator zweryfikuje wniosek. Dane zostaną trwale usunięte po 30 dniach od
                  zatwierdzenia.
                </Text>
              </div>
            </div>
          ) : (
            <div className={styles.dangerItem}>
              <div className={styles.dangerInfo}>
                <div className={styles.dangerTitle}>
                  <IconAlertTriangle width="13" height="13" className={styles.dangerTitleIco} />
                  <Text variant="body-sm" as="span" weight="bold" color="danger">
                    Usuń konto i wszystkie dane
                  </Text>
                </div>
                <Text variant="caption" color="secondary" as="p">
                  Nieodwracalne. Warsztat znika z wyszukiwarki natychmiast, dane pozostają w
                  systemie 30 dni (okres odwołania), potem są{' '}
                  <Text variant="caption" as="span" weight="bold">
                    trwale usunięte
                  </Text>
                  . Wymagamy potwierdzenia nazwy warsztatu i weryfikacji SMS.
                </Text>
              </div>
              <Button variant="danger" size="sm" onClick={() => openConfirmModal('delete')}>
                <IconTrash width="12" height="12" />
                Usuń konto
              </Button>
            </div>
          )}
        </>
      ),
    },
  ];

  return (
    <div className={styles.root}>
      <ScrolledLayout sections={sections} />

      {/* ── Shared confirm modal (suspend / delete) ── */}
      <Modal
        isOpen={confirmAction !== null}
        onClose={closeConfirmModal}
        title={
          confirmStep === 1
            ? confirmAction === 'delete'
              ? 'Usuń konto — krok 1 z 2'
              : 'Zawieś warsztat — krok 1 z 2'
            : confirmAction === 'delete'
              ? 'Usuń konto — krok 2 z 2'
              : 'Zawieś warsztat — krok 2 z 2'
        }
        size="sm"
        footer={
          confirmStep === 1 ? (
            <div className={styles.modalFooter}>
              <Button variant="neutral" size="sm" onClick={closeConfirmModal}>
                Anuluj
              </Button>
              <Button
                variant="danger"
                size="sm"
                disabled={!nameMatch || confirmLoading}
                loading={confirmLoading}
                onClick={goToStep2}
              >
                Dalej →
              </Button>
            </div>
          ) : (
            <div className={styles.modalFooter}>
              <Button variant="neutral" size="sm" onClick={() => setConfirmStep(1)}>
                ← Wstecz
              </Button>
              <Button
                variant="danger"
                size="sm"
                disabled={confirmSmsCode.length < 6 || confirmLoading || otpCountdown <= 0}
                loading={confirmLoading}
                onClick={handleConfirmSubmit}
              >
                {confirmAction === 'delete' ? (
                  <>
                    <IconTrash width="12" height="12" />
                    Potwierdź usunięcie
                  </>
                ) : (
                  <>
                    <IconEyeOff width="12" height="12" />
                    Potwierdź zawieszenie
                  </>
                )}
              </Button>
            </div>
          )
        }
      >
        {confirmStep === 1 && (
          <div className={styles.modalStep}>
            <div className={styles.modalWarning}>
              <IconAlertTriangle width="14" height="14" className={styles.modalWarningIco} />
              <Text variant="caption" as="p">
                {confirmAction === 'delete'
                  ? 'Tej operacji nie można cofnąć. Warsztat zniknie z wyszukiwarki natychmiast, a dane zostaną trwale usunięte po 30 dniach.'
                  : 'Warsztat zniknie z wyszukiwarki natychmiast. Istniejące rezerwacje pozostają, ale nowe nie będą możliwe. Odblokowanie wymaga kontaktu z administratorem.'}
              </Text>
            </div>
            <Text variant="caption" color="muted" as="p" className={styles.modalLabel}>
              Wpisz dokładną nazwę warsztatu, aby kontynuować:
            </Text>
            <Text variant="body-sm" as="p" weight="bold" className={styles.modalProviderName}>
              {provider?.name ?? '…'}
            </Text>
            <Input
              value={confirmNameDraft}
              onChange={(e) => setConfirmNameDraft(e.target.value)}
              placeholder="Nazwa warsztatu"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && nameMatch) goToStep2();
              }}
            />
            {confirmError && (
              <Text variant="caption" color="danger" as="p">
                {confirmError}
              </Text>
            )}
          </div>
        )}
        {confirmStep === 2 && (
          <div className={styles.modalStep}>
            <Text variant="body-sm" as="p" color="muted">
              Wysłaliśmy 6-cyfrowy kod na numer{' '}
              <Text variant="body-sm" as="span" weight="bold" mono>
                {user?.phone}
              </Text>
              .{' '}
              {confirmAction === 'delete'
                ? 'Wpisz go poniżej, aby potwierdzić usunięcie konta.'
                : 'Wpisz go poniżej, aby potwierdzić zawieszenie warsztatu.'}
            </Text>
            <div className={styles.modalOtp}>
              <OTPInput
                length={6}
                value={confirmSmsCode}
                onChange={setConfirmSmsCode}
                autoFocus={otpCountdown > 0}
                disabled={otpCountdown <= 0}
                error={!!confirmError}
              />
            </div>
            {otpCountdown > 0 ? (
              <div className={styles.otpTimer}>
                <Text variant="caption" color="muted" as="span">
                  Kod wygaśnie za
                </Text>
                <Text
                  variant="caption"
                  weight="bold"
                  mono
                  as="span"
                  className={styles.otpTimerValue}
                >
                  {formatCountdown(otpCountdown)}
                </Text>
              </div>
            ) : (
              <div className={styles.otpExpired}>
                <Text variant="caption" color="danger" as="span">
                  Kod wygasł.
                </Text>
                <Button
                  variant="neutral"
                  size="sm"
                  onClick={handleResendOtp}
                  loading={confirmLoading}
                >
                  Wyślij ponownie
                </Button>
              </div>
            )}
            {confirmError && (
              <Text variant="caption" color="danger" as="p">
                {confirmError}
              </Text>
            )}
          </div>
        )}
      </Modal>

      {/* ── Phone change modal ── */}
      <Modal
        isOpen={phoneModalOpen}
        onClose={closePhoneModal}
        title={
          phoneStep === 1
            ? 'Zmiana numeru — krok 1 z 3'
            : phoneStep === 2
              ? 'Zmiana numeru — krok 2 z 3'
              : 'Zmiana numeru — krok 3 z 3'
        }
        size="sm"
        footer={
          phoneStep === 1 ? (
            <div className={styles.modalFooter}>
              <Button variant="neutral" size="sm" onClick={closePhoneModal}>
                Anuluj
              </Button>
              <Button
                variant="primary"
                size="sm"
                loading={phoneLoading}
                onClick={phoneStep1SendOtp}
              >
                <IconSMS width="12" height="12" />
                Wyślij kod SMS →
              </Button>
            </div>
          ) : phoneStep === 2 ? (
            <div className={styles.modalFooter}>
              <Button
                variant="neutral"
                size="sm"
                onClick={() => {
                  setPhoneStep(1);
                  setPhoneError('');
                }}
              >
                ← Wstecz
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={phoneCurrCode.length < 6 || phoneCurrCountdown <= 0}
                onClick={() => {
                  setPhoneStep(3);
                  setPhoneError('');
                }}
              >
                Dalej →
              </Button>
            </div>
          ) : (
            <div className={styles.modalFooter}>
              <Button
                variant="neutral"
                size="sm"
                onClick={() => {
                  setPhoneStep(2);
                  setPhoneError('');
                }}
              >
                ← Wstecz
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={
                  !phoneNewOtpSent ||
                  phoneNewCode.length < 6 ||
                  phoneNewCountdown <= 0 ||
                  phoneLoading
                }
                loading={phoneLoading}
                onClick={phoneConfirm}
              >
                <IconCheck width="12" height="12" />
                Potwierdź zmianę
              </Button>
            </div>
          )
        }
      >
        {phoneStep === 1 && (
          <div className={styles.modalStep}>
            <Text variant="body-sm" as="p" color="muted">
              Wyślemy jednorazowy kod SMS na Twój bieżący numer{' '}
              <Text variant="body-sm" as="span" weight="bold" mono>
                {user?.phone}
              </Text>
              , aby potwierdzić tożsamość przed zmianą.
            </Text>
            {phoneError && (
              <Text variant="caption" color="danger" as="p">
                {phoneError}
              </Text>
            )}
          </div>
        )}

        {phoneStep === 2 && (
          <div className={styles.modalStep}>
            <Text variant="body-sm" as="p" color="muted">
              Wysłaliśmy 6-cyfrowy kod na numer{' '}
              <Text variant="body-sm" as="span" weight="bold" mono>
                {user?.phone}
              </Text>
              . Wpisz go poniżej.
            </Text>
            <div className={styles.modalOtp}>
              <OTPInput
                length={6}
                value={phoneCurrCode}
                onChange={setPhoneCurrCode}
                autoFocus={phoneCurrCountdown > 0}
                disabled={phoneCurrCountdown <= 0}
                error={!!phoneError}
              />
            </div>
            {phoneCurrCountdown > 0 ? (
              <div className={styles.otpTimer}>
                <Text variant="caption" color="muted" as="span">
                  Kod wygaśnie za
                </Text>
                <Text
                  variant="caption"
                  weight="bold"
                  mono
                  as="span"
                  className={styles.otpTimerValue}
                >
                  {formatCountdown(phoneCurrCountdown)}
                </Text>
              </div>
            ) : (
              <div className={styles.otpExpired}>
                <Text variant="caption" color="danger" as="span">
                  Kod wygasł.
                </Text>
                <Button
                  variant="neutral"
                  size="sm"
                  onClick={phoneStep1Resend}
                  loading={phoneLoading}
                >
                  Wyślij ponownie
                </Button>
              </div>
            )}
            {phoneError && (
              <Text variant="caption" color="danger" as="p">
                {phoneError}
              </Text>
            )}
          </div>
        )}

        {phoneStep === 3 && (
          <div className={styles.modalStep}>
            <Text variant="body-sm" as="p" color="muted">
              Podaj nowy numer telefonu. Wyślemy na niego kod weryfikacyjny.
            </Text>
            <div className={styles.phoneNewRow}>
              <Input
                value={phoneNewNumber}
                onChange={(e) => {
                  setPhoneNewNumber(e.target.value);
                  setPhoneNewOtpSent(false);
                  setPhoneNewCode('');
                  setPhoneNewCountdown(0);
                }}
                placeholder="+48123456789"
                autoFocus={!phoneNewOtpSent}
                disabled={phoneLoading}
                onKeyDown={(e) => {
                  if (
                    e.key === 'Enter' &&
                    /^\+48\d{9}$/.test(phoneNewNumber.trim()) &&
                    !phoneNewOtpSent
                  ) {
                    phoneStep2SendOtp();
                  }
                }}
              />
              <Button
                variant="neutral"
                size="sm"
                disabled={!/^\+48\d{9}$/.test(phoneNewNumber.trim()) || phoneLoading}
                loading={phoneLoading && !phoneNewOtpSent}
                onClick={phoneStep2SendOtp}
              >
                <IconSMS width="12" height="12" />
                {phoneNewOtpSent ? 'Wysłano' : 'Wyślij kod'}
              </Button>
            </div>
            {phoneNewOtpSent && (
              <>
                <Text variant="body-sm" as="p" color="muted">
                  Kod wysłany na{' '}
                  <Text variant="body-sm" as="span" weight="bold" mono>
                    {phoneNewNumber.trim()}
                  </Text>
                  .
                </Text>
                <div className={styles.modalOtp}>
                  <OTPInput
                    length={6}
                    value={phoneNewCode}
                    onChange={setPhoneNewCode}
                    autoFocus={phoneNewCountdown > 0}
                    disabled={phoneNewCountdown <= 0}
                    error={!!phoneError}
                  />
                </div>
                {phoneNewCountdown > 0 ? (
                  <div className={styles.otpTimer}>
                    <Text variant="caption" color="muted" as="span">
                      Kod wygaśnie za
                    </Text>
                    <Text
                      variant="caption"
                      weight="bold"
                      mono
                      as="span"
                      className={styles.otpTimerValue}
                    >
                      {formatCountdown(phoneNewCountdown)}
                    </Text>
                  </div>
                ) : (
                  <div className={styles.otpExpired}>
                    <Text variant="caption" color="danger" as="span">
                      Kod wygasł.
                    </Text>
                    <Button
                      variant="neutral"
                      size="sm"
                      onClick={phoneStep2Resend}
                      loading={phoneLoading}
                    >
                      Wyślij ponownie
                    </Button>
                  </div>
                )}
              </>
            )}
            {phoneError && (
              <Text variant="caption" color="danger" as="p">
                {phoneError}
              </Text>
            )}
          </div>
        )}
      </Modal>

      {/* ── Email change modal ── */}
      <Modal
        isOpen={emailModalOpen}
        onClose={closeEmailModal}
        title={emailStep === 1 ? 'Zmiana emaila — krok 1 z 2' : 'Zmiana emaila — krok 2 z 2'}
        size="sm"
        footer={
          emailStep === 1 ? (
            <div className={styles.modalFooter}>
              <Button variant="neutral" size="sm" onClick={closeEmailModal}>
                Anuluj
              </Button>
              <Button
                variant="primary"
                size="sm"
                loading={emailLoading}
                disabled={
                  !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNewAddress.trim()) || emailLoading
                }
                onClick={emailSendOtp}
              >
                <IconMail width="12" height="12" />
                Wyślij kod →
              </Button>
            </div>
          ) : (
            <div className={styles.modalFooter}>
              <Button
                variant="neutral"
                size="sm"
                onClick={() => {
                  setEmailStep(1);
                  setEmailError('');
                }}
              >
                ← Wstecz
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={emailCode.length < 6 || emailCountdown <= 0 || emailLoading}
                loading={emailLoading}
                onClick={emailConfirm}
              >
                <IconCheck width="12" height="12" />
                Potwierdź zmianę
              </Button>
            </div>
          )
        }
      >
        {emailStep === 1 && (
          <div className={styles.modalStep}>
            <Text variant="body-sm" as="p" color="muted">
              Podaj nowy adres email. Wyślemy na niego 6-cyfrowy kod weryfikacyjny. Nowy adres
              zastąpi obecny dopiero po potwierdzeniu.
            </Text>
            <Input
              type="email"
              value={emailNewAddress}
              onChange={(e) => setEmailNewAddress(e.target.value)}
              placeholder="nowy@example.pl"
              autoFocus
              disabled={emailLoading}
              onKeyDown={(e) => {
                if (
                  e.key === 'Enter' &&
                  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNewAddress.trim())
                ) {
                  emailSendOtp();
                }
              }}
            />
            {emailError && (
              <Text variant="caption" color="danger" as="p">
                {emailError}
              </Text>
            )}
          </div>
        )}

        {emailStep === 2 && (
          <div className={styles.modalStep}>
            <Text variant="body-sm" as="p" color="muted">
              Wysłaliśmy 6-cyfrowy kod na{' '}
              <Text variant="body-sm" as="span" weight="bold" mono>
                {emailNewAddress.trim()}
              </Text>
              . Sprawdź skrzynkę (i folder spam) i wpisz kod poniżej.
            </Text>
            <div className={styles.modalOtp}>
              <OTPInput
                length={6}
                value={emailCode}
                onChange={setEmailCode}
                autoFocus={emailCountdown > 0}
                disabled={emailCountdown <= 0}
                error={!!emailError}
              />
            </div>
            {emailCountdown > 0 ? (
              <div className={styles.otpTimer}>
                <Text variant="caption" color="muted" as="span">
                  Kod wygaśnie za
                </Text>
                <Text
                  variant="caption"
                  weight="bold"
                  mono
                  as="span"
                  className={styles.otpTimerValue}
                >
                  {formatCountdown(emailCountdown)}
                </Text>
              </div>
            ) : (
              <div className={styles.otpExpired}>
                <Text variant="caption" color="danger" as="span">
                  Kod wygasł.
                </Text>
                <Button variant="neutral" size="sm" onClick={emailResendOtp} loading={emailLoading}>
                  Wyślij ponownie
                </Button>
              </div>
            )}
            {emailError && (
              <Text variant="caption" color="danger" as="p">
                {emailError}
              </Text>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
