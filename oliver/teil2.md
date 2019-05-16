# Integration von zwei Micro-Frontends über Custom Elements am konkreten Beispiel
Im Folgenden wollen wir mit Code-Beispielen die Integration der Micro-Frontends von zwei Self-Contained-Systems über Custom Elements zeigen.
## Die integrierte Anwendung "Stockprice": Korrelation von Aktienkursen
Mit der aus den verschiedenen Micro-Frontends integrierten Anwendung kann man sich Charts erzeugen lassen, die die Aktienkurse von zwei Firmen in den Jahren 2014 - 2018 als Scatterplot inklusive Korrelationskoeffizienten darstellen.  

<img src="https://cdn.jsdelivr.net/gh/owidder/jsArtikel@ow20190515-01/oliver/correlationApp.png"/>
Dazu kann man in den beiden Eingabefeldern (mit Autocomplete) am oberen Rand jeweils eine Firma (aus dem Dow Jones) eingeben. Darunter wird dann der Chart angezeigt. 
Live kann man die Anwendung hier sehen: http://bit.ly/stockprice-app
## Die Self-Contained-Systems
Die Anwendung "Stockprice" besteht aus 2 Self-Contained-Systems (SCS), deren Micro-Frontends auf einer Seite mit Hilfe von Custom Elements integriert werden:
1. SCS "Company": Stellt einen Service zur Verfügung, über den Namen und Abkürzungen aller Dow-Jones-Companies


Über die beiden Eingabefelder am oberen Rand kann man jeweils eine Firma eingeben (aus dem Dow Jones). Im Graph darunter werden dann die Börsenkurse beider Firmen der Jahre 2014 - 2018 als Scatter-Plot angezeigt. 
* Element `<select-company></select-company>`: 
## Die Self-Contained-Systems

<!--stackedit_data:
eyJoaXN0b3J5IjpbNzU5MDgxMTI1LDEwNzI5MzUzMiwxNDE4NT
gwNDI2LDE5MzQ0NTc4NTcsMjA1MDAzNjA2NCwtMTI4MzUzNzEw
LC04OTIyMTA5MV19
-->