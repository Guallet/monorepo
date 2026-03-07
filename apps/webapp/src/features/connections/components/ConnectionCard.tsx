import { useLocale } from '@/i18n/useLocale';
import { cn } from '@/lib/utils';
import { useInstitutions, useOpenBankingConnection } from '@guallet/api-react';
import { useTranslation } from 'react-i18next';
import { ConnectionStatusBadge } from './ConnectionStatusBadge';
import { InstitutionAvatar } from './InstitutionAvatar';

interface ConnectionCardProps extends React.HTMLAttributes<HTMLDivElement> {
  connectionId: string;
  onClick?: () => void;
}

export function ConnectionCard({
  connectionId,
  onClick,
  className,
  style,
  ...props
}: Readonly<ConnectionCardProps>) {
  const { t } = useTranslation();
  const { connection } = useOpenBankingConnection(connectionId);
  const { institutions } = useInstitutions();
  const { locale } = useLocale();

  const institution = institutions.find(
    (inst) => inst.nordigen_id === connection?.institution_id,
  );

  const formattedDate = new Date(connection?.created ?? '').toLocaleDateString(
    locale,
    {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    },
  );

  const content = (
    <div className="space-y-2 text-left">
      {connection && institution ? (
        <>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <InstitutionAvatar institutionId={institution.id} />
              <p className="font-semibold">{institution.name}</p>
            </div>

            <ConnectionStatusBadge
              status={
                connection.status ||
                t('components.connectionCard.status.unknown', 'unknown')
              }
            />
          </div>

          <p className="text-sm text-muted-foreground">
            {t('components.connectionCard.created', 'Created:')} {formattedDate}
          </p>
          <p className="text-sm text-muted-foreground">
            {t('components.connectionCard.updated', 'Updated:')}{' '}
            {connection.updated_at}
          </p>
          <p className="text-sm">
            {connection.accounts.length > 0
              ? t('components.connectionCard.accountsLinked', {
                  count: connection.accounts.length,
                })
              : t(
                  'components.connectionCard.noAccountsLinked',
                  'No accounts linked',
                )}
          </p>
        </>
      ) : null}
    </div>
  );

  if (onClick) {
    return (
      <button
        type="button"
        className={cn(
          'w-full rounded-xl border bg-card p-4 shadow-sm transition-colors hover:bg-accent/40',
          className,
        )}
        {...props}
        onClick={onClick}
        style={style}
      >
        {content}
      </button>
    );
  }

  return (
    <div
      className={cn('rounded-xl border bg-card p-4 shadow-sm', className)}
      {...props}
      style={style}
    >
      {content}
    </div>
  );
}
