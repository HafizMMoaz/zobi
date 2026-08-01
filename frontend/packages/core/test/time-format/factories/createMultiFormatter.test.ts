

import { createMultiFormatter } from '@zobi.dev/core';
import { TimeLocaleDefinition } from 'd3-time-format';

describe('createMultiFormatter()', () => {
  describe('creates a multi-step formatter', () => {
    describe('when locale is undefined', () => {
      describe('and use local time is false', () => {
        const formatter = createMultiFormatter({
          id: 'my_format',
          useLocalTime: false,
        });
        test('formats millisecond', () => {
          expect(formatter(new Date(2018, 10, 20, 11, 22, 33, 100))).toEqual(
            '.100',
          );
        });
        test('formats second', () => {
          expect(formatter(new Date(2018, 10, 20, 11, 22, 33))).toEqual(':33');
        });
        test('format minutes', () => {
          expect(formatter(new Date(2018, 10, 20, 11, 22))).toEqual('04:22');
        });
        test('format hours', () => {
          expect(formatter(new Date('2018-11-18 11:00 UTC'))).toEqual('11 AM');
        });
        test('format first day of week', () => {
          expect(formatter(new Date('2018-11-18 UTC'))).toEqual('Nov 18');
        });
        test('format other day of week', () => {
          expect(formatter(new Date('2018-11-20 UTC'))).toEqual('Tue 20');
        });
        test('format month', () => {
          expect(formatter(new Date('2018-11-1 UTC'))).toEqual('November');
        });
        test('format year', () => {
          expect(formatter(new Date('2018-1-1 UTC'))).toEqual('2018');
        });
      });
      describe('and use local time is true', () => {
        const formatter = createMultiFormatter({
          id: 'my_format',
          useLocalTime: true,
        });
        test('formats millisecond', () => {
          expect(formatter(new Date(2018, 10, 20, 11, 22, 33, 100))).toEqual(
            '.100',
          );
        });
        test('formats second', () => {
          expect(formatter(new Date(2018, 10, 20, 11, 22, 33))).toEqual(':33');
        });
        test('format minutes', () => {
          expect(formatter(new Date(2018, 10, 20, 11, 22))).toEqual('11:22');
        });
        test('format hours', () => {
          expect(formatter(new Date(2018, 10, 20, 11))).toEqual('11 AM');
        });
        test('format first day of week', () => {
          expect(formatter(new Date(2018, 10, 18))).toEqual('Nov 18');
        });
        test('format other day of week', () => {
          expect(formatter(new Date(2018, 10, 20))).toEqual('Tue 20');
        });
        test('format month', () => {
          expect(formatter(new Date(2018, 10))).toEqual('November');
        });
        test('format year', () => {
          expect(formatter(new Date(2018, 0))).toEqual('2018');
        });
      });
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
    describe('and use local time is false', () => {
      const formatter = createMultiFormatter({
        id: 'my_format',
        useLocalTime: false,
        locale,
      });
      test('formats millisecond', () => {
        expect(formatter(new Date(2018, 10, 20, 11, 22, 33, 100))).toEqual(
          '.100',
        );
      });
      test('formats second', () => {
        expect(formatter(new Date(2018, 10, 20, 11, 22, 33))).toEqual(':33');
      });
      test('format minutes', () => {
        expect(formatter(new Date(2018, 10, 20, 11, 22))).toEqual('04:22');
      });
      test('format hours', () => {
        expect(formatter(new Date('2018-11-18 11:00 UTC'))).toEqual('11 AM');
      });
      test('format first day of week', () => {
        expect(formatter(new Date('2018-11-18 UTC'))).toEqual('Nov 18');
      });
      test('format other day of week', () => {
        expect(formatter(new Date('2018-11-20 UTC'))).toEqual('Ter 20');
      });
      test('format month', () => {
        expect(formatter(new Date('2018-11-1 UTC'))).toEqual('Novembro');
      });
      test('format year', () => {
        expect(formatter(new Date('2018-1-1 UTC'))).toEqual('2018');
      });
    });
    describe('and use local time is true', () => {
      const formatter = createMultiFormatter({
        id: 'my_format',
        useLocalTime: true,
        locale,
      });
      test('formats millisecond', () => {
        expect(formatter(new Date(2018, 10, 20, 11, 22, 33, 100))).toEqual(
          '.100',
        );
      });
      test('formats second', () => {
        expect(formatter(new Date(2018, 10, 20, 11, 22, 33))).toEqual(':33');
      });
      test('format minutes', () => {
        expect(formatter(new Date(2018, 10, 20, 11, 22))).toEqual('11:22');
      });
      test('format hours', () => {
        expect(formatter(new Date(2018, 10, 20, 11))).toEqual('11 AM');
      });
      test('format first day of week', () => {
        expect(formatter(new Date(2018, 10, 18))).toEqual('Nov 18');
      });
      test('format other day of week', () => {
        expect(formatter(new Date(2018, 10, 20))).toEqual('Ter 20');
      });
      test('format month', () => {
        expect(formatter(new Date(2018, 10))).toEqual('Novembro');
      });
      test('format year', () => {
        expect(formatter(new Date(2018, 0))).toEqual('2018');
      });
    });
  });
});
