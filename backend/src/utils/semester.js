export function getCurrentSemesterKey(date = new Date()) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const semester = month <= 6 ? 1 : 2;
  return `${year}-${semester}`;
}
