import {
  shortenStringMiddle,
  percentageToFactor,
  factorToPercentage,
  toSemVer,
  UNKNOWN_VERSION,
  formatSats,
  formatBtc,
  formatBtcDisplayValue,
  calcOfferMinsizeMax,
} from './utils'

describe('shortenStringMiddle', () => {
  it('should shorten string in the middle', () => {
    expect(shortenStringMiddle('0')).toBe('0')
    expect(shortenStringMiddle('01')).toBe('01')
    expect(shortenStringMiddle('01', -1)).toBe('01')
    expect(shortenStringMiddle('01', 0)).toBe('01')
    expect(shortenStringMiddle('01', 1)).toBe('01')
    expect(shortenStringMiddle('01', 2)).toBe('01')
    expect(shortenStringMiddle('0123456789abcdef', 2)).toBe('0…f')
    expect(shortenStringMiddle('0123456789abcdef', 8)).toBe('0123…cdef')
    expect(shortenStringMiddle('0123456789abcdef', 8, '...')).toBe('0123...cdef')
    expect(shortenStringMiddle('0123456789abcdef', 14)).toBe('0123456…9abcdef')
    expect(shortenStringMiddle('0123456789abcdef', 15)).toBe('0123456…9abcdef')
    expect(shortenStringMiddle('0123456789abcdef', 16)).toBe('0123456789abcdef')
    expect(shortenStringMiddle('0123456789abcdef', 32)).toBe('0123456789abcdef')
  })
})

describe('factorToPercentage/percentageToFactor', () => {
  describe('factorToPercentage', () => {
    it('should turn factor to percentage', () => {
      expect(factorToPercentage(NaN)).toBe(NaN)
      expect(factorToPercentage(-1)).toBe(-100)
      expect(factorToPercentage(0)).toBe(0)
      expect(factorToPercentage(0.0027)).toBe(0.27)
      expect(factorToPercentage(0.0027, 1)).toBe(0.3)
      expect(factorToPercentage(0.0027, 0)).toBe(0)
      expect(factorToPercentage(1 / 3, 3)).toBe(33.333)
      expect(factorToPercentage(1 / 3, 8)).toBe(33.33333333)
      expect(factorToPercentage(2 / 3, 10)).toBe(66.6666666667)
      expect(factorToPercentage(0.7)).toBe(70)
      expect(factorToPercentage(1)).toBe(100)
    })
  })

  describe('percentageToFactor', () => {
    it('should turn percentage to factor', () => {
      expect(percentageToFactor(NaN)).toBe(NaN)
      expect(percentageToFactor(-1)).toBe(-0.01)
      expect(percentageToFactor(0)).toBe(0)
      expect(percentageToFactor(0.0027)).toBe(0.000027)
      expect(percentageToFactor(0.0027, 5)).toBe(0.00003)
      expect(percentageToFactor(0.0027, 4)).toBe(0)
      expect(percentageToFactor(1 / 3, 3)).toBe(0.003)
      expect(percentageToFactor(1 / 3, 8)).toBe(0.00333333)
      expect(percentageToFactor(2 / 3, 10)).toBe(0.0066666667)
      expect(percentageToFactor(0.7)).toBe(0.007)
      expect(percentageToFactor(1)).toBe(0.01)
      expect(percentageToFactor(33)).toBe(0.33)
      expect(percentageToFactor(100)).toBe(1)
      expect(percentageToFactor(233.7)).toBe(2.337)
    })
  })

  it('functions are inverse', () => {
    const testInverse = (val: number) => percentageToFactor(factorToPercentage(val))

    expect(testInverse(NaN)).toBe(NaN)
    expect(testInverse(0)).toBe(0)
    expect(testInverse(0.0027)).toBe(0.0027)
    expect(testInverse(0.7)).toBe(0.7)
    expect(testInverse(1)).toBe(1)
    expect(testInverse(1 / 3)).toBe(0.333333)
    expect(testInverse(2 / 3)).toBe(0.666667)
    expect(testInverse(33)).toBe(33)
    expect(testInverse(100)).toBe(100)
    expect(testInverse(233.7)).toBe(233.7)
  })
})

describe('toSemVer', () => {
  it('should parse version correctly', () => {
    expect(toSemVer('0.0.1')).toEqual({
      major: 0,
      minor: 0,
      patch: 1,
      raw: '0.0.1',
    })
    expect(toSemVer('0.9.11dev')).toEqual({
      major: 0,
      minor: 9,
      patch: 11,
      raw: '0.9.11dev',
    })
    expect(toSemVer('1.0.0-beta.2')).toEqual({
      major: 1,
      minor: 0,
      patch: 0,
      raw: '1.0.0-beta.2',
    })
    expect(toSemVer('21.42.1337-dev.2+devel.99ff4cd')).toEqual({
      major: 21,
      minor: 42,
      patch: 1337,
      raw: '21.42.1337-dev.2+devel.99ff4cd',
    })
  })
  it('should parse invalid version as UNKNOWN', () => {
    expect(toSemVer(undefined)).toBe(UNKNOWN_VERSION)
    expect(toSemVer('')).toBe(UNKNOWN_VERSION)
    expect(toSemVer(' ')).toBe(UNKNOWN_VERSION)
    expect(toSemVer('🧡')).toBe(UNKNOWN_VERSION)
    expect(toSemVer('21')).toBe(UNKNOWN_VERSION)
    expect(toSemVer('21.42')).toBe(UNKNOWN_VERSION)
    expect(toSemVer('21.42.')).toBe(UNKNOWN_VERSION)
    expect(toSemVer('21.42.💯')).toBe(UNKNOWN_VERSION)
    expect(toSemVer('21.42.-1')).toBe(UNKNOWN_VERSION)
    expect(toSemVer('21.42.-1')).toBe(UNKNOWN_VERSION)
    expect(toSemVer('21.-1.42')).toBe(UNKNOWN_VERSION)
    expect(toSemVer('-1.21.42')).toBe(UNKNOWN_VERSION)
    expect(toSemVer('21million')).toBe(UNKNOWN_VERSION)
  })
})

