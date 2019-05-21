# Das Projekt "FX" und die Integration von Micro-Frontends über Web-Components

Mit dem Projekt FX erstellt EOS eine neue zentrale Anwendung für die Inkassobearbeitung. 
FX besteht aus (zur Zeit) ca. 50 Self-Contained-Systems, die jeweils für eine bestimmte Fachlichkeit verantwortlich sind (z.B. Zahlungszuordnung, Buchhaltung, Ablaufsteuerung, Daten-Analyse, ...). 
Jedes Self-Contained-System hat eine unabhängige Datenhaltung (Postrgres, Mongo, Elastic Search, ...) und liefert die für den Aufruf der eigenen Services benötigten Oberflächen aus (Micro-Frontends).
Untereinander kommunizieren die Self-Contained-Systems asynchron über Kafka.

*Bild 1 - Das System FX*
<img src="https://cdn.jsdelivr.net/gh/owidder/jsArtikel@all20190521-02/images/fx.png"/>

Wir haben uns für Web-Components als Werkzeug zur Integration unserer Micro-Frontends entschieden. Dabei verwenden wir die Web-Compnents API, um bestehende React-Components zu "wrappen". Die anderen Micro-Frontends benutzen dann die Web-Component ohne zu wissen, dass im Hintergrund React seine Dienste versieht. Dieser Ansatz hat folgende Vorteile:
* einfache Integration im Frontend
* schlanke API
* Web-Standard
* Abhängigkeit zum verwendeten Framework (hier React) bleibt auf das einzelne Micro-Frontend beschränkt.

Wo Licht ist, ist natürlich auch Schatten. Auf die vorhandenen Nachteile werden wir genauer eingehen, wenn es um die Details der Micro-Frontend Integration in unserem Projekt geht.


# UI und Microservices

Microservices haben sich im Backend Bereich in vielen Projekten als erfolgreiches Architektur-Pattern etabliert. Im Frontend-Bereich tut man sich trotz Konzepten wie Self-Contained-Systems ungleich schwerer. Einer der Gründe dürfte sein, dass es schwierig ist aus einer Vielzahl einzelner Frontends (Micro-Frontends) eine Lösung mit einem einheitlichen Look-And-Feel und einer konsistenten User-Experience herzustellen. Aus diesem Grund gibt es auch verschiedene Ansätze, mit dieser Herausforderung umzugehen:

