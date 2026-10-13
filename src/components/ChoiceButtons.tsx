export function ChoiceButtons<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: { value: T; label: string }[]; onChange: (value: T) => void }) {
  return <fieldset className="choice-field"><legend>{label}</legend><div className="choice-buttons">{options.map(option => <button type="button" key={option.value} aria-pressed={value === option.value} onClick={() => onChange(option.value)}>{option.label}</button>)}</div></fieldset>
}
