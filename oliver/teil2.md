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
* Gemäß dem Prinzip, dass alle Funktionalität in der Rect-Component liegt, findet auch der Aufruf des Service "companies" innerhalb der React-Component statt. Darum geben wir der React-Component über die Property `basedir` die Adresse mit, von der aus der Code des Custom Elements ausgeliefert wurde. Denn dort kann die React-Component auch den Service finden. Diese Adresse holen wir uns über: 
	```
	const scriptPath = document.currentScript.getAttribute("src")
	```
	und schnibbeln dann das letzte Pfad-Element (den Namen des JavaScript-Files) weg:
	```
	const parts = scriptPath.split("/");  
	const basedir = parts.slice(0, parts.length-1).join("/");
	```
* Wie oben beschrieben verwenden wir keinen Shadow-DOM, sondern rendern die DOM-Elemente des Custom Elements direkt in den den Main-DOM. Das sollte man aber nicht im Constructor des Custom Elements tun sondern in der `connectedCallback`-Lifecycle-Methode. 
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
  
interface SelectCompanyProps {  
    initialShort?: string;  
    onChange: (company: Company)  => void;  
    basedir: string;  
}  
  
interface SelectCompanyState {  
    companies: Company[];  
    data: string[];  
    value?: string;  
}  
  
export class SelectCompany extends React.Component<SelectCompanyProps, SelectCompanyState> {  
  
    readonly state: SelectCompanyState = {data: [], companies: []};  
  
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
* Der Aufruf des Service "companies" findet in der React-Lifecycle-Methode `componentDidMount()` statt. `componentDidMount()` wird nach dem ersten Rendern (Methode `render()`) der Component aufgerufen, wenn sich erzeugten DOM-Elemente im DOM-Tree befinden. Nachdem der Service "companies" ein Array mit Namen und Abkürzungen geliefert hat, werden sie in den State der React-Component gelegt.
	Dies führt zu einem erneuten Rendern der Component.
* In `handleSearch()` werden aus den vom Service geladenen Company-Namen, diejenigen gefiltert, die dem eingegebene Teilstring entsprechen, so dass `AutoComplete` eine Vorschlagsliste anzeigen kann.
* `handleSelect()` wird aufgerufen,
<!--stackedit_data:
eyJoaXN0b3J5IjpbNDcwMTk5NTc2LDEyNDU2NTAyNjAsLTE0Nj
k2MzMxMDcsLTE2ODU2MjU2OTksLTEyMzI5NzY3NjcsMTQwNTQ0
Mzc4MCwzNzc3MTIyMjQsLTYzNzYyNjc5NiwtMTY5OTQ2NjgzNy
wxMjY1OTM0NTQ5LDE5OTczNTc5OTcsMTA3MTU4NzA2NSwtMzc4
NTM1NzYyLDE3MTk0Mzg0MjUsMjEzMTMzNjU2Myw4Mjg3ODM3MT
ksMTA0OTY1MDA5MiwtNTM4NDI1NzcyLDE4NzEyMTM0NTEsLTQw
OTEyNjY5MV19
-->