# Integration von zwei Micro-Frontends über Custom Elements am konkreten Beispiel
Im Folgenden wollen wir mit Code-Beispielen die Integration der Micro-Frontends von zwei Self-Contained-Systems über Custom Elements zeigen.
## Die integrierte Anwendung "Stockprice": Korrelation von Aktienkursen
Mit der aus den verschiedenen Micro-Frontends integrierten Anwendung "Stockprice" kann man sich Charts erzeugen lassen, die die Aktienkurse (Jahre 2014 bis 2018) von zwei Firmen als Scatterplot inklusive Korrelationskoeffizienten darstellen.  

<img src="https://cdn.jsdelivr.net/gh/owidder/jsArtikel@ow20190515-01/oliver/correlationApp.png"/>
Dazu kann man in den beiden Eingabefeldern (mit Autocomplete) am oberen Rand jeweils eine Firma (aus dem Dow Jones) eingeben. Darunter wird dann der Chart angezeigt. 
Live kann man die Anwendung hier sehen: http://bit.ly/stockprice-app

## Die Self-Contained-Systems "Company" und "History"
Die Anwendung "Stockprice" besteht aus 2 Self-Contained-Systems (SCS) "Company" und "History", deren Micro-Frontends auf einer Seite mit Hilfe von Custom Elements integriert werden:
1. SCS "Company": Stellt einen Service zur Verfügung, über den Namen und Abkürzungen aller Dow-Jones-Companies abgeholt werden können. Das Micro-Frontend ist eine Eingabefeld mit Autocompletion, das über ein Custom Element `<select-company/>` eingebunden werden kann.
2. SCS "History": Stellt einen Service zur Verfügung, über den die historischen Aktienkurse in den Jahren 2014 bis 2018 abgefragt werden können. Das Micro-Frontend ist der Scatterplot-Chart. Er kann über das Custom Element 

## Das SCS "Company"
Das SCS "Company" stellt den Service "companies" zur Verfügung. Er liefert Namen und Abkürzungen aller Firmen im Dow Jones.
```
[
   {"short":"MMM","full":"3M Company"},
   {"short":"AOS","full":"A.O. Smith Corp"},
   ...
]
```

## Micro-Frontend von "Company"

## Die Self-Contained-Systems

<!--stackedit_data:
eyJoaXN0b3J5IjpbNjMyMTY0MDg0LC0xMDc3NjY0MjkwLDc2Mz
gwODQwOSw0NjA1MjgyNTgsMTA3MjkzNTMyLDE0MTg1ODA0MjYs
MTkzNDQ1Nzg1NywyMDUwMDM2MDY0LC0xMjgzNTM3MTAsLTg5Mj
IxMDkxXX0=
-->