

import { TimeLocaleDefinition } from 'd3-time-format';
import {
  TimeFormatter,
  createSmartDateVerboseFormatter,
} from '@zobi.dev/core';

describe('smartDateVerboseFormatter', () => {
  describe('when locale is default', () => {
    const formatter = createSmartDateVerboseFormatter();

    test('is a function', () => {
      expect(formatter).toBeInstanceOf(TimeFormatter);
    });

    test('shows only year when 1st day of the year', () => {
      expect(formatter(new Date('2020-01-01'))).toBe('2020');
    });

    test('shows month and year when 1st of month', () => {
      expect(formatter(new Date('2020-03-01'))).toBe('Mar 2020');
    });

    test('shows weekday when any day of the month', () => {
      expect(formatter(new Date('2020-03-03'))).toBe('Tue Mar 3');
      expect(formatter(new Date('2020-03-15'))).toBe('Sun Mar 15');
    });
  });
  describe('when locale is not default', () => {
    const locale: TimeLocaleDefinition = {
      dateTime: '%A, %e de %B de %Y. %X',
      date: '%d/%m/%Y',
      time: '%H:%M:%S',
      periods: ['AM', 'PM'],
      days: [
        'Domingo',
        'Segunda',
        'Terça',
        'Quarta',
        'Quinta',
        'Sexta',
        'Sábado',
      ],
      shortDays: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
      months: [
        'Janeiro',
        'Fevereiro',
        'Março',
        'Abril',
        'Maio',
        'Junho',
        'Julho',
        'Agosto',
        'Setembro',
        'Outubro',
        'Novembro',
        'Dezembro',
      ],
      shortMonths: [
        'Jan',
        'Fev',
        'Mar',
        'Abr',
        'Mai',
        'Jun',
        'Jul',
        'Ago',
        'Set',
        'Out',
        'Nov',
        'Dez',
      ],
    };
    const formatter = createSmartDateVerboseFormatter(locale);

    test('is a function', () => {
      expect(formatter).toBeInstanceOf(TimeFormatter);
    });

    test('shows only year when 1st day of the year', () => {
      expect(formatter(new Date('2020-01-01'))).toBe('2020');
    });

    test('shows month and year when 1st of month', () => {
      expect(formatter(new Date('2020-04-01'))).toBe('Abr 2020');
    });

    test('shows weekday when any day of the month', () => {
      expect(formatter(new Date('2020-03-03'))).toBe('Ter Mar 3');
      expect(formatter(new Date('2020-03-15'))).toBe('Dom Mar 15');
    });
  });
});
