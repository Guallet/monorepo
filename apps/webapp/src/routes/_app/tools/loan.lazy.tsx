import { createLazyFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const Route = createLazyFileRoute('/_app/tools/loan')({
  component: () => LoanCalculator(),
});

function LoanCalculator() {
  const [amount, setAmount] = useState(0);
  const [interestRate, setInterestRate] = useState(0);
  const [length, setLength] = useState(0);
  const [totalRepayable, setTotalRepayable] = useState(0);
  const [monthlyPayments, setMonthlyPayments] = useState<number[]>([]);

  const calculateLoan = () => {
    const monthlyInterestRate = interestRate / 1200;
    const numPayments = length;
    const numerator = amount * monthlyInterestRate;
    const denominator = 1 - Math.pow(1 + monthlyInterestRate, -numPayments);
    const monthlyPayment = numerator / denominator;
    const totalRepayable = monthlyPayment * numPayments;
    const monthlyPayments = Array.from({ length: numPayments }, () => {
      return monthlyPayment;
    });

    setTotalRepayable(totalRepayable);
    setMonthlyPayments(monthlyPayments);
  };

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Loan Calculator</h1>

      <div className="space-y-2">
        <label htmlFor="loan-amount" className="text-sm font-medium">
          Amount
        </label>
        <Input
          id="loan-amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="loan-interest-rate" className="text-sm font-medium">
          Interest Rate
        </label>
        <Input
          id="loan-interest-rate"
          type="number"
          value={interestRate}
          onChange={(e) => setInterestRate(Number(e.target.value))}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="loan-length" className="text-sm font-medium">
          Length (in months)
        </label>
        <Input
          id="loan-length"
          type="number"
          value={length}
          onChange={(e) => setLength(Number(e.target.value))}
        />
      </div>

      <Button type="button" onClick={calculateLoan}>
        Calculate
      </Button>

      <div className="space-y-2">
        <h2 className="text-lg font-semibold">
          Total Repayable Amount: {totalRepayable}
        </h2>
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b bg-muted/60 text-left">
                <th className="px-3 py-2">Month</th>
                <th className="px-3 py-2">Payment</th>
              </tr>
            </thead>
            <tbody>
              {monthlyPayments.map((payment, index) => (
                <tr key={index} className="border-b last:border-b-0">
                  <td className="px-3 py-2">{index + 1}</td>
                  <td className="px-3 py-2">{payment}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
