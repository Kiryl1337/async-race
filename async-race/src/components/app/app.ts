import Garage from '../pages/garage/garage';

class App {
  private garage;

  constructor() {
    this.garage = new Garage();
  }

  public async start(): Promise<void> {
    this.garage.createGarageContainer();
  }
}

export default App;
