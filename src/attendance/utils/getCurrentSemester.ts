export function getCurrentSemester() {
  const date = new Date();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  if (month >= 2 && month < 8) {
    return `${year - 1}-01`;
  }
  return `${year}-02`;
}
