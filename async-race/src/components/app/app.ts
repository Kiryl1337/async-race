import createAnimation, { animationMap, SUCCESS_STATUS } from '../pages/garage/carAnimation';
import Garage from '../pages/garage/garage';
import Winners from '../pages/winners/winners';
import { carBrands, carModels } from '../utils/data';
import { Car, CarResponse } from '../utils/interfaces';

let currentCar: Promise<Car>;
const NUMBER_SEVEN = 7;
const NUMBER_TWENTY = 20;
const NUMBER_ONE_HUNDRED = 100;
const NUMBER_ONE_THOUSAND = 1000;

class App {
  private garage;

  private winners;

  private paginationPage;

  private updateName;

  private updateColor;

  private updateBtn;

  constructor() {
    this.garage = new Garage();
    this.winners = new Winners();
    this.garage.createGarageContainer();
    this.paginationPage = 1;
    this.updateName = document.getElementById('update-name') as HTMLInputElement;
    this.updateColor = document.getElementById('update-color') as HTMLInputElement;
    this.updateBtn = document.getElementById('update-submit') as HTMLButtonElement;
  }

  public async start(): Promise<void> {
    this.updateGarage();
    this.eventListeners();
  }

  private async updateGarage(): Promise<void> {
    const { cars, totalCount } = await this.getCars(this.paginationPage);
    if (totalCount) {
      this.garage.garageContent(cars, totalCount, this.paginationPage);
    }
  }

  public async getCars(page: number, limit = NUMBER_SEVEN): Promise<CarResponse> {
    const response = await fetch(`
    ${'http://127.0.0.1:3000/garage'}?_page=${page}&_limit=${limit}`);
    return {
      cars: await response.json(),
      totalCount: response.headers.get('X-Total-Count'),
    };
  }

  private eventListeners() {
    const create = document.getElementById('create-submit') as HTMLButtonElement;
    create.addEventListener('click', async (event) => {
      event.preventDefault();
      this.createCarAction();
      this.updateGarage();
    });
    window.addEventListener('click', async (event) => {
      const eventTarget = <HTMLButtonElement>event.target;
      if (eventTarget.className === 'btn remove-btn') {
        this.removeCar(eventTarget);
      }
      if (eventTarget.className === 'btn select-btn') {
        this.selectCar(eventTarget);
      }
      if (eventTarget.className === 'start-engine-btn') {
        this.startEngine(eventTarget.id.split('-')[3]);
      }
      if (eventTarget.className === 'stop-engine-btn') {
        this.stopEngine(eventTarget.id.split('-')[3]);
      }
    });

    this.updateBtn?.addEventListener('click', async (event) => {
      event.preventDefault();
      this.updateCar();
      if (this.updateName && this.updateColor && this.updateBtn) {
        this.updateName.value = '';
        this.updateColor.value = '#000000';
        this.updateName.disabled = true;
        this.updateColor.disabled = true;
        this.updateBtn.disabled = true;
      }
    });
    const nextBtn = document.getElementById('next') as HTMLButtonElement;
    nextBtn.addEventListener('click', () => {
      this.nextAction();
    });
    const prevBtn = document.getElementById('prev') as HTMLButtonElement;
    prevBtn.addEventListener('click', async () => {
      this.prevAction();
    });
    const generator = document.getElementById('generator') as HTMLButtonElement;
    generator.addEventListener('click', async () => {
      this.generateCars();
    });
    const race = document.getElementById('race') as HTMLButtonElement;
    const reset = document.getElementById('reset') as HTMLButtonElement;
    race.addEventListener('click', async () => {
      race.disabled = true;
      reset.disabled = false;
      this.startRace();
    });
    reset.addEventListener('click', async () => {
      race.disabled = false;
      reset.disabled = true;
      this.stopRace();
    });

    const garageBtn = document.getElementById('garage-view') as HTMLButtonElement;
    const winnersBtn = document.getElementById('winners-view') as HTMLButtonElement;
    const garage = document.querySelector('.garage-container') as HTMLDivElement;
    const winners = document.querySelector('.winners-container') as HTMLDivElement;
    garageBtn.addEventListener('click', () => {
      this.updateGarage();
      winners.style.display = 'none';
      garage.style.display = 'flex';
    });

    winnersBtn.addEventListener('click', () => {
      this.winners.createWinners();
      winners.style.display = 'flex';
      garage.style.display = 'none';
    });
  }

  private async startRace() {
    const { cars } = await this.getCars(this.paginationPage, NUMBER_SEVEN);
    let isWinner = false;
    cars.forEach(async (carElem) => {
      const carId = carElem.id.toString();
      const { raceStatus, raceTime } = await this.startEngine(carId);
      if ((await raceStatus) === SUCCESS_STATUS && !isWinner) {
        isWinner = true;
        const winnerCar: Car = await (await fetch(`${'http://127.0.0.1:3000/garage'}/${carId}`)).json();
        const winnerTime = Number((Number(raceTime) / NUMBER_ONE_THOUSAND).toFixed(2));
        this.winners.createWinnerMessage(winnerCar.name, winnerTime);
        this.winners.addWinner(carId, winnerTime);
      }
    });
  }

