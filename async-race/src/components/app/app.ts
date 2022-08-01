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
  }

  public async getCars(page: number, limit: number): Promise<CarResponse> {
    const response = await fetch(`
    ${'http://127.0.0.1:3000/garage'}?_page=${page}&_limit=${limit}`);
    return {
      cars: await response.json(),
      totalCount: response.headers.get('X-Total-Count'),
    };
  }
}

export default App;