describe('formatSats', () => {
  it('should format given value in sats as amount in sats', () => {
    expect(formatSats(-1_000)).toBe('-1,000')
    expect(formatSats(-21)).toBe('-21')
    expect(formatSats(-1)).toBe('-1')
    expect(formatSats(0)).toBe('0')
    expect(formatSats(1)).toBe('1')
    expect(formatSats(999)).toBe('999')
    expect(formatSats(1_000)).toBe('1,000')
    expect(formatSats(2099999997690000)).toBe('2,099,999,997,690,000')
    expect(formatSats(2100000000000000)).toBe('2,100,000,000,000,000')
  })
})

describe('formatBtc', () => {
  it('should format given value in BTC as amount in BTC', () => {
    expect(formatBtc(-1_000)).toBe('-1,000.00000000')
    expect(formatBtc(-21)).toBe('-21.00000000')
    expect(formatBtc(-1)).toBe('-1.00000000')
    expect(formatBtc(0)).toBe('0.00000000')
    expect(formatBtc(1)).toBe('1.00000000')
    expect(formatBtc(123.03224961)).toBe('123.03224961')
    expect(formatBtc(123.456)).toBe('123.45600000')
    expect(formatBtc(1_000)).toBe('1,000.00000000')
    expect(formatBtc(20999999.9769)).toBe('20,999,999.97690000')
    expect(formatBtc(21000000)).toBe('21,000,000.00000000')
    expect(formatBtc(21000000.0)).toBe('21,000,000.00000000')
  })
})

describe('formatBtcDisplayValue', () => {
  it('should format given value in sats as amount in BTC', () => {
    expect(formatBtcDisplayValue(-1_000)).toBe('-0.00 001 000')
    expect(formatBtcDisplayValue(-21)).toBe('-0.00 000 021')
    expect(formatBtcDisplayValue(-1)).toBe('-0.00 000 001')
    expect(formatBtcDisplayValue(-0.5)).toBe('-0.00 000 000')
    expect(formatBtcDisplayValue(-0.9)).toBe('-0.00 000 000')
    expect(formatBtcDisplayValue(0)).toBe('0.00 000 000')
    expect(formatBtcDisplayValue(0.5)).toBe('0.00 000 000')
    expect(formatBtcDisplayValue(0.9)).toBe('0.00 000 000')
    expect(formatBtcDisplayValue(1)).toBe('0.00 000 001')
    expect(formatBtcDisplayValue(123.03224961)).toBe('0.00 000 123')
    expect(formatBtcDisplayValue(123.456)).toBe('0.00 000 123')
    expect(formatBtcDisplayValue(1_000)).toBe('0.00 001 000')
    expect(formatBtcDisplayValue(20999999.9769)).toBe('0.20 999 999')
    expect(formatBtcDisplayValue(21000000)).toBe('0.21 000 000')
    expect(formatBtcDisplayValue(21000000.0)).toBe('0.21 000 000')
    expect(formatBtcDisplayValue(2099999997690000)).toBe('20,999,999.97 690 000')
    expect(formatBtcDisplayValue(2100000000000000)).toBe('21,000,000.00 000 000')
  })
  it('should format with symbol', () => {
    expect(formatBtcDisplayValue(-432123456789, { withSymbol: true })).toBe('₿ -4,321.23 456 789')
    expect(formatBtcDisplayValue(0, { withSymbol: true })).toBe('₿ 0.00 000 000')
    expect(formatBtcDisplayValue(1, { withSymbol: true })).toBe('₿ 0.00 000 001')
    expect(formatBtcDisplayValue(123456789, { withSymbol: true })).toBe('₿ 1.23 456 789')
  })
})

describe('calcOfferMinsizeMax', () => {
  it('should calc offer minsize based on wallet balance', () => {
    expect(calcOfferMinsizeMax({})).toBe(0)
    expect(
      calcOfferMinsizeMax(
        {
          '0': {
            accountIndex: 0,
            calculatedTotalBalanceInSats: 21,
            calculatedAvailableBalanceInSats: 21,
            calculatedFrozenOrLockedBalanceInSats: 0,
          },
        },
        0,
      ),
    ).toBe(21)
    expect(
      calcOfferMinsizeMax(
        {
          '0': {
            accountIndex: 0,
            calculatedTotalBalanceInSats: 42,
            calculatedAvailableBalanceInSats: 41,
            calculatedFrozenOrLockedBalanceInSats: 1,
          },
          '1': {
            accountIndex: 1,
            calculatedTotalBalanceInSats: 42_000,
            calculatedAvailableBalanceInSats: 1,
            calculatedFrozenOrLockedBalanceInSats: 41_999,
          },
        },
        21,
      ),
    ).toBe(20)
  })
})
