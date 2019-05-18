# Integration von zwei Micro-Frontends über Custom Elements am konkreten Beispiel
Im Folgenden wollen wir zeigen, wie wir Custom Elements in einem großen Projekt in der Finanzindustrie mit über 40 Self-Contained-Systems eingesetzt haben. 
Dazu zeigen wir exemplarisch an einer kleinen Beispiel-Anwendung, die aus zwei Self-Contained-Systems besteht, die Integration der Micro-Frontends über Custom Elements.

## Die Beispiel-Anwendung "StockPrice": Korrelation von Aktienkursen
Mit der aus den Micro-Frontends integrierten Beispiel-Anwendung "StockPrice" kann man sich Charts erzeugen lassen, die die Aktienkurse (Jahre 2014 bis 2018) von zwei Firmen als Scatterplot inklusive Korrelationskoeffizienten darstellen.  

<img src="https://cdn.jsdelivr.net/gh/owidder/jsArtikel@ow20190515-01/oliver/correlationApp.png"/>

Dazu kann man in den beiden Automplete-Eingabefeldern am oberen Rand jeweils eine Firma (aus dem Dow Jones) eingeben. Hat man beide Firmen eingegeben, wird der Chart angezeigt. 
Live kann man die Anwendung hier sehen: [http://bit.ly/stockprice-app](http://bit.ly/stockprice-app)

## Die Self-Contained-Systems "Company" und "StockHistory"
Die Anwendung "StockPrice" besteht aus 2 Self-Contained-Systems (SCS) "Company" und "StockHistory", deren Micro-Frontends auf einer Seite mit Hilfe von Custom Elements integriert werden:
1. SCS "Company": Stellt einen Service zur Verfügung, über den Namen und Abkürzungen aller Dow-Jones-Companies abgeholt werden können. Das Micro-Frontend ist ein Eingabefeld mit Autocompletion, das über ein Custom Element mit Namen `<select-company/>` eingebunden werden kann.
2. SCS "StockHistory": Stellt einen Service zur Verfügung, über den die historischen Aktienkurse abgefragt werden können. Das Micro-Frontend ist der Scatterplot-Chart und kann über ein Custom Element mit Namen `<company-correlation/>` eingebunden werden.

Die Custom Elements werden von dem jeweiligen Self-Contained-System ausgeliefert. So hostet z.B. das System "Company" das JavaScript-File `selectComponentElement.js`, das den Code für das Custom Element `<select-company/>` enthält.
Jedes Custom Element greift wiederum nur auf Services des Self-Contained-Systems zu, von dem es ausgeliefert wurde.

<img src="https://cdn.jsdelivr.net/gh/owidder/jsArtikel@ow20190518-02/oliver/StockPrice.png"/>


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
* Ein Custom Element ruft nur Services von der Adresse auf, von der er ausgeliefert wurde. 

Mit diesen Prinzipien sieht die Implementierung des Custom Elements `<select-company/>` folgendermaßen aus (in TypeScript):
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
		        {this.onChangeCompany(company)}}/>,
	        this);  
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
* Gemäß dem Prinzip, dass alle Funktionalität in der Rect-Component liegt, findet auch der Aufruf des Service "companies" innerhalb der React-Component statt. Darum geben wir der React-Component über die Property `basedir` die Adresse mit, von der aus der Code des Custom Elements ausgeliefert wurde. Denn dort kann die React-Component auch den Service finden. Diese Adresse holen wir uns über: 
	```
	const scriptPath = document.currentScript.getAttribute("src")
	```
	und schnibbeln dann das letzte Pfad-Element (den Namen des JavaScript-Files) weg:
	```
	const parts = scriptPath.split("/");  
	const basedir = parts.slice(0, parts.length-1).join("/");
	```
* Wie oben beschrieben verwenden wir keinen Shadow-DOM, sondern rendern die DOM-Elemente des Custom Elements direkt in den den Main-DOM. Das aber sollte man nicht im Constructor des Custom Elements tun sondern in der `connectedCallback`-Lifecycle-Methode.


<!--stackedit_data:
eyJoaXN0b3J5IjpbMTA3MTU4NzA2NSwtMzc4NTM1NzYyLDE3MT
k0Mzg0MjUsMjEzMTMzNjU2Myw4Mjg3ODM3MTksMTA0OTY1MDA5
MiwtNTM4NDI1NzcyLDE4NzEyMTM0NTEsLTQwOTEyNjY5MSwtND
A5MTI2NjkxLDE3MjA3MjcxNjAsLTE5Mzk3MTMzODQsMTIwMTU1
MzA3OCw4MzA1NjQ0MzgsMTU3OTUxNjQzLC0xNjk0OTY0NTcsMT
I4OTE3MjY5LDg0ODc2MjY5NSwxMDM5ODM3NzU2LC0yNzMxNTgx
MTJdfQ==
-->