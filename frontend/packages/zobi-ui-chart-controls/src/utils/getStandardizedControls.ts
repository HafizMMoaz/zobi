import { makeSingleton, QueryFormData } from '@zobi-ui/core';
import { isStandardizedFormData, StandardizedControls } from '../types';

class StandardizedControlsManager {
  controls: StandardizedControls;

  constructor() {
    this.controls = {
      metrics: [],
      columns: [],
    };
  }

  setStandardizedControls(formData: QueryFormData) {
    if (isStandardizedFormData(formData)) {
      const { controls } = formData.standardizedFormData;
      this.controls = {
        metrics: controls.metrics,
        columns: controls.columns,
      };
    }
  }

  shiftMetric() {
    return this.controls.metrics.shift();
  }

  shiftColumn() {
    return this.controls.columns.shift();
  }

  popAllMetrics() {
    return this.controls.metrics.splice(0, this.controls.metrics.length);
  }

  popAllColumns() {
    return this.controls.columns.splice(0, this.controls.columns.length);
  }

  clear() {
    this.controls = {
      metrics: [],
      columns: [],
    };
  }
}

export const getStandardizedControls = makeSingleton(
  StandardizedControlsManager,
);
