import { useState } from 'react';
import { createLazyFileRoute } from "@tanstack/react-router";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const Route = createLazyFileRoute("/_app/tools/mortgage")({
  component: () => MortgageCalculator(),
});

function MortgageCalculator() {
  const [loanAmount, setLoanAmount] = useState<number>(200000);
  const [interestRate, setInterestRate] = useState<number>(5.0);
  const [loanTerm, setLoanTerm] = useState<number>(25);
  const [monthlyPayment, setMonthlyPayment] = useState<number>(0);

  const calculateMonthlyPayment = () => {
    const monthlyInterestRate = interestRate / 1200; // convert annual interest rate to monthly
    const numPayments = loanTerm * 12; // convert loan term from years to months
    const numerator = loanAmount * monthlyInterestRate;
    const denominator = 1 - Math.pow(1 + monthlyInterestRate, -numPayments);
    const payment = numerator / denominator;
    setMonthlyPayment(payment);
  };

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-4">
      <h1 className="text-2xl font-semibold">
        Mortgage Calculator
      </h1>
      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div className="space-y-2">
          <label htmlFor="mortgage-loan-amount" className="text-sm font-medium">
            Loan Amount
          </label>
          <Input
            id="mortgage-loan-amount"
            type="number"
            value={loanAmount}
            onChange={(e) => setLoanAmount(Number(e.currentTarget.value))}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="mortgage-interest-rate" className="text-sm font-medium">
            Interest Rate (%)
          </label>
          <Input
            id="mortgage-interest-rate"
            type="number"
            step={0.01}
            value={interestRate}
            onChange={(e) => setInterestRate(Number(e.currentTarget.value))}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="mortgage-loan-term" className="text-sm font-medium">
            Loan Term (years)
          </label>
          <Input
            id="mortgage-loan-term"
          type="number"
          value={loanTerm}
          onChange={(e) => setLoanTerm(Number(e.currentTarget.value))}
          />
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={calculateMonthlyPayment}
          className="w-full"
        >
          Calculate
        </Button>
      </form>
      <p className="text-lg font-medium">
        Monthly Payment: ${monthlyPayment.toFixed(2)}
      </p>
    </div>
  );
}
