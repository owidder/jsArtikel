# Integration von Micro-Frontends über Web Components im Projekt *FX*

Mit dem Projekt *FX* erstellt die Otto-Tochter *EOS* eine neue zentrale Anwendung für die Inkassobearbeitung. 
FX besteht aus (zur Zeit) ca. 50 Self-Contained-Systems, die jeweils für eine bestimmte Fachlichkeit verantwortlich sind (z.B. Zahlungszuordnung, Buchhaltung, Ablaufsteuerung oder Daten-Analyse). 
Jedes Self-Contained-System hat eine unabhängige Datenhaltung (PostrgreSQL, MongoDB, Elastic Search, ...) und
jedes Self-Contained-System liefert die für den Aufruf der eigenen Services benötigten Oberflächen (Micro-Frontends) selbst aus.
Die Kommunikation innerhalb eines Self-Contained-Systems, also vom Micro-Frontend zum Backend, findet über eine Rest-API statt. Die Kommunikation zwischen Self-Contained-Systems findet ausschließlich asynchron über Kafka statt.

*Bild 1 - Das System FX*
<img src="https://cdn.jsdelivr.net/gh/owidder/jsArtikel@all20190611-01/images/fx.png"/>

Im Projekt *FX* haben wir uns für Web Components als Werkzeug zur Integration unserer Micro-Frontends entschieden. Dabei verwenden wir die Web-Components-API, um bestehende React Components zu "wrappen". Die einzelnen Self-Contained-Systems benutzen dann lediglich die  Web-Component ohne zu wissen, dass im Hintergrund React seine Dienste versieht. Dieser Ansatz bietet folgende Vorteile:
* einfache Integration im Frontend
* schlanke API
* Web-Standard
* Abhängigkeit zum verwendeten Framework (hier React) bleibt auf das einzelne Micro-Frontend beschränkt.

# UI und Microservices

Microservices haben sich im Backend-Bereich in vielen Projekten als  Architektur-Muster etabliert. Im Frontend-Bereich tut man sich trotz Konzepten wie Self-Contained-Systems ungleich schwerer. Einer der Gründe dürfte sein, dass es schwierig ist, aus einer Vielzahl einzelner Frontends (Micro-Frontends) eine Lösung mit einem einheitlichen Look-And-Feel und einer konsistenten User-Experience herzustellen. Deswegen gibt es verschiedene Ansätze, mit dieser Herausforderung umzugehen:

