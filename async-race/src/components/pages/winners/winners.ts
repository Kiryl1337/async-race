import { FIVE_SECONDS, GARAGE, NUMBER_TEN, SUCCESS_STATUS, TIME, WINNERS, WINS } from '../../utils/constants';
import { SortOrder } from '../../utils/enums';
import { Winner, WinnerResponse } from '../../utils/interfaces';
import Garage from '../garage/garage';

class Winners {
  private paginationPage: number;

  private sortByWins: string = SortOrder.DESC;

  private sortByTime: string = SortOrder.DESC;

  private globalSort = TIME;

  private globalOrder: string = SortOrder.ASC;

  constructor() {
    this.paginationPage = 1;
  }

  public async createWinners(winners: Winner[], totalCount: string, page: number): Promise<void> {
    const winnersContainer = document.querySelector('.winners-container') as HTMLDivElement;
    winnersContainer.innerHTML = `
        <div class="winners">
          <h1 class='winners-title'>Winners (${totalCount})</h1>
          <h2 class='winners-page'>Page #${page}</h2>
          <table class="winners-table">
            <thead>
              <tr>
                <th>№</th>
                <th>Car</th>
                <th>Model</th>
                <th class="wins-btn">Wins</th>
                <th class="time-btn">Best time (sec)</th>
              </tr>
            </thead>
            <tbody>
               ${(await this.createWinnersData(winners, page)).join('')} 
            </tbody>
          </table>
          <div class="winners-pagination">
            <button class="btn pagination-btn" id="winners-prev">Prev</button>
            <button class="btn pagination-btn" id="winners-next">Next</button>
          </div>
        </div>`;
  }

  public async createWinnerMessage(name: string, time: number): Promise<void> {
    const body = document.querySelector('body') as HTMLElement;
    const winnerMessage = document.createElement('div') as HTMLDivElement;
    winnerMessage.className = 'winner-message';
    winnerMessage.innerHTML = `
            <p>${name} went first(${time}s)</p>
    `;
    setTimeout(() => {
      winnerMessage?.remove();
    }, FIVE_SECONDS);
    body.appendChild(winnerMessage);
  }

  public async getWinners(page: number, sort: string, order: string, limit = NUMBER_TEN): Promise<WinnerResponse> {
    const response = await fetch(`${WINNERS}?_page=${page}&_limit=${limit}&_sort=${sort}&_order=${order}`);
    const winners = await response.json();
    return {
      winners: await Promise.all<Winner>(
        winners.map(async (winner: Winner) => ({
          ...winner,
        })),
      ),
      totalCount: response.headers.get('X-Total-Count'),
    };
  }

  public async updateWinners(): Promise<void> {
    const { winners, totalCount } = await this.getWinners(this.paginationPage, this.globalSort, this.globalOrder);
    if (totalCount) {
      await this.createWinners(winners, totalCount, this.paginationPage);
      this.eventListeners();
    }
  }

  public async addWinner(id: string, time: number): Promise<void> {
    const winner = await fetch(`${WINNERS}/${id}`);
    if (winner.status === SUCCESS_STATUS) {
      const winnerJSON = await winner.json();
      await fetch(`${WINNERS}/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ id, wins: winnerJSON.wins + 1, time: time < winnerJSON.time ? time : winnerJSON.time }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } else {
      await fetch(WINNERS, {
        method: 'POST',
        body: JSON.stringify({ id, wins: 1, time }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
    await this.updateWinners();
  }

  private async createWinnersData(winners: Winner[], page: number): Promise<string[]> {
    return Promise.all(
      winners.map(async (winner, i) => {
        const car = await (await fetch(`${GARAGE}/${winner.id}`)).json();
        return ` <tr>
                   <td>${`${page === 1 ? '' : page - 1}${i + 1}`}</td>
                   <td>${Garage.carImage(car.color)}</td>
                   <td>${car.name}</td>
                   <td>${winner.wins}</td>
                   <td>${winner.time}</td>
                 </tr>
               `;
      }),
    );
  }

  private eventListeners(): void {
    const nextBtn = document.getElementById('winners-next') as HTMLButtonElement;
    nextBtn.addEventListener('click', async () => {
      await this.nextAction();
    });
    const prevBtn = document.getElementById('winners-prev') as HTMLButtonElement;
    prevBtn.addEventListener('click', async () => {
      await this.prevAction();
    });
    const winsBtn = document.querySelector('.wins-btn') as HTMLElement;
    winsBtn.addEventListener('click', async () => {
      this.sortByWins = this.sortByWins === SortOrder.ASC ? SortOrder.DESC : SortOrder.ASC;
      this.globalOrder = this.sortByWins === SortOrder.ASC ? SortOrder.DESC : SortOrder.ASC;
      this.globalSort = WINS;
      await this.updateWinners();
    });
    const timeBtn = document.querySelector('.time-btn') as HTMLElement;
    timeBtn.addEventListener('click', async () => {
      this.sortByTime = this.sortByTime === SortOrder.ASC ? SortOrder.DESC : SortOrder.ASC;
      this.globalOrder = this.sortByTime === SortOrder.ASC ? SortOrder.DESC : SortOrder.ASC;
      this.globalSort = TIME;
      await this.updateWinners();
    });
  }

  private async nextAction(): Promise<void> {
    const { totalCount } = await this.getWinners(this.paginationPage, this.globalSort, this.globalOrder);
    if (totalCount) {
      if (+totalCount / (NUMBER_TEN * this.paginationPage) > 1) {
        this.paginationPage += 1;
        await this.updateWinners();
      }
    }
  }

  private async prevAction(): Promise<void> {
    if (this.paginationPage > 1) {
      this.paginationPage -= 1;
      await this.updateWinners();
    }
  }
}

export default Winners;
