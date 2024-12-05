export default function Logo() {
  return (
  <div className="p-4 w-72">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 250 60" className="w-full h-auto">
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop
            offset="0%"
            stopColor="#4299E1"
            stopOpacity="1"
          />
          <stop
            offset="100%"
            stopColor="#3182CE"
            stopOpacity="1"
          />
        </linearGradient>
      </defs>

      {/* Stylized checkmark/grade mark */}
      <path
        d="M10 30 L25 45 L45 15"
        fill="none"
        stroke="url(#logoGradient)"
        strokeWidth="6"
        strokeLinecap="round"
      />

      {/* Text "SnapGrade" */}
      <text
        x="55"
        y="40"
        fontFamily="Arial, sans-serif"
        fontSize="30"
        fontWeight="bold"
        fill="url(#logoGradient)"
      >
        SnapGrade
      </text>
    </svg>
  </div>
  );
}