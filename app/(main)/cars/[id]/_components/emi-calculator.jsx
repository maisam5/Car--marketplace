"use client";
import React, { useState, useMemo } from "react";

const EmiCalculator = () => {
  const [price, setPrice] = useState(25000);
  const [downPayment, setDownPayment] = useState(3000);
  const [interestRate, setInterestRate] = useState(6);
  const [loanTerm, setLoanTerm] = useState(5);

  const loanAmount = useMemo(() => {
    return Math.max(price - downPayment, 0);
  }, [price, downPayment]);

  const emi = useMemo(() => {
    const monthlyRate = interestRate / 100 / 12;
    const months = loanTerm * 12;

    if (monthlyRate === 0) return loanAmount / months;

    return (
      (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, months)) /
      (Math.pow(1 + monthlyRate, months) - 1)
    );
  }, [loanAmount, interestRate, loanTerm]);

  const totalPayment = emi * loanTerm * 12;
  const totalInterest = totalPayment - loanAmount;

  return (
    <div className="w-full max-w-lg mx-auto">

      <div className="bg-white rounded-2xl shadow-lg flex flex-col max-h-[80vh]">

        {/* Header */}
        <div className="p-5 border-b">
          <h2 className="text-xl font-bold text-center">
            🚗 CarhHub EMI Calculator
          </h2>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-5 space-y-6">

          <Slider label="Car Price" value={`$${price.toLocaleString()}`}>
            <input
              type="range"
              min="5000"
              max="100000"
              step="500"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="w-full accent-black"
            />
          </Slider>

          <Slider label="Down Payment" value={`$${downPayment.toLocaleString()}`}>
            <input
              type="range"
              min="0"
              max={price}
              step="500"
              value={downPayment}
              onChange={(e) => setDownPayment(Number(e.target.value))}
              className="w-full accent-black"
            />
          </Slider>

          <Slider label="Interest Rate" value={`${interestRate}%`}>
            <input
              type="range"
              min="0"
              max="15"
              step="0.1"
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="w-full accent-black"
            />
          </Slider>

          <Slider label="Loan Term" value={`${loanTerm} Years`}>
            <input
              type="range"
              min="1"
              max="8"
              step="1"
              value={loanTerm}
              onChange={(e) => setLoanTerm(Number(e.target.value))}
              className="w-full accent-black"
            />
          </Slider>

          {/* Results */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <Result label="Loan Amount" value={`$${loanAmount.toLocaleString()}`} />

            <div className="flex justify-between text-lg font-semibold">
              <span>Monthly EMI</span>
              <span className="text-green-600">
                ${emi ? emi.toFixed(2) : "0.00"}
              </span>
            </div>

            <Result label="Total Interest" value={`$${totalInterest.toFixed(2)}`} />
            <Result label="Total Payment" value={`$${totalPayment.toFixed(2)}`} />
          </div>

        </div>
      </div>
    </div>
  );
};

const Slider = ({ label, value, children }) => (
  <div>
    <div className="flex justify-between mb-2 font-medium">
      <span>{label}</span>
      <span className="text-gray-600">{value}</span>
    </div>
    {children}
  </div>
);

const Result = ({ label, value }) => (
  <div className="flex justify-between text-sm">
    <span>{label}</span>
    <span className="font-medium">{value}</span>
  </div>
);

export default EmiCalculator;