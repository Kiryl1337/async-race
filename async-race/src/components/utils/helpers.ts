export function getRandomColor(): string {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let j = 0; j < 6; j++) {
    color += letters[Math.floor(Math.random() * letters.length)];
  }
  return color;
}

export function getPosition(element: HTMLElement): number {
  const { left, width } = element.getBoundingClientRect();
  return left + width / 2;
}
