import { SUCCESS_STATUS } from '../garage/carAnimation';

const FIVE_SECONDS = 5000;
class Winners {
  public createWinners(): HTMLElement {
    const body = document.querySelector('body') as HTMLElement;
    const winners = document.querySelector('.winners-container') as HTMLDivElement;
    winners.innerHTML = `
        <div class="winners">
          <h1 class='winners-title'>Winners()</h1>
          <h2 class='winners-page'>Page #</h2>
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
          
            </tbody>
          </table>
          <div class="pagination">
            <button class="btn pagination-btn" id="prev">Prev</button>
            <button class="btn pagination-btn" id="next">Next</button>
          </div>
        </div>
    `;
    return body;
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
