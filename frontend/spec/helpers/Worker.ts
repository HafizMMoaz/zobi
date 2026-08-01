class Worker {
  url: string;

  onMessage: Function;

  terminate: Function;

  constructor(stringUrl: string) {
    this.url = stringUrl;
    this.onMessage = () => {};
    this.terminate = () => {};
  }

  postMessage(msg: string) {
    this.onMessage(msg);
  }
}

export { Worker };
