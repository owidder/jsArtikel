# Integration von zwei Micro-Frontends über Custom Elements am konkreten Beispiel
Im Folgenden wollen wir mit Code-Beispielen die Integration der Micro-Frontends von zwei Self-Contained-Systems über Custom Elements zeigen.
## Die integrierte Anwendung "Stockprice": Korrelation von Aktienkursen
Mit der aus den verschiedenen Micro-Frontends integrierten Anwendung "Stockprice" kann man sich Charts erzeugen lassen, die die Aktienkurse (Jahre 2014 bis 2018) von zwei Firmen als Scatterplot inklusive Korrelationskoeffizienten darstellen.  

<img src="https://cdn.jsdelivr.net/gh/owidder/jsArtikel@ow20190515-01/oliver/correlationApp.png"/>
Dazu kann man in den beiden Eingabefeldern (mit Autocomplete) am oberen Rand jeweils eine Firma (aus dem Dow Jones) eingeben. Darunter wird dann der Chart angezeigt. 
Live kann man die Anwendung hier sehen: http://bit.ly/stockprice-app

## Die Self-Contained-Systems "Company" und "History"
Die Anwendung "Stockprice" besteht aus 2 Self-Contained-Systems (SCS) "Company" und "History", deren Micro-Frontends auf einer Seite mit Hilfe von Custom Elements integriert werden:
1. SCS "Company": Stellt einen Service zur Verfügung, über den Namen und Abkürzungen aller Dow-Jones-Companies abgeholt werden können. Das Micro-Frontend ist eine Eingabefeld mit Autocompletion, das über ein Custom Element mir Namen `<select-company/>` eingebunden werden kann.
2. SCS "History": Stellt einen Service zur Verfügung, über den die historischen Aktienkurse in den Jahren 2014 bis 2018 abgefragt werden können. Das Micro-Frontend ist der Scatterplot-Chart und kann über ein Custom Element mit Namen `<company-correlation/>` eingebunden werden.

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
eyJoaXN0b3J5IjpbLTQ4ODcxNDkxNiwtMTA3NzY2NDI5MCw3Nj
M4MDg0MDksNDYwNTI4MjU4LDEwNzI5MzUzMiwxNDE4NTgwNDI2
LDE5MzQ0NTc4NTcsMjA1MDAzNjA2NCwtMTI4MzUzNzEwLC04OT
IyMTA5MV19
-->