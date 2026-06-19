// Renders a row of filter controls from a config and reports changes upward.
// fields: [{ key, label, type: 'select'|'search', options?: string[] }]
// values: { [key]: value }. onChange(key, value). onReset optional.
export default function FilterBar({ fields, values, onChange, onReset }) {
  return (
    <div className="filterbar">
      {fields.map((f) => (
        <div className="field" key={f.key}>
          <label htmlFor={`flt-${f.key}`}>{f.label}</label>
          {f.type === 'search' ? (
            <input
              id={`flt-${f.key}`}
              type="search"
              placeholder={f.placeholder || 'Search…'}
              value={values[f.key] || ''}
              onChange={(e) => onChange(f.key, e.target.value)}
            />
          ) : (
            <select
              id={`flt-${f.key}`}
              value={values[f.key] || ''}
              onChange={(e) => onChange(f.key, e.target.value)}
            >
              <option value="">{f.allLabel || 'All'}</option>
              {f.options.map((opt) => (
                <option key={String(opt)} value={String(opt)}>
                  {opt}
                </option>
              ))}
            </select>
          )}
        </div>
      ))}
      {onReset && (
        <button type="button" className="btn" onClick={onReset}>
          Reset
        </button>
      )}
    </div>
  )
}
