---
layout:     post
title:      Java网络编程：TCP的socket编程2
subtitle:   ISAE-SUPAERO课程
date:       2019-10-29
author:     TC YU
header-img: assets/img/CPOOR——JAVA.png
catalog: true
tags:
    - Java
    - 计算机网络
---

# Java网络编程

## Enchanges de messages élémentaires avec TCP

Quand deux applications Java sont connectées avec TCP, chacune d'elle contient une instance de la classe java.net.Socket initialisée pour communiquer avec l'autre application.

L'envoi et la réception de messages se font à travers deux attributs de cette socket :

l'attribut privé outputStream de type java.io.OutputStream permet d'envoyer des octets (flot de sortie : les données sortent du programme par la socket)
l'attribut privé inputStream de type java.io.InputStream permet de recevoir des octets (flot d'entrée : les données entrent dans le programme par la socket)

[picure:java_output_input]




### Réalisation d'un premier protocole



## Echanges de messages texte avec TCP

### Envoi et réception de chaines de caractères avec TCP

Les flots d'entrée et de sortie d'une socket TCP permettent de recevoir et d'envoyer des octets vers une autre application Java. Pour envoyer et recevoir des chaines de caractères, il faut introduire trois classes supplémentaires :

la classe java.io.PrintWriter pour envoyer des chaines de caractères via le flot de sortie d'une socket
la classe java.io.BufferedReader pour recevoir des chaines de caractères via le flot d'entrée d'une socket, par l'intermédiaire d'une instance de java.io.InputStreamReader.


### Réception de chaines de caractères avec TCP




### communication client-serveur

Objectifs de l'activité
Savoir expliquer avec ses propres mots les notions de client, serveur, requête, réponse, boucle de service.
Relier ces notions à la programmation d'applications Java connectées par TCP

### Principe général

Une application client-serveur est une application répartie entre plusieurs processus communicants : un processus serveur et un ou plusieurs processus clients. Le processus serveur offre une boucle de service, où l'interaction suivante est répétée :

un client envoie un message de requête au serveur et se bloque en attente de réponse,
le serveur traite la requête,
le serveur envoie un message de réponse au client d'origine,
le client est débloqué et traite la réponse.

[picture:java_client_server.jpg]


### Protocole de communication client-serveur
La communication client-serveur doit respecter un protocole bien défini :

Le serveur doit être lancé avant les clients.
À chaque requête, le serveur doit envoyer une réponse.
Les messages de requête doivent avoir un format clairement défini. Il peut y avoir plusieurs types de requêtes, avec pour chaque type de requête des paramètres différents (nombre, types et valeurs de paramètres).
Les messages de réponse doivent avoir une format clairement défini. Il peut y avoir plusieurs types de réponses, avec pour chaque type de réponse des valeurs différentes.
Les messages de réponse doivent couvrir les cas d'erreur : format de requête invalide, ou erreur interne du serveur. Comme dans le cas des exceptions Java, ces messages d'erreur doivent être informatifs.


### Programmer un protocole de communication client-serveur en Java



### Boucle de service TCP mono-client

**Un seul type de requête en mode texte**
Dans un premier temps, on considère un serveur qui reçoit un seul type de requête, en mode texte.

Le protocole(Serveur Echo pour un client unique) est très simple :  
* la requête est constituée d'une chaine de caractères, vide ou non
* la réponse est constituée de la chaine reçue dans la requête
* la boucle de service s'arrête quand le client se déconnecte, ce qui provoque un retour de null dans le readLine() qui attend une requête du client

[picture:java_boucle_mini.jpg]


**Plusieurs types de requêtes en mode texte**

Un serveur peut recevoir plusieurs types de requêtes, dans un ordre inconnu à l'avance. Il faut alors écrire une boucle de service où chaque requête est analysée puis traitée avec une méthode spécifique.

On considère un serveur qui reçoit plusieurs types de requête. Il faut alors :

Différencier les requêtes
Détecter les requêtes invalides
Traiter chaque cas avant de renvoyer un message de réponse au client.

对于不同的客户请求进行不同的处理，在这里我采用的方式是在server的方法中采用了`switch(){case}`的方法。



**Extraire des types primitifs d'une requête texte**

在本示例中，需要学会使用Integer和Double两个类中的几个方法，例如parseInt(String,int)和parseDouble(String,int)，同时对repeat的请求在服务器中提供for循环语句。
另外，由于parseInt和parseDouble的使用条件比较严格，可能会throw出异常，因此无法直接赋值，需要用到`try{}catch(Exception e){}`的方法进行弥补。

*********
***小知识点：***
&和&&在java中的不同————都是与操作，但是无论什么情况，&操作中，前后两个语句都会被执行，但是&&操作要求，只有在前一个语句是true的情况下，才会执行后一个语句，因此可以认为&&提高了代码的执行效率。
*********

### Boucle de service TCP pour clients sérialisés

本练习在于建立多个clients与服务器进行沟通。首先需要做到的一件事情是，保证服务器持续接受请求，只能手动切断；其次，为了保证可以分段接收不同客户的请求，需要在原本单一请求外建立更大的循环用于更新用户，而原本内部循环用于处理单一用户的多个信息和断连。为了实现这个目的，我们加入了一个新的类————Service————用于在server服务器类中调用的可以用之来建立实例处理单一用户的请求的类，这样简化了服务器类的代码量，同时方便处理不同用户的请求。

进一步考虑用户请求，除了全部处理完成外，如果用户提出某一特殊请求，其功能是提前结束服务器对其的连接和请求处理，即意味着服务器拒绝此后的所有用户请求，并且关闭自身的循环（停止悬挂）。对于这样的功能，我的方法是在service单循环中提供新的终止连接条件并建立返回值，通过返回值判断处理用户请求的情况的正常与否（特殊请求为不正常情况，而其他请求或者完成处理都为正常情况），并进一步指导server服务器类的停止悬挂或者正常循环。

*********
***小知识点：***
比较两String的值，需要用.equals()函数，而不是 == 。
*********




