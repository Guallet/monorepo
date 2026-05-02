import { AccountTypeDto, CreateAccountRequest, ObInstitutionDto } from '@guallet/api-client';
import { useAccountMutations, useConnectionMutations } from '@guallet/api-react';
import { Box } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { zod4Resolver } from 'mantine-form-zod-resolver';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDefaultCurrency } from '@/hooks/useDefaultCurrency';
import {
  accountFormDataSchema,
  AddAccountFormData,
  getAccountProperties,
} from '../../screens/addAccountFormSchema';
import { StepChooseMethod } from './StepChooseMethod';
import { StepManualDetails } from './StepManualDetails';
import { StepManualSuccess } from './StepManualSuccess';
import { StepManualType } from './StepManualType';
import { StepOBBank } from './StepOBBank';
import { StepOBCountry } from './StepOBCountry';
import { StepOBRedirect } from './StepOBRedirect';

type WizardStep =
  | 'method'
  | 'm-type'
  | 'm-details'
  | 'm-success'
  | 'ob-country'
  | 'ob-bank'
  | 'ob-redirect';

interface AddAccountWizardProps {
  onDone: () => void;
}

export function AddAccountWizard({ onDone }: Readonly<AddAccountWizardProps>) {
  const { t } = useTranslation();
  const defaultCurrency = useDefaultCurrency();
  const [step, setStep] = useState<WizardStep>('method');
  const [createdAccountId, setCreatedAccountId] = useState<string | null>(null);

  const form = useForm<AddAccountFormData>({
    validate: zod4Resolver(accountFormDataSchema),
    initialValues: {
      name: '',
      account_type: AccountTypeDto.CURRENT_ACCOUNT,
      currency: defaultCurrency,
      balance: 0,
      createInitialTransaction: true,
      currentAccountNumber: '',
      currentSortCode: '',
      currentOverdraftLimit: null,
      creditCardAccountNumber: '',
      creditCardInterestRate: null,
      creditCardCreditLimit: null,
      creditCardCycleDay: null,
      savingsInterestRate: null,
      mortgagePropertyValue: null,
      mortgageAmount: null,
      mortgageInterestRate: null,
      mortgageTermLength: null,
      loanAmount: null,
      loanInterestRate: null,
      loanTermLength: null,
    },
  });

  const [obCountry, setObCountry] = useState('GB');
  const [obInstitution, setObInstitution] = useState<ObInstitutionDto | null>(null);

  const { createAccountMutation } = useAccountMutations();
  const { createConnectionMutation } = useConnectionMutations();

  function resetAndRestart() {
    setStep('method');
    setCreatedAccountId(null);
    form.reset();
    setObCountry('GB');
    setObInstitution(null);
  }

  async function handleSaveAccount() {
    const currency = form.values.currency;
    if (!currency) {
      notifications.show({
        title: t('feature.accounts.add.errors.currencyRequired.title', 'Currency required'),
        message: t(
          'feature.accounts.add.errors.currencyRequired.message',
          'Please select a currency for the account.',
        ),
        color: 'red',
      });
      return;
    }

    const request: CreateAccountRequest = {
      name: form.values.name,
      type: form.values.account_type,
      currency,
      initial_balance: form.values.balance,
      create_balance_transaction: form.values.createInitialTransaction,
      institution_id: form.values.institution_id ?? undefined,
      properties: getAccountProperties(form.values),
    };

    try {
      const newAccount = await createAccountMutation.mutateAsync({ request });
      setCreatedAccountId(newAccount.id);
      notifications.show({
        message: t(
          'feature.accounts.add.notifications.success',
          '{{name}} created successfully.',
          { name: newAccount.name },
        ),
        color: 'green',
      });
      setStep('m-success');
    } catch {
      notifications.show({
        title: t('feature.accounts.add.notifications.error.title', 'Could not create account'),
        message: t(
          'feature.accounts.add.notifications.error.message',
          'A network or server error occurred. Please try again.',
        ),
        color: 'red',
      });
    }
  }

  function handleConnectBank() {
    if (!obInstitution) return;
    createConnectionMutation.mutate(
      {
        request: {
          institution_id: obInstitution.id,
          redirect_to: `${window.location.origin}/connections/connect/callback`,
        },
      },
      {
        onSuccess: (data) => {
          window.open(data.link, '_self');
        },
        onError: () => {
          notifications.show({
            title: t('feature.accounts.add.obRedirect.error.title', 'Connection failed'),
            message: t(
              'feature.accounts.add.obRedirect.error.message',
              'Could not start the bank connection. Please try again.',
            ),
            color: 'red',
          });
        },
      },
    );
  }

  return (
    <Box maw={560} mx="auto">
      {step === 'method' && (
        <StepChooseMethod
          onChoose={(method) => setStep(method === 'ob' ? 'ob-country' : 'm-type')}
        />
      )}
      {step === 'm-type' && (
        <StepManualType
          value={form.values.account_type}
          onChange={(type) => form.setFieldValue('account_type', type)}
          onNext={() => setStep('m-details')}
          onBack={() => setStep('method')}
        />
      )}
      {step === 'm-details' && (
        <StepManualDetails
          form={form}
          onNext={handleSaveAccount}
          onBack={() => setStep('m-type')}
        />
      )}
      {step === 'm-success' && (
        <StepManualSuccess
          form={form}
          accountId={createdAccountId}
          onDone={onDone}
          onAddAnother={resetAndRestart}
        />
      )}
      {step === 'ob-country' && (
        <StepOBCountry
          value={obCountry}
          onChange={setObCountry}
          onNext={() => setStep('ob-bank')}
          onBack={() => setStep('method')}
        />
      )}
      {step === 'ob-bank' && (
        <StepOBBank
          countryCode={obCountry}
          value={obInstitution}
          onChange={setObInstitution}
          onNext={() => setStep('ob-redirect')}
          onBack={() => setStep('ob-country')}
        />
      )}
      {step === 'ob-redirect' && obInstitution && (
        <StepOBRedirect
          institution={obInstitution}
          onInitiate={handleConnectBank}
          isLoading={createConnectionMutation.isPending}
        />
      )}
    </Box>
  );
}
