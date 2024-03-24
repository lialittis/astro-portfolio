---
layout:     post
title:      JAVA(M4 anommalies et exceptions 异常 )
subtitle:   ISAE-SUPAERO课程
date:       2019-09-29
author:     TC YU
header-img: assets/img/post-bg-hacker.jpg
catalog: true
tags:
    - JAVA
    - Information
---


# Informatique(JAVA)

## M4 anommalies et exceptions（异常）  
Cette séance sera consacrée à l'exploitation des **exceptions** Java. En Java, les anomalies peuvent être signalées par des exceptions qui interrompent le cours du programme. Par défaut, elles montrent **la pile d'appels** de méthodes au moment de l'arrêt du programme. Cette information est précieuse pour analyser et corriger le code. Certaines exceptions, dites **exceptions sous contrôle** doivent obligatoirement être traitées dans votre code. Elles sont soumises à la règle **Catch or Specify** qui se traduit par l'obligation d'intégrer des blocs **try {...} catch(...) {...}** ou des **clauses throws** dans votre code. Vous pouvez vous-même signaler des anomalies d'utilisation de votre code en levant vos propres exceptions avec l'instruction throw, et utiliser les exceptions pour faire de la programmation par contrats.

*法语：interrompre 中断、使停止；par défaut 默认情况下；clause 条款；*

### Déboguer un arrêt sur exception
<font size = 4> **Objectifs de l'activité:**</font> Diagnostiquer un bug à l'aide d'une exception.

1. Retrouvez chacune de ces activités et relisez-les.
2. Au-besoin, refaites quelques-uns des exercices proposés.

3. Quel est le lien entre la pile d'appel et l'arrêt sur exception constaté dans la console d'Eclipse ?

4. Après avoir exécuté un programme, la console Eclipse affiche la trace suivante. Dessinez l'état de la pile d'appel au moment de l'arrêt du programme suivant en respectant la convention graphique utilisée lors de l'activité sur le passage de paramètres.
```java
java.lang.IndexOutOfBoundsException: Index: 3, Size: 3
at java.util.ArrayList.rangeCheck(ArrayList.java:653)
at java.util.ArrayList.get(ArrayList.java:429)
at m4.DisplayPositionsMain.main(DisplayPositionsMain.java:13)
```
5. Faites valider votre pile d'appel par votre intervenant.

<font size = 4> **Exercises:**</font> Diagnostiquer des arrêt sur exception

```java

```

### Propager les anomalies signalées par des exceptions

<font size = 4> **Objectifs:**</font>
* Indentifier les méthodes soulmises à la règle **"Catch or Specify"**
* Différencier **exceptions sous contrôle** et **exceptions hors de contrôle**
* Propager les exceptions sous contrôle avec une clause `throw`(Specify)

> Il existe deux grandes familles d'exceptions : **les exceptions sous contrôle (checked exception)** et **les exceptions hors de contrôle (unchecked exception)**.
> Ce qui différencie ces exceptions, c'est **la règle Catch or Specify** qui vous a été présentée dans les planches de cours :
> - Seules les exceptions sous contrôle sont soumises à cette règle. Pour les traiter, il faut obligatoirement soit les récupérer (Catch), soit spécifier qu'elles se propagent (Specify).
> - Les exceptions hors de contrôle ne sont pas soumises à cette règle. Vous pouvez cependant les récupérer ou spécifier leur propagation, mais ce n'est pas obligatoire.

也就是说，对于可控异常和不可控异常的区分的引起原因是不同的。可控异常是合理存在的，不是由于逻辑问题引起的，因此一定需要通过避免异常或者声明异常的方式使程序正常运行；而对于不可控异常，我们往往也可以进行声明或者避免的方式使程序正常运行，但是实际上这里的错误是由语法逻辑引起的，如果每次都需要使用声明的方式，会大大增加程序的繁琐程度，最好的方式是需要通过修改程序逻辑来解决。

<font size = 4> **Comment reconnaître une exception sous contrôle?**</font>
Quand vous connaissez la classe de l'exception, vous pouvez déterminer si elle est hors de contrôle ou si elle est sous contrôle en consultant la documentatioin de l'exception dans ***l'API Java 8***. Cette documentation complète débute par une liste de classes `java.lang.Object`, `java.lang.Throwable`, `java.lang.Exception`, etc. : ce sont les classes héritées par l'exception. Sans rentrer dans l'explication de l'héritage, si la liste d'héritage contient la classe `java.lang.RuntimeException`, alors l'exception est hors de contrôle, sinon l'exception est sous contrôle.
我们可以通过异常类继承的父类的类型来判断可控与不可控。

À l'origine d'une exception, il y a toujours une méthode qui lève cette exception explicitement avec l'instruction `throw` . Si l'exception est sous contrôle, alors la méthode qui la lève doit déclarer une clause throws en fin de signature :

```java
public void foo() throws SomeCheckedException { // notice the throws clause
  // code fragment that throws SomeCheckedException when it detects some anomaly
}
```

Vous avez deux moyens de reconnaître une méthode qui lève une exception sous contrôle :

* En consultant la documentation détaillée de la méthode dans **l'API Java 8 **: vous verrez alors qu'elle comporte une clause `throws` indiquant l'exception levée. Si vous cliquez sur cette exception, vous aurez accès à sa documentation complète et vous pourrez déterminer si elle est sous contrôle ou hors de contrôle comme dans l'exercice précédent.
* En codant, quand le compilateur signale une erreur "Unhandled exception type XxxException" dans un appel du type `ref.foo()` : consultez alors la documentation de la méthode `foo()` de la classe de `ref`.

