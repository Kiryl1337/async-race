export interface Car {
  id: number;
  name: string;
  color: string;
  engineStarted?: boolean;
}

export interface CarResponse {
  cars: Car[];
  totalCount: string | null;
}

class Garage {
  public createHeader(): string {
    return `
            <header>
              <nav>
                <div class="nav-button" id="garage-view">Garage</div>
                <div class="nav-button" id="winners-view">Winners</div>
              </nav>
            </header>
          `;
  }

  public createGarageContainer(): HTMLElement {
    const body = document.querySelector('body') as HTMLElement;
    body.innerHTML = `${this.createHeader()}
                      <div class="garage-container">
                        <div class="garage-forms">
                          <form class="create-form" id="create">
                            <input class="form-input" id="create-name" name="name" type="text">
                            <input class="form-color" id="create-color" name="color" type="color" value="#FFFFFF">
                            <button class="btn" id="create-submit">Create</button>
                          </form>
                          <form class="update-form" id="update">
                            <input class="form-input" id="update-name" name="name" type="text" disabled>
                            <input class="form-color" id="update-color" name="color" type="color" value="#FFFFFF" disabled>
                            <button class="btn" id="update-submit" href="#" disabled>Update</button>
                          </form>
                        </div>
                        <div class="garage-controls">
                          <button class="btn race-btn" id="race">Race</button>
                          <button class="btn reset-btn" id="reset">Reset</button>
                          <button class="btn generate-btn" id="generator">Generate cars</button>
                        </div>
                        <div class="garage">
                      
                        </div>
                      </div>
                      <div class="pagination">
                          <button class="btn pagination-btn" id="prev">Prev</button>
                          <button class="btn pagination-btn" id="next">Next</button>
                      </div>`;
    return body;
  }
}

export default Garage;
