import NumberTransformService from 'plugins/service/numberTransform'

// Tests
describe('NumberFormatter', () => {
  test('Formata um inteiro corretamente', () => {
    expect(NumberTransformService.formatNumber('12.34', 'inteiro', 0, null)).toEqual('12');
  })

  test('Formata um inteiro a partir de um float com aproximação para cima', () => {
    expect(NumberTransformService.formatNumber('12.89', 'inteiro')).toEqual('13');
  })

  test('Formata um real corretamente', () => {
    const result = NumberTransformService.constructor.formatNumber('12.34', 'real');
    expect(result.localeCompare('12,34', 'pt-br')).toBeTruthy();
  })

  test('Formata um real com precisão definida corretamente', () => {
    const result = NumberTransformService.constructor.formatNumber('12.345678', 'real', 3);
    expect(result.localeCompare('12,346', 'pt-br')).toBeTruthy();
  })

  test('Formata um percentual corretamente', () => {
    const result = NumberTransformService.constructor.formatNumber('12.34', 'porcentagem');
    expect(result.localeCompare('12,34%', 'pt-br')).toBeTruthy();
  })

  test('Formata um percentual com precisão definida corretamente', () => {
    const result = NumberTransformService.constructor.formatNumber('12.345678', 'porcentagem', 3);
    expect(result.localeCompare('12,346%', 'pt-br')).toBeTruthy();
  })

  test('Formata um percentual com multiplicador corretamente', () => {
    const result = NumberTransformService.constructor.formatNumber('0.1234', 'porcentagem', null, 100);
    expect(result.localeCompare('12,34%', 'pt-br')).toBeTruthy();
  })

  test('Formata um percentual com multiplicador e precisão definidos corretamente', () => {
    const result = NumberTransformService.constructor.formatNumber('0.12345678', 'porcentagem', 3, 100);
    expect(result.localeCompare('12,346%', 'pt-br')).toBeTruthy();
  })

  test('Formata um monetário corretamente', () => {
    const result = NumberTransformService.constructor.formatNumber('12345.678', 'monetario');
    expect(result.localeCompare('R$ 12.345', 'pt-br')).toBeTruthy();
  })

  test('Formata um monetário com precisão definida corretamente', () => {
    const result = NumberTransformService.constructor.formatNumber('12345.678', 'monetario', 2);
    expect(result.localeCompare('R$ 12.345,68', 'pt-br')).toBeTruthy();
  })

  test('Formatação padrão', () => {
    const result = NumberTransformService.constructor.formatNumber('12345.678');
    expect(result.localeCompare('12.345,678', 'pt-br')).toBeTruthy();
  })

  test('Texto padrão quando valor é nule deve ser apenas "-"', () => {
    const result = NumberTransformService.constructor.formatNumber(null);
    expect(result).toEqual('-');
  })

  test('Formata um número com collapse', () => {
    const result = NumberTransformService.constructor.formatNumber('12345.678', 'real', 2);
    expect(result.localeCompare('12.345,69', 'pt-br')).toBeTruthy();
  })

  test('Formata um número com collapse (mil)', () => {
    const result = NumberTransformService.constructor.formatNumber('12345.678', 'real', 2, 1, false);
    expect(result.localeCompare('12,4<span>mil</span>', 'pt-br')).toBeTruthy();
  })

  test('Formata um número com collapse (milhão)', () => {
    const result = NumberTransformService.constructor.formatNumber('12345678.901', 'real', 2, 1, false);
    expect(result.localeCompare('12,4<span>mi</span>', 'pt-br')).toBeTruthy();
  })

  test('Formata um número com collapse (bilhão)', () => {
    const result = NumberTransformService.constructor.formatNumber('12345678901.234', 'real', 2, 1, false);
    expect(result.localeCompare('12,4<span>bi</span>', 'pt-br')).toBeTruthy();
  })

  test('Formata um número com collapse (trilhão)', () => {
    const result = NumberTransformService.constructor.formatNumber('12345678901234.567', 'real', 2, 1, false);
    expect(result.localeCompare('12,4<span>tri</span>', 'pt-br')).toBeTruthy();
  })
})