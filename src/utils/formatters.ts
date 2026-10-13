/**
 * 원화 금액 포맷팅 유틸리티
 */
export function formatWon(amount: number): string {
  if (amount === 0) return '0원';
  const abs = Math.abs(amount);
  const eok = Math.floor(abs / 100_000_000);
  const man = Math.floor((abs % 100_000_000) / 10_000);
  const rest = abs % 10_000;

  let result = '';
  if (eok > 0) result += `${eok}억 `;
  if (man > 0) result += `${man}만 `;
  if (eok === 0 && man === 0 && rest > 0) result += `${rest.toLocaleString()}`;

  result = result.trim() + '원';
  return amount < 0 ? `-${result}` : result;
}

export function formatNumberWithComma(amount: number): string {
  return `${amount.toLocaleString()}원`;
}

export function formatArea(sqm: number): string {
  const pyeong = (sqm * 0.3025).toFixed(1);
  return `${sqm}㎡ (약 ${pyeong}평)`;
}