* Integration im Backend über Mechanismen wie Server-Side-Includes
* Integration im Backend, aber mit Tool Unterstützung (https://www.mosaic9.org)
* Mono-Repo Ansatz (https://nx.dev)
* Integration im Frontend über Verlinkung (funktioniert am besten wenn jedes Micro-Frontend eine abgeschlossene Funktionalität aufweisen kann)
* Integration im Frontend über Web-Components

Bevor es an die Details unserer Verwendung von Web-Components geht, lohnt es sich zu klären, was Komponenten im Allgemeinen und Web-Components im Speziellen sind. 

# Was sind Komponenten?

1992 wurde Visual-Basic 2.0 von Microsoft der Öffentlichkeit präsentiert. Neben neuen Sprachfeatures für objekt-orientierte Programmierung bot Visual-Basic mit der VBX (Visual-Basic-Extension) Schnittstelle zum esrten mal die Möglichkeit, beliebige UI-Komponenten anderer Hersteller zu verwenden.  

Die zunehmende Verbreitung des Web und die Entwicklung neuer Konzepte wie SPAs (Single-Page-Applications) und Frameworks wie Angular oder React erlaubte es dann auch den Web-Entwicklern, die im Desktop-Umfeld erfolgreiche Komponenten basierte Entwicklung für Web-Anwendungen zu verwenden.

Auch wenn diese Beispiele alle aus dem UI Umfeld stammen, muss es sich bei einer Komponente nicht unbedingt um eine UI-Komponente handeln. Grundlegende Voraussetzung für eine Komponente ist eine definierte Schnittstelle um verschiedene Komponenten zu verknüpfen und in eigene Anwendungen integrieren zu können.   

JavaScript Frameworks wie Angular oder React erfüllen diese Voraussetzung, tun sich aber schwer damit, Komponenten des jeweils anderen Frameworks zu verwenden.

Das ist umso erstaunlicher, da HTML seit langem zeigt, wie Komponenten definiert werden (über Tags) und wie die Schnittstelle aussehen muss (Verwendung von Attributen).

Aus diesem Grund wurde 2012 die Web-Components Spezifikation veröffentlicht, mit dem Ziel, die Verwendung von eigenen und wiederverwendbaren Tags zu standardisieren.

# Browser Support

Bevor es an die Details der Spezifikation geht, lohnt sich ein kurzer Abstecher zu "Can I Use" (https://caniuse.com/#search=components), um zu prüfen, wie es um den Browser Support dieser Spezifikation bestellt ist. 

## Native

Benutzer von Firefox, Chrome und Safari können sich freuen, da alle wichtigen Aspekte wie *Custom Elements*, *Shadow Dom* und *HTML Templates* unterstützt werden. 
Bei der Verwendung von Safari muss man lediglich mit einer kleinen Einschränkung leben, da nur  "Autonomous custom elements" aber keine "Customized built-in elements" verwendet werden können. Das bedeutet, dass in Safari zwar eigene Komponenten erstellt und verwendet werden können, die aber keine Möglichkeit bieten, Eigenschaften von bestehenden HTML-Elementen (wie z.B. von einem Button) wiederzuverwenden (http://bit.ly/customized-builtin-example).

IE und Edge, die Browser von Microsoft, bieten zum derzeitigen Zeitpunkt keine Unterstützung für Web-Components. Für die Zukunft ist hier Besserung zu erwarten. Die zukünftige Version von Edge wird auf Chromium, der Open-Source Variante von Chrome, aufbauen und dann ebenfalls die Web-Components Spezifikation vollständig unterstützen.

## Polyfill

Für neuere Browser, außer Microsoft Edge, sieht die Web-Components Unterstützung also gut aus, für alle anderen gibt es ein Polyfill. Nähere Informationen zu Verwendung und Installation finden Sie unter https://www.webcomponents.org/polyfills. Dieses Poylfill rüstet sowohl die Custom-Elements-API als auch die Shadow-Dom-API für ältere Browser nach. Bei der Verwendung der Shadow-Dom-API des Polyfills ist allerdings Vorsicht geboten, da es negative Auswirkungen auf die Render-Performanz einer Seite haben kann. 

# Was sind Web Components?

Web Components sind erst einmal nur eine Meta-Spezifikation für folgende Spezifikationen:

* Custom Elements
* Shadow Dom
* ES Modules
* HTML Templates

Wenn ein Browser zumindest die ersten beiden APIs gemäß der Spezifikationen implementiert, können Sie eigene Elemente definieren, mit Hilfe des Shadow-DOMs kapseln und diese Komponenten als neue Tags in einer HTML-Seite verwenden. Eine einfache Web Component sehen Sie in Listing 1.

*Listing 1 - hello.html*
```HTML
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
...
<say-hello></say-hello>
<p>I'm not red</p>
```

Laden Sie diese Seite in einem Browser, der die nötigen APIs unterstützt, wird eine Seite mit dem Text "hello again" angezeigt (http://bit.ly/hello-example). 
Die Erklärungen zu diesem Beispiel finden Sie in den folgenden Abschnitten über die  Bestandteile der Web-Components Spezifikation.

# Die APIs

Wie oben schon erwähnt besteht die Web-Components-Spezifikation aus mehreren APIs:

## Custom Elements

Jeder Web-Entwickler, der eins der bekannten Frameworks wie Angular oder React verwendet hat, weiß, dass die sinnvolle Aufteilung einer Applikation in Komponenten die Entwicklung und Weiterentwicklung vereinfacht. Leider geht diese Struktur verloren, sobald die Inhalte einer Angular oder React Komponente in den Dom-Tree des Browsers eingefügt werden. Aus den sorgsam aufgebauten Komponenten bleibt dann nur noch eine Sammlung von HTML-Tags übrig, die - zumindest ohne spezielle Werkzeuge - die Fehlersuche erschweren. Diese Komponenten-Struktur, auch im Dom-Tree des Browsers sichtbar zu machen, ist Aufgabe der *Custom-Elements*. 

In *Bild 2* sehen Sie wie die in *Beispiel 1* deklarierte Komponente als Tag `say-hello` im Inspector des Safari-Browsers angezeigt wird. 

*Bild 2 - Dom-Tree mit Web-Component*
<img src="https://cdn.jsdelivr.net/gh/owidder/jsArtikel@all20190611-01/images/say-hello-dom.png"/>

Um dieses Verhalten zu erreichen sind zwei Dinge nötig:
* unsere Klasse muss von der Klasse `HTMLElement` erben
* über den Aufruf von `customElements.define` wird unserer Klasse ein HTML-Tag zugeordnet (`say-hello`).

Dass der Name unseres Tags einen Bindestrich enthält, ist dabei kein Zufall, sondern eine durch die Spezifikation vorgegeben Namenskonvention. Hiermit wird eine Namenskollision mit vorhandenen oder zukünftigen HTML-Tags vermieden. 

## Shadow Dom

Die Kapselung von HTML Code in einer Komponente löst aber nur ein Teil des Problems. Neben HTML gibt es auch noch CSS. Ursprünglich arbeiten CSS Selektoren über alle Elemente einer Seite. Das würde bedeuten, dass wir mit den Styling-Regeln unsere Komponente das umgebende Layout zerstören könnten. Das widerspricht dem Konzept einer Komponente, unabhängig und wiederverwendbar zu sein. Aus diesem Grund gibt es die *Shadow-Dom*-Spezifikation. Diese Spezifikation erfüllt 2 Aufgaben:

* Style Informationen bleiben innerhalb der Komponente
* die Implementierung der Komponente ist nicht sichtbar

Die Verwendung des Shadow Dom sehen Sie in Beispiel 1 bei Aufruf von `this.attachShadow({mode: 'open'})`. Dieser Aufruf erzeugt für unsere Komponente einen eigenen lokalen Dom-Tree und beschränkt dadurch den Geltungsbereich der CSS-Regel. Das `p`-Tag nach dem `<say-hello>` ist daher nicht von der Änderung der Hintergrund Farbe betroffen. 

Der Parameter `{mode: 'open'}` sagt der API übrigens, dass wir auf das Verstecken der Implementierungsdetails verzichten.

Die Shadow-Dom-Spezifikation ist neben den Custom Elements der wichtigste Bestandteil der Web-Components-Spezifikation. Leider mussten wir im Laufe unseres Projekts feststellen, dass sie für unser Projekt mehr Probleme verursacht als löst. Das hat folgende Gründe:

* React Events und Shadow Dom vertragen sich nicht, da Reacts Event System keine Events von Custom Elements empfangen kann. Am Anfang haben wir das durch eine von uns modifizierte React Version gelöst, was es aber schwierig machte auf neue React Versionen zu migrieren. Das Problem ist heute noch nicht gelöst (http://bit.ly/react-shadow-dom)
* Um ein einheitliches Look-And-Feel zu gewährleisten hatten wir uns sowieso für ein zentrales Stylesheet entschieden.

Aus diesen Gründen verzichten wir aktuell auf die Verwendung des Shadow Dom.

React ist übrigens nicht das einzige Framework, das Probleme im Umgang mit Web-Components hat. Eine aktuelle Übersicht zum Stand der Kompatibilität von verschiedenen Frameworks und Web-Components finden Sie unter https://custom-elements-everywhere.com.

## ES Modules

Die ES-Module-Spezifikation definiert ein API, die es erlaubt, JavaScript Dokumente in andere Java-Skript Dokumente einzubinden. Ursprünglich wurde über die HTML-Import-Spezifikation versucht, dies zu spezifizieren. Diese Spezifikation wurde aber von den Entwicklungen im JavaScript Umfeld eingeholt. Statt eigene Konzepte zu definieren, wie es die HTML-Import-Spezifikation versuchte, bedienen sich ES Modules  bekannten JavaScript Konzepten. 

In Listing 2 und Listing 3 sehen Sie ein Beispiel für die Verwendung von ES Modules. Für das Ausführen dieses Beispiels genügt es nicht, die Datei *import.html* direkt in einem Browser zu öffnen. Man benötigt einen einfachen lokalen Webserver, wie z.B. das *SimpleHTTPServer*-Package von Python.


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
<script type="module">
    import {SayHello} from '/say-hello.js';
</script>
<say-hello></say-hello>
```

Wahlweise können Sie das Beispiel auch hier betrachten: [http://bit.ly/say-hello-example](http://bit.ly/say-hello-example)

## HTML Templates

Die Spezifikation für *HTML Templates* beschäftigt sich mit der Fragestellung wie HTML-Code Fragmente definiert und wiederverwendet werden können. HTML Templates sind daher auch ohne Web-Components verwendbar und Web Components können auch ohne HTML Templates entwickelt werden. Die Verwendung von Templates erleichtert aber die Erstellung von Web Components und erlaubt die klare Trennung von Code und Markup.

In Listing 4 sehen in einem Ausschnitt wie "HTML Templates" verwendet werden können. 

*Listing 4 - import.html*
```HTML
...
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

...

</script>

```

# Integration von zwei Micro-Frontends über Custom Elements am konkreten Beispiel
Im Folgenden wollen wir zeigen, wie wir Custom Elements zur Integration von Micro-Frontends im Projekt FX einsetzen. 
Das zeigen wir exemplarisch an einer kleinen Beispiel-Anwendung, die aus zwei Self-Contained-Systems besteht.
(Alle Listings kann man hier sehen: [https://github.com/owidder/stockPriceCorrelation](https://github.com/owidder/stockPriceCorrelation))

## Die Beispiel-Anwendung "StockPrice": Korrelation von Aktienkursen
Mit der aus zwei Micro-Frontends bestehenden Beispiel-Anwendung "StockPrice" kann man sich Charts erzeugen lassen, die Aktienkurse (Jahre 2014 bis 2018) von zwei Firmen als Scatterplot inklusive Korrelationskoeffizienten darstellen:  

*Bild 3 - Die Oberfläche der Anwendung "StockPrice"*
<img src="https://cdn.jsdelivr.net/gh/owidder/jsArtikel@all20190611-01/oliver/correlationApp.png"/>

Dazu kann man in den beiden Autocomplete-Eingabefeldern am oberen Rand jeweils eine Firma (aus dem Dow Jones) eingeben. 
Live kann man die Anwendung hier sehen: http://bit.ly/stockprice-page

## Die Self-Contained-Systems "Company" und "StockHistory"
Die Anwendung "StockPrice" besteht aus den zwei Self-Contained-Systems "Company" und "StockHistory", deren Micro-Frontends auf einer Web-Seite mit Hilfe von Custom Elements integriert werden:
1. "Company": Stellt einen Service zur Verfügung, über den Namen und Abkürzungen aller Dow-Jones-Companies abgeholt werden können. Das Micro-Frontend ist ein Eingabefeld mit Autocompletion.
	Es kann über ein Custom Element mit Namen `select-company` eingebunden werden.
2. "StockHistory": Stellt einen Service zur Verfügung, über den die historischen Aktienkurse abgefragt werden können. Das Micro-Frontend ist der Scatterplot-Chart. 
	Er kann über ein Custom Element mit Namen `company-correlation` eingebunden werden.

Jedes Self-Contained-System liefert sein Micro-Frontend (JavaScript-File mit dem Code des Custom Elements) selber aus. 
So hostet z.B. das System "Company" das JavaScript-File `selectComponentElement.js`, das den Code für das Custom Element `select-company` enthält.
Jedes Custom Element greift wiederum nur auf Services des Self-Contained-Systems zu, von dem es ausgeliefert wurde.

*Bild 4 - Systeme und Micro-Frontends von der Anwendung "StockPrice"*
<img src="https://cdn.jsdelivr.net/gh/owidder/jsArtikel@all20190612-01/oliver/StockPrice.png"/> 

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
<img src="https://cdn.jsdelivr.net/gh/owidder/jsArtikel@all20190611-01/oliver/company.png"/>

`select-company` rendert sich als Eingabefeld mit Autocompletion-Funktionalität, über das eine Firma aus dem Dow Jones eingegeben werden kann.

*Bild 6 - Das Micro-Frontend `select-company`*

<img src="https://cdn.jsdelivr.net/gh/owidder/jsArtikel@all20190611-01/oliver/selectCompany.png"/>

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
* Custom Elements sind nur schmale Wrapper: Die gesamte client-seitige Funktionalität eines Micro-Frontends befindet sich innerhalb einer React-Component (mit ihren Unter-Components)
* Ein Custom Element ruft nur Services von der Adresse auf, von der es ausgeliefert wurde

Mit diesen Prinzipien sieht die Implementierung (`SelectCompanyElement.tsx`) des Custom Elements `select-company` folgendermaßen aus:

*Listing 7 - Custom Element `SelectCompanyElement.tsx`*
```JavaScript
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
* Gemäß dem Prinzip, dass alle Funktionalität in der React-Component liegt, soll auch der Aufruf des Service "companies" innerhalb der React-Component stattfinden. Darum geben wir der React-Component über die Property `basedir` die Adresse des Proxies mit, da von dort der Code des Custom Elements ausgeliefert wurde. Denn über diese Adresse kann die React-Component dann auch den Service aurufen. 
	Diese Adresse holen wir uns über: 
	```JavaScript
	const scriptPath = 
		document.currentScript.getAttribute("src")
	```
	und schnibbeln dann einfach das letzte Pfad-Element (den Namen des JavaScript-Files) weg:
	```JavaScript
	const parts = scriptPath.split("/");  
	const basedir = 
		parts.slice(0, parts.length-1).join("/");
	```
* In der `connectedCallback`-Lifecycle-Methode rendern wir die React-Component.
	Als `onChange`-Property übergeben wir eine Lambda-Function, die wiederum die Callback-Function aufruft, die dem Custom Element über die `onChangeCompany`-Property übergeben wurde.

## Die React Component "SelectCompany"

Die React Component `SelectCompany` enthält die eigentliche Funktionalität des Micro-Frontends:

*Listing 8 - React Component `SelectCompany.tsx`*
```JavaScript
import {AutoComplete} from "antd";  
  
export class SelectCompany extends React.Component {  
  
	...
	
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
	            onSearch={...} 
	            onSelect={...}
	            value={this.state.value}
	            placeholder="Enter company"/>  
        </div>  
    }  
}
```

* Als Eingabefeld verwenden wir `AutoComplete` aus der Bibliothek *Ant Design* (https://ant.design)
* Nachdem sich die React-Component zum ersten Mal gerendert hat, wird in der React-Lifecycle-Methode `componentDidMount()` der Service "companies" aufgerufen. 
* In `handleSearch()` werden aus den vom Service geladenen Company-Namen diejenigen gefiltert, die dem eingegebenen Teilstring entsprechen, so dass `AutoComplete` eine Vorschlagsliste anzeigen kann.
* `handleSelect()` wird aufgerufen, wenn eine Company ausgewählt worden ist. Hier wird die vom Custom Element über die Property `onChange` übergebene Callback-Function  aufgerufen.

## Das Custom Element "company-correlation"

Die über die zwei `select-company`-Custom-Elements  ausgewählten Companies, können nun dem Custom Element `company-correlation` - das Micro-Frontend des Self-Contained-Systems "StockHistory" - übergeben werden. 
Dazu hat `company-correlation` die zwei Attribute `short-x` und `short-y`.
Über `short-x` und `short-y` kann man die Abkürzung der Companies übergeben, die auf der X-Achse bzw. Y-Achse angezeigt werden sollen. :

*Listing 9 - Die Web-Seite von "StockPrice"*
```JavaScript
<script src="./company/build/selectCompanyElement.js"></script>  
<script src="./stockHistory/build/companyCorrelationElement.js"></script>

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
```

Im Gegensatz zu `select-company` besitzt `company-correlation` Attribute, die sich auch mehrfach ändern können. Dafür müssen wir im Custom Element die Lifecycle-Methode `attributeChangedCallback()` implementieren:

*Listing 10 - Custom Element `CompanyCorrelation.tsx`*
```JavaScript
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

Das Custom Element `company-correlation` gibt die Attribute `short-x` und `short-y` an die React Component `CompanyCorrelation` als Properties `shortX` bzw. `shortY` weiter. Diese lädt bei jeder Änderung ihrer Properties (React-Lifecycle-Methode `componentDidUpdate()`) die historischen Kursdaten der jeweilige Company über einen Service-Call vom System "StockHistory":

*Bild 7 - Das System "StockPrice" mit Micro-Frontend*
<img src="https://cdn.jsdelivr.net/gh/owidder/jsArtikel@all20190611-01/oliver/companyCorrelation.png"/>

Den Code findet man hier: http://bit.ly/companyCorrelation.

## Fazit

Unsere Erfahrungen mit Custom Elements für die Integration von Micro-Frontends waren weitestgehend positiv. Dennoch hat jede Münze (mindestens) zwei Seiten:

Nachteile:
* Seiten, die viele Micro-Frontends einbinden, müssen von vielen Systemen JavaScript-Files laden.
* Entwicklungsprozess ist schwieriger, da während der Entwicklung des eigenen Frontends, auf die Web-Components anderer Systemen zugegriffen werden muß.
* Der Build-Prozess ist aufwendiger.
* Zusätzliche Komplexität durch die Verwendung von Custom Elements.

Vorteile:
* Komplett unabhängiges Deployment: Da die Custom Elements erst zur Laufzeit geladen werden, kann ein Self-Contained-System seine Micro-Frontends ändern und neu deployen, ohne dass eines der Systeme, die das Micro-Frontend einbinden, neu gebaut und deployt werden muss.
* Es ist unkompliziert auch komplexe fachliche Komponenten in verschiedenen Self-Contained-Systems wiederzuverwenden. 
* Einfache Schnittstellen: Das nutzende System 'unterhält' sich mit dem Micro-Frontend in den meisten Fällen nur über die Properties des Custom Elements.
<!--stackedit_data:
eyJoaXN0b3J5IjpbLTE1NzM1NjMxMDYsOTcxNDY2NTcyLDE4Mj
k2Mzc1MTEsMTEyMTg2MjQxOSwzNzQ4NTE3NzAsLTYwNDQ3ODEw
Nyw0OTI5MzM3MzIsODMyNzM4MjI5LDIzMjczNDYyOSwtMjA5OD
UwMDYyMywxNDEzOTE3NTY0LDEzNzA0NzgzNTAsLTE3NTMwMDQ5
NzVdfQ==
-->