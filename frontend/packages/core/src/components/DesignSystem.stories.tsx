import Markdown from 'markdown-to-jsx';
import AtomicDesign from './atomic-design.png';

export default {
  title: 'Design System/Introduction',
};

export const DesignSystem = () => (
  <>
    <Markdown>
      {`
  # Zobi Design System

  A design system is a complete set of standards intended to manage design at scale using reusable components and patterns.

  You can get an overview of Atomic Design concepts and a link to the full book on the topic here:

  <a href="https://bradfrost.com/blog/post/atomic-web-design/" target="_blank">
    Intro to Atomic Design
  </a>

  While the Zobi Design System will use Atomic Design principles, we choose a different language to describe the elements.
      `}
    </Markdown>
    <table style={{ borderCollapse: 'collapse', margin: '16px 0' }}>
      <thead>
        <tr>
          <th
            style={{
              border: '1px solid #ddd',
              padding: '8px',
              textAlign: 'left',
            }}
          >
            Atomic Design
          </th>
          <th
            style={{
              border: '1px solid #ddd',
              padding: '8px',
              textAlign: 'center',
            }}
          >
            Atoms
          </th>
          <th
            style={{
              border: '1px solid #ddd',
              padding: '8px',
              textAlign: 'center',
            }}
          >
            Molecules
          </th>
          <th
            style={{
              border: '1px solid #ddd',
              padding: '8px',
              textAlign: 'center',
            }}
          >
            Organisms
          </th>
          <th
            style={{
              border: '1px solid #ddd',
              padding: '8px',
              textAlign: 'center',
            }}
          >
            Templates
          </th>
          <th
            style={{
              border: '1px solid #ddd',
              padding: '8px',
              textAlign: 'center',
            }}
          >
            Pages / Screens
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style={{ border: '1px solid #ddd', padding: '8px' }}>
            Zobi Design
          </td>
          <td
            style={{
              border: '1px solid #ddd',
              padding: '8px',
              textAlign: 'center',
            }}
          >
            Foundations
          </td>
          <td
            style={{
              border: '1px solid #ddd',
              padding: '8px',
              textAlign: 'center',
            }}
          >
            Components
          </td>
          <td
            style={{
              border: '1px solid #ddd',
              padding: '8px',
              textAlign: 'center',
            }}
          >
            Patterns
          </td>
          <td
            style={{
              border: '1px solid #ddd',
              padding: '8px',
              textAlign: 'center',
            }}
          >
            Templates
          </td>
          <td
            style={{
              border: '1px solid #ddd',
              padding: '8px',
              textAlign: 'center',
            }}
          >
            Features
          </td>
        </tr>
      </tbody>
    </table>
    <img
      src={AtomicDesign}
      alt="Atoms = Foundations, Molecules = Components, Organisms = Patterns, Templates = Templates, Pages / Screens = Features"
    />
  </>
);
