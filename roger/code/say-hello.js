export class SayHello extends HTMLElement {
    constructor() {
      super();
      let shadowRoot = this.attachShadow({mode: 'open'});
      shadowRoot.innerHTML = `<p>hello again</p>`;
    }
  }

  customElements.define('say-hello', SayHello);