# Integration von zwei Micro-Frontends über Custom Elements am konkreten Beispiel
Im Folgenden wollen wir zeigen, wie wir Custom Elements in einem großen Projekt in der Finanzindustrie mit über 40 Self-Contained-Systems eingesetzt haben. 
Dazu zeigen wir exemplarisch an einer kleinen Beispiel-Anwendung, die aus zwei Self-Contained-Systems besteht, die Integration der Micro-Frontends über Custom Elements.

## Die Beispiel-Anwendung "Stockprice": Korrelation von Aktienkursen
Mit der aus den Micro-Frontends integrierten Beispiel-Anwendung "Stockprice" kann man sich Charts erzeugen lassen, die die Aktienkurse (Jahre 2014 bis 2018) von zwei Firmen als Scatterplot inklusive Korrelationskoeffizienten darstellen.  

<img src="https://cdn.jsdelivr.net/gh/owidder/jsArtikel@ow20190515-01/oliver/correlationApp.png"/>

Dazu kann man in den beiden Automplete-Eingabefeldern am oberen Rand jeweils eine Firma (aus dem Dow Jones) eingeben. Hat man beide Firmen eingegeben, wird der Chart angezeigt. 
Live kann man die Anwendung hier sehen: [http://bit.ly/stockprice-app](http://bit.ly/stockprice-app)

## Die Self-Contained-Systems "Company" und "StockHistory"
Die Anwendung "Stockprice" besteht aus 2 Self-Contained-Systems (SCS) "Company" und "StockHistory", deren Micro-Frontends auf einer Seite mit Hilfe von Custom Elements integriert werden:
1. SCS "Company": Stellt einen Service zur Verfügung, über den Namen und Abkürzungen aller Dow-Jones-Companies abgeholt werden können. Das Micro-Frontend ist ein Eingabefeld mit Autocompletion, das über ein Custom Element mit Namen `<select-company/>` eingebunden werden kann.
2. SCS "StockHistory": Stellt einen Service zur Verfügung, über den die historischen Aktienkurse abgefragt werden können. Das Micro-Frontend ist der Scatterplot-Chart und kann über ein Custom Element mit Namen `<company-correlation/>` eingebunden werden.

## Das Micro-Frontend von "Company"
Das SCS "Company" stellt den Service "companies" zur Verfügung. Er liefert Namen und Abkürzungen aller Firmen aus dem Dow Jones:
```
[
   {"short":"MMM","full":"3M Company"},
   {"short":"AOS","full":"A.O. Smith Corp"},
   ...
]
```

Neben dem Service "companies" liefert das SCS "Company" auch ein Micro-Frontend aus. Dieses Micro-Frontend (ein JavaScript-File) enthält ein Custom Element mit Namen `<select-company/>`, das wiederum den Service "companies" aufruft. 

<img src="https://cdn.jsdelivr.net/gh/owidder/jsArtikel@ow20190516-01/oliver/company.png"/>

`<select-company/>` rendert sich als Eingabefeld mit Autocompletion-Funktionalität, über das eine Firma aus dem Dow Jones eingegeben werden kann.

<img src="https://cdn.jsdelivr.net/gh/owidder/jsArtikel@ow20190516-02/oliver/selectCompany.png"/>

Verwenden kann man das Element z.B. so:
```
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
Dem Custom Element `<select-company/>` kann als Property `onChangeCompany` eine Callback-Function übergeben werden. Diese wird nach der Eingabe durch den Anwender mit dem entsprechenden Company-Object (z.B.: `{short: "AAPL", full: "Apple Inc."}`) aufgerufen.

Live kann man sich das Element hier ansehen: [http://bit.ly/stockprice-company](http://bit.ly/stockprice-company)

## Das Custom Element "select-company"
Bei der Implementierung der Custom Elements haben wir die folgenden Prinzipien umgesetzt:
* Kein Shadow-DOM: Wir haben bewusst auf den Shadow-DOM verzichtet. Dies hatte zwei Gründe:
	* Man darf der integrierten Anwendung nicht ansehen, dass sie aus vielen Micro-Frontends zusammengesetzt ist. Dies erfordert, dass für alle Custom Elements die selben CSS-Regeln gelten. Darum haben wir die kapselnde Eigenschaft des Shadow-DOM nicht benötigt.
	* Unverträglich des von uns eingesetzten UI-Frameworks *React* mit dem Shadow-DOM: Der Einsatz von React-Componenten innerhalb des Shadow-DOM führte zu Problemen bei der Event-Verarbeitung (siehe [http://bit.ly/react-shadow-dom](http://bit.ly/react-shadow-dom)).
* Custom Elements sind nur schmale Wrapper: Die gesamte client-seitige Funktionalität eines Micro-Frontends befindet sich innerhalb einer React-Component (mit Unter-Compenents). Ein Custom Elements ist immer nur ein schmaler Wrapper um diese React-Component. Dieses Prinzip hat es uns erlaubt, die Funktionalität der React-Component auch noch an anderen Stellen zu verwenden.
* TypeScript: Custom Elements und React-Components sind in TypeScript implementiert.

Mit diesen Prinzipien sieht die Implementierung des Custom Elements `<select-company/>` folgendermaßen aus:
```
import * as React from "react";  
import * as ReactDOM from "react-dom";  
  
import {SelectCompany, Company} from "./SelectCompany";  
  
const scriptPath = document.currentScript.getAttribute("src");  
  
class SelectCompanyElement extends HTMLElement {  
  
    public onChangeCompany: (Company) => void;    
    readonly basedir: string;  
  
    constructor() {  
        super();  
        const parts = scriptPath.split("/");  
        this.basedir = parts.slice(0, parts.length-1).join("/");  
    }  
  
    drawReactComponent() {  
        ReactDOM.render(<SelectCompany basedir={this.basedir} 
	        onChange={(company) => {this.onChangeCompany(company)}}/>,
	        this);  
    }  
  
    connectedCallback() {  
        this.drawReactComponent();  
    }  
  
    attributeChangedCallback(name: string, oldValue: string, newValue: string) {  
        if(newValue && oldValue != newValue) {  
            this.drawReactComponent();  
        }  
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
* Gemäß dem Prinzip, dass alle Funktionalität in der Rect-Component liegt, findet auch der Service-Aufruf innerhalb der React-Component statt. Dafür muss diese allerdings wissen, wo sie diesen Service findet. 
<!--stackedit_data:
eyJoaXN0b3J5IjpbMTIwMTU1MzA3OCw4MzA1NjQ0MzgsMTU3OT
UxNjQzLC0xNjk0OTY0NTcsMTI4OTE3MjY5LDg0ODc2MjY5NSwx
MDM5ODM3NzU2LC0yNzMxNTgxMTIsLTk4OTU4NzQzNCwtMTA3Nz
Y2NDI5MCw3NjM4MDg0MDksNDYwNTI4MjU4LDEwNzI5MzUzMiwx
NDE4NTgwNDI2LDE5MzQ0NTc4NTcsMjA1MDAzNjA2NCwtMTI4Mz
UzNzEwLC04OTIyMTA5MV19
-->