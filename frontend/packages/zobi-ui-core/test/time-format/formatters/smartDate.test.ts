

import { TimeLocaleDefinition } from 'd3-time-format';
import { TimeFormatter, createSmartDateFormatter } from '@zobi-ui/core';

describe('createSmartDateFormatter', () => {
  describe('when locale is default', () => {
    const smartDateFormatter = createSmartDateFormatter();

    test('is a function', () => {
      expect(smartDateFormatter).toBeInstanceOf(TimeFormatter);
    });

    test('shows only year when 1st day of the year', () => {
      expect(smartDateFormatter(new Date('2020-01-01'))).toBe('2020');
    });

    test('shows only month when 1st of month', () => {
      expect(smartDateFormatter(new Date('2020-03-01'))).toBe('March');
    });

    test('does not show day of week when it is Sunday', () => {
      expect(smartDateFormatter(new Date('2020-03-15'))).toBe('Mar 15');
    });

    test('shows weekday when it is not Sunday (and no ms/sec/min/hr)', () => {
      expect(smartDateFormatter(new Date('2020-03-03'))).toBe('Tue 03');
    });
  });
  describe('when different locale is not default', () => {
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
    const smartDateFormatter = createSmartDateFormatter(locale);

    test('is a function', () => {
      expect(smartDateFormatter).toBeInstanceOf(TimeFormatter);
    });

    test('shows only year when 1st day of the year', () => {
      expect(smartDateFormatter(new Date('2020-01-01'))).toBe('2020');
    });

    test('shows only month when 1st of month', () => {
      expect(smartDateFormatter(new Date('2020-03-01'))).toBe('Março');
    });

    test('does not show day of week when it is Sunday', () => {
      expect(smartDateFormatter(new Date('2023-10-15'))).toBe('Out 15');
    });

    test('shows weekday when it is not Sunday (and no ms/sec/min/hr)', () => {
      expect(smartDateFormatter(new Date('2020-03-03'))).toBe('Ter 03');
    });
  });
});
