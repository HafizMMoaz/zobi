

/* eslint react/prop-types: 'off' */
import './color-styles.css';

interface Palette {
  colors: string[];
  id: string;
  label: string;
}

interface RenderPalettesProps {
  title?: string;
  palettes: Palette[];
}

export default function RenderPalettes({
  title,
  palettes,
}: RenderPalettesProps) {
  return (
    <div>
      {title && <h2>{title}</h2>}
      <table>
        <tbody>
          {palettes.map(({ colors, id, label }) => (
            <tr key={id}>
              <td className="palette-label">
                <strong>{label}</strong>
              </td>
              <td>
                <div className="palette-container">
                  {colors.map((color, i) => (
                    <div
                      key={color}
                      className="palette-item"
                      style={{
                        backgroundColor: color,
                        marginRight: i === colors.length - 1 ? 0 : 2,
                      }}
                    />
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
