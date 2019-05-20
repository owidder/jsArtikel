export class SayHello extends HTMLelement {
    constructor() {
        super();
        let shadowRoot = this.attachShadow({mode: 'open'});
        shadowRoot.innerHTML = `<p>hello again</p>`;
    }
}

customElements.define('say-hello', SayHello);
