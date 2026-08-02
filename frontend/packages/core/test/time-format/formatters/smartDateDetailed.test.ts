import { TimeLocaleDefinition } from 'd3-time-format';
import {
  TimeFormatter,
  createSmartDateDetailedFormatter,
} from '@zobi.dev/core';

describe('smartDateDetailedFormatter', () => {
  describe('when locale is default', () => {
    const formatter = createSmartDateDetailedFormatter();

    test('is a function', () => {
      expect(formatter).toBeInstanceOf(TimeFormatter);
    });

    test('shows only year when 1st day of the year', () => {
      expect(formatter(new Date('2020-01-01T00:00:00.000+00:00'))).toBe('2020');
    });

    test('shows full date when a regular date', () => {
      expect(formatter(new Date('2020-03-01T00:00:00.000+00:00'))).toBe(
        '2020-03-01',
      );
    });

    test('shows full date including time of day without seconds when hour precision', () => {
      expect(formatter(new Date('2020-03-01T13:00:00.000+00:00'))).toBe(
        '2020-03-01 13:00',
      );
    });

    test('shows full date including time of day when minute precision', () => {
      expect(formatter(new Date('2020-03-10T13:10:00.000+00:00'))).toBe(
        '2020-03-10 13:10',
      );
    });

    test('shows full date including time of day when subsecond precision', () => {
      expect(formatter(new Date('2020-03-10T13:10:00.100+00:00'))).toBe(
        '2020-03-10 13:10:00.100',
      );
    });
  });
  describe('when locale is specified', () => {
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
    const formatter = createSmartDateDetailedFormatter(locale);

    test('is a function', () => {
      expect(formatter).toBeInstanceOf(TimeFormatter);
    });

    test('shows only year when 1st day of the year', () => {
      expect(formatter(new Date('2020-01-01T00:00:00.000+00:00'))).toBe('2020');
    });

    test('shows full date when a regular date', () => {
      expect(formatter(new Date('2020-03-01T00:00:00.000+00:00'))).toBe(
        '2020-03-01',
      );
    });

    test('shows full date including time of day without seconds when hour precision', () => {
      expect(formatter(new Date('2020-03-01T13:00:00.000+00:00'))).toBe(
        '2020-03-01 13:00',
      );
    });

    test('shows full date including time of day when minute precision', () => {
      expect(formatter(new Date('2020-03-10T13:10:00.000+00:00'))).toBe(
        '2020-03-10 13:10',
      );
    });

    test('shows full date including time of day when subsecond precision', () => {
      expect(formatter(new Date('2020-03-10T13:10:00.100+00:00'))).toBe(
        '2020-03-10 13:10:00.100',
      );
    });
  });
});
