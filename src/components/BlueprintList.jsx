export default function BlueprintList({ items = [], onSelect }) {
  if (!items.length) return <p>No hay resultados.</p>
  return (
    <div style={{ overflowY: 'auto'}}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #334155' }}>
              Blueprint Name
            </th>
            <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #334155' }}>
              Number of Points
            </th>
            <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #334155' }}>
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((bp) =>(
            <tr key={bp.name}>
              <td style={{ padding: '8px', borderBottom: '1px solid #1f2937' }}>{bp.name}</td>
              <td style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid #1f2937' }}>
                {bp.points.length || 0}
              </td>
              <td style={{ padding: '8px', borderBottom: '1px solid #1f2937' }}>
                <button className="btn" onClick={() => onSelect(bp)}>
                  Open
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
