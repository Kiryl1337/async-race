import Garage from '../pages/garage/garage';
import { carBrands, carModels } from '../utils/data';
import { Car, CarResponse } from '../utils/interfaces';

let currentCar: Promise<Car>;
const NUMBER_SEVEN = 7;
const NUMBER_ONE_HUNDRED = 100;

class App {
  private garage;

  private paginationPage;

  constructor() {
    this.garage = new Garage();
    this.paginationPage = 1;
  }

  public async start(): Promise<void> {
    this.garage.createGarageContainer();
    const { cars, totalCount } = await this.getCars(this.paginationPage);
    if (totalCount) {
      this.garage.garageContent(cars, totalCount, this.paginationPage);
    }
    this.eventListeners();
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
      const { cars, totalCount } = await this.getCars(this.paginationPage);
      if (totalCount) {
        this.garage.garageContent(cars, totalCount, this.paginationPage);
      }
    });
    window.addEventListener('click', async (event) => {
      const eventTarget = <HTMLButtonElement>event.target;
      if (eventTarget.className.includes('remove-btn')) {
        this.removeCar(eventTarget, this.paginationPage);
      }
    });
    window.addEventListener('click', async (event) => {
      const eventTarget = <HTMLButtonElement>event.target;
      if (eventTarget.className.includes('select-btn')) {
        this.selectCar(eventTarget);
      }
    });
    const update = document.getElementById('update-submit') as HTMLButtonElement;
    update.addEventListener('click', async (event) => {
      event.preventDefault();
      this.updateCar();
      const name = document.getElementById('update-name') as HTMLInputElement;
      const color = document.getElementById('update-color') as HTMLInputElement;
      const updateBtn = document.getElementById('update-submit') as HTMLButtonElement;
      name.value = '';
      color.value = '#000000';
      name.disabled = true;
      color.disabled = true;
      updateBtn.disabled = true;
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
  }

  private async generateCars(): Promise<void> {
    for (let i = 0; i < NUMBER_ONE_HUNDRED; i++) {
      const randomBrand = carBrands[Math.floor(Math.random() * carBrands.length)];
      const randomModel = carModels[Math.floor(Math.random() * carModels.length)];
      const randomName = randomBrand + ' ' + randomModel;
      const randomColor = this.getRandomColor();

      const body = { name: randomName, color: randomColor };
      (
        await fetch('http://127.0.0.1:3000/garage', {
          method: 'POST',
          body: JSON.stringify(body),
          headers: {
            'Content-Type': 'application/json',
          },
        })
      ).json();
    }
    const garage = document.querySelector('.garage') as HTMLDivElement;
    const { cars, totalCount } = await this.getCars(this.paginationPage);
    if (totalCount) {
      garage.innerHTML = this.garage.garageContent(cars, totalCount, this.paginationPage).innerHTML;
    }
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
    return (
      await fetch('http://127.0.0.1:3000/garage', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
        },
      })
    ).json();
  }

  private async removeCar(element: Element, page: number): Promise<void> {
    const carId = element.id.split('-')[2];
    const garage = document.querySelector('.garage') as HTMLDivElement;
    (await fetch(`${'http://127.0.0.1:3000/garage'}/${carId}`, { method: 'DELETE' })).json();
    const { cars, totalCount } = await this.getCars(page);
    if (totalCount) {
      garage.innerHTML = this.garage.garageContent(cars, totalCount, page).innerHTML;
    }
  }

  private async selectCar(element: Element): Promise<void> {
    const name = document.getElementById('update-name') as HTMLInputElement;
    const color = document.getElementById('update-color') as HTMLInputElement;
    const updateBtn = document.getElementById('update-submit') as HTMLButtonElement;
    const carId = element.id.split('-')[2];
    currentCar = (await fetch(`${'http://127.0.0.1:3000/garage'}/${carId}`)).json();

    name.value = (await currentCar).name;
    color.value = (await currentCar).color;
    name.disabled = false;
    color.disabled = false;
    updateBtn.disabled = false;
  }

  private async updateCar(): Promise<void> {
    const name = (document.getElementById('update-name') as HTMLInputElement).value;
    const color = (document.getElementById('update-color') as HTMLInputElement).value;
    const carId = (await currentCar).id;
    const body = { name, color };
    (
      await fetch(`${'http://127.0.0.1:3000/garage'}/${carId}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
        },
      })
    ).json();
    const { cars, totalCount } = await this.getCars(this.paginationPage);
    if (totalCount) {
      this.garage.garageContent(cars, totalCount, this.paginationPage);
    }
  }

  private async nextAction(): Promise<void> {
    const garage = document.querySelector('.garage') as HTMLDivElement;
    const { totalCount } = await this.getCars(this.paginationPage);
    if (totalCount) {
      if (Number(totalCount) / (NUMBER_SEVEN * this.paginationPage) > 1) {
        this.paginationPage += 1;
        const { cars } = await this.getCars(this.paginationPage);
        garage.innerHTML = this.garage.garageContent(cars, totalCount, this.paginationPage).innerHTML;
      }
    }
  }

  private async prevAction(): Promise<void> {
    const garage = document.querySelector('.garage') as HTMLDivElement;
    if (this.paginationPage > 1) {
      this.paginationPage -= 1;
      const { cars, totalCount } = await this.getCars(this.paginationPage);
      if (totalCount) {
        garage.innerHTML = this.garage.garageContent(cars, totalCount, this.paginationPage).innerHTML;
      }
    }
  }
}

export default App;
