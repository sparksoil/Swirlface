export function seasonClass(tsISO){
  const ts = new Date(tsISO).getTime();
  const days = (Date.now() - ts) / 86400000;
  if (days <= 14) return 'age-fresh';
  if (days <= 44) return 'age-spring';
  if (days <= 104) return 'age-summer';
  if (days <= 224) return 'age-fall';
  return 'age-winter';
}

export function seasonLabel(tsISO){
  const cls = seasonClass(tsISO);
  return {
    'age-fresh': 'Fresh',
    'age-spring': 'Spring',
    'age-summer': 'Summer',
    'age-fall': 'Fall',
    'age-winter': 'Winter'
  }[cls] || 'Fresh';
}
