import { zobiTheme } from '@zobi.dev/extension-api/theme';

const colorTypes = ['primary', 'error', 'warning', 'success', 'info'];

const AntDFunctionalColors = () => {
  // Define color types and variants dynamically
  const variants = [
    'active',
    'textActive',
    'text',
    'textHover',
    'hover',
    'borderHover',
    'border',
    'bgHover',
    'bg',
  ];

  return (
    <table
      style={{ borderCollapse: 'collapse', width: '100%', textAlign: 'left' }}
    >
      <thead>
        <tr>
          <th style={{ border: '1px solid #ddd', padding: '8px' }}>Type</th>
          {variants.map(variant => (
            <th
              key={variant}
              style={{ border: '1px solid #ddd', padding: '8px' }}
            >
              {variant}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {colorTypes.map(type => (
          <tr key={type}>
            <td style={{ border: '1px solid #ddd', padding: '8px' }}>
              <strong>{type}</strong>
            </td>
            {variants.map(variant => {
              // Map to actual theme token names
              const tokenName = `color${type.charAt(0).toUpperCase() + type.slice(1)}${variant.charAt(0).toUpperCase() + variant.slice(1)}`;
              const color = (zobiTheme as any)[tokenName];
              return (
                <td
                  key={variant}
                  style={{
                    border: '1px solid #ddd',
                    padding: '8px',
                    backgroundColor: color || 'transparent',
                    color: color === 'transparent' ? 'black' : undefined,
                  }}
                >
                  {color ? <code>{color}</code> : '-'}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export const ThemeColors = () => (
  <div>
    <h1>Theme Colors</h1>
    <h2>Ant Design Theme Colors</h2>
    <h3>Functional Colors</h3>
    <AntDFunctionalColors />
    <h2>Current ZobiTheme Object</h2>
    <p>The current theme uses Ant Design's flat token structure:</p>
    <pre>
      <code>{JSON.stringify(zobiTheme, null, 2)}</code>
    </pre>
  </div>
);
/*
 * */
export default {
  title: 'Core Packages/@zobi.dev-theme',
};

export const Default = () => <ThemeColors />;
