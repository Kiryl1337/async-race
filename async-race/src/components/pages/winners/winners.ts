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
}

export default Winners;
