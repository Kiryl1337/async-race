const SUCCESS_STATUS = 200;
export const animationMap: { [key: string]: number } = {};

async function createAnimation(car: HTMLElement, raceDistance: number, carId: string, raceTime: number): Promise<void> {
  let start: number | null = null;
  let state = 0;
  function animationStep(timestamp: number): void {
    if (!start) {
      start = timestamp;
    }
    const speed = raceDistance / raceTime;
    const time = timestamp - start;
    const passed = Math.round(speed * time);
    car.style.transform = `translateX(${Math.min(passed, raceDistance)}px)`;

    if (passed < raceDistance) {
      state = window.requestAnimationFrame(animationStep);
      animationMap[carId] = state;
    }
  }

  state = window.requestAnimationFrame(animationStep);
  const resolve = await fetch(`${'http://127.0.0.1:3000/engine'}?id=${carId}&status=drive`, {
    method: 'PATCH',
  });
  if (resolve.status !== SUCCESS_STATUS) {
    window.cancelAnimationFrame(state);
  }
}

export default createAnimation;
