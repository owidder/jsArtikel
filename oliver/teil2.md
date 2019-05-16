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
Das SCS "Company" stellt den Service "companies" zur Verfügung. Er liefert Namen und Abkürzungen aller Firmen im Dow Jones inklusive Abkürzungen.
```
[
   {"short":"MMM","full":"3M Company"},
   {"short":"AOS","full":"A.O. Smith Corp"},
   ...
]
```

## Micro-Frontend von "Company"
Neben dem Service "companies" liefert das SCS "Company" auch ein Micro-Frontend aus. Dieses Micro-Frontend (ein JavaScript-File) enthält ein Custom Element mit Namen `<select-company/>`, das wiederum den Service "companies" aufruft. 

<img src="https://cdn.jsdelivr.net/gh/owidder/jsArtikel@ow20190516-01/oliver/company.png"/>

`<select-company/>` rendert sich als Eingabefeld mit Autocompletion-Funktionalität, über das eine Firma aus dem Dow Jones eingegeben werden kann.

<img src="https://cdn.jsdelivr.net/gh/owidder/jsArtikel@ow20190516-02/oliver/selectCompany.png"/>

Um die integrierende Anwendung (hier "Stockprice") zu informieren, welche
<!--stackedit_data:
eyJoaXN0b3J5IjpbLTE1NDk5NDM3OTYsLTI3MzE1ODExMiwtOT
g5NTg3NDM0LC0xMDc3NjY0MjkwLDc2MzgwODQwOSw0NjA1Mjgy
NTgsMTA3MjkzNTMyLDE0MTg1ODA0MjYsMTkzNDQ1Nzg1NywyMD
UwMDM2MDY0LC0xMjgzNTM3MTAsLTg5MjIxMDkxXX0=
-->