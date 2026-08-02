// Placeholder payload data for Path chart stories
export default function payload(_theme: unknown) {
  return {
    data: [
      {
        path: [
          [-122.4194, 37.7749],
          [-122.4094, 37.7849],
          [-122.4294, 37.7649],
        ],
        metric: 100,
      },
    ],
    colnames: ['path', 'metric'],
    coltypes: [0, 0],
  };
}
