import React, { useState } from "react";
import { Button, Text, TextInput } from "@mantine/core";

export const component = function MortgageCalculator() {
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
    <div style={{ maxWidth: 400, margin: "auto" }}>
      <Text size="xl" style={{ marginBottom: 20 }}>
        Mortgage Calculator
      </Text>
      <form>
        <TextInput
          label="Loan Amount"
          type="number"
          value={loanAmount}
          onChange={(e) => setLoanAmount(Number(e.currentTarget.value))}
          style={{ marginBottom: 10 }}
        />
        <TextInput
          label="Interest Rate (%)"
          type="number"
          step={0.01}
          value={interestRate}
          onChange={(e) => setInterestRate(Number(e.currentTarget.value))}
          style={{ marginBottom: 10 }}
        />
        <TextInput
          label="Loan Term (years)"
          type="number"
          value={loanTerm}
          onChange={(e) => setLoanTerm(Number(e.currentTarget.value))}
          style={{ marginBottom: 20 }}
        />
        <Button
          variant="outline"
          color="blue"
          onClick={calculateMonthlyPayment}
          fullWidth
        >
          Calculate
        </Button>
      </form>
      <Text size="lg" style={{ marginTop: 20 }}>
        Monthly Payment: ${monthlyPayment.toFixed(2)}
      </Text>
    </div>
  );
};
