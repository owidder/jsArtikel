# Was sind Komponenten ?

1992 wurde Visual-Basic 2.0 von Microsoft der Öffentlichkeit präsentiert. Neben neuen Sprachfeatures für Objekt orientierte Programmierung, bot Visual-Basic  mit der VBX (Visual-Basic-Extension) Schnittstelle die Möglichkeit beliebige (UI)-Komponenten anderer Hersteller in eigenen Programme zu verwenden. 1995 zog dann Borland mit Delphi 1.0 und der Visual-Component Library nach. Java unternahm dann 1997 mit Swing und JavaBeans ebenfall den Versuch an diese Erfolge anzuknüpfen. Mit allerdings eher mäßigem Erfolg, da sich im Gegensatz zu den Kompomenten-Modellen von Microsoft oder Borland eine eher begrenzte 3rd Party Unterstützung entwickelte. 

Die zunehmender Verbreitung des Web und Konzepten wie SPAs (Single-Page-Applications)sowie neuen Frameworks wie Angular oder React erlaubte es dann den Web-Entwicklern, die im Desktop-Umfeld bereits erfolgreiche Komponenten basierte Entwicklung für Web-Anwendungen zu verwenden.

Auch wenn diese Beispiele alle aus dem UI Umfeld stammen, muß es sich bei einer Komponente nicht unbedingt um eine UI-Komponente handeln. Grundlegende Voraussetzung für eine Komponenten ist lediglich eine definierte Schnittstelle um verschiedene Komponenten verknüpfen und in eigene Anwendungen integrieren zu können.   

JavaScript Frameworks wie Angular oder React erfüllen zwar diese Voraussetzung, tun sich aber eher schwer damit Komponenten des jeweils anderen Frameworks zu verwenden.

Das ist umso erstaunlicher, da HTML seit langem zeigt, wie Komponenten definiert werden (über Tags) und wie die Schnittstelle aussehen muß (Verwendung von Attributen).

Aus diesem Grund wurde 2012 der erste Entwurf der Web-Components Spezifikation veröffentlicht, mit dem Ziel, die Verwendung von eigenen und wiederverwendbaren Tags zu standardisieren.

# Browser Support

