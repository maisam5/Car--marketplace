import { useState, useEffect } from "react";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);

const formatCurrencyDecimal = (value) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);

export default function EMICalculator({ initialPrice = 35000 }) {
  const [carPrice, setCarPrice] = useState(initialPrice);
  const [downPayment, setDownPayment] = useState(Math.round(initialPrice * 0.2));
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [loanTerm, setLoanTerm] = useState(60);
  const [interestRate, setInterestRate] = useState(4.5);
  const [emi, setEmi] = useState(0);
  const [totalPayment, setTotalPayment] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);

  useEffect(() => {
    const principal = carPrice - downPayment;
    const monthlyRate = interestRate / 100 / 12;
    if (monthlyRate === 0) {
      const m = principal / loanTerm;
      setEmi(m);
      setTotalPayment(m * loanTerm + downPayment);
      setTotalInterest(0);
    } else {
      const m =
        (principal * monthlyRate * Math.pow(1 + monthlyRate, loanTerm)) /
        (Math.pow(1 + monthlyRate, loanTerm) - 1);
      setEmi(m);
      setTotalPayment(m * loanTerm + downPayment);
      setTotalInterest(m * loanTerm - principal);
    }
  }, [carPrice, downPayment, loanTerm, interestRate]);

  const handleDownPaymentChange = (val) => {
    const dp = Math.min(Number(val), carPrice);
    setDownPayment(dp);
    setDownPaymentPercent(Math.round((dp / carPrice) * 100));
  };

  const handleDownPaymentPercentChange = (val) => {
    const pct = Math.min(Number(val), 100);
    setDownPaymentPercent(pct);
    setDownPayment(Math.round((pct / 100) * carPrice));
  };

  const loanAmount = carPrice - downPayment;
  const principalPct = loanAmount > 0 ? (loanAmount / (totalPayment - downPayment)) * 100 : 0;
  const interestPct = loanAmount > 0 ? (totalInterest / (totalPayment - downPayment)) * 100 : 0;

  const termOptions = [24, 36, 48, 60, 72, 84];

  return (
    <div style={styles.wrapper}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .emi-slider::-webkit-slider-thumb { appearance: none; width: 20px; height: 20px; border-radius: 50%; background: #E8FF47; cursor: pointer; border: 2px solid #111; box-shadow: 0 0 0 4px #E8FF4720; }
        .emi-slider::-moz-range-thumb { width: 20px; height: 20px; border-radius: 50%; background: #E8FF47; cursor: pointer; border: 2px solid #111; }
        .emi-slider { appearance: none; width: 100%; height: 4px; border-radius: 2px; outline: none; cursor: pointer; }
        .term-btn { background: transparent; border: 1.5px solid #2a2a2a; color: #666; padding: 8px 0; border-radius: 8px; cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500; transition: all 0.15s; }
        .term-btn:hover { border-color: #E8FF47; color: #E8FF47; }
        .term-btn.active { background: #E8FF47; border-color: #E8FF47; color: #111; font-weight: 700; }
        input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }
        @media (max-width: 640px) {
          .emi-body { grid-template-columns: 1fr !important; }
          .emi-inputs { border-right: none !important; border-bottom: 1px solid #1e1e1e !important; }
        }
      `}</style>

      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.badge}>CarHub Finance</div>
          <h2 style={styles.title}>EMI Calculator</h2>
          <p style={styles.subtitle}>Plan your purchase — estimate monthly payments instantly</p>
        </div>

        <div className="emi-body" style={styles.body}>
          {/* Left: Inputs */}
          <div className="emi-inputs" style={styles.inputs}>

            {/* Car Price */}
            <div style={styles.field}>
              <div style={styles.labelRow}>
                <span style={styles.label}>Car Price</span>
                <div style={styles.inputBox}>
                  <span style={styles.currency}>$</span>
                  <input
                    type="number"
                    value={carPrice}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setCarPrice(v);
                      setDownPayment(Math.round((downPaymentPercent / 100) * v));
                    }}
                    style={styles.numInput}
                  />
                </div>
              </div>
              <input
                type="range" className="emi-slider"
                min={5000} max={200000} step={500}
                value={carPrice}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setCarPrice(v);
                  setDownPayment(Math.round((downPaymentPercent / 100) * v));
                }}
                style={{ background: `linear-gradient(to right, #E8FF47 ${((carPrice - 5000) / 195000) * 100}%, #2a2a2a ${((carPrice - 5000) / 195000) * 100}%)` }}
              />
              <div style={styles.rangeLabels}><span>$5K</span><span>$200K</span></div>
            </div>

            {/* Down Payment */}
            <div style={styles.field}>
              <div style={styles.labelRow}>
                <span style={styles.label}>Down Payment</span>
                <div style={{ display: "flex", gap: 8 }}>
                  <div style={styles.inputBox}>
                    <span style={styles.currency}>$</span>
                    <input type="number" value={downPayment} onChange={(e) => handleDownPaymentChange(e.target.value)} style={styles.numInput} />
                  </div>
                  <div style={{ ...styles.inputBox, width: 72 }}>
                    <input type="number" value={downPaymentPercent} onChange={(e) => handleDownPaymentPercentChange(e.target.value)} style={{ ...styles.numInput, width: 34 }} />
                    <span style={styles.currency}>%</span>
                  </div>
                </div>
              </div>
              <input
                type="range" className="emi-slider"
                min={0} max={carPrice} step={500}
                value={downPayment}
                onChange={(e) => handleDownPaymentChange(e.target.value)}
                style={{ background: `linear-gradient(to right, #E8FF47 ${(downPayment / carPrice) * 100}%, #2a2a2a ${(downPayment / carPrice) * 100}%)` }}
              />
              <div style={styles.rangeLabels}><span>$0</span><span>{formatCurrency(carPrice)}</span></div>
            </div>

            {/* Interest Rate */}
            <div style={styles.field}>
              <div style={styles.labelRow}>
                <span style={styles.label}>Interest Rate (APR)</span>
                <div style={styles.inputBox}>
                  <input type="number" value={interestRate} step={0.1} onChange={(e) => setInterestRate(Number(e.target.value))} style={{ ...styles.numInput, width: 44 }} />
                  <span style={styles.currency}>%</span>
                </div>
              </div>
              <input
                type="range" className="emi-slider"
                min={1} max={20} step={0.1}
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                style={{ background: `linear-gradient(to right, #E8FF47 ${((interestRate - 1) / 19) * 100}%, #2a2a2a ${((interestRate - 1) / 19) * 100}%)` }}
              />
              <div style={styles.rangeLabels}><span>1%</span><span>20%</span></div>
            </div>

            {/* Loan Term */}
            <div style={styles.field}>
              <span style={styles.label}>Loan Term (Months)</span>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8, marginTop: 10 }}>
                {termOptions.map((t) => (
                  <button key={t} className={`term-btn ${loanTerm === t ? "active" : ""}`} onClick={() => setLoanTerm(t)}>{t}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Results */}
          <div style={styles.results}>
            {/* EMI */}
            <div style={styles.emiBox}>
              <p style={styles.emiLabel}>Monthly Payment</p>
              <p style={styles.emiValue}>{formatCurrencyDecimal(emi)}</p>
              <p style={styles.emiSub}>for {loanTerm} months at {interestRate}% APR</p>
            </div>

            {/* Donut */}
            <div style={styles.chartWrap}>
              <svg viewBox="0 0 120 120" width="130" height="130">
                <circle cx="60" cy="60" r="48" fill="none" stroke="#1e1e1e" strokeWidth="16" />
                {loanAmount > 0 && (
                  <>
                    <circle
                      cx="60" cy="60" r="48"
                      fill="none" stroke="#E8FF47" strokeWidth="16"
                      strokeDasharray={`${(principalPct / 100) * 301.59} 301.59`}
                      strokeDashoffset="75.4"
                      strokeLinecap="butt"
                    />
                    <circle
                      cx="60" cy="60" r="48"
                      fill="none" stroke="#FF6B35" strokeWidth="16"
                      strokeDasharray={`${(interestPct / 100) * 301.59} 301.59`}
                      strokeDashoffset={`${75.4 - (principalPct / 100) * 301.59}`}
                      strokeLinecap="butt"
                    />
                  </>
                )}
                <text x="60" y="56" textAnchor="middle" fill="#888" fontSize="8" fontFamily="DM Sans">Total Cost</text>
                <text x="60" y="70" textAnchor="middle" fill="#fff" fontSize="10" fontFamily="Syne" fontWeight="700">{formatCurrency(totalPayment)}</text>
              </svg>
            </div>

            {/* Breakdown */}
            <div style={styles.breakdown}>
              {[
                { label: "Loan Amount", value: formatCurrency(loanAmount), color: "#E8FF47" },
                { label: "Total Interest", value: formatCurrency(totalInterest), color: "#FF6B35" },
                { label: "Down Payment", value: formatCurrency(downPayment), color: "#555" },
              ].map((item) => (
                <div key={item.label} style={styles.breakItem}>
                  <div style={{ ...styles.dot, background: item.color }} />
                  <div style={{ flex: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <p style={styles.breakLabel}>{item.label}</p>
                    <p style={styles.breakValue}>{item.value}</p>
                  </div>
                </div>
              ))}
              <div style={{ ...styles.breakItem, borderTop: "1px solid #2a2a2a", paddingTop: 12, marginTop: 4 }}>
                <div style={{ ...styles.dot, background: "#fff" }} />
                <div style={{ flex: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <p style={{ ...styles.breakLabel, color: "#aaa" }}>Total Cost</p>
                  <p style={{ ...styles.breakValue, color: "#fff", fontSize: 15 }}>{formatCurrency(totalPayment)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p style={styles.disclaimer}>* Estimates only. Actual rates depend on credit score, lender terms, and market conditions.</p>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    fontFamily: "'DM Sans', sans-serif",
    background: "#0a0a0a",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px 16px",
  },
  card: {
    background: "#111",
    borderRadius: 24,
    border: "1px solid #1e1e1e",
    maxWidth: 900,
    width: "100%",
    overflow: "hidden",
    boxShadow: "0 40px 80px rgba(0,0,0,0.6)",
  },
  header: {
    padding: "32px 40px 24px",
    borderBottom: "1px solid #1e1e1e",
  },
  badge: {
    display: "inline-block",
    background: "#E8FF4712",
    color: "#E8FF47",
    border: "1px solid #E8FF4728",
    borderRadius: 100,
    padding: "4px 14px",
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    marginBottom: 12,
    fontFamily: "'Syne', sans-serif",
  },
  title: {
    fontFamily: "'Syne', sans-serif",
    fontSize: 30,
    fontWeight: 800,
    color: "#fff",
    letterSpacing: "-0.02em",
  },
  subtitle: {
    color: "#555",
    fontSize: 13,
    marginTop: 4,
  },
  body: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
  },
  inputs: {
    padding: "32px 36px",
    borderRight: "1px solid #1e1e1e",
    display: "flex",
    flexDirection: "column",
    gap: 28,
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  labelRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  label: {
    color: "#666",
    fontSize: 11,
    fontWeight: 500,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  inputBox: {
    display: "flex",
    alignItems: "center",
    background: "#161616",
    border: "1px solid #2a2a2a",
    borderRadius: 8,
    padding: "6px 10px",
    gap: 4,
  },
  currency: {
    color: "#444",
    fontSize: 13,
  },
  numInput: {
    background: "transparent",
    border: "none",
    color: "#fff",
    fontSize: 14,
    fontWeight: 500,
    width: 72,
    outline: "none",
    fontFamily: "'DM Sans', sans-serif",
  },
  rangeLabels: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 11,
    color: "#3a3a3a",
    marginTop: 4,
  },
  results: {
    padding: "32px 36px",
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  emiBox: {
    background: "linear-gradient(135deg, #E8FF4710 0%, #E8FF4705 100%)",
    border: "1px solid #E8FF4720",
    borderRadius: 16,
    padding: "20px 24px",
    textAlign: "center",
  },
  emiLabel: {
    color: "#E8FF47",
    fontSize: 10,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    fontFamily: "'Syne', sans-serif",
  },
  emiValue: {
    fontFamily: "'Syne', sans-serif",
    fontSize: 40,
    fontWeight: 800,
    color: "#fff",
    letterSpacing: "-0.03em",
    marginTop: 6,
  },
  emiSub: {
    color: "#444",
    fontSize: 12,
    marginTop: 4,
  },
  chartWrap: {
    display: "flex",
    justifyContent: "center",
  },
  breakdown: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  breakItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    flexShrink: 0,
  },
  breakLabel: {
    color: "#555",
    fontSize: 12,
  },
  breakValue: {
    color: "#bbb",
    fontSize: 13,
    fontWeight: 600,
    fontFamily: "'Syne', sans-serif",
  },
  disclaimer: {
    padding: "14px 40px",
    borderTop: "1px solid #1a1a1a",
    color: "#333",
    fontSize: 11,
  },
};