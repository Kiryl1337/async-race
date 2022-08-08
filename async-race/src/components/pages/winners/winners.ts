import { Winner, WinnerResponse } from '../../utils/interfaces';
import { SUCCESS_STATUS } from '../garage/carAnimation';
import Garage from '../garage/garage';

const FIVE_SECONDS = 5000;
const NUMBER_TEN = 10;
class Winners {
  public async createWinners(winners: Winner[], totalCount: string, page: number): Promise<void> {
    const winnersContainer = document.querySelector('.winners-container') as HTMLDivElement;
    winnersContainer.innerHTML = `
        <div class="winners">
          <h1 class='winners-title'>Winners(${totalCount})</h1>
          <h2 class='winners-page'>Page ${page}#</h2>
          <table>
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
               ${await (await this.createWinnersData(winners, page)).join('')} 
            </tbody>
          </table>
          <div class="pagination">
            <button class="btn pagination-btn" id="prev">Prev</button>
            <button class="btn pagination-btn" id="next">Next</button>
          </div>
        </div>`;
  }

  private async createWinnersData(winners: Winner[], page: number): Promise<string[]> {
    return Promise.all(
      winners.map(async (winner, i) => {
        const car = await (await fetch(`${'http://127.0.0.1:3000/garage'}/${winner.id}`)).json();
        const html = `
                        <tr>
                          <td>${`${page === 1 ? '' : page - 1}${i + 1}`}</td>
                          <td>${Garage.carImage(car.color)}</td>
                          <td>${car.name}</td>
                          <td>${winner.wins}</td>
                          <td>${winner.time}</td>
                        </tr>
                      `;
        return html;
      }),
    );
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

  public async getWinners(page: number, limit = NUMBER_TEN): Promise<WinnerResponse> {
    const response = await fetch(`${'http://127.0.0.1:3000/winners'}?_page=${page}&_limit=${limit}`);
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
    const { winners, totalCount } = await this.getWinners(1);
    if (totalCount) {
      this.createWinners(winners, totalCount, 1);
    }
  }

  public async addWinner(id: string, time: number): Promise<void> {
    const winner = await fetch(`${'http://127.0.0.1:3000/winners'}/${id}`);
    if (winner.status === SUCCESS_STATUS) {
      const winnerJSON = await winner.json();
      await fetch(`${'http://127.0.0.1:3000/winners'}/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ id, wins: winnerJSON.wins + 1, time: time < winnerJSON.time ? time : winnerJSON.time }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } else {
      await fetch('http://127.0.0.1:3000/winners', {
        method: 'POST',
        body: JSON.stringify({ id, wins: 1, time }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
  }
}

export default Winners;