Bevor es aber an die Details der Spezifikation geht, lohn sich ein kurzer Abstecher zu "Can I Use" (https://caniuse.com/#search=components) um zu prüfen ,wie es um den Browser Support dieser Spezifikation bestellt ist. 

## Native

Benutzer von Firefox, Chrome und Safari  können sich freuen, da alle wichtigen Aspekte wie "Custom Elements", "Shadow Dom" und  "HTML templates" unterstützt werden. Bei der Verwendung von Safari muß man lediglich mit einer kleiner Einschränkung leben, da nur  "Autonomous custom elements" aber keine "Customized built-in elements" verwendet werden können. Das bedeutet, daß in Safari zwar eigene Komponenten erstellt und verwendet werden können, die aber keine Möglichkeit bieten,   Eigenschaften von bestehenden HTML-Elementen (wie z.B. von einem Button) wiederzuverwenden (https://html.spec.whatwg.org/multipage/custom-elements.html#custom-elements-customized-builtin-example).

IE und Edge, die Browser von Microsoft, bieten zum derzeitigen Zeitpunk keine Unterstützung für Web-Components. Für die Zukunft ist aber auch hier Besserung zu erwarten. Die zukünftige Version von Edge wird auf Chromium, der Open-Source Variante von Chrome, aufbauen und damit dann ebenfalls die Web-Components Spezifikation vollständig unterstützen.

## Polyfill

Für neuere Browser, ausser Microsoft Edge, sieht die Web-Components Unterstützung  ganz gut aus, für alle anderen gibt es ein Polyfill. Nähere Informationen zu Verwendung und Installation finden Sie unter https://www.webcomponents.org/polyfills. Dieses Poylfill rüstet sowohl die "Custom Elements" API als auch die "Shadow DOM" API für ältere Browser nach. Bei der Verwendung der "Shadow DOM" API ist allerdings Vorsicht geboten, das es negative Auswirkungen auf die Render-Performanz einer Seite haben kann. 

# Was sind Web components

Web-Components ist ersteinmal nur eine Meta-Spezifikation für folgende Spezifikationen:

* Custom elements
* Shadow Dom
* ES Modules
* HTML Templates

Wenn ein Browser die APIs gemäß dieser Spezifikationen implementiert, können Sie eigene Elemente definieren und dieser als neue Tags in einer HTML-Seite verwenden. Eine einfache Deklaration einer "Web-Component" sehen Sie in Beispiel 1.

*Beispiel 1 - hello.html*
```HTML
<html>
<head>
    <script>
    class SayHello extends HTMLElement {
        constructor() {
        super();
        let shadowRoot = this.attachShadow({mode: 'open'});
        shadowRoot.innerHTML = `<p>hello again</p>`;
        }
    }
    customElements.define('say-hello', SayHello);
    </script>
</head>
<body>
    <say-hello></say-hello>
</body>
</html>

```

Laden Sie diese Seite in einem Browser der die nötigen APIs unterstützt, wird eine Seite mit dem Text "hello again" angezeigt. Die Erklärungen zu diesem dieses Beispiel finden Sie in den folgenden Abschnitten über die einzelnen Bestandteile der Web-Components Spezifikation 

# Die APIs


## Custom elements

lorem ipsum

## Shadow Dom

lorem ipsum

## ES Modules

Die "ES Module" Spezifikation definiert ein API die es erlaubt JavaScript Dokumente in andere Java-Skript Dokumente einzubinden. Ursprünglich wurde über die "HTML Import" Spezifikation versucht diese Verhalten zu spezifizieren. Diese Spezifikation wurde aber von den Entwicklungen im JavaScript Umfeld überholt. Statt eigene Konzepte zu definieren  wie es die "HTML Import" Spezifikation versuchte bedient sich die "ES Module" Spezifikation den aus der JavaScript Entwicklung vertrauten Konzepten. Im Beispiel 4 sehen Sie ein Beispiel für die Verwendung der "ES Modules" API. Für das Ausführen diese Beispiels genügt es nicht mehr, die Datei import.html direkt in einem Browser zu öffnen. Am einfachsten ist es einen lokalen Webserver mit dem SimpleHTTPServer Package von Python zu starten:

```
python -m SimpleHTTPServer 8000
```

Die Seite können Sie dann über die URL `http://localhost:8000/example4.html` laden und der Text "hello again" erscheint dann wie erwartet im Browser Fenster.


*Beispiel 4 - say-hello.js*
```JavaScript
export class SayHello extends HTMLelement {
    constructor() {
    super();
    let shadowRoot = this.attachShadow({mode: 'open'});
        shadowRoot.innerHTML = `<p>hello again</p>`;
    }
}

customElements.define('say-hello', SayHello);
```
*Beispiel 4 - import.html*
```HTML
<html>
    <head>
        <script type="module">
            import {SayHello} from '/say-hello.js';
        </script>
    </head>
    <body>
        <say-hello></say-hello>
    </body>
</html>

```

## HTML Templates

Die Spezifikation für "HTML Templates" beschäftigt sich mit der Fragstellung wie HTML-Code Fragmente von HTML definiert und wiederverwendet werden können. "HTML Templates" sind daher auch ohne Web-Components verwendbar und Web-Components können auch ohne "HTMl Templates" entwickelt werden. Die Verwendung von Templates erleichtert aber die Entwicklung von Web-Components und erlaubt die klare Trennung von Code und Markup.

In Beispiel 5 sehen Sie wie "HTMl Templates" verwendet werden. Das Beispiel zeigt darüberhinaus die Verwendung von "slots". Sie erlauben HTML-Fragmente anzugeben, die den entsprechend benannten Part im Template ersetzen. Bei der Ausführung von Beispiel 5 wird daher 
```HTML
<slot name="and-more"></slot>
``` 
durch 

```HTML
<div slot="and-more">
    ... and more
</div>
```

ersetzt.

*Beispiel 5 - import.html*
```HTML
<html>
<head>

 <template id="my-text">
        <p>hello again</p>
        <p style="color: red"><slot name="and-more"></slot></p>
 </template>

  <script>

  class SayHello extends HTMLElement {
    constructor() {
      super();
      const template = document.getElementById('my-text');
      const templateContent = template.content;
      this.attachShadow({mode: 'open'})
        .appendChild(templateContent.cloneNode(true)) 
    }
  }
  customElements.define('say-hello', SayHello);
  </script>

</head>

<body>
  <say-hello>
      <div slot="and-more">
          ... and more
      </div>
  </say-hello>
</body>

</html>
```

# Aus dem Leben einer Komponente

lorem ipsum

## Lifecycle

lorem ipsum

## Attribute

lorem ipsum

## Verwendung

lorem ipsum

# Web components in der freien Wildbahn

lorem ipsum

## Polymer

lorem ipsum

## LitElement

lorem ipsum

## stencil.js

lorem ipsum

## vaadin-core

lorem ipsum

## Angular components

lorem ipsum

## React

lorem ipsum