  private async stopRace() {
    const { cars } = await this.getCars(this.paginationPage, NUMBER_SEVEN);
    cars.forEach(async (carElem) => {
      const carId = carElem.id.toString();
      this.stopEngine(carId);
    });
  }

  private async startEngine(carId: string): Promise<{ [key: string]: number | Promise<number> }> {
    const startBtn = document.getElementById(`start-engine-car-${carId}`) as HTMLInputElement;
    const stopBtn = document.getElementById(`stop-engine-car-${carId}`) as HTMLInputElement;
    const race = await (
      await fetch(`${'http://127.0.0.1:3000/engine'}?id=${carId}&status=started`, {
        method: 'PATCH',
      })
    ).json();
    const raceTime = Math.round(race.distance / race.velocity);
    const car = document.getElementById(`car-${carId}`) as HTMLElement;
    const flag = document.getElementById(`finish-${carId}`) as HTMLElement;
    const carPosition = this.getPosition(car);
    const flagPosition = this.getPosition(flag);
    const raceDistance = Math.floor(Math.sqrt(Math.pow(carPosition - flagPosition, 2)) + NUMBER_TWENTY);
    const raceStatus = createAnimation(car, raceDistance, carId, raceTime);
    startBtn.disabled = true;
    stopBtn.disabled = false;
    return { raceStatus, raceTime };
  }

  private async stopEngine(carId: string): Promise<void> {
    const stopBtn = document.getElementById(`stop-engine-car-${carId}`) as HTMLInputElement;
    const startBtn = document.getElementById(`start-engine-car-${carId}`) as HTMLInputElement;
    await fetch(`${'http://127.0.0.1:3000/engine'}?id=${carId}&status=stopped`, {
      method: 'PATCH',
    });
    const car = document.getElementById(`car-${carId}`) as HTMLDivElement;
    window.cancelAnimationFrame(animationMap[carId]);
    car.style.transform = 'translateX(0)';
    startBtn.disabled = false;
    stopBtn.disabled = true;
  }

  public getPosition(element: HTMLElement): number {
    const { left, width } = element.getBoundingClientRect();
    return left + width / 2;
  }

  private async generateCars(): Promise<void> {
    for (let i = 0; i < NUMBER_ONE_HUNDRED; i++) {
      const randomBrand = carBrands[Math.floor(Math.random() * carBrands.length)];
      const randomModel = carModels[Math.floor(Math.random() * carModels.length)];
      const randomName = randomBrand + ' ' + randomModel;
      const randomColor = this.getRandomColor();

      const body = { name: randomName, color: randomColor };
      await fetch('http://127.0.0.1:3000/garage', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
    this.updateGarage();
  }

  private getRandomColor(): string {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let j = 0; j < 6; j++) {
      color += letters[Math.floor(Math.random() * letters.length)];
    }
    return color;
  }

  private async createCarAction(): Promise<void> {
    const name = (document.getElementById('create-name') as HTMLInputElement).value;
    const color = (document.getElementById('create-color') as HTMLInputElement).value;
    const body = { name, color };
    await fetch('http://127.0.0.1:3000/garage', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  private async removeCar(element: Element): Promise<void> {
    const carId = element.id.split('-')[2];
    await fetch(`${'http://127.0.0.1:3000/garage'}/${carId}`, { method: 'DELETE' });
    this.updateGarage();
  }

  private async selectCar(element: Element): Promise<void> {
    const carId = element.id.split('-')[2];
    currentCar = (await fetch(`${'http://127.0.0.1:3000/garage'}/${carId}`)).json();

    this.updateName.value = (await currentCar).name;
    this.updateColor.value = (await currentCar).color;
    this.updateName.disabled = false;
    this.updateColor.disabled = false;
    this.updateBtn.disabled = false;
  }

  private async updateCar(): Promise<void> {
    const name = this.updateName.value;
    const color = this.updateColor.value;
    const carId = (await currentCar).id;
    const body = { name, color };
    await fetch(`${'http://127.0.0.1:3000/garage'}/${carId}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    this.updateGarage();
  }

  private async nextAction(): Promise<void> {
    const { totalCount } = await this.getCars(this.paginationPage);
    if (totalCount) {
      if (Number(totalCount) / (NUMBER_SEVEN * this.paginationPage) > 1) {
        this.paginationPage += 1;
        this.updateGarage();
      }
    }
  }

  private async prevAction(): Promise<void> {
    if (this.paginationPage > 1) {
      this.paginationPage -= 1;
      this.updateGarage();
    }
  }
}

export default App;
