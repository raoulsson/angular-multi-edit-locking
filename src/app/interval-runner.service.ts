import {Inject, Injectable} from '@angular/core';

type IntervalCodeToRun = () => void;

@Injectable({
  providedIn: 'root'
})
export class IntervalRunnerService {

  intervalId: number | null;
  intervalLength: number;
  codeToRun: (() => void);

  constructor(@Inject('number') intervalLength: number, @Inject('IntervalCodeToRun') codeToRun: IntervalCodeToRun) {
    this.codeToRun = codeToRun;
    this.intervalId = null;
    this.intervalLength = intervalLength;
  }

  setCodeToRun(codeToRun: IntervalCodeToRun) {
    this.codeToRun = codeToRun;
  }

  startInterval() {
    // @ts-ignore
    this.intervalId = setInterval(this.codeToRun, this.intervalLength);
  }

  stopInterval() {
    // @ts-ignore
    clearInterval(this.intervalId);
    this.intervalId = null;
  }

  setIntervalLength(newIntervalLength: number) {
    this.intervalLength = newIntervalLength;
    if (this.intervalId) {
      this.stopInterval();
      this.startInterval();
    }
  }

}

// const intervalRunner = new IntervalRunnerService();
// intervalRunner.startInterval();
//
// // To stop the interval after a specific duration
// setTimeout(() => {
//   intervalRunner.stopInterval();
// }, 5000); // Stop after 5 seconds
//
// // To adjust the interval length to a new value
// setTimeout(() => {
//   intervalRunner.setIntervalLength(2000); // Change interval length to 2 seconds
// }, 3000); // Adj
