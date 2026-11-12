/** Labelled <select>, reused by the filters, the sort control and the add form. */
export default function SelectField({ id, label, value, onChange, options, name, onBlur, disabled }) {
  return (
    <div className="field">
      <label htmlFor={id} className="field__label">
        {label}
      </label>
      <select id={id} name={name} className="input" value={value} onChange={onChange} onBlur={onBlur} disabled={disabled}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
