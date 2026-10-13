import { normalizeUsername } from '../lib/validation'

export function HandleInput({ value, onChange, id = 'x-handle' }: { value: string; onChange: (value: string) => void; id?: string }) {
  return <div className="handle-input"><span aria-hidden="true">@</span><input id={id} value={value} onChange={event => onChange(normalizeUsername(event.target.value))} placeholder="daomintam" autoCapitalize="none" autoCorrect="off" spellCheck={false} maxLength={16} required aria-label="X handle" /></div>
}