<font size = 4> **Propager une exception sous contrôle**</font>
Dans le cas des exceptions sous contrôle, il est plus simple de spécifier qu'elles se propagent que de les récupérer. La suite de cette activité se focalise sur la spécification de propagation d'exceptions sous contrôle avec une clause `throws`. Une autre activité sera consacrée à la récupération des exceptions à l'aide de blocs `try {...} catch {...}`.

Quand une méthode contient un fragment de code qui peut lever **une exception sous contrôle** et ne récupère pas cette exception dans un bloc `try {...} catch {...}`, la méthode doit spécifier qu'elle laisse l'exception se propager. La spécification consiste en une clause throws en fin de signature :

```java
public void foo() throws SomeCheckedException { // specify that foo() may propagate SomeCheckedException
  // code fragment that may throw or propagate SomeCheckedException
}
```
Si une méthode contient un fragment de code qui peut lever **une exception hors de contrôle**, comme `NullPointerException` ou `ArithmeticException`, elle ne nécessite pas de clause throws.

```java
public void bar() { // no throws clause needed here
  // code fragment that may throw unchecked exceptions
}
```
**Les exceptions hors de contrôle correspondent le plus souvent à des erreurs de programmation courantes qu'il faut corriger en analysant la trace d'exception. Elles sont propagées implicitement.**


*法语：propager 传播；fragment 碎片；implicitement 隐式；*

<font size = 4> **Exercises:**</font> ：

```java

```


<font size = 4>**Application :**</font> lire dans un fichier texte

1. Téléchargez la classe PersonReader et la classe Person et ajoutez-les au dossier src du projet M4 (n'oubliez pas de rafraichir le projet).
2. Lisez attentivement le code de PersonReader. Quelle exception la méthode read() lève-t-elle ? Est-elle sous contrôle ?
3. Créez une nouvelle classe exécutable PersonReaderMain. Dans la méthode main(), utilisez PersonReader pour extraire les personnes d'un fichier texte. Attention, l'accès à ce fichier depuis le programme Java est difficile à paramétrer quand on exécute le programme dans Eclipse. Rangez ce fichier à un endroit approprié de votre projet Eclipse (par exemple un répertoire M4/data/), sachant qu'Eclipse fait démarrer vos programmes dans le répertoire M4/.
4. Exécutez PersonReaderMain dans un cas où l'exception sera levée et propagée, puis dans un cas où tout se passe bien.

<font size = 4>**Bibliographie éclair**</font>
* The Java™ Tutorials > Essential Java Classes > Exceptions
	* jusqu'à "Specifying the Exceptions Thrown by a Method"
	* vous pouvez sauter "The try-with-resources Statement"

### Récupérer simplement les anomalies signalées par des exceptions  

<font size = 4> **Objectifs de l'activité:**</font> Récupérer les exceptions avec une forme simple de `try/catch`(Catch)  

Rappel : une **exception sous contrôle (checked exception)** est une exception soumise à la règle **Catch or Specify**. Pour traiter ce type d'exception, il faut soit la récupérer (Catch), soit spécifier qu'elle se propage (Specify). Les exceptions sous contrôle sont identifiables dans l'==API Java 8== ou lors de la programmation sous Eclipse grâce à l'indication "Unhandled exception type XxxException". Cette activité se focalise sur la récupération d'exception (Catch).

```java
public void foo() { 
  try {
    // code fragment that may throw any type of checked exception
    // for instance, the fragment may throw both XxxException and YyyException
  } catch(Exception ex) {
    // do something _useful_ here
    // if you just want to print some message, do not catch, just specify
  }
}

```

**Remarques importantes :**
Dans un bloc catch, récupérer une exception consiste à remettre l'application dans un état correct (en corrigeant la cause de l'exception) ou dégradé (en compensant l'erreur). En effet, l'exécution normale reprend après le catch et doit reprendre dans un état acceptable. Un simple System.out.println(...) ne suffira pas.
On peut utiliser un `try/catch` en cas d'exception hors de contrôle (unchecked exception) comme IllegalArgumentException ou NumberFormatException.++ Il faut le faire avec parcimonie, pour ne pas alourdir le code.++ 
La construction `try/catch` est plus complexe que ce qui est présenté ici ; il est notamment possible d'avoir **plusieurs blocs catch** pour récupérer différents types d'exception, et d'avoir un bloc `finally`.
==L'encapsulation du code à exécuter dans un bloc `try` pénalise la performance de l'application (temps d'exécution plus long). Il faut donc limiter l'usage du `try/catch` aux cas où la récupération dans le bloc catch est utile. Dans les autres cas, il faudra propager l'exception.==

在遇到Exceptions后，我们需要考虑的是异常的类型，以及需要采取的方式。Exception 这种异常分两大类运行时异常和非运行时异常(编译异常)。程序中应当尽可能去处理这些异常。
**运行时异常**：都是RuntimeException类及其子类异常，如NullPointerException(空指针异常)、IndexOutOfBoundsException(下标越界异常)等，这些异常是不检查异常，程序中可以选择捕获处理，也可以不处理。这些异常一般是由程序逻辑错误引起的，程序应该从逻辑角度尽可能避免这类异常的发生。
++运行时异常的特点是Java编译器不会检查它，也就是说，当程序中可能出现这类异常，即使没有用try-catch语句捕获它，也没有用throws子句声明抛出它，也会编译通过。++
**非运行时异常 （编译异常）**：是RuntimeException以外的异常，类型上都属于Exception类及其子类。从程序语法角度讲是必须进行处理的异常，如果不处理，程序就不能编译通过。如IOException、SQLException等以及用户自定义的Exception异常，一般情况下不自定义检查异常。
（https://blog.csdn.net/hguisu/article/details/6155636）
处理异常的机制：抛出异常或者捕获异常。

*法语：réqupérer 回收，补偿；parcimonie n.f.十分节省，精打细算；encapsulation 封装；*
























