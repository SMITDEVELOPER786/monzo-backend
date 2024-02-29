function Input({ label, type, value, onChange }) {
    return (
      <div className="mb-4">
        <label htmlFor={label} className="text-sm font-medium text-gray-700">{label}</label>
        <input
          type={type}
          id={label}
          className="rounded-md border px-3 py-2 text-gray-700 focus:border-blue-500 focus:text-blue-500"
          value={value}
          onChange={onChange}
        />
      </div>
    );
  }