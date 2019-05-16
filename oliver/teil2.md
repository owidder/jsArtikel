# Integration von zwei Micro-Frontends über Custom Elements am konkreten Beispiel
Im Folgenden wollen wir mit Code-Beispielen die Integration der Micro-Frontends von zwei Self-Contained-Systems über Custom Elements zeigen.
## Die integrierte Anwendung "Stockprice": Korrelation von Aktienkursen
Mit der aus den verschiedenen Micro-Frontends integrierten Anwendung kann man sich Charts erzeugen lassen, die die Aktienkurse von zwei Firmen in den Jahren 2014 - 2018 als Scatterplot inklusive Korrelationskoeffizienten darstellen.  

<img src="https://cdn.jsdelivr.net/gh/owidder/jsArtikel@ow20190515-01/oliver/correlationApp.png"/>
Dazu kann man in den beiden Eingabefeldern (mit Autocomplete) am oberen Rand jeweils eine Firma (aus dem Dow Jones) eingeben. Darunter wird dann der Chart angezeigt. 
Live kann man die Anwendung hier sehen: http://bit.ly/stockprice-app

## Die Self-Contained-Systems "Company" und "History"
Die Anwendung "Stockprice" besteht aus 2 Self-Contained-Systems (SCS) "Company" und "History", deren Micro-Frontends auf einer Seite mit Hilfe von Custom Elements integriert werden:
1. SCS "Company": Stellt einen Service zur Verfügung, über den Namen und Abkürzungen aller Dow-Jones-Companies abgeholt werden können. Das Micro-Frontend ist eine Eingabefeld mit Autocompletion, das über das Custom Element `<select-company/>` eingebunden werden kann.
2. SCS "History": Stellt einen Service zur Verfügung, über den die historischen Aktienkurse in den Jahren 2014 bis 2018 abgefragt werden können. Das Micro-Frontend ist der Scatterplot-Chart. Er kann über das Custom Element 

## "Company"



## Die Self-Contained-Systems

<!--stackedit_data:
eyJoaXN0b3J5IjpbMjAzMTgyOTQ1MCw0NjA1MjgyNTgsMTA3Mj
kzNTMyLDE0MTg1ODA0MjYsMTkzNDQ1Nzg1NywyMDUwMDM2MDY0
LC0xMjgzNTM3MTAsLTg5MjIxMDkxXX0=
-->