* Integration im Backend über vorhandene Mechanismen wie Server-Side-Includes
* Integration im Backend aber mit zusätzlicher Tool Unterstützung (https://www.mosaic9.org)
* Mono-Repo Ansatz (https://nx.dev)
* Integration im Frontend über Verlinkung (funktioniert am besten wenn jedes Micro-Frontend eine abgeschlossene Funktionalität aufweisen kann)
* Integration im Frontend über Web-Components

Bevor es an die Details unserer Verwendung vom Web-Components geht, lohnt es sich erst einmal zu klären, was Komponenten im Allgemeinen und Web-Components im Speziellen denn überhaupt sind. 

# Was sind Komponenten ?

1992 wurde Visual-Basic 2.0 von Microsoft der Öffentlichkeit präsentiert. Neben neuen Sprachfeatures für Objekt orientierte Programmierung, bot Visual-Basic  mit der VBX (Visual-Basic-Extension) Schnittstelle die Möglichkeit beliebige UI-Komponenten anderer Hersteller in eigenen Programme zu verwenden. 1995 zog dann Borland mit Delphi 1.0 und der Visual-Component Library nach. Java unternahm dann 1997 mit Swing und JavaBeans ebenfalls den Versuch an diese Erfolge anzuknüpfen. Mit allerdings eher mäßigem Erfolg, da sich im Gegensatz zu den Kompomenten-Modellen von Microsoft oder Borland eine eher begrenzte 3rd Party Unterstützung entwickelte. 

Die zunehmender Verbreitung des Web und Konzepten wie SPAs (Single-Page-Applications) sowie neuen Frameworks wie Angular oder React erlaubte es dann den Web-Entwicklern, die im Desktop-Umfeld bereits erfolgreiche Komponenten basierte Entwicklung für Web-Anwendungen zu verwenden.

Auch wenn diese Beispiele alle aus dem UI Umfeld stammen, muss es sich bei einer Komponente nicht unbedingt um eine UI-Komponente handeln. Grundlegende Voraussetzung für eine Komponente ist lediglich eine definierte Schnittstelle um verschiedene Komponenten verknüpfen und in eigene Anwendungen integrieren zu können.   

JavaScript Frameworks wie Angular oder React erfüllen zwar diese Voraussetzung, tun sich aber eher schwer damit Komponenten des anderen Frameworks zu verwenden.

Das ist umso erstaunlicher, da HTML seit langem zeigt, wie Komponenten definiert werden (über Tags) und wie die Schnittstelle aussehen muss (Verwendung von Attributen).

Aus diesem Grund wurde 2012 der erste Entwurf der Web-Components Spezifikation veröffentlicht, mit dem Ziel, die Verwendung von eigenen und wiederverwendbaren Tags zu standardisieren.

# Browser Support

Bevor es aber an die Details der Spezifikation geht, lohn sich ein kurzer Abstecher zu "Can I Use" (https://caniuse.com/#search=components) um zu prüfen, wie es um den Browser Support dieser Spezifikation bestellt ist. 

## Native

Benutzer von Firefox, Chrome und Safari  können sich freuen, da alle wichtigen Aspekte wie "Custom Elements", "Shadow Dom" und "HTML templates" unterstützt werden. Bei der Verwendung von Safari muss man lediglich mit einer kleinen Einschränkung leben, da nur  "Autonomous custom elements" aber keine "Customized built-in elements" verwendet werden können. Das bedeutet, dass in Safari zwar eigene Komponenten erstellt und verwendet werden können, die aber keine Möglichkeit bieten, Eigenschaften von bestehenden HTML-Elementen (wie z.B. von einem Button) wiederzuverwenden (http://bit.ly/customized-builtin-example).

IE und Edge, die Browser von Microsoft, bieten zum derzeitigen Zeitpunkt keine Unterstützung für Web-Components. Für die Zukunft ist aber auch hier Besserung zu erwarten. Die zukünftige Version von Edge wird auf Chromium, der Open-Source Variante von Chrome, aufbauen und damit dann ebenfalls die Web-Components Spezifikation vollständig unterstützen.

## Polyfill

Für neuere Browser, außer Microsoft Edge, sieht die Web-Components Unterstützung  gut aus, für alle anderen gibt es ein Polyfill. Nähere Informationen zu Verwendung und Installation finden Sie unter https://www.webcomponents.org/polyfills. Dieses Poylfill rüstet sowohl die "Custom Elements" API als auch die "Shadow DOM" API für ältere Browser nach. Bei der Verwendung der "Shadow DOM" API ist allerdings Vorsicht geboten, da es negative Auswirkungen auf die Render-Performanz einer Seite haben kann. 

# Was sind Web Components

Web-Components ist erst einmal nur eine Meta-Spezifikation für folgende Spezifikationen:

* Custom Elements
* Shadow Dom
* ES Modules
* HTML Templates

Wenn ein Browser diese APIs gemäß der Spezifikationen implementiert, können Sie eigene Elemente definieren und dieser als neue Tags in einer HTML-Seite verwenden. Eine einfache Deklaration einer "Web-Component" sehen Sie in Listing 1.

*Listing 1 - hello.html*
```HTML
<html>
<head>
    <script>
    class SayHello extends HTMLElement {
        constructor() {
            super();
            let shadowRoot = this.attachShadow({mode: 'open'});
            shadowRoot.innerHTML = `<style> p {background: red}</style>
                                    <p>hello again</p>`;
        }
    }
    customElements.define('say-hello', SayHello);
    </script>
</head>
<body>
    <say-hello></say-hello>
     <p>I'm not red</p>
</body>
</html>

```

Laden Sie diese Seite in einem Browser, der die nötigen APIs unterstützt, wird eine Seite mit dem Text "hello again" angezeigt. Die Erklärungen zu diesem Beispiel finden Sie in den folgenden Abschnitten über die einzelnen Bestandteile der Web-Components Spezifikation.

# Die APIs

Wie oben schon erwähnt besteht die Web-Components-Spezifikation aus mehreren APIs:

## Custom Elements

*Bild 2 - Dom-Tree mit Web-Component*
<img src="https://cdn.jsdelivr.net/gh/owidder/jsArtikel@all20190520-01/images/say-hello-dom.png"/>

Jeder Web-Entwickler, der eins der bekannten Frameworks wie Angular oder React verwendet hat, weiß, dass die sinnvolle Aufteilung einer Applikation in Komponenten die Entwicklung und Weiterentwicklung erheblich vereinfacht. Leider geht diese Struktur verloren, sobald die Inhalte einer Angular oder React Komponente in den Dom-Tree des Browsers eingefügt werden. Aus den sorgsam aufgebauten Komponenten bleibt dann nur noch eine Sammlung von HTML-Tags übrig, die - zumindest ohne den Einsatz spezieller Werkzeuge - insbesondere die Fehlersuche erschweren. Diese Komponenten-Struktur, auch im Dom-Tree des Browsers sichtbar zu machen, ist Aufgabe der *Custom-Elements*. 

In *Bild 2* sehen Sie wie die in *Beispiel 1* deklarierte Komponente als Tag `say-hello` im Inspector des Safari-Browsers angezeigt wird. Um dieses Verhalten zu erreichen sind zwei Dinge nötig:
* unsere Klasse muß von der Klasse `HTMLElement` erben
* über den Aufruf von `customElements.define` wird unserer Klasse ein HTML-Tag zugeordnet (`say-hello`).

Dass der Name unseres Tags einen Bindestricht enthält, ist dabei kein Zufall, sondern eine durch die Spezifikation vorgegeben Namenskonvention. Dadurch wird eine Namenskollision mit vorhandenen oder zukünftigen HTML-Tags vermieden. 

## Shadow Dom

Die Kapselung von HTML Code in einer Komponente löst aber nur ein Teil des Problems. Neben HTML gibt es ja auch noch CSS. Ursprünglich arbeiten CSS Selektoren über alle Elemente einer Seite. Das würde bedeuten, dass wir mit den Styling-Regeln unsere Komponente das umgebende Layout zerstören könnten. Das widerspricht ganz klar dem Konzept einer Komponente, unabhängig und wiederverwendbar zu sein. Aus diesem Grund wurde die *Shadow-Dom*-Spezifikation ins Leben gerufen. Diese Spezifikation erfüllt 2 Aufgaben:

* Style Informationen bleiben innerhalb der Komponente
* die interne Implementierung der Komponente ist nicht sichtbar

Die Verwendung des Shadow Dom sehen Sie in Beispiel 1 bei Aufruf von `this.attachShadow({mode: 'open'})`. Dieser Aufruf erzeugt für unsere Komponente einen eigenen lokalen Dom-Tree und beschränkt dadurch den Geltungsbereich der CSS-Regel. Das `p`-Tag nach dem `<say-hello>` ist daher nicht von der Änderung der Hintergrund Farbe betroffen. 

Der Parameter `{mode: 'open'}` sagt der API übrigens, dass wir auf das Verstecken der Implementierungsdetails verzichten.

Die Shadow-Dom-Spezifikation ist neben den Custom Elements der wichtigste Bestandteil der Web-Components-Spezifikation. Leider mussten wir im Laufe unseres Projekts feststellen, dass sie für unser Projekt mehr Probleme verursacht als löst. Das hat folgende Gründe:

* React Events und Shadow Dom vertragen sich nicht, da Reacts Event System keine Events von Custom Elements empfangen kann. Am Anfang haben wir das durch eine von uns gepatchte React Version umgangen, was es aber schwierig machte auf neue React Versionen zu migrieren. Das Problem ist heute noch nicht gelöst (http://bit.ly/react-shadow-dom)
* Um ein einheitliches Look-And-Feel über alle Micro-Frontends zu gewährleisten hatten wir uns sowieso für ein zentrales Stylesheet entschieden.

Aus diesen Gründen verzichten wir aktuell auf die Verwendung des Shadow Dom.

React ist übrigens nicht das einzige Framework, das Probleme im Umgang mit Web-Components hat. Eine aktuelle Übersicht zum Stand der Kompatibilität von verschiedenen Frameworks und Web-Components finden Sie unter https://custom-elements-everywhere.com.

## ES Modules

Die ES-Module-Spezifikation definiert ein API, die es erlaubt, JavaScript Dokumente in andere Java-Skript Dokumente einzubinden. Ursprünglich wurde über die HTML-Import-Spezifikation versucht diese Verhalten zu spezifizieren. Diese Spezifikation wurde aber von den Entwicklungen im JavaScript Umfeld überholt. Statt eigene Konzepte zu definieren, wie es die HTML-Import-Spezifikation versuchte bedienen sich ES Modules den aus der JavaScript Entwicklung vertrauten Konzepten. 

In Listing 2 und Listing 3 sehen Sie ein Beispiel für die Verwendung von ES Modules. Für das Ausführen dieses Beispiels genügt es nicht mehr, die Datei *import.html* direkt in einem Browser zu öffnen. Man benötigt einen einfachen lokalen Webserver, wie z.B. das *SimpleHTTPServer*-Package von Python:

```
python -m SimpleHTTPServer 8000
```

Die Seite können Sie dann über die URL http://localhost:8000/import.html laden und der Text "hello again" erscheint dann wie erwartet im Browser Fenster.

*Listing 2 - say-hello.js*
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
*Listing 3 - import.html*
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

Wahlweise können Sie das auch hier betrachten: [http://bit.ly/say-hello-example](http://bit.ly/say-hello-example)

## HTML Templates

Die Spezifikation für *HTML Templates* beschäftigt sich mit der Fragestellung wie HTML-Code Fragmente von HTML definiert und wiederverwendet werden können. HTML Templates sind daher auch ohne Web-Components verwendbar und Web-Components können auch ohne HTML Templates entwickelt werden. Die Verwendung von Templates erleichtert aber die Entwicklung von Web Components und erlaubt die klare Trennung von Code und Markup.

In Beispiel 3 sehen Sie wie "HTML Templates" verwendet werden. Das Beispiel zeigt darüberhinaus die Verwendung von sogenannten *Slots*. Sie erlauben es, HTML-Fragmente anzugeben, die den entsprechend benannten Part im Template ersetzen. Bei der Ausführung von Listing 4 wird daher 
```HTML
<slot name="and-more"></slot>
``` 
ersetzt durch 

```HTML
<div slot="and-more">
    ... and more
</div>
```


*Listimg 4 - import.html*
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

Wie man eine Komponente definiert und verwendet, haben Sie in den vorherigen Beispielen gesehen. In Beispiel 4, sehen Sie was man darüber hinaus mit Web-Components noch so alles anstellen kann. Dazu gehört:
* die Verwendung von Attributen, um Daten an die Komponente zu übertragen
* die Verwendung eines Listeners, um auf Ereignisse zu reagieren
* das Überschreiben von Methoden `observedAttributes` und `connectedCallback`, um die Komponente an die eigenen Bedürfnisse anzupassen.

Beim näheren Betrachten dieses Beispiels wird deutlich, dass die Custom Elements alles nötige zur Verfügung stellen, um eine wiederverwendbare Komponente zu erstellen. Allerdings ist dafür recht viel Code nötig und so elegant wie man es von React oder Angular gewohnt ist, sieht der Code auch nicht aus. 


*Listing 5 - listener.html*
```HTML
<html>
<head>
    <script>
    class SayHello extends HTMLElement {

        static get observedAttributes() {
            return ['text'];
        }

        get value() {
         return this.getAttribute('text');
        }

        set value(newValue) {
            this.setAttribute('text', newValue);
        }

        attributeChangedCallback(name, oldValue, newValue) {
           this.text.innerText = this.value;
        }
     
        connectedCallback() {
            this.button.addEventListener('click', () => this.value = 'changed');
        }

        constructor() {
            super();
            let shadowRoot = this.attachShadow({mode: 'open'});
            shadowRoot.innerHTML = `<p><span id="text"/>${this.value}</p>
                                    <button>click</button>`;
            this.button = this.shadowRoot.querySelector('button');
            this.text = this.shadowRoot.querySelector('span#text');
        }
    }
    customElements.define('say-hello', SayHello);
    </script>
</head>
<body>
    <say-hello text="another hello"></say-hello>
</body>
</html>
```

## Web Components aber einfach

Die direkte Benutzung der Web-Components-API ist für kleinere Aufgaben ausreichend. Auch für spezialisierte Aufgaben, wie die Integration von Micro-Frontends, sind die Custom Elements durchaus geeignet.
Wem die Spezifikationen des Web-Component-Standards zu rudimentär sind, kann inzwischen inzwischen auf Frameworks und Libraries zurückgreifen, die die Arbeit mit Web Components vereinfachen. 
Zu nennen ist vor allem *stencil.js* (https://stenciljs.com), von den Ionic Machern. Dieses Tool stellt einen Compiler zur Verfügung, der den stencil.js-Code direkt in die passenden Web-Components API Aufrufe übersetzt. Alternativen sind *LitElement* (https://lit-element.polymer-project.org) von Google oder SkateJS (https://skatejs.netlify.com).

# Integration von zwei Micro-Frontends über Custom Elements am konkreten Beispiel
Im Folgenden wollen wir konkret zeigen, wie wir Custom Elements zur Integration von Micro-Frontends im Projekt FX einsetzen. 
Das zeigen wir exemplarisch an einer kleinen Beispiel-Anwendung, die aus zwei Self-Contained-Systems besteht.

## Die Beispiel-Anwendung "StockPrice": Korrelation von Aktienkursen
Mit der aus zwei Micro-Frontends bestehenden Beispiel-Anwendung "StockPrice" kann man sich Charts erzeugen lassen, die die Aktienkurse (Jahre 2014 bis 2018) von zwei Firmen als Scatterplot inklusive Korrelationskoeffizienten darstellen:  

*Bild 3 - Die Oberfläche Anwendung "StockPrice"*
<img src="https://cdn.jsdelivr.net/gh/owidder/jsArtikel@ow20190515-01/oliver/correlationApp.png"/>

Dazu kann man in den beiden Automplete-Eingabefeldern am oberen Rand jeweils eine Firma (aus dem Dow Jones) eingeben. Hat man beide Firmen eingegeben, wird der Chart angezeigt. 
Live kann man die Anwendung hier sehen: http://bit.ly/stockprice-page

## Die Self-Contained-Systems "Company" und "StockHistory"
Die Anwendung "StockPrice" besteht aus den zwei Self-Contained-Systems "Company" und "StockHistory", deren Micro-Frontends auf einer Web-Seite mit Hilfe von Custom Elements integriert werden:
1. "Company": Stellt einen Service zur Verfügung, über den Namen und Abkürzungen aller Dow-Jones-Companies abgeholt werden können. Das Micro-Frontend ist ein Eingabefeld mit Autocompletion.
	Es kann über ein Custom Element mit Namen `select-company` eingebunden werden kann.
2. "StockHistory": Stellt einen Service zur Verfügung, über den die historischen Aktienkurse abgefragt werden können. Das Micro-Frontend ist der Scatterplot-Chart. 
	Er kann über ein Custom Element mit Namen `company-correlation` eingebunden werden.

Jedes Self-Contained-System liefert sein Micro-Frontend (JavaScript-File mit dem Code des Custom Elements) selber aus. 
So hostet z.B. das System "Company" das JavaScript-File `selectComponentElement.js`, das den Code für das Custom Element `select-company` enthält.
Jedes Custom Element greift wiederum nur auf Services des Self-Contained-Systems zu, von dem es ausgeliefert wurde.

Darüber hinaus existiert das System "StockPrice", das allerdings lediglich die Web-Seite ausliefert, die die Micro-Frontends von "Company" und "StockHistory" einbindet. (Genauso gut könnte aber auch "Company" oder "StockHistory" die Seite ausliefern)

*Bild 4 - Systeme und Micro-Frontends von der Anwendung "StockPrice"*
<img src="https://cdn.jsdelivr.net/gh/owidder/jsArtikel@ow20190520-01/oliver/StockPrice.png"/>

Wir gehen hier davon aus, dass alle Self-Contained-Systems hinter einem Reverse-Proxy unterhalb derselben Domain zu erreichen sind. Das ist für Anwendungen, die aus vielen Self-Contained-Systems bestehen nicht ungewöhnlich. 
	(So schließt man auch mögliche Probleme mit CORS-Einschränkungen des Browsers aus) 

## Das Micro-Frontend von "Company"
Das Self-Contained-System "Company" stellt einen Service mit Namen "companies" zur Verfügung. Er liefert Namen und Abkürzungen aller Firmen aus dem Dow Jones. Der Response sieht folgendermaßen aus:

```
[
   {"short":"MMM","full":"3M Company"},
   {"short":"AOS","full":"A.O. Smith Corp"},
   ...
]
```

Neben dem Service "companies" liefert das Self-Contained-System "Company" auch ein Micro-Frontend aus. Dieses Micro-Frontend (ein JavaScript-File) enthält ein Custom Element mit Namen `select-company`, das wiederum den Service "companies" aufruft. 

*Bild 5 - Das System "Company" mit Micro-Frontend*
<img src="https://cdn.jsdelivr.net/gh/owidder/jsArtikel@ow20190520-02/oliver/company.png"/>

`select-company` rendert sich als Eingabefeld mit Autocompletion-Funktionalität, über das eine Firma aus dem Dow Jones eingegeben werden kann.

*Bild 6 - Das Micro-Frontend `select-company`*
<img src="https://cdn.jsdelivr.net/gh/owidder/jsArtikel@ow20190516-02/oliver/selectCompany.png"/>

Verwenden kann man das Element z.B. so:

*Listing 6 - Verwendung von `select-company`*
```HTML
<select-company></select-company>
<div id="company"></div>
<script>
var element = document.querySelector("select-company");
element.onChangeCompany = function (company) {
	var companyDiv = document.querySelector("div#company");
	companyDiv.innerHTML = "Company = " + company.full + 
		" [" + company.short + "]";
}
</script>
```
Dem Custom Element `select-company` kann als Property `onChangeCompany` eine Callback-Function übergeben werden. Diese wird nach der Eingabe durch den Anwender mit dem entsprechenden Company-Object (z.B.: `{short: "AAPL", full: "Apple Inc."}`) aufgerufen.

Live kann man sich das Element hier ansehen: http://bit.ly/stockprice-company

## Das Custom Element "select-company"
Wie oben schon erwähnt, haben wir uns bei der Implementierung der Custom Elements an die folgenden Prinzipien gehalten:
* Kein Shadow-DOM
* Custom Elements sind nur schmale Wrapper: Die gesamte client-seitige Funktionalität eines Micro-Frontends befindet sich innerhalb einer React-Component (mit ihren Unter-Compenents)
* Ein Custom Element ruft nur Services von der Adresse auf, von der es ausgeliefert wurde

Mit diesen Prinzipien sieht die Implementierung (`SelectCompanyElement.tsx`) des Custom Elements `select-company` folgendermaßen aus:

*Listing 7 - `SelectCompanyElement.tsx`*
```
import * as React from "react";  
import * as ReactDOM from "react-dom";  
  
import {SelectCompany, Company} from "./SelectCompany";  
  
const scriptPath = document.currentScript.getAttribute("src");
const parts = scriptPath.split("/");  
const basedir = parts.slice(0, parts.length-1).join("/");
  
class SelectCompanyElement extends HTMLElement {  
  
    public onChangeCompany: (Company) => void;    
  
    connectedCallback() {  
        ReactDOM.render(<SelectCompany 
	        basedir={basedir} 
	        onChange={(company: Company) => 
		        {this.onChangeCompany(company)}}/>, this);  
    }    
}  
customElements.define("select-company", SelectCompanyElement);
```
* `SelectCompany` ist die React-Component, in der sich die eigentliche Funktionalität des Micro-Frontends befindet
* `Company` ist ein einfaches Interface, das die Daten beschreibt, wie sie vom Service "companies" kommen:
	```
	export interface Company {  
	    short: string;  
	    full: string;  
	}
	```
* Gemäß dem Prinzip, dass alle Funktionalität in der Rect-Component liegt, findet auch der Aufruf des Service "companies" innerhalb der React-Component statt. Darum geben wir der React-Component über die Property `basedir` die Adresse mit, von der aus der Code des Custom Elements ausgeliefert wurde. Denn dort kann die React-Component auch den Service finden. 
	Diese Adresse holen wir uns über: 
	```
	const scriptPath = 
		document.currentScript.getAttribute("src")
	```
	und schnibbeln dann einfach das letzte Pfad-Element (den Namen des JavaScript-Files) weg:
	```
	const parts = scriptPath.split("/");  
	const basedir = 
		parts.slice(0, parts.length-1).join("/");
	```
* Wie schon erwähnt verwenden wir keinen Shadow Dom, sondern rendern die Dom-Elemente des Custom Elements direkt in den den Main-Dom. Das sollte man aber nicht im Constructor des Custom Elements tun sondern in der `connectedCallback`-Lifecycle-Methode. 
	Dort rendern wir die React-Component:
	```
    connectedCallback() {  
        ReactDOM.render(<SelectCompany 
	        basedir={basedir} 
	        onChange={(company: Company) => 
		        {this.onChangeCompany(company)}}/>, this);  
    }    
	```
	Als Container-DOM-Element (zweiter Parameter der `ReactDOM.render()`-Methode) übergeben wir einfach `this`. Innerhalb der `connectedCallback`-Methode repräsentiert `this` das Root-Element des Custom Elements.
	
	Als `onChange`-Property übergeben wir eine Lambda-Function, die wiederum die Callback-Function aufruft, die dem Custom Element über die `onChangeCompany`-Property übergeben wurde.

## Die React-Component "SelectCompany"

Die React-Component `SelectCompany` enthält die eigentliche Funktionalität des Micro-Frontends:

```
import * as React from "react";  
import * as _ from "lodash";  
import {AutoComplete} from "antd";  
  
export interface Company {  
    short: string;  
    full: string;  
}  
  
interface Props {  
    initialShort?: string;  
    onChange: (company: Company)  => void;  
    basedir: string;  
}  
  
interface State {  
    companies: Company[];  
    data: string[];  
    value?: string;  
}  
  
export class SelectCompany extends React.Component<Props, State> {  
  
    readonly state: State = {data: [], companies: []};  
  
    handleSearch(value: string) {  
        const data = _.uniq(this.state.companies.map(
	        company => company.full).filter(full => 
		        full.toLowerCase().indexOf(value.toLowerCase()) > -1));  
        this.setState({data, value})  
    }  
  
    handleSelect(full: string) {  
        const selectedCompany = this.state.companies.find(
	        s => (s.full == full));  
        this.props.onChange(selectedCompany);  
        this.setState({value: full})  
    }  
  
    async componentDidMount() {  
        const companies = await fetch(
		        `${this.props.basedir}/../../service/companies`
	        ).then(resp => resp.json());  
        this.setState({companies});  
    }  
  
    render() {  
        return <div className="input-field">  
            <AutoComplete  
	            dataSource={this.state.data} 
	            onSearch={(text) => this.handleSearch(text)} 
	            onSelect={(value: string) => this.handleSelect(value)}
	            value={this.state.value}
	            placeholder="Enter company"/>  
        </div>  
    }  
}
```

* Als Eingabefeld verwenden wir `AutoComplete` aus der Bibliothek *Ant Design* (siehe [https://ant.design/](https://ant.design/))
* Nachdem sich die React-Component zum ersten Mal gerendert hat, wird in der React-Lifecycle-Methode `componentDidMount()` der Service "companies" aufgerufen. Das vom Service zurück gelieferte Array mit Namen und Abkürzungen des Companies wird in den State der React-Component gelegt, so dass das Eingabefeld erneut gerendert wird.
* In `handleSearch()` werden aus den vom Service geladenen Company-Namen, diejenigen gefiltert, die dem eingegebene Teilstring entsprechen, so dass `AutoComplete` eine Vorschlagsliste anzeigen kann.
* `handleSelect()` wird aufgerufen, wenn eine Company ausgewählt worden ist. Hier wird die vom Custom Element über die Property `onChange` übergebene Callback-Function  aufgerufen.

## Webpack

Mit folgender Webpack-Konfiguration lassen sich nun Custom Element und React-Component in eine JavaScript-File mit Namen `selectCompanyElement.js` packen, so dass es von der integrierenden Anwendung (hier "StockPrice") verwendet werden kann:

```
module.exports = {  
    mode: process.env.NODE_ENV,  
    entry: {  
        selectCompanyElement: "./src/SelectCompanyElement.tsx"  
  },  
    output: {  
        filename: "build/[name].js",  
    },  
    devtool: "source-map",  
    module: {  
        rules: [{test: /\.(ts|tsx)$/, use: "ts-loader"}]  
    },  
    resolve: {  
        extensions: [".tsx", ".ts", ".js"]  
    }  
}
```
Nach dem Aufruf von Webpack liegt im Verzeichnis `build` ein File mit Namen `selectCompanyElement.js`.

## Das Custom Element "company-correlation"

Die über die zwei Custom Elements `<select-company/>` ausgewählten Companies, können nun dem Custom Element `<company-correlation/>` - das Micro-Frontend des Self-Contained-Systems "StockHistory" - übergeben werden. 
Dazu hat `<company-correlation/>` die zwei Attribute `short-x` und `short-y`.
Über `short-x` kann man die Abkürzung der Company übergeben, die auf der X-Achse angezeigt werden soll. Analog übergibt man über `short-y` die Abkürzung der Firma, die auf der Y-Achse angezeigt werden soll. Vereinfacht sieht der Code der Gesamt-Anwendung "StockPrice" wie folgt aus:

```
<head>
<script src="./company/build/selectCompanyElement.js"></script>  
<script src="./stockHistory/build/companyCorrelationElement.js"></script>
</head>

<body>
<select-company id="selectCompany1"></select-company>
<select-company id="selectCompany2"></select-company>
<company-correlation id="companyCorrelation"></company-correlation>

<script>
document.getElementById("selectCompany1").onChangeCompany = 
	function(company) {
		document.getElementById("companyCorrelation")
			.setAttribute("short-y", company.short);
	}
document.getElementById("selectCompany2").onChangeCompany = 
	function(company) {
		document.getElementById("companyCorrelation")
			.setAttribute("short-x", company.short);
	}
</script>
</body>
```

Im Gegensatz zu `<select-company/>` besitzt `<company-correlation/>` Attribute, die sich auch mehrfach ändern können. Dafür müssen wir im Custom Element die Lifecycle-Methode `attributeChangedCallback()` implementieren:

```
class CompanyCorrelationElement extends HTMLElement {  
  
    static get observedAttributes() {  
        return ["short-x", "short-y"];  
    }  
  
    drawReactComponent() {  
        ReactDOM.render(<CompanyCorrelation
	        basedir={basedir}
		    shortX={this.getAttribute("short-x")}
		    shortY={this.getAttribute("short-y")}/>, this);  
    }  
  
    attributeChangedCallback() {  
        this.drawReactComponent();  
    }  
  
    connectedCallback() {  
        this.drawReactComponent();  
    }  
}  
  
customElements.define("company-correlation", 
	CompanyCorrelationElement);
```

* Über `static get observedAttributes()` teilen wir der Custom-Element-API mit, für welche Attribute wir uns interessieren und über Änderungen informiert werden wollen. Mit jeder Änderung eines Attributes wird dann `attributeChangedCallback()` aufgerufen.
* Im Sinne unseres Small-Wrapper-Principles tun wir in `attributeChangedCallback()` nichts weiter, als die React-Component mit den neuen Properties erneut zu rendern.

## Die React-Component "CompanyCorrelation"

Das Custom Element `<company-correlation/>` gibt die Attribute `short-x` und `short-y` an die React-Component als Properties `shortX` bzw. `shortY` weiter. Diese lädt bei jeder Änderung ihrer Properties (React-Lifecycle-Methode `componentDidUpdate()`) die historischen Kursdaten der jeweilige Company über einen Service-Call vom System "StockHistory":

<img src="https://cdn.jsdelivr.net/gh/owidder/jsArtikel@ow20190520-03/oliver/companyCorrelation.png"/>

Die Kursdaten werden dann im State der React-Component abgelegt:

```
export interface EndOfDayPrice {  
    date: string;  
    price: number;  
}

interface Props {  
    shortX: string;  
    shortY: string;  
    basedir: string;  
}  
  
interface State {  
    pricesX: EndOfDayPrice[];  
    pricesY: EndOfDayPrice[];  
}

export class CompanyCorrelation extends
	React.Component<Props, State> {  
  
    readonly state: State = {pricesX: [], pricesY: []}

	async loadData(symbol: string): Promise<EndOfDayPrice[]> {  
	    const response = await 
		    fetch(`${this.props.basedir}/../../service/${symbol}`);  
	    return await response.json();  
	}  
  
	async componentDidUpdate() {  
        const pricesX = await this.loadData(this.props.shortX);  
        const pricesY = await this.loadData(this.props.shortY);  
        this.setState({pricesX, pricesY});  
    }  
    ...

	render() {
		...
	}
}
```

Der komplette Code der React-Component `CompanyCorrelation` ist etwas komplexer. Der Einfachheit wegen soll er hier nicht im Einzelnen gezeigt werden. Interessierte finden den Code unter [http://bit.ly/companyCorrelation](http://bit.ly/companyCorrelation).

## Fazit

Unsere Erfahrungen mit Custom Elements für die Integration von Micro-Frontends waren weitestgehend positiv. Dennoch hat jede Münze (mindestens) zwei Seiten:

Vorteile:
* Komplett unabhängiges Deployment: Da die Custom Elements erst zur Laufzeit geladen werden, kann ein Self-Contained-System seine Micro-Frontends ändern und neu deployen, ohne dass eines der Systeme, die das Micro-Frontend einbinden, neu deployt werden muss. 
* Einfache Schnittstellen: Das nutzende System 'unterhält' sich mit dem Micro-Frontend in den meisten Fällen nur über die Properties des Custom Elements. (Falls das Micro-Frontend jedoch auch Informationen zurück liefern soll, wie z.B. bei `<select-company/>` benötigt man als komplexere Schnittstelle eine Callback-Function)

Nachteile:
* Seiten, die viele Micro-Frontends einbinden, müssen von vielen System JavaScript-Files laden
* Zusätzliche Komplexität durch Custom Elements
* Werden Micro-Frontends mehrfach eingebunden, werden ggf. mehrfach identischen Server-Calls ausgeführt
	* Z.B. führen die beiden Custom Elements `<select-company/>` auf der StockPrice-Page zweimal den gleichen Aufruf des Service "companies" aus. Dies kann man verhindern, was aber zu zusätzlicher Komplexität führt.

<!--stackedit_data:
eyJoaXN0b3J5IjpbLTI5NTYyMzEwLC0xMDU2Mzc5NTI3LC0xOT
g4MTQwNDIsLTE2MTkwMzY3OTgsLTE1NTE5NTAxNjcsLTU1NTQx
NzcyOCwzOTEyNjk4NzBdfQ==
-->