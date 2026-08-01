import { DEFAULT_FORM_DATA } from '../../src/Timeseries/constants';

describe('Timeseries constants', () => {
  describe('DEFAULT_FORM_DATA', () => {
    test('should include xAxisTimeFormat in default form data', () => {
      expect(DEFAULT_FORM_DATA).toHaveProperty('xAxisTimeFormat');
      expect(DEFAULT_FORM_DATA.xAxisTimeFormat).toBe('smart_date');
    });

    test('should include tooltipTimeFormat in default form data', () => {
      expect(DEFAULT_FORM_DATA).toHaveProperty('tooltipTimeFormat');
      expect(DEFAULT_FORM_DATA.tooltipTimeFormat).toBe('smart_date');
    });

    test('should have consistent time format defaults', () => {
      expect(DEFAULT_FORM_DATA.xAxisTimeFormat).toBe(
        DEFAULT_FORM_DATA.tooltipTimeFormat,
      );
    });

    test('should have vertical orientation as default', () => {
      expect(DEFAULT_FORM_DATA.orientation).toBe('vertical');
    });
  });
});
