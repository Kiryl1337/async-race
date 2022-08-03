import Garage from '../pages/garage/garage';
import { CarResponse } from '../utils/interfaces';

class App {
  private garage;

  constructor() {
    this.garage = new Garage();
  }

  public async start(): Promise<void> {
    this.garage.createGarageContainer();
    const { cars, totalCount } = await this.getCars(1, 7);
    if (totalCount) {
      this.garage.garageContent(cars, totalCount, 1);
    }
    this.eventListeners();
  }

  public async getCars(page: number, limit: number): Promise<CarResponse> {
    const response = await fetch(`
    ${'http://127.0.0.1:3000/garage'}?_page=${page}&_limit=${limit}`);
    return {
      cars: await response.json(),
      totalCount: response.headers.get('X-Total-Count'),
    };
  }

  private eventListeners() {
    const create = document.getElementById('create-submit') as HTMLButtonElement;
    create.addEventListener('click', () => {
      this.createCarAction();
    });
    window.addEventListener('click', async (event) => {
      const eventTarget = <HTMLButtonElement>event.target;
      if (eventTarget.className.includes('remove-btn')) {
        this.removeCar(eventTarget, 1);
      }
    });
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
    garage.innerHTML = '';
    (await fetch(`${'http://127.0.0.1:3000/garage'}/${carId}`, { method: 'DELETE' })).json();
    const { cars, totalCount } = await this.getCars(page, 7);
    if (totalCount) {
      garage.innerHTML = this.garage.garageContent(cars, totalCount, page).innerHTML;
    }
  }
}

export default App;
