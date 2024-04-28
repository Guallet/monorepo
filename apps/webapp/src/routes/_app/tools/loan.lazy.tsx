import { createLazyFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button, Input, Stack, Table } from "@mantine/core";

export const Route = createLazyFileRoute("/_app/tools/loan")({
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
    const monthlyPayments = Array.from({ length: numPayments }, (_, index) => {
      return monthlyPayment;
    });

    setTotalRepayable(totalRepayable);
    setMonthlyPayments(monthlyPayments);
  };

  return (
    <Stack>
      <h1>Loan Calculator</h1>
      <div>
        <label>Amount:</label>
        <Input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
        />
      </div>
      <div>
        <label>Interest Rate:</label>
        <Input
          type="number"
          value={interestRate}
          onChange={(e) => setInterestRate(Number(e.target.value))}
        />
      </div>
      <div>
        <label>Length (in months):</label>
        <Input
          type="number"
          value={length}
          onChange={(e) => setLength(Number(e.target.value))}
        />
      </div>
      <Button onClick={calculateLoan}>Calculate</Button>
      <div>
        <h2>Total Repayable Amount: {totalRepayable}</h2>
        <Table>
          <thead>
            <tr>
              <th>Month</th>
              <th>Payment</th>
            </tr>
          </thead>
          <tbody>
            {monthlyPayments.map((payment, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{payment}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </Stack>
  );
}
