// Payload data for Polygon chart stories - World regions (simple coordinate format)
// Uses direct coordinate arrays for line_type: 'json'
export default {
  data: [
    {
      contour: [
        [-10, 35],
        [40, 35],
        [40, 70],
        [-10, 70],
        [-10, 35],
      ],
      count: 750000000,
    },
    {
      contour: [
        [-130, 25],
        [-60, 25],
        [-60, 50],
        [-130, 50],
        [-130, 25],
      ],
      count: 370000000,
    },
    {
      contour: [
        [60, 5],
        [150, 5],
        [150, 55],
        [60, 55],
        [60, 5],
      ],
      count: 4700000000,
    },
    {
      contour: [
        [-20, -35],
        [55, -35],
        [55, 35],
        [-20, 35],
        [-20, -35],
      ],
      count: 1400000000,
    },
    {
      contour: [
        [-80, -55],
        [-35, -55],
        [-35, 10],
        [-80, 10],
        [-80, -55],
      ],
      count: 430000000,
    },
  ],
  colnames: ['contour', 'count'],
  coltypes: [0, 0],
};